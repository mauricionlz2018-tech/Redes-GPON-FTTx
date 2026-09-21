import os
import math
from PIL import Image, ImageDraw, ImageFont
import pptx
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE
from pptx.dml.color import RGBColor

# -------------------------------------------------------------
# 1. GENERATE CLEAN HIGH-RES UMB BACKGROUND TEMPLATES
# -------------------------------------------------------------
def generate_background_images():
    w, h = 1920, 1080
    
    # Palette matching the photo
    C_LIGHT = (205, 216, 160, 255) # Light sage wave
    C_DARK = (123, 139, 59, 255)   # Main institutional olive green wave
    
    # A. Content Background
    bg_content = Image.new('RGBA', (w, h), (255, 255, 255, 255))
    draw_c = ImageDraw.Draw(bg_content)
    
    # Upper wave (light sage)
    pts_light = [(0, 810)]
    for x in range(0, w + 1, 10):
        y = 810 + 85 * math.sin((x / w) * 2.2) + 20 * math.cos((x / w) * 1.5) - 20
        pts_light.append((x, y))
    pts_light.extend([(w, h), (0, h)])
    draw_c.polygon(pts_light, fill=C_LIGHT)
    
    # Lower wave (main olive green)
    pts_dark = [(0, 850)]
    for x in range(0, w + 1, 10):
        y = 850 + 90 * math.sin((x / w) * 2.1) + 20 * math.cos((x / w) * 1.5) - 20
        pts_dark.append((x, y))
    pts_dark.extend([(w, h), (0, h)])
    draw_c.polygon(pts_dark, fill=C_DARK)
    
    # UMB Typographic Logo
    try:
        font_umb = ImageFont.truetype('arialbd.ttf', 68)
        font_sub = ImageFont.truetype('arialbd.ttf', 17)
    except:
        font_umb = ImageFont.load_default()
        font_sub = ImageFont.load_default()
        
    draw_c.text((90, 915), 'UMB', font=font_umb, fill=(255, 255, 255, 255))
    draw_c.text((90, 995), 'UNIVERSIDAD MEXIQUENSE DEL BICENTENARIO', font=font_sub, fill=(255, 255, 255, 255))
    
    bg_content.save('scratch/slide_bg_content.png')
    
    # B. Cover Background
    bg_cover = Image.new('RGBA', (w, h), (255, 255, 255, 255))
    draw_cov = ImageDraw.Draw(bg_cover)
    
    pts_cov_light = [(0, 790)]
    for x in range(0, w + 1, 10):
        y = 790 + 95 * math.sin((x / w) * 2.2) + 20 * math.cos((x / w) * 1.5) - 20
        pts_cov_light.append((x, y))
    pts_cov_light.extend([(w, h), (0, h)])
    draw_cov.polygon(pts_cov_light, fill=C_LIGHT)
    
    pts_cov_dark = [(0, 830)]
    for x in range(0, w + 1, 10):
        y = 830 + 100 * math.sin((x / w) * 2.1) + 20 * math.cos((x / w) * 1.5) - 20
        pts_cov_dark.append((x, y))
    pts_cov_dark.extend([(w, h), (0, h)])
    draw_cov.polygon(pts_cov_dark, fill=C_DARK)
    
    draw_cov.text((90, 905), 'UMB', font=font_umb, fill=(255, 255, 255, 255))
    draw_cov.text((90, 985), 'UNIVERSIDAD MEXIQUENSE DEL BICENTENARIO', font=font_sub, fill=(255, 255, 255, 255))
    
    # Subtle top accent bar
    draw_cov.rectangle([(0, 0), (w, 14)], fill=C_DARK)
    
    bg_cover.save('scratch/slide_bg_cover.png')
    print("Generated slide_bg_content.png and slide_bg_cover.png.")

# -------------------------------------------------------------
# 2. POWERPOINT BUILDER (PURE PLAIN TEXT, NO CARDS / BOXES)
# -------------------------------------------------------------
def build_clean_presentation():
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6]
    
    # Colors
    CLR_OLIVE = RGBColor(123, 139, 59)     # #7B8B3B
    CLR_DARK_OLIVE = RGBColor(90, 104, 40) # #5A6828
    CLR_TEXT_DARK = RGBColor(30, 30, 30)   # #1E1E1E Pure clean dark
    CLR_TEXT_MUTED = RGBColor(80, 80, 80)
    CLR_WHITE = RGBColor(255, 255, 255)
    
    def add_top_right_title_box(slide, title_text):
        # Framed box exactly like in the user's photo
        width_in = max(4.2, len(title_text) * 0.16 + 1.2)
        left_in = 13.333 - width_in - 0.8
        
        box = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(left_in), Inches(0.45), Inches(width_in), Inches(0.85))
        box.fill.solid()
        box.fill.fore_color.rgb = CLR_WHITE
        box.line.color.rgb = CLR_OLIVE
        box.line.width = Pt(1.5)
        
        tf = box.text_frame
        tf.word_wrap = True
        tf.vertical_anchor = MSO_ANCHOR.MIDDLE
        p = tf.paragraphs[0]
        p.text = title_text
        p.alignment = PP_ALIGN.CENTER
        p.font.name = "Arial"
        p.font.size = Pt(25)
        p.font.bold = True
        p.font.color.rgb = CLR_DARK_OLIVE
        return box

    def add_plain_text_content(slide, paragraphs_list, font_size_pt=19.5, space_after_pt=14):
        # Large clean text box, no background, no border, pure text
        tb = slide.shapes.add_textbox(Inches(1.0), Inches(1.6), Inches(11.333), Inches(4.3))
        tf = tb.text_frame
        tf.word_wrap = True
        
        for idx, text_item in enumerate(paragraphs_list):
            if idx == 0:
                p = tf.paragraphs[0]
            else:
                p = tf.add_paragraph()
            p.text = text_item
            p.alignment = PP_ALIGN.JUSTIFY
            p.font.name = "Arial"
            p.font.size = Pt(font_size_pt)
            p.font.color.rgb = CLR_TEXT_DARK
            p.space_after = Pt(space_after_pt)
            p.line_spacing = 1.25
        return tb

    # =========================================================
    # SLIDE 1: PORTADA
    # =========================================================
    slide1 = prs.slides.add_slide(blank_layout)
    slide1.shapes.add_picture('scratch/slide_bg_cover.png', 0, 0, width=Inches(13.333), height=Inches(7.5))
    
    # Institutional Crest / Logo (Top-Left)
    if os.path.exists('scratch/logo_portada.png'):
        slide1.shapes.add_picture('scratch/logo_portada.png', Inches(1.0), Inches(0.5), height=Inches(1.2))
        
    # Company Logo (Top-Right)
    if os.path.exists('backend/assets/logo-gpon.png'):
        slide1.shapes.add_picture('backend/assets/logo-gpon.png', Inches(10.0), Inches(0.55), height=Inches(1.1))
        
    # Institutional Header (Center)
    head_box = slide1.shapes.add_textbox(Inches(2.5), Inches(0.5), Inches(7.333), Inches(1.2))
    tf_head = head_box.text_frame
    tf_head.word_wrap = True
    
    p1 = tf_head.paragraphs[0]
    p1.text = "UNIVERSIDAD MEXIQUENSE DEL BICENTENARIO"
    p1.alignment = PP_ALIGN.CENTER
    p1.font.name = "Arial"
    p1.font.size = Pt(16)
    p1.font.bold = True
    p1.font.color.rgb = CLR_DARK_OLIVE
    
    p2 = tf_head.add_paragraph()
    p2.text = "Unidad de Estudios Superiores San José del Rincón"
    p2.alignment = PP_ALIGN.CENTER
    p2.font.name = "Arial"
    p2.font.size = Pt(13.5)
    p2.font.bold = True
    p2.font.color.rgb = CLR_TEXT_DARK
    
    p3 = tf_head.add_paragraph()
    p3.text = "Ingeniería en Sistemas Computacionales"
    p3.alignment = PP_ALIGN.CENTER
    p3.font.name = "Arial"
    p3.font.size = Pt(12)
    p3.font.color.rgb = CLR_TEXT_MUTED
    
    # Project Title (Center, pure text, no boxes)
    t_box = slide1.shapes.add_textbox(Inches(1.0), Inches(2.2), Inches(11.333), Inches(1.8))
    tf_t = t_box.text_frame
    tf_t.word_wrap = True
    
    pt0 = tf_t.paragraphs[0]
    pt0.text = "PROYECTO DE RESIDENCIA PROFESIONAL"
    pt0.alignment = PP_ALIGN.CENTER
    pt0.font.name = "Arial"
    pt0.font.size = Pt(13)
    pt0.font.bold = True
    pt0.font.color.rgb = CLR_OLIVE
    
    pt1 = tf_t.add_paragraph()
    pt1.text = "Sistema de Inventario y Mapeo Lógico de Redes GPON / FTTx"
    pt1.alignment = PP_ALIGN.CENTER
    pt1.font.name = "Arial"
    pt1.font.size = Pt(26)
    pt1.font.bold = True
    pt1.font.color.rgb = CLR_TEXT_DARK
    pt1.space_before = Pt(4)
    
    pt2 = tf_t.add_paragraph()
    pt2.text = "Empresa: GPON TELECOM S.A. de C.V."
    pt2.alignment = PP_ALIGN.CENTER
    pt2.font.name = "Arial"
    pt2.font.size = Pt(14)
    pt2.font.color.rgb = CLR_TEXT_MUTED
    pt2.space_before = Pt(4)

    # Presenter and Advisor details (Clean text, two columns)
    det_box = slide1.shapes.add_textbox(Inches(1.5), Inches(4.2), Inches(10.333), Inches(1.5))
    tf_d = det_box.text_frame
    tf_d.word_wrap = True
    
    pd1 = tf_d.paragraphs[0]
    pd1.text = "Presenta: Mauricio Nolazco Lonjino"
    pd1.alignment = PP_ALIGN.CENTER
    pd1.font.name = "Arial"
    pd1.font.size = Pt(16)
    pd1.font.bold = True
    pd1.font.color.rgb = CLR_TEXT_DARK
    
    pd2 = tf_d.add_paragraph()
    pd2.text = "Asesor de Residencia Profesional: I.S.C. Leonardo Becerril Sánchez"
    pd2.alignment = PP_ALIGN.CENTER
    pd2.font.name = "Arial"
    pd2.font.size = Pt(14)
    pd2.font.color.rgb = CLR_TEXT_DARK
    pd2.space_before = Pt(4)
    
    pd3 = tf_d.add_paragraph()
    pd3.text = "San José del Rincón, Estado de México  |  Septiembre de 2026"
    pd3.alignment = PP_ALIGN.CENTER
    pd3.font.name = "Arial"
    pd3.font.size = Pt(12)
    pd3.font.color.rgb = CLR_TEXT_MUTED
    pd3.space_before = Pt(4)

    # =========================================================
    # SLIDE 2: INTRODUCCIÓN (PURE PLAIN TEXT PARAGRAPH)
    # =========================================================
    slide2 = prs.slides.add_slide(blank_layout)
    slide2.shapes.add_picture('scratch/slide_bg_content.png', 0, 0, width=Inches(13.333), height=Inches(7.5))
    add_top_right_title_box(slide2, "Introducción")
    
    intro_paragraphs = [
        "Las redes ópticas pasivas con capacidad de gigabit (GPON) constituyen el estándar primordial en el despliegue de infraestructuras de telecomunicaciones de alta velocidad. Al tratarse de redes punto-multipunto asimétricas que carecen de elementos activos entre la central de distribución y el suscriptor final, el seguimiento operativo de cada hilo, divisor y puerto de conexión representa un factor determinante en la calidad y continuidad del servicio.",
        "En los escenarios de operación cotidiana de la empresa GPON TELECOM S.A. de C.V., la falta de convergencia entre las modificaciones ejecutadas físicamente en campo por los técnicos instaladores y los registros custodiados por el área de soporte técnico genera discrepancias severas de inventario. A fin de subsanar esta problemática, el presente proyecto desarrolla una plataforma web integral para el inventario, auditoría y mapeo lógico georreferenciado de la red pasiva, optimizando los procesos técnicos y asegurando la trazabilidad de la infraestructura en San José del Rincón."
    ]
    add_plain_text_content(slide2, intro_paragraphs, font_size_pt=19.5, space_after_pt=14)

    # =========================================================
    # SLIDE 3: PLANTEAMIENTO DEL PROBLEMA (PARAGRAPH FORM)
    # =========================================================
    slide3 = prs.slides.add_slide(blank_layout)
    slide3.shapes.add_picture('scratch/slide_bg_content.png', 0, 0, width=Inches(13.333), height=Inches(7.5))
    add_top_right_title_box(slide3, "Planteamiento del Problema")
    
    problema_paragraphs = [
        "En la administración operativa de redes de telecomunicaciones FTTx, la problemática crítica radica en el desfase temporal y la inconsistencia de datos existente entre la infraestructura física desplegada en la vía pública y los registros custodiados por el área de soporte técnico. El seguimiento de puertos en Cajas Terminales Ópticas (NAP) y Distribuidores Ópticos (ODF) se apoya comúnmente en anotaciones manuales, libretas de papel y hojas de cálculo desarticuladas.",
        "Esta carencia de sincronización inmediata genera saturación y cruces de puertos al asignar servicios a conectores que figuran como libres en la documentación pero que se encuentran físicamente conectados en campo, derivando en suspensiones accidentales a clientes activos. Asimismo, durante las intervenciones en postes ubicados en zonas rurales sin cobertura celular, el personal técnico carece de conectividad para consultar la disponibilidad en tiempo real, viéndose obligado a realizar conexiones a ciegas, lo que ocasiona duplicidad de registros, fallas por atenuación excesiva y traslados infructuosos con pérdidas sustanciales de tiempo y recursos."
    ]
    add_plain_text_content(slide3, problema_paragraphs, font_size_pt=18.5, space_after_pt=14)

    # =========================================================
    # SLIDE 4: JUSTIFICACIÓN (PROPER ACADEMIC JUSTIFICATION PARAGRAPH)
    # =========================================================
    slide4 = prs.slides.add_slide(blank_layout)
    slide4.shapes.add_picture('scratch/slide_bg_content.png', 0, 0, width=Inches(13.333), height=Inches(7.5))
    add_top_right_title_box(slide4, "Justificación")
    
    justificacion_paragraphs = [
        "La importancia de este proyecto reside en dotar al personal de campo y a los ingenieros de soporte de una plataforma informática especializada que elimine las asimetrías de información sobre la red de fibra óptica. Desde el punto de vista operativo, proveer una herramienta orientada al técnico instalador permite certificar la asignación de puertos en el instante exacto de la conexión física, minimizando drásticamente los tiempos de atención y resolución de averías, además de suprimir traslados innecesarios para validar disponibilidad.",
        "Desde la perspectiva tecnológica y académica, el proyecto es viable puesto que se fundamenta en herramientas modernas de código abierto y estándares consolidados con control de concurrencia transaccional en PostgreSQL, impidiendo matemáticamente la sobreventa de puertos. Asimismo, la integración del enfoque Offline-First resuelve el desafío de operar en zonas rurales sin señal móvil, garantizando que las cuadrillas capturen y consulten información en sitio con sincronización automática al recuperar cobertura celular."
    ]
    add_plain_text_content(slide4, justificacion_paragraphs, font_size_pt=19.0, space_after_pt=14)

    # =========================================================
    # SLIDE 5: OBJETIVOS (OBJETIVO GENERAL Y ESPECÍFICOS)
    # =========================================================
    slide5 = prs.slides.add_slide(blank_layout)
    slide5.shapes.add_picture('scratch/slide_bg_content.png', 0, 0, width=Inches(13.333), height=Inches(7.5))
    add_top_right_title_box(slide5, "Objetivos del Proyecto")
    
    # Objectives layout: clean text box with clear hierarchy
    tb_obj = slide5.shapes.add_textbox(Inches(1.0), Inches(1.5), Inches(11.333), Inches(4.5))
    tf_o = tb_obj.text_frame
    tf_o.word_wrap = True
    
    # Objetivo General
    p_og_title = tf_o.paragraphs[0]
    p_og_title.text = "Objetivo General:"
    p_og_title.font.name = "Arial"
    p_og_title.font.size = Pt(17)
    p_og_title.font.bold = True
    p_og_title.font.color.rgb = CLR_DARK_OLIVE
    
    p_og = tf_o.add_paragraph()
    p_og.text = "Desarrollar una aplicación web para el inventario y mapeo lógico de redes GPON / FTTx, mediante el diseño de vistas tabulares y diagramas lógicos interactivos, para optimizar el control de la infraestructura por parte del equipo técnico y de soporte en GPON TELECOM S.A. de C.V."
    p_og.alignment = PP_ALIGN.JUSTIFY
    p_og.font.name = "Arial"
    p_og.font.size = Pt(17)
    p_og.font.color.rgb = CLR_TEXT_DARK
    p_og.line_spacing = 1.2
    p_og.space_after = Pt(14)
    
    # Objetivos Específicos
    p_oe_title = tf_o.add_paragraph()
    p_oe_title.text = "Objetivos Específicos:"
    p_oe_title.font.name = "Arial"
    p_oe_title.font.size = Pt(17)
    p_oe_title.font.bold = True
    p_oe_title.font.color.rgb = CLR_DARK_OLIVE
    p_oe_title.space_after = Pt(4)
    
    spec_points = [
        "1. Analizar los requerimientos operativos de la red de fibra óptica mediante el levantamiento de información sobre el hardware (NAP/ODF), para diseñar la arquitectura del sistema y el modelo de la base de datos.",
        "2. Construir una interfaz web responsiva a través del uso de tecnologías de desarrollo frontend, para que los técnicos de campo actualicen y consulten desde su dispositivo el estado de los puertos (libres, ocupados, dañados).",
        "3. Programar el backend del sistema mediante la creación de una API centralizada con control transaccional, para gestionar la información de los activos y vincular los puertos de red correspondientes a los clientes.",
        "4. Implementar mecanismos de sincronización fuera de línea (Offline-First) y generación automatizada de reportes técnicos ejecutivos en formato PDF."
    ]
    
    for sp in spec_points:
        p_sp = tf_o.add_paragraph()
        p_sp.text = sp
        p_sp.alignment = PP_ALIGN.JUSTIFY
        p_sp.font.name = "Arial"
        p_sp.font.size = Pt(15.5)
        p_sp.font.color.rgb = CLR_TEXT_DARK
        p_sp.line_spacing = 1.18
        p_sp.space_after = Pt(6)

    # =========================================================
    # SLIDE 6: HERRAMIENTAS (CLEAN TEXTUAL DESCRIPTION)
    # =========================================================
    slide6 = prs.slides.add_slide(blank_layout)
    slide6.shapes.add_picture('scratch/slide_bg_content.png', 0, 0, width=Inches(13.333), height=Inches(7.5))
    add_top_right_title_box(slide6, "Herramientas")
    
    tb_her = slide6.shapes.add_textbox(Inches(1.0), Inches(1.5), Inches(11.333), Inches(4.5))
    tf_h = tb_her.text_frame
    tf_h.word_wrap = True
    
    p_h_intro = tf_h.paragraphs[0]
    p_h_intro.text = "Para la construcción y puesta en marcha de la plataforma se seleccionó un conjunto de herramientas y tecnologías de desarrollo web moderno:"
    p_h_intro.alignment = PP_ALIGN.JUSTIFY
    p_h_intro.font.name = "Arial"
    p_h_intro.font.size = Pt(17.5)
    p_h_intro.font.color.rgb = CLR_TEXT_DARK
    p_h_intro.space_after = Pt(12)
    p_h_intro.line_spacing = 1.2
    
    tools_items = [
        ("Backend y Servicios Web:", "Node.js como entorno de ejecución asíncrono, Express.js para la arquitectura de servicios RESTful y TypeScript para tipado estático estricto."),
        ("Base de Datos y Persistencia:", "PostgreSQL 16 bajo el servicio cloud Neon Serverless, junto con Sequelize ORM y sentencias de bloqueo pesimista (SELECT ... FOR UPDATE) para control de concurrencia ACID."),
        ("Frontend y Cartografía Digital:", "React 18 con Vite y Tailwind CSS para una interfaz reactiva, integrando la biblioteca Leaflet para la visualización de mapas satelitales y georreferenciación sobre OpenStreetMap."),
        ("Sincronización Offline y Reportes:", "Progressive Web Apps (PWA) con Service Workers y Dexie.js (IndexedDB) para trabajo de campo sin conexión a internet, y PDFKit para la emisión de reportes técnicos.")
    ]
    
    for t_cat, t_desc in tools_items:
        p_t = tf_h.add_paragraph()
        run_bold = p_t.add_run()
        run_bold.text = f"- {t_cat} "
        run_bold.font.name = "Arial"
        run_bold.font.size = Pt(16.5)
        run_bold.font.bold = True
        run_bold.font.color.rgb = CLR_DARK_OLIVE
        
        run_norm = p_t.add_run()
        run_norm.text = t_desc
        run_norm.font.name = "Arial"
        run_norm.font.size = Pt(16.5)
        run_norm.font.color.rgb = CLR_TEXT_DARK
        
        p_t.alignment = PP_ALIGN.JUSTIFY
        p_t.line_spacing = 1.2
        p_t.space_after = Pt(10)

    # =========================================================
    # SLIDE 7: CONCLUSIÓN (PARAGRAPH FORM)
    # =========================================================
    slide7 = prs.slides.add_slide(blank_layout)
    slide7.shapes.add_picture('scratch/slide_bg_content.png', 0, 0, width=Inches(13.333), height=Inches(7.5))
    add_top_right_title_box(slide7, "Conclusión")
    
    conclusion_paragraphs = [
        "El desarrollo del sistema web de inventario y mapeo lógico representa una solución integral y definitiva a la problemática operativa de GPON TELECOM S.A. de C.V. en San José del Rincón. La digitalización y georreferenciación de los activos de planta externa erradica la dependencia de registros manuales en papel, garantizando un control riguroso sobre la ocupación de cada divisor óptico y evitando la sobreventa o cruce de puertos.",
        "La integración del motor transaccional con bloqueo pesimista en PostgreSQL y la arquitectura Offline-First asegura tanto la integridad absoluta de los datos como la continuidad operativa de las cuadrillas en zonas rurales sin señal celular. Con ello se logra una disminución sustancial en los tiempos de instalación, eliminación de quejas por desconexiones involuntarias y una plataforma escalable para soportar el crecimiento continuo de la infraestructura de telecomunicaciones."
    ]
    add_plain_text_content(slide7, conclusion_paragraphs, font_size_pt=19.5, space_after_pt=14)

    # Save presentation
    output_path = "docs/PRESENTACION_AVANCE_RESIDENCIA_GPON.pptx"
    prs.save(output_path)
    print(f"Clean presentation successfully created at: {output_path}")

if __name__ == "__main__":
    generate_background_images()
    build_clean_presentation()
