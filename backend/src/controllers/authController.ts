import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { User } from '../models';

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

    const user = await User.findOne({ where: { credencial_acceso } });
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


