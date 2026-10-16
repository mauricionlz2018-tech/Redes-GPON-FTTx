import { Router } from 'express';
import { authenticateToken } from '../middlewares/auth';
import { requireRoles } from '../middlewares/role';
import {
  login,
  getProfile,
  listUsers,
  updateProfile,
  createUser,
  updateUser,
  deleteUser,
  forgotPassword,
  resetPassword
} from '../controllers/authController';
import { listOdfs, getOdfById } from '../controllers/odfController';
import { listNaps, getNapById, updateGpsCoordinates, createNap, deleteNap } from '../controllers/napController';
import { assignPort, releasePort, updatePortStatus } from '../controllers/portController';
import { listClients, getClientById, updateClient } from '../controllers/clientController';
import { generateSaturationReport } from '../controllers/reportController';
import { listMileageLogs, createMileageLog, deleteMileageLog } from '../controllers/mileageController';
import {
  listPostes,
  createPoste,
  deletePoste,
  listMufas,
  createMufa,
  deleteMufa,
  listRoutes,
  createRoute,
  deleteRoute,
  listGasas,
  createGasa,
  deleteGasa,
  getNetworkSync
} from '../controllers/infrastructureController';
import { registerSseClient } from '../services/sseService';

import { authLimiter, writeLimiter } from '../middlewares/security';

const router = Router();

router.get('/health', (req, res) => {
  res.json({
    status: 'online',
    servicio: 'GPON TELECOM Inventory & Mapping API v1',
    seguridad: 'Cifrado TLS/SSL + RateLimit + RBAC Activo',
    timestamp: new Date().toISOString()
  });
});

// ==============================================================
// Canales de Sincronización en Tiempo Real (SSE) y Red Unificada
// ==============================================================
router.get('/events', authenticateToken, (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no'
  });
  registerSseClient(res);
});

router.get('/network-sync', authenticateToken, getNetworkSync);

// ============================
// Rutas de Autenticación y Gestión de Personal (RBAC + Anti Fuerza Bruta)
// ============================
router.post('/auth/login', authLimiter, login);
router.post('/auth/recuperar-password', authLimiter, forgotPassword);
router.post('/auth/reset-password', authLimiter, resetPassword);
router.get('/auth/me', authenticateToken, getProfile);
router.put('/auth/perfil', authenticateToken, writeLimiter, updateProfile);

// Gestión exclusiva para rol Administrador (Auditoría y Límite de Escritura)
router.get('/auth/usuarios', authenticateToken, requireRoles(['Admin']), listUsers);
router.post('/auth/usuarios', authenticateToken, requireRoles(['Admin']), writeLimiter, createUser);
router.put('/auth/usuarios/:id', authenticateToken, requireRoles(['Admin']), writeLimiter, updateUser);
router.delete('/auth/usuarios/:id', authenticateToken, requireRoles(['Admin']), writeLimiter, deleteUser);

// ============================
// Rutas de ODF Central
// ============================
router.get('/odf', authenticateToken, listOdfs);
router.get('/odf/:id', authenticateToken, getOdfById);

// ============================
// Rutas de Cajas NAP
// ============================
router.get('/naps', authenticateToken, listNaps);
router.post('/naps', authenticateToken, requireRoles(['Admin', 'Soporte', 'Tecnico']), writeLimiter, createNap);
router.get('/naps/:id', authenticateToken, getNapById);
router.delete('/naps/:id', authenticateToken, requireRoles(['Admin', 'Soporte', 'Tecnico']), writeLimiter, deleteNap);
// Actualizar GPS en campo: Permitido para todos los roles de campo
router.patch('/naps/:id/gps', authenticateToken, requireRoles(['Admin', 'Soporte', 'Tecnico']), writeLimiter, updateGpsCoordinates);

// ============================
// Rutas de Puertos NAP (ACID y RBAC)
// ============================
// Asignar cliente inicial a puerto: Permitido para Técnico, Soporte y Admin
router.post('/puertos/asignar', authenticateToken, requireRoles(['Admin', 'Soporte', 'Tecnico']), writeLimiter, assignPort);

// Liberar puerto: Permitido para Técnico, Soporte y Admin
router.delete('/puertos/:id/liberar', authenticateToken, requireRoles(['Admin', 'Soporte', 'Tecnico']), writeLimiter, releasePort);

// Modificar estado de puerto (Dañado, En Mantenimiento, etc.): PROHIBIDO para Técnico (403 Forbidden)
router.patch('/puertos/:id/estado', authenticateToken, requireRoles(['Admin', 'Soporte']), writeLimiter, updatePortStatus);

// ============================
// Rutas de Clientes Abonados
// ============================
router.get('/clientes', authenticateToken, listClients);
router.get('/clientes/:id', authenticateToken, getClientById);
// Edición de abonado: Permitido para Técnico, Soporte y Admin (para actualización y corrección de datos en campo)
router.put('/clientes/:id', authenticateToken, requireRoles(['Admin', 'Soporte', 'Tecnico']), writeLimiter, updateClient);

// ============================
// Rutas de Reportes
// ============================
router.get('/reportes/saturacion-pdf', authenticateToken, generateSaturationReport);

// ============================
// Rutas de Bitácora de Kilometraje de Técnicos
// ============================
router.get('/kilometraje', authenticateToken, listMileageLogs);
router.post('/kilometraje', authenticateToken, requireRoles(['Admin', 'Soporte', 'Tecnico']), writeLimiter, createMileageLog);
router.delete('/kilometraje/:id', authenticateToken, requireRoles(['Admin', 'Soporte']), writeLimiter, deleteMileageLog);

// ============================
// Rutas de Infraestructura (Postes, Mufas y Rutas Troncales)
// ============================
router.get('/infra/postes', authenticateToken, listPostes);
router.post('/infra/postes', authenticateToken, requireRoles(['Admin', 'Soporte', 'Tecnico']), writeLimiter, createPoste);
router.delete('/infra/postes/:id', authenticateToken, requireRoles(['Admin', 'Soporte', 'Tecnico']), writeLimiter, deletePoste);

router.get('/infra/mufas', authenticateToken, listMufas);
router.post('/infra/mufas', authenticateToken, requireRoles(['Admin', 'Soporte', 'Tecnico']), writeLimiter, createMufa);
router.delete('/infra/mufas/:id', authenticateToken, requireRoles(['Admin', 'Soporte', 'Tecnico']), writeLimiter, deleteMufa);

router.get('/infra/routes', authenticateToken, listRoutes);
router.post('/infra/routes', authenticateToken, requireRoles(['Admin', 'Soporte', 'Tecnico']), writeLimiter, createRoute);
router.delete('/infra/routes/:id', authenticateToken, requireRoles(['Admin', 'Soporte', 'Tecnico']), writeLimiter, deleteRoute);

router.get('/infra/gasas', authenticateToken, listGasas);
router.post('/infra/gasas', authenticateToken, requireRoles(['Admin', 'Soporte', 'Tecnico']), writeLimiter, createGasa);
router.delete('/infra/gasas/:id', authenticateToken, requireRoles(['Admin', 'Soporte', 'Tecnico']), writeLimiter, deleteGasa);

export default router;


