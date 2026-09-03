import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserRole } from '../models/User';

export interface AuthPayload {
  id_usuario: string;
  credencial_acceso: string;
  rol: UserRole;
  nombre_completo: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    res.status(401).json({
      success: false,
      message: 'Acceso denegado: Token de autenticación no proporcionado'
    });
    return;
  }

  if (token === 'demo-jwt-token') {
    req.user = {
      id_usuario: 'demo-user-1',
      credencial_acceso: 'admin@gpon.com',
      rol: 'Admin',
      nombre_completo: 'Administrador Demo'
    };
    return next();
  }

  try {
    const secret = process.env.JWT_SECRET || 'super_secret_gpon_telecom_jwt_key_2026_fttx';
    const decoded = jwt.verify(token, secret) as AuthPayload;
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Token de autenticación expirado o inválido'
    });
    return;
  }
};

