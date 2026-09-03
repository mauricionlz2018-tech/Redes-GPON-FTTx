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

