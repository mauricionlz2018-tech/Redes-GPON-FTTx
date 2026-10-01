import os
import re
import copy
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import parse_xml, OxmlElement
from docx.oxml.ns import nsdecls, qn

DOC_ADVANCE = 'docs/Documentacion_Residencias_avance.docx'
DOC_MIRROR = 'docs/Documentacion_Residencias (4).docx'

print("=== STARTING COMPLETE TEACHER REVISION APPLICATION ===")
doc = docx.Document(DOC_ADVANCE)

# Helper: style paragraph
def set_para_font(p, font_name="Arial", size_pt=11, bold=False, italic=False, line_spacing=1.5, space_after=6, space_before=0, align=None):
    if align is not None:
        p.alignment = align
    p.paragraph_format.line_spacing = line_spacing
    p.paragraph_format.space_before = Pt(space_before)
    p.paragraph_format.space_after = Pt(space_after)
    for r in p.runs:
        r.font.name = font_name
        r.font.size = Pt(size_pt)
        r.bold = bold
        r.italic = italic

def make_caption_p(doc, text):
    p = doc.add_paragraph()
    p.style = 'Figuras'
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(4)
    p.paragraph_format.space_after = Pt(2)
    r = p.add_run(text)
    r.font.name = 'Arial'
    r.font.size = Pt(9)
    r.bold = True
    return p

def make_note_p(doc, text="Elaboraci\u00f3n propia"):
    p = doc.add_paragraph()
    p.style = 'Normal'
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after = Pt(12)
    r = p.add_run(text)
    r.font.name = 'Arial'
    r.font.size = Pt(9)
    r.bold = True
    return p

def make_img_p(doc, img_path, width_in=6.05):
    p = doc.add_paragraph()
    p.style = 'Normal'
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(6)
    p.paragraph_format.space_after = Pt(4)
    r = p.add_run()
    r.add_picture(img_path, width=Inches(width_in))
    return p

def make_text_p(doc, text, bold_prefix=None, style='Normal'):
    p = doc.add_paragraph()
    p.style = style
    p.paragraph_format.line_spacing = 1.5
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after = Pt(6)
    if bold_prefix:
        r_b = p.add_run(bold_prefix)
        r_b.font.name = 'Arial'
        r_b.font.size = Pt(11)
        r_b.bold = True
    r = p.add_run(text)
    r.font.name = 'Arial'
    r.font.size = Pt(11)
    return p

def insert_elements_after(anchor_p, elements):
    curr = anchor_p._p
    for el in elements:
        curr.addnext(el._p if hasattr(el, '_p') else el._tbl)
        curr = el._p if hasattr(el, '_p') else el._tbl
    return elements[-1]

# ------------------------------------------------------------------------------
# STEP 1: LOCATE SECTIONS IN CHAPTER III
# ------------------------------------------------------------------------------
intro_p_idx = 111
for idx_p, p in enumerate(doc.paragraphs):
    if p.text.strip() == "Introducción":
        intro_p_idx = idx_p
        break
body = doc.paragraphs[intro_p_idx:]

p_cu_heading = None
p_cu_mod1_text = None
p_cu_mod2_text = None
p_cu_mod3_text = None
p_cu_mod4_text = None
p_cu_act_intro = None
p_cu_rob_text = None
p_rob_img = None
p_rob_cap = None
p_rob_note = None

for i, p in enumerate(body):
    t = p.text.strip()
    if '3.2.2 Diagrama General de Casos de Uso' in t:
        p_cu_heading = p
    elif '1. M\u00f3dulo 1: Seguridad, Autenticaci\u00f3n y Control de Acceso' in t:
        p_cu_mod1_text = p
    elif '2. M\u00f3dulo 2: Cartograf\u00eda GIS, Trazado Troncal' in t:
        p_cu_mod2_text = p
    elif '3. M\u00f3dulo 3: Operaci\u00f3n de Puertos F\u00edsicos, Concurrencia' in t:
        p_cu_mod3_text = p
    elif '4. M\u00f3dulo 4: Operaci\u00f3n M\u00f3vil Offline-First' in t:
        p_cu_mod4_text = p
    elif 'Asimismo, el diagrama formaliza la interacci\u00f3n y responsabilidades' in t:
        p_cu_act_intro = p
    elif 'Para tender un puente metodol\u00f3gico formal entre los casos de uso' in t:
        p_cu_rob_text = p
        p_rob_img = body[i+1]
        p_rob_cap = body[i+2]
        p_rob_note = body[i+3]

print(f"Located Section 3.2.2 elements successfully!")

# Remove old single use case diagram (the empty img p, caption p, note p before p_cu_mod1_text)
# Let's find them between p_cu_heading and p_cu_mod1_text
p_old_cu_img = None
p_old_cu_cap = None
p_old_cu_note = None
p_old_cu_intro2 = None

idx_h = body.index(p_cu_heading)
idx_m1 = body.index(p_cu_mod1_text)
for j in range(idx_h + 1, idx_m1):
    p = body[j]
    if len(p._p.xpath('.//w:drawing')) > 0:
        p_old_cu_img = p
    elif p.text.strip().startswith('Figura 27.'):
        p_old_cu_cap = p
    elif p.text.strip() == 'Elaboraci\u00f3n propia':
        p_old_cu_note = p
    elif 'A continuaci\u00f3n, se detalla formalmente' in p.text:
        p_old_cu_intro2 = p

# Remove old single use case elements from XML
for p_rem in [p_old_cu_img, p_old_cu_cap, p_old_cu_note, p_old_cu_intro2]:
    if p_rem is not None and p_rem._p.getparent() is not None:
        p_rem._p.getparent().remove(p_rem._p)

print("Removed old monolithic use case diagram.")

# ------------------------------------------------------------------------------
# STEP 2: BUILD SEPARATED USE CASES WITH INDIVIDUAL DIAGRAMS & DESCRIPTIONS
# ------------------------------------------------------------------------------
# Update p_cu_heading text
p_cu_heading.text = "3.2.2 Diagramas Modulares de Casos de Uso del Sistema (UML)"
set_para_font(p_cu_heading, font_name="Arial", size_pt=12, bold=True, line_spacing=1.5, space_before=12, space_after=6)

# Intro text
p_intro_cu = doc.add_paragraph()
set_para_font(p_intro_cu, font_name="Arial", size_pt=11, line_spacing=1.5, space_after=6)
p_intro_cu.add_run(
    "Para modelar de forma precisa el comportamiento funcional del sistema y estandarizar las interacciones entre los "
    "diferentes actores de la organizaci\u00f3n y los m\u00f3dulos de software, se elaboraron los Diagramas de Casos de Uso bajo el "
    "est\u00e1ndar internacional de la Object Management Group (OMG / UML 2.5). A fin de garantizar m\u00e1xima claridad arquitect\u00f3nica "
    "y responder a las mejores pr\u00e1cticas de ingenier\u00eda de software, la especificaci\u00f3n se descompone de manera modular e individual "
    "en cuatro diagramas independientes delimitados por sus fronteras de sistema (System Boundary), abarcando un total de 16 casos de uso "
    "primarios (CU-01 a CU-16) con sus correspondientes relaciones de asociaci\u00f3n e inclusi\u00f3n (\u00abinclude\u00bb):"
)
# Place p_intro_cu right after p_cu_heading
p_cu_heading._p.addnext(p_intro_cu._p)

# Helper to assemble a modular use case block
def create_cu_block(mod_title, mod_desc, img_path, cap_text):
    p_t = doc.add_paragraph()
    set_para_font(p_t, font_name="Arial", size_pt=11, bold=True, line_spacing=1.5, space_before=8, space_after=4)
    p_t.add_run(mod_title)
    
    p_d = doc.add_paragraph()
    set_para_font(p_d, font_name="Arial", size_pt=11, line_spacing=1.5, space_after=6)
    p_d.add_run(mod_desc)
    
    p_i = make_img_p(doc, img_path, width_in=6.05)
    p_c = make_caption_p(doc, cap_text)
    p_n = make_note_p(doc, "Elaboraci\u00f3n propia")
    
    return [p_t, p_d, p_i, p_c, p_n]

# Module 1 elements
desc_m1 = (
    "Agrupa los casos de uso dedicados al control de identidad y gesti\u00f3n perimetral: CU-01 (Iniciar Sesi\u00f3n y Autenticaci\u00f3n con JWT), "
    "CU-02 (Conmutar Perfil de Evaluaci\u00f3n / Role Switcher) y CU-03 (Administrar Cuentas y Directorio de Usuarios). El caso de uso CU-01 "
    "implementa una relaci\u00f3n obligatoria de inclusi\u00f3n (\u00abinclude\u00bb) hacia la rutina de verificaci\u00f3n del hash unidireccional con el "
    "algoritmo bcrypt (costo de c\u00f3mputo salt rounds = 10) y la emisi\u00f3n del token criptogr\u00e1fico Bearer JWT firmado con HMAC-SHA256. "
    "A su vez, CU-03 integra la relaci\u00f3n \u00abinclude\u00bb hacia el middleware requireRoles, el cual intercepta el vector de permisos del usuario "
    "y deniega operaciones no autorizadas emitiendo deterministamente una respuesta con c\u00f3digo HTTP 403 Forbidden:"
)
block_m1 = create_cu_block(
    "1. M\u00f3dulo 1: Seguridad, Autenticaci\u00f3n y Control de Acceso (RBAC)",
    desc_m1,
    "scratch/diag_cu_mod1_seguridad.png",
    "Figura 27. Diagrama de casos de uso - M\u00f3dulo 1: Seguridad, autenticaci\u00f3n y control de acceso (RBAC)."
)

# Module 2 elements
desc_m2 = (
    "Comprende los casos de uso CU-04 (Consultar Mapa GIS, Rutas y Sem\u00e1foro de Saturaci\u00f3n), CU-05 (Calibrar Coordenadas GPS de NAP en Sitio) "
    "y CU-06 (Registrar Nueva Caja NAP en Inventario). Este m\u00f3dulo interact\u00faa bidireccionalmente con el actor externo API Geoespacial GPS / "
    "Leaflet (OpenStreetMap) para renderizar mapas cartogr\u00e1ficos interactivos y proyectar coordenadas geod\u00e9sicas en formato WGS-84. Al registrar "
    "una nueva caja terminal (CU-06), el sistema ejecuta una relaci\u00f3n de inclusi\u00f3n \u00abinclude\u00bb para aprovisionar autom\u00e1ticamente de manera "
    "transaccional la matriz de 16 puertos f\u00edsicos SC-APC inicializados en estado 'Libre', eliminando la necesidad de altas manuales individuales:"
)
block_m2 = create_cu_block(
    "2. M\u00f3dulo 2: Cartograf\u00eda GIS, Trazado Troncal y Cajas Terminales NAP",
    desc_m2,
    "scratch/diag_cu_mod2_gis_naps.png",
    "Figura 28. Diagrama de casos de uso - M\u00f3dulo 2: Cartograf\u00eda GIS, trazado troncal y cajas terminales NAP."
)

# Module 3 elements
desc_m3 = (
    "Constituye el n\u00facleo neur\u00e1lgico de la plataforma e integra seis casos de uso: CU-07 (Visualizar Matriz del Chasis de 16 Puertos), "
    "CU-08 (Asignar Abonado a Puerto Libre de Fibra), CU-09 (Liberar Puerto y Desvincular Abonado), CU-10 (Cambiar Estado T\u00e9cnico a Da\u00f1ado o "
    "Mantenimiento), CU-11 (Consultar y Filtrar Padr\u00f3n de Clientes FTTx) y CU-12 (Actualizar Expediente de Abonado en Servicio). Durante la "
    "ejecuci\u00f3n de CU-08, se detona una relaci\u00f3n \u00abinclude\u00bb cr\u00edtica hacia el mecanismo de Bloqueo Pesimista de Fila (SELECT ... FOR UPDATE) "
    "en PostgreSQL, garantizando aislamiento transaccional y neutralizando colisiones concurrentes (Race Conditions). Asimismo, se ejecuta la relaci\u00f3n "
    "\u00abinclude\u00bb para validar y almacenar los par\u00e1metros de telemetr\u00eda del suscriptor: n\u00famero de contrato, modelo ONT, direcci\u00f3n MAC con "
    "filtro regex y potencia de recepci\u00f3n estimada en decibelios-milivatio (dBm):"
)
block_m3 = create_cu_block(
    "3. M\u00f3dulo 3: Operaci\u00f3n de Puertos F\u00edsicos, Concurrencia ACID y Abonados",
    desc_m3,
    "scratch/diag_cu_mod3_puertos_clientes.png",
    "Figura 29. Diagrama de casos de uso - M\u00f3dulo 3: Operaci\u00f3n de puertos f\u00edsicos, concurrencia ACID y abonados."
)

# Module 4 elements
desc_m4 = (
    "Espec\u00edficamente concebido para cuadrillas que operan en localidades rurales sin cobertura celular o en zonas de sombra electromagn\u00e9tica. "
    "Comprende CU-13 (Operar en Modo Offline con Cach\u00e9 Local IndexedDB / Dexie.js), CU-14 (Encolar Asignaciones en Zonas Sin Cobertura), CU-15 "
    "(Sincronizar Mutaciones de Forma Autom\u00e1tica o Manual) y CU-16 (Generar y Descargar Reporte Ejecutivo PDF por Streaming). Al solicitar la "
    "emisi\u00f3n del reporte (CU-16), se invocan las relaciones \u00abinclude\u00bb para Calcular Diagn\u00f3stico Global y Sem\u00e1foro de Capacidad (clasificaci\u00f3n "
    "de cajas en Normal o Cr\u00edtico seg\u00fan umbral del 80%) y Construir Directorio Detallado de Clientes con Atenuaciones \u00d3pticas, canalizando el "
    "documento binario directamente a trav\u00e9s de flujos en memoria mediante la biblioteca PDFKit:"
)
block_m4 = create_cu_block(
    "4. M\u00f3dulo 4: Operaci\u00f3n M\u00f3vil Offline-First y Generaci\u00f3n de Reportes Ejecutivos PDF",
    desc_m4,
    "scratch/diag_cu_mod4_offline_reportes.png",
    "Figura 30. Diagrama de casos de uso - M\u00f3dulo 4: Operaci\u00f3n m\u00f3vil Offline-First y generaci\u00f3n de reportes ejecutivos PDF."
)

# Remove the old text paragraphs p_cu_mod1_text, p_cu_mod2_text, p_cu_mod3_text, p_cu_mod4_text
# We will insert block_m1, block_m2, block_m3, block_m4 after p_intro_cu
curr_ref = p_intro_cu
for blk in [block_m1, block_m2, block_m3, block_m4]:
    curr_ref = insert_elements_after(curr_ref, blk)

for p_rem in [p_cu_mod1_text, p_cu_mod2_text, p_cu_mod3_text, p_cu_mod4_text]:
    if p_rem._p.getparent() is not None:
        p_rem._p.getparent().remove(p_rem._p)

print("Inserted 4 separated use case diagrams with detailed descriptions!")

# Update Robustness diagram image (title-stripped)
if p_rob_img:
    # replace picture inside p_rob_img
    p_rob_img.text = ""
    r = p_rob_img.add_run()
    r.add_picture("scratch/diag_robustez_asignacion.png", width=Inches(6.05))
    p_rob_img.alignment = WD_ALIGN_PARAGRAPH.CENTER
    print("Updated Robustness diagram image (title-stripped).")

# ------------------------------------------------------------------------------
# STEP 3: INSERT UML ACTIVITY DIAGRAM IN SECTION 3.2.6
# ------------------------------------------------------------------------------
p_flow_cap = None
p_flow_img = None
for i, p in enumerate(doc.paragraphs[105:], start=105):
    if p.text.strip().startswith("Figura ") and "Diagrama de flujo general" in p.text:
        p_flow_cap = p
        p_flow_img = doc.paragraphs[i-1]
        p_flow_note = doc.paragraphs[i+1]
        break

# Update flowchart image with title-stripped version
if p_flow_img:
    p_flow_img.text = ""
    r = p_flow_img.add_run()
    r.add_picture("scratch/diagrama_flujo_global_proyecto.png", width=Inches(6.05))
    p_flow_img.alignment = WD_ALIGN_PARAGRAPH.CENTER
    print("Updated Flowchart image (title-stripped).")

# Right after p_flow_note, insert UML Activity Diagram
intro_act_text = (
    "Para modelar formalmente la l\u00f3gica operacional, las decisiones de negocio y la coordinaci\u00f3n concurrente entre "
    "cuadrillas de campo y el servidor central, se elabor\u00f3 el Diagrama de Actividades bajo el est\u00e1ndar UML 2.5. Este diagrama "
    "se organiza mediante cuatro calles o particiones (swimlanes) que delimitan con rigor la segregaci\u00f3n de responsabilidades "
    "del sistema: 1) T\u00e9cnico de Campo (App M\u00f3vil PWA), 2) Capa de Persistencia Local (Service Worker y Dexie.js / IndexedDB), "
    "3) Servidor de Aplicaciones (API REST Express y Middleware JWT/RBAC) y 4) Motor Central de Base de Datos (PostgreSQL 15 Transaccional). "
    "El flujo representa las rutas cr\u00edticas de ejecuci\u00f3n: la bifurcaci\u00f3n condicional seg\u00fan disponibilidad de red m\u00f3vil, la adquisici\u00f3n "
    "del bloqueo pesimista de fila (SELECT ... FOR UPDATE), la resoluci\u00f3n determinista de colisiones concurrentes (con rollback inmediato "
    "y emisi\u00f3n de HTTP 409 Conflict) frente a la asignaci\u00f3n exitosa (COMMIT y actualizaci\u00f3n semaf\u00f3rica), as\u00ed como el encolamiento "
    "aut\u00f3nomo en Dexie.js durante la operaci\u00f3n offline y su reconciliaci\u00f3n diferida por lotes (Batch Sync) al reanudar la conectividad:"
)
p_act_intro = doc.add_paragraph()
set_para_font(p_act_intro, font_name="Arial", size_pt=11, line_spacing=1.5, space_before=12, space_after=6)
p_act_intro.add_run(intro_act_text)

p_act_img = make_img_p(doc, "scratch/diag_actividades_asignacion_gpon.png", width_in=6.05)
p_act_cap = make_caption_p(doc, "Figura 33. Diagrama de actividades UML (Swimlanes) para el proceso de asignaci\u00f3n y provisi\u00f3n concurrente de puertos.")
p_act_note = make_note_p(doc, "Elaboraci\u00f3n propia")

insert_elements_after(p_flow_note, [p_act_intro, p_act_img, p_act_cap, p_act_note])
print("Inserted UML Activity Diagram with swimlanes and full description!")

# ------------------------------------------------------------------------------
# STEP 4: UPDATE GPON TOPOLOGY IMAGE IN SECTION 3.3.1
# ------------------------------------------------------------------------------
for i, p in enumerate(doc.paragraphs[105:], start=105):
    if p.text.strip().startswith("Figura ") and "Topolog\u00eda jer\u00e1rquica de la red \u00f3ptica" in p.text:
        p_topo_img = doc.paragraphs[i-1]
        p_topo_img.text = ""
        r = p_topo_img.add_run()
        r.add_picture("scratch/diag_topologia_gpon.png", width=Inches(6.05))
        p_topo_img.alignment = WD_ALIGN_PARAGRAPH.CENTER
        print("Updated GPON Topology image (title-stripped).")
        break

# ------------------------------------------------------------------------------
# STEP 5: INSERT UML CLASS DIAGRAM & CARDINALITY TABLE IN SECTION 3.4
# ------------------------------------------------------------------------------
# In 3.4.1 / 3.4.2:
p_sec_34 = None
p_der_cap = None
p_der_img = None
p_der_note = None

for i, p in enumerate(doc.paragraphs[105:], start=105):
    t = p.text.strip()
    if '3.4.2 Diagrama Entidad-Relaci\u00f3n' in t:
        p_sec_34 = p
    elif t.startswith("Figura ") and "Diagrama Entidad-Relaci\u00f3n (DER)" in t:
        p_der_cap = p
        p_der_img = doc.paragraphs[i-1]
        p_der_note = doc.paragraphs[i+1]

# Insert UML Class Diagram right before p_sec_34
intro_clases_text = (
    "3.4.1 Diagrama de Clases UML del Dominio del Sistema y Arquitectura de Datos\n"
    "Para formalizar la estructura orientada a objetos de la plataforma, modelar las entidades persistentes y especificar "
    "los m\u00e9todos y contratos de software implementados tanto en los modelos de Sequelize como en los controladores REST y el "
    "almac\u00e9n local Dexie.js, se elabor\u00f3 el Diagrama de Clases bajo el est\u00e1ndar UML 2.5. La arquitectura modela diez clases y dos "
    "enumeraciones cardinales organizadas en tres compartimentos estrictos (nombre, atributos tipados con visibilidad y operaciones con "
    "firmas completas). El diagrama especifica relaciones de composici\u00f3n f\u00edsica estricta (\u25c6), como la existencia inescindible de exactamente "
    "16 puertos SC-APC por cada chasis de caja NAP (NapBox 1 \u25c6-- 16 NapPort) y la contenci\u00f3n de puertos PON en paneles ODF (OdfPanel 1 \u25c6-- 1..* PonPort), "
    "asociaciones un\u00edvocas (NapPort 0..1 -- 0..1 Client) protegidas por \u00edndices de unicidad en base de datos, y entidades de control "
    "as\u00edncrono como OfflineTransaction para gobernar la cola de mutaciones diferidas generadas a la intemperie:"
)
p_cls_intro = doc.add_paragraph()
set_para_font(p_cls_intro, font_name="Arial", size_pt=11, line_spacing=1.5, space_before=12, space_after=6)
p_cls_intro.add_run(intro_clases_text)

p_cls_img = make_img_p(doc, "scratch/diag_clases_dominio_gpon.png", width_in=6.05)
p_cls_cap = make_caption_p(doc, "Figura 36. Diagrama de clases del dominio y entidades del sistema bajo est\u00e1ndar UML 2.5.")
p_cls_note = make_note_p(doc, "Elaboraci\u00f3n propia")

# Insert before p_sec_34
p_sec_34._p.addprevious(p_cls_intro._p)
p_sec_34._p.addprevious(p_cls_img._p)
p_sec_34._p.addprevious(p_cls_cap._p)
p_sec_34._p.addprevious(p_cls_note._p)
print("Inserted UML Class Diagram with full description!")

# Update Chen ER Diagram image (title-stripped)
if p_der_img:
    p_der_img.text = ""
    r = p_der_img.add_run()
    r.add_picture("scratch/diagrama_er_chen_gpon.png", width=Inches(6.05))
    p_der_img.alignment = WD_ALIGN_PARAGRAPH.CENTER
    print("Updated Chen ER diagram image (title-stripped).")

# Right after p_der_note, insert TABLA DE CARDINALIDADES
intro_card_text = (
    "A partir del modelo conceptual y con el prop\u00f3sito de certificar la integridad referencial y las reglas de negocio "
    "que gobiernan la infraestructura de telecomunicaciones en San Jos\u00e9 del Rinc\u00f3n, se elabor\u00f3 la Matriz Formal de Cardinalidades "
    "del Sistema. Esta matriz define las cardinalidades m\u00ednimas y m\u00e1ximas entre cada par de entidades, identificando las claves "
    "for\u00e1neas (Foreign Keys) subyacentes, las acciones de integridad referencial programadas a nivel de motor (ON DELETE y ON UPDATE) "
    "y la justificaci\u00f3n f\u00edsico-operativa de cada restricci\u00f3n en la topolog\u00eda de la red GPON:"
)
p_card_intro = doc.add_paragraph()
set_para_font(p_card_intro, font_name="Arial", size_pt=11, line_spacing=1.5, space_before=10, space_after=6)
p_card_intro.add_run(intro_card_text)

p_card_cap = doc.add_paragraph()
p_card_cap.style = 'Tablas'
p_card_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
p_card_cap.paragraph_format.space_before = Pt(6)
p_card_cap.paragraph_format.space_after = Pt(2)
r_cc = p_card_cap.add_run("Tabla 13. Matriz de cardinalidades y restricciones de integridad referencial del modelo relacional GPON.")
r_cc.font.name = 'Arial'
r_cc.font.size = Pt(9)
r_cc.bold = True

p_card_note = make_note_p(doc, "Elaboraci\u00f3n propia")

# Create Cardinality Table
CARDINALITY_DATA = [
    ("1", "Users", "1", "Registra / Administra", "Clients", "0..N", "1:N", "Clients.registered_by_id", "RESTRICT / CASCADE", "Auditor\u00eda de altas; un usuario no puede eliminarse si tiene clientes vinculados."),
    ("2", "OdfPanels", "1", "Aloja f\u00edsicamente", "PonPorts", "1..N", "1:N", "PonPorts.odf_id", "CASCADE / CASCADE", "Composici\u00f3n f\u00edsica en cabecera NOC; los puertos PON pertenecen a su chasis ODF."),
    ("3", "PonPorts", "1", "Alimenta \u00f3pticamente", "FiberThreads", "1", "1:1", "FiberThreads.pon_port_id", "RESTRICT / CASCADE", "Cada puerto PON de 2.5 Gbps ilumina un \u00fanico hilo troncal feeder G.652.D."),
    ("4", "FiberThreads", "1", "Distribuye hacia", "NapBoxes", "0..N", "1:N", "NapBoxes.feeder_thread_id", "RESTRICT / CASCADE", "El hilo troncal se subdivide en splitters 1:4 alimentando m\u00faltiples cajas NAP."),
    ("5", "NapBoxes", "1", "Contiene acopladores", "NapPorts", "16", "1:16", "NapPorts.nap_box_id", "CASCADE / CASCADE", "Composici\u00f3n estricta: cada caja NAP aloja de forma inmutable 16 puertos SC-APC."),
    ("6", "NapPorts", "0..1", "Conecta acometida a", "Clients", "0..1", "1:1", "Clients.assigned_nap_port_id", "SET NULL / CASCADE", "Relaci\u00f3n un\u00edvoca con UNIQUE index; si el cliente cancela, el puerto queda Libre."),
    ("7", "InfrastructureRoutes", "1", "Traza trayecto de", "NapBoxes", "0..N", "1:N", "NapBoxes.route_id", "SET NULL / CASCADE", "Mapeo georreferenciado: m\u00faltiples cajas terminales se ubican sobre la misma v\u00eda."),
    ("8", "Clients", "1", "Genera transacciones", "OfflineTransactions", "0..N", "1:N", "OfflineTx.client_contract", "RESTRICT / CASCADE", "Cola diferida: encola \u00f3rdenes de alta/baja offline garantizando trazabilidad FIFO.")
]

card_table = doc.add_table(rows=len(CARDINALITY_DATA) + 1, cols=10)
card_table.alignment = WD_TABLE_ALIGNMENT.CENTER
card_headers = ["N\u00b0", "Entidad Origen", "Card.", "Relaci\u00f3n Sem\u00e1ntica", "Entidad Destino", "Card.", "Tipo", "Clave For\u00e1nea (FK)", "Integridad Referencial", "Justificaci\u00f3n T\u00e9cnica en Red GPON"]

# Header row
hdr_cells = card_table.rows[0].cells
for idx, h_text in enumerate(card_headers):
    hdr_cells[idx].text = h_text
    # shade
    tcPr = hdr_cells[idx]._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="E0E0E0"/>')
    tcPr.append(shd)
    for p in hdr_cells[idx].paragraphs:
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        for r in p.runs:
            r.font.name = "Arial"
            r.font.size = Pt(8)
            r.bold = True

for r_idx, row_vals in enumerate(CARDINALITY_DATA):
    row_cells = card_table.rows[r_idx + 1].cells
    for c_idx, val in enumerate(row_vals):
        row_cells[c_idx].text = val
        for p in row_cells[c_idx].paragraphs:
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER if c_idx in [0, 2, 5, 6] else WD_ALIGN_PARAGRAPH.LEFT
            for r in p.runs:
                r.font.name = "Arial"
                r.font.size = Pt(8)

insert_elements_after(p_der_note, [p_card_intro, p_card_cap, card_table, p_card_note])
print("Inserted Tabla de Cardinalidades successfully!")

# ------------------------------------------------------------------------------
# STEP 6: UPDATE CONCURRENCY & SEQUENCE DIAGRAMS IN SECTION 3.5.2
# ------------------------------------------------------------------------------
for i, p in enumerate(doc.paragraphs[105:], start=105):
    t = p.text.strip()
    if t.startswith("Figura ") and "SELECT ... FOR UPDATE" in t:
        p_seq_img = doc.paragraphs[i-1]
        p_seq_img.text = ""
        r = p_seq_img.add_run()
        r.add_picture("scratch/diag_secuencia_select_for_update.png", width=Inches(6.05))
        p_seq_img.alignment = WD_ALIGN_PARAGRAPH.CENTER
        print("Updated SELECT FOR UPDATE sequence diagram (title-stripped).")
    elif t.startswith("Figura ") and "Diagrama de m\u00e1quina de estados finitos (FSM)" in t:
        p_fsm_img = doc.paragraphs[i-1]
        p_fsm_img.text = ""
        r = p_fsm_img.add_run()
        r.add_picture("scratch/diag_estados_puerto.png", width=Inches(6.05))
        p_fsm_img.alignment = WD_ALIGN_PARAGRAPH.CENTER
        print("Updated FSM States diagram (title-stripped).")
    elif t.startswith("Figura ") and "sincronizaci\u00f3n diferida y arquitectura m\u00f3vil Offline-First" in t:
        p_off_img = doc.paragraphs[i-1]
        p_off_img.text = ""
        r = p_off_img.add_run()
        r.add_picture("scratch/diag_secuencia_offline.png", width=Inches(6.05))
        p_off_img.alignment = WD_ALIGN_PARAGRAPH.CENTER
        print("Updated Offline Sequence diagram (title-stripped).")

# ------------------------------------------------------------------------------
# STEP 7: UPDATE NAVIGATION, IA, COMPONENT DIAGRAMS IN SECTION 3.6.1
# ------------------------------------------------------------------------------
for i, p in enumerate(doc.paragraphs[105:], start=105):
    t = p.text.strip()
    if t.startswith("Figura ") and "Diagrama de navegaci\u00f3n del sistema" in t:
        p_nav_img = doc.paragraphs[i-1]
        p_nav_img.text = ""
        r = p_nav_img.add_run()
        r.add_picture("scratch/diag_navegacion_sistema.png", width=Inches(6.05))
        p_nav_img.alignment = WD_ALIGN_PARAGRAPH.CENTER
        print("Updated Navigation diagram (title-stripped).")
    elif t.startswith("Figura ") and "Diagrama jer\u00e1rquico de arquitectura de informaci\u00f3n" in t:
        p_ia_img = doc.paragraphs[i-1]
        p_ia_img.text = ""
        r = p_ia_img.add_run()
        r.add_picture("scratch/diag_arquitectura_informacion.png", width=Inches(6.05))
        p_ia_img.alignment = WD_ALIGN_PARAGRAPH.CENTER
        print("Updated Information Architecture diagram (title-stripped).")
    elif t.startswith("Figura ") and "Diagrama de paquetes y componentes de software" in t:
        p_pkg_img = doc.paragraphs[i-1]
        p_pkg_img.text = ""
        r = p_pkg_img.add_run()
        r.add_picture("scratch/diag_paquetes_componentes.png", width=Inches(6.05))
        p_pkg_img.alignment = WD_ALIGN_PARAGRAPH.CENTER
        print("Updated Package/Component diagram (title-stripped).")

# ------------------------------------------------------------------------------
# STEP 8: MASTER METADATA & RENUMBERING OF ALL FIGURES (1 to 78)
# ------------------------------------------------------------------------------
FIGURES_MASTER_78 = [
    # Cap I & II (Figures 1 to 26)
    (1, "Ubicaci\u00f3n de la empresa GPON TELECOM S.A de C.V", "8"),
    (2, "Organigrama de la empresa GPON TELECOM S.A de C.V.", "9"),
    (3, "Modelo de referencia OSI de 7 capas frente a la arquitectura TCP/IP.", "13"),
    (4, "Principio f\u00edsico de propagaci\u00f3n: Refracci\u00f3n, \u00e1ngulo cr\u00edtico y reflexi\u00f3n interna total (TIR).", "15"),
    (5, "Protocolo UDP.", "17"),
    (6, "Paradigma de FTT existente actualmente.", "19"),
    (7, "Espectro y plan de longitudes de onda en GPON (ITU-T G.984.2 WDM).", "21"),
    (8, "Arquitectura de superposici\u00f3n de capas en un Sistema de Informaci\u00f3n Geogr\u00e1fica (GIS).", "26"),
    (9, "Librer\u00eda Leaflet para mapas en react.", "28"),
    (10, "Base de datos PostgreSQL.", "30"),
    (11, "\u00bfQu\u00e9 es un ORM?", "32"),
    (12, "Logo de Sequelize.js", "32"),
    (13, "Arquitectura Cliente-Servidor.", "37"),
    (14, "Integraciones y entregas continuas.", "55"),
    (15, "Metodolog\u00eda de cascada.", "57"),
    (16, "Ejemplo de diagrama de casos de uso.", "59"),
    (17, "Arquitectura Modelo-Vista-Controlador.", "61"),
    (18, "Ejemplo de Responsive Web Design y Mobile-First Web Design.", "64"),
    (19, "Interfaz de Adobe Color.", "66"),
    (20, "Tipos de modelos de caja (Caja negra y Caja blanca).", "68"),
    (21, "Pruebas de API REST.", "69"),
    (22, "Pasos para realizar un test de usabilidad (ejemplo).", "70"),
    (23, "Diferencia en BSS y OSS.", "71"),
    (24, "Ejemplo de sistema de inventario de redes de telecomunicaciones.", "72"),
    (25, "Cuestionario en Google Forms sobre redes GPON/FTTx para el levantamiento de requerimientos.", "76"),
    (26, "Modelado de actores y sus funciones.", "78"),

    # Cap III - SECTION 3.2.2 (Separated Use Cases 27, 28, 29, 30 + Robustness 31)
    (27, "Diagrama de casos de uso - M\u00f3dulo 1: Seguridad, autenticaci\u00f3n y control de acceso (RBAC).", "80"),
    (28, "Diagrama de casos de uso - M\u00f3dulo 2: Cartograf\u00eda GIS, trazado troncal y cajas terminales NAP.", "82"),
    (29, "Diagrama de casos de uso - M\u00f3dulo 3: Operaci\u00f3n de puertos f\u00edsicos, concurrencia ACID y abonados.", "84"),
    (30, "Diagrama de casos de uso - M\u00f3dulo 4: Operaci\u00f3n m\u00f3vil Offline-First y generaci\u00f3n de reportes ejecutivos PDF.", "86"),
    (31, "Diagrama de robustez (V-O-C de Jacobson) para la asignaci\u00f3n concurrente de puertos y control transaccional.", "88"),

    # Cap III - SECTION 3.2.6 (Flowchart 32 + UML Activity 33)
    (32, "Diagrama de flujo general de operaci\u00f3n y procesos del sistema GPON.", "91"),
    (33, "Diagrama de actividades UML (Swimlanes) para el proceso de asignaci\u00f3n y provisi\u00f3n concurrente de puertos.", "93"),

    # Cap III - SECTION 3.3.1 (GPON Chain 34 + Topology & Budget 35)
    (34, "Cadena de distribuci\u00f3n de la red GPON desde la cabecera central (NOC) hasta la acometida domiciliaria (ONT).", "95"),
    (35, "Topolog\u00eda jer\u00e1rquica de la red \u00f3ptica GPON/FTTx y matriz de presupuesto \u00f3ptico de potencia (ITU-T G.984.2).", "97"),

    # Cap III - SECTION 3.4 (UML Class Diagram 36 + Chen DER 37)
    (36, "Diagrama de clases del dominio y entidades del sistema bajo est\u00e1ndar UML 2.5.", "100"),
    (37, "Diagrama Entidad-Relaci\u00f3n (DER) conceptual con notaci\u00f3n Chen del sistema de inventario GPON.", "103"),

    # Cap III - SECTION 3.5.2 (SELECT FOR UPDATE 38 + FSM 39 + Offline Sync 40)
    (38, "Diagrama de secuencia transaccional de concurrencia con SELECT ... FOR UPDATE.", "114"),
    (39, "Diagrama de m\u00e1quina de estados finitos (FSM) del ciclo de vida del puerto \u00f3ptico SC-APC.", "116"),
    (40, "Diagrama de secuencia UML para sincronizaci\u00f3n diferida y arquitectura m\u00f3vil Offline-First.", "118"),

    # Cap III - SECTION 3.6.1 (Wireframes 41 + Navigation 42 + IA 43 + Component 44)
    (41, "Maquetado de interfaces (Wireframes) y arquitectura visual del sistema en Figma.", "120"),
    (42, "Diagrama de navegaci\u00f3n del sistema y flujo heur\u00edstico de interfaces de usuario.", "122"),
    (43, "Diagrama jer\u00e1rquico de arquitectura de informaci\u00f3n (IA) del sistema web y m\u00f3vil FTTx.", "124"),
    (44, "Diagrama de paquetes y componentes de software bajo est\u00e1ndar UML.", "126"),

    # Cap III - SECTION 3.6.2 (Adobe Color Contrasts 45 to 53)
    (45, "Prueba de colores #FFFFFF y #4F46ES", "128"),
    (46, "Prueba de colores para Botones Soporte / T\u00e9cnico", "128"),
    (47, "Pruebas de color para Badge \"Datos de Prueba\"", "129"),
    (48, "Contraste para Pesta\u00f1a \"Mapa de Red\" (Activa)", "129"),
    (49, "Contraste de pesta\u00f1as \"Abonados\" / \"Reportes\"", "129"),
    (50, "Contraste de Bot\u00f3n \"APK\"", "130"),
    (51, "Contraste de color Tag Rol \"ADMIN\"", "130"),
    (52, "Contraste de Bot\u00f3n \"+ Troncal / Ramal\"", "131"),
    (53, "Contraste de Bot\u00f3n \"+ Mufa\" (Empalme)", "131"),

    # Cap IV - Coding & Architecture (54 to 61)
    (54, "Configuraci\u00f3n de la conexi\u00f3n a PostgreSQL con Sequelize (database.ts).", "134"),
    (55, "Modelo Client.ts y estructura de la capa de modelos (backend/src/models/).", "135"),
    (56, "Middleware de autenticaci\u00f3n con verificaci\u00f3n de token JWT (auth.ts).", "136"),
    (57, "Controlador de asignaci\u00f3n concurrente de puertos con transacci\u00f3n pesimista ACID (portController.ts).", "137"),
    (58, "Definici\u00f3n de rutas y endpoints de la API REST con middlewares de seguridad y RBAC (api.ts).", "138"),
    (59, "Interceptor de Axios para la inyecci\u00f3n del token JWT en el frontend (client.ts).", "140"),
    (60, "Inicializaci\u00f3n del servidor Express, configuraci\u00f3n CORS y conexi\u00f3n Sequelize (index.ts).", "142"),
    (61, "Cliente HTTP Axios con interceptor de autorizaci\u00f3n Bearer JWT y manejo de sesi\u00f3n (client.ts).", "144"),

    # Cap IV - Map & Port UI (62 to 70)
    (62, "Marcador de caja NAP con ocupaci\u00f3n inferior al 80% (NAP-SJR-26, 0/8).", "146"),
    (63, "Marcador de caja NAP en umbral preventivo, con ocupaci\u00f3n entre 80% y 99% (NAP-SJR-01, 14/16).", "146"),
    (64, "Marcador de caja NAP saturada, con ocupaci\u00f3n del 100% (NAP-SJR-02, 16/16).", "146"),
    (65, "Ventana emergente con el detalle de un cable troncal trazado como polil\u00ednea en el mapa.", "147"),
    (66, "Modal de captura de coordenadas GPS en campo (GpsCaptureModal.tsx).", "148"),
    (67, "Puertos de la matriz NAP en estado Libre.", "148"),
    (68, "Puertos de la matriz NAP en estado Ocupado.", "149"),
    (69, "Puerto de la matriz NAP en estado Da\u00f1ado.", "149"),
    (70, "Puerto de la matriz NAP en estado Reservado.", "149"),

    # Cap IV - UI & Offline & PDF & Docker (71 to 78)
    (71, "Puertos libres y ocupados.", "150"),
    (72, "Arquitectura de componentes frontend React y visor cartogr\u00e1fico.", "150"),
    (73, "Flujo de decisi\u00f3n y sincronizaci\u00f3n diferida de la arquitectura m\u00f3vil Offline-First.", "153"),
    (74, "Esquema de persistencia local IndexedDB con Dexie.js para trabajo sin conexi\u00f3n (offlineDb.ts).", "154"),
    (75, "Encabezado institucional y resumen del reporte ejecutivo de auditor\u00eda de red en PDF.", "155"),
    (76, "Inventario y nivel de saturaci\u00f3n por caja NAP en el reporte ejecutivo en PDF.", "156"),
    (77, "Flujo de generaci\u00f3n de reportes t\u00e9cnicos ejecutivos en PDF mediante streaming en memoria.", "157"),
    (78, "Arquitectura de contenerizaci\u00f3n multicontenedor con Docker Compose y red aislada.", "159"),
]

assert len(FIGURES_MASTER_78) == 78, f"Expected 78 figures, got {len(FIGURES_MASTER_78)}"

# Scan all figure captions in body (from intro_p_idx onwards)
all_body_caps = []
for p in doc.paragraphs[intro_p_idx:]:
    t = p.text.strip()
    if t.startswith("Figura ") and '\t' not in t:
        all_body_caps.append(p)

print(f"Total figure captions found in body: {len(all_body_caps)}")
assert len(all_body_caps) == 78, f"Expected 78 captions in body, found {len(all_body_caps)}"

# Renumber all 78 figure captions in body and set bookmarks
for k, p_cap in enumerate(all_body_caps):
    fig_num, fig_title, fig_page = FIGURES_MASTER_78[k]
    new_caption_text = f"Figura {fig_num}. {fig_title}"
    bookmark_id = str(400 + k)
    bookmark_name = f"_Toc240964{71 + k:03d}"

    p_elem = p_cap._p
    pPr = p_elem.find(qn('w:pPr'))
    for child in list(p_elem):
        if child != pPr:
            p_elem.remove(child)

    p_cap.style = 'Figuras'
    p_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_cap.paragraph_format.space_before = Pt(4)
    p_cap.paragraph_format.space_after = Pt(2)

    bm_start = parse_xml(f'<w:bookmarkStart {nsdecls("w")} w:id="{bookmark_id}" w:name="{bookmark_name}"/>')
    p_elem.append(bm_start)

    r_elem = parse_xml(
        f'<w:r {nsdecls("w")}><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial" w:cs="Arial"/>'
        f'<w:b/><w:sz w:val="18"/><w:szCs w:val="18"/></w:rPr>'
        f'<w:t xml:space="preserve">{new_caption_text}</w:t></w:r>'
    )
    p_elem.append(r_elem)

    bm_end = parse_xml(f'<w:bookmarkEnd {nsdecls("w")} w:id="{bookmark_id}"/>')
    p_elem.append(bm_end)

print("Renumbered and bookmarked all 78 figure captions in body successfully!")

# ------------------------------------------------------------------------------
# STEP 9: UPDATE ÍNDICE DE FIGURAS
# ------------------------------------------------------------------------------
idx_fig_start = None
idx_fig_end = None
for i, p in enumerate(doc.paragraphs[:150]):
    t = p.text.strip()
    if 'ndice de figuras' in t:
        idx_fig_start = i
    elif 'ndice de tablas' in t:
        idx_fig_end = i
        break

print(f"Índice de figuras: P[{idx_fig_start}] to P[{idx_fig_end}]")

toc_fig_paragraphs = []
for i in range(idx_fig_start + 1, idx_fig_end):
    p = doc.paragraphs[i]
    if p.text.strip().startswith("Figura "):
        toc_fig_paragraphs.append(p)

print(f"Existing TOC figure paragraphs: {len(toc_fig_paragraphs)}")

# Update existing TOC paragraphs up to len(toc_fig_paragraphs)
for k in range(min(len(toc_fig_paragraphs), 78)):
    p = toc_fig_paragraphs[k]
    fig_num, fig_title, fig_page = FIGURES_MASTER_78[k]
    new_caption_text = f"Figura {fig_num}. {fig_title}"
    bookmark_name = f"_Toc240964{71 + k:03d}"

    hl = p._p.xpath('.//w:hyperlink')
    if hl:
        hl[0].attrib['{http://schemas.openxmlformats.org/wordprocessingml/2006/main}anchor'] = bookmark_name
    instr = p._p.xpath('.//w:instrText')
    for inst in instr:
        if 'PAGEREF' in inst.text:
            inst.text = f" PAGEREF {bookmark_name} \\h "
    t_nodes = p._p.xpath('.//w:hyperlink//w:t')
    if len(t_nodes) >= 2:
        t_nodes[0].text = new_caption_text
        t_nodes[-1].text = fig_page
    elif len(t_nodes) == 1:
        t_nodes[0].text = new_caption_text

# Append missing entries (78 - len(toc_fig_paragraphs))
last_p = toc_fig_paragraphs[-1]
for k in range(len(toc_fig_paragraphs), 78):
    fig_num, fig_title, fig_page = FIGURES_MASTER_78[k]
    new_caption_text = f"Figura {fig_num}. {fig_title}"
    bookmark_name = f"_Toc240964{71 + k:03d}"

    new_xml = copy.deepcopy(last_p._p)
    hl = new_xml.xpath('.//w:hyperlink')
    if hl:
        hl[0].attrib['{http://schemas.openxmlformats.org/wordprocessingml/2006/main}anchor'] = bookmark_name
    instr = new_xml.xpath('.//w:instrText')
    for inst in instr:
        if 'PAGEREF' in inst.text:
            inst.text = f" PAGEREF {bookmark_name} \\h "
    t_nodes = new_xml.xpath('.//w:hyperlink//w:t')
    if len(t_nodes) >= 2:
        t_nodes[0].text = new_caption_text
        t_nodes[-1].text = fig_page

    last_p._p.addnext(new_xml)
    last_p = docx.text.paragraph.Paragraph(new_xml, doc)

print("Updated Índice de figuras with all 78 entries successfully!")

# ------------------------------------------------------------------------------
# STEP 10: MASTER METADATA & RENUMBERING OF ALL TABLES (1 to 26)
# ------------------------------------------------------------------------------
TABLES_MASTER_26 = [
    # Cap I & II (Tables 1 to 11)
    (1, "Clasificaci\u00f3n taxon\u00f3mica de las redes seg\u00fan su cobertura geogr\u00e1fica.", "12"),
    (2, "Principales m\u00e9tricas de calidad de servicio (QoS) en redes de acceso.", "18"),
    (3, "Par\u00e1metros operativos del est\u00e1ndar GPON seg\u00fan ITU-T G.984.", "20"),
    (4, "P\u00e9rdidas de inserci\u00f3n t\u00edpicas introducidas por divisores \u00f3pticos pasivos (Splitters PLC).", "22"),
    (5, "Comparativa de las principales generaciones de redes \u00f3pticas pasivas.", "24"),
    (6, "Anomal\u00edas de concurrencia seg\u00fan el nivel de aislamiento en PostgreSQL.", "35"),
    (7, "C\u00f3digos de estado HTTP de uso frecuente en una API REST de inventario.", "40"),
    (8, "Estrategias de cach\u00e9 para Service Workers y su aplicaci\u00f3n t\u00edpica.", "44"),
    (9, "Riesgos del OWASP Top 10 (2021) y medidas de mitigaci\u00f3n aplicables.", "48"),
    (10, "Comparativa entre enfoques tradicionales y \u00e1giles de desarrollo de software.", "57"),
    (11, "Heur\u00edsticas de usabilidad de Nielsen y ejemplos de aplicaci\u00f3n en un inventario de fibra \u00f3ptica.", "62"),
    
    # Cap III - SECTION 3.2.5 (Table 12)
    (12, "Matriz de trazabilidad de permisos por rol y respuestas HTTP", "89"),
    
    # Cap III - SECTION 3.4.2 (NEW Table 13 Cardinalidades)
    (13, "Matriz de cardinalidades y restricciones de integridad referencial del modelo relacional GPON.", "104"),
    
    # Cap III - SECTION 3.4.2 (Data Dictionaries: Tables 14 to 24)
    (14, "Diccionario de datos: Entidad Users (Usuarios).", "106"),
    (15, "Diccionario de datos: Entidad OdfPanels (Paneles ODF).", "107"),
    (16, "Diccionario de datos: Entidad PonPorts (Puertos PON OLT).", "108"),
    (17, "Diccionario de datos: Entidad FiberThreads (Hilos Troncales de Fibra).", "110"),
    (18, "Diccionario de datos: Entidad NapBoxes (Cajas Terminales NAP).", "111"),
    (19, "Diccionario de datos: Entidad NapPorts (Puertos de Acceso SC-APC).", "112"),
    (20, "Diccionario de datos: Entidad Clients (Abonados FTTx).", "113"),
    (21, "Diccionario de datos de mileage_logs", "114"),
    (22, "Diccionario de infrastructure_oostes", "117"),
    (23, "Infraestructure_mufas", "118"),
    (24, "Infraestructure_routes", "119"),
    
    # Cap III - SECTION 3.6.2 (Adobe Color Table 25)
    (25, "Tabla de colores para contrastes en Adobe Color.", "127"),
    
    # Cap IV - Offline Scheme (Table 26)
    (26, "Esquema de la base local.", "154")
]

assert len(TABLES_MASTER_26) == 26, f"Expected 26 tables, got {len(TABLES_MASTER_26)}"

# Find all table caption paragraphs in body
all_tbl_caps = []
for p in doc.paragraphs[intro_p_idx:]:
    t = p.text.strip()
    if t.startswith("Tabla ") and '\t' not in t:
        all_tbl_caps.append(p)

print(f"Total table captions found in body: {len(all_tbl_caps)}")
assert len(all_tbl_caps) == 26, f"Expected 26 table captions in body, found {len(all_tbl_caps)}"

# Renumber all 26 table captions in body
for k, p_tbl in enumerate(all_tbl_caps):
    tbl_num, tbl_title, tbl_page = TABLES_MASTER_26[k]
    new_tbl_text = f"Tabla {tbl_num}. {tbl_title}"
    bookmark_id = str(500 + k)
    bookmark_name = f"_Toc240974{71 + k:03d}"

    p_elem = p_tbl._p
    pPr = p_elem.find(qn('w:pPr'))
    for child in list(p_elem):
        if child != pPr:
            p_elem.remove(child)

    p_tbl.style = 'Tablas'
    p_tbl.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_tbl.paragraph_format.space_before = Pt(6)
    p_tbl.paragraph_format.space_after = Pt(2)

    bm_start = parse_xml(f'<w:bookmarkStart {nsdecls("w")} w:id="{bookmark_id}" w:name="{bookmark_name}"/>')
    p_elem.append(bm_start)

    r_elem = parse_xml(
        f'<w:r {nsdecls("w")}><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial" w:cs="Arial"/>'
        f'<w:b/><w:sz w:val="18"/><w:szCs w:val="18"/></w:rPr>'
        f'<w:t xml:space="preserve">{new_tbl_text}</w:t></w:r>'
    )
    p_elem.append(r_elem)

    bm_end = parse_xml(f'<w:bookmarkEnd {nsdecls("w")} w:id="{bookmark_id}"/>')
    p_elem.append(bm_end)

print("Renumbered and bookmarked all 26 table captions in body successfully!")

# Update Índice de tablas
idx_tbl_start = None
idx_tbl_end = None
for i, p in enumerate(doc.paragraphs[:200]):
    t = p.text.strip()
    if 'ndice de tablas' in t:
        idx_tbl_start = i
    elif 'Introducci' in t and idx_tbl_start is not None:
        idx_tbl_end = i
        break

print(f"Índice de tablas: P[{idx_tbl_start}] to P[{idx_tbl_end}]")

toc_tbl_paragraphs = []
for i in range(idx_tbl_start + 1, idx_tbl_end):
    p = doc.paragraphs[i]
    if p.text.strip().startswith("Tabla "):
        toc_tbl_paragraphs.append(p)

print(f"Existing TOC table paragraphs: {len(toc_tbl_paragraphs)}")

for k in range(min(len(toc_tbl_paragraphs), 26)):
    p = toc_tbl_paragraphs[k]
    tbl_num, tbl_title, tbl_page = TABLES_MASTER_26[k]
    new_tbl_text = f"Tabla {tbl_num}. {tbl_title}"
    bookmark_name = f"_Toc240974{71 + k:03d}"

    hl = p._p.xpath('.//w:hyperlink')
    if hl:
        hl[0].attrib['{http://schemas.openxmlformats.org/wordprocessingml/2006/main}anchor'] = bookmark_name
    instr = p._p.xpath('.//w:instrText')
    for inst in instr:
        if 'PAGEREF' in inst.text:
            inst.text = f" PAGEREF {bookmark_name} \\h "
    t_nodes = p._p.xpath('.//w:hyperlink//w:t')
    if len(t_nodes) >= 2:
        t_nodes[0].text = new_tbl_text
        t_nodes[-1].text = tbl_page
    elif len(t_nodes) == 1:
        t_nodes[0].text = new_tbl_text

last_tbl_p = toc_tbl_paragraphs[-1]
for k in range(len(toc_tbl_paragraphs), 26):
    tbl_num, tbl_title, tbl_page = TABLES_MASTER_26[k]
    new_tbl_text = f"Tabla {tbl_num}. {tbl_title}"
    bookmark_name = f"_Toc240974{71 + k:03d}"

    new_xml = copy.deepcopy(last_tbl_p._p)
    hl = new_xml.xpath('.//w:hyperlink')
    if hl:
        hl[0].attrib['{http://schemas.openxmlformats.org/wordprocessingml/2006/main}anchor'] = bookmark_name
    instr = new_xml.xpath('.//w:instrText')
    for inst in instr:
        if 'PAGEREF' in inst.text:
            inst.text = f" PAGEREF {bookmark_name} \\h "
    t_nodes = new_xml.xpath('.//w:hyperlink//w:t')
    if len(t_nodes) >= 2:
        t_nodes[0].text = new_tbl_text
        t_nodes[-1].text = tbl_page

    last_tbl_p._p.addnext(new_xml)
    last_tbl_p = docx.text.paragraph.Paragraph(new_xml, doc)

print("Updated Índice de tablas with all 26 entries successfully!")

# ------------------------------------------------------------------------------
# STEP 11: SAVE BOTH DOCUMENTS
# ------------------------------------------------------------------------------
print("\n=== SAVING DOCUMENTS ===")
doc.save(DOC_ADVANCE)
print(f"Saved: {DOC_ADVANCE}")

doc.save(DOC_MIRROR)
print(f"Saved: {DOC_MIRROR}")
print("ALL UPDATES APPLIED SUCCESSFULLY!")
