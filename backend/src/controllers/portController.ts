import { Request, Response } from 'express';
import { Transaction, Op } from 'sequelize';
import { z } from 'zod';
import { sequelize, NapPort, Client, NapBox, PonPort } from '../models';
import { broadcastNetworkChange } from '../services/sseService';

const assignPortSchema = z.object({
  id_puerto: z.string().min(1),
  id_nap: z.string().optional(),
  nap_identificador: z.string().optional(),
  indice_puerto: z.number().optional(),
  numero_cliente: z.string().min(2),
  nombre_completo: z.string().min(2),
  marca_ont: z.enum(['ZTE', 'V-SOL', 'TP-Link', 'Huawei']),
  direccion: z.string().min(2),
  ont_mac: z.string().min(5),
  potencia_rx_estimada: z.number().optional().default(-19.5)
});

/**
 * Asignación atómica de cliente a un puerto NAP con guardado definitivo en PostgreSQL
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
    id_nap,
    nap_identificador,
    indice_puerto,
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
    let port: NapPort | null = null;
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id_puerto);

    if (isUuid) {
      port = await NapPort.findByPk(id_puerto, {
        transaction: t,
        lock: t.LOCK.UPDATE
      });
    }

    // Si no se encontró por UUID (por ejemplo, identificadores de datos cargados previamente o datos locales)
    if (!port) {
      let nap: NapBox | null = null;
      if (id_nap && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id_nap)) {
        nap = await NapBox.findByPk(id_nap, { transaction: t });
      }
      if (!nap && nap_identificador) {
        nap = await NapBox.findOne({
          where: sequelize.where(
            sequelize.fn('lower', sequelize.col('identificador')),
            nap_identificador.trim().toLowerCase()
          ),
          transaction: t
        });
      }
      if (!nap && id_puerto.includes('-')) {
        const parts = id_puerto.split('-');
        if (parts.length >= 4) {
          const guessedIdent = `NAP-${parts[2].toUpperCase()}-${parts[3].toUpperCase()}`;
          nap = await NapBox.findOne({
            where: sequelize.where(
              sequelize.fn('lower', sequelize.col('identificador')),
              guessedIdent.toLowerCase()
            ),
            transaction: t
          });
        }
      }

      if (nap) {
        let portIndex = indice_puerto;
        if (!portIndex && id_puerto.includes('-')) {
          const parts = id_puerto.split('-');
          portIndex = parseInt(parts[parts.length - 1], 10);
        }

        if (portIndex) {
          port = await NapPort.findOne({
            where: {
              id_nap: nap.id_nap,
              indice_puerto: portIndex
            },
            transaction: t,
            lock: t.LOCK.UPDATE
          });
        }
      }
    }

    // Si la caja NAP o el puerto aún no existen en base de datos central, asegurar su creación
    if (!port) {
      const targetIdent = nap_identificador || 'NAP-SJR-01';
      let nap = await NapBox.findOne({
        where: sequelize.where(
          sequelize.fn('lower', sequelize.col('identificador')),
          targetIdent.trim().toLowerCase()
        ),
        transaction: t
      });

      if (!nap) {
        const ponPort = await PonPort.findOne({ transaction: t });
        nap = await NapBox.create(
          {
            identificador: targetIdent,
            zona: 'San José del Rincón',
            id_puerto_pon: ponPort?.id_puerto_pon || '00000000-0000-0000-0000-000000000001',
            total_puertos: 16,
            direccion_texto: direccion || 'Ubicación de red GPON',
            coordenadas_gps: { lat: 19.658, lng: -100.155 }
          },
          { transaction: t }
        );

        const newPorts = [];
        for (let i = 1; i <= 16; i++) {
          newPorts.push({
            id_nap: nap.id_nap,
            indice_puerto: i,
            estado: 'Libre' as const
          });
        }
        await NapPort.bulkCreate(newPorts, { transaction: t });
      }

      const portIndex = indice_puerto || 1;
      port = await NapPort.findOne({
        where: { id_nap: nap.id_nap, indice_puerto: portIndex },
        transaction: t,
        lock: t.LOCK.UPDATE
      });
    }

    if (!port) {
      await t.rollback();
      res.status(404).json({
        success: false,
        message: 'No se pudo localizar el puerto en la base de datos PostgreSQL'
      });
      return;
    }

    // 1. Desvincular cualquier cliente anterior en este puerto
    await Client.destroy({
      where: { id_puerto_nap: port.id_puerto },
      transaction: t
    });

    // 2. Prevenir colisiones de clave única en numero_cliente u ont_mac
    await Client.destroy({
      where: {
        [Op.or]: [
          { numero_cliente: numero_cliente.trim() },
          { ont_mac: ont_mac.trim().toUpperCase() }
        ]
      },
      transaction: t
    });

    // 3. Actualizar estado del puerto a 'Ocupado'
    port.estado = 'Ocupado';
    await port.save({ transaction: t });

    // 4. Crear el registro persistente del cliente en PostgreSQL
    const client = await Client.create(
      {
        numero_cliente: numero_cliente.trim(),
        nombre_completo: nombre_completo.trim(),
        id_puerto_nap: port.id_puerto,
        marca_ont,
        direccion: direccion.trim(),
        ont_mac: ont_mac.trim().toUpperCase(),
        potencia_rx_estimada
      },
      { transaction: t }
    );

    // Confirmar transacción ACID
    await t.commit();

    broadcastNetworkChange('PORT_CHANGED', { action: 'assign', id_puerto: port.id_puerto, id_nap: port.id_nap, client });

    res.status(201).json({
      success: true,
      message: `Abonado '${client.nombre_completo}' asignado y guardado en PostgreSQL (Puerto #${port.indice_puerto}).`,
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
      message: 'Error en la base de datos al asignar el puerto: ' + error.message
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
    let port: NapPort | null = null;
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    if (isUuid) {
      port = await NapPort.findByPk(id, {
        transaction: t,
        lock: t.LOCK.UPDATE
      });
    }

    if (!port && id.includes('-')) {
      const parts = id.split('-');
      if (parts.length >= 4) {
        const guessedIdent = `NAP-${parts[2].toUpperCase()}-${parts[3].toUpperCase()}`;
        const portIndex = parseInt(parts[parts.length - 1], 10);
        const nap = await NapBox.findOne({
          where: sequelize.where(
            sequelize.fn('lower', sequelize.col('identificador')),
            guessedIdent.toLowerCase()
          ),
          transaction: t
        });
        if (nap && portIndex) {
          port = await NapPort.findOne({
            where: { id_nap: nap.id_nap, indice_puerto: portIndex },
            transaction: t,
            lock: t.LOCK.UPDATE
          });
        }
      }
    }

    if (!port) {
      await t.rollback();
      res.json({
        success: true,
        message: 'Puerto liberado localmente.'
      });
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

    broadcastNetworkChange('PORT_CHANGED', { action: 'release', id_puerto: port.id_puerto, id_nap: port.id_nap });

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

