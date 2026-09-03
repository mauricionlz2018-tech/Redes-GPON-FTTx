import { Router } from 'express';
import { authenticateToken } from '../middlewares/auth';
import { requireRoles } from '../middlewares/role';
import { login, getProfile, listUsers } from '../controllers/authController';
import { listOdfs, getOdfById } from '../controllers/odfController';
import { listNaps, getNapById, updateGpsCoordinates, createNap } from '../controllers/napController';
import { assignPort, releasePort, updatePortStatus } from '../controllers/portController';
import { listClients, getClientById, updateClient } from '../controllers/clientController';
import { generateSaturationReport } from '../controllers/reportController';

const router = Router();

// ============================
// Rutas de Autenticación
// ============================
router.post('/auth/login', login);
router.get('/auth/me', authenticateToken, getProfile);
router.get('/auth/usuarios', authenticateToken, requireRoles(['Admin']), listUsers);

// ============================
// Rutas de ODF Central
// ============================
router.get('/odf', authenticateToken, listOdfs);
router.get('/odf/:id', authenticateToken, getOdfById);

// ============================
// Rutas de Cajas NAP
// ============================
router.get('/naps', authenticateToken, listNaps);
router.post('/naps', authenticateToken, requireRoles(['Admin', 'Soporte']), createNap);
router.get('/naps/:id', authenticateToken, getNapById);
// Actualizar GPS en campo: Permitido para todos los roles de campo
router.patch('/naps/:id/gps', authenticateToken, requireRoles(['Admin', 'Soporte', 'Tecnico']), updateGpsCoordinates);

// ============================
// Rutas de Puertos NAP (ACID y RBAC)
// ============================
// Asignar cliente inicial a puerto: Permitido para Técnico, Soporte y Admin
router.post('/puertos/asignar', authenticateToken, requireRoles(['Admin', 'Soporte', 'Tecnico']), assignPort);

// Liberar puerto: PROHIBIDO para Técnico (403 Forbidden), permitido para Soporte y Admin
router.delete('/puertos/:id/liberar', authenticateToken, requireRoles(['Admin', 'Soporte']), releasePort);

// Modificar estado de puerto (Dañado, En Mantenimiento, etc.): PROHIBIDO para Técnico (403 Forbidden)
router.patch('/puertos/:id/estado', authenticateToken, requireRoles(['Admin', 'Soporte']), updatePortStatus);

// ============================
// Rutas de Clientes Abonados
// ============================
router.get('/clientes', authenticateToken, listClients);
router.get('/clientes/:id', authenticateToken, getClientById);
// Edición de abonado: PROHIBIDO para Técnico (403 Forbidden), permitido para Soporte y Admin
router.put('/clientes/:id', authenticateToken, requireRoles(['Admin', 'Soporte']), updateClient);

// ============================
// Rutas de Reportes
// ============================
router.get('/reportes/saturacion-pdf', authenticateToken, generateSaturationReport);

export default router;

