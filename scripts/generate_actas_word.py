import os
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import parse_xml
from docx.oxml.ns import nsdecls, qn

def set_cell_background(cell, hex_color):
    """Sets background shading of a table cell."""
    tcPr = cell._tc.get_or_add_tcPr()
    for existing in tcPr.findall(qn('w:shd')):
        tcPr.remove(existing)
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{hex_color}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=120, bottom=120, left=150, right=150):
    """Sets cell margins (padding) in dxa (twips). 20 dxa = 1 pt."""
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = parse_xml(f'<w:tcMar {nsdecls("w")}>'
                      f'<w:top w:w="{top}" w:type="dxa"/>'
                      f'<w:bottom w:w="{bottom}" w:type="dxa"/>'
                      f'<w:left w:w="{left}" w:type="dxa"/>'
                      f'<w:right w:w="{right}" w:type="dxa"/>'
                      f'</w:tcMar>')
    tcPr.append(tcMar)

def set_table_borders(table, color="000000", sz="4"):
    """Sets clean black borders on table."""
    tblPr = table._tbl.tblPr
    borders = parse_xml(f'<w:tblBorders {nsdecls("w")}>'
                        f'<w:top w:val="single" w:sz="{sz}" w:space="0" w:color="{color}"/>'
                        f'<w:bottom w:val="single" w:sz="{sz}" w:space="0" w:color="{color}"/>'
                        f'<w:left w:val="single" w:sz="{sz}" w:space="0" w:color="{color}"/>'
                        f'<w:right w:val="single" w:sz="{sz}" w:space="0" w:color="{color}"/>'
                        f'<w:insideH w:val="single" w:sz="{sz}" w:space="0" w:color="{color}"/>'
                        f'<w:insideV w:val="single" w:sz="{sz}" w:space="0" w:color="{color}"/>'
                        f'</w:tblBorders>')
    tblPr.append(borders)

def make_row_header(row):
    """Marks row as repeating header and prevents row split across pages."""
    trPr = row._tr.get_or_add_trPr()
    trPr.append(parse_xml(f'<w:tblHeader {nsdecls("w")}/>'))
    trPr.append(parse_xml(f'<w:cantSplit {nsdecls("w")}/>'))

def make_row_cant_split(row):
    """Prevents row from splitting across pages."""
    trPr = row._tr.get_or_add_trPr()
    trPr.append(parse_xml(f'<w:cantSplit {nsdecls("w")}/>'))

def create_styled_table(doc, headers, data, col_widths, hdr_bg="EAEAEA", alt_bg="FAFAFA"):
    """Creates a monochrome Word table with precise columns and black text."""
    table = doc.add_table(rows=len(data) + 1, cols=len(headers))
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False
    set_table_borders(table, color="000000", sz="4")

    # Header Row
    hdr_row = table.rows[0]
    make_row_header(hdr_row)
    for i, title in enumerate(headers):
        cell = hdr_row.cells[i]
        cell.width = Inches(col_widths[i])
        set_cell_background(cell, hdr_bg)
        set_cell_margins(cell, top=130, bottom=130, left=120, right=120)
        cell.vertical_alignment = WD_ALIGN_VERTICAL.CENTER
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after = Pt(0)
        p.paragraph_format.line_spacing = 1.05
        run = p.add_run(title)
        run.font.name = "Arial"
        run.font.size = Pt(9.5)
        run.font.bold = True
        run.font.color.rgb = RGBColor(0x00, 0x00, 0x00)

    # Data Rows
    for r_idx, row_data in enumerate(data):
        row = table.rows[r_idx + 1]
        make_row_cant_split(row)
        bg = alt_bg if (r_idx % 2 == 1) else "FFFFFF"
        for c_idx, val in enumerate(row_data):
            cell = row.cells[c_idx]
            cell.width = Inches(col_widths[c_idx])
            set_cell_background(cell, bg)
            set_cell_margins(cell, top=100, bottom=100, left=110, right=110)
            cell.vertical_alignment = WD_ALIGN_VERTICAL.CENTER
            p = cell.paragraphs[0]
            p.paragraph_format.space_before = Pt(0)
            p.paragraph_format.space_after = Pt(0)
            p.paragraph_format.line_spacing = 1.1

            val_str = str(val).strip()
            # Determine alignment
            if c_idx == 0 or len(val_str) <= 12 or val_str in ["ACEPTADO", "APROBADO", "CONFORME", "Cumple", "Alta", "Media", "Crítica", "Autorizado", "Denegado", "No aplica"]:
                p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            else:
                p.alignment = WD_ALIGN_PARAGRAPH.LEFT

            run = p.add_run(val_str)
            run.font.name = "Arial"
            run.font.size = Pt(9)
            run.font.color.rgb = RGBColor(0x00, 0x00, 0x00)
            if c_idx == 0 and any(k in val_str for k in ["RF-", "RNF-", "ACT-", "UI-"]):
                run.font.bold = True
            elif val_str in ["ACEPTADO", "APROBADO", "CONFORME", "Denegado"]:
                run.font.bold = True

    p_spacer = doc.add_paragraph()
    p_spacer.paragraph_format.space_before = Pt(2)
    p_spacer.paragraph_format.space_after = Pt(4)
    return table

def add_header_banner(doc, folio, title_acta, subtitle):
    """Adds the official institutional banner in black and white."""
    sec = doc.sections[0]
    sec.top_margin = Inches(0.98)
    sec.bottom_margin = Inches(0.98)
    sec.left_margin = Inches(1.18)
    sec.right_margin = Inches(0.98)
    sec.page_width = Inches(8.5)
    sec.page_height = Inches(11.0)

    # Top banner table
    tbl_header = doc.add_table(rows=1, cols=2)
    tbl_header.alignment = WD_TABLE_ALIGNMENT.CENTER
    tbl_header.autofit = False
    
    # Left cell: Grayscale Logo
    cell_logo = tbl_header.cell(0, 0)
    cell_logo.width = Inches(1.8)
    set_cell_margins(cell_logo, top=40, bottom=40, left=40, right=60)
    cell_logo.vertical_alignment = WD_ALIGN_VERTICAL.CENTER
    p_logo = cell_logo.paragraphs[0]
    p_logo.alignment = WD_ALIGN_PARAGRAPH.CENTER
    logo_path = os.path.abspath("backend/assets/logo-gpon-bw.png")
    if not os.path.exists(logo_path):
        logo_path = os.path.abspath("backend/assets/logo-gpon.png")
    if os.path.exists(logo_path):
        run_logo = p_logo.add_run()
        run_logo.add_picture(logo_path, width=Inches(1.5))
    else:
        run_logo = p_logo.add_run("GPON TELECOM")
        run_logo.font.name = "Arial"
        run_logo.font.bold = True
        run_logo.font.size = Pt(13)
        run_logo.font.color.rgb = RGBColor(0x00, 0x00, 0x00)

    # Right cell: Institutional text (Pure Black)
    cell_text = tbl_header.cell(0, 1)
    cell_text.width = Inches(4.54)
    set_cell_margins(cell_text, top=40, bottom=40, left=60, right=40)
    cell_text.vertical_alignment = WD_ALIGN_VERTICAL.CENTER
    p_inst = cell_text.paragraphs[0]
    p_inst.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    p_inst.paragraph_format.line_spacing = 1.15
    p_inst.paragraph_format.space_after = Pt(0)

    r1 = p_inst.add_run("UNIVERSIDAD MEXIQUENSE DEL BICENTENARIO\n")
    r1.font.name = "Arial"
    r1.font.bold = True
    r1.font.size = Pt(9.5)
    r1.font.color.rgb = RGBColor(0x00, 0x00, 0x00)

    r2 = p_inst.add_run("Unidad de Estudios Superiores San José del Rincón\n")
    r2.font.name = "Arial"
    r2.font.size = Pt(8.5)
    r2.font.color.rgb = RGBColor(0x00, 0x00, 0x00)

    r3 = p_inst.add_run("GPON TELECOM S.A. DE C.V. — DIVISIÓN DE INGENIERÍA\n")
    r3.font.name = "Arial"
    r3.font.bold = True
    r3.font.size = Pt(9)
    r3.font.color.rgb = RGBColor(0x00, 0x00, 0x00)

    r4 = p_inst.add_run("Residencia Profesional — Ingeniería en Sistemas Computacionales")
    r4.font.name = "Arial"
    r4.font.italic = True
    r4.font.size = Pt(8)
    r4.font.color.rgb = RGBColor(0x00, 0x00, 0x00)

    # Horizontal divider line (Pure Black)
    p_div = doc.add_paragraph()
    p_div.paragraph_format.space_before = Pt(4)
    p_div.paragraph_format.space_after = Pt(8)
    p_div_border = parse_xml(f'<w:pBdr {nsdecls("w")}><w:bottom w:val="single" w:sz="12" w:space="1" w:color="000000"/></w:pBdr>')
    p_div._p.get_or_add_pPr().append(p_div_border)

    # Document Title Block
    p_folio = doc.add_paragraph()
    p_folio.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    p_folio.paragraph_format.space_after = Pt(2)
    r_fol = p_folio.add_run(f"FOLIO OFICIAL: {folio}")
    r_fol.font.name = "Arial"
    r_fol.font.bold = True
    r_fol.font.size = Pt(9.5)
    r_fol.font.color.rgb = RGBColor(0x00, 0x00, 0x00)

    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_title.paragraph_format.space_before = Pt(4)
    p_title.paragraph_format.space_after = Pt(2)
    r_title = p_title.add_run(title_acta)
    r_title.font.name = "Arial"
    r_title.font.bold = True
    r_title.font.size = Pt(13)
    r_title.font.color.rgb = RGBColor(0x00, 0x00, 0x00)

    p_sub = doc.add_paragraph()
    p_sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_sub.paragraph_format.space_after = Pt(12)
    r_sub = p_sub.add_run(subtitle)
    r_sub.font.name = "Arial"
    r_sub.font.bold = True
    r_sub.font.size = Pt(10)
    r_sub.font.color.rgb = RGBColor(0x00, 0x00, 0x00)

def add_section_header(doc, text):
    """Adds a bold styled section header in black."""
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(12)
    p.paragraph_format.space_after = Pt(4)
    p.paragraph_format.keep_with_next = True
    run = p.add_run(text)
    run.font.name = "Arial"
    run.font.bold = True
    run.font.size = Pt(11)
    run.font.color.rgb = RGBColor(0x00, 0x00, 0x00)

def add_subsection_header(doc, text):
    """Adds a subsection header in black."""
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(8)
    p.paragraph_format.space_after = Pt(2)
    p.paragraph_format.keep_with_next = True
    run = p.add_run(text)
    run.font.name = "Arial"
    run.font.bold = True
    run.font.size = Pt(10)
    run.font.color.rgb = RGBColor(0x00, 0x00, 0x00)

def add_body_paragraph(doc, text, bold_prefix=None, space_after=4):
    """Adds a justified body paragraph with Arial 9.5pt in black."""
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p.paragraph_format.line_spacing = 1.15
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after = Pt(space_after)
    if bold_prefix:
        r_pre = p.add_run(bold_prefix)
        r_pre.font.name = "Arial"
        r_pre.font.bold = True
        r_pre.font.size = Pt(9.5)
        r_pre.font.color.rgb = RGBColor(0x00, 0x00, 0x00)
    r = p.add_run(text)
    r.font.name = "Arial"
    r.font.size = Pt(9.5)
    r.font.color.rgb = RGBColor(0x00, 0x00, 0x00)
    return p

def add_signature_block(doc):
    """Adds the official two-tier signature block in black and white."""
    add_section_header(doc, "FIRMAS DE CONFORMIDAD Y APROBACIÓN TÉCNICA")
    add_body_paragraph(doc, "Leída la presente acta y conformes plenamente las partes con su contenido, alcances técnicos y especificaciones normativas, firman al calce por cuadruplicado en el Municipio de San José del Rincón, Estado de México, el día 13 de octubre de 2026.")

    table_sig = doc.add_table(rows=2, cols=2)
    table_sig.alignment = WD_TABLE_ALIGNMENT.CENTER
    table_sig.autofit = False

    sig_data = [
        [
            ("C. Mauricio Nolazco Lonjino", "Desarrollador Líder / Residente Profesional", "Ing. en Sistemas Computacionales — Matrícula: 13SC161", "Universidad Mexiquense del Bicentenario"),
            ("L.I.A. Oscar Isaac Mendoza García", "Asesor Externo de Residencia Profesional", "Jefe de Proyecto de Software — Céd. Prof. 8492019", "GPON TELECOM S.A. de C.V.")
        ],
        [
            ("I.S.C. Leonardo Becerril Sánchez", "Asesor Interno de Residencia Profesional", "Docente de Carrera — Céd. Prof. 7102941", "Universidad Mexiquense del Bicentenario"),
            ("Ing. Carlos Mendoza", "Director de Operaciones y Redes", "R.F.C.: GTE-180412-K71 — Vo.Bo. Aprobación", "GPON TELECOM S.A. de C.V.")
        ]
    ]

    for row_idx in range(2):
        row = table_sig.rows[row_idx]
        make_row_cant_split(row)
        for col_idx in range(2):
            cell = row.cells[col_idx]
            cell.width = Inches(3.17)
            set_cell_margins(cell, top=140, bottom=140, left=80, right=80)
            p = cell.paragraphs[0]
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            p.paragraph_format.line_spacing = 1.15
            p.paragraph_format.space_before = Pt(18)
            p.paragraph_format.space_after = Pt(10)

            name, role, cert, org = sig_data[row_idx][col_idx]
            
            r_line = p.add_run("_________________________________________\n")
            r_line.font.name = "Arial"
            r_line.font.bold = True
            r_line.font.color.rgb = RGBColor(0x00, 0x00, 0x00)

            r_name = p.add_run(f"{name}\n")
            r_name.font.name = "Arial"
            r_name.font.bold = True
            r_name.font.size = Pt(9.5)
            r_name.font.color.rgb = RGBColor(0x00, 0x00, 0x00)

            r_role = p.add_run(f"{role}\n")
            r_role.font.name = "Arial"
            r_role.font.size = Pt(8.5)
            r_role.font.color.rgb = RGBColor(0x00, 0x00, 0x00)

            r_cert = p.add_run(f"{cert}\n")
            r_cert.font.name = "Arial"
            r_cert.font.size = Pt(8)
            r_cert.font.color.rgb = RGBColor(0x00, 0x00, 0x00)

            r_org = p.add_run(org)
            r_org.font.name = "Arial"
            r_org.font.bold = True
            r_org.font.size = Pt(8)
            r_org.font.color.rgb = RGBColor(0x00, 0x00, 0x00)

    # Seals block
    table_seals = doc.add_table(rows=1, cols=2)
    table_seals.alignment = WD_TABLE_ALIGNMENT.CENTER
    table_seals.autofit = False
    set_table_borders(table_seals, color="000000", sz="6")

    seal_names = [
        "SELLO OFICIAL DE LA EMPRESA RECEPTORA\nGPON TELECOM S.A. DE C.V.\nDirección de Operaciones y Planta Externa",
        "SELLO OFICIAL DE LA INSTITUCIÓN EDUCATIVA\nUNIVERSIDAD MEXIQUENSE DEL BICENTENARIO\nUES San José del Rincón — Jefatura de Carrera ISC"
    ]
    for c_i, s_txt in enumerate(seal_names):
        c = table_seals.cell(0, c_i)
        c.width = Inches(3.17)
        set_cell_background(c, "FAFAFA")
        set_cell_margins(c, top=180, bottom=180, left=80, right=80)
        p = c.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.paragraph_format.line_spacing = 1.15
        r = p.add_run(s_txt)
        r.font.name = "Arial"
        r.font.size = Pt(8)
        r.font.bold = True
        r.font.color.rgb = RGBColor(0x00, 0x00, 0x00)

# ==============================================================================
# GENERATE DOCUMENT 1: ACTA DE REQUERIMIENTOS DE SOFTWARE (SRS) - BLANCO Y NEGRO
# ==============================================================================
def generate_doc_requirements():
    doc = docx.Document()
    add_header_banner(
        doc,
        folio="ACTA-CONF-SRS-2026-001",
        title_acta="ACTA DE CONFORMIDAD Y APROBACIÓN DE REQUERIMIENTOS DE SOFTWARE (SRS)",
        subtitle="Sistema de Inventario y Mapeo Lógico GPON / FTTx — GPON TELECOM S.A. de C.V."
    )

    add_section_header(doc, "1. DATOS GENERALES Y COMPARECIENTES")
    add_body_paragraph(doc, "En las instalaciones de GPON TELECOM S.A. de C.V., en el Municipio de San José del Rincón, Estado de México, siendo las 10:00 horas del día 13 de octubre de 2026, se reúnen las partes interesadas y miembros del comité de evaluación del proyecto de desarrollo de software:")

    headers_comp = ["Rol en el Proyecto", "Nombre Completo", "Cargo / Dependencia", "Identificación / Cédula"]
    data_comp = [
        ["Desarrollador / Residente", "C. Mauricio Nolazco Lonjino", "Estudiante Residente de Ing. en Sistemas Computacionales", "Matrícula UMB: 13SC161"],
        ["Asesor Externo (Empresa)", "L.I.A. Oscar Isaac Mendoza García", "Asesor Técnico y Jefe de Proyecto de Software", "Céd. Prof. 8492019 / GPON: OP-01"],
        ["Asesor Interno (Académico)", "I.S.C. Leonardo Becerril Sánchez", "Docente / Asesor de Residencia Profesional (UMB)", "Céd. Prof. 7102941 / UMB-DEP-ISC"],
        ["Representante Empresarial", "Ing. Carlos Mendoza", "Director de Operaciones y Redes GPON TELECOM", "R.F.C.: GTE-180412-K71"]
    ]
    create_styled_table(doc, headers_comp, data_comp, [1.5, 1.7, 1.84, 1.3])

    add_section_header(doc, "2. OBJETO DEL ACTA Y DECLARACIONES DE ALCANCE")
    add_body_paragraph(doc, "El presente instrumento acredita formalmente la aprobación, aceptación e inmutabilidad de la Especificación de Requerimientos de Software (SRS) para el proyecto 'Sistema de Inventario y Mapeo Lógico GPON / FTTx'.")
    add_body_paragraph(doc, "1. La Empresa Receptora declara que los requerimientos aquí descritos satisfacen íntegramente las necesidades de digitalización de planta interna y externa, sustituyendo libretas de campo por un sistema web y móvil transaccional con cartografía GIS.")
    add_body_paragraph(doc, "2. La Institución Educativa (UMB) dictamina que la especificación cumple rigurosamente los estándares de ingeniería de software y el rigor curricular de la carrera de Ingeniería en Sistemas Computacionales.")
    add_body_paragraph(doc, "3. El Desarrollador se compromete a la implantación técnica de los 27 requerimientos funcionales y 18 no funcionales acordados bajo la presente línea base.")

    add_section_header(doc, "3. MODELO DE CONTROL DE ACCESO BASADO EN ROLES (RBAC)")
    headers_rbac = ["Código", "Rol de Usuario", "Descripción y Nivel de Autorización", "Dictamen"]
    data_rbac = [
        ["ACT-01", "Administrador", "Privilegios totales e irrestrictos. Gestión de usuarios, aprovisionamiento de cajas NAP, reasignación/liberación de puertos, clientes y reportes.", "ACEPTADO CONFORME"],
        ["ACT-02", "Soporte Técnico", "Mantenimiento preventivo/correctivo. Modificación técnica de puertos (Dañado, Mantenimiento, Libre), registro de cajas NAP y desvinculaciones.", "ACEPTADO CONFORME"],
        ["ACT-03", "Técnico de Campo", "Personal operativo en calle. Consulta de mapa cartográfico, calibración GPS de cajas y asignación inicial de clientes en puertos libres. Bloqueo 403 en liberaciones.", "ACEPTADO CONFORME"]
    ]
    create_styled_table(doc, headers_rbac, data_rbac, [0.8, 1.3, 3.14, 1.1])

    add_section_header(doc, "4. TABLAS DE REQUERIMIENTOS FUNCIONALES (RF-01 AL RF-27)")

    # Modulo 1
    add_subsection_header(doc, "Módulo 1: Seguridad, Autenticación y Control de Acceso")
    headers_rf = ["Código", "Requerimiento", "Descripción Detallada", "Actores", "Entradas / Salidas", "Prioridad", "Dictamen"]
    widths_rf = [0.65, 1.1, 2.19, 0.6, 1.0, 0.4, 0.4]
    data_m1 = [
        ["RF-01", "Autenticación JWT", "Inicio de sesión seguro mediante email institucional y password cifrado bcrypt. Emisión de token Bearer JWT con vigencia de 24 horas.", "Todos", "E: email, password\nS: JWT, usuario", "Alta", "ACEPTADO"],
        ["RF-02", "Bloqueo RBAC 403", "Validación estricta de permisos por endpoint. Denegación inmediata con código HTTP 403 Forbidden a técnicos en rutas restringidas.", "Backend", "E: Bearer token\nS: HTTP 403 o OK", "Alta", "ACEPTADO"],
        ["RF-03", "Conmutador Rápido Demo", "Selector de un solo clic entre Administrador, Soporte y Técnico para pruebas y auditorías sin reingreso manual de credenciales.", "Todos", "E: Clic en pastilla\nS: Cambio de rol UI", "Media", "ACEPTADO"],
        ["RF-04", "Directorio de Cuentas", "Listado centralizado de cuentas para administradores y edición de datos de perfil propio (nombre, email, password) para todos.", "ACT-01\nTodos", "E: Perfil usuario\nS: Perfil actualizado", "Media", "ACEPTADO"]
    ]
    create_styled_table(doc, headers_rf, data_m1, widths_rf)

    # Modulo 2
    add_subsection_header(doc, "Módulo 2: Gestión de Infraestructura Pasiva (ODF y Puertos PON)")
    data_m2 = [
        ["RF-05", "Monitoreo de ODF Central", "Consulta del panel distribuidor óptico ODF: nombre, central física, coordenadas GPS y capacidad nominal (48 hilos pasantes).", "Todos", "E: Consulta GET\nS: Ficha técnica ODF", "Media", "ACEPTADO"],
        ["RF-06", "Trazabilidad Puertos PON", "Inventario de puertos PON por slot de tarjeta OLT, relación de split nominal (1:64) y potencia emitida (+4.5 a +5.2 dBm).", "ACT-01\nACT-02", "E: Slot, puerto, dBm\nS: Registro de PON", "Alta", "ACEPTADO"],
        ["RF-07", "Hilos Troncales de Fibra", "Gestión del estado de cada uno de los 48 hilos de fibra que parten del ODF hacia las mufas: Activo, Reserva o Muerto.", "ACT-01\nACT-02", "E: Hilo (1-48), estado\nS: Hilo actualizado", "Media", "ACEPTADO"]
    ]
    create_styled_table(doc, headers_rf, data_m2, widths_rf)

    # Modulo 3
    add_subsection_header(doc, "Módulo 3: Gestión y Geolocalización de Cajas NAP")
    data_m3 = [
        ["RF-08", "Alta y Provisión de NAPs", "Alta de nueva caja NAP en inventario aprovisionando automáticamente sus 16 puertos físicos acopladores SC-APC en estado Libre.", "ACT-01\nACT-02", "E: ID, zona, GPS, PON\nS: NAP + 16 puertos", "Alta", "ACEPTADO"],
        ["RF-09", "Saturación Dinámica", "Cálculo en tiempo real de ocupación de caja NAP y semaforización: Verde (<80%), Ámbar (80-99%) y Rojo/Saturada (100%).", "Todos", "E: Puertos ocupados\nS: % Saturación", "Alta", "ACEPTADO"],
        ["RF-10", "Calibración GPS en Sitio", "Captura de coordenadas GPS en campo mediante sensor móvil o entrada manual con precisión de 6 decimales.", "Todos", "E: ID, latitud, longitud\nS: Ubicación en mapa", "Alta", "ACEPTADO"]
    ]
    create_styled_table(doc, headers_rf, data_m3, widths_rf)

    # Modulo 4
    add_subsection_header(doc, "Módulo 4: Operación de Puertos NAP y Concurrencia Transaccional ACID")
    data_m4 = [
        ["RF-11", "Matriz Gráfica 16 Puertos", "Visualización gráfica interactiva del chasis de 16 puertos con indicadores de estado: Libre, Ocupado, Dañado, Reservado.", "Todos", "E: Clic en caja NAP\nS: Chasis matricial", "Alta", "ACEPTADO"],
        ["RF-12", "Asignación Atómica ACID", "Conexión de cliente a puerto libre con bloqueo pesimista SELECT FOR UPDATE. Emite HTTP 409 Conflict si hay intento colisionante.", "Todos", "E: Puerto, cliente, ONT\nS: Puerto ocupado 1:1", "Crítica", "ACEPTADO"],
        ["RF-13", "Liberación de Puerto", "Desvinculación de cliente y restitución de puerto a estado Libre con recálculo dinámico. Prohibido a técnicos (HTTP 403).", "ACT-01\nACT-02", "E: ID de puerto\nS: Puerto Libre", "Alta", "ACEPTADO"],
        ["RF-14", "Cambio Técnico de Estado", "Asignación manual de condición operativa: Dañado, En Mantenimiento, Reservado o Libre para impedir altas indebidas.", "ACT-01\nACT-02", "E: Puerto, nuevo estado\nS: Estado modificado", "Media", "ACEPTADO"]
    ]
    create_styled_table(doc, headers_rf, data_m4, widths_rf)

    # Modulo 5
    add_subsection_header(doc, "Módulo 5: Padrón y Expediente de Clientes Abonados")
    data_m5 = [
        ["RF-15", "Directorio de Clientes", "Vista tabular de todos los abonados con código de cliente, nombre, NAP, puerto, marca ONT, MAC, dBm y domicilio físico.", "Todos", "E: Solicitud de clientes\nS: Padrón paginado", "Alta", "ACEPTADO"],
        ["RF-16", "Búsqueda y Filtrado", "Búsqueda reactiva en vivo por nombre, código, MAC o calle, con filtro por fabricante ONT (ZTE, Huawei, V-SOL, TP-Link).", "Todos", "E: Filtro / texto\nS: Clientes filtrados", "Media", "ACEPTADO"],
        ["RF-17", "Edición de Expediente", "Actualización de datos del cliente (nombre, domicilio, ONT, MAC y atenuación calculada). Restringido a técnicos (HTTP 403).", "ACT-01\nACT-02", "E: ID cliente, cambios\nS: Registro actualizado", "Media", "ACEPTADO"]
    ]
    create_styled_table(doc, headers_rf, data_m5, widths_rf)

    # Modulo 6
    add_subsection_header(doc, "Módulo 6: Cartografía Interactiva y Sistema GIS")
    data_m6 = [
        ["RF-18", "Visor Cartográfico Leaflet", "Mapa interactivo OpenStreetMap / Leaflet centrado en la red de San José del Rincón con control de zoom, capas y marcadores.", "Todos", "E: Coordenadas iniciales\nS: Mapa interactivo", "Alta", "ACEPTADO"],
        ["RF-19", "Marcadores Semánticos", "Representación cartográfica de cajas NAP con pines identificadores según nivel de saturación: disponible, preventivo y saturado.", "Todos", "E: Cajas georreferenciadas\nS: Marcadores activos", "Alta", "ACEPTADO"],
        ["RF-20", "Trazado Vectorial de Red", "Visualización de polilíneas de cables troncales (48 hilos), derivaciones, mufas herméticas IP68 y postes CFE/propuestos.", "Todos", "E: Coordenadas rutas\nS: Capas de planta ext.", "Media", "ACEPTADO"]
    ]
    create_styled_table(doc, headers_rf, data_m6, widths_rf)

    # Modulo 7
    add_subsection_header(doc, "Módulo 7: Operación Offline-First y Soporte Móvil en Campo")
    data_m7 = [
        ["RF-21", "Almacén Local IndexedDB", "Persistencia de topología de cajas NAP, puertos y coordenadas en base de datos local Dexie.js para consulta sin internet.", "ACT-03\nACT-02", "E: Datos de sesión\nS: Caché disponible", "Alta", "ACEPTADO"],
        ["RF-22", "Encolamiento Offline", "Encolamiento transaccional de altas y calibraciones sin datos celulares en cola pending_mutations con aviso en UI.", "ACT-03", "E: Transacción en campo\nS: Mutación encolada", "Alta", "ACEPTADO"],
        ["RF-23", "Sincronización Automática", "Detección del evento online del navegador y despacho secuencial de mutaciones pendientes hacia el backend central.", "Backend\nApp Móvil", "E: Evento de red online\nS: Base sincronizada", "Alta", "ACEPTADO"],
        ["RF-24", "Sincronización Manual", "Botón con contador numérico en barra superior (ej. Sync (2)) para forzar envío de mutaciones en demanda del usuario.", "Todos", "E: Clic en botón Sync\nS: Despacho forzado", "Media", "ACEPTADO"]
    ]
    create_styled_table(doc, headers_rf, data_m7, widths_rf)

    # Modulo 8
    add_subsection_header(doc, "Módulo 8: Generación y Descarga de Reportes Ejecutivos")
    data_m8 = [
        ["RF-25", "Generación Reporte PDF", "Generación en tiempo real de documento PDF formal con membrete corporativo, fecha/hora y central emisora con PDFKit.", "ACT-01\nACT-02", "E: Clic en exportar\nS: Archivo PDF binario", "Alta", "ACEPTADO"],
        ["RF-26", "Tabla Ejecutiva Saturación", "Reporte PDF con tabla consolidada de cajas NAP, puertos libres, ocupados, dictamen y porcentaje global de red.", "ACT-01\nACT-02", "E: Consolidado de red\nS: Tabla en PDF", "Alta", "ACEPTADO"],
        ["RF-27", "Directorio Clientes en PDF", "Listado impreso en PDF con clientes conectados, NAP, puerto, modelo ONT, MAC y atenuación óptica estimada (dBm).", "ACT-01\nACT-02", "E: Catálogo de clientes\nS: Padrón en PDF", "Media", "ACEPTADO"]
    ]
    create_styled_table(doc, headers_rf, data_m8, widths_rf)

    add_section_header(doc, "5. TABLAS DE REQUERIMIENTOS NO FUNCIONALES (ISO/IEC 25010)")
    headers_rnf = ["Código", "Categoría ISO 25010", "Parámetro / Métrica", "Especificación Técnica Aprobada", "Dictamen"]
    widths_rnf = [0.8, 1.2, 1.2, 2.74, 0.4]

    data_rnf = [
        ["RNF-01", "Seguridad", "HTTPS / TLS 1.3", "Todo el tráfico entre cliente y API REST viaja encriptado punto a punto con certificados válidos.", "ACEPTADO"],
        ["RNF-02", "Seguridad", "bcrypt (Salt >= 10)", "Almacenamiento irreversible de claves de usuario; prohibido estrictamente texto plano en BD.", "ACEPTADO"],
        ["RNF-03", "Seguridad", "Stateless JWT (24h)", "Sesiones validadas mediante firma criptográfica con secreto de servidor JWT_SECRET y caducidad de 24h.", "ACEPTADO"],
        ["RNF-04", "Seguridad", "Zod Validation 100%", "Esquemas Zod en backend validando UUIDs, coordenadas y regex MAC: ^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$.", "ACEPTADO"],
        ["RNF-05", "Integridad ACID", "Atomicidad PostgreSQL", "Asignaciones y liberaciones bajo transacciones atómicas; ante cualquier error se aplica rollback total.", "ACEPTADO"],
        ["RNF-06", "Concurrencia", "SELECT FOR UPDATE", "Bloqueo pesimista de fila sobre puerto NAP durante asignación; elimina condiciones de carrera (HTTP 409).", "ACEPTADO"],
        ["RNF-07", "Consistencia", "FK y UNIQUE Estricto", "Restricción 1:1 estricta cliente-puerto (clients.id_puerto_nap UNIQUE) y en [id_nap, indice_puerto].", "ACEPTADO"],
        ["RNF-08", "Rendimiento", "Latencia < 250 ms", "Consultas de lectura de inventario, cajas NAP y clientes responden en menos de 250 ms en condiciones normales.", "ACEPTADO"],
        ["RNF-09", "Rendimiento", "Streaming doc.pipe", "Generación de PDF en flujo continuo sin almacenar archivos temporales pesados en disco del servidor.", "ACEPTADO"],
        ["RNF-10", "Rendimiento", "60 FPS en Leaflet", "Renderizado fluido de capas vectoriales, postes y marcadores NAP sin saturación de memoria en dispositivos móviles.", "ACEPTADO"],
        ["RNF-11", "Disponibilidad", "Offline-First (100%)", "Cuadrillas pueden consultar mapa y datos técnicos almacenados en IndexedDB aun en zonas sin cobertura celular.", "ACEPTADO"],
        ["RNF-12", "Resiliencia", "Cero Pérdida Local", "Mutaciones encoladas en pending_mutations persisten ante reinicio del equipo o cierre del navegador.", "ACEPTADO"],
        ["RNF-13", "Usabilidad", "PWA Manifest y SW", "Manifest manifest.json, iconos corporativos (192 y 512px) y Service Worker para instalación como app nativa.", "ACEPTADO"],
        ["RNF-14", "Usabilidad", "Responsive (360px a 4K)", "Adaptabilidad: matriz de 4 columnas en teléfonos móviles y 8 columnas en monitores de centro de control.", "ACEPTADO"],
        ["RNF-15", "Accesibilidad", "WCAG 2.1 AA / Dark Mode", "Alto contraste visual para luz solar en calle y tema oscuro para turnos nocturnos en centro de control.", "ACEPTADO"],
        ["RNF-16", "Mantenibilidad", "TypeScript 100%", "Frontend React y Backend Node.js con tipado estático estricto y modelos de interfaz compartidos.", "ACEPTADO"],
        ["RNF-17", "Despliegue", "Docker / Compose", "Empaquetamiento desacoplado para PostgreSQL, API Express y Frontend Nginx reproducible en cualquier OS.", "ACEPTADO"],
        ["RNF-18", "Escalabilidad", "Cloud Serverless / PaaS", "Arquitectura compatible con base de datos en Supabase/Neon, API en Render/Railway y Frontend en Vercel.", "ACEPTADO"]
    ]
    create_styled_table(doc, headers_rnf, data_rnf, widths_rnf)

    add_section_header(doc, "6. MATRIZ DE TRAZABILIDAD Y PERMISOS POR ROL (RBAC)")
    headers_mat = ["Operación / Acción del Sistema", "Requerimiento", "Admin", "Soporte", "Técnico", "Rechazo HTTP"]
    widths_mat = [2.2, 0.8, 0.7, 0.7, 0.7, 1.24]
    data_mat = [
        ["Iniciar sesión y validar credenciales", "RF-01", "Autorizado", "Autorizado", "Autorizado", "401 Unauthorized"],
        ["Alternar rol en evaluación demo", "RF-03", "Autorizado", "Autorizado", "Autorizado", "No aplica"],
        ["Visualizar mapa y cajas NAP", "RF-09, RF-18", "Autorizado", "Autorizado", "Autorizado", "401 Unauthorized"],
        ["Registrar nueva caja NAP en red", "RF-08", "Autorizado", "Autorizado", "Denegado", "403 Forbidden"],
        ["Calibrar coordenadas GPS de caja", "RF-10", "Autorizado", "Autorizado", "Autorizado", "401 Unauthorized"],
        ["Visualizar matriz de 16 puertos", "RF-11", "Autorizado", "Autorizado", "Autorizado", "401 Unauthorized"],
        ["Asignar nuevo abonado a puerto libre", "RF-12", "Autorizado", "Autorizado", "Autorizado", "409 si colisiona"],
        ["Liberar puerto ocupado (desvincular)", "RF-13", "Autorizado", "Autorizado", "Denegado", "403 Forbidden"],
        ["Marcar puerto Dañado / Mantenimiento", "RF-14", "Autorizado", "Autorizado", "Denegado", "403 Forbidden"],
        ["Consultar padrón de clientes", "RF-15, RF-16", "Autorizado", "Autorizado", "Autorizado", "401 Unauthorized"],
        ["Editar expediente de abonado", "RF-17", "Autorizado", "Autorizado", "Denegado", "403 Forbidden"],
        ["Operación offline y encolamiento", "RF-21, RF-22", "Autorizado", "Autorizado", "Autorizado", "No aplica"],
        ["Generar y descargar reporte PDF", "RF-25, RF-26", "Autorizado", "Autorizado", "Denegado", "403 Forbidden"],
        ["Administrar cuentas de usuarios", "RF-04", "Autorizado", "Denegado", "Denegado", "403 Forbidden"]
    ]
    create_styled_table(doc, headers_mat, data_mat, widths_mat)

    add_section_header(doc, "7. CLÁUSULAS DE CONFORMIDAD Y CONTROL DE CAMBIOS")
    add_body_paragraph(doc, "PRIMERA (CONGELAMIENTO DE ALCANCE): Con la suscripción de esta acta, la especificación de requerimientos de software queda congelada como línea base formal del proyecto. Cualquier requerimiento adicional deberá ser propuesto mediante una Solicitud de Cambio de Alcance (RFC) y requerirá acuerdo unánime de las partes.")
    add_body_paragraph(doc, "SEGUNDA (CRITERIOS DE AUDITORÍA): Las pruebas de aceptación final y liberación en producción tomarán como único marco de referencia las tablas aquí autorizadas.")
    add_body_paragraph(doc, "TERCERA (VALIDEZ ACADÉMICA Y LABORAL): El presente documento surte efectos plenos para la acreditación de la Residencia Profesional en la UMB y como memoria de especificación técnica para GPON TELECOM S.A. de C.V.")

    add_signature_block(doc)

    out_path = os.path.abspath("docs/Acta_Conformidad_Requerimientos_GPON.docx")
    doc.save(out_path)
    print(f"Documento 1 generado con éxito (B/N): {out_path}")

# ==============================================================================
# GENERATE DOCUMENT 2: ACTA DE DISEÑO UI/UX, ACCESIBILIDAD Y BASE DE DATOS - B/N
# ==============================================================================
def generate_doc_design():
    doc = docx.Document()
    add_header_banner(
        doc,
        folio="ACTA-CONF-DSN-2026-002",
        title_acta="ACTA DE CONFORMIDAD Y APROBACIÓN DE DISEÑO DE INTERFAZ (UI/UX), ACCESIBILIDAD Y ARQUITECTURA DE DATOS",
        subtitle="Sistema de Inventario y Mapeo Lógico GPON / FTTx — GPON TELECOM S.A. de C.V."
    )

    add_section_header(doc, "1. DATOS GENERALES Y COMPARECIENTES")
    add_body_paragraph(doc, "En las instalaciones de GPON TELECOM S.A. de C.V., en el Municipio de San José del Rincón, Estado de México, siendo las 11:30 horas del día 13 de octubre de 2026, se constituyen las partes interesadas:")

    headers_comp = ["Rol en el Proyecto", "Nombre Completo", "Cargo / Dependencia", "Identificación / Cédula"]
    data_comp = [
        ["Diseñador UI/UX y Desarrollador", "C. Mauricio Nolazco Lonjino", "Residente de Ing. en Sistemas Computacionales", "Matrícula UMB: 13SC161"],
        ["Asesor Externo (Empresa)", "L.I.A. Oscar Isaac Mendoza García", "Asesor Técnico y Jefe de Proyecto de Software", "Céd. Prof. 8492019 / GPON: OP-01"],
        ["Asesor Interno (Académico)", "I.S.C. Leonardo Becerril Sánchez", "Docente / Asesor de Residencia Profesional (UMB)", "Céd. Prof. 7102941 / UMB-DEP-ISC"],
        ["Representante Empresarial", "Ing. Carlos Mendoza", "Director de Operaciones y Redes GPON TELECOM", "R.F.C.: GTE-180412-K71"]
    ]
    create_styled_table(doc, headers_comp, data_comp, [1.5, 1.7, 1.84, 1.3])

    add_section_header(doc, "2. OBJETO DEL ACTA Y DECLARACIONES DE DISEÑO")
    add_body_paragraph(doc, "El presente documento formaliza la Aprobación, Validación y Conformidad del Diseño de Interfaz de Usuario (UI), Experiencia de Usuario (UX), Accesibilidad Visual WCAG 2.1 y la Arquitectura del Modelo Relacional de Datos en PostgreSQL.")
    add_body_paragraph(doc, "1. La Empresa certifica que la maquetación visual implementada en Figma y trasladada a producción en la ruta /mapa cumple con la ergonomía necesaria para la operación en campo y reproduce fielmente la topología de la recomendación ITU-T G.984.")
    add_body_paragraph(doc, "2. El Asesor Académico valida que el modelo de datos respeta la Tercera Forma Normal (3FN), previene la redundancia y garantiza la atomicidad requerida.")
    add_body_paragraph(doc, "3. El Residente certifica la plena correspondencia entre los componentes de diseño aprobados y el código en producción.")

    add_section_header(doc, "3. TABLA 1: TOKENS Y SISTEMA DE DISEÑO (DESIGN SYSTEM TOKENS)")
    headers_tok = ["Categoría de Token", "Propiedad / Token", "Valor Técnico Oficial", "Comportamiento y Propósito en la UI"]
    widths_tok = [1.2, 1.3, 1.74, 2.1]
    data_tok = [
        ["Tipografía", "Fuente Primaria", "Inter, SF Pro Display, system-ui", "Alta legibilidad técnica en pantallas móviles y monitores de campo."],
        ["Tipografía", "Escala de Tamaños", "12px (Caption), 14px (Body), 16px (Sub), 20px (H2), 28px (H1)", "Jerarquía visual estricta para lecturas rápidas de puertos y potencias."],
        ["Espaciado y Grid", "Sistema Espacial", "Rejilla base de 8px (4, 8, 12, 16, 24, 32, 48px)", "Alineación uniforme y consistencia visual en todas las tarjetas de red."],
        ["Bordes y Radios", "Border Radius", "rounded-lg (8px), rounded-xl (12px), rounded-full", "Acabados suaves, ergonómicos y modernos en modales y botones táctiles."],
        ["Superficie y Fondo", "Fondo Base de App", "#F8FAFC (Slate-50) / #EEF3F8 (Ice Blue)", "Disminución de reflejos y fatiga visual bajo sol directo en vía pública."],
        ["Superficie y Fondo", "Tarjetas y Paneles", "#FFFFFF con borde 1px #E2E8F0 y sombras suaves", "Contenedores modulares limpios para mapas, matrices y formularios."],
        ["Superficie y Fondo", "Texto Principal", "#0F172A (Slate-900) con contraste 17.85:1", "Máxima legibilidad en títulos de cajas NAP y cabeceras."],
        ["Superficie y Fondo", "Texto Secundario", "#334155 (Slate-700) y #64748B (Slate-500)", "Rótulos auxiliares, coordenadas geodésicas y números de serie."],
        ["Identidad Corporativa", "Color Primario", "#0284C7 (Sky-600) / #0369A1 (Sky-700)", "Color representativo de telecomunicaciones, fibra óptica y cloud."],
        ["Identidad Corporativa", "Color Secundario", "#4F46E5 (Índigo-600) / #7C3AED (Púrpura-600)", "Distinción de perfiles administrativos y navegación de rutas."],
        ["Semáforo GPON", "Libre (Disponible)", "Fondo #DCFCE7, Borde #86EFAC, Texto #047857, LED #10B981", "Disponibilidad inmediata para acometidas de nuevos clientes (<80%)."],
        ["Semáforo GPON", "Ocupado (Activo)", "Fondo #E0F2FE, Borde #7DD3FC, Texto #0369A1, LED #0284C7", "Abonado activo conectado 1:1 con módem ONT."],
        ["Semáforo GPON", "Reserva (Alerta)", "Fondo #FEF3C7, Borde #FCD34D, Texto #B45309, LED #F59E0B", "Apartado preventivo o caja en alerta de capacidad (80-99%)."],
        ["Semáforo GPON", "Dañado (Crítico)", "Fondo #FEE2E2, Borde #FCA5A5, Texto #B91C1C, LED #EF4444", "Puerto con fallo en acoplador SC o caja saturada al 100%."],
        ["Vector de Fibra", "Trazado Troncal", "Trazo vectorial #8D5B4C con grosor 4px", "Representación geográfica de cable autosoportado de 48 fibras."]
    ]
    create_styled_table(doc, headers_tok, data_tok, widths_tok)

    add_section_header(doc, "4. TABLA 2: MATRIZ MAESTRA DE PRUEBAS DE CONTRASTE Y ACCESIBILIDAD VISUAL (WCAG 2.1)")
    headers_wcag = ["Zona de Interfaz", "Elemento Evaluado", "Color Texto", "Color Fondo", "Ratio", "Nivel AA", "Nivel AAA", "Diagnóstico Oficial"]
    widths_wcag = [1.1, 1.4, 0.7, 0.7, 0.54, 0.5, 0.6, 0.8]
    data_wcag = [
        ["1. Barra RBAC", "Botón Admin (Activo)", "#FFFFFF", "#4F46E5", "6.29:1", "Cumple", "Cumple", "Aprobado AA / AAA"],
        ["1. Barra RBAC", "Botón Soporte/Técnico", "#334155", "#FFFFFF", "10.35:1", "Cumple", "Cumple", "Excelente (AAA)"],
        ["1. Barra RBAC", "Badge Datos Prueba", "#0369A1", "#F0F9FF", "5.57:1", "Cumple", "Cumple", "Aprobado AA / AAA"],
        ["1. Barra RBAC", "Pastilla Demo", "#FFFFFF", "#0284C7", "4.10:1", "Cumple", "No aplica", "Aprobado AA (UI)"],
        ["2. Barra Navbar", "Pestaña Mapa (Activa)", "#0284C7", "#E0F2FE", "3.57:1", "Cumple", "No aplica", "Aprobado AA (UI)"],
        ["2. Barra Navbar", "Pestañas Inactivas", "#334155", "#FFFFFF", "10.35:1", "Cumple", "Cumple", "Excelente (AAA)"],
        ["2. Barra Navbar", "Botón APK (Descarga)", "#FFFFFF", "#059669", "3.77:1", "Cumple", "No aplica", "Aprobado AA (UI)"],
        ["2. Barra Navbar", "Badge En Línea", "#047857", "#ECFDF5", "5.21:1", "Cumple", "Cumple", "Aprobado AA / AAA"],
        ["2. Barra Navbar", "Tag Rol ADMIN", "#6D28D9", "#EDE9FE", "5.98:1", "Cumple", "Cumple", "Aprobado AA / AAA"],
        ["3. Barra Acciones", "Botón Troncal / Ramal", "#7E22CE", "#FAF5FF", "6.51:1", "Cumple", "Cumple", "Aprobado AA / AAA"],
        ["3. Barra Acciones", "Botón Mufa (Empalme)", "#92400E", "#FEF3C7", "6.37:1", "Cumple", "Cumple", "Aprobado AA / AAA"],
        ["3. Barra Acciones", "Botón Poste (Soporte)", "#BE123C", "#FFE4E6", "5.24:1", "Cumple", "Cumple", "Aprobado AA / AAA"],
        ["3. Barra Acciones", "Botón Ruta a Caja", "#4338CA", "#EEF2FF", "7.07:1", "Cumple", "Cumple", "Excelente (AAA)"],
        ["3. Barra Acciones", "Botón Nueva Caja NAP", "#FFFFFF", "#0284C7", "4.10:1", "Cumple", "No aplica", "Aprobado AA (UI)"],
        ["3. Barra Acciones", "Botón Bitácora Km", "#047857", "#FFFFFF", "5.48:1", "Cumple", "Cumple", "Aprobado AA / AAA"],
        ["4. Panel NAP", "Título NAP-SJR-01", "#0F172A", "#FFFFFF", "17.85:1", "Cumple", "Cumple", "Excelente (AAA)"],
        ["4. Panel NAP", "Badge Saturación 75%", "#15803D", "#DCFCE7", "4.57:1", "Cumple", "Cumple", "Aprobado AA / AAA"],
        ["4. Panel NAP", "Badge 1 Reservado", "#B45309", "#FEF3C7", "4.51:1", "Cumple", "Cumple", "Aprobado AA / AAA"],
        ["4. Panel NAP", "Botón Ruta Llegada", "#4338CA", "#EEF2FF", "7.07:1", "Cumple", "Cumple", "Excelente (AAA)"],
        ["4. Panel NAP", "Botón Eliminar Caja", "#B91C1C", "#FEE2E2", "5.30:1", "Cumple", "Cumple", "Aprobado AA / AAA"],
        ["5. Matriz Puertos", "Puerto Ocupado", "#0369A1", "#E0F2FE", "5.17:1", "Cumple", "Cumple", "Aprobado AA / AAA"],
        ["5. Matriz Puertos", "Puerto Libre", "#047857", "#DCFCE7", "4.99:1", "Cumple", "Cumple", "Aprobado AA / AAA"],
        ["5. Matriz Puertos", "Puerto Reservado", "#B45309", "#FEF3C7", "4.51:1", "Cumple", "Cumple", "Aprobado AA / AAA"],
        ["5. Matriz Puertos", "Puerto Dañado", "#B91C1C", "#FEE2E2", "5.30:1", "Cumple", "Cumple", "Aprobado AA / AAA"],
        ["6. Asistente", "Botón Asistente GPON", "#FFFFFF", "#2563EB", "5.17:1", "Cumple", "Cumple", "Aprobado AA / AAA"]
    ]
    create_styled_table(doc, headers_wcag, data_wcag, widths_wcag)

    add_section_header(doc, "5. TABLA 3: CATÁLOGO DE PANTALLAS, VISTAS Y COMPONENTES MAQUETADOS")
    headers_vistas = ["Código", "Pantalla / Módulo", "Descripción de Componentes Visuales y UX", "Dictamen"]
    widths_vistas = [0.8, 1.6, 3.04, 0.9]
    data_vistas = [
        ["UI-01", "Visor Cartográfico GIS", "Mapa Leaflet interactivo a pantalla dividida (70/30). Controles de zoom, capas calle/satelital, trazos de fibra troncal, postes CFE, mufas y pines de colores.", "APROBADO"],
        ["UI-02", "Panel Lateral de Caja NAP", "Drawer lateral deslizable de 30% de ancho con cabecera de caja, porcentaje dinámico de ocupación, barra de progreso con gradiente y coordenadas geográficas.", "APROBADO"],
        ["UI-03", "Matriz Gráfica 16 Puertos", "Chasis matricial interactivo con cuadrícula de 8 columnas (escritorio) o 4 columnas (móvil). Indicador de estado por conector SC-APC y tooltip de cliente.", "APROBADO"],
        ["UI-04", "Modal de Asignación Atómica", "Ventana modal emergente con formulario validado en tiempo real: número de cliente, nombre, selector de marca ONT, máscara MAC y potencia óptica en dBm.", "APROBADO"],
        ["UI-05", "Modal de Calibración GPS", "Diálogo con lectura de sensor GPS del teléfono móvil en tiempo real, botón 'Obtener Coordenadas Actuales' y previsualización geodésica inmediata.", "APROBADO"],
        ["UI-06", "Bitácora de Kilometraje", "Modal y tabla de registro de traslados de cuadrillas: odómetro inicial, final, cálculo de ruta GIS geodésica, vehículo, destino y motivo de traslado.", "APROBADO"],
        ["UI-07", "Directorio de Abonados", "Vista de tabla corporativa con buscador en vivo, filtro por fabricante ONT (ZTE, Huawei, V-SOL, TP-Link), paginación dinámica y acciones de edición.", "APROBADO"],
        ["UI-08", "Reportes Ejecutivos PDF", "Panel con filtros de fecha, botón de descarga directa en streaming y previsualización de tabla resumen de saturación global de la red FTTx.", "APROBADO"],
        ["UI-09", "Indicador y Cola Offline PWA", "Banner que avisa 'Modo Desconectado', pastilla con contador de mutaciones pendientes y botón de sincronización forzada al restablecer red.", "APROBADO"]
    ]
    create_styled_table(doc, headers_vistas, data_vistas, widths_vistas)

    add_section_header(doc, "6. TABLA 4: MATRIZ DE ADAPTABILIDAD RESPONSIVA (DESKTOP VS. MOBILE)")
    headers_resp = ["Criterio de Adaptabilidad", "Escritorio / Monitor NOC (1440 x 960 px)", "Móvil Cuadrilla en Campo (390 x 844 px)", "Dictamen"]
    widths_resp = [1.5, 2.1, 2.14, 0.6]
    data_resp = [
        ["Disposición General", "Pantalla dividida simultánea: 70% Mapa GIS + 30% Panel Lateral fijo.", "Mapa a pantalla completa; panel lateral como hoja inferior colapsable (Bottom Sheet).", "CONFORME"],
        ["Matriz de Puertos NAP", "Rejilla de 8 columnas x 2 filas reproduciendo chasis físico horizontal.", "Rejilla de 4 columnas x 4 filas optimizada para uso táctil con una sola mano.", "CONFORME"],
        ["Barra de Acciones", "Barra horizontal completa con botones de texto agrupados.", "Botones compactos de acceso rápido con menú desplegable deslizable.", "CONFORME"],
        ["Área Táctil de Botones", "Padding estándar de 32 a 40 px para cursor de mouse.", "Botones táctiles ampliados con área mínima de contacto de 48 x 48 px.", "CONFORME"],
        ["Navegación", "Pestañas horizontales visibles en la barra superior Navbar.", "Barra inferior fija (Bottom Navigation Bar) al alcance del pulgar.", "CONFORME"]
    ]
    create_styled_table(doc, headers_resp, data_resp, widths_resp)

    add_section_header(doc, "7. TABLA 5: ESPECIFICACIÓN ARQUITECTÓNICA DE TABLAS DE BASE DE DATOS (POSTGRESQL)")
    headers_bd = ["#", "Tabla en BD", "Descripción de Entidad", "Clave Primaria", "Claves Foráneas (FK)", "Reglas de Integridad y Lógica de Negocio", "Dictamen"]
    widths_bd = [0.35, 1.15, 1.4, 0.9, 1.1, 1.04, 0.4]
    data_bd = [
        ["1", "usuarios", "Cuentas de usuario y control RBAC.", "id_usuario (UUID)", "Ninguna", "credencial_acceso UNIQUE. Clave encriptada bcrypt >= 10 salt. Rol: Admin, Soporte, Tecnico.", "APROBADO"],
        ["2", "odf_panels", "Distribuidor Óptico Central de cabecera.", "id_odf (UUID)", "Ninguna", "Capacidad: 48 hilos pasantes. Coordenadas geodésicas en campo JSONB.", "APROBADO"],
        ["3", "pon_ports", "Puertos PON de tarjetas en chasis OLT.", "id_puerto_pon (UUID)", "id_odf -> odf_panels", "Split nominal 1:64 ONTs. Potencia Tx emitida: +4.5 a +5.2 dBm.", "APROBADO"],
        ["4", "fiber_threads", "Hilos de fibra en cable troncal.", "id_hilo (UUID)", "id_odf_origen -> odf_panels", "1 a 48 hilos. Código TIA-598. Estados: Activo, Reserva, Muerto.", "APROBADO"],
        ["5", "nap_boxes", "Cajas terminales de distribución en campo.", "id_nap (UUID)", "id_puerto_pon -> pon_ports", "identificador UNIQUE (NAP-SJR-01). 16 puertos. Coordenadas JSONB.", "APROBADO"],
        ["6", "nap_ports", "Puertos físicos acopladores SC-APC.", "id_puerto (UUID)", "id_nap -> nap_boxes", "UNIQUE(id_nap, indice_puerto). Estados: Libre, Ocupado, Dañado, etc.", "APROBADO"],
        ["7", "clients", "Padrón de abonados con servicio activo.", "id_cliente (UUID)", "id_puerto_nap -> nap_ports", "numero_cliente UNIQUE, id_puerto_nap UNIQUE 1:1 estricto, regex MAC.", "APROBADO"],
        ["8", "mileage_logs", "Bitácora de traslados de cuadrillas.", "id (UUID)", "id_nap -> nap_boxes (Opcional)", "Odómetro inicial/final y cálculo geodésico de ruta por orden de trabajo.", "APROBADO"],
        ["9", "infrastructure_postes", "Postes de tendido aéreo (CFE/propios).", "id_poste (VARCHAR)", "Ninguna (Capa GIS)", "Tipo: poste_propuesto o poste_cfe. Coordenadas {lat, lng} JSONB.", "APROBADO"],
        ["10", "infrastructure_mufas", "Cierres de empalme herméticos IP68.", "id_empalme (VARCHAR)", "Ninguna (Puntos empalme)", "Capacidad: 48 fusiones. Sello torpedo hermético contra intemperie.", "APROBADO"],
        ["11", "infrastructure_routes", "Rutas vectoriales de fibra troncal/ramal.", "id_ruta (VARCHAR)", "Ninguna (Polilíneas)", "Tipo: troncal (48 hilos) o distribucion. Array de vértices [[lat, lng]].", "APROBADO"]
    ]
    create_styled_table(doc, headers_bd, data_bd, widths_bd)

    add_section_header(doc, "8. CLÁUSULAS DE CONFORMIDAD Y CONGELAMIENTO DE DISEÑO (DESIGN FREEZE)")
    add_body_paragraph(doc, "PRIMERA (LÍNEA BASE DE DISEÑO): Se aprueba unánimemente el sistema de diseño, la paleta cromática, la maquetación responsiva y la arquitectura relacional de base de datos, declarando formalmente el Congelamiento de Línea Base de Diseño (Design Freeze).")
    add_body_paragraph(doc, "SEGUNDA (CERTIFICACIÓN DE ACCESIBILIDAD): Se constata que la interfaz en producción supera los umbrales de contraste de la norma internacional W3C WCAG 2.1 Nivel AA en todos los elementos interactivos y Nivel AAA en componentes clave de lectura.")
    add_body_paragraph(doc, "TERCERA (MODELO RELACIONAL ACID): Se valida la consistencia del modelo de datos de 11 tablas, garantizando relaciones 1:1 estrictas de cliente a puerto y soporte transaccional sin colisiones concurrentes.")

    add_signature_block(doc)

    out_path = os.path.abspath("docs/Acta_Conformidad_Diseno_y_Arquitectura_GPON.docx")
    doc.save(out_path)
    print(f"Documento 2 generado con éxito (B/N): {out_path}")

if __name__ == "__main__":
    generate_doc_requirements()
    generate_doc_design()
    print("Ambas actas en Word blanco y negro han sido generadas exitosamente!")
