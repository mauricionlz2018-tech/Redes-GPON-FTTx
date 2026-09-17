import { Request, Response } from 'express';
import { InfrastructurePoste, InfrastructureMufa, InfrastructureRoute } from '../models';

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
    res.json({ success: true, message: 'Ruta eliminada' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
