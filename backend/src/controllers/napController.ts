import { Request, Response } from 'express';
import { z } from 'zod';
import { NapBox, NapPort, Client, PonPort, OdfPanel } from '../models';

export const listNaps = async (req: Request, res: Response) => {
  try {
    const naps = await NapBox.findAll({
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
    });

    // Calcular saturación dinámica para cada NAP
    const enrichedNaps = naps.map((nap) => {
      const ports = (nap.puertos || []) as any[];
      const total = nap.total_puertos || 16;
      const libres = ports.filter((p: any) => p.estado === 'Libre').length;
      const ocupados = ports.filter((p: any) => p.estado === 'Ocupado').length;
      const danados = ports.filter((p: any) => p.estado === 'Dañado').length;
      const reservados = ports.filter((p: any) => p.estado === 'Reservado' || p.estado === 'En Mantenimiento').length;

      const porcentajeSaturacion = Math.round((ocupados / total) * 100);

      // Estado de saturación para colorear marcadores en el mapa Leaflet
      let estadoSaturacion: 'disponible' | 'alerta' | 'saturada' = 'disponible';
      if (porcentajeSaturacion >= 100) {
        estadoSaturacion = 'saturada'; // Rojo
      } else if (porcentajeSaturacion >= 80) {
        estadoSaturacion = 'alerta'; // Amarillo (>= 80%)
      } else {
        estadoSaturacion = 'disponible'; // Verde (< 80%)
      }

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
      data: enrichedNaps
    });
  } catch (error: any) {
    console.error('Error al listar NAPs:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getNapById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const nap = await NapBox.findByPk(id, {
      include: [
        {
          model: NapPort,
          as: 'puertos',
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
          include: [
            {
              model: OdfPanel,
              as: 'odf',
              attributes: ['id_odf', 'nombre', 'ubicacion_central', 'coordenadas_gps']
            }
          ]
        }
      ],
      order: [
        [{ model: NapPort, as: 'puertos' }, 'indice_puerto', 'ASC']
      ]
    });

    if (!nap) {
      res.status(404).json({ success: false, message: 'Caja NAP no encontrada' });
      return;
    }

    const ports = (nap.puertos || []) as any[];
    const total = nap.total_puertos || 16;
    const libres = ports.filter((p: any) => p.estado === 'Libre').length;
    const ocupados = ports.filter((p: any) => p.estado === 'Ocupado').length;
    const danados = ports.filter((p: any) => p.estado === 'Dañado').length;
    const porcentajeSaturacion = Math.round((ocupados / total) * 100);

    res.json({
      success: true,
      data: {
        ...nap.toJSON(),
        metricas: {
          total,
          libres,
          ocupados,
          danados,
          porcentajeSaturacion
        }
      }
    });
  } catch (error: any) {
    console.error('Error al obtener detalle de NAP:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateGpsSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180)
});

export const updateGpsCoordinates = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const parseResult = updateGpsSchema.safeParse(req.body);

    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        message: 'Coordenadas GPS inválidas',
        errors: parseResult.error.errors
      });
      return;
    }

    const nap = await NapBox.findByPk(id);
    if (!nap) {
      res.status(404).json({ success: false, message: 'Caja NAP no encontrada' });
      return;
    }

    nap.coordenadas_gps = {
      lat: parseResult.data.lat,
      lng: parseResult.data.lng
    };

    await nap.save();

    res.json({
      success: true,
      message: `Coordenadas GPS de la caja ${nap.identificador} actualizadas correctamente`,
      data: nap
    });
  } catch (error: any) {
    console.error('Error al actualizar GPS:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const createNapSchema = z.object({
  identificador: z.string().min(3).max(50),
  zona: z.string().min(2).max(100),
  id_puerto_pon: z.string().uuid().optional(),
  total_puertos: z.number().int().min(8).max(32).default(16),
  direccion_texto: z.string().min(3).max(255),
  coordenadas_gps: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180)
  })
});

export const createNap = async (req: Request, res: Response) => {
  const t = await NapBox.sequelize!.transaction();
  try {
    const parseResult = createNapSchema.safeParse(req.body);

    if (!parseResult.success) {
      await t.rollback();
      res.status(400).json({
        success: false,
        message: 'Datos de la caja NAP inválidos',
        errors: parseResult.error.errors
      });
      return;
    }

    const { identificador, zona, total_puertos, direccion_texto, coordenadas_gps } = parseResult.data;
    let id_puerto_pon = parseResult.data.id_puerto_pon;

    // Si no se proporcionó id_puerto_pon, asignar el primer puerto PON disponible
    if (!id_puerto_pon) {
      const defaultPon = await PonPort.findOne({ transaction: t });
      if (defaultPon) {
        id_puerto_pon = defaultPon.id_puerto_pon;
      }
    }

    // Verificar si ya existe una caja con ese identificador
    const existing = await NapBox.findOne({ where: { identificador }, transaction: t });
    if (existing) {
      await t.rollback();
      res.status(409).json({
        success: false,
        message: `Ya existe una caja NAP registrada con el identificador '${identificador}'`
      });
      return;
    }

    // 1. Crear la caja NAP
    const newNap = await NapBox.create(
      {
        identificador,
        zona,
        id_puerto_pon: id_puerto_pon!,
        total_puertos,
        direccion_texto,
        coordenadas_gps
      },
      { transaction: t }
    );

    // 2. Generar automáticamente los 16 puertos físicos en estado 'Libre'
    const portPromises = [];
    for (let i = 1; i <= total_puertos; i++) {
      portPromises.push(
        NapPort.create(
          {
            id_nap: newNap.id_nap,
            indice_puerto: i,
            estado: 'Libre'
          },
          { transaction: t }
        )
      );
    }
    const createdPorts = await Promise.all(portPromises);

    await t.commit();

    res.status(201).json({
      success: true,
      message: `Caja ${identificador} creada exitosamente con ${total_puertos} puertos listos para asignación.`,
      data: {
        ...newNap.toJSON(),
        puertos: createdPorts,
        metricas: {
          total: total_puertos,
          libres: total_puertos,
          ocupados: 0,
          danados: 0,
          porcentajeSaturacion: 0,
          estadoSaturacion: 'disponible'
        }
      }
    });
  } catch (error: any) {
    await t.rollback();
    console.error('Error creando nueva caja NAP:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
