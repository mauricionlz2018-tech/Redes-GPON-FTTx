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

import { logSecurityEvent } from './security';

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  let token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  // Permitir token vía query param para conexiones EventSource/SSE desde navegadores
  if (!token && req.query.token && typeof req.query.token === 'string') {
    token = req.query.token;
  }

  if (!token) {
    logSecurityEvent('UNAUTHENTICATED_ACCESS_ATTEMPT', req, {
      message: 'Intento de acceso a recurso protegido sin token Bearer'
    });
    res.status(401).json({
      success: false,
      message: 'Acceso denegado: Token de autenticación requerido para consultar datos de red.'
    });
    return;
  }

  // Token demo de conveniencia: Permitido ÚNICAMENTE en entorno de desarrollo local con bandera explícita
  if (token === 'demo-jwt-token' || token === 'gpon-auth-token-verified') {
    if (process.env.NODE_ENV === 'development' || process.env.ALLOW_DEMO_TOKENS === 'true') {
      req.user = {
        id_usuario: 'demo-user-1',
        credencial_acceso: 'admin@gpon.com',
        rol: 'Admin',
        nombre_completo: 'Administrador Autorizado'
      };
      return next();
    }
  }

  try {
    const secret = process.env.JWT_SECRET || 'super_secret_gpon_telecom_jwt_key_2026_fttx';
    // Validación criptográfica estricta con algoritmo fijado (previene ataques de alteración de algoritmo)
    const decoded = jwt.verify(token, secret, { algorithms: ['HS256'] }) as AuthPayload;

    if (!decoded.id_usuario || !decoded.rol || !decoded.credencial_acceso) {
      throw new Error('Estructura de token JWT inválida o incompleta');
    }

    req.user = decoded;
    next();
  } catch (error: any) {
    logSecurityEvent('INVALID_TOKEN', req, {
      error: error.message
    });
    res.status(401).json({
      success: false,
      message: 'Sesión expirada o credencial criptográfica no válida. Inicia sesión nuevamente.'
    });
    return;
  }
};

