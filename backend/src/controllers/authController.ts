import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { User } from '../models';
import { sequelize } from '../config/database';
import { sendPasswordRecoveryEmail } from '../services/mailService';

const loginSchema = z.object({
  credencial_acceso: z.string().min(3),
  password: z.string().min(4)
});

export const login = async (req: Request, res: Response) => {
  try {
    const parseResult = loginSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        message: 'Credenciales inválidas o incompletas',
        errors: parseResult.error.errors
      });
      return;
    }

    const { credencial_acceso, password } = parseResult.data;
    const cleanCredencial = credencial_acceso.trim().toLowerCase();

    // Búsqueda flexible insensible a mayúsculas
    let user = await User.findOne({
      where: sequelize.where(
        sequelize.fn('LOWER', sequelize.col('credencial_acceso')),
        cleanCredencial
      )
    });

    // Si el usuario escribió sólo "tecnico", "admin" o "soporte", probar con @gpon.com
    if (!user && !cleanCredencial.includes('@')) {
      user = await User.findOne({
        where: sequelize.where(
          sequelize.fn('LOWER', sequelize.col('credencial_acceso')),
          `${cleanCredencial}@gpon.com`
        )
      });
    }

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Usuario o contraseña incorrectos'
      });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      res.status(401).json({
        success: false,
        message: 'Usuario o contraseña incorrectos'
      });
      return;
    }

    const secret = process.env.JWT_SECRET || 'super_secret_gpon_telecom_jwt_key_2026_fttx';
    const payload = {
      id_usuario: user.id_usuario,
      credencial_acceso: user.credencial_acceso,
      rol: user.rol,
      nombre_completo: user.nombre_completo
    };

    const token = jwt.sign(payload, secret, {
      expiresIn: '7d'
    });

    res.json({
      success: true,
      message: 'Inicio de sesión exitoso',
      data: {
        token,
        usuario: {
          id_usuario: user.id_usuario,
          nombre_completo: user.nombre_completo,
          credencial_acceso: user.credencial_acceso,
          rol: user.rol
        }
      }
    });
  } catch (error: any) {
    console.error('Error detallado en login:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error interno del servidor en autenticación'
    });
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'No autenticado' });
      return;
    }

    const user = await User.findByPk(req.user.id_usuario, {
      attributes: ['id_usuario', 'nombre_completo', 'credencial_acceso', 'rol', 'createdAt']
    });

    if (!user) {
      res.status(404).json({ success: false, message: 'Usuario no encontrado' });
      return;
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const listUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.findAll({
      attributes: ['id_usuario', 'nombre_completo', 'credencial_acceso', 'rol', 'createdAt']
    });

    res.json({
      success: true,
      data: users
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateProfileSchema = z.object({
  nombre_completo: z.string().min(3).max(150).optional(),
  password: z.string().min(4).optional()
});

export const updateProfile = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'No autenticado' });
      return;
    }

    const parseResult = updateProfileSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        message: 'Datos de actualización inválidos',
        errors: parseResult.error.errors
      });
      return;
    }

    const user = await User.findByPk(req.user.id_usuario);
    if (!user) {
      res.status(404).json({ success: false, message: 'Usuario no encontrado' });
      return;
    }

    const { nombre_completo, password } = parseResult.data;
    if (nombre_completo) {
      user.nombre_completo = nombre_completo;
    }
    if (password) {
      user.password_hash = await bcrypt.hash(password, 10);
    }

    await user.save();

    res.json({
      success: true,
      message: 'Perfil de usuario actualizado con éxito',
      data: {
        id_usuario: user.id_usuario,
        nombre_completo: user.nombre_completo,
        credencial_acceso: user.credencial_acceso,
        rol: user.rol
      }
    });
  } catch (error: any) {
    console.error('Error actualizando perfil:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const createUserSchema = z.object({
  nombre_completo: z.string().min(3, 'El nombre debe tener al menos 3 caracteres').max(150),
  credencial_acceso: z.string().min(3, 'La credencial debe tener al menos 3 caracteres').max(100),
  password: z.string().min(4, 'La contraseña debe tener al menos 4 caracteres'),
  rol: z.enum(['Admin', 'Soporte', 'Tecnico'])
});

export const createUser = async (req: Request, res: Response) => {
  try {
    const parseResult = createUserSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        message: 'Datos del nuevo usuario inválidos o incompletos',
        errors: parseResult.error.errors
      });
      return;
    }

    const { nombre_completo, credencial_acceso, password, rol } = parseResult.data;

    // Verificar si ya existe un usuario con la misma credencial
    const existingUser = await User.findOne({ where: { credencial_acceso: credencial_acceso.trim() } });
    if (existingUser) {
      res.status(409).json({
        success: false,
        message: `Ya existe un usuario registrado con la credencial o correo "${credencial_acceso}".`
      });
      return;
    }

    const password_hash = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      nombre_completo: nombre_completo.trim(),
      credencial_acceso: credencial_acceso.trim(),
      password_hash,
      rol
    });

    res.status(201).json({
      success: true,
      message: `Usuario "${newUser.nombre_completo}" registrado exitosamente con rol ${newUser.rol}.`,
      data: {
        id_usuario: newUser.id_usuario,
        nombre_completo: newUser.nombre_completo,
        credencial_acceso: newUser.credencial_acceso,
        rol: newUser.rol,
        createdAt: newUser.createdAt
      }
    });
  } catch (error: any) {
    console.error('Error creando usuario:', error);
    res.status(500).json({ success: false, message: error.message || 'Error interno al registrar usuario' });
  }
};

const updateUserSchema = z.object({
  nombre_completo: z.string().min(3).max(150).optional(),
  credencial_acceso: z.string().min(3).max(100).optional(),
  password: z.string().min(4).optional(),
  rol: z.enum(['Admin', 'Soporte', 'Tecnico']).optional()
});

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const parseResult = updateUserSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        message: 'Datos de edición inválidos',
        errors: parseResult.error.errors
      });
      return;
    }

    const user = await User.findByPk(id);
    if (!user) {
      res.status(404).json({ success: false, message: 'Usuario no encontrado' });
      return;
    }

    const { nombre_completo, credencial_acceso, password, rol } = parseResult.data;

    // Verificar unicidad si cambia la credencial
    if (credencial_acceso && credencial_acceso.trim() !== user.credencial_acceso) {
      const existing = await User.findOne({ where: { credencial_acceso: credencial_acceso.trim() } });
      if (existing && existing.id_usuario !== id) {
        res.status(409).json({
          success: false,
          message: `La credencial "${credencial_acceso}" ya está en uso por otro usuario.`
        });
        return;
      }
      user.credencial_acceso = credencial_acceso.trim();
    }

    if (nombre_completo) {
      user.nombre_completo = nombre_completo.trim();
    }

    if (rol) {
      user.rol = rol;
    }

    if (password) {
      user.password_hash = await bcrypt.hash(password, 10);
    }

    await user.save();

    res.json({
      success: true,
      message: 'Usuario actualizado exitosamente',
      data: {
        id_usuario: user.id_usuario,
        nombre_completo: user.nombre_completo,
        credencial_acceso: user.credencial_acceso,
        rol: user.rol,
        updatedAt: user.updatedAt
      }
    });
  } catch (error: any) {
    console.error('Error actualizando usuario:', error);
    res.status(500).json({ success: false, message: error.message || 'Error interno al actualizar usuario' });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Evitar autoeliminación del administrador logueado
    if (req.user && req.user.id_usuario === id) {
      res.status(400).json({
        success: false,
        message: 'Acción rechazada: No puedes eliminar tu propia cuenta de administrador en sesión.'
      });
      return;
    }

    const user = await User.findByPk(id);
    if (!user) {
      res.status(404).json({ success: false, message: 'Usuario no encontrado' });
      return;
    }

    const nombre = user.nombre_completo;
    await user.destroy();

    res.json({
      success: true,
      message: `Usuario "${nombre}" eliminado del sistema correctamente.`
    });
  } catch (error: any) {
    console.error('Error eliminando usuario:', error);
    res.status(500).json({ success: false, message: error.message || 'Error interno al eliminar usuario' });
  }
};

// ============================
// Recuperación de Contraseña (SMTP Seguro con Código Temporal)
// ============================
interface RecoveryEntry {
  code: string;
  expiresAt: number;
  userId: string;
  email: string;
}
const recoveryTokens = new Map<string, RecoveryEntry>();

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { credencial_acceso, email } = req.body;
    const target = (email || credencial_acceso || '').trim().toLowerCase();

    if (!target) {
      res.status(400).json({
        success: false,
        message: 'Por favor proporciona el correo electrónico o usuario registrado.'
      });
      return;
    }

    let user = await User.findOne({
      where: sequelize.where(
        sequelize.fn('LOWER', sequelize.col('credencial_acceso')),
        target
      )
    });

    if (!user && !target.includes('@')) {
      user = await User.findOne({
        where: sequelize.where(
          sequelize.fn('LOWER', sequelize.col('credencial_acceso')),
          `${target}@gpon.com`
        )
      });
    }

    if (!user) {
      // Por privacidad y seguridad, informamos que si está registrado se envió
      res.json({
        success: true,
        message: 'Si el correo o usuario está registrado en GPON Telecom, recibirás el código de recuperación en tu bandeja.'
      });
      return;
    }

    // Generar código de 6 dígitos aleatorio
    const randomCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutos

    const cleanEmail = user.credencial_acceso.includes('@')
      ? user.credencial_acceso
      : `${user.credencial_acceso}@gpontelecom.com.mx`;

    recoveryTokens.set(user.id_usuario, {
      code: randomCode,
      expiresAt,
      userId: user.id_usuario,
      email: cleanEmail
    });

    // Enviar correo con formato HTML profesional mediante SMTP
    const mailResult = await sendPasswordRecoveryEmail({
      toEmail: cleanEmail,
      userName: user.nombre_completo,
      resetCode: randomCode
    });

    res.json({
      success: true,
      message: `Código de recuperación enviado exitosamente a ${cleanEmail}`,
      data: {
        email: cleanEmail,
        // Si el servidor SMTP no está configurado en variables de entorno, facilitamos el código para pruebas inmediatas
        codigo_prueba: mailResult.simulated ? randomCode : undefined
      }
    });
  } catch (error: any) {
    console.error('Error en forgotPassword:', error);
    res.status(500).json({ success: false, message: error.message || 'Error al procesar recuperación de contraseña' });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { credencial_acceso, email, codigo, token, newPassword } = req.body;
    const target = (email || credencial_acceso || '').trim().toLowerCase();
    const inputCode = (codigo || token || '').trim();

    if (!target || !inputCode || !newPassword) {
      res.status(400).json({
        success: false,
        message: 'Faltan campos obligatorios (correo, código y nueva contraseña).'
      });
      return;
    }

    if (newPassword.length < 4) {
      res.status(400).json({
        success: false,
        message: 'La nueva contraseña debe tener al menos 4 caracteres.'
      });
      return;
    }

    let user = await User.findOne({
      where: sequelize.where(
        sequelize.fn('LOWER', sequelize.col('credencial_acceso')),
        target
      )
    });

    if (!user && !target.includes('@')) {
      user = await User.findOne({
        where: sequelize.where(
          sequelize.fn('LOWER', sequelize.col('credencial_acceso')),
          `${target}@gpon.com`
        )
      });
    }

    if (!user) {
      res.status(404).json({ success: false, message: 'Usuario no encontrado.' });
      return;
    }

    const entry = recoveryTokens.get(user.id_usuario);
    if (!entry) {
      res.status(400).json({
        success: false,
        message: 'No hay ninguna solicitud de recuperación activa para este usuario o el código ya fue utilizado.'
      });
      return;
    }

    if (Date.now() > entry.expiresAt) {
      recoveryTokens.delete(user.id_usuario);
      res.status(400).json({
        success: false,
        message: 'El código de seguridad ha expirado. Por favor solicita uno nuevo.'
      });
      return;
    }

    if (entry.code !== inputCode) {
      res.status(400).json({
        success: false,
        message: 'El código ingresado es incorrecto. Verifica los 6 dígitos recibidos en tu correo.'
      });
      return;
    }

    // Actualizar contraseña con hash de bcrypt
    const password_hash = await bcrypt.hash(newPassword, 10);
    await user.update({ password_hash });
    recoveryTokens.delete(user.id_usuario);

    res.json({
      success: true,
      message: '¡Contraseña restablecida exitosamente! Ya puedes iniciar sesión con tu nueva contraseña.'
    });
  } catch (error: any) {
    console.error('Error en resetPassword:', error);
    res.status(500).json({ success: false, message: error.message || 'Error al restablecer la contraseña' });
  }
};



