import { Request, Response } from 'express';
import PDFDocument from 'pdfkit';
import { NapBox, NapPort, Client, OdfPanel } from '../models';

export const generateSaturationReport = async (req: Request, res: Response) => {
  try {
    const naps = await NapBox.findAll({
      include: [
        {
          model: NapPort,
          as: 'puertos',
          include: [
            {
              model: Client,
              as: 'cliente'
            }
          ]
        }
      ],
      order: [['identificador', 'ASC']]
    });

    const odf = await OdfPanel.findOne();

    // Crear documento PDF
    const doc = new PDFDocument({ margin: 40, size: 'LETTER' });

    // Configurar cabeceras de respuesta HTTP
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="reporte_gpon_saturacion.pdf"');

    doc.pipe(res);

    // Encabezado corporativo
    doc
      .fillColor('#0f172a')
      .fontSize(20)
      .text('GPON TELECOM S.A. de C.V.', { align: 'left' });

    doc
      .fillColor('#0284c7')
      .fontSize(12)
      .text('Sistema de Inventario y Mapeo Lógico de Red FTTx', { align: 'left' });

    doc
      .fillColor('#64748b')
      .fontSize(9)
      .text(`Generado: ${new Date().toLocaleString('es-MX')} | ODF Central: ${odf ? odf.nombre : 'Principal'}`, { align: 'left' })
      .moveDown(1.5);

    doc
      .strokeColor('#cbd5e1')
      .lineWidth(1)
      .moveTo(40, doc.y)
      .lineTo(570, doc.y)
      .stroke()
      .moveDown(1);

    // Sección: Resumen Ejecutivo de Cajas NAP
    doc
      .fillColor('#1e293b')
      .fontSize(14)
      .text('1. Estado y Saturación de Cajas NAP');

    doc.moveDown(0.5);

    // Cabecera de la tabla de NAPs
    const startY = doc.y;
    doc.fillColor('#334155').fontSize(9);
    doc.text('Identificador', 40, startY, { width: 100 });
    doc.text('Zona', 140, startY, { width: 120 });
    doc.text('Total', 260, startY, { width: 40 });
    doc.text('Libres', 310, startY, { width: 40 });
    doc.text('Ocup.', 360, startY, { width: 40 });
    doc.text('Saturación', 410, startY, { width: 70 });
    doc.text('Estado', 490, startY, { width: 80 });

    doc.moveDown(0.5);
    doc
      .strokeColor('#e2e8f0')
      .lineWidth(0.5)
      .moveTo(40, doc.y)
      .lineTo(570, doc.y)
      .stroke()
      .moveDown(0.5);

    let totalPuertosRed = 0;
    let totalOcupadosRed = 0;

    naps.forEach((nap) => {
      const ports = (nap.puertos || []) as any[];
      const total = nap.total_puertos || 16;
      const ocupados = ports.filter((p: any) => p.estado === 'Ocupado').length;
      const libres = ports.filter((p: any) => p.estado === 'Libre').length;
      const pct = Math.round((ocupados / total) * 100);

      totalPuertosRed += total;
      totalOcupadosRed += ocupados;

      const currentY = doc.y;
      doc.fillColor('#0f172a').fontSize(8.5);
      doc.text(nap.identificador, 40, currentY, { width: 100 });
      doc.text(nap.zona, 140, currentY, { width: 120 });
      doc.text(total.toString(), 260, currentY, { width: 40 });
      doc.text(libres.toString(), 310, currentY, { width: 40 });
      doc.text(ocupados.toString(), 360, currentY, { width: 40 });

      // Color del porcentaje
      if (pct >= 80) {
        doc.fillColor('#dc2626'); // Rojo o amarillo alerta
      } else {
        doc.fillColor('#16a34a'); // Verde
      }
      doc.text(`${pct}%`, 410, currentY, { width: 70 });

      doc.fillColor(pct >= 80 ? '#b91c1c' : '#15803d');
      doc.text(pct >= 80 ? 'CRÍTICO' : 'NORMAL', 490, currentY, { width: 80 });

      doc.moveDown(0.8);
    });

    const overallPct = totalPuertosRed > 0 ? Math.round((totalOcupadosRed / totalPuertosRed) * 100) : 0;

    doc.moveDown(1);
    doc
      .font('Helvetica-Bold')
      .fillColor('#0f172a')
      .fontSize(10)
      .text(`Saturación Global de la Red: ${totalOcupadosRed}/${totalPuertosRed} puertos ocupados (${overallPct}%)`)
      .font('Helvetica')
      .moveDown(1.5);

    // Sección 2: Padrón de Abonados Conectados
    doc
      .fillColor('#1e293b')
      .fontSize(14)
      .text('2. Directorio de Clientes Activos');

    doc.moveDown(0.5);

    const clientHeaderY = doc.y;
    doc.fillColor('#334155').fontSize(9);
    doc.text('Cód. Cliente', 40, clientHeaderY, { width: 80 });
    doc.text('Nombre Abonado', 120, clientHeaderY, { width: 140 });
    doc.text('NAP / Puerto', 265, clientHeaderY, { width: 90 });
    doc.text('ONT Marca', 360, clientHeaderY, { width: 60 });
    doc.text('MAC ONT', 425, clientHeaderY, { width: 95 });
    doc.text('Rx (dBm)', 525, clientHeaderY, { width: 50 });

    doc.moveDown(0.5);
    doc
      .strokeColor('#e2e8f0')
      .lineWidth(0.5)
      .moveTo(40, doc.y)
      .lineTo(570, doc.y)
      .stroke()
      .moveDown(0.5);

    // Listar abonados de cada NAP
    naps.forEach((nap) => {
      const portsWithClient = ((nap.puertos || []) as any[]).filter((p: any) => p.cliente);
      portsWithClient.forEach((port: any) => {
        const c = port.cliente!;
        const cY = doc.y;

        // Salto de página si se acaba el espacio
        if (cY > 720) {
          doc.addPage();
        }

        doc.fillColor('#1e293b').fontSize(8);
        doc.text(c.numero_cliente, 40, doc.y, { width: 80 });
        doc.text(c.nombre_completo, 120, doc.y, { width: 140 });
        doc.text(`${nap.identificador} - P#${port.indice_puerto}`, 265, doc.y, { width: 90 });
        doc.text(c.marca_ont, 360, doc.y, { width: 60 });
        doc.text(c.ont_mac, 425, doc.y, { width: 95 });
        doc.text(`${c.potencia_rx_estimada} dBm`, 525, doc.y, { width: 50 });

        doc.moveDown(0.7);
      });
    });

    // Pie de página
    doc.moveDown(2);
    doc
      .fillColor('#94a3b8')
      .fontSize(8)
      .text('Documento confidencial emitido por GPON TELECOM S.A. de C.V. Todos los derechos reservados.', {
        align: 'center'
      });

    doc.end();
  } catch (error: any) {
    console.error('Error al generar PDF:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
