import { Request, Response } from 'express';
import PDFDocument from 'pdfkit';
import { NapBox, NapPort, Client, OdfPanel } from '../models';
interface ColumnDef {
  header: string;
  width: number;
  align?: 'left' | 'center' | 'right';
}

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

    // Crear documento PDF con soporte de cálculo de páginas bufferizadas
    const doc = new PDFDocument({
      margin: 40,
      size: 'LETTER',
      bufferPages: true
    });

    // Configurar cabeceras de respuesta HTTP
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="reporte_gpon_saturacion.pdf"');

    doc.pipe(res);

    const pageWidth = 532; // 612 - 80 margin
    const pageLeft = 40;
    const pageBottomLimit = 730;

    // Métricas globales
    let totalPuertosRed = 0;
    let totalOcupadosRed = 0;
    let totalLibresRed = 0;

    naps.forEach((nap) => {
      const ports = (nap.puertos || []) as any[];
      const total = nap.total_puertos || 16;
      const ocupados = ports.filter((p: any) => p.estado === 'Ocupado').length;
      const libres = ports.filter((p: any) => p.estado === 'Libre').length;

      totalPuertosRed += total;
      totalOcupadosRed += ocupados;
      totalLibresRed += libres;
    });

    const overallPct = totalPuertosRed > 0 ? Math.round((totalOcupadosRed / totalPuertosRed) * 100) : 0;

    // Encabezado Corporativo (Banner Superior)
    doc.rect(pageLeft, 40, pageWidth, 58).fill('#0f172a');

    doc
      .fillColor('#ffffff')
      .font('Helvetica-Bold')
      .fontSize(14)
      .text('GPON TELECOM S.A. DE C.V.', pageLeft + 14, 50, { width: pageWidth - 28 });

    doc
      .fillColor('#38bdf8')
      .font('Helvetica')
      .fontSize(9)
      .text('Reporte Ejecutivo de Auditoría de Red, Capacidad FTTx y Padrón de Abonados', pageLeft + 14, 68);

    doc
      .fillColor('#94a3b8')
      .font('Helvetica')
      .fontSize(7.5)
      .text(
        `Fecha de Emisión: ${new Date().toLocaleString('es-MX')}  |  ODF Central: ${odf ? odf.nombre : 'Central SJR-01'}  |  Estado: Operativo`,
        pageLeft + 14,
        82
      );

    // KPI Summary Cards
    const cardY = 108;
    const cardCount = 4;
    const cardGap = 8;
    const cardWidth = (pageWidth - cardGap * (cardCount - 1)) / cardCount;
    const cardHeight = 42;

    const kpis = [
      { label: 'Cajas NAP Registradas', value: naps.length.toString(), color: '#0284c7' },
      { label: 'Capacidad de Puertos', value: totalPuertosRed.toString(), color: '#334155' },
      { label: 'Puertos Asignados', value: `${totalOcupadosRed} (${overallPct}%)`, color: overallPct >= 80 ? '#dc2626' : '#16a34a' },
      { label: 'Puertos Disponibles', value: totalLibresRed.toString(), color: '#0d9488' }
    ];

    kpis.forEach((kpi, index) => {
      const cardX = pageLeft + index * (cardWidth + cardGap);
      doc.rect(cardX, cardY, cardWidth, cardHeight).fillAndStroke('#f8fafc', '#cbd5e1');
      doc
        .fillColor('#64748b')
        .font('Helvetica')
        .fontSize(7)
        .text(kpi.label.toUpperCase(), cardX + 6, cardY + 7, { width: cardWidth - 12, align: 'center' });
      doc
        .fillColor(kpi.color)
        .font('Helvetica-Bold')
        .fontSize(12)
        .text(kpi.value, cardX + 6, cardY + 20, { width: cardWidth - 12, align: 'center' });
    });

    // Helper: Dibujar fila de tabla estructurada con bordes y celdas
    const renderRow = (
      y: number,
      height: number,
      columns: ColumnDef[],
      values: string[],
      bgColor: string,
      textColor: string,
      isHeader = false,
      badge?: { colIndex: number; text: string; bg: string; fg: string }
    ) => {
      let currentX = pageLeft;

      // Fondo y borde exterior de la fila
      doc.rect(pageLeft, y, pageWidth, height).fillAndStroke(bgColor, '#cbd5e1');

      // Celdas individuales con bordes verticales
      columns.forEach((col, idx) => {
        if (idx > 0) {
          doc
            .strokeColor('#cbd5e1')
            .lineWidth(0.5)
            .moveTo(currentX, y)
            .lineTo(currentX, y + height)
            .stroke();
        }

        const text = values[idx] || '';
        const padX = 4;
        const padY = isHeader ? (height - 9) / 2 : (height - 8.5) / 2;

        if (badge && badge.colIndex === idx) {
          const badgeW = col.width - 12;
          const badgeH = 12;
          const badgeX = currentX + (col.width - badgeW) / 2;
          const badgeY = y + (height - badgeH) / 2;

          doc.roundedRect(badgeX, badgeY, badgeW, badgeH, 2).fill(badge.bg);
          doc
            .fillColor(badge.fg)
            .font('Helvetica-Bold')
            .fontSize(7)
            .text(badge.text, badgeX, badgeY + 2.5, { width: badgeW, align: 'center', lineBreak: false });
        } else {
          doc
            .fillColor(textColor)
            .font(isHeader ? 'Helvetica-Bold' : 'Helvetica')
            .fontSize(isHeader ? 7.5 : 7.5)
            .text(text, currentX + padX, y + padY, {
              width: col.width - padX * 2,
              align: col.align || 'left',
              lineBreak: false,
              ellipsis: true
            });
        }

        currentX += col.width;
      });
    };

    // SECCIÓN 1: Tabla de Cajas NAP
    let curY = 162;
    doc
      .fillColor('#0f172a')
      .font('Helvetica-Bold')
      .fontSize(10.5)
      .text('1. Inventario y Nivel de Saturación por Caja NAP', pageLeft, curY);

    curY += 16;

    const napColumns: ColumnDef[] = [
      { header: 'IDENTIFICADOR', width: 95, align: 'left' },
      { header: 'ZONA / SECTOR', width: 135, align: 'left' },
      { header: 'CAPACIDAD', width: 52, align: 'center' },
      { header: 'LIBRES', width: 48, align: 'center' },
      { header: 'OCUPADOS', width: 52, align: 'center' },
      { header: 'SATURACIÓN', width: 68, align: 'center' },
      { header: 'DIAGNÓSTICO', width: 82, align: 'center' }
    ];

    const drawNapHeader = (y: number) => {
      renderRow(
        y,
        18,
        napColumns,
        napColumns.map((c) => c.header),
        '#1e293b',
        '#ffffff',
        true
      );
    };

    drawNapHeader(curY);
    curY += 18;

    naps.forEach((nap, index) => {
      const ports = (nap.puertos || []) as any[];
      const total = nap.total_puertos || 16;
      const ocupados = ports.filter((p: any) => p.estado === 'Ocupado').length;
      const libres = ports.filter((p: any) => p.estado === 'Libre').length;
      const pct = Math.round((ocupados / total) * 100);
      const isCritical = pct >= 80;

      if (curY + 16 > pageBottomLimit) {
        doc.addPage();
        curY = 45;
        drawNapHeader(curY);
        curY += 18;
      }

      const rowBg = index % 2 === 0 ? '#ffffff' : '#f8fafc';
      const rowValues = [
        nap.identificador,
        nap.zona || 'No especificada',
        `${total} pts`,
        libres.toString(),
        ocupados.toString(),
        `${pct}%`,
        isCritical ? 'CRÍTICO' : 'NORMAL'
      ];

      renderRow(
        curY,
        16,
        napColumns,
        rowValues,
        rowBg,
        '#1e293b',
        false,
        {
          colIndex: 6,
          text: isCritical ? 'CRÍTICO' : 'NORMAL',
          bg: isCritical ? '#fee2e2' : '#dcfce7',
          fg: isCritical ? '#991b1b' : '#166534'
        }
      );

      curY += 16;
    });

    curY += 20;

    // SECCIÓN 2: Directorio de Clientes Activos
    if (curY + 45 > pageBottomLimit) {
      doc.addPage();
      curY = 45;
    }

    doc
      .fillColor('#0f172a')
      .font('Helvetica-Bold')
      .fontSize(10.5)
      .text('2. Directorio de Abonados Conectados a la Red FTTx', pageLeft, curY);

    curY += 16;

    const clientColumns: ColumnDef[] = [
      { header: 'CÓD. CLIENTE', width: 70, align: 'left' },
      { header: 'NOMBRE DEL ABONADO', width: 145, align: 'left' },
      { header: 'CAJA / PUERTO', width: 95, align: 'center' },
      { header: 'ONT CPE', width: 55, align: 'center' },
      { header: 'DIRECCIÓN MAC', width: 105, align: 'center' },
      { header: 'POTENCIA RX', width: 62, align: 'right' }
    ];

    const drawClientHeader = (y: number) => {
      renderRow(
        y,
        18,
        clientColumns,
        clientColumns.map((c) => c.header),
        '#1e293b',
        '#ffffff',
        true
      );
    };

    drawClientHeader(curY);
    curY += 18;

    let clientRowIndex = 0;

    naps.forEach((nap) => {
      const portsWithClient = ((nap.puertos || []) as any[]).filter((p: any) => p.cliente);
      portsWithClient.forEach((port: any) => {
        const c = port.cliente!;

        if (curY + 16 > pageBottomLimit) {
          doc.addPage();
          curY = 45;
          drawClientHeader(curY);
          curY += 18;
        }

        const rowBg = clientRowIndex % 2 === 0 ? '#ffffff' : '#f8fafc';
        const clientValues = [
          c.numero_cliente,
          c.nombre_completo,
          `${nap.identificador} - P#${port.indice_puerto}`,
          c.marca_ont || 'ZTE',
          c.ont_mac || 'N/D',
          `${c.potencia_rx_estimada ?? -19.5} dBm`
        ];

        renderRow(
          curY,
          16,
          clientColumns,
          clientValues,
          rowBg,
          '#1e293b',
          false
        );

        curY += 16;
        clientRowIndex++;
      });
    });

    if (clientRowIndex === 0) {
      renderRow(
        curY,
        20,
        [{ header: '', width: pageWidth, align: 'center' }],
        ['No hay abonados asignados en la red actualmente.'],
        '#ffffff',
        '#64748b',
        false
      );
    }

    // Pie de página en todas las páginas generadas
    const pageRange = doc.bufferedPageRange();
    for (let i = pageRange.start; i < pageRange.start + pageRange.count; i++) {
      doc.switchToPage(i);

      // Línea divisoria del pie
      doc
        .strokeColor('#cbd5e1')
        .lineWidth(0.5)
        .moveTo(pageLeft, 746)
        .lineTo(pageLeft + pageWidth, 746)
        .stroke();

      // Texto de pie de página
      doc
        .fillColor('#64748b')
        .font('Helvetica')
        .fontSize(7)
        .text(
          'Documento oficial confidencial emitido por GPON TELECOM S.A. de C.V. Prohibida su copia o distribución no autorizada.',
          pageLeft,
          752,
          { width: pageWidth - 80, align: 'left' }
        );

      doc
        .fillColor('#64748b')
        .font('Helvetica-Bold')
        .fontSize(7)
        .text(`Página ${i + 1} de ${pageRange.count}`, pageLeft + pageWidth - 80, 752, {
          width: 80,
          align: 'right'
        });
    }

    doc.end();
  } catch (error: any) {
    console.error('Error al generar PDF:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
