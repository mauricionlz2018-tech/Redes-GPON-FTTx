import os
from PIL import Image, ImageDraw, ImageFont

def get_font(size, bold=False):
    font_paths = [
        "C:/Windows/Fonts/arialbd.ttf" if bold else "C:/Windows/Fonts/arial.ttf",
        "C:/Windows/Fonts/calibrib.ttf" if bold else "C:/Windows/Fonts/calibri.ttf",
        "C:/Windows/Fonts/segoeuib.ttf" if bold else "C:/Windows/Fonts/segoeui.ttf",
    ]
    for fp in font_paths:
        if os.path.exists(fp):
            try:
                return ImageFont.truetype(fp, size)
            except:
                pass
    return ImageFont.load_default()

def create_documentation_evidence_card():
    # 1200 x 650 high-res card representing the formal documentation
    width, height = 1200, 650
    im = Image.new("RGBA", (width, height), (248, 250, 252, 255))
    draw = ImageDraw.Draw(im)

    # Background header banner (Institucional UMB Guinda)
    draw.rectangle([0, 0, width, 100], fill=(122, 28, 53, 255)) # #7A1C35
    # Gold accent line
    draw.rectangle([0, 96, width, 100], fill=(163, 131, 64, 255)) # #A38340

    # Header text
    f_title = get_font(28, bold=True)
    f_sub = get_font(18, bold=False)
    draw.text((40, 20), "UNIVERSIDAD MEXIQUENSE DEL BICENTENARIO", fill=(255, 255, 255), font=f_title)
    draw.text((40, 58), "Documentación Formal de Residencia Profesional — Memoria Técnica Oficial (PDF)", fill=(240, 230, 210), font=f_sub)

    # Left: PDF Document Preview Card
    # Simulated page
    page_w, page_h = 360, 480
    px, py = 50, 130
    draw.rectangle([px+8, py+8, px+page_w+8, py+page_h+8], fill=(210, 215, 225, 180)) # shadow
    draw.rectangle([px, py, px+page_w, py+page_h], fill=(255, 255, 255, 255), outline=(200, 205, 215), width=2)
    
    # Header ribbon on simulated page
    draw.rectangle([px, py, px+page_w, py+40], fill=(122, 28, 53, 255))
    f_p_head = get_font(12, bold=True)
    draw.text((px+15, py+12), "MEMORIA TÉCNICA DE RESIDENCIA", fill=(255, 255, 255), font=f_p_head)
    
    # Page text simulation
    f_p_title = get_font(15, bold=True)
    draw.text((px+20, py+60), "SISTEMA DE INVENTARIO Y", fill=(30, 41, 59), font=f_p_title)
    draw.text((px+20, py+82), "MAPEO LÓGICO DE REDES", fill=(30, 41, 59), font=f_p_title)
    draw.text((px+20, py+104), "GPON / FTTx", fill=(122, 28, 53), font=f_p_title)

    f_p_meta = get_font(11, bold=False)
    f_p_meta_b = get_font(11, bold=True)
    draw.text((px+20, py+140), "Empresa:", fill=(100, 116, 139), font=f_p_meta)
    draw.text((px+85, py+140), "GPON TELECOM S.A. DE C.V.", fill=(15, 23, 42), font=f_p_meta_b)
    draw.text((px+20, py+165), "Carrera:", fill=(100, 116, 139), font=f_p_meta)
    draw.text((px+85, py+165), "Ingeniería en Sistemas Computacionales", fill=(15, 23, 42), font=f_p_meta)
    draw.text((px+20, py+190), "Residente:", fill=(100, 116, 139), font=f_p_meta)
    draw.text((px+85, py+190), "Mauricio Nolazco Lonjino", fill=(122, 28, 53), font=f_p_meta_b)
    draw.text((px+20, py+215), "Asesor Int.:", fill=(100, 116, 139), font=f_p_meta)
    draw.text((px+85, py+215), "I.S.C. Leonardo Becerril Sánchez", fill=(15, 23, 42), font=f_p_meta)

    # Simulated chapters list on page
    draw.rectangle([px+20, py+245, px+page_w-20, py+247], fill=(226, 232, 240))
    f_ch = get_font(10, bold=True)
    f_ch_sub = get_font(9, bold=False)
    chapters = [
        "CAPÍTULO I. ANTECEDENTES (Contexto, Empresa y Roles)",
        "CAPÍTULO II. MARCO TEÓRICO (Redes Ópticas y GIS)",
        "CAPÍTULO III. DISEÑO Y MAQUETADO (UCD y Wireframes)",
        "CAPÍTULO IV. DESARROLLO (Codificación y Backend)",
        "CAPÍTULO V. PRUEBAS Y RESULTADOS (Validación)"
    ]
    for c_i, ch in enumerate(chapters):
        draw.text((px+20, py+260 + c_i*22), f"• {ch[:42]}", fill=(51, 65, 85), font=f_ch_sub)

    # Status stamp on page
    draw.rectangle([px+25, py+390, px+page_w-25, py+455], fill=(240, 253, 244), outline=(34, 197, 94), width=1)
    f_stamp_title = get_font(12, bold=True)
    f_stamp_sub = get_font(10, bold=False)
    draw.text((px+40, py+402), "ESTADO DOCUMENTAL: AVANCE FORMAL", fill=(21, 128, 61), font=f_stamp_title)
    draw.text((px+40, py+424), "Formato Oficial UMB • Conforme a Normativa", fill=(71, 85, 105), font=f_stamp_sub)

    # Right: Metric Badges and Highlights
    rx = 460
    f_badge_h = get_font(15, bold=True)
    f_badge_num = get_font(32, bold=True)
    f_badge_lbl = get_font(13, bold=False)

    cards_data = [
        ("96", "Figuras Técnicas Consecutivas", "Diagramas UML, topología GIS, pruebas cromáticas WCAG y evidencias de desarrollo.", (122, 28, 53)),
        ("28", "Tablas Formales de Ingeniería", "Presupuesto óptico de atenuación (Power Budget), matrices ACID y trazabilidad.", (30, 41, 59)),
        ("5", "Capítulos Estructurados", "Estandarización institucional a mitad de hoja en fuente Arial 36 pt negrita.", (163, 131, 64)),
        ("100%", "Conformidad Tipográfica", "Texto justificado Arial 11 pt, interlineado 1.5, espaciado de 6 pt e índices hipervinculados.", (15, 118, 110))
    ]

    for idx, (num, title, desc, color) in enumerate(cards_data):
        cy = 130 + idx * 120
        # Card container
        draw.rectangle([rx+4, cy+4, rx+690+4, cy+105+4], fill=(226, 232, 240, 160)) # shadow
        draw.rectangle([rx, cy, rx+690, cy+105], fill=(255, 255, 255), outline=(226, 232, 240), width=1)
        # Left color strip
        draw.rectangle([rx, cy, rx+8, cy+105], fill=color)

        # Number circle / box
        draw.rectangle([rx+20, cy+15, rx+95, cy+90], fill=(color[0], color[1], color[2], 25), outline=color, width=1)
        # Center number in box
        draw.text((rx+28, cy+25), num, fill=color, font=f_badge_num)

        # Title & desc
        draw.text((rx+115, cy+18), title, fill=(15, 23, 42), font=f_badge_h)
        draw.text((rx+115, cy+48), desc, fill=(100, 116, 139), font=f_badge_lbl)

    os.makedirs("docs", exist_ok=True)
    out_path = "docs/evidencia_documentacion_formal_pdf.png"
    im.save(out_path, "PNG")
    print(f"Saved: {out_path}")

def create_application_evidence_card():
    # 1200 x 650 high-res card displaying real screenshots of the web application
    width, height = 1200, 650
    im = Image.new("RGBA", (width, height), (15, 23, 42, 255)) # Dark theme #0F172A
    draw = ImageDraw.Draw(im)

    # Top header bar
    draw.rectangle([0, 0, width, 80], fill=(30, 41, 59, 255)) # #1E293B
    draw.rectangle([0, 78, width, 80], fill=(14, 165, 233, 255)) # Sky blue accent

    f_title = get_font(26, bold=True)
    f_sub = get_font(16, bold=False)
    draw.text((35, 16), "PLATAFORMA WEB GPON / FTTx — PROTOTIPO Y SOFTWARE FUNCIONAL", fill=(255, 255, 255), font=f_title)
    draw.text((35, 50), "Despliegue operativo en tiempo real • Cartografía GIS • Concurrencia Transaccional • Dark Mode", fill=(148, 163, 184), font=f_sub)

    # Load real screenshots
    src_dir = [os.path.join("docs", d) for d in os.listdir("docs") if "dise" in d.lower()][0]
    
    # 1. Padrón de Abonados
    p_abonados = os.path.join(src_dir, "Captura de pantalla 2026-09-30 120814.png")
    # 2. Reportes Saturación
    p_reportes = os.path.join(src_dir, "Captura de pantalla 2026-09-30 120825.png")
    # 3. Matriz de Puertos
    p_matriz = os.path.join(src_dir, "Captura de pantalla 2026-09-30 120929.png")
    # 4. Conectar Abonado
    p_conectar = os.path.join(src_dir, "Captura de pantalla 2026-09-30 120901.png")

    f_card_t = get_font(13, bold=True)

    # Layout:
    # Left column: Reportes (top, w=560) + Abonados (bottom, w=560)
    # Right column: Matriz de Puertos (w=270, h=300) + Conectar Abonado (w=270, h=300)
    # or Left large (Abonados or Reportes), Right side Modals

    # Panel 1: Reportes e Indicadores (w=680, h=250)
    if os.path.exists(p_reportes):
        im_rep = Image.open(p_reportes).convert("RGBA")
        im_rep = im_rep.resize((680, 240), Image.Resampling.LANCZOS)
        im.paste(im_rep, (35, 115))
        draw.rectangle([35, 95, 35+680, 115], fill=(51, 65, 85))
        draw.text((45, 97), "1. Consola de Reportes Ejecutivos e Indicadores de Saturación GPON", fill=(255, 255, 255), font=f_card_t)

    # Panel 2: Padrón de Abonados (w=680, h=250)
    if os.path.exists(p_abonados):
        im_abo = Image.open(p_abonados).convert("RGBA")
        im_abo = im_abo.resize((680, 240), Image.Resampling.LANCZOS)
        im.paste(im_abo, (35, 385))
        draw.rectangle([35, 365, 35+680, 385], fill=(51, 65, 85))
        draw.text((45, 367), "2. Padrón Centralizado de Suscriptores y Telemetría de Potencia Rx", fill=(255, 255, 255), font=f_card_t)

    # Panel 3: Matriz Física de Puertos (w=430, h=250)
    if os.path.exists(p_matriz):
        im_mat = Image.open(p_matriz).convert("RGBA")
        im_mat = im_mat.resize((430, 240), Image.Resampling.LANCZOS)
        im.paste(im_mat, (735, 115))
        draw.rectangle([735, 95, 735+430, 115], fill=(51, 65, 85))
        draw.text((745, 97), "3. Matriz Física de Puertos NAP (1:16)", fill=(255, 255, 255), font=f_card_t)

    # Panel 4: Conectar Abonado Modal (w=430, h=250)
    if os.path.exists(p_conectar):
        im_con = Image.open(p_conectar).convert("RGBA")
        im_con = im_con.resize((430, 240), Image.Resampling.LANCZOS)
        im.paste(im_con, (735, 385))
        draw.rectangle([735, 365, 735+430, 385], fill=(51, 65, 85))
        draw.text((745, 367), "4. Aprovisionamiento Inmediato FTTx LIVE", fill=(255, 255, 255), font=f_card_t)

    out_path = "docs/evidencia_proyecto_aplicacion_web.png"
    im.save(out_path, "PNG")
    print(f"Saved: {out_path}")

if __name__ == "__main__":
    create_documentation_evidence_card()
    create_application_evidence_card()
