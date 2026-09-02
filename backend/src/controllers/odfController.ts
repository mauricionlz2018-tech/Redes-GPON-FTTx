import { Request, Response } from 'express';
import { OdfPanel, PonPort, FiberThread, NapBox } from '../models';

export const listOdfs = async (req: Request, res: Response) => {
  try {
    const odfs = await OdfPanel.findAll({
      include: [
        {
          model: PonPort,
          as: 'puertos_pon',
          include: [
            {
              model: NapBox,
              as: 'cajas_nap',
              attributes: ['id_nap', 'identificador', 'zona', 'coordenadas_gps']
            }
          ]
        },
        {
          model: FiberThread,
          as: 'hilos_fibra'
        }
      ],
      order: [['nombre', 'ASC']]
    });

    res.json({
      success: true,
      data: odfs
    });
  } catch (error: any) {
    console.error('Error al listar ODFs:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getOdfById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const odf = await OdfPanel.findByPk(id, {
      include: [
        {
          model: PonPort,
          as: 'puertos_pon',
          include: [
            {
              model: NapBox,
              as: 'cajas_nap'
            }
          ]
        },
        {
          model: FiberThread,
          as: 'hilos_fibra'
        }
      ]
    });

    if (!odf) {
      res.status(404).json({ success: false, message: 'ODF Central no encontrado' });
      return;
    }

    res.json({
      success: true,
      data: odf
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

