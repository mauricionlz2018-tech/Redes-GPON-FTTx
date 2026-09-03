import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { sequelize } from './models';
import apiRouter from './routes/api';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '4000', 10);

// Middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Endpoint de salud del backend
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    servicio: 'GPON TELECOM Inventory & Mapping API',
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

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Servidor backend GPON corriendo en http://localhost:${PORT}`);
      console.log(`📡 API REST v1 disponible en http://localhost:${PORT}/api/v1 (Acceso local y LAN)`);
    });
  } catch (error) {
    console.error('❌ Error al conectar a PostgreSQL:', error);
    console.log('💡 Asegúrate de haber iniciado el contenedor de base de datos con: docker compose -f docker/docker-compose.yml up -d');
    // Salir con error para reintento
    process.exit(1);
  }
}

startServer();

