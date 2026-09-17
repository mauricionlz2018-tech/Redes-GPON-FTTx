import os
import sys
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import parse_xml, OxmlElement
from docx.oxml.ns import nsdecls, qn
import xml.etree.ElementTree as ET

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
    # remove existing color elements
    for c in rPr.xpath('./w:color'):
        rPr.remove(c)
    color_el = OxmlElement('w:color')
    color_el.set(qn('w:val'), '000000')
    rPr.append(color_el)

def style_paragraph(p, text=None, style_name=None, align=None):
    if style_name:
        p.style = style_name
    if text is not None:
        p.text = text
    if align is not None:
        p.alignment = align
    for r in p.runs:
        set_run_black(r)

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

def main():
    base_path = "docs/PORTADA_INSTITUCIONAL (3)_FINAL.docx"
    print(f"Loading {base_path}...")
    doc = docx.Document(base_path)
    body = doc._body._element

    print(f"Initial document state: {len(doc.paragraphs)} paragraphs, {len(doc.tables)} tables, {len(body)} body elements.")

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
            except Exception as e:
                pass

    # 2. Insert Chapter II theoretical diagrams
    # We locate paragraphs by text content
    p_node = None
    p_react = None
    p_sw = None
    p_jwt = None
    p_rbac = None
    p_docker = None
    p_neon = None

    for i, p in enumerate(doc.paragraphs):
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

    # 3. Fix captions that were above drawings
    # Specifically:
    # (a) OSI vs TCP/IP
    # (b) DER
    # (c) Concurrencia transaccional SELECT FOR UPDATE
    # (d) React components frontend
    # (e) Offline-First flow
    # (f) PDFKit streaming flow
    # (g) Docker multicontenedor
    
    # We will search for drawings and their preceding caption paragraphs
    for i, p in enumerate(doc.paragraphs):
        draws = p._p.xpath('.//w:drawing')
        if draws:
            # Check if paragraph immediately before or 2 before is a 'Figura '
            if i > 0 and doc.paragraphs[i-1].text.strip().startswith("Figura "):
                p_cap = doc.paragraphs[i-1]
                # Image is p._p. We want caption below p._p.
                p._p.addnext(p_cap._p)
            elif i > 1 and doc.paragraphs[i-2].text.strip().startswith("Figura "):
                p_cap = doc.paragraphs[i-2]
                p_src = doc.paragraphs[i-1]
                p._p.addnext(p_src._p)
                p._p.addnext(p_cap._p)

    print("Captures and figures order fixed.")

    # 4. Move Maquetado + Adobe Color into Chapter III
    # Elements to move: from '3.7.1 Dise' to '3.7.3 Parad'
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

    # 5. Restructure Headings and Chapter Titles
    # Retitle Chapter III
    # Create Chapter IV Heading before Backend
    # Create Chapter V Heading before React
    # Retitle former Chapter IV to Chapter VI
    # Retitle Conclusiones to Chapter VII
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
            # This is the concurrency section, which will be 4.2
            p.text = "4.2 Ingeniería de concurrencia transaccional ACID y bloqueo pesimista (SELECT ... FOR UPDATE)"
            p.style = "Heading 2"
        elif txt.startswith("3.6 Construcci") and "backend" in txt.lower():
            # We change this to 4.1
            p.text = "4.1 Arquitectura de software modular del backend y capa de servicios RESTful"
            p.style = "Heading 2"
        elif txt.startswith("3.6.1 Arquitectura de Software Modular"):
            p.text = "4.1.1 Arquitectura modular en capas y principios RESTful"
            p.style = "Heading 3"
        elif txt.startswith("3.6.2 M") and "Autenticaci" in txt:
            p.text = "4.4 Módulo de autenticación criptográfica, hashing y emisión de tokens JWT con control RBAC"
            p.style = "Heading 2"
        elif txt.startswith("3.6.3 Validaci"):
            p.text = "4.3 Validación declarativa y sanitización de entrada con Zod"
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
            p.text = ""  # clear redundant
        elif txt.startswith("Referencias bibliogr"):
            p.text = "REFERENCIAS BIBLIOGRÁFICAS"
            p.style = "Heading 1"
        elif txt == "Anexos" or txt == "ANEXOS":
            p.text = "ANEXOS"
            p.style = "Heading 1"

    # Insert Heading 1 for Chapter IV right before 4.1 or 4.2
    # Find paragraph 4.2 or 4.1
    p_cap4_target = None
    for p in doc.paragraphs:
        if p.text.strip().startswith("4.2 Ingenier") or p.text.strip().startswith("4.1 Arquitectura"):
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
    p_sec56 = None
    for p in doc.paragraphs:
        if "5.6 Contenerizaci" in p.text:
            p_sec56 = p
            break
    if p_sec56:
        # Find the last paragraph of section 5.6 (before Chapter VI)
        target_p_56 = p_sec56
        for k in range(doc.paragraphs.index(p_sec56)+1, len(doc.paragraphs)):
            pk = doc.paragraphs[k]
            if pk.style.name.startswith("Heading 1") or "CAPÍTULO VI" in pk.text:
                target_p_56 = doc.paragraphs[k-1]
                break
        insert_figure_after(
            doc, target_p_56,
            "scratch/teoria_despliegue_cloud_neon_vercel.png",
            "Figura 30. Topología de despliegue cloud serverless con Neon PostgreSQL y Vercel.",
            "Fuente: Elaboración propia de la arquitectura de distribución en la nube (2026)."
        )
        print("Inserted Cloud Deployment Diagram in Section 5.6!")

    # 6. Re-number ALL Figures Sequentially and enforce Arial 9pt bold black / Arial 8.5pt italic black
    fig_counter = 1
    for p in doc.paragraphs:
        txt = p.text.strip()
        if txt.startswith("Figura ") and "." in txt:
            # Extract caption title
            parts = txt.split(".", 1)
            if len(parts) == 2:
                title = parts[1].strip()
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

    # 7. Clean up forbidden characters: em-dashes, semicolons, emojis
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

    # 8. Force 100% BLACK font on every single run in document
    for p in doc.paragraphs:
        for r in p.runs:
            set_run_black(r)
    for t in doc.tables:
        for row in t.rows:
            for cell in row.cells:
                for p in cell.paragraphs:
                    for r in p.runs:
                        set_run_black(r)

    # 9. Verify Portada and Contraportada (Elements 0-6)
    print("Checking Portada and Contraportada...")
    print("Table 0 cell 0,0:", repr(doc.tables[0].cell(0,0).text[:50]))
    print("Table 1 cell 0,0:", repr(doc.tables[1].cell(0,0).text[:50]))
    print("Table 2 cell 0,0:", repr(doc.tables[2].cell(0,0).text[:50]))

    output_path = "docs/PORTADA_INSTITUCIONAL (3)_FINAL.docx"
    doc.save(output_path)
    print(f"Successfully saved revised document to {output_path}!")

if __name__ == "__main__":
    main()

