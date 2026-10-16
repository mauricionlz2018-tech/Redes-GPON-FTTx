import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { sequelize } from './models';
import apiRouter from './routes/api';

import helmet from 'helmet';
import { corsOptions, apiLimiter, sanitizeInputs } from './middlewares/security';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '4000', 10);

// Habilitar confianza en proxys inversos (Render, Cloudflare, Vercel) para IP real del cliente
app.set('trust proxy', 1);

// ==========================================
// CAPAS DE SEGURIDAD DEFENSIVA INSTITUCIONAL
// ==========================================

// 1. Ocultar huella del servidor web (Previene escaneo de vulnerabilidades específicas de Express)
app.disable('x-powered-by');

// 2. Encabezados HTTP Seguros (HSTS, X-Content-Type-Options, X-Frame-Options, NoSniff)
app.use(
  helmet({
    contentSecurityPolicy: false, // Permitir carga de teselas cartográficas de OpenStreetMap/Esri
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' }
  })
);

// 3. Política Estricta de Orígenes Cruzados (CORS)
app.use(cors(corsOptions));

// 4. Límite de Tamaño de Carga Útil (Protección Anti-Agotamiento de Memoria y Ataques DoS)
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// 5. Sanitización Automática de Entradas (Filtro contra Inyecciones XSS, Null-Byte y Parameter Pollution)
app.use(sanitizeInputs);

// 6. Limitador Global de Tráfico (Rate Limiting contra Scraping y Bombardeo de Peticiones)
app.use('/api', apiLimiter);

// Endpoint de salud del backend
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    servicio: 'GPON TELECOM Inventory & Mapping API',
    seguridad: 'Cifrado TLS/SSL + RateLimit + RBAC Activo',
    timestamp: new Date().toISOString()
  });
});

// Rutas de la API v1
app.use('/api/v1', apiRouter);

// Manejador global de errores
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error no controlado en la API:', err);
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Inicialización de la base de datos y arranque del servidor
async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('✔ Conexión exitosa a PostgreSQL con Sequelize.');
    console.log('[OK] Conexion exitosa a PostgreSQL con Sequelize.');

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Servidor backend GPON corriendo en http://localhost:${PORT}`);
      console.log(`📡 API REST v1 disponible en http://localhost:${PORT}/api/v1 (Acceso local y LAN)`);
      console.log(`Servidor backend GPON corriendo en http://localhost:${PORT}`);
      console.log(`API REST v1 disponible en http://localhost:${PORT}/api/v1 (Acceso local y LAN)`);
    });
  } catch (error) {
    console.error('❌ Error al conectar a PostgreSQL:', error);
    console.log('💡 Asegúrate de haber iniciado el contenedor de base de datos con: docker compose -f docker/docker-compose.yml up -d');
    console.error('[ERROR] Error al conectar a PostgreSQL:', error);
    console.log('Asegurate de haber iniciado el contenedor de base de datos con: docker compose -f docker/docker-compose.yml up -d');
    // Salir con error para reintento
    process.exit(1);
  }
}

startServer();

