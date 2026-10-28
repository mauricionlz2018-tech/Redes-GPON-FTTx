import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { NapBox } from '../types';

export interface GeneratePdfOptions {
  naps: NapBox[];
  odfName?: string;
  filename?: string;
}

export function generateClientPdfReport({
  naps,
  odfName = 'Central SJR-01',
  filename
}: GeneratePdfOptions): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'letter'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;

  const totalNaps = naps.length;
  const totalPuertos = naps.reduce((acc, n) => acc + (n.total_puertos || 16), 0);
  const totalOcupados = naps.reduce((acc, n) => acc + (n.metricas?.ocupados || 0), 0);
  const totalLibres = totalPuertos - totalOcupados;
  const saturacionGlobal = totalPuertos > 0 ? Math.round((totalOcupados / totalPuertos) * 100) : 0;

  const disponiblesCount = naps.filter((n) => (n.metricas?.porcentajeSaturacion || 0) < 80).length;
  const alertaCount = naps.filter((n) => {
    const p = n.metricas?.porcentajeSaturacion || 0;
    return p >= 80 && p < 100;
  }).length;
  const saturadasCount = naps.filter((n) => (n.metricas?.porcentajeSaturacion || 0) >= 100).length;

  const now = new Date();
  const folio = `RPT-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const dateStr = now.toLocaleDateString('es-MX', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // 1. Encabezado Corporativo
  doc.setFillColor(14, 116, 144); // Sky 700
  doc.rect(margin, 12, contentWidth, 2.5, 'F');

  doc.setFillColor(248, 250, 252);
  doc.rect(margin, 14.5, contentWidth, 26, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.rect(margin, 14.5, contentWidth, 26, 'S');

  // Título e Identidad
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42); // Slate 900
  doc.text('GPON TELECOM S.A. DE C.V.', margin + 5, 22);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(2, 132, 199); // Sky 600
  doc.text('INVENTARIO Y MAPEO LÓGICO DE FIBRA ÓPTICA FTTX', margin + 5, 27);

  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139); // Slate 500
  doc.text(`Municipio de San José del Rincón, Estado de México | ODF: ${odfName}`, margin + 5, 32);
  doc.text(`Fecha: ${dateStr.charAt(0).toUpperCase() + dateStr.slice(1)}`, margin + 5, 36.5);

  // Folio a la derecha
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text(`FOLIO: ${folio}`, pageWidth - margin - 5, 22, { align: 'right' });

  doc.setFillColor(240, 253, 244);
  doc.rect(pageWidth - margin - 35, 26, 30, 6, 'F');
  doc.setDrawColor(187, 247, 208);
  doc.rect(pageWidth - margin - 35, 26, 30, 6, 'S');
  doc.setFontSize(7);
  doc.setTextColor(22, 101, 52);
  doc.text('DOCUMENTO OFICIAL', pageWidth - margin - 20, 30.2, { align: 'center' });

  // 2. Título de Sección
  let currentY = 46;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text('Reporte Ejecutivo de Saturación de Red y Ocupación de Puertos Ópticos', margin, currentY);

  currentY += 4.5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('Evaluación integral de splitters 1:16, balance de potencia y disponibilidad de acometidas en campo.', margin, currentY);

  // 3. Tarjetas KPI
  currentY += 6;
  const cardGap = 4;
  const cardWidth = (contentWidth - cardGap * 3) / 4;
  const cardHeight = 16;

  const kpis = [
    { label: 'CAJAS NAP', value: `${totalNaps}`, sub: 'Distribuidas en campo', color: [2, 132, 199] },
    { label: 'CAPACIDAD TOTAL', value: `${totalPuertos}`, sub: 'Puertos Ópticos', color: [79, 70, 229] },
    { label: 'ABONADOS ACTIVOS', value: `${totalOcupados}`, sub: `Libres: ${totalLibres}`, color: [16, 185, 129] },
    { label: 'SATURACIÓN GLOBAL', value: `${saturacionGlobal}%`, sub: saturacionGlobal >= 80 ? 'Alerta Capacidad' : 'Operativa Normal', color: saturacionGlobal >= 80 ? [217, 119, 6] : [2, 132, 199] }
  ];

  kpis.forEach((kpi, idx) => {
    const cardX = margin + idx * (cardWidth + cardGap);
    doc.setFillColor(255, 255, 255);
    doc.rect(cardX, currentY, cardWidth, cardHeight, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.rect(cardX, currentY, cardWidth, cardHeight, 'S');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text(kpi.label, cardX + cardWidth / 2, currentY + 4, { align: 'center' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(kpi.color[0], kpi.color[1], kpi.color[2]);
    doc.text(kpi.value, cardX + cardWidth / 2, currentY + 10, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.setTextColor(148, 163, 184);
    doc.text(kpi.sub, cardX + cardWidth / 2, currentY + 13.8, { align: 'center' });
  });

  // 4. Barra resumen de estado
  currentY += cardHeight + 4;
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, currentY, contentWidth, 8, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.rect(margin, currentY, contentWidth, 8, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(30, 41, 59);
  doc.text('Diagnóstico de Red:', margin + 4, currentY + 5.2);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text(
    `Disponibles: ${disponiblesCount}   |   En Alerta (≥80%): ${alertaCount}   |   Saturadas (100%): ${saturadasCount}`,
    margin + 36,
    currentY + 5.2
  );

  // 5. Tabla Detallada con autoTable
  currentY += 12;

  const tableRows = naps.map((nap) => {
    const m = nap.metricas;
    const ocupados = m?.ocupados ?? 0;
    const libres = m?.libres ?? (nap.total_puertos - ocupados);
    const pct = m?.porcentajeSaturacion ?? Math.round((ocupados / nap.total_puertos) * 100);

    let diag = 'DISPONIBLE';
    if (pct >= 100) diag = 'SATURADA';
    else if (pct >= 80) diag = 'EN ALERTA';

    return [
      nap.identificador,
      nap.zona || 'San José del Rincón',
      nap.total_puertos.toString(),
      libres.toString(),
      ocupados.toString(),
      `${pct}%`,
      diag
    ];
  });

  autoTable(doc, {
    startY: currentY,
    head: [['Identificador', 'Zona / Cobertura', 'Puertos', 'Libres', 'Ocupados', 'Saturación', 'Diagnóstico']],
    body: tableRows,
    margin: { left: margin, right: margin, bottom: 20 },
    theme: 'grid',
    styles: {
      fontSize: 7.5,
      cellPadding: 2,
      font: 'helvetica',
      textColor: [30, 41, 59]
    },
    headStyles: {
      fillColor: [14, 116, 144], // Sky 700
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center'
    },
    columnStyles: {
      0: { fontStyle: 'bold', textColor: [2, 132, 199], halign: 'left' },
      1: { halign: 'left' },
      2: { halign: 'center' },
      3: { halign: 'center', textColor: [22, 101, 52], fontStyle: 'bold' },
      4: { halign: 'center', textColor: [15, 23, 42], fontStyle: 'bold' },
      5: { halign: 'center', fontStyle: 'bold' },
      6: { halign: 'center', fontStyle: 'bold' }
    },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 6) {
        const val = data.cell.raw as string;
        if (val === 'SATURADA') {
          data.cell.styles.textColor = [185, 28, 28]; // Red 700
          data.cell.styles.fillColor = [254, 226, 226]; // Red 100
        } else if (val === 'EN ALERTA') {
          data.cell.styles.textColor = [180, 83, 9]; // Amber 700
          data.cell.styles.fillColor = [254, 243, 199]; // Amber 100
        } else {
          data.cell.styles.textColor = [21, 128, 61]; // Emerald 700
          data.cell.styles.fillColor = [220, 252, 231]; // Emerald 100
        }
      }
    },
    didDrawPage: (data) => {
      // Pie de página oficial
      const pageNumber = (doc as any).internal.getNumberOfPages();
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(148, 163, 184);

      // Línea divisoria de pie
      doc.setDrawColor(226, 232, 240);
      doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);

      doc.text(
        'GPON TELECOM S.A. DE C.V. — Sistema de Mapeo Lógico y Físico FTTx — Auditoría Técnica',
        margin,
        pageHeight - 8
      );
      doc.text(`Página ${data.pageNumber} de ${pageNumber}`, pageWidth - margin, pageHeight - 8, {
        align: 'right'
      });
    }
  });

  const finalName =
    filename || `reporte_gpon_saturacion_${now.toISOString().slice(0, 10)}.pdf`;
  doc.save(finalName);
}
