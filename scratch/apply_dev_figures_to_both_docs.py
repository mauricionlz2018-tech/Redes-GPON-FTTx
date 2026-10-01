import docx
import re
import os
import shutil
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

ARTIFACT_DIR = "C:/Users/karen/.gemini/antigravity/brain/a33b5b22-c89b-4ff3-a6cc-733a0c69ceac"

def set_run_font(run, font_name="Arial", size_pt=11, bold=False, italic=False, color_rgb=(0,0,0)):
    run.font.name = font_name
    run.font.size = Pt(size_pt)
    run.bold = bold
    run.italic = italic
    if color_rgb:
        run.font.color.rgb = RGBColor(*color_rgb)
    rPr = run._r.get_or_add_rPr()
    rFonts = parse_xml(f'<w:rFonts {nsdecls("w")} w:ascii="{font_name}" w:hAnsi="{font_name}" w:cs="{font_name}"/>')
    rPr.append(rFonts)

def set_para_format(p, line_spacing=1.5, space_after=6, space_before=0, align=WD_ALIGN_PARAGRAPH.JUSTIFY):
    p.paragraph_format.line_spacing = line_spacing
    p.paragraph_format.space_after = Pt(space_after)
    p.paragraph_format.space_before = Pt(space_before)
    p.alignment = align

def update_or_add_bookmark(paragraph, bookmark_name, bookmark_id):
    p = paragraph._p
    # Remove existing bookmarkStart and bookmarkEnd
    for b in p.findall(f'.//{{{nsdecls("w").split("=")[1].strip(chr(34))}}}bookmarkStart'):
        b.getparent().remove(b)
    for b in p.findall(f'.//{{{nsdecls("w").split("=")[1].strip(chr(34))}}}bookmarkEnd'):
        b.getparent().remove(b)
        
    bm_start = parse_xml(f'<w:bookmarkStart {nsdecls("w")} w:id="{bookmark_id}" w:name="{bookmark_name}"/>')
    bm_end = parse_xml(f'<w:bookmarkEnd {nsdecls("w")} w:id="{bookmark_id}"/>')
    p.insert(0, bm_start)
    p.append(bm_end)

def process_file(doc_path):
    print(f"\n========================================================")
    print(f"PROCESSING: {doc_path}")
    print(f"========================================================")
    
    doc = docx.Document(doc_path)

    # 1. Renumber existing figures in body (59 to 83 -> 65 to 89)
    print("Renumbering existing figures in body (59-83 to 65-89)...")
    body_figs_renumbered = 0
    for old_num in range(83, 58, -1):
        new_num = old_num + 6
        target_prefix = f"Figura {old_num}."
        new_prefix = f"Figura {new_num}."
        for p in doc.paragraphs:
            if p.style.name == "Figuras" and p.text.strip().startswith(target_prefix):
                p.text = p.text.replace(target_prefix, new_prefix)
                # Assign new bookmark
                bm_name = f"_Toc241426{320 + new_num:03d}"
                update_or_add_bookmark(p, bm_name, 2000 + new_num)
                body_figs_renumbered += 1
                break
    print(f"Renumbered {body_figs_renumbered} body figures.")

    # 2. Renumber subsections of 4.1
    print("Renumbering 4.1.x subsections...")
    subsections_to_shift = [
        ("4.1.5 Arquitectura de Integración", "4.1.6 Arquitectura de Integración"),
        ("4.1.4 Inicialización del Servidor", "4.1.5 Inicialización del Servidor"),
        ("4.1.3 Validación Declarativa", "4.1.4 Validación Declarativa"),
        ("4.1.2 Módulo de Autenticación", "4.1.3 Módulo de Autenticación"),
        ("4.1.1 Arquitectura de Software", "4.1.2 Arquitectura de Software")
    ]
    for old_txt, new_txt in subsections_to_shift:
        for p in doc.paragraphs:
            if old_txt in p.text:
                p.text = p.text.replace(old_txt, new_txt)
                print(f"  {old_txt[:25]}... -> {new_txt[:25]}...")
                break

    # 3. Locate insertion point for 4.1.1 Configuración Inicial...
    target_idx = None
    for i, p in enumerate(doc.paragraphs):
        if "4.1.2 Arquitectura de Software Modular" in p.text:
            target_idx = i
            break
            
    if target_idx is None:
        print("ERROR: Could not find target paragraph 4.1.2 Arquitectura de Software!")
        return

    p_target = doc.paragraphs[target_idx]
    print(f"Insertion point found at P{target_idx}: '{p_target.text}'")

    # Heading 3
    p_h3 = p_target.insert_paragraph_before("4.1.1 Configuración Inicial del Entorno, Repositorio Git y Dependencias del Proyecto", style="Heading 3")
    set_para_format(p_h3, line_spacing=1.5, space_after=6, space_before=12, align=WD_ALIGN_PARAGRAPH.LEFT)
    for r in p_h3.runs:
        set_run_font(r, font_name="Arial", size_pt=12, bold=True)

    intro_p = p_target.insert_paragraph_before(
        "El proceso de desarrollo de software para el sistema de inventario y mapeo lógico de la red GPON/FTTx "
        "inició formalmente con la preparación del entorno de trabajo, el aprovisionamiento de la infraestructura "
        "de control de versiones y la estructuración del proyecto backend. Para garantizar un desarrollo ordenado, "
        "trazable y colaborativo, se adoptó la metodología de control de versiones distribuido con Git y GitHub, "
        "combinada con el gestor de paquetes de alto rendimiento PNPM (Performant Node Package Manager). "
        "A continuación se documenta de forma cronológica la secuencia de configuración y despliegue del entorno base:",
        style="Normal"
    )
    set_para_format(intro_p, line_spacing=1.5, space_after=6, space_before=0, align=WD_ALIGN_PARAGRAPH.JUSTIFY)
    for r in intro_p.runs:
        set_run_font(r, font_name="Arial", size_pt=11)

    # 6 Steps and Figures
    new_figures_data = [
        {
            "step_title": "Paso 1: Aprovisionamiento del Repositorio Remoto en GitHub",
            "step_desc": (
                "Como primer paso formal del ciclo de desarrollo, se realizó el aprovisionamiento del repositorio "
                "remoto en la plataforma GitHub bajo el identificador institucional `mauricionlz2018-tech / Redes-GPON-FTTx`. "
                "La configuración remota estableció la rama principal (`main`) como línea base de producción para alojar "
                "el código fuente, la documentación técnica y los esquemas de base de datos. Esta plataforma proporciona la "
                "trazabilidad histórica de cada confirmación (commit), la gestión de ramas para el desarrollo de módulos "
                "independientes y el respaldo seguro de los activos digitales del proyecto, habilitando además la integración "
                "continua y el trabajo concurrente entre los desarrolladores."
            ),
            "img_path": "docs/Captura de pantalla 2026-09-02 120826.png",
            "img_width": Inches(6.0),
            "fig_num": 59,
            "fig_title": "Figura 59. Aprovisionamiento del repositorio remoto en GitHub para control de versiones del proyecto (mauricionlz2018-tech / Redes-GPON-FTTx).",
            "bookmark": "_Toc241426379"
        },
        {
            "step_title": "Paso 2: Clonado del Repositorio mediante Git CLI",
            "step_desc": (
                "Una vez aprovisionado el repositorio en la nube, se procedió a su clonación hacia el equipo de desarrollo "
                "local mediante la interfaz de línea de comandos de Git (CLI), ejecutando la instrucción "
                "`git clone https://github.com/mauricionlz2018-tech/Redes-GPON-FTTx.git`. Este comando inicializó el árbol "
                "de trabajo local enlazado al origen remoto (`origin`), vinculando las referencias de seguimiento de ramas y "
                "permitiendo sincronizar cambios bidireccionalmente entre el entorno local y la nube de forma segura mediante "
                "protocolos criptográficos HTTPS."
            ),
            "img_path": "docs/desarrollo_setup/setup_02_git_clone.png",
            "img_width": Inches(6.0),
            "fig_num": 60,
            "fig_title": "Figura 60. Clonado del repositorio remoto mediante la interfaz de comandos Git (CLI) en el entorno de desarrollo local.",
            "bookmark": "_Toc241426380"
        },
        {
            "step_title": "Paso 3: Estructuración del Directorio Raíz y Submódulo Backend",
            "step_desc": (
                "Con el repositorio clonado localmente, se organizó la arquitectura de directorios del espacio de trabajo. "
                "Se estructuró la carpeta raíz `Redes-Mapeo-GPON-FTTx` bajo sincronización continua con la nube, y se creó el "
                "directorio dedicado `backend` para albergar exclusivamente los servicios del servidor, la capa de acceso a datos, "
                "los controladores RESTful y las reglas de negocio. Esta separación física de módulos previene el acoplamiento "
                "de dependencias y sienta las bases para una arquitectura desacoplada que posteriormente alojará el módulo frontend "
                "en su propio espacio aislado."
            ),
            "img_path": "docs/desarrollo_setup/setup_03_directorios_proyecto.png",
            "img_width": Inches(6.0),
            "fig_num": 61,
            "fig_title": "Figura 61. Estructuración del directorio raíz del proyecto y creación del submódulo backend en el sistema de archivos.",
            "bookmark": "_Toc241426381"
        },
        {
            "step_title": "Paso 4: Inicialización del Proyecto con PNPM y Generación de package.json",
            "step_desc": (
                "Para gestionar las dependencias del proyecto se seleccionó PNPM (Performant npm) en su versión 10.33.1, "
                "ejecutando en la consola la instrucción `pnpm init`. Este comando generó automáticamente el archivo de manifiesto "
                "`package.json`, estableciendo el identificador del proyecto (`Redes-GPON-FTTx`), la versión inicial semántica (`1.0.0`), "
                "el punto de entrada principal (`index.js`), los scripts de ejecución y el campo declarativo `packageManager`. A diferencia "
                "de los gestores tradicionales, PNPM utiliza un almacén global basado en enlaces duros (hard links), lo que optimiza "
                "radicalmente el consumo de almacenamiento en disco y previene la duplicidad de paquetes en entornos multicapa."
            ),
            "img_path": "docs/desarrollo_setup/setup_04_pnpm_init_package_json.png",
            "img_width": Inches(5.8),
            "fig_num": 62,
            "fig_title": "Figura 62. Inicialización del proyecto con el gestor PNPM (pnpm init) y estructura del archivo de manifiesto package.json generado.",
            "bookmark": "_Toc241426382"
        },
        {
            "step_title": "Paso 5: Instalación de Dependencias de Producción del Backend",
            "step_desc": (
                "A continuación, se ejecutó la instalación de las librerías fundamentales de producción del backend mediante la instrucción: "
                "`pnpm add express pg pg-harness sequelize cors dotenv jsonwebtoken`.\n"
                "El gestor resolvió y descargó 233 paquetes en un tiempo de 13 segundos, incorporando las herramientas de software críticas para la plataforma: "
                "1) `express (v5.2.1)`: marco de trabajo minimalista para la gestión del servidor HTTP, enrutamiento modular y manejo de middlewares; "
                "2) `pg (v8.23.0)` y `pg-harness (v0.2.1)`: cliente nativo de comunicación bidireccional de alto rendimiento para el motor de base de datos PostgreSQL; "
                "3) `sequelize (v6.37.8)`: mapeador objeto-relacional (ORM) encargado de gobernar el modelo relacional, las llaves foráneas y las transacciones ACID con bloqueos pesimistas; "
                "4) `cors (v2.8.6)`: middleware de seguridad para la habilitación controlada del intercambio de recursos entre orígenes cruzados con la aplicación frontend; "
                "5) `dotenv (v17.4.2)`: módulo de inyección de configuración para cargar variables de entorno sensibles (credenciales de base de datos, puertos y llaves secretas) desde archivos `.env`; y "
                "6) `jsonwebtoken (v9.0.3)`: librería criptográfica para la generación, firma digital y verificación sin estado de tokens de autenticación Bearer JWT."
            ),
            "img_path": "docs/desarrollo_setup/setup_05_dependencias_produccion.png",
            "img_width": Inches(6.2),
            "fig_num": 63,
            "fig_title": "Figura 63. Ejecución de comando e instalación exitosa de dependencias de producción del backend en PNPM.",
            "bookmark": "_Toc241426383"
        },
        {
            "step_title": "Paso 6: Instalación de Dependencias de Desarrollo y Tipado Estático TypeScript",
            "step_desc": (
                "Finalmente, se integraron las dependencias de desarrollo necesarias para compilar y ejecutar el proyecto bajo el estándar de tipado estático TypeScript, ejecutando: "
                "`pnpm add -D typescript @types/node @type/express @types/sequelize @types/cors ts-node-dev`.\n"
                "El gestor incorporó 65 paquetes en 7.7 segundos, estructurando el entorno de ingeniería de la siguiente manera: "
                "1) `typescript (v7.0.2)`: compilador estricto del lenguaje TypeScript que proporciona detección temprana de errores de tipos, interfaces de dominio e inferencia avanzada; "
                "2) Paquetes de definiciones de tipos (`@types/node`, `@types/express`, `@types/sequelize`, `@types/cors`): proveen los esquemas de tipado estático para las APIs de Node.js, Express y Sequelize, facilitando el autocompletado y la refactorización segura de código; y "
                "3) `ts-node-dev (v2.0.0)`: entorno de ejecución en caliente (Hot Reload) que transpila el código TypeScript directamente en memoria sin necesidad de compilaciones intermedias en disco, reiniciando automáticamente el servidor ante cualquier cambio en el código fuente para maximizar la productividad durante la fase de desarrollo."
            ),
            "img_path": "docs/desarrollo_setup/setup_06_dependencias_desarrollo.png",
            "img_width": Inches(6.2),
            "fig_num": 64,
            "fig_title": "Figura 64. Ejecución de comando e instalación de dependencias de desarrollo y soporte de tipado estático TypeScript en PNPM.",
            "bookmark": "_Toc241426384"
        }
    ]

    for item in new_figures_data:
        # Step title
        p_step = p_target.insert_paragraph_before("", style="Normal")
        set_para_format(p_step, line_spacing=1.5, space_after=4, space_before=8, align=WD_ALIGN_PARAGRAPH.LEFT)
        r_step = p_step.add_run(item["step_title"])
        set_run_font(r_step, font_name="Arial", size_pt=11, bold=True)

        # Image paragraph
        p_img = p_target.insert_paragraph_before("", style="Normal")
        p_img.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_img.paragraph_format.space_before = Pt(4)
        p_img.paragraph_format.space_after = Pt(4)
        r_img = p_img.add_run()
        r_img.add_picture(item["img_path"], width=item["img_width"])

        # Figure Caption
        p_cap = p_target.insert_paragraph_before(item["fig_title"], style="Figuras")
        p_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_cap.paragraph_format.space_before = Pt(2)
        p_cap.paragraph_format.space_after = Pt(2)
        for r in p_cap.runs:
            set_run_font(r, font_name="Arial", size_pt=9, bold=True)
        # Add bookmark
        update_or_add_bookmark(p_cap, item["bookmark"], item["fig_num"] + 2000)

        # Note paragraph
        p_note = p_target.insert_paragraph_before("Elaboración propia.", style="Normal")
        p_note.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_note.paragraph_format.space_before = Pt(0)
        p_note.paragraph_format.space_after = Pt(6)
        for r in p_note.runs:
            set_run_font(r, font_name="Arial", size_pt=9, italic=True)

        # Step description
        p_desc = p_target.insert_paragraph_before(item["step_desc"], style="Normal")
        set_para_format(p_desc, line_spacing=1.5, space_after=8, space_before=0, align=WD_ALIGN_PARAGRAPH.JUSTIFY)
        for r in p_desc.runs:
            set_run_font(r, font_name="Arial", size_pt=11)

    print("All 6 setup figures inserted successfully.")

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
        elif fig_num <= 58:
            pg = str(70 + (fig_num - 40) * 2)
        elif fig_num <= 64:
            pg = "142"
        else:
            pg = str(143 + (fig_num - 64) * 2)

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
        <w:smallCaps w:val="0"/>
        <w:noProof/>
        <w:webHidden/>
      </w:rPr>
      <w:fldChar w:fldCharType="begin"/>
    </w:r>
    <w:r>
      <w:rPr>
        <w:rFonts w:ascii="Arial" w:hAnsi="Arial" w:cs="Arial"/>
        <w:smallCaps w:val="0"/>
        <w:noProof/>
        <w:webHidden/>
      </w:rPr>
      <w:instrText xml:space="preserve"> PAGEREF {anchor} \\h </w:instrText>
    </w:r>
    <w:r>
      <w:rPr>
        <w:rFonts w:ascii="Arial" w:hAnsi="Arial" w:cs="Arial"/>
        <w:smallCaps w:val="0"/>
        <w:noProof/>
        <w:webHidden/>
      </w:rPr>
      <w:fldChar w:fldCharType="separate"/>
    </w:r>
    <w:r>
      <w:rPr>
        <w:rFonts w:ascii="Arial" w:hAnsi="Arial" w:cs="Arial"/>
        <w:smallCaps w:val="0"/>
        <w:noProof/>
        <w:webHidden/>
      </w:rPr>
      <w:t>{pg}</w:t>
    </w:r>
    <w:r>
      <w:rPr>
        <w:rFonts w:ascii="Arial" w:hAnsi="Arial" w:cs="Arial"/>
        <w:smallCaps w:val="0"/>
        <w:noProof/>
        <w:webHidden/>
      </w:rPr>
      <w:fldChar w:fldCharType="end"/>
    </w:r>
  </w:hyperlink>'''
        new_toc_p._p.append(parse_xml(xml_hyperlink))

    print(f"Rebuilt Índice de figuras with {len(fig_paras_in_body)} entries.")

    doc.save(doc_path)
    print(f"Saved {doc_path} successfully!")

def copy_images_to_artifacts():
    print("Copying setup images to artifact directory...")
    img_files = [
        "docs/Captura de pantalla 2026-09-02 120826.png",
        "docs/desarrollo_setup/setup_02_git_clone.png",
        "docs/desarrollo_setup/setup_03_directorios_proyecto.png",
        "docs/desarrollo_setup/setup_04_pnpm_init_package_json.png",
        "docs/desarrollo_setup/setup_05_dependencias_produccion.png",
        "docs/desarrollo_setup/setup_06_dependencias_desarrollo.png",
    ]
    for src in img_files:
        if os.path.exists(src):
            dst = os.path.join(ARTIFACT_DIR, os.path.basename(src))
            shutil.copy2(src, dst)
            print(f"  Copied {src} -> {dst}")

if __name__ == "__main__":
    copy_images_to_artifacts()
    for f in ["docs/Documentacion_Residencias_avance.docx", "docs/Documentacion_Residencias (4).docx"]:
        process_file(f)
    print("\nALL FILES UPDATED AND SYNCHRONIZED SUCCESSFULLY!")

