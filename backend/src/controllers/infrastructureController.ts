import { Request, Response } from 'express';
import {
  InfrastructurePoste,
  InfrastructureMufa,
  InfrastructureRoute,
  InfrastructureGasa,
  NapBox,
  NapPort,
  Client,
  PonPort,
  OdfPanel
} from '../models';
import { broadcastNetworkChange } from '../services/sseService';

// ============================
// Controladores de Postes
// ============================
export const listPostes = async (req: Request, res: Response) => {
  try {
    const postes = await InfrastructurePoste.findAll({
      order: [['createdAt', 'DESC']]
    });
    res.json({
      success: true,
      data: postes
    });
  } catch (error: any) {
    console.error('Error al listar postes:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createPoste = async (req: Request, res: Response) => {
  try {
    const { id_poste, nombre, codigo, tipo, coordenadas_gps, material } = req.body;

    if (!nombre || !codigo || !coordenadas_gps || coordenadas_gps.lat === undefined || coordenadas_gps.lng === undefined) {
      res.status(400).json({
        success: false,
        message: 'Faltan campos obligatorios para registrar el poste (nombre, código, coordenadas_gps).'
      });
      return;
    }

    const posteId = id_poste || `poste-custom-${Date.now()}`;

    // Si ya existe por ID, actualizar o retornar
    const existing = await InfrastructurePoste.findByPk(posteId);
    if (existing) {
      await existing.update({ nombre, codigo, tipo, coordenadas_gps, material });
      broadcastNetworkChange('POSTE_CHANGED', { action: 'update', poste: existing });
      res.status(200).json({
        success: true,
        message: `Poste ${codigo} actualizado correctamente.`,
        data: existing
      });
      return;
    }

    const newPoste = await InfrastructurePoste.create({
      id_poste: posteId,
      nombre,
      codigo,
      tipo: tipo || 'poste_propuesto',
      coordenadas_gps,
      material: material || 'Concreto 12m'
    });

    broadcastNetworkChange('POSTE_CHANGED', { action: 'create', poste: newPoste });

    res.status(201).json({
      success: true,
      message: `Poste ${codigo} guardado exitosamente en base de datos central.`,
      data: newPoste
    });
  } catch (error: any) {
    console.error('Error al registrar poste:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deletePoste = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deletedCount = await InfrastructurePoste.destroy({
      where: { id_poste: id }
    });
    broadcastNetworkChange('POSTE_CHANGED', { action: 'delete', id });
    res.json({
      success: true,
      message: deletedCount > 0 ? 'Poste eliminado exitosamente.' : 'Poste no encontrado.'
    });
  } catch (error: any) {
    console.error('Error al eliminar poste:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================
// Controladores de Mufas
// ============================
export const listMufas = async (req: Request, res: Response) => {
  try {
    const mufas = await InfrastructureMufa.findAll({
      order: [['createdAt', 'DESC']]
    });
    res.json({
      success: true,
      data: mufas
    });
  } catch (error: any) {
    console.error('Error al listar mufas:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createMufa = async (req: Request, res: Response) => {
  try {
    const { id_empalme, nombre, tipo_cierre, capacidad_hilos, estado, coordenadas_gps } = req.body;
    const mufaId = id_empalme || `empalme-custom-${Date.now()}`;

    const existing = await InfrastructureMufa.findByPk(mufaId);
    if (existing) {
      await existing.update({ nombre, tipo_cierre, capacidad_hilos, estado, coordenadas_gps });
      broadcastNetworkChange('MUFA_CHANGED', { action: 'update', mufa: existing });
      res.status(200).json({ success: true, data: existing });
      return;
    }

    const newMufa = await InfrastructureMufa.create({
      id_empalme: mufaId,
      nombre,
      tipo_cierre: tipo_cierre || 'Cierre de Empalme Torpedo Domo (IP68)',
      capacidad_hilos: Number(capacidad_hilos) || 48,
      estado: estado || 'operativa',
      coordenadas_gps
    });

    broadcastNetworkChange('MUFA_CHANGED', { action: 'create', mufa: newMufa });

    res.status(201).json({ success: true, data: newMufa });
  } catch (error: any) {
    console.error('Error al crear mufa:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteMufa = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await InfrastructureMufa.destroy({ where: { id_empalme: id } });
    broadcastNetworkChange('MUFA_CHANGED', { action: 'delete', id });
    res.json({ success: true, message: 'Mufa eliminada' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================
// Controladores de Rutas Troncales
// ============================
export const listRoutes = async (req: Request, res: Response) => {
  try {
    const routes = await InfrastructureRoute.findAll({
      order: [['createdAt', 'DESC']]
    });
    res.json({ success: true, data: routes });
  } catch (error: any) {
    console.error('Error al listar rutas:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createRoute = async (req: Request, res: Response) => {
  try {
    const { id_ruta, nombre, tipo, hilos, subtipo, color, grosor, distancia_metros, distancia_km, vertices, coordenadas, estado } = req.body;
    const routeId = id_ruta || `route-custom-${Date.now()}`;

    const existing = await InfrastructureRoute.findByPk(routeId);
    if (existing) {
      await existing.update({ nombre, tipo, hilos, subtipo, color, grosor, distancia_metros, distancia_km, vertices, coordenadas, estado });
      broadcastNetworkChange('ROUTE_CHANGED', { action: 'update', route: existing });
      res.status(200).json({ success: true, data: existing });
      return;
    }

    const newRoute = await InfrastructureRoute.create({
      id_ruta: routeId,
      nombre,
      tipo: tipo || 'troncal',
      hilos: Number(hilos) || 48,
      subtipo,
      color: color || '#8d5b4c',
      grosor: Number(grosor) || 4,
      distancia_metros: Number(distancia_metros) || 0,
      distancia_km: Number(distancia_km) || 0,
      vertices: vertices || coordenadas?.length || 0,
      coordenadas,
      estado: estado || 'operativa'
    });

    broadcastNetworkChange('ROUTE_CHANGED', { action: 'create', route: newRoute });
    res.status(201).json({ success: true, data: newRoute });
  } catch (error: any) {
    console.error('Error al crear ruta:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteRoute = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await InfrastructureRoute.destroy({ where: { id_ruta: id } });
    broadcastNetworkChange('ROUTE_CHANGED', { action: 'delete', id });
    res.json({ success: true, message: 'Ruta eliminada' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================
// Controladores de Gasas de Reserva Técnica
// ============================
export const listGasas = async (req: Request, res: Response) => {
  try {
    const gasas = await InfrastructureGasa.findAll({
      order: [['createdAt', 'DESC']]
    });
    res.json({
      success: true,
      data: gasas
    });
  } catch (error: any) {
    console.error('Error al listar gasas:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createGasa = async (req: Request, res: Response) => {
  try {
    const { id_gasa, nombre, metros_reserva, longitud_metros, tipo_cable, coordenadas_gps } = req.body;
    const gasaId = id_gasa || `gasa-custom-${Date.now()}`;
    const meters = Number(metros_reserva || longitud_metros) || 30;

    const existing = await InfrastructureGasa.findByPk(gasaId);
    if (existing) {
      await existing.update({
        nombre,
        metros_reserva: meters,
        longitud_metros: meters,
        tipo_cable: tipo_cable || 'Cable Troncal 48H',
        coordenadas_gps
      });
      broadcastNetworkChange('GASA_CHANGED', { action: 'update', gasa: existing });
      res.status(200).json({ success: true, data: existing });
      return;
    }

    const newGasa = await InfrastructureGasa.create({
      id_gasa: gasaId,
      nombre,
      metros_reserva: meters,
      longitud_metros: meters,
      tipo_cable: tipo_cable || 'Cable Troncal 48H',
      coordenadas_gps
    });

    broadcastNetworkChange('GASA_CHANGED', { action: 'create', gasa: newGasa });
    res.status(201).json({ success: true, data: newGasa });
  } catch (error: any) {
    console.error('Error al crear gasa:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteGasa = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await InfrastructureGasa.destroy({ where: { id_gasa: id } });
    broadcastNetworkChange('GASA_CHANGED', { action: 'delete', id });
    res.json({ success: true, message: 'Gasa de reserva técnica eliminada' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==============================================================
// SINCRONIZACIÓN GLOBAL UNIFICADA (Una sola petición HTTP ultrarrápida)
// ==============================================================
export const getNetworkSync = async (req: Request, res: Response) => {
  try {
    const [naps, odfs, postes, mufas, routes, gasas] = await Promise.all([
      NapBox.findAll({
        include: [
          {
            model: NapPort,
            as: 'puertos',
            attributes: ['id_puerto', 'indice_puerto', 'estado'],
            include: [
              {
                model: Client,
                as: 'cliente',
                attributes: ['id_cliente', 'numero_cliente', 'nombre_completo', 'marca_ont', 'ont_mac', 'direccion', 'potencia_rx_estimada']
              }
            ]
          },
          {
            model: PonPort,
            as: 'puerto_pon',
            attributes: ['id_puerto_pon', 'numero_slot', 'numero_puerto', 'potencia_tx_dbm'],
            include: [
              {
                model: OdfPanel,
                as: 'odf',
                attributes: ['id_odf', 'nombre', 'ubicacion_central', 'coordenadas_gps']
              }
            ]
          }
        ],
        order: [['identificador', 'ASC']]
      }),
      OdfPanel.findAll(),
      InfrastructurePoste.findAll({ order: [['createdAt', 'DESC']] }),
      InfrastructureMufa.findAll({ order: [['createdAt', 'DESC']] }),
      InfrastructureRoute.findAll({ order: [['createdAt', 'DESC']] }),
      InfrastructureGasa.findAll({ order: [['createdAt', 'DESC']] })
    ]);

    const enrichedNaps = naps.map((nap) => {
      const ports = (nap.puertos || []) as any[];
      const total = nap.total_puertos || 16;
      const libres = ports.filter((p: any) => p.estado === 'Libre').length;
      const ocupados = ports.filter((p: any) => p.estado === 'Ocupado').length;
      const danados = ports.filter((p: any) => p.estado === 'Dañado').length;
      const reservados = ports.filter((p: any) => p.estado === 'Reservado' || p.estado === 'En Mantenimiento').length;
      const porcentajeSaturacion = Math.round((ocupados / total) * 100);

      let estadoSaturacion: 'disponible' | 'alerta' | 'saturada' = 'disponible';
      if (porcentajeSaturacion >= 100) estadoSaturacion = 'saturada';
      else if (porcentajeSaturacion >= 80) estadoSaturacion = 'alerta';

      return {
        ...nap.toJSON(),
        metricas: {
          total,
          libres,
          ocupados,
          danados,
          reservados,
          porcentajeSaturacion,
          estadoSaturacion
        }
      };
    });

    res.json({
      success: true,
      data: {
        naps: enrichedNaps,
        odf: odfs[0] || null,
        postes,
        mufas,
        routes,
        gasas,
        timestamp: Date.now()
      }
    });
  } catch (error: any) {
    console.error('Error en sync global de red:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};


