import os
import sys
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import parse_xml, OxmlElement
from docx.oxml.ns import nsdecls, qn
import shutil

def set_run_black(run, font_name="Arial", font_size=None, bold=None, italic=None):
    if font_name:
        run.font.name = font_name
    if font_size:
        run.font.size = font_size
    if bold is not None:
        run.font.bold = bold
    if italic is not None:
        run.font.italic = italic
    run.font.color.rgb = RGBColor(0, 0, 0)
    
    # Ensure XML has w:color w:val="000000"
    rPr = run._r.get_or_add_rPr()
    for c in rPr.xpath('./w:color'):
        rPr.remove(c)
    color_el = OxmlElement('w:color')
    color_el.set(qn('w:val'), '000000')
    rPr.append(color_el)

def insert_figure_after(doc, target_p, img_path, caption_text, source_text, width_in=5.8):
    p_img = doc.add_paragraph()
    p_img.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_img = p_img.add_run()
    r_img.add_picture(img_path, width=Inches(width_in))
    
    p_cap = doc.add_paragraph()
    p_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_cap = p_cap.add_run(caption_text)
    set_run_black(r_cap, font_name="Arial", font_size=Pt(9), bold=True)
    
    p_src = doc.add_paragraph()
    p_src.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_src = p_src.add_run(source_text)
    set_run_black(r_src, font_name="Arial", font_size=Pt(8.5), italic=True)
    
    target_p._p.addnext(p_src._p)
    target_p._p.addnext(p_cap._p)
    target_p._p.addnext(p_img._p)
    return p_img, p_cap, p_src

def insert_caption_source_after(doc, target_p, caption_text, source_text):
    p_cap = doc.add_paragraph()
    p_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_cap = p_cap.add_run(caption_text)
    set_run_black(r_cap, font_name="Arial", font_size=Pt(9), bold=True)
    
    p_src = doc.add_paragraph()
    p_src.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_src = p_src.add_run(source_text)
    set_run_black(r_src, font_name="Arial", font_size=Pt(8.5), italic=True)
    
    target_p._p.addnext(p_src._p)
    target_p._p.addnext(p_cap._p)
    return p_cap, p_src

def execute():
    # 0. Start from restored clean base
    src_path = "docs/PORTADA_INSTITUCIONAL (3)_PRE_RESTRUCTURE.docx"
    dest_path = "docs/PORTADA_INSTITUCIONAL (3)_FINAL.docx"
    print(f"Copying clean base from {src_path} to {dest_path}...")
    shutil.copyfile(src_path, dest_path)

    doc = docx.Document(dest_path)
    body = doc._body._element

    print(f"Base loaded: {len(doc.paragraphs)} paragraphs, {len(doc.tables)} tables, {len(body)} body elements.")

    # 1. Update all Styles to have font.color = black and w:color = 000000
    for s in doc.styles:
        if hasattr(s, 'font') and s.font:
            try:
                s.font.color.rgb = RGBColor(0, 0, 0)
                if hasattr(s, '_element') and s._element is not None:
                    rPr = s._element.xpath('.//w:rPr')
                    for rp in rPr:
                        for c in rp.xpath('./w:color'):
                            rp.remove(c)
                        color_el = OxmlElement('w:color')
                        color_el.set(qn('w:val'), '000000')
                        rp.append(color_el)
            except Exception:
                pass

    # 2. Fix captions that were above drawings in original document
    # We collect them before mutating
    to_fix_2 = []
    to_fix_1 = []
    for i, p in enumerate(doc.paragraphs):
        if i < 100: continue
        txt = p.text.strip()
        if txt.startswith("Figura "):
            p_next1 = doc.paragraphs[i+1] if i+1 < len(doc.paragraphs) else None
            p_next2 = doc.paragraphs[i+2] if i+2 < len(doc.paragraphs) else None
            if p_next2 and len(p_next2._p.xpath('.//w:drawing')) > 0:
                to_fix_2.append((p, doc.paragraphs[i+1], p_next2))
            elif p_next1 and len(p_next1._p.xpath('.//w:drawing')) > 0:
                to_fix_1.append((p, p_next1))

    print(f"Fixing figure caption orders: {len(to_fix_2)} next2, {len(to_fix_1)} next1.")
    for p_cap, p_src, p_draw in to_fix_2:
        p_draw._p.addnext(p_src._p)
        p_draw._p.addnext(p_cap._p)

    for p_cap, p_draw in to_fix_1:
        p_draw._p.addnext(p_cap._p)

    # 3. Add missing captions for drawings that didn't have one
    # (a) P[455] (Map of San Jose del Rincon)
    # (b) P[470] (Roles / RBAC)
    # (c) P[546] (ODN hierarchical architecture)
    for i, p in enumerate(doc.paragraphs):
        txt = p.text.strip()
        if "Análisis Documental Forense de Libretas" in txt or "Anlisis Documental Forense" in txt:
            # next paragraph is drawing
            p_draw = doc.paragraphs[i+1]
            if len(p_draw._p.xpath('.//w:drawing')) > 0:
                insert_caption_source_after(
                    doc, p_draw,
                    "Figura 16. Levantamiento y dispersión geográfica de cajas terminales ópticas en San José del Rincón.",
                    "Fuente: Elaboración propia a partir de datos cartográficos de campo (2026)."
                )
                print("Added caption for San Jose del Rincon map.")
                break

    for i, p in enumerate(doc.paragraphs):
        txt = p.text.strip()
        if "3.- ACT-03 Técnico de Campo" in txt or "3.- ACT-03 Tcnico de Campo" in txt:
            p_draw = doc.paragraphs[i+1]
            if len(p_draw._p.xpath('.//w:drawing')) > 0:
                insert_caption_source_after(
                    doc, p_draw,
                    "Figura 17. Modelo conceptual de actores del sistema y jerarquía de privilegios de acceso.",
                    "Fuente: Elaboración propia según el modelo RBAC institucional (2026)."
                )
                print("Added caption for RBAC actors diagram.")
                break

    for i, p in enumerate(doc.paragraphs):
        txt = p.text.strip()
        if "5. Acometida Domiciliaria (Fibra Drop)" in txt:
            p_draw = doc.paragraphs[i+1]
            if len(p_draw._p.xpath('.//w:drawing')) > 0:
                insert_caption_source_after(
                    doc, p_draw,
                    "Figura 19. Arquitectura jerárquica de la red de distribución óptica (ODN) y niveles de división.",
                    "Fuente: Elaboración propia conforme a la topología GPON desplegada (2026)."
                )
                print("Added caption for ODN architecture diagram.")
                break

    # 4. Insert Chapter II theoretical diagrams in their exact subsections
    p_node = None
    p_react = None
    p_sw = None
    p_jwt = None
    p_rbac = None
    p_docker = None
    p_neon = None

    for p in doc.paragraphs:
        txt = p.text.strip()
        if "A diferencia de los servidores web tradicionales multihilo" in txt:
            p_node = p
        elif "Mediante los Hooks de React" in txt:
            p_react = p
        elif "Su ciclo de vida comprende tres fases: Registro, Instalaci" in txt:
            p_sw = p
        elif "Al recibir una petici" in txt and "Authorization: Bearer" in txt:
            p_jwt = p
        elif "- T" in txt and "cnico de Campo: Privilegios acotados a lectura cartogr" in txt:
            p_rbac = p
        elif "A diferencia de las m" in txt and "quinas virtuales basadas en hipervisor" in txt:
            p_docker = p
        elif "Asimismo, Neon introduce el mecanismo de auto-suspensi" in txt:
            p_neon = p

    print(f"Found insertion targets: Node={p_node is not None}, React={p_react is not None}, SW={p_sw is not None}, JWT={p_jwt is not None}, RBAC={p_rbac is not None}, Docker={p_docker is not None}, Neon={p_neon is not None}")

    if p_node:
        insert_figure_after(
            doc, p_node,
            "scratch/teoria_event_loop_nodejs.png",
            "Figura 9. Arquitectura del bucle de eventos (Event Loop) y concurrencia no bloqueante en Node.js.",
            "Fuente: Elaboración propia adaptado de Node.js Foundation (2024)."
        )
    if p_react:
        insert_figure_after(
            doc, p_react,
            "scratch/teoria_react_virtual_dom.png",
            "Figura 10. Algoritmo de reconciliación y árbol de componentes mediante Virtual DOM en React.",
            "Fuente: Elaboración propia adaptado de React Documentation Team (2023)."
        )
    if p_sw:
        insert_figure_after(
            doc, p_sw,
            "scratch/teoria_service_worker_lifecycle.png",
            "Figura 11. Ciclo de vida, registro y estrategias de intercepción de caché de un Service Worker.",
            "Fuente: Elaboración propia adaptado de W3C Service Workers Specification (2022)."
        )
    if p_jwt:
        insert_figure_after(
            doc, p_jwt,
            "scratch/teoria_jwt_structure_flow.png",
            "Figura 12. Estructura criptográfica y flujo de autenticación sin estado mediante JSON Web Tokens (RFC 7519).",
            "Fuente: Elaboración propia adaptado de Jones et al. (2015)."
        )
    if p_rbac:
        insert_figure_after(
            doc, p_rbac,
            "scratch/teoria_rbac_model.png",
            "Figura 13. Modelo formal de Control de Acceso Basado en Roles (RBAC) estándar NIST.",
            "Fuente: Elaboración propia adaptado de NIST Special Publication 800-162 (2014)."
        )
    if p_docker:
        insert_figure_after(
            doc, p_docker,
            "scratch/teoria_docker_vs_vm.png",
            "Figura 14. Comparativa de aislamiento y compartición del núcleo entre Contenedores Docker y Máquinas Virtuales.",
            "Fuente: Elaboración propia adaptado de Merkel (2014) y Docker Inc. (2023)."
        )
    if p_neon:
        insert_figure_after(
            doc, p_neon,
            "scratch/teoria_neon_serverless_architecture.png",
            "Figura 15. Arquitectura de computación sin servidor y almacenamiento desagregado en Neon PostgreSQL.",
            "Fuente: Elaboración propia adaptado de Neon Inc. (2024). Recuperado de https://neon.tech/docs/introduction/architecture."
        )

    # 5. Move Maquetado + Adobe Color into Chapter III
    start_idx = None
    end_idx = None
    target_idx = None

    for idx, el in enumerate(body):
        tag = el.tag.split('}')[-1]
        if tag == 'p':
            txt = ''.join(el.xpath('.//w:t/text()')).strip()
            if "3.7.1 Dise" in txt:
                start_idx = idx
            elif "3.7.3 Parad" in txt and start_idx is not None and end_idx is None:
                end_idx = idx
            elif "Restricci" in txt and "id_puerto_nap es UNIQUE" in txt:
                target_idx = idx

    print(f"Moving elements: start_idx={start_idx}, end_idx={end_idx}, target_idx={target_idx}")
    if start_idx is not None and end_idx is not None and target_idx is not None:
        elements_to_move = [body[k] for k in range(start_idx, end_idx)]
        cur_target = body[target_idx]
        for el in elements_to_move:
            cur_target.addnext(el)
            cur_target = el
        print(f"Successfully moved {len(elements_to_move)} elements into Chapter III!")

    # 6. Restructure Headings and Chapter Titles
    for p in doc.paragraphs:
        txt = p.text.strip()
        
        # Chapter III
        if txt == "CAPITULO III. DESARROLLO DEL PROYECTO" or txt == "CAPÍTULO III. DESARROLLO DEL PROYECTO":
            p.text = "CAPÍTULO III. DISEÑO Y MAQUETADO DEL SISTEMA"
            p.style = "Heading 1"
        elif txt.startswith("3.1 recolecci") or txt.startswith("3.1 Recolecci"):
            p.text = "3.1 Levantamiento de información y diagnóstico de planta externa"
            p.style = "Heading 2"
        elif txt.startswith("3.2 Especificaci"):
            p.text = "3.2 Especificación formal de requerimientos de software (SRS)"
            p.style = "Heading 2"
        elif txt.startswith("3.3 Arquitectura topol"):
            p.text = "3.3 Arquitectura topológica de la red óptica y plan de atenuación"
            p.style = "Heading 2"
        elif txt.startswith("3.4 Modelado conceptual"):
            p.text = "3.4 Modelado conceptual, lógico y físico de la base de datos relacional"
            p.style = "Heading 2"
        elif txt.startswith("3.7.1 Dise"):
            p.text = "3.5 Diseño centrado en el usuario (UCD), arquitectura de información y maquetado del sistema"
            p.style = "Heading 2"
        elif txt.startswith("3.7.2 Definici"):
            p.text = "3.6 Definición de la paleta cromática institucional y pruebas de accesibilidad con Adobe Color"
            p.style = "Heading 2"

        # Chapter IV
        elif txt.startswith("3.5 Ingenier") and "concurrencia transaccional" in txt.lower():
            p.text = "4.1 Ingeniería de concurrencia transaccional ACID y bloqueo pesimista (SELECT ... FOR UPDATE)"
            p.style = "Heading 2"
        elif txt.startswith("3.6 Construcci") and "backend" in txt.lower():
            p.text = "4.2 Construcción del backend y arquitectura de servicios modulares RESTful"
            p.style = "Heading 2"
        elif txt.startswith("3.6.1 Arquitectura de Software Modular"):
            p.text = "4.2.1 Arquitectura modular en capas y principios RESTful"
            p.style = "Heading 3"
        elif txt.startswith("3.6.3 Validaci"):
            p.text = "4.3 Validación declarativa y sanitización de entrada de datos con Zod"
            p.style = "Heading 2"
        elif txt.startswith("3.6.2 M") and "Autenticaci" in txt:
            p.text = "4.4 Módulo de autenticación criptográfica, hashing y emisión de tokens JWT con control RBAC"
            p.style = "Heading 2"

        # Chapter V
        elif txt.startswith("3.7 Construcci") and "interfaz de usuario" in txt.lower():
            p.text = "CAPÍTULO V. IMPLEMENTACIÓN Y DESPLIEGUE DEL SISTEMA"
            p.style = "Heading 1"
        elif txt.startswith("3.7.3 Paradigma Reactivo"):
            p.text = "5.1 Paradigma reactivo basado en componentes y compilación Vite"
            p.style = "Heading 2"
        elif txt.startswith("3.7.4 Visor Cartogr"):
            p.text = "5.2 Visor cartográfico geoespacial ('GponMap.tsx') y semaforización cromática de puertos"
            p.style = "Heading 2"
        elif txt.startswith("3.7.5 Matriz F"):
            p.text = "5.3 Matriz física de chasis de 16 puertos ('NapPortMatrix.tsx') y asignación interactiva"
            p.style = "Heading 2"
        elif txt.startswith("3.8 Implementaci"):
            p.text = "5.4 Implementación de la capacidad móvil offline-first con Dexie.js y almacenamiento IndexedDB"
            p.style = "Heading 2"
        elif txt.startswith("3.9 Automatizaci"):
            p.text = "5.5 Automatización de reportes técnicos ejecutivos en PDF mediante streaming con PDFKit"
            p.style = "Heading 2"
        elif txt.startswith("3.10 Contenerizaci"):
            p.text = "5.6 Contenerización con Docker y despliegue cloud serverless en Neon PostgreSQL y Vercel"
            p.style = "Heading 2"

        # Chapter VI
        elif "CAP" in txt.upper() and "PRUEBAS Y RESULTADOS" in txt.upper():
            p.text = "CAPÍTULO VI. PRUEBAS Y RESULTADOS"
            p.style = "Heading 1"
        elif txt.startswith("4.1. Pruebas") or txt.startswith("4.1 Pruebas"):
            p.text = "6.1 Entorno de validación y casos de prueba transaccionales"
            p.style = "Heading 2"

        # Chapter VII
        elif txt == "Conclusiones" or txt == "CONCLUSIONES":
            p.text = "CAPÍTULO VII. CONCLUSIONES Y RECOMENDACIONES"
            p.style = "Heading 1"
        elif txt == "Glosario" or txt == "GLOSARIO":
            p.text = "GLOSARIO DE TÉRMINOS TÉCNICOS"
            p.style = "Heading 1"
        elif txt == "Referencias" or txt == "REFERENCIAS":
            p.text = ""
        elif txt.startswith("Referencias bibliogr"):
            p.text = "REFERENCIAS BIBLIOGRÁFICAS"
            p.style = "Heading 1"
        elif txt == "Anexos" or txt == "ANEXOS":
            p.text = "ANEXOS"
            p.style = "Heading 1"

    # Insert Heading 1 and narrative for Chapter IV right before Section 4.1
    p_cap4_target = None
    for p in doc.paragraphs:
        if p.text.strip().startswith("4.1 Ingenier"):
            p_cap4_target = p
            break
    
    if p_cap4_target:
        p_cap4 = doc.add_paragraph()
        p_cap4.style = "Heading 1"
        r_c4 = p_cap4.add_run("CAPÍTULO IV. CODIFICACIÓN DEL SISTEMA")
        set_run_black(r_c4, font_name="Arial", font_size=Pt(16), bold=True)
        
        p_intro4 = doc.add_paragraph()
        p_intro4.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        r_in4 = p_intro4.add_run(
            "En el presente capítulo se aborda la codificación y lógica de negocio del sistema de inventario y mapeo lógico GPON / FTTx. "
            "Se describe la construcción modular del servidor backend sobre Node.js y TypeScript, el blindaje transaccional ACID mediante sentencias de bloqueo pesimista en base de datos para la eliminación total de sobreventa de puertos ópticos, la validación declarativa de contratos de datos con la biblioteca Zod y la implementación de mecanismos de autenticación criptográfica sin estado con JSON Web Tokens bajo un esquema estricto de control de acceso basado en roles."
        )
        set_run_black(r_in4, font_name="Arial", font_size=Pt(11))
        
        p_cap4_target._p.addprevious(p_intro4._p)
        p_intro4._p.addprevious(p_cap4._p)
        print("Inserted CAPÍTULO IV. CODIFICACIÓN DEL SISTEMA successfully!")

    # Insert Cloud Deployment Diagram in Section 5.6
    p_sec56_idx = None
    for i, p in enumerate(doc.paragraphs):
        if "5.6 Contenerizaci" in p.text:
            p_sec56_idx = i
            break
    if p_sec56_idx is not None:
        target_p_56 = doc.paragraphs[p_sec56_idx]
        for k in range(p_sec56_idx + 1, len(doc.paragraphs)):
            pk = doc.paragraphs[k]
            if pk.style.name.startswith("Heading 1") or "CAPÍTULO VI" in pk.text or "CAPITULO VI" in pk.text:
                target_p_56 = doc.paragraphs[k - 1]
                break
        insert_figure_after(
            doc, target_p_56,
            "scratch/teoria_despliegue_cloud_neon_vercel.png",
            "Figura 30. Topología de despliegue cloud serverless con Neon PostgreSQL y Vercel.",
            "Fuente: Elaboración propia de la arquitectura de distribución en la nube (2026)."
        )
        print("Inserted Cloud Deployment Diagram in Section 5.6!")

    # 7. Re-number ALL Figures Sequentially (skipping preliminary TOC, i > 120) and enforce Arial 9pt bold black / Arial 8.5pt italic black
    fig_counter = 1
    for i, p in enumerate(doc.paragraphs):
        if i < 120:
            continue
        txt = p.text.strip()
        if txt.startswith("Figura ") and "." in txt:
            parts = txt.split(".", 1)
            if len(parts) == 2:
                title = parts[1].strip()
                # Clean any previous number
                new_caption = f"Figura {fig_counter}. {title}"
                p.text = new_caption
                p.alignment = WD_ALIGN_PARAGRAPH.CENTER
                for r in p.runs:
                    set_run_black(r, font_name="Arial", font_size=Pt(9), bold=True)
                fig_counter += 1
        elif txt.startswith("Fuente:") or txt.startswith("Elaboraci"):
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            for r in p.runs:
                set_run_black(r, font_name="Arial", font_size=Pt(8.5), italic=True)

    print(f"Total numbered figures in document: {fig_counter - 1}")

    # 8. Clean up forbidden characters: em-dashes, semicolons, emojis
    for p in doc.paragraphs:
        if "—" in p.text or ";" in p.text:
            for r in p.runs:
                r.text = r.text.replace("—", "-").replace(";", ",")
    for t in doc.tables:
        for row in t.rows:
            for cell in row.cells:
                for p in cell.paragraphs:
                    if "—" in p.text or ";" in p.text:
                        for r in p.runs:
                            r.text = r.text.replace("—", "-").replace(";", ",")

    # 9. Force 100% BLACK font on every single run across paragraphs and tables
    for p in doc.paragraphs:
        for r in p.runs:
            set_run_black(r)
    for t in doc.tables:
        for row in t.rows:
            for cell in row.cells:
                for p in cell.paragraphs:
                    for r in p.runs:
                        set_run_black(r)

    # 10. Update preliminary TOC (paragraphs 7-57) to reflect all chapters
    toc_entries = [
        ("Capítulo I. Antecedentes", "11"),
        ("1.1. Contexto de la organización", "11"),
        ("1.2. Situación operativa previa y problemática de gestión", "11"),
        ("Capítulo II. Marco teórico o estado del arte", "15"),
        ("2.1. Infraestructura de redes ópticas y telecomunicaciones", "15"),
        ("2.2. Redes ópticas pasivas (PON) y arquitecturas FTTx", "20"),
        ("2.3. Sistemas de información geográfica (GIS) y cartografía digital", "25"),
        ("2.4. Sistemas gestores de bases de datos relacionales y concurrencia", "28"),
        ("2.5. Tecnologías y arquitectura para el desarrollo web moderno", "31"),
        ("2.6. Aplicaciones web progresivas (PWA) y arquitectura sin conexión", "34"),
        ("2.7. Seguridad informática, autenticación y autorización", "36"),
        ("2.8. Contenedores de software y entornos de despliegue en la nube", "39"),
        ("Capítulo III. Diseño y maquetado del sistema", "42"),
        ("3.1. Levantamiento de información y diagnóstico de planta externa", "42"),
        ("3.2. Especificación formal de requerimientos de software (SRS)", "44"),
        ("3.3. Arquitectura topológica de la red óptica y plan de atenuación", "50"),
        ("3.4. Modelado conceptual, lógico y físico de la base de datos relacional", "53"),
        ("3.5. Diseño centrado en el usuario (UCD) y maquetado del sistema", "58"),
        ("3.6. Definición de paleta cromática y pruebas de accesibilidad con Adobe Color", "62"),
        ("Capítulo IV. Codificación del sistema", "65"),
        ("4.1. Ingeniería de concurrencia transaccional ACID y bloqueo pesimista", "65"),
        ("4.2. Construcción del backend y arquitectura de servicios modulares RESTful", "67"),
        ("4.3. Validación declarativa y sanitización de entrada de datos con Zod", "69"),
        ("4.4. Módulo de autenticación criptográfica JWT y control RBAC", "71"),
        ("Capítulo V. Implementación y despliegue del sistema", "73"),
        ("5.1. Paradigma reactivo basado en componentes y compilación Vite", "73"),
        ("5.2. Visor cartográfico geoespacial interactivo y semaforización de puertos", "75"),
        ("5.3. Matriz física de chasis de 16 puertos y asignación interactiva", "77"),
        ("5.4. Capacidad móvil offline-first con Dexie.js y almacenamiento IndexedDB", "79"),
        ("5.5. Automatización de reportes técnicos ejecutivos en PDF con PDFKit", "81"),
        ("5.6. Contenerización con Docker y despliegue cloud serverless", "83"),
        ("Capítulo VI. Pruebas y resultados", "86"),
        ("6.1. Entorno de validación y casos de prueba transaccionales", "86"),
        ("Capítulo VII. Conclusiones y recomendaciones", "88"),
        ("7.1. Conclusiones del proyecto", "88"),
        ("7.2. Recomendaciones de trabajo futuro", "89"),
        ("Glosario de términos técnicos", "90"),
        ("Referencias bibliográficas", "92"),
        ("Anexos", "97"),
        ("Anexo A. Cronograma de actividades de residencia profesional", "97")
    ]

    p_toc_start = None
    p_toc_end = None
    for i, p in enumerate(doc.paragraphs[:70]):
        if "Índice de contenido" in p.text or "ndice de contenido" in p.text:
            p_toc_start = i + 1
        elif "Resumen" in p.text and p_toc_start is not None:
            p_toc_end = i
            break

    if p_toc_start is not None and p_toc_end is not None:
        idx = 0
        for p_i in range(p_toc_start, p_toc_end):
            p = doc.paragraphs[p_i]
            if idx < len(toc_entries):
                title, page = toc_entries[idx]
                p.text = f"{title}\t{page}"
                set_run_black(p.runs[0] if p.runs else p.add_run())
                idx += 1
            else:
                p.text = ""

    # 11. Final Save
    doc.save(dest_path)
    print(f"Successfully saved revised document to {dest_path}!")

if __name__ == "__main__":
    execute()
