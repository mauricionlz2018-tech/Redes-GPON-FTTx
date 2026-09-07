import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { z } from 'zod';
import { Client, NapPort, NapBox } from '../models';

export const listClients = async (req: Request, res: Response) => {
  try {
    const { q } = req.query;
    let whereClause: any = {};

    if (q && typeof q === 'string') {
      whereClause = {
        [Op.or]: [
          { nombre_completo: { [Op.iLike]: `%${q}%` } },
          { numero_cliente: { [Op.iLike]: `%${q}%` } },
          { ont_mac: { [Op.iLike]: `%${q}%` } },
          { direccion: { [Op.iLike]: `%${q}%` } }
        ]
      };
    }

    const clients = await Client.findAll({
      where: whereClause,
      include: [
        {
          model: NapPort,
          as: 'puerto_nap',
          include: [
            {
              model: NapBox,
              as: 'caja_nap',
              attributes: ['id_nap', 'identificador', 'zona', 'direccion_texto', 'coordenadas_gps']
            }
          ]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: clients
    });
  } catch (error: any) {
    console.error('Error al listar clientes:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getClientById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const client = await Client.findByPk(id, {
      include: [
        {
          model: NapPort,
          as: 'puerto_nap',
          include: [
            {
              model: NapBox,
              as: 'caja_nap'
            }
          ]
        }
      ]
    });

    if (!client) {
      res.status(404).json({ success: false, message: 'Abonado no encontrado' });
      return;
    }

    res.json({
      success: true,
      data: client
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateClientSchema = z.object({
  numero_cliente: z.string().min(3).optional(),
  nombre_completo: z.string().min(3).optional(),
  direccion: z.string().min(5).optional(),
  marca_ont: z.enum(['ZTE', 'V-SOL', 'TP-Link', 'Huawei']).optional(),
  ont_mac: z.string().regex(/^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/, 'Formato MAC inválido (ej: AA:BB:CC:DD:EE:FF)').optional(),
  potencia_rx_estimada: z.number().optional()
});

export const updateClient = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const parseResult = updateClientSchema.safeParse(req.body);

    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        message: 'Datos de cliente inválidos',
        errors: parseResult.error.errors
      });
      return;
    }

    const client = await Client.findByPk(id);
    if (!client) {
      res.status(404).json({ success: false, message: 'Abonado no encontrado' });
      return;
    }

    // Si se modifica la MAC, validar que no pertenezca a otro cliente
    if (parseResult.data.ont_mac && parseResult.data.ont_mac !== client.ont_mac) {
      const existingMac = await Client.findOne({
        where: {
          ont_mac: parseResult.data.ont_mac,
          id_cliente: { [Op.ne]: client.id_cliente }
        }
      });
      if (existingMac) {
        res.status(409).json({
          success: false,
          message: `Conflicto: Ya existe otro abonado registrado con la MAC ONT '${parseResult.data.ont_mac}'`
        });
        return;
      }
    }

    // Si se modifica el número de cliente, validar que no pertenezca a otro cliente
    if (parseResult.data.numero_cliente && parseResult.data.numero_cliente !== client.numero_cliente) {
      const existingNum = await Client.findOne({
        where: {
          numero_cliente: parseResult.data.numero_cliente,
          id_cliente: { [Op.ne]: client.id_cliente }
        }
      });
      if (existingNum) {
        res.status(409).json({
          success: false,
          message: `Conflicto: Ya existe otro abonado con el número de cliente '${parseResult.data.numero_cliente}'`
        });
        return;
      }
    }

    await client.update(parseResult.data);

    res.json({
      success: true,
      message: 'Datos del abonado actualizados correctamente',
      data: client
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

