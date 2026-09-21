import os
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter
from PIL import Image, ImageDraw, ImageFont

# -------------------------------------------------------------
# DATA DEFINITIONS
# -------------------------------------------------------------
ACTIVITIES_DATA = [
    (1, "Inmersión técnica, investigación de conceptos básicos y normativa operativa de redes GPON/FTTx (Hardware, ODF, splitters y cajas NAP).",
     "01/09/2026", "08/09/2026", [1, 2], "COMPLETADA", 100),
    (2, "Levantamiento y especificación formal de requerimientos funcionales y no funcionales (concurrencia técnica y resiliencia de red).",
     "09/09/2026", "13/09/2026", [2], "COMPLETADA", 100),
    (3, "Diseño de la arquitectura del sistema web (cliente-servidor) y selección definitiva de herramientas y librerías de desarrollo.",
     "14/09/2026", "18/09/2026", [3], "COMPLETADA", 100),
    (4, "Modelado de la base de datos relacional (diagrama entidad-relación para ODFs, puertos NAP, hilos de fibra y clientes).",
     "19/09/2026", "24/09/2026", [3, 4], "EN CURSO (20-Sep)", 40),
    (5, "Diseño de wireframes y prototipos visuales de interfaces responsivas optimizadas para navegación móvil en campo.",
     "25/09/2026", "30/09/2026", [4, 5], "PROGRAMADA", 0),
    (6, "Creación del esquema de base de datos, configuración de relaciones, llaves foráneas, índices y restricciones de integridad.",
     "01/10/2026", "05/10/2026", [5], "PROGRAMADA", 0),
    (7, "Programación del módulo backend de autenticación, control de accesos y gestión de perfiles de usuario.",
     "06/10/2026", "10/10/2026", [6], "PROGRAMADA", 0),
    (8, "Desarrollo de la API REST centralizada para el inventario y gestión de activos de red (cajas NAP, ODF y clientes vinculados).",
     "11/10/2026", "24/10/2026", [7, 8], "PROGRAMADA", 0),
    (9, "Configuración de transacciones en base de datos para soporte de múltiples actualizaciones simultáneas sin colisiones.",
     "25/10/2026", "31/10/2026", [9], "PROGRAMADA", 0),
    (10, "Maquetación frontend de vistas tabulares y componentes base adaptados a dispositivos móviles de los técnicos.",
     "01/11/2026", "09/11/2026", [9, 10], "PROGRAMADA", 0),
    (11, "Construcción del módulo visual para el mapeo lógico simple de la red y trazado de conexiones de fibra óptica.",
     "10/11/2026", "18/11/2026", [11, 12], "PROGRAMADA", 0),
    (12, "Programación de formularios interactivos para el reporte y cambio en tiempo real del estado de puertos (libres, ocupados y dañados).",
     "19/11/2026", "27/11/2026", [12, 13], "PROGRAMADA", 0),
    (13, "Integración del frontend con la API REST y configuración de herramientas de gestión de estado para tolerar pérdidas de conexión móvil.",
     "28/11/2026", "08/12/2026", [13, 14, 15], "PROGRAMADA", 0),
    (14, "Pruebas de funcionamiento integral en entorno de desarrollo y validación de flujos de trabajo técnico.",
     "09/12/2026", "13/12/2026", [15], "PROGRAMADA", 0),
    (15, "Simulación de concurrencia técnica con múltiples peticiones simultáneas y depuración de código (corrección de bugs).",
     "14/12/2026", "17/12/2026", [16], "PROGRAMADA", 0),
    (16, "Elaboración de manuales técnicos, guía de usuario para técnicos de campo y documentación de la arquitectura.",
     "18/12/2026", "12/01/2027", [16, 17, 18, 19], "PROGRAMADA", 0),
    (17, "Empaquetado final del código fuente funcional, verificación de entregables y redacción del reporte de cierre de residencia profesional.",
     "13/01/2027", "17/01/2027", [20], "PROGRAMADA", 0),
]

WEEKS_HEADER = [
    ("SEM 1", "01-07 Sep", "SEP"),
    ("SEM 2", "08-14 Sep", "SEP"),
    ("SEM 3", "15-21 Sep", "SEP"), # CURRENT: 20 SEP
    ("SEM 4", "22-28 Sep", "SEP"),
    ("SEM 5", "29 Sep-05 Oct", "OCT"),
    ("SEM 6", "06-12 Oct", "OCT"),
    ("SEM 7", "13-19 Oct", "OCT"),
    ("SEM 8", "20-26 Oct", "OCT"),
    ("SEM 9", "27 Oct-02 Nov", "OCT"),
    ("SEM 10", "03-09 Nov", "NOV"),
    ("SEM 11", "10-16 Nov", "NOV"),
    ("SEM 12", "17-23 Nov", "NOV"),
    ("SEM 13", "24-30 Nov", "NOV"),
    ("SEM 14", "01-07 Dic", "DIC"),
    ("SEM 15", "08-14 Dic", "DIC"),
    ("SEM 16", "15-21 Dic", "DIC"),
    ("SEM 17", "22-28 Dic", "DIC"),
    ("SEM 18", "29 Dic-04 Ene", "ENE"),
    ("SEM 19", "05-11 Ene", "ENE"),
    ("SEM 20", "12-17 Ene", "ENE"),
]

# -------------------------------------------------------------
# 1. GENERATE EXCEL WORKBOOK
# -------------------------------------------------------------
def build_excel_cronograma():
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "Cronograma_Actividades"
    ws.views.sheetView[0].showGridLines = True

    # Styles
    font_title = Font(name="Arial", size=15, bold=True, color="1F4E24")
    font_sub = Font(name="Arial", size=10, bold=False, color="404040")
    font_header = Font(name="Arial", size=9, bold=True, color="000000")
    font_header_white = Font(name="Arial", size=9, bold=True, color="FFFFFF")
    font_body = Font(name="Arial", size=8.5, color="000000")
    font_status_comp = Font(name="Arial", size=8.5, bold=True, color="1B5E20")
    font_status_curr = Font(name="Arial", size=8.5, bold=True, color="B78103")
    font_status_prog = Font(name="Arial", size=8.5, bold=False, color="555555")

    fill_header_main = PatternFill(start_color="F2F2F2", end_color="F2F2F2", fill_type="solid")
    fill_month_sep = PatternFill(start_color="D9EAD3", end_color="D9EAD3", fill_type="solid")
    fill_month_oct = PatternFill(start_color="E2EFDA", end_color="E2EFDA", fill_type="solid")
    fill_month_nov = PatternFill(start_color="D9EAD3", end_color="D9EAD3", fill_type="solid")
    fill_month_dic = PatternFill(start_color="E2EFDA", end_color="E2EFDA", fill_type="solid")
    fill_month_ene = PatternFill(start_color="D9EAD3", end_color="D9EAD3", fill_type="solid")

    # Green fill matching image media_1789955789038.png
    fill_green_completed = PatternFill(start_color="00B050", end_color="00B050", fill_type="solid") # Solid bright green
    fill_green_current = PatternFill(start_color="00C853", end_color="00C853", fill_type="solid")   # Vibrant green for current
    fill_green_scheduled = PatternFill(start_color="66BB6A", end_color="66BB6A", fill_type="solid") # Standard planned green

    # Current week highlight column (Semana 3)
    fill_current_col_hdr = PatternFill(start_color="FFF3CD", end_color="FFF3CD", fill_type="solid")

    thin_border = Border(
        left=Side(style='thin', color='A0A0A0'),
        right=Side(style='thin', color='A0A0A0'),
        top=Side(style='thin', color='A0A0A0'),
        bottom=Side(style='thin', color='A0A0A0')
    )
    black_border = Border(
        left=Side(style='thin', color='000000'),
        right=Side(style='thin', color='000000'),
        top=Side(style='thin', color='000000'),
        bottom=Side(style='thin', color='000000')
    )

    # 1. Title Block
    ws.merge_cells("A1:Y1")
    ws["A1"] = "UNIVERSIDAD MEXIQUENSE DEL BICENTENARIO - UNIDAD DE ESTUDIOS SUPERIORES SAN JOSÉ DEL RINCÓN"
    ws["A1"].font = Font(name="Arial", size=11, bold=True, color="2E4B25")
    ws["A1"].alignment = Alignment(horizontal="center", vertical="center")

    ws.merge_cells("A2:Y2")
    ws["A2"] = "CRONOGRAMA DE ACTIVIDADES - RESIDENCIA PROFESIONAL"
    ws["A2"].font = font_title
    ws["A2"].alignment = Alignment(horizontal="center", vertical="center")

    ws.merge_cells("A3:Y3")
    ws["A3"] = "Proyecto: Sistema de Inventario y Mapeo Lógico de Redes GPON / FTTx | Empresa: GPON TELECOM S.A. de C.V."
    ws["A3"].font = font_sub
    ws["A3"].alignment = Alignment(horizontal="center", vertical="center")

    ws.merge_cells("A4:Y4")
    ws["A4"] = "Residente: Mauricio Nolazco Lonjino | Asesor: I.S.C. Leonardo Becerril Sánchez | CORTE DE AVANCE AL 20 DE SEPTIEMBRE DE 2026 (Semana 3)"
    ws["A4"].font = Font(name="Arial", size=9.5, bold=True, color="B71C1C")
    ws["A4"].alignment = Alignment(horizontal="center", vertical="center")

    # 2. Month Grouping Row (Row 6)
    ws.row_dimensions[6].height = 20
    ws.merge_cells("A6:E6")
    ws["A6"] = "DATOS GENERALES DE ACTIVIDAD"
    ws["A6"].font = font_header
    ws["A6"].alignment = Alignment(horizontal="center", vertical="center")
    ws["A6"].fill = fill_header_main

    # Months: Sep (S1-S4: Col F-I), Oct (S5-S9: Col J-N), Nov (S10-S13: Col O-R), Dic (S14-S17: Col S-V), Ene (S18-S20: Col W-Y)
    months_spans = [
        ("F6:I6", "SEPTIEMBRE 2026", fill_month_sep),
        ("J6:N6", "OCTUBRE 2026", fill_month_oct),
        ("O6:R6", "NOVIEMBRE 2026", fill_month_nov),
        ("S6:V6", "DICIEMBRE 2026", fill_month_dic),
        ("W6:Y6", "ENERO 2027", fill_month_ene),
    ]
    for span, m_text, m_fill in months_spans:
        ws.merge_cells(span)
        top_left = span.split(":")[0]
        ws[top_left] = m_text
        ws[top_left].font = font_header
        ws[top_left].alignment = Alignment(horizontal="center", vertical="center")
        ws[top_left].fill = m_fill

    # 3. Header Row (Row 7)
    ws.row_dimensions[7].height = 28
    headers = [
        ("A7", "N°", 5),
        ("B7", "ACTIVIDADES DEL ANTEPROYECTO", 48),
        ("C7", "INICIO", 11),
        ("D7", "TÉRMINO", 11),
        ("E7", "ESTADO AL 20-SEP", 16),
    ]
    for cell_id, text, width in headers:
        c = ws[cell_id]
        c.value = text
        c.font = font_header
        c.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
        c.fill = fill_header_main
        c.border = black_border
        col_letter = cell_id[0]
        ws.column_dimensions[col_letter].width = width

    for idx, (w_name, w_dates, m_grp) in enumerate(WEEKS_HEADER):
        col_idx = 6 + idx # Col F is 6
        col_letter = get_column_letter(col_idx)
        c = ws.cell(row=7, column=col_idx)
        c.value = f"{w_name}\n({w_dates})"
        c.font = Font(name="Arial", size=7.5, bold=True, color="000000" if idx != 2 else "B71C1C")
        c.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
        c.fill = fill_current_col_hdr if idx == 2 else fill_header_main
        c.border = black_border
        ws.column_dimensions[col_letter].width = 9.5

    # 4. Data Rows (Rows 8 to 24)
    for r_idx, (num, name, start_d, end_d, weeks, status, progress) in enumerate(ACTIVITIES_DATA):
        row_num = 8 + r_idx
        ws.row_dimensions[row_num].height = 24

        # Col A: N°
        cA = ws.cell(row=row_num, column=1, value=num)
        cA.font = font_body
        cA.alignment = Alignment(horizontal="center", vertical="center")
        cA.border = black_border

        # Col B: Activity Name
        cB = ws.cell(row=row_num, column=2, value=name)
        cB.font = font_body
        cB.alignment = Alignment(horizontal="left", vertical="center", wrap_text=True)
        cB.border = black_border

        # Col C: Inicio
        cC = ws.cell(row=row_num, column=3, value=start_d)
        cC.font = font_body
        cC.alignment = Alignment(horizontal="center", vertical="center")
        cC.border = black_border

        # Col D: Término
        cD = ws.cell(row=row_num, column=4, value=end_d)
        cD.font = font_body
        cD.alignment = Alignment(horizontal="center", vertical="center")
        cD.border = black_border

        # Col E: Estado
        cE = ws.cell(row=row_num, column=5, value=status)
        if "COMPLETADA" in status:
            cE.font = font_status_comp
            cE.fill = PatternFill(start_color="E8F5E9", end_color="E8F5E9", fill_type="solid")
        elif "EN CURSO" in status:
            cE.font = font_status_curr
            cE.fill = PatternFill(start_color="FFF8E1", end_color="FFF8E1", fill_type="solid")
        else:
            cE.font = font_status_prog
            cE.fill = PatternFill(start_color="FAFAFA", end_color="FAFAFA", fill_type="solid")
        cE.alignment = Alignment(horizontal="center", vertical="center")
        cE.border = black_border

        # Week Columns (F to Y)
        for w_idx in range(1, 21):
            col_idx = 5 + w_idx
            c_week = ws.cell(row=row_num, column=col_idx)
            c_week.border = black_border

            if w_idx in weeks:
                # Active week! Fill with green
                if "COMPLETADA" in status:
                    c_week.fill = fill_green_completed
                    c_week.value = "✓"
                    c_week.font = Font(name="Arial", size=9, bold=True, color="FFFFFF")
                    c_week.alignment = Alignment(horizontal="center", vertical="center")
                elif "EN CURSO" in status:
                    c_week.fill = fill_green_current
                    c_week.value = "●"
                    c_week.font = Font(name="Arial", size=10, bold=True, color="FFFFFF")
                    c_week.alignment = Alignment(horizontal="center", vertical="center")
                else:
                    c_week.fill = fill_green_scheduled
                    c_week.value = ""
            else:
                # Light vertical highlight on Week 3 (Current Date)
                if w_idx == 3:
                    c_week.fill = PatternFill(start_color="FFFDE7", end_color="FFFDE7", fill_type="solid")

    # 5. Summary Row (Row 25)
    ws.row_dimensions[25].height = 22
    ws.merge_cells("A25:D25")
    c_sum_lbl = ws["A25"]
    c_sum_lbl.value = "ESTADO GLOBAL DE AVANCE AL 20 DE SEPTIEMBRE DE 2026:"
    c_sum_lbl.font = Font(name="Arial", size=9.5, bold=True, color="000000")
    c_sum_lbl.alignment = Alignment(horizontal="right", vertical="center")

    c_sum_val = ws["E25"]
    c_sum_val.value = "3 Finalizadas | 1 En Curso | 13 Programadas"
    c_sum_val.font = Font(name="Arial", size=9, bold=True, color="1B5E20")
    c_sum_val.alignment = Alignment(horizontal="center", vertical="center")
    c_sum_val.fill = PatternFill(start_color="E8F5E9", end_color="E8F5E9", fill_type="solid")

    # Save
    excel_path = "docs/Cronograma_Actividades_Residencia_GPON_20Sep2026.xlsx"
    wb.save(excel_path)
    print(f"Excel workbook created at: {excel_path}")

# -------------------------------------------------------------
# 2. GENERATE HIGH-RES GANTT IMAGE (MATCHING USER'S PHOTO)
# -------------------------------------------------------------
def build_gantt_image():
    # Resolution 2400 x 1400
    img_w, img_h = 2400, 1420
    img = Image.new('RGB', (img_w, img_h), (255, 255, 255))
    draw = ImageDraw.Draw(img)

    try:
        font_title = ImageFont.truetype('arialbd.ttf', 36)
        font_sub = ImageFont.truetype('arial.ttf', 20)
        font_badge = ImageFont.truetype('arialbd.ttf', 20)
        font_hdr = ImageFont.truetype('arialbd.ttf', 16)
        font_act = ImageFont.truetype('arial.ttf', 16)
        font_week = ImageFont.truetype('arialbd.ttf', 13)
        font_date = ImageFont.truetype('arial.ttf', 11)
        font_check = ImageFont.truetype('arialbd.ttf', 15)
    except:
        font_title = ImageFont.load_default()
        font_sub = ImageFont.load_default()
        font_badge = ImageFont.load_default()
        font_hdr = ImageFont.load_default()
        font_act = ImageFont.load_default()
        font_week = ImageFont.load_default()
        font_date = ImageFont.load_default()
        font_check = ImageFont.load_default()

    # Colors matching photo media_1789955789038.png
    C_GREEN_COMP = (0, 176, 80)     # #00B050 Bright Green like photo
    C_GREEN_CURR = (0, 200, 83)     # #00C853 Bright Lime Green
    C_GREEN_PROG = (102, 187, 106)  # #66BB6A Medium Green
    C_BORDER = (0, 0, 0)            # Solid black borders like photo
    C_HDR_BG = (245, 245, 245)
    C_SEP_BG = (217, 234, 211)
    C_OCT_BG = (226, 239, 218)
    C_NOV_BG = (217, 234, 211)
    C_DIC_BG = (226, 239, 218)
    C_ENE_BG = (217, 234, 211)
    C_CURR_COL = (255, 253, 231)    # Subtle warm highlight on current week

    # 1. Title at Top (underlined like in photo)
    title_text = "Cronograma de Actividades"
    draw.text((img_w // 2 - 240, 30), title_text, font=font_title, fill=(0, 0, 0))
    # Underline
    draw.line([(img_w // 2 - 240, 75), (img_w // 2 + 240, 75)], fill=(0, 0, 0), width=3)

    # Subtitle / Context
    sub_text = "Sistema de Inventario y Mapeo Lógico GPON / FTTx | Estado al 20 de Septiembre de 2026"
    draw.text((img_w // 2 - 380, 85), sub_text, font=font_sub, fill=(70, 70, 70))

    # Current date badge
    draw.rectangle([(img_w - 420, 35), (img_w - 60, 75)], fill=(254, 243, 199), outline=(217, 119, 6), width=2)
    draw.text((img_w - 400, 45), "Fecha Actual: 20-Sep-2026", font=font_badge, fill=(180, 83, 9))

    # 2. Table Geometry
    t_left = 50
    t_top = 130
    t_right = img_w - 50
    act_col_w = 780
    num_weeks = 20
    week_col_w = (t_right - t_left - act_col_w) // num_weeks # ~78px each
    t_right = t_left + act_col_w + (num_weeks * week_col_w) # align right border

    row_h_month = 35
    row_h_hdr = 45
    row_h_data = 58 # 17 rows * 58 = 986px

    # Draw Month Groups (Row 0)
    # Months layout:
    # Sep: w1..w4 (4 cols)
    # Oct: w5..w9 (5 cols)
    # Nov: w10..w13 (4 cols)
    # Dic: w14..w17 (4 cols)
    # Ene: w18..w20 (3 cols)
    months = [
        ("ACTIVIDADES DEL ANTEPROYECTO", 0, 0, act_col_w, C_HDR_BG),
        ("SEPTIEMBRE 2026", 1, 4, 4 * week_col_w, C_SEP_BG),
        ("OCTUBRE 2026", 5, 9, 5 * week_col_w, C_OCT_BG),
        ("NOVIEMBRE 2026", 10, 13, 4 * week_col_w, C_NOV_BG),
        ("DICIEMBRE 2026", 14, 17, 4 * week_col_w, C_DIC_BG),
        ("ENERO 2027", 18, 20, 3 * week_col_w, C_ENE_BG),
    ]

    cur_x = t_left
    # Activities header block
    draw.rectangle([(t_left, t_top), (t_left + act_col_w, t_top + row_h_month + row_h_hdr)], fill=C_HDR_BG, outline=C_BORDER, width=2)
    draw.text((t_left + 220, t_top + 30), "ACTIVIDADES", font=font_hdr, fill=(0, 0, 0))

    # Months
    cur_x = t_left + act_col_w
    for m_name, w_start, w_end, m_w, m_color in months[1:]:
        draw.rectangle([(cur_x, t_top), (cur_x + m_w, t_top + row_h_month)], fill=m_color, outline=C_BORDER, width=2)
        # Center month name
        draw.text((cur_x + (m_w // 2) - 60, t_top + 8), m_name, font=font_hdr, fill=(0, 0, 0))
        cur_x += m_w

    # Draw Week Headers (Row 1)
    y_week = t_top + row_h_month
    for idx, (w_name, w_dates, _) in enumerate(WEEKS_HEADER):
        wx = t_left + act_col_w + idx * week_col_w
        # Highlight week 3 (Current Week: 20 Sep)
        w_bg = (255, 236, 179) if idx == 2 else C_HDR_BG
        draw.rectangle([(wx, y_week), (wx + week_col_w, y_week + row_h_hdr)], fill=w_bg, outline=C_BORDER, width=2)
        draw.text((wx + 10, y_week + 8), w_name, font=font_week, fill=(180, 83, 9) if idx == 2 else (0, 0, 0))
        draw.text((wx + 4, y_week + 26), w_dates[:10], font=font_date, fill=(100, 100, 100))

    # Draw Data Rows
    y_curr = t_top + row_h_month + row_h_hdr
    for r_idx, (num, name, start_d, end_d, active_weeks, status, prog) in enumerate(ACTIVITIES_DATA):
        # Background of activity cell
        draw.rectangle([(t_left, y_curr), (t_left + act_col_w, y_curr + row_h_data)], fill=(255, 255, 255), outline=C_BORDER, width=2)

        # Activity Number & Text (wrapped into 2 lines if needed)
        num_str = f"{num}."
        draw.text((t_left + 10, y_curr + 8), num_str, font=font_hdr, fill=(0, 0, 0))

        # Break text cleanly
        words = name.split()
        line1, line2 = "", ""
        for w in words:
            if len(line1 + " " + w) < 68 and not line2:
                line1 += (" " if line1 else "") + w
            else:
                line2 += (" " if line2 else "") + w

        draw.text((t_left + 35, y_curr + 6), line1, font=font_act, fill=(0, 0, 0))
        if line2:
            draw.text((t_left + 35, y_curr + 24), line2, font=font_act, fill=(0, 0, 0))

        # Status & Dates pill
        dates_str = f"Fechas: {start_d} a {end_d}  |  Estado: {status}"
        status_color = (46, 125, 50) if "COMPLETADA" in status else ((217, 119, 6) if "EN CURSO" in status else (120, 120, 120))
        draw.text((t_left + 35, y_curr + 42), dates_str, font=font_date, fill=status_color)

        # Weeks grid cells
        for w_idx in range(1, 21):
            wx = t_left + act_col_w + (w_idx - 1) * week_col_w
            # Check if active
            if w_idx in active_weeks:
                # GREEN BAR matching photo
                if "COMPLETADA" in status:
                    fill_c = C_GREEN_COMP
                elif "EN CURSO" in status:
                    fill_c = C_GREEN_CURR
                else:
                    fill_c = C_GREEN_PROG
                draw.rectangle([(wx + 2, y_curr + 4), (wx + week_col_w - 2, y_curr + row_h_data - 4)], fill=fill_c, outline=(0, 0, 0), width=1)
                # Check mark or active icon
                if "COMPLETADA" in status:
                    draw.text((wx + week_col_w // 2 - 6, y_curr + row_h_data // 2 - 10), "OK", font=font_check, fill=(255, 255, 255))
                elif "EN CURSO" in status:
                    draw.text((wx + week_col_w // 2 - 5, y_curr + row_h_data // 2 - 10), ">>", font=font_check, fill=(255, 255, 255))
            else:
                # Empty cell with black border
                cell_bg = C_CURR_COL if w_idx == 3 else (255, 255, 255)
                draw.rectangle([(wx, y_curr), (wx + week_col_w, y_curr + row_h_data)], fill=cell_bg, outline=C_BORDER, width=2)

        y_curr += row_h_data

    # Draw Current Date Vertical Indicator Line (Week 3 - 20 de Septiembre)
    col_w3_x = t_left + act_col_w + (2 * week_col_w) + (week_col_w * 5 // 7) # Sep 20 is near end of week 3
    draw.line([(col_w3_x, t_top + row_h_month), (col_w3_x, y_curr)], fill=(220, 38, 38), width=3)

    # Badge for Cut-off Line
    draw.rectangle([(col_w3_x - 70, y_curr + 6), (col_w3_x + 70, y_curr + 30)], fill=(220, 38, 38))
    draw.text((col_w3_x - 65, y_curr + 10), "20-SEP (CORTE)", font=font_date, fill=(255, 255, 255))

    # Legend at bottom
    leg_y = y_curr + 40
    # Completed
    draw.rectangle([(t_left, leg_y), (t_left + 25, leg_y + 18)], fill=C_GREEN_COMP, outline=(0, 0, 0))
    draw.text((t_left + 35, leg_y + 2), "Actividades Finalizadas al 20-Sep (100%)", font=font_week, fill=(0, 0, 0))

    # In Progress
    draw.rectangle([(t_left + 360, leg_y), (t_left + 385, leg_y + 18)], fill=C_GREEN_CURR, outline=(0, 0, 0))
    draw.text((t_left + 395, leg_y + 2), "Actividad en Curso al 20-Sep (40% de avance)", font=font_week, fill=(0, 0, 0))

    # Scheduled
    draw.rectangle([(t_left + 780, leg_y), (t_left + 805, leg_y + 18)], fill=C_GREEN_PROG, outline=(0, 0, 0))
    draw.text((t_left + 815, leg_y + 2), "Actividades Programadas por Realizar", font=font_week, fill=(0, 0, 0))

    # Red Line Legend
    draw.line([(t_left + 1150, leg_y + 9), (t_left + 1180, leg_y + 9)], fill=(220, 38, 38), width=3)
    draw.text((t_left + 1190, leg_y + 2), "Línea de Corte Temporal (20 de Septiembre de 2026)", font=font_week, fill=(180, 0, 0))

    img_path = "docs/cronograma_actividades_gpon_20sep.png"
    img.save(img_path)
    print(f"High-res Gantt chart image created at: {img_path}")

if __name__ == "__main__":
    build_excel_cronograma()
    build_gantt_image()

