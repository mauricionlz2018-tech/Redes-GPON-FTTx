import { Request, Response } from 'express';
import { Transaction } from 'sequelize';
import { z } from 'zod';
import { sequelize, NapPort, Client, NapBox } from '../models';

const assignPortSchema = z.object({
  id_puerto: z.string().uuid(),
  numero_cliente: z.string().min(3),
  nombre_completo: z.string().min(3),
  marca_ont: z.enum(['ZTE', 'V-SOL', 'TP-Link', 'Huawei']),
  direccion: z.string().min(5),
  ont_mac: z.string().regex(/^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/, 'Formato MAC inválido (ej: AA:BB:CC:DD:EE:FF)'),
  potencia_rx_estimada: z.number().optional().default(-19.5)
});

/**
 * Asignación atómica de cliente a un puerto NAP con bloqueo ACID (Transaction.LOCK.UPDATE)
 * para evitar colisiones cuando dos técnicos intentan tomar el mismo puerto al mismo tiempo.
 */
export const assignPort = async (req: Request, res: Response) => {
  const parseResult = assignPortSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({
      success: false,
      message: 'Datos de cliente o puerto inválidos',
      errors: parseResult.error.errors
    });
    return;
  }

  const {
    id_puerto,
    numero_cliente,
    nombre_completo,
    marca_ont,
    direccion,
    ont_mac,
    potencia_rx_estimada
  } = parseResult.data;

  // Iniciar Transacción ACID
  const t: Transaction = await sequelize.transaction();

  try {
    // Bloquear la fila del puerto con SELECT ... FOR UPDATE
    const port = await NapPort.findByPk(id_puerto, {
      transaction: t,
      lock: t.LOCK.UPDATE
    });

    if (!port) {
      await t.rollback();
      res.status(404).json({
        success: false,
        message: 'El puerto especificado no existe'
      });
      return;
    }

    if (port.estado !== 'Libre') {
      await t.rollback();
      res.status(409).json({
        success: false,
        message: `Conflicto de asignación: El puerto #${port.indice_puerto} ya no está disponible (Estado actual: '${port.estado}').`
      });
      return;
    }

    // Comprobar si la MAC o el número de cliente ya existen
    const existingClient = await Client.findOne({
      where: {
        ont_mac
      },
      transaction: t
    });

    if (existingClient) {
      await t.rollback();
      res.status(409).json({
        success: false,
        message: `Conflicto: Ya existe un abonado registrado con la MAC ONT '${ont_mac}'`
      });
      return;
    }

    // 1. Actualizar estado del puerto a 'Ocupado'
    port.estado = 'Ocupado';
    await port.save({ transaction: t });

    // 2. Crear el registro del cliente vinculado 1:1 al puerto
    const client = await Client.create(
      {
        numero_cliente,
        nombre_completo,
        id_puerto_nap: port.id_puerto,
        marca_ont,
        direccion,
        ont_mac,
        potencia_rx_estimada
      },
      { transaction: t }
    );

    // Confirmar transacción
    await t.commit();

    res.status(201).json({
      success: true,
      message: `Abonado '${client.nombre_completo}' asignado exitosamente al puerto #${port.indice_puerto}`,
      data: {
        puerto: port,
        cliente: client
      }
    });
  } catch (error: any) {
    await t.rollback();
    console.error('Error en transacción de asignación de puerto:', error);
    res.status(500).json({
      success: false,
      message: 'Error en la transacción de base de datos al asignar el puerto: ' + error.message
    });
  }
};

/**
 * Liberar puerto y desvincular cliente
 * Permitido exclusivamente para roles Admin y Soporte.
 * Si un rol Técnico invoca esto, el middleware devuelve 403.
 */
export const releasePort = async (req: Request, res: Response) => {
  const { id } = req.params;
  const t = await sequelize.transaction();

  try {
    const port = await NapPort.findByPk(id, {
      transaction: t,
      lock: t.LOCK.UPDATE
    });

    if (!port) {
      await t.rollback();
      res.status(404).json({ success: false, message: 'Puerto no encontrado' });
      return;
    }

    // Eliminar o desvincular el cliente asociado
    await Client.destroy({
      where: { id_puerto_nap: port.id_puerto },
      transaction: t
    });

    port.estado = 'Libre';
    await port.save({ transaction: t });

    await t.commit();

    res.json({
      success: true,
      message: `Puerto #${port.indice_puerto} liberado correctamente. Estado actual: Libre.`
    });
  } catch (error: any) {
    await t.rollback();
    console.error('Error al liberar puerto:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateStatusSchema = z.object({
  estado: z.enum(['Libre', 'Ocupado', 'Dañado', 'Reservado', 'En Mantenimiento'])
});

/**
 * Modificar manualmente el estado de un puerto (ej. marcar como 'Dañado' o 'En Mantenimiento')
 * Exclusivo para Admin y Soporte.
 */
export const updatePortStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const parseResult = updateStatusSchema.safeParse(req.body);

    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        message: 'Estado de puerto inválido',
        errors: parseResult.error.errors
      });
      return;
    }

    const port = await NapPort.findByPk(id);
    if (!port) {
      res.status(404).json({ success: false, message: 'Puerto no encontrado' });
      return;
    }

    port.estado = parseResult.data.estado;
    await port.save();

    res.json({
      success: true,
      message: `Estado del puerto #${port.indice_puerto} actualizado a '${port.estado}'`,
      data: port
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

