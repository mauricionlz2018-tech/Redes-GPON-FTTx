import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../models/User';
import { logSecurityEvent } from './security';

export const requireRoles = (roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      logSecurityEvent('UNAUTHENTICATED_ROLE_CHECK', req);
      res.status(401).json({
        success: false,
        message: 'No autenticado'
      });
      return;
    }

    if (!roles.includes(req.user.rol)) {
      logSecurityEvent('UNAUTHORIZED_ROLE_ACCESS_DENIED', req, {
        userRole: req.user.rol,
        requiredRoles: roles
      });
      res.status(403).json({
        success: false,
        message: `Permiso denegado: El rol '${req.user.rol}' no tiene autorización para realizar esta acción. Requerido: [${roles.join(', ')}]`
      });
      return;
    }

    next();
  };
};

