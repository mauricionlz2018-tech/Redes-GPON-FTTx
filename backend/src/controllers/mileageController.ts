import { Request, Response } from 'express';
import { MileageLog } from '../models';

// Obtener historial de kilometraje grabado
export const listMileageLogs = async (req: Request, res: Response): Promise<void> => {
  try {
    const logs = await MileageLog.findAll({
      order: [['fecha_hora', 'DESC']]
    });

    res.json({
      success: true,
      data: logs,
      total: logs.length
    });
  } catch (error: any) {
    console.error('Error al listar bitácora de kilometraje:', error);
    res.status(500).json({
      success: false,
      message: 'Error al consultar la bitácora de kilometraje',
      error: error.message
    });
  }
};

// Grabar un nuevo registro de kilometraje del técnico
export const createMileageLog = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      tecnico_nombre,
      id_nap,
      nap_identificador,
      nap_zona,
      vehiculo_unidad,
      motivo_traslado,
      tipo_calculo,
      km_inicial,
      km_final,
      km_recorridos,
      distancia_estimada_ruta_km,
      origen_nombre,
      destino_nombre,
      notas,
      fecha_hora
    } = req.body;

    // Validación básica de campos obligatorios
    if (!tecnico_nombre || !destino_nombre) {
      res.status(400).json({
        success: false,
        message: 'El nombre del técnico y el destino son obligatorios.'
      });
      return;
    }

    const kmRecorridosNum = Number(km_recorridos);
    if (isNaN(kmRecorridosNum) || kmRecorridosNum <= 0) {
      res.status(400).json({
        success: false,
        message: 'Los kilómetros recorridos deben ser un número mayor a cero.'
      });
      return;
    }

    const newLog = await MileageLog.create({
      tecnico_nombre: tecnico_nombre.trim(),
      id_nap: id_nap || null,
      nap_identificador: nap_identificador ? nap_identificador.trim() : null,
      nap_zona: nap_zona ? nap_zona.trim() : null,
      vehiculo_unidad: vehiculo_unidad ? vehiculo_unidad.trim() : 'Unidad Móvil 01',
      motivo_traslado: motivo_traslado || 'Instalacion',
      tipo_calculo: tipo_calculo || 'odometro',
      km_inicial: km_inicial !== undefined && km_inicial !== null ? Number(km_inicial) : undefined,
      km_final: km_final !== undefined && km_final !== null ? Number(km_final) : undefined,
      km_recorridos: kmRecorridosNum,
      distancia_estimada_ruta_km: distancia_estimada_ruta_km ? Number(distancia_estimada_ruta_km) : undefined,
      origen_nombre: origen_nombre ? origen_nombre.trim() : 'Central ODF San José',
      destino_nombre: destino_nombre.trim(),
      notas: notas ? notas.trim() : null,
      fecha_hora: fecha_hora ? new Date(fecha_hora) : new Date()
    });

    res.status(201).json({
      success: true,
      message: 'Kilometraje grabado exitosamente en la bitácora.',
      data: newLog
    });
  } catch (error: any) {
    console.error('Error al registrar kilometraje:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno al procesar el registro de kilometraje',
      error: error.message
    });
  }
};

// Eliminar un registro de kilometraje
export const deleteMileageLog = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const log = await MileageLog.findByPk(id);
    if (!log) {
      res.status(404).json({
        success: false,
        message: `No se encontró el registro de kilometraje con ID '${id}'`
      });
      return;
    }

    await log.destroy();

    res.json({
      success: true,
      message: 'Registro de kilometraje eliminado correctamente de la bitácora.'
    });
  } catch (error: any) {
    console.error('Error al eliminar registro de kilometraje:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar el registro de kilometraje',
      error: error.message
    });
  }
};

