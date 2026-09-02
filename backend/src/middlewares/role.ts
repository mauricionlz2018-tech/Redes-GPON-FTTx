import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../models/User';

export const requireRoles = (roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'No autenticado'
      });
      return;
    }

    if (!roles.includes(req.user.rol)) {
      res.status(403).json({
        success: false,
        message: `Permiso denegado: El rol '${req.user.rol}' no tiene autorización para realizar esta acción. Requerido: [${roles.join(', ')}]`
      });
      return;
    }

    next();
  };
};

