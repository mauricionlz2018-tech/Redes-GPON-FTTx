import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import cors, { CorsOptions } from 'cors';

/**
 * 1. Rate Limiting de Alta Seguridad (Protección Anti-Fuerza Bruta y Anti-DDoS)
 */

// Límite estricto para rutas de autenticación (Login, Recuperación y Reseteo de Contraseñas)
// Previene ataques de diccionario y adivinación de credenciales
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // Ventana de 15 minutos
  max: 12, // Máximo 12 intentos por IP por ventana
  standardHeaders: true, // Retorna encabezados `RateLimit-*` (RFC draft)
  legacyHeaders: false, // Deshabilita encabezados obsoletos `X-RateLimit-*`
  handler: (req: Request, res: Response) => {
    logSecurityEvent('BRUTE_FORCE_BLOCKED', req, {
      message: 'Límite de intentos de autenticación excedido'
    });
    res.status(429).json({
      success: false,
      message: 'Demasiados intentos fallidos o solicitudes desde esta dirección IP. Por políticas de ciberseguridad, tu acceso ha sido suspendido temporalmente por 15 minutos.'
    });
  }
});

// Límite general para la API pública (Protección contra Scrapers y Denegación de Servicio)
// Ajustado a 5,000 req/15min para permitir monitoreo en tiempo real multi-dispositivo sin bloqueos (HTTP 429)
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5000, // 5000 peticiones por IP
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path === '/health' || req.path === '/v1/events',
  message: {
    success: false,
    message: 'Límite de solicitudes de API alcanzado. Por favor espera unos minutos antes de reintentar.'
  }
});

// Límite para operaciones de escritura y mutación (POST, PUT, PATCH, DELETE)
// Previene inyecciones masivas automatizadas y manipulación de inventario
export const writeLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 200, // Máximo 200 escrituras por minuto
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Demasiadas operaciones de escritura continuas. Por favor disminuye la velocidad de guardado.'
  }
});

/**
 * 2. Validación de CORS Estricto (Cross-Origin Resource Sharing)
 * Evita que sitios web de terceros no autorizados puedan acceder a los datos de la red GPON
 */
const allowedOrigins = [
  'https://redes-gpon-fttx.vercel.app',
  'https://redes-gpon-fttx.onrender.com',
  /^https:\/\/[a-zA-Z0-9-]+\.vercel\.app$/, // Previews de Vercel
  /^http:\/\/localhost:[0-9]+$/,            // Vite y servidores locales
  /^http:\/\/127\.0\.0\.1:[0-9]+$/,          // Loopback local
  /^http:\/\/192\.168\.[0-9]+\.[0-9]+:[0-9]+$/ // Acceso LAN de campo
];

export const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // Permitir peticiones sin origen (por ejemplo, aplicaciones móviles PWA, Capacitor, Postman o curl autorizado)
    if (!origin) {
      return callback(null, true);
    }

    const isAllowed = allowedOrigins.some((allowed) => {
      if (typeof allowed === 'string') {
        return allowed === origin;
      }
      return allowed.test(origin);
    });

    if (isAllowed) {
      callback(null, true);
    } else {
      console.warn(`[CORS REJECT] Origen no autorizado rechazado: ${origin}`);
      callback(new Error('Acceso no permitido por la política de seguridad CORS institucional.'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  maxAge: 86400 // Cachear preflight OPTIONS durante 24 horas
};

/**
 * 3. Sanitización de Entradas contra Inyecciones (XSS, Null-Byte y Parameter Pollution)
 */
function cleanValue(val: any): any {
  if (typeof val === 'string') {
    // 1. Eliminar inyecciones de bytes nulos que atacan el sistema de archivos o C-libs
    let sanitized = val.replace(/\0/g, '');
    // 2. Prevenir XSS básico eliminando scripts ejecutables directos
    sanitized = sanitized
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/onerror\s*=/gi, '')
      .replace(/onload\s*=/gi, '');
    return sanitized.trim();
  }
  if (Array.isArray(val)) {
    return val.map(cleanValue);
  }
  if (val !== null && typeof val === 'object') {
    const cleaned: Record<string, any> = {};
    for (const key of Object.keys(val)) {
      // Prevenir Prototype Pollution
      if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
        continue;
      }
      cleaned[key] = cleanValue(val[key]);
    }
    return cleaned;
  }
  return val;
}

export const sanitizeInputs = (req: Request, res: Response, next: NextFunction) => {
  if (req.body) {
    req.body = cleanValue(req.body);
  }
  if (req.query) {
    req.query = cleanValue(req.query);
  }
  if (req.params) {
    req.params = cleanValue(req.params);
  }
  next();
};

/**
 * 4. Registro y Auditoría de Seguridad (Security Audit Trail)
 */
export const logSecurityEvent = (eventType: string, req: Request, details: Record<string, any> = {}) => {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
  const userAgent = req.headers['user-agent'] || 'unknown';
  const user = req.user?.credencial_acceso || 'anónimo';

  const logEntry = {
    timestamp: new Date().toISOString(),
    event: eventType,
    user,
    ip,
    method: req.method,
    path: req.originalUrl,
    userAgent,
    ...details
  };

  // Imprimir alerta de seguridad en consola del servidor para monitoreo en tiempo real
  console.log(`[SEGURIDAD-AUDITORIA] ${eventType} -> Usuario: ${user} | IP: ${ip} | Ruta: ${req.method} ${req.originalUrl}`);
};
