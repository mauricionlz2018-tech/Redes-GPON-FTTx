import os
from PIL import Image, ImageDraw, ImageFont

def build_p_r_cronograma():
    W, H = 2600, 1900
    img = Image.new('RGB', (W, H), (255, 255, 255))
    draw = ImageDraw.Draw(img)

    # Fonts
    font_inst = ImageFont.truetype('C:/Windows/Fonts/arialbd.ttf', 30)
    font_subinst = ImageFont.truetype('C:/Windows/Fonts/arialbd.ttf', 22)
    font_title = ImageFont.truetype('C:/Windows/Fonts/arialbd.ttf', 22)
    font_block_hdr = ImageFont.truetype('C:/Windows/Fonts/arialbd.ttf', 16)
    font_block_txt = ImageFont.truetype('C:/Windows/Fonts/arial.ttf', 13)
    font_tbl_hdr = ImageFont.truetype('C:/Windows/Fonts/arialbd.ttf', 15)
    font_act_name = ImageFont.truetype('C:/Windows/Fonts/arialbd.ttf', 13)
    font_act_date = ImageFont.truetype('C:/Windows/Fonts/arial.ttf', 11)
    font_pr_lbl = ImageFont.truetype('C:/Windows/Fonts/arialbd.ttf', 14)
    font_week_num = ImageFont.truetype('C:/Windows/Fonts/arialbd.ttf', 12)
    font_week_dt = ImageFont.truetype('C:/Windows/Fonts/arial.ttf', 10)
    font_badge = ImageFont.truetype('C:/Windows/Fonts/arialbd.ttf', 12)
    font_footer_hdr = ImageFont.truetype('C:/Windows/Fonts/arialbd.ttf', 15)
    font_footer_txt = ImageFont.truetype('C:/Windows/Fonts/arial.ttf', 12.5)

    # Colors
    C_BLACK = (0, 0, 0)
    C_WHITE = (255, 255, 255)
    C_GRAY_LIGHT = (245, 245, 245)
    C_GRAY_HDR = (235, 235, 235)
    C_PROG_FILL = (195, 195, 195)      # Gray for Programado
    C_REAL_FILL = (255, 230, 0)        # Yellow for Realizado (matching anteproyecto)
    C_REAL_BORDER = (210, 180, 0)
    C_LINE_RED = (220, 38, 38)         # Cutoff line
    C_SEP_BG = (220, 235, 220)
    C_OCT_BG = (235, 242, 230)
    C_NOV_BG = (220, 235, 220)
    C_DIC_BG = (235, 242, 230)
    C_ENE_BG = (220, 235, 220)

    # =========================================================
    # 1. TOP BANNER (y: 20 to 145)
    # =========================================================
    draw.rectangle([(40, 20), (2560, 145)], outline=C_BLACK, width=3, fill=C_WHITE)

    # Paste GEM logo (left)
    if os.path.exists('scratch/logo_rId3.png'):
        gem = Image.open('scratch/logo_rId3.png').convert('RGBA')
        gem.thumbnail((120, 105), Image.Resampling.LANCZOS)
        img.paste(gem, (65, 30), gem)

    # Paste UMB and UES logos (right)
    if os.path.exists('scratch/logo_rId1.png') and os.path.exists('scratch/logo_rId2.png'):
        umb = Image.open('scratch/logo_rId1.png').convert('RGBA')
        umb.thumbnail((140, 75), Image.Resampling.LANCZOS)
        img.paste(umb, (2260, 45), umb)

        ues = Image.open('scratch/logo_rId2.png').convert('RGBA')
        ues.thumbnail((140, 75), Image.Resampling.LANCZOS)
        img.paste(ues, (2410, 45), ues)

    # Text in banner
    draw.text((W // 2, 38), "UNIVERSIDAD MEXIQUENSE DEL BICENTENARIO", font=font_inst, fill=C_BLACK, anchor="mm")
    draw.text((W // 2, 75), "Unidad de Estudios Superiores San José del Rincón", font=font_subinst, fill=C_BLACK, anchor="mm")
    draw.text((W // 2, 112), "“SISTEMA DE INVENTARIO Y MAPEO LÓGICO DE REDES GPON / FTTx”", font=font_title, fill=(30, 80, 30), anchor="mm")

    # =========================================================
    # 2. METADATA HEADER BLOCK (y: 155 to 275)
    # =========================================================
    # Left box: Objetivo General (40 to 950)
    draw.rectangle([(40, 155), (950, 275)], outline=C_BLACK, width=2, fill=C_WHITE)
    draw.text((55, 165), "Objetivo General:", font=font_block_hdr, fill=C_BLACK)
    obj_txt = (
        "Desarrollar e implementar un sistema web para el inventario y mapeo lógico de la\n"
        "infraestructura de red GPON/FTTx de la empresa GPON TELECOM S.A. de C.V.,\n"
        "mediante arquitectura cliente-servidor, bases de datos relacionales y visualización\n"
        "geoespacial, optimizando la asignación de puertos y la trazabilidad técnica en campo."
    )
    draw.text((55, 190), obj_txt, font=font_block_txt, fill=(40, 40, 40), spacing=3)

    # Center box: Cronograma de Actividades (950 to 1950)
    draw.rectangle([(950, 155), (1950, 275)], outline=C_BLACK, width=2, fill=C_WHITE)
    draw.text((1450, 178), "CRONOGRAMA DE ACTIVIDADES", font=ImageFont.truetype('C:/Windows/Fonts/arialbd.ttf', 24), fill=C_BLACK, anchor="mm")
    draw.text((1450, 212), "“Sistema de Inventario y Mapeo Lógico de Redes GPON / FTTx”", font=font_block_hdr, fill=(60, 60, 60), anchor="mm")
    draw.text((1450, 245), "PERIODO:  01 de Septiembre de 2026  al  17 de Enero de 2027", font=font_block_hdr, fill=(20, 80, 20), anchor="mm")

    # Right box: Aspectos Estratégicos (1950 to 2560)
    draw.rectangle([(1950, 155), (2560, 275)], outline=C_BLACK, width=2, fill=C_WHITE)
    draw.text((1965, 165), "ASPECTOS ESTRATÉGICOS", font=font_block_hdr, fill=C_BLACK)
    draw.text((1965, 195), "• Inicio: 01-Septiembre-2026", font=font_block_txt, fill=C_BLACK)
    draw.text((1965, 218), "• Término: 17-Enero-2027", font=font_block_txt, fill=C_BLACK)
    draw.text((1965, 243), "• Corte Evaluación: 20-Sep-2026 (Sem 3)", font=ImageFont.truetype('C:/Windows/Fonts/arialbd.ttf', 13), fill=C_LINE_RED)

    # =========================================================
    # 3. TABLE GEOMETRY
    # =========================================================
    t_left = 40
    t_right = 2560
    y_table_top = 285

    col_w_act = 840
    col_w_pr = 55
    col_w_avance = 95
    col_w_obs = 170
    
    # 20 weeks
    remaining_w = (t_right - t_left) - col_w_act - col_w_pr - col_w_avance - col_w_obs # 2520 - 1160 = 1360
    col_w_week = remaining_w // 20 # 68 px each
    t_right = t_left + col_w_act + col_w_pr + (20 * col_w_week) + col_w_avance + col_w_obs

    x_act = t_left
    x_pr = x_act + col_w_act
    x_weeks_start = x_pr + col_w_pr
    x_avance = x_weeks_start + (20 * col_w_week)
    x_obs = x_avance + col_w_avance

    # Row Heights
    h_row_month = 36
    h_row_weeks = 46
    h_subrow = 36 # 2 subrows per activity = 72 px per activity
    h_activity = h_subrow * 2

    # --- Header Row 1: Months (y: 285 to 321) ---
    y0 = y_table_top
    y1 = y0 + h_row_month
    draw.rectangle([(x_act, y0), (x_weeks_start, y1)], outline=C_BLACK, width=2, fill=C_GRAY_HDR)
    draw.text(((x_act + x_weeks_start) // 2, (y0 + y1) // 2), "ACTIVIDADES DEL ANTEPROYECTO", font=font_tbl_hdr, fill=C_BLACK, anchor="mm")

    month_spans = [
        ("SEPTIEMBRE 2026", 0, 4, C_SEP_BG),
        ("OCTUBRE 2026", 4, 9, C_OCT_BG),
        ("NOVIEMBRE 2026", 9, 13, C_NOV_BG),
        ("DICIEMBRE 2026", 13, 17, C_DIC_BG),
        ("ENERO 2027", 17, 20, C_ENE_BG),
    ]
    for m_label, w_start, w_end, m_color in month_spans:
        mx0 = x_weeks_start + (w_start * col_w_week)
        mx1 = x_weeks_start + (w_end * col_w_week)
        draw.rectangle([(mx0, y0), (mx1, y1)], outline=C_BLACK, width=2, fill=m_color)
        draw.text(((mx0 + mx1) // 2, (y0 + y1) // 2), m_label, font=font_tbl_hdr, fill=C_BLACK, anchor="mm")

    draw.rectangle([(x_avance, y0), (t_right, y1)], outline=C_BLACK, width=2, fill=C_GRAY_HDR)
    draw.text(((x_avance + t_right) // 2, (y0 + y1) // 2), "ESTADO Y AVANCE", font=font_tbl_hdr, fill=C_BLACK, anchor="mm")

    # --- Header Row 2: Weeks / Subheaders (y: 321 to 367) ---
    y2 = y1 + h_row_weeks
    draw.rectangle([(x_act, y1), (x_pr, y2)], outline=C_BLACK, width=2, fill=C_GRAY_LIGHT)
    draw.text(((x_act + x_pr) // 2, (y1 + y2) // 2), "DESCRIPCIÓN DE LA ACTIVIDAD Y PLAZOS", font=font_tbl_hdr, fill=C_BLACK, anchor="mm")

    draw.rectangle([(x_pr, y1), (x_weeks_start, y2)], outline=C_BLACK, width=2, fill=C_GRAY_LIGHT)
    draw.text(((x_pr + x_weeks_start) // 2, (y1 + y2) // 2), "TIPO", font=font_tbl_hdr, fill=C_BLACK, anchor="mm")

    WEEKS_DATA = [
        ("SEM 1", "01-07 Sep"), ("SEM 2", "08-14 Sep"), ("SEM 3", "15-21 Sep"), ("SEM 4", "22-28 Sep"),
        ("SEM 5", "29S-05O"), ("SEM 6", "06-12 Oct"), ("SEM 7", "13-19 Oct"), ("SEM 8", "20-26 Oct"), ("SEM 9", "27O-02N"),
        ("SEM 10", "03-09 Nov"), ("SEM 11", "10-16 Nov"), ("SEM 12", "17-23 Nov"), ("SEM 13", "24-30 Nov"),
        ("SEM 14", "01-07 Dic"), ("SEM 15", "08-14 Dic"), ("SEM 16", "15-21 Dic"), ("SEM 17", "22-28 Dic"),
        ("SEM 18", "29D-04E"), ("SEM 19", "05-11 Ene"), ("SEM 20", "12-17 Ene")
    ]
    for w_i, (w_label, w_dt) in enumerate(WEEKS_DATA):
        wx0 = x_weeks_start + (w_i * col_w_week)
        wx1 = wx0 + col_w_week
        # Highlight week 3
        w_bg = (255, 249, 196) if w_i == 2 else C_WHITE
        draw.rectangle([(wx0, y1), (wx1, y2)], outline=C_BLACK, width=1, fill=w_bg)
        draw.text(((wx0 + wx1) // 2, y1 + 14), w_label, font=font_week_num, fill=(180, 20, 20) if w_i == 2 else C_BLACK, anchor="mm")
        draw.text(((wx0 + wx1) // 2, y1 + 32), w_dt, font=font_week_dt, fill=(100, 100, 100) if w_i != 2 else (180, 20, 20), anchor="mm")

    draw.rectangle([(x_avance, y1), (x_obs, y2)], outline=C_BLACK, width=2, fill=C_GRAY_LIGHT)
    draw.text(((x_avance + x_obs) // 2, (y1 + y2) // 2), "AVANCE", font=font_tbl_hdr, fill=C_BLACK, anchor="mm")

    draw.rectangle([(x_obs, y1), (t_right, y2)], outline=C_BLACK, width=2, fill=C_GRAY_LIGHT)
    draw.text(((x_obs + t_right) // 2, (y1 + y2) // 2), "OBSERVACIONES", font=font_tbl_hdr, fill=C_BLACK, anchor="mm")

    # =========================================================
    # 4. ACTIVITIES DATA ROWS (17 activities * 2 subrows = 34 rows)
    # =========================================================
    ACTIVITIES = [
        (1, "Inmersión técnica, investigación de conceptos básicos y normativa operativa de redes GPON/FTTx.",
         "01/09/2026 al 08/09/2026", [1, 2], [1, 2], "100%", "Finalizada"),
        (2, "Levantamiento y especificación formal de requerimientos funcionales y no funcionales (SRS).",
         "09/09/2026 al 13/09/2026", [2], [2], "100%", "Finalizada"),
        (3, "Diseño de la arquitectura del sistema web (cliente-servidor) y selección del stack tecnológico.",
         "14/09/2026 al 18/09/2026", [3], [3], "100%", "Finalizada"),
        (4, "Modelado de la base de datos relacional (diagrama entidad-relación para ODFs, NAPs, fibras y clientes).",
         "19/09/2026 al 24/09/2026", [3, 4], [3], "40%", "En desarrollo"),
        (5, "Diseño de wireframes y prototipos visuales de interfaces responsivas optimizadas para campo.",
         "25/09/2026 al 30/09/2026", [4, 5], [], "0%", "Programada"),
        (6, "Creación del esquema de base de datos, relaciones, llaves foráneas, índices y restricciones.",
         "01/10/2026 al 05/10/2026", [5], [], "0%", "Programada"),
        (7, "Programación del módulo backend de autenticación, control de accesos y gestión de perfiles.",
         "06/10/2026 al 10/10/2026", [6], [], "0%", "Programada"),
        (8, "Desarrollo de la API REST centralizada para inventario y gestión de activos pasivos de red.",
         "11/10/2026 al 24/10/2026", [7, 8], [], "0%", "Programada"),
        (9, "Configuración de transacciones en base de datos para soporte de concurrencia sin colisiones.",
         "25/10/2026 al 31/10/2026", [9], [], "0%", "Programada"),
        (10, "Maquetación frontend de vistas tabulares y componentes base adaptados a dispositivos móviles.",
         "01/11/2026 al 09/11/2026", [9, 10], [], "0%", "Programada"),
        (11, "Construcción del módulo visual para el mapeo lógico simple de la red y trazado de conexiones.",
         "10/11/2026 al 18/11/2026", [11, 12], [], "0%", "Programada"),
        (12, "Programación de formularios interactivos para el reporte y cambio en tiempo real del estado de puertos.",
         "19/11/2026 al 27/11/2026", [12, 13], [], "0%", "Programada"),
        (13, "Integración frontend con API REST y gestión de persistencia local para tolerar pérdidas de red.",
         "28/11/2026 al 08/12/2026", [13, 14, 15], [], "0%", "Programada"),
        (14, "Pruebas de funcionamiento integral en entorno de desarrollo y validación de flujos de trabajo.",
         "09/12/2026 al 13/12/2026", [15], [], "0%", "Programada"),
        (15, "Simulación de concurrencia técnica con múltiples peticiones simultáneas y depuración de bugs.",
         "14/12/2026 al 17/12/2026", [16], [], "0%", "Programada"),
        (16, "Elaboración de manuales técnicos, guía de usuario para técnicos de campo y documentación.",
         "18/12/2026 al 12/01/2027", [16, 17, 18, 19], [], "0%", "Programada"),
        (17, "Empaquetado final del código fuente, verificación de entregables y redacción del reporte de cierre.",
         "13/01/2027 al 17/01/2027", [20], [], "0%", "Programada"),
    ]

    curr_y = y2
    for act_idx, (num, name, date_str, prog_weeks, real_weeks, pct, obs) in enumerate(ACTIVITIES):
        y_act_top = curr_y
        y_act_mid = y_act_top + h_subrow
        y_act_bot = y_act_top + h_activity

        # Alternate background row tint
        row_bg = (252, 252, 252) if act_idx % 2 == 0 else C_WHITE

        # 1. Col Activity (spans both subrows)
        draw.rectangle([(x_act, y_act_top), (x_pr, y_act_bot)], outline=C_BLACK, width=1, fill=row_bg)
        draw.text((x_act + 12, y_act_top + 18), f"{num}. {name}", font=font_act_name, fill=C_BLACK)
        draw.text((x_act + 30, y_act_top + 45), f"Plazo: {date_str}", font=font_act_date, fill=(80, 80, 80))

        # 2. Col P/R (Two subrows)
        # Subrow P
        draw.rectangle([(x_pr, y_act_top), (x_weeks_start, y_act_mid)], outline=C_BLACK, width=1, fill=(240, 240, 240))
        draw.text(((x_pr + x_weeks_start) // 2, (y_act_top + y_act_mid) // 2), "P", font=font_pr_lbl, fill=C_BLACK, anchor="mm")
        # Subrow R
        draw.rectangle([(x_pr, y_act_mid), (x_weeks_start, y_act_bot)], outline=C_BLACK, width=1, fill=(255, 253, 220))
        draw.text(((x_pr + x_weeks_start) // 2, (y_act_mid + y_act_bot) // 2), "R", font=font_pr_lbl, fill=(150, 110, 0), anchor="mm")

        # 3. Weeks Grid (2 subrows per week)
        for w_i in range(1, 21):
            wx0 = x_weeks_start + ((w_i - 1) * col_w_week)
            wx1 = wx0 + col_w_week

            # Cell P
            is_prog = w_i in prog_weeks
            p_fill = C_PROG_FILL if is_prog else (row_bg if w_i != 3 else (255, 253, 235))
            draw.rectangle([(wx0, y_act_top), (wx1, y_act_mid)], outline=C_BLACK, width=1, fill=p_fill)
            if is_prog:
                draw.rectangle([(wx0 + 2, y_act_top + 3), (wx1 - 2, y_act_mid - 3)], fill=C_PROG_FILL, outline=(140, 140, 140), width=1)

            # Cell R
            is_real = w_i in real_weeks
            r_fill = C_REAL_FILL if is_real else (row_bg if w_i != 3 else (255, 253, 235))
            draw.rectangle([(wx0, y_act_mid), (wx1, y_act_bot)], outline=C_BLACK, width=1, fill=r_fill)
            if is_real:
                draw.rectangle([(wx0 + 2, y_act_mid + 3), (wx1 - 2, y_act_bot - 3)], fill=C_REAL_FILL, outline=C_REAL_BORDER, width=1)
                # Text inside R bar
                if num <= 3:
                    draw.text(((wx0 + wx1) // 2, (y_act_mid + y_act_bot) // 2), "OK", font=font_badge, fill=(100, 70, 0), anchor="mm")
                elif num == 4:
                    draw.text(((wx0 + wx1) // 2, (y_act_mid + y_act_bot) // 2), "40%", font=font_badge, fill=(100, 70, 0), anchor="mm")

        # 4. Col Avance
        draw.rectangle([(x_avance, y_act_top), (x_obs, y_act_bot)], outline=C_BLACK, width=1, fill=row_bg)
        pct_color = (0, 130, 0) if pct == "100%" else ((200, 110, 0) if pct == "40%" else (120, 120, 120))
        draw.text(((x_avance + x_obs) // 2, (y_act_top + y_act_bot) // 2), pct, font=font_tbl_hdr, fill=pct_color, anchor="mm")

        # 5. Col Observaciones
        draw.rectangle([(x_obs, y_act_top), (t_right, y_act_bot)], outline=C_BLACK, width=1, fill=row_bg)
        obs_color = (0, 100, 0) if "Finalizada" in obs else ((180, 90, 0) if "En desarrollo" in obs else (90, 90, 90))
        draw.text(((x_obs + t_right) // 2, (y_act_top + y_act_bot) // 2), obs, font=font_act_name, fill=obs_color, anchor="mm")

        curr_y = y_act_bot

    # Heavy outer table border
    draw.rectangle([(t_left, y_table_top), (t_right, curr_y)], outline=C_BLACK, width=3)

    # Vertical Red Cutoff Line on Week 3 (15-21 Sep, cutoff on Sep 20 = near right edge of col 3)
    x_cut = x_weeks_start + (3 * col_w_week) - 8
    draw.line([(x_cut, y1), (x_cut, curr_y + 25)], fill=C_LINE_RED, width=4)

    # Red badge at bottom of cutoff line
    draw.rectangle([(x_cut - 65, curr_y + 25), (x_cut + 65, curr_y + 55)], fill=C_LINE_RED, outline=C_BLACK, width=1)
    draw.text((x_cut, curr_y + 40), "20-SEP (CORTE)", font=ImageFont.truetype('C:/Windows/Fonts/arialbd.ttf', 12), fill=C_WHITE, anchor="mm")

    # =========================================================
    # 5. FOOTER / SIGNATURES / CRITERIA (y: curr_y + 65 to 1875)
    # =========================================================
    y_foot_top = curr_y + 65
    y_foot_bot = y_foot_top + 135

    # Left: Comentarios Generales (40 to 1050)
    draw.rectangle([(40, y_foot_top), (1050, y_foot_bot)], outline=C_BLACK, width=2, fill=C_WHITE)
    draw.text((55, y_foot_top + 12), "COMENTARIOS GENERALES :", font=font_footer_hdr, fill=C_BLACK)
    com_txt = (
        "Corte de evaluación técnica al 20 de septiembre de 2026 (Semana 3). Cumplimiento estricto\n"
        "al 100% en las actividades 1, 2 y 3 (Inmersión técnica, Requerimientos de sistema SRS y\n"
        "Arquitectura del sistema web). Actividad 4 (Modelado de base de datos relacional DER) en\n"
        "curso con un 40% de avance. El proyecto opera con puntualidad y rigor metodológico."
    )
    draw.text((55, y_foot_top + 38), com_txt, font=font_footer_txt, fill=(40, 40, 40), spacing=3)

    # Center: Criterios y Responsable (1050 to 1880)
    draw.rectangle([(1050, y_foot_top), (1880, y_foot_bot)], outline=C_BLACK, width=2, fill=C_WHITE)
    draw.text((1465, y_foot_top + 16), "Responsable: Mauricio Nolazco Lonjino", font=font_footer_hdr, fill=C_BLACK, anchor="mm")
    draw.text((1465, y_foot_top + 42), "CRITERIOS DE CONTROL:", font=ImageFont.truetype('C:/Windows/Fonts/arialbd.ttf', 13), fill=(60, 60, 60), anchor="mm")

    # Legend badges
    # P: Programado
    draw.rectangle([(1110, y_foot_top + 65), (1165, y_foot_top + 95)], fill=C_PROG_FILL, outline=C_BLACK, width=2)
    draw.text((1180, y_foot_top + 73), "P = Programado (Planificado según Anteproyecto)", font=font_footer_txt, fill=C_BLACK)

    # R: Realizado
    draw.rectangle([(1110, y_foot_top + 100), (1165, y_foot_top + 130)], fill=C_REAL_FILL, outline=C_REAL_BORDER, width=2)
    draw.text((1180, y_foot_top + 108), "R = Realizado (Avance técnico ejecutado al corte)", font=font_footer_txt, fill=C_BLACK)

    # Right: Asesor Interno (1880 to 2560)
    draw.rectangle([(1880, y_foot_top), (2560, y_foot_bot)], outline=C_BLACK, width=2, fill=C_WHITE)
    draw.text((2220, y_foot_top + 16), "ASESOR INTERNO:", font=font_footer_hdr, fill=C_BLACK, anchor="mm")
    draw.text((2220, y_foot_top + 60), "I.S.C. Leonardo Becerril Sánchez", font=ImageFont.truetype('C:/Windows/Fonts/arialbd.ttf', 19), fill=C_BLACK, anchor="mm")
    draw.text((2220, y_foot_top + 95), "Docente Asesor de Residencia Profesional", font=font_footer_txt, fill=(70, 70, 70), anchor="mm")
    draw.text((2220, y_foot_top + 115), "Unidad de Estudios Superiores San José del Rincón", font=font_footer_txt, fill=(90, 90, 90), anchor="mm")

    # Save to all paths
    out_paths = [
        r'C:/Users/karen/.gemini/antigravity/brain/a33b5b22-c89b-4ff3-a6cc-733a0c69ceac/cronograma_actividades_gpon_20sep.png',
        r'scratch/cronograma_actividades_gpon_20sep.png',
        r'docs/cronograma_actividades_gpon_20sep.png',
    ]
    for p in out_paths:
        os.makedirs(os.path.dirname(p), exist_ok=True)
        img.save(p, quality=95)
        print(f"SUCCESS: Saved image to {p}")

if __name__ == '__main__':
    build_p_r_cronograma()
