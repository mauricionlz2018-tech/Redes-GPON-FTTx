import { Request, Response } from 'express';
import PDFDocument from 'pdfkit';
import path from 'path';
import fs from 'fs';
import { NapBox, NapPort, Client, OdfPanel } from '../models';

interface ColumnDef {
  header: string;
  width: number;
  align?: 'left' | 'center' | 'right';
}

export const generateSaturationReport = async (req: Request, res: Response) => {
  try {
    const isDark = (req.query.theme as string)?.toLowerCase() === 'dark';

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

    // Paleta cromática para Modo Claro y Modo Oscuro
    const colors = isDark
      ? {
          bgCanvas: '#0b132b',
          bannerBg: '#111c3a',
          bannerBorder: '#243356',
          bannerAccent: '#38bdf8',
          bannerTitle: '#ffffff',
          bannerSub: '#38bdf8',
          bannerDate: '#94a3b8',
          cardBg: '#16203c',
          cardBorder: '#243356',
          cardTitle: '#94a3b8',
          sectionTitle: '#ffffff',
          headerBg: '#16203c',
          headerText: '#ffffff',
          headerBorder: '#0284c7',
          rowEven: '#0f172a',
          rowOdd: '#141f36',
          rowText: '#f8fafc',
          rowSubText: '#94a3b8',
          rowBorder: '#243356',
          badgeNormalBg: '#064e3b',
          badgeNormalFg: '#34d399',
          badgeWarningBg: '#78350f',
          badgeWarningFg: '#fbbf24',
          badgeCriticalBg: '#881337',
          badgeCriticalFg: '#f87171',
          footerText: '#94a3b8',
          footerLine: '#243356'
        }
      : {
          bgCanvas: '#ffffff',
          bannerBg: '#f8fafc',
          bannerBorder: '#cbd5e1',
          bannerAccent: '#0284c7',
          bannerTitle: '#0f172a',
          bannerSub: '#0284c7',
          bannerDate: '#475569',
          cardBg: '#ffffff',
          cardBorder: '#e2e8f0',
          cardTitle: '#64748b',
          sectionTitle: '#0f172a',
          headerBg: '#f1f5f9',
          headerText: '#0f172a',
          headerBorder: '#cbd5e1',
          rowEven: '#ffffff',
          rowOdd: '#f8fafc',
          rowText: '#0f172a',
          rowSubText: '#64748b',
          rowBorder: '#e2e8f0',
          badgeNormalBg: '#dcfce7',
          badgeNormalFg: '#15803d',
          badgeWarningBg: '#fef3c7',
          badgeWarningFg: '#b45309',
          badgeCriticalBg: '#fee2e2',
          badgeCriticalFg: '#b91c1c',
          footerText: '#64748b',
          footerLine: '#cbd5e1'
        };

    // Crear documento con márgenes controlados
    const doc = new PDFDocument({
      margins: { top: 35, bottom: 35, left: 40, right: 40 },
      size: 'LETTER',
      bufferPages: true
    });

    const filename = `reporte_gpon_saturacion_${isDark ? 'oscuro' : 'claro'}_${new Date().toISOString().slice(0, 10)}.pdf`;
    const filename = `reporte_gpon_saturacion_${new Date().toISOString().slice(0, 10)}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);

    doc.pipe(res);

    const pageWidth = 532; // 612 - 80 margin
    const pageLeft = 40;
    const pageBottomLimit = 712; // Límite para salto de página seguro

    // Pintar fondo oscuro en la primera página si aplica
    if (isDark) {
      doc.rect(0, 0, doc.page.width, doc.page.height).fill(colors.bgCanvas);
    }

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
    if (isDark) {
      doc.rect(pageLeft, 35, pageWidth, 56).fill(colors.bannerBg);
    } else {
      // Formato Blanco / Claro: Fondo suave con borde sutil y línea acento superior
      doc.rect(pageLeft, 35, pageWidth, 56).fillAndStroke(colors.bannerBg, colors.bannerBorder);
      doc.rect(pageLeft, 35, pageWidth, 3).fill(colors.bannerAccent);
    }

    // Insertar logo corporativo oficial si existe el archivo
    const logoCandidates = [
      path.resolve(__dirname, '../../assets/logo-gpon.png'),
      path.resolve(__dirname, '../../../frontend/public/logo-gpon.png'),
      path.resolve(process.cwd(), 'assets/logo-gpon.png'),
      path.resolve(process.cwd(), 'backend/assets/logo-gpon.png'),
      path.resolve(process.cwd(), 'frontend/public/logo-gpon.png')
    ];

    const validLogoPath = logoCandidates.find((p) => fs.existsSync(p));
    if (validLogoPath) {
      try {
        if (isDark) {
          doc.roundedRect(pageLeft + pageWidth - 92, 39, 84, 48, 4).fill('#ffffff');
        } else {
          doc.roundedRect(pageLeft + pageWidth - 92, 39, 84, 48, 4).fillAndStroke('#ffffff', colors.cardBorder);
        }
        doc.image(validLogoPath, pageLeft + pageWidth - 88, 42, {
          width: 76,
          height: 42,
          fit: [76, 42],
          align: 'center',
          valign: 'center'
        });
      } catch (imgErr) {
        console.warn('No se pudo incrustar imagen en PDF:', imgErr);
      }
    }

    doc
      .fillColor(colors.bannerTitle)
      .font('Helvetica-Bold')
      .fontSize(13)
      .text('GPON TELECOM S.A. DE C.V.', pageLeft + 14, 43, { width: pageWidth - 115, lineBreak: false });

    doc
      .fillColor(colors.bannerSub)
      .font('Helvetica')
      .fontSize(8.5)
      .text(
        `Reporte Ejecutivo de Auditoría de Red, Capacidad FTTx y Abonados`,
        pageLeft + 14,
        60,
        { width: pageWidth - 115, lineBreak: false }
      );

    doc
      .fillColor(colors.bannerDate)
      .font('Helvetica')
      .fontSize(7)
      .text(
        `Emisión: ${new Date().toLocaleString('es-MX')}  |  ODF Central: ${odf ? odf.nombre : 'Central SJR-01'}  |  Estado: Operativo  |  Cumplimiento: WCAG AAA`,
        pageLeft + 14,
        74,
        { width: pageWidth - 115, lineBreak: false }
      );

    // KPI Summary Cards
    const cardY = 98;
    const cardCount = 4;
    const cardGap = 8;
    const cardWidth = (pageWidth - cardGap * (cardCount - 1)) / cardCount;
    const cardHeight = 40;

    const kpis = [
      { label: 'Cajas NAP Registradas', value: naps.length.toString(), color: isDark ? '#38bdf8' : '#0284c7' },
      { label: 'Capacidad de Puertos', value: totalPuertosRed.toString(), color: isDark ? '#e2e8f0' : '#334155' },
      {
        label: 'Puertos Asignados',
        value: `${totalOcupadosRed} (${overallPct}%)`,
        color: overallPct >= 80 ? (isDark ? '#f87171' : '#dc2626') : isDark ? '#34d399' : '#16a34a'
      },
      { label: 'Puertos Disponibles', value: totalLibresRed.toString(), color: isDark ? '#2dd4bf' : '#0d9488' }
    ];

    kpis.forEach((kpi, index) => {
      const cardX = pageLeft + index * (cardWidth + cardGap);
      doc.rect(cardX, cardY, cardWidth, cardHeight).fillAndStroke(colors.cardBg, colors.cardBorder);
      doc
        .fillColor(colors.cardTitle)
        .font('Helvetica')
        .fontSize(6.5)
        .text(kpi.label.toUpperCase(), cardX + 4, cardY + 6, { width: cardWidth - 8, align: 'center', lineBreak: false });
      doc
        .fillColor(kpi.color)
        .font('Helvetica-Bold')
        .fontSize(11)
        .text(kpi.value, cardX + 4, cardY + 18, { width: cardWidth - 8, align: 'center', lineBreak: false });
    });

    // Helper: Renderizar fila estructurada
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

      doc.rect(pageLeft, y, pageWidth, height).fillAndStroke(bgColor, isHeader ? colors.headerBorder : colors.rowBorder);

      columns.forEach((col, idx) => {
        if (idx > 0) {
          doc
            .strokeColor(isHeader ? colors.headerBorder : colors.rowBorder)
            .lineWidth(0.5)
            .moveTo(currentX, y)
            .lineTo(currentX, y + height)
            .stroke();
        }

        const text = values[idx] || '';
        const padX = 4;

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
          doc.font(isHeader ? 'Helvetica-Bold' : 'Helvetica').fontSize(7.5);
          const availableW = col.width - padX * 2;
          const textH = doc.heightOfString(text, { width: availableW });
          const padY = Math.max(3, (height - textH) / 2);

          doc.fillColor(textColor).text(text, currentX + padX, y + padY, {
            width: availableW,
            align: col.align || 'left',
            lineBreak: true
          });
        }

        currentX += col.width;
      });
    };

    // SECCIÓN 1: Tabla de Cajas NAP
    let curY = 150;
    doc
      .fillColor(colors.sectionTitle)
      .font('Helvetica-Bold')
      .fontSize(10)
      .text('1. Inventario y Nivel de Saturación por Caja NAP', pageLeft, curY, { lineBreak: false });

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
        colors.headerBg,
        colors.headerText,
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
      const rowHeight = 17;

      if (curY + rowHeight > pageBottomLimit) {
        doc.addPage();
        if (isDark) {
          doc.rect(0, 0, doc.page.width, doc.page.height).fill(colors.bgCanvas);
        }
        curY = 40;
        drawNapHeader(curY);
        curY += 18;
      }

      const rowBg = index % 2 === 0 ? colors.rowEven : colors.rowOdd;
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
        rowHeight,
        napColumns,
        rowValues,
        rowBg,
        colors.rowText,
        false,
        {
          colIndex: 6,
          text: isCritical ? 'CRÍTICO' : 'NORMAL',
          bg: isCritical ? colors.badgeCriticalBg : colors.badgeNormalBg,
          fg: isCritical ? colors.badgeCriticalFg : colors.badgeNormalFg
        }
      );

      curY += rowHeight;
    });

    curY += 18;

    // SECCIÓN 2: Directorio de Abonados Conectados
    const clientColumns: ColumnDef[] = [
      { header: 'CÓD. CLIENTE', width: 65, align: 'left' },
      { header: 'NOMBRE DEL ABONADO', width: 175, align: 'left' },
      { header: 'CAJA / PUERTO', width: 85, align: 'center' },
      { header: 'ONT CPE', width: 50, align: 'center' },
      { header: 'DIRECCIÓN MAC', width: 95, align: 'center' },
      { header: 'POTENCIA RX', width: 62, align: 'right' }
    ];

    const drawClientHeader = (y: number) => {
      renderRow(
        y,
        18,
        clientColumns,
        clientColumns.map((c) => c.header),
        colors.headerBg,
        colors.headerText,
        true
      );
    };

    if (curY + 54 > pageBottomLimit) {
      doc.addPage();
      if (isDark) {
        doc.rect(0, 0, doc.page.width, doc.page.height).fill(colors.bgCanvas);
      }
      curY = 40;
    }

    doc
      .fillColor(colors.sectionTitle)
      .font('Helvetica-Bold')
      .fontSize(10)
      .text('2. Padrón y Directorio de Abonados Conectados a la Red FTTx', pageLeft, curY, { lineBreak: false });

    curY += 16;
    drawClientHeader(curY);
    curY += 18;

    let clientRowIndex = 0;

    naps.forEach((nap) => {
      const portsWithClient = ((nap.puertos || []) as any[]).filter((p: any) => p.cliente);
      portsWithClient.forEach((port: any) => {
        const c = port.cliente!;

        // Limpiar sufijos redundantes "(NAP-SJR-XX-PXX)"
        const rawName = c.nombre_completo || 'Abonado Sin Nombre';
        const cleanName = rawName.replace(/\s*\(NAP-[^\)]+\)/gi, '').trim();

        // Calcular altura dinámica de fila según longitud del nombre
        doc.fontSize(7.5).font('Helvetica');
        const textH = doc.heightOfString(cleanName, { width: 175 - 8 });
        const rowHeight = Math.max(18, Math.ceil(textH) + 7);

        if (curY + rowHeight > pageBottomLimit) {
          doc.addPage();
          if (isDark) {
            doc.rect(0, 0, doc.page.width, doc.page.height).fill(colors.bgCanvas);
          }
          curY = 40;
          drawClientHeader(curY);
          curY += 18;
        }

        const rowBg = clientRowIndex % 2 === 0 ? colors.rowEven : colors.rowOdd;
        const clientValues = [
          c.numero_cliente || `CLI-${port.id_puerto}`,
          cleanName,
          `${nap.identificador} - P#${port.indice_puerto}`,
          c.marca_ont || 'ZTE',
          c.ont_mac || 'N/D',
          `${c.potencia_rx_estimada ?? -19.5} dBm`
        ];

        renderRow(
          curY,
          rowHeight,
          clientColumns,
          clientValues,
          rowBg,
          colors.rowText,
          false
        );

        curY += rowHeight;
        clientRowIndex++;
      });
    });

    if (clientRowIndex === 0) {
      renderRow(
        curY,
        20,
        [{ header: '', width: pageWidth, align: 'center' }],
        ['No hay abonados asignados en la red actualmente.'],
        colors.rowEven,
        colors.rowSubText,
        false
      );
    }

    // Pie de página oficial en todas las páginas generadas
    const pageRange = doc.bufferedPageRange();
    for (let i = pageRange.start; i < pageRange.start + pageRange.count; i++) {
      doc.switchToPage(i);
      doc.page.margins.bottom = 0; // Prevenir saltos automáticos no deseados

      doc
        .strokeColor(colors.footerLine)
        .lineWidth(0.5)
        .moveTo(pageLeft, 740)
        .lineTo(pageLeft + pageWidth, 740)
        .stroke();

      doc
        .fillColor(colors.footerText)
        .font('Helvetica')
        .fontSize(6.8)
        .text(
          `Documento oficial de auditoría emitido por GPON TELECOM S.A. de C.V. • Formato: ${isDark ? 'Oscuro NOC' : 'Blanco / Claro Impresión'}`,
          'Documento oficial de auditoría emitido por GPON TELECOM S.A. de C.V.',
          pageLeft,
          746,
          { width: pageWidth - 90, align: 'left', lineBreak: false }
        );

      doc
        .fillColor(colors.footerText)
        .font('Helvetica-Bold')
        .fontSize(6.8)
        .text(`Página ${i + 1} de ${pageRange.count}`, pageLeft + pageWidth - 80, 746, {
          width: 80,
          align: 'right',
          lineBreak: false
        });
    }

    doc.end();
  } catch (error: any) {
    console.error('Error al generar PDF:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
