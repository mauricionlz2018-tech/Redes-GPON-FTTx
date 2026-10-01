import os
import re
import shutil
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import parse_xml, OxmlElement
from docx.oxml.ns import nsdecls, qn

def set_para_format(p, line_spacing=1.5, space_after=6, space_before=0, align=WD_ALIGN_PARAGRAPH.JUSTIFY):
    p.paragraph_format.line_spacing = line_spacing
    p.paragraph_format.space_after = Pt(space_after)
    p.paragraph_format.space_before = Pt(space_before)
    p.alignment = align

def set_run_font(run, font_name="Arial", size_pt=11, bold=False, italic=False, color_rgb=None):
    run.font.name = font_name
    run.font.size = Pt(size_pt)
    run.bold = bold
    run.italic = italic
    if color_rgb:
        run.font.color.rgb = color_rgb

def create_caption_xml(fig_num, fig_title_text, bookmark_name):
    clean_text = fig_title_text.strip()
    xml_str = f'''<w:p {nsdecls("w")}>
  <w:pPr>
    <w:pStyle w:val="Figuras"/>
    <w:jc w:val="center"/>
    <w:spacing w:before="120" w:after="60" w:line="240" w:lineRule="auto"/>
  </w:pPr>
  <w:bookmarkStart w:id="{241426300 + fig_num}" w:name="{bookmark_name}"/>
  <w:r>
    <w:rPr>
      <w:rFonts w:ascii="Arial" w:hAnsi="Arial" w:cs="Arial"/>
      <w:b/>
      <w:sz w:val="18"/>
      <w:szCs w:val="18"/>
    </w:rPr>
    <w:t>Figura {fig_num}. {clean_text}</w:t>
  </w:r>
  <w:bookmarkEnd w:id="{241426300 + fig_num}"/>
</w:p>'''
    return parse_xml(xml_str)

def process_document(docx_path):
    print(f"\n==========================================")
    print(f"Processing: {docx_path}")
    print(f"==========================================")
    doc = docx.Document(docx_path)

    # 1. Locate and replace images for Figuras 44, 45, 46
    # Source images:
    src_images_dir = [os.path.join("docs", d) for d in os.listdir("docs") if "dise" in d.lower()][0]
    img_abonados = os.path.join(src_images_dir, "Captura de pantalla 2026-09-30 120814.png")
    img_reportes = os.path.join(src_images_dir, "Captura de pantalla 2026-09-30 120825.png")
    img_personal = os.path.join(src_images_dir, "Captura de pantalla 2026-09-30 120835.png")

    fig44_idx = None
    fig45_idx = None
    fig46_idx = None

    for i, p in enumerate(doc.paragraphs):
        if i < 150:
            continue
        txt = p.text.strip()
        if txt.startswith("Figura 44."):
            fig44_idx = i
        elif txt.startswith("Figura 45."):
            fig45_idx = i
        elif txt.startswith("Figura 46."):
            fig46_idx = i

    print(f"Found Fig 44 at P{fig44_idx}, Fig 45 at P{fig45_idx}, Fig 46 at P{fig46_idx}")

    # Replace image for Fig 44
    p_img44 = doc.paragraphs[fig44_idx - 1]
    p_img44.text = ""
    r44 = p_img44.add_run()
    r44.add_picture(img_abonados, width=Inches(6.0))
    p_img44.alignment = WD_ALIGN_PARAGRAPH.CENTER
    print("Replaced image for Figura 44 with real Padrón de Abonados screenshot.")

    # Replace image for Fig 45
    p_img45 = doc.paragraphs[fig45_idx - 1]
    p_img45.text = ""
    r45 = p_img45.add_run()
    r45.add_picture(img_reportes, width=Inches(6.0))
    p_img45.alignment = WD_ALIGN_PARAGRAPH.CENTER
    print("Replaced image for Figura 45 with real Reportes de Saturación screenshot.")

    # Replace image for Fig 46
    p_img46 = doc.paragraphs[fig46_idx - 1]
    p_img46.text = ""
    r46 = p_img46.add_run()
    r46.add_picture(img_personal, width=Inches(6.0))
    p_img46.alignment = WD_ALIGN_PARAGRAPH.CENTER
    print("Replaced image for Figura 46 with real Gestión de Personal screenshot.")

    # 2. Renumber subsequent figures in body (all figures >= 47 shift by +7)
    # Note: we must do this BEFORE inserting new figures, so we don't accidentally renumber the newly inserted ones.
    print("Renumbering subsequent body figures (>= 47) by +7...")
    body_figs_to_renumber = []
    for i, p in enumerate(doc.paragraphs):
        if i < 150:
            continue
        if p.style.name == "Figuras":
            m = re.match(r"^Figura\s+(\d+)\.\s*(.*)", p.text.strip())
            if m:
                num = int(m.group(1))
                if num >= 47:
                    body_figs_to_renumber.append((i, num, m.group(2)))

    # Process in reverse to avoid collision
    for idx, num, title in reversed(body_figs_to_renumber):
        new_num = num + 7
        new_title_full = f"Figura {new_num}. {title}"
        p = doc.paragraphs[idx]
        
        # update bookmark
        bms = p._p.findall(f'.//{{{nsdecls("w").split("=")[1].strip(chr(34))}}}bookmarkStart')
        new_bm_name = f"_Toc241426{320 + new_num:03d}"
        for b in bms:
            b.attrib[f'{{{nsdecls("w").split("=")[1].strip(chr(34))}}}name'] = new_bm_name
        
        # update run text
        for r in p.runs:
            if "Figura" in r.text:
                r.text = new_title_full
                break
        else:
            # fallback
            p.text = new_title_full
            p.style = "Figuras"
            for r in p.runs:
                set_run_font(r, font_name="Arial", size_pt=9, bold=True)
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER

    print(f"Renumbered {len(body_figs_to_renumber)} body figures.")

    # 3. Locate insertion point for the 7 new modal figures
    # It must be right after Figura 46's "Elaboración propia."
    # Let's find "Elaboración propia." immediately after Fig 46
    insert_idx = None
    for i in range(fig46_idx, fig46_idx + 5):
        if "Elaboración propia" in doc.paragraphs[i].text:
            insert_idx = i + 1
            break
            
    p_target = doc.paragraphs[insert_idx]
    print(f"Insertion point for new modal figures at P{insert_idx}: '{p_target.text[:60]}'")

    # Intro paragraph for modal components
    p_intro = p_target.insert_paragraph_before(
        "Para complementar las vistas maestras de la plataforma y garantizar una interacción ágil, intuitiva y segura "
        "durante las labores de campo y oficina técnica, se maquetaron componentes modales especializados. Estos componentes "
        "gobiernan los flujos transaccionales atómicos de inspección física de cajas terminales, aprovisionamiento de abonados, "
        "georreferenciación de postería y mufas de empalme, delimitación de tendidos de cable óptico y control volumétrico "
        "de metrajes desplegados:",
        style="Normal"
    )
    set_para_format(p_intro, line_spacing=1.5, space_after=6, space_before=6, align=WD_ALIGN_PARAGRAPH.JUSTIFY)
    for r in p_intro.runs:
        set_run_font(r, font_name="Arial", size_pt=11)

    # Define the 7 modal figures data
    new_modals = [
        {
            "fig_num": 47,
            "title": "Maquetado de interfaz - Modal de inspección de caja NAP, matriz física de puertos (1:16) y ficha técnica de abonado.",
            "bookmark": "_Toc241426368",
            "img_path": os.path.join(src_images_dir, "Captura de pantalla 2026-09-30 120929.png"),
            "img_width": Inches(3.5),
            "desc": (
                "La inspección técnica en campo sobre los elementos de planta externa se canaliza mediante el modal de alta fidelidad "
                "de inspección detallada de caja terminal óptica ('NAP-SJR-01', sector Centro), activado al pulsar sobre el nodo geográfico "
                "en el visor cartográfico. La interfaz despliega una matriz física isomórfica 2×8 correspondiente a los 16 puertos de salida "
                "del splitter PLC 1:16 interior, identificando visualmente el estado de cada interfaz mediante código cromático unificado: "
                "azul para puertos ocupados, verde para puertos libres, ámbar para puertos reservados temporalmente y rojo para interfaces "
                "atenuadas o dañadas. En el panel inferior se expone la ficha técnica del puerto seleccionado (#4), detallando el suscriptor "
                "enlazado (María Fernández López), código de contrato (CLI-10901), domicilio, modelo y dirección MAC física de la terminal "
                "ONT Huawei HG8245H, y el nivel de potencia óptica en recepción (-18.2 dBm, clasificado como 'Óptimo' según los límites normativos "
                "de la recomendación ITU-T G.984.2), con accesos directos para la edición del suscriptor, liberación atómica del puerto o reporte de avería."
            )
        },
        {
            "fig_num": 48,
            "title": "Maquetado de interfaz - Modal transaccional de conexión y asignación de abonado a puerto con verificación de potencia óptica Rx.",
            "bookmark": "_Toc241426369",
            "img_path": os.path.join(src_images_dir, "Captura de pantalla 2026-09-30 120901.png"),
            "img_width": Inches(3.8),
            "desc": (
                "Al pulsar sobre cualquier puerto libre de la matriz física, la plataforma invoca de manera reactiva el modal de "
                "aprovisionamiento y conexión de nuevo abonado ('Conectar Abonado a Puerto #1 - NAP-SJR-01'). Este diálogo opera bajo el "
                "régimen de sincronización inmediata ('En Línea - Sincronización ACID inmediata / FTTx LIVE'), garantizando que los datos "
                "capturados se consoliden de forma atómica en la base de datos sin colisión con solicitudes concurrentes. La interfaz "
                "exige la captura rigurosa del número de cuenta/contrato (CLI-37750), nombre completo del titular (Mariana Rodríguez Santos), "
                "selección en catálogo de la marca y modelo de equipo ONT (Huawei EchoLife EG8145V5), dirección MAC unívoca (48:57:02:D1:44:9A), "
                "domicilio del suscriptor y la potencia óptica estimada o medida con Power Meter PON (-19.50 dBm). La acción 'Confirmar Conexión Óptica' "
                "dispara la validación estricta de formatos mediante esquemas Zod y la reserva transaccional pesimista del puerto."
            )
        },
        {
            "fig_num": 49,
            "title": "Maquetado de interfaz - Modal de registro y georreferenciación de nueva caja terminal óptica (NAP) con captura GPS.",
            "bookmark": "_Toc241426370",
            "img_path": os.path.join(src_images_dir, "Captura de pantalla 2026-09-30 120708.png"),
            "img_width": Inches(3.8),
            "desc": (
                "Para la expansión progresiva de la red y el alta de nueva infraestructura pasiva en campo, se diseñó el modal de registro y "
                "despliegue de cajas NAP ('Registrar Nueva Caja NAP en Red'). El formulario contempla la asignación del identificador alfanumérico "
                "normalizado de la caja (ej. 'NAP-SJR-06'), la zona de cobertura operativa (Centro, San Juan, La Purísima), la referencia física o "
                "ubicación sobre postería (ej. Poste CFE frente a Farmacia Guadalajara) y la captura geodésica de alta precisión de las coordenadas GPS "
                "(Latitud 19.667000, Longitud -100.149000). El operador cuenta con la función 'Obtener GPS Actual', la cual consume directamente la API "
                "de Geolocalización del navegador móvil para fijar las coordenadas exactas del técnico a pie de poste. Asimismo, el selector de capacidad "
                "permite parametrizar cajas con splitters balanceados 1:8 o 1:16, asegurando la consistencia topológica del inventario desde el despliegue."
            )
        },
        {
            "fig_num": 50,
            "title": "Maquetado de interfaz - Modal de registro y categorización de postes de soporte e infraestructura aérea (CFE y Propuestos).",
            "bookmark": "_Toc241426371",
            "img_path": os.path.join(src_images_dir, "Captura de pantalla 2026-09-30 120722.png"),
            "img_width": Inches(4.0),
            "desc": (
                "El soporte físico del cableado de fibra óptica aérea exige un registro meticuloso de la postería disponible y proyectada en el municipio. "
                "Mediante el modal 'Agregar Poste de Red e Infraestructura Aérea', las cuadrillas técnicas categorizan cada soporte bajo dos regímenes "
                "operativos: 'Poste Propuesto' (resaltado en carmesí para infraestructura nueva instalada por la empresa) y 'Poste CFE' (para apoyos "
                "pertenecientes a la Comisión Federal de Electricidad bajo convenio de compartición de infraestructura pasiva). La interfaz captura el "
                "código identificador del poste ('POSTE-P-145'), las especificaciones de material y altura ('Concreto 12m de Alta Resistencia', madera "
                "tratada o estructura metálica tubular) y sus coordenadas geodésicas vía la utilidad 'Capturar GPS Móvil', facilitando el cálculo de vanos."
            )
        },
        {
            "fig_num": 51,
            "title": "Maquetado de interfaz - Modal de alta de cierre de empalme / mufa de fibra óptica y especificación de fusiones.",
            "bookmark": "_Toc241426372",
            "img_path": os.path.join(src_images_dir, "Captura de pantalla 2026-09-30 120731.png"),
            "img_width": Inches(4.2),
            "desc": (
                "Los puntos neurálgicos de interconexión y derivación de la red troncal se gestionan mediante el modal 'Agregar Cierre de Empalme / "
                "Mufa (Planta Externa)'. El componente permite registrar cierres de empalme herméticos ('MUFA-IXT-08 Crucero CFE'), seleccionando "
                "la tipología constructiva de la mufa ('Torpedo Domo IP68' para intemperie aérea o cierre horizontal de bajo perfil), la capacidad "
                "nominal de hilos pasantes (hasta 96 fibras), el tipo de fusión óptica dominante ('Derivación a Splitter / NAP' o paso directo troncal), "
                "su estado operativo ('Operativa / En Servicio') y sus coordenadas geográficas. Este registro alimenta la cartografía con la ubicación "
                "exacta de las bandejas de empalme donde intervienen los técnicos fusionistas."
            )
        },
        {
            "fig_num": 52,
            "title": "Maquetado de interfaz - Modal de configuración, trazado geodésico y metraje de tendido de fibra óptica troncal y distribución.",
            "bookmark": "_Toc241426373",
            "img_path": os.path.join(src_images_dir, "Captura de pantalla 2026-09-30 120741.png"),
            "img_width": Inches(4.0),
            "desc": (
                "La delimitación vectorial del cableado sobre la cartografía se formaliza en el modal 'Configurar Línea de Tendido de Fibra Óptica'. "
                "En esta vista, el ingeniero de planta externa define el nombre del enlace ('Troncal Central Ixtlahuaca - Jiquipilco Tramo 2'), el "
                "calibre y capacidad del cable ('Troncal 96H Púrpura #7E22CE - 5px'), visualizando una muestra gráfica del grosor y tonalidad del trazo. "
                "La interfaz integra un motor de cálculo geodésico que computa en tiempo real la distancia acumulada en función de los vértices marcados "
                "sobre el mapa ('4.25 km equivalentes a 4,250 Metros Lineales - ML' a partir de las coordenadas capturadas) y el estado de la obra "
                "(Operativa o En Tendido), automatizando la cubicación de bobinas de cable y el balance óptico preliminar."
            )
        },
        {
            "fig_num": 53,
            "title": "Maquetado de interfaz - Modal de simbología normativa de red, métricas globales de tendido y estándares de empalme óptico.",
            "bookmark": "_Toc241426374",
            "img_path": os.path.join(src_images_dir, "Captura de pantalla 2026-09-30 120754.png"),
            "img_width": Inches(5.0),
            "desc": (
                "Para brindar una visión ejecutiva e industrial estandarizada, se diseñó la ventana modal 'Simbología de Red y Cómputo Total de Metrajes'. "
                "Este tablero consolida la volumetría física de la infraestructura desplegada en el municipio, totalizando 58.40 km de tendido (58,400 metros "
                "lineales) desglosados en Troncal 96H (14.20 km, trazo 5px), Troncal 48H (22.50 km, trazo 4px), Troncal 12H (12.10 km, trazo 3.5px) y "
                "Distribución 12H (9.60 km, trazo 3px). Asimismo, cuantifica los activos pasivos asociados: 42 mufas de empalme, 68 gasas de reserva técnica "
                "contra dilatación térmica, 803 postes CFE y 144 postes propuestos. En la sección inferior, la interfaz expone la norma técnica de fusiones "
                "y empalmes: 1) Fusión de Paso (empalme 1:1 troncal con atenuación <= 0.05 dB), 2) Fusión de Derivación (troncal hacia splitter de NAP) y "
                "3) Sangría Mid-Span (apertura de tubo holgado buffer sin corte de fibras de tránsito)."
            )
        }
    ]

    for item in new_modals:
        # 1. Image paragraph
        p_img = p_target.insert_paragraph_before("", style="Normal")
        set_para_format(p_img, line_spacing=1.0, space_after=6, space_before=10, align=WD_ALIGN_PARAGRAPH.CENTER)
        r_img = p_img.add_run()
        r_img.add_picture(item["img_path"], width=item["img_width"])

        # 2. Caption XML
        cap_elem = create_caption_xml(item["fig_num"], item["title"], item["bookmark"])
        p_target._p.addprevious(cap_elem)

        # 3. Source note
        p_note = p_target.insert_paragraph_before("Elaboración propia.", style="Normal")
        set_para_format(p_note, line_spacing=1.0, space_after=6, space_before=0, align=WD_ALIGN_PARAGRAPH.CENTER)
        for r in p_note.runs:
            set_run_font(r, font_name="Arial", size_pt=9, italic=True)

        # 4. Description paragraph
        p_desc = p_target.insert_paragraph_before(item["desc"], style="Normal")
        set_para_format(p_desc, line_spacing=1.5, space_after=8, space_before=0, align=WD_ALIGN_PARAGRAPH.JUSTIFY)
        for r in p_desc.runs:
            set_run_font(r, font_name="Arial", size_pt=11)

    print("All 7 modal figures inserted successfully.")

    # 4. Synchronize Table of Figures (Índice de figuras)
    print("Rebuilding Índice de figuras...")
    fig_paras_in_body = []
    for p in doc.paragraphs:
        if p.style.name == "Figuras":
            m = re.match(r"^Figura\s+(\d+)\.\s*(.*)", p.text.strip())
            if m:
                fig_num = int(m.group(1))
                fig_title = p.text.strip()
                bms = p._p.findall(f'.//{{{nsdecls("w").split("=")[1].strip(chr(34))}}}bookmarkStart')
                bm_name = None
                for b in bms:
                    b_attr = b.attrib.get(f'{{{nsdecls("w").split("=")[1].strip(chr(34))}}}name')
                    if b_attr and b_attr.startswith("_Toc"):
                        bm_name = b_attr
                        break
                fig_paras_in_body.append((fig_num, fig_title, bm_name))

    print(f"Total figures in body: {len(fig_paras_in_body)}")

    # Locate TOC figures block
    toc_fig_start = None
    toc_fig_end = None
    for i, p in enumerate(doc.paragraphs):
        txt = p.text.strip()
        if txt == "Índice de figuras":
            toc_fig_start = i + 1
        elif txt == "Índice de tablas":
            toc_fig_end = i
            break

    print(f"TOC Figures block: P{toc_fig_start} to P{toc_fig_end}")

    # Delete existing TOC figure entries
    for del_idx in range(toc_fig_end - 1, toc_fig_start - 1, -1):
        p_del = doc.paragraphs[del_idx]
        p_del._p.getparent().remove(p_del._p)

    p_tables_header = doc.paragraphs[toc_fig_start]
    
    for fig_num, fig_title, bm_name in fig_paras_in_body:
        anchor = bm_name if bm_name else f"_Toc241426{320 + fig_num:03d}"
        if fig_num <= 2:
            pg = "8"
        elif fig_num <= 24:
            pg = str(8 + fig_num)
        elif fig_num <= 40:
            pg = str(35 + (fig_num - 24) * 2)
        elif fig_num <= 46:
            pg = str(70 + (fig_num - 40) * 2)
        elif fig_num <= 53:
            pg = str(83 + (fig_num - 46) * 2)
        elif fig_num <= 65:
            pg = str(97 + (fig_num - 53) * 2)
        elif fig_num <= 71:
            pg = "142"
        else:
            pg = str(143 + (fig_num - 71) * 2)

        new_toc_p = p_tables_header.insert_paragraph_before("", style="toc 1")
        new_toc_p.paragraph_format.space_before = Pt(0)
        new_toc_p.paragraph_format.space_after = Pt(0)
        new_toc_p.paragraph_format.line_spacing = 1.15
        xml_hyperlink = f'''<w:hyperlink {nsdecls("w")} w:anchor="{anchor}" w:history="1">
    <w:r>
      <w:rPr>
        <w:rStyle w:val="Hipervnculo"/>
        <w:rFonts w:ascii="Arial" w:hAnsi="Arial" w:cs="Arial"/>
        <w:smallCaps w:val="0"/>
        <w:noProof/>
      </w:rPr>
      <w:t>{fig_title}</w:t>
    </w:r>
    <w:r>
      <w:rPr>
        <w:rFonts w:ascii="Arial" w:hAnsi="Arial" w:cs="Arial"/>
        <w:smallCaps w:val="0"/>
        <w:noProof/>
        <w:webHidden/>
      </w:rPr>
      <w:tab/>
    </w:r>
    <w:r>
      <w:rPr>
        <w:rFonts w:ascii="Arial" w:hAnsi="Arial" w:cs="Arial"/>
        <w:noProof/>
        <w:webHidden/>
      </w:rPr>
      <w:fldChar w:fldCharType="begin"/>
    </w:r>
    <w:r>
      <w:rPr>
        <w:rFonts w:ascii="Arial" w:hAnsi="Arial" w:cs="Arial"/>
        <w:noProof/>
        <w:webHidden/>
      </w:rPr>
      <w:instrText xml:space="preserve"> PAGEREF {anchor} \\h </w:instrText>
    </w:r>
    <w:r>
      <w:rPr>
        <w:rFonts w:ascii="Arial" w:hAnsi="Arial" w:cs="Arial"/>
        <w:noProof/>
        <w:webHidden/>
      </w:rPr>
      <w:fldChar w:fldCharType="separate"/>
    </w:r>
    <w:r>
      <w:rPr>
        <w:rFonts w:ascii="Arial" w:hAnsi="Arial" w:cs="Arial"/>
        <w:noProof/>
        <w:webHidden/>
      </w:rPr>
      <w:t>{pg}</w:t>
    </w:r>
    <w:r>
      <w:rPr>
        <w:rFonts w:ascii="Arial" w:hAnsi="Arial" w:cs="Arial"/>
        <w:noProof/>
        <w:webHidden/>
      </w:rPr>
      <w:fldChar w:fldCharType="end"/>
    </w:r>
</w:hyperlink>'''
        h_elem = parse_xml(xml_hyperlink)
        new_toc_p._p.append(h_elem)

    # Save
    doc.save(docx_path)
    print(f"Document saved successfully: {docx_path}")

if __name__ == "__main__":
    docs = [
        "docs/Documentacion_Residencias_avance.docx",
        "docs/Documentacion_Residencias (4).docx"
    ]
    for d in docs:
        if os.path.exists(d):
            process_document(d)
        else:
            print(f"File not found: {d}")
