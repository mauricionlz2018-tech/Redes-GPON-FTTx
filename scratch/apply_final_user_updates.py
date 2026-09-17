import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import parse_xml
from docx.oxml.ns import nsdecls
import os

def set_cell_background(cell, fill_hex):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = parse_xml(f'<w:tcMar {nsdecls("w")}><w:top w:w="{top}" w:type="dxa"/><w:bottom w:w="{bottom}" w:type="dxa"/><w:left w:w="{left}" w:type="dxa"/><w:right w:w="{right}" w:type="dxa"/></w:tcMar>')
    tcPr.append(tcMar)

def set_table_borders(table, color="CBD5E1", sz="4", val="single"):
    tblPr = table._tbl.tblPr
    borders = parse_xml(
        f'<w:tblBorders {nsdecls("w")}>'
        f'<w:top w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'<w:bottom w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'<w:insideH w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'<w:insideV w:val="none"/>'
        f'<w:left w:val="none"/>'
        f'<w:right w:val="none"/>'
        f'</w:tblBorders>'
    )
    tblPr.append(borders)

def format_run(run, name="Arial", size_pt=11.0, bold=False, italic=False, color_rgb=None):
    run.font.name = name
    run.font.size = Pt(size_pt)
    run.font.bold = bold
    run.font.italic = italic
    if color_rgb:
        run.font.color.rgb = color_rgb

def insert_p(ref_p, text, font_size=11.0, bold=False, italic=False, align=WD_ALIGN_PARAGRAPH.JUSTIFY, space_before=6, space_after=6, line_spacing=1.5, style="Normal", color_rgb=None):
    p = ref_p.insert_paragraph_before()
    p.style = style
    p.alignment = align
    p.paragraph_format.space_before = Pt(space_before)
    p.paragraph_format.space_after = Pt(space_after)
    p.paragraph_format.line_spacing = line_spacing
    run = p.add_run(text)
    format_run(run, name="Arial", size_pt=font_size, bold=bold, italic=italic, color_rgb=color_rgb)
    return p

def insert_figure(ref_p, img_path, width_in=5.0, caption_text="", elaboration_text="Fuente: Elaboración propia."):
    p_img = ref_p.insert_paragraph_before()
    p_img.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_img.paragraph_format.space_before = Pt(12)
    p_img.paragraph_format.space_after = Pt(4)
    run_img = p_img.add_run()
    run_img.add_picture(img_path, width=Inches(width_in))
    
    # Caption strictly BELOW image in Arial 9pt bold
    p_cap = ref_p.insert_paragraph_before()
    p_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_cap.paragraph_format.space_before = Pt(4)
    p_cap.paragraph_format.space_after = Pt(2)
    run_cap = p_cap.add_run(caption_text)
    format_run(run_cap, name="Arial", size_pt=9.0, bold=True)
    
    # Source below caption in Arial 8.5pt italic
    p_elab = ref_p.insert_paragraph_before()
    p_elab.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_elab.paragraph_format.space_before = Pt(0)
    p_elab.paragraph_format.space_after = Pt(12)
    run_elab = p_elab.add_run(elaboration_text)
    format_run(run_elab, name="Arial", size_pt=8.5, italic=True)

def main():
    doc_path = 'docs/PORTADA_INSTITUCIONAL (3).docx'
    print(f"Loading {doc_path}...")
    doc = docx.Document(doc_path)
    
    # -------------------------------------------------------------
    # 1. ELIMINAR EM-DASH (—) Y PUNTO Y COMA (;) EN TODO EL DOCUMENTO
    # -------------------------------------------------------------
    print("Sanitizando caracteres prohibidos (em-dash '—' y punto y coma ';')...")
    for p in doc.paragraphs:
        if '—' in p.text:
            p.text = p.text.replace('—', '-')
            for r in p.runs:
                if '—' in r.text:
                    r.text = r.text.replace('—', '-')
        if ';' in p.text:
            p.text = p.text.replace(';', ',')
            for r in p.runs:
                if ';' in r.text:
                    r.text = r.text.replace(';', ',')
                    
    for tbl in doc.tables:
        for r in tbl.rows:
            for c in r.cells:
                for p in c.paragraphs:
                    if '—' in p.text:
                        p.text = p.text.replace('—', '-')
                        for run in p.runs:
                            if '—' in run.text:
                                run.text = run.text.replace('—', '-')
                    if ';' in p.text:
                        p.text = p.text.replace(';', ',')
                        for run in p.runs:
                            if ';' in run.text:
                                run.text = run.text.replace(';', ',')

    # -------------------------------------------------------------
    # 2. ACTUALIZAR FIGURA 5: CASOS DE USO CON IMAGEN REAL LIMPIA
    # -------------------------------------------------------------
    print("Actualizando Figura 5 con imagen real limpia...")
    for i, p in enumerate(doc.paragraphs):
        if p.text.strip().startswith("Figura 5. Diagrama general de casos de uso"):
            # Image is paragraph i-1
            p_img = doc.paragraphs[i - 1]
            p_img.clear()
            r_pic = p_img.add_run()
            r_pic.add_picture('scratch/diagrama_casos_de_uso_real.png', width=Inches(6.0))
            p_img.alignment = WD_ALIGN_PARAGRAPH.CENTER
            
            # Ensure caption is Arial 9pt bold
            p.text = "Figura 5. Diagrama general de casos de uso del sistema bajo estándar UML."
            p.runs[0].text = p.text
            format_run(p.runs[0], name="Arial", size_pt=9.0, bold=True)
            
            # Ensure source line is Arial 8.5pt italic
            p_src = doc.paragraphs[i + 1]
            p_src.text = "Fuente: Elaboración propia a partir del levantamiento de requerimientos en GPON TELECOM S.A. de C.V."
            p_src.runs[0].text = p_src.text
            format_run(p_src.runs[0], name="Arial", size_pt=8.5, italic=True)
            break

    # -------------------------------------------------------------
    # 3. REEMPLAZAR TABLA DE RF POR LISTA SIN CÓDIGO RF- (SECCIÓN 3.2.3)
    # -------------------------------------------------------------
    print("Reemplazando Tabla de requerimientos por Lista sin código RF-...")
    # Find paragraph 3.2.3 header
    idx_323 = None
    for i, p in enumerate(doc.paragraphs):
        if "3.2.3 Catálogo Formal de Requerimientos" in p.text or "3.2.3 Cat" in p.text:
            idx_323 = i
            break
            
    if idx_323 is not None:
        # Paragraphs to remove: Tabla 4 caption, Elaboración propia, Fuente
        # And remove the table from doc.tables
        for j in range(idx_323, idx_323 + 10):
            pj = doc.paragraphs[j]
            if pj.text.strip().startswith("Tabla 4. Catálogo"):
                pj.clear()
            elif pj.text.strip() == "Elaboración propia" and j < idx_323 + 6:
                pj.clear()
            elif pj.text.strip().startswith("Fuente: Elaboración propia a partir del levantamiento") and j < idx_323 + 6:
                pj.clear()

        # Remove Table 4 from doc.tables (it's Table 5 in doc.tables index)
        for t in doc.tables:
            if len(t.rows) > 0 and len(t.columns) >= 4:
                txt_hdr = ' '.join([c.text for c in t.rows[0].cells])
                if "Código" in txt_hdr and "Requerimiento" in txt_hdr:
                    t._tbl.getparent().remove(t._tbl)
                    print("Removed old Table 4 from document XML.")
                    break

        # Locate insertion point right after paragraph "Los requerimientos funcionales especifican..."
        ref_p_rf = None
        for j in range(idx_323, idx_323 + 10):
            if "3.2.4 Especificación Rigurosa" in doc.paragraphs[j].text or "3.2.4 Espec" in doc.paragraphs[j].text:
                ref_p_rf = doc.paragraphs[j]
                break

        if ref_p_rf is not None:
            # Insert the 27 requirements in LIST format without RF- code
            req_modules = [
                ("1. Módulo: Seguridad", [
                    ("Autenticación JWT (Prioridad: Alta)", "Inicio de sesión seguro mediante correo y contraseña cifrada con emisión de token JWT firmado con vigencia de 24 horas."),
                    ("Control RBAC y Bloqueo 403 (Prioridad: Alta)", "Validación de privilegios en cada endpoint HTTP, rechazando accesos no autorizados con código de estado HTTP 403."),
                    ("Conmutador Demo Roles (Prioridad: Media)", "Selector en la barra superior para alternar perfiles (Admin, Soporte, Técnico) con un solo clic con fines de auditoría y pruebas."),
                    ("Gestión de Cuentas (Prioridad: Media)", "Listado, consulta y actualización de perfiles de usuario (nombre, contraseña cifrada, rol y estado operativo).")
                ]),
                ("2. Módulo: Cabecera (Central / OLT / ODF)", [
                    ("Monitoreo de Panel ODF (Prioridad: Media)", "Visualización de panel ODF central de 48 puertos con ubicación física y capacidad de hilos troncales."),
                    ("Trazabilidad Puertos PON (Prioridad: Alta)", "Inventario de puertos PON OLT (tarjeta, slot, potencia emitida en dBm y tasa nominal 2.488/1.244 Gbps)."),
                    ("Inventario Hilos Fibra (Prioridad: Media)", "Registro de hilos ópticos desde el ODF hacia derivaciones primarias, categorizados como Activo, Reserva o Muerto.")
                ]),
                ("3. Módulo: Cajas NAP", [
                    ("Alta de Cajas NAP (Prioridad: Alta)", "Registro de nueva caja terminal con código único, ubicación geográfica WGS84 y autogeneración de sus 16 puertos."),
                    ("Saturación Dinámica (Prioridad: Alta)", "Cálculo en tiempo real del porcentaje de ocupación clasificando en: Verde (<80%), Amarillo (80-99%) y Rojo (100%)."),
                    ("Búsqueda Cartográfica (Prioridad: Alta)", "Buscador predictivo por código de caja, dirección o zona con centrado y zoom automático en el mapa."),
                    ("Edición de Metadatos (Prioridad: Media)", "Actualización de código, capacidad, atenuación óptica calculada y notas de campo de la caja NAP."),
                    ("Eliminación Controlada (Prioridad: Alta)", "Baja lógica de la caja terminal condicionada a que la totalidad de sus puertos se encuentren en estado Libre."),
                    ("Calibración GPS en Sitio (Prioridad: Alta)", "Captura satelital de coordenadas de alta precisión mediante la API nativa de geolocalización del dispositivo móvil del técnico.")
                ]),
                ("4. Módulo: Puertos", [
                    ("Matriz Visual 16 Puertos (Prioridad: Alta)", "Representación gráfica interactiva del chasis físico de 16 adaptadores SC-APC con código de colores LED indicativo de estado."),
                    ("Asignación Transaccional (Prioridad: Alta)", "Vinculación atómica de puerto libre a cliente mediante bloqueo pesimista ACID (SELECT ... FOR UPDATE)."),
                    ("Liberación de Puertos (Prioridad: Alta)", "Desvinculación de abonado y restitución del puerto al estado Libre, reservado a roles Admin y Soporte."),
                    ("Mantenimiento de Puertos (Prioridad: Alta)", "Marcado de puerto como Dañado o Reservado para impedir asignaciones durante fallas mecánicas o inspecciones."),
                    ("Historial de Asignaciones (Prioridad: Media)", "Registro inmutable con marca de tiempo (timestamp) de fecha, hora y usuario responsable de la asignación o liberación del puerto.")
                ]),
                ("5. Módulo: Abonados / Clientes", [
                    ("Alta de Suscriptores (Prioridad: Alta)", "Registro de abonado con contrato único, nombres, dirección física, plan de velocidad (Mbps) y teléfono de contacto."),
                    ("Directorio y Filtros (Prioridad: Alta)", "Búsqueda de clientes por contrato, nombre o caja NAP asociada con paginación optimizada."),
                    ("Expediente Técnico (Prioridad: Media)", "Visualización de caja terminal, puerto de conexión, atenuación óptica calculada y coordenadas de domicilio."),
                    ("Modificación de Datos (Prioridad: Media)", "Actualización de domicilio, teléfono, plan de ancho de banda o cambio de estado operativo del cliente.")
                ]),
                ("6. Módulo: Operación Offline", [
                    ("Caché de Aplicación PWA (Prioridad: Alta)", "Pre-carga e instalación en el dispositivo móvil de todos los activos estáticos mediante Service Worker."),
                    ("Almacenamiento IndexedDB (Prioridad: Alta)", "Persistencia local en el navegador (vía Dexie.js) de cajas NAP, puertos y clientes para consulta en campo sin red."),
                    ("Sincronización por Cola (Prioridad: Alta)", "Encolamiento local de órdenes de asignación en modo offline y despacho automático en ráfaga al restablecer conectividad.")
                ]),
                ("7. Módulo: Reportes", [
                    ("Reporte PDF en Streaming (Prioridad: Alta)", "Generación en tiempo real y descarga de reporte técnico de caja NAP y clientes asociados vía PDFKit.")
                ]),
                ("8. Módulo: Asistente", [
                    ("Chatbot Técnico Integrado (Prioridad: Media)", "Módulo de soporte virtual con base de conocimientos del código de colores de fibra TIA/EIA-598-A y diagnóstico de fallas ópticas.")
                ])
            ]
            
            for mod_title, req_items in req_modules:
                insert_p(ref_p_rf, mod_title, font_size=11.0, bold=True, space_before=10, space_after=3)
                for item_name, item_desc in req_items:
                    # Item bullet title
                    p_i = ref_p_rf.insert_paragraph_before()
                    p_i.paragraph_format.space_before = Pt(3)
                    p_i.paragraph_format.space_after = Pt(1)
                    p_i.paragraph_format.line_spacing = 1.15
                    p_i.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
                    r_b = p_i.add_run(f"• {item_name}: ")
                    format_run(r_b, name="Arial", size_pt=10.5, bold=True)
                    r_d = p_i.add_run(item_desc)
                    format_run(r_d, name="Arial", size_pt=10.5, bold=False)

            print("Successfully inserted 27 requirements in list format without RF- code.")

    # -------------------------------------------------------------
    # 4. ACTUALIZAR MAQUETADO CON LAS CAPTURAS REALES DE LA APP
    # -------------------------------------------------------------
    print("Actualizando maquetado con las capturas reales de la aplicación...")
    # Find Section 3.7.1
    idx_371 = None
    for i, p in enumerate(doc.paragraphs):
        if "3.7.1 Diseño Centrado en el Usuario" in p.text or "3.7.1 Dise" in p.text:
            idx_371 = i
            break

    if idx_371 is not None:
        # Clear previous mockup figures 8, 9, 10, 11 and their paragraphs
        # Find where 3.7.2 begins
        idx_372 = None
        for j in range(idx_371, len(doc.paragraphs)):
            if "3.7.2 Definición de la Paleta" in doc.paragraphs[j].text or "3.7.2 Definici" in doc.paragraphs[j].text:
                idx_372 = j
                break

        if idx_372 is not None:
            # Clear all paragraphs between idx_371 + 3 and idx_372
            # Let's keep intro paragraph and clear the rest
            ref_insert_mockups = doc.paragraphs[idx_372]
            
            # Clear paragraphs between idx_371 + 2 and idx_372
            for k in range(idx_371 + 2, idx_372):
                doc.paragraphs[k].clear()
                
            # Insert the 4 real mockups with Arial 9pt bold captions BELOW image
            insert_p(ref_insert_mockups, "A continuación, se presentan las capturas reales del sistema en funcionamiento obtenidas del entorno de producción desplegado en la plataforma GPON TELECOM (https://redes-gpon-ft-txs.vercel.app/mapa):")
            
            # --- CAPTURA 1: Visor GIS Real ---
            insert_p(ref_insert_mockups, "1. Visor Cartográfico Geoespacial (GIS): Interfaz interactiva desarrollada sobre OpenStreetMap que ubica con precisión geodésica las cajas terminales NAP en San José del Rincón (ej. caja NAP-SJR-26 con indicador verde de capacidad 1/8) y controles de navegación satelital.")
            insert_figure(ref_insert_mockups, 'scratch/real_gis_map.png', width_in=4.8,
                          caption_text="Figura 8. Visor cartográfico geoespacial interactivo y localización de cajas NAP.",
                          elaboration_text="Fuente: Plataforma GPON TELECOM (https://redes-gpon-ft-txs.vercel.app/mapa).")

            # --- CAPTURA 2: Matriz de 16 Puertos Real ---
            insert_p(ref_insert_mockups, "2. Matriz de Distribución FTTx (16 Puertos): Representación física interactiva del chasis interno de la caja terminal con 16 puertos adaptadores SC-APC y código semántico de colores (Verde: Libre, Azul: Ocupado, Ámbar: Reservado / Apartado).")
            insert_figure(ref_insert_mockups, 'scratch/real_chassis_matrix.png', width_in=4.8,
                          caption_text="Figura 9. Matriz de distribución física FTTx de 16 puertos y código semántico de colores.",
                          elaboration_text="Fuente: Plataforma GPON TELECOM (https://redes-gpon-ft-txs.vercel.app/mapa).")

            # --- CAPTURA 3: Modal de Registro NAP Real ---
            insert_p(ref_insert_mockups, "3. Modal de Registro y Despliegue de Nueva Caja NAP: Formulario transaccional que permite registrar el identificador de caja (NAP-SJR-27), seleccionar la capacidad (16 puertos FTTx 1:16), capturar la dirección de poste y obtener las coordenadas GPS del dispositivo en tiempo real.")
            insert_figure(ref_insert_mockups, 'scratch/real_modal_nap.png', width_in=4.8,
                          caption_text="Figura 10. Interfaz modal para el registro, despliegue y geolocalización GPS de cajas NAP.",
                          elaboration_text="Fuente: Plataforma GPON TELECOM (https://redes-gpon-ft-txs.vercel.app/mapa).")

            # --- CAPTURA 4: Directorio de Clientes Real ---
            insert_p(ref_insert_mockups, "4. Directorio General de Abonados FTTx: Padrón tabular centralizado que lista a los suscriptores conectados con su código de contrato, caja NAP, puerto asignado, fabricante de equipo ONT (V-SOL, Huawei, ZTE, TP-Link), dirección MAC y potencia óptica de recepción (dBm).")
            insert_figure(ref_insert_mockups, 'scratch/real_clients_table.png', width_in=6.2,
                          caption_text="Figura 11. Directorio general de abonados FTTx y parámetros de potencia óptica de recepción.",
                          elaboration_text="Fuente: Plataforma GPON TELECOM (https://redes-gpon-ft-txs.vercel.app/mapa).")
            
            print("Successfully inserted 4 real application screenshots.")

    # -------------------------------------------------------------
    # 5. ACTUALIZAR ESTILO DE TODAS LAS FIGURAS DEL DOCUMENTO
    # -------------------------------------------------------------
    print("Asegurando que todas las leyendas de figuras estén abajo en Arial 9pt negrita...")
    for p in doc.paragraphs:
        txt = p.text.strip()
        if txt.startswith("Figura ") and not txt.endswith("\t"):
            for r in p.runs:
                format_run(r, name="Arial", size_pt=9.0, bold=True)
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER

    # -------------------------------------------------------------
    # 6. RENUMBER TABLES IN DOCUMENT
    # -------------------------------------------------------------
    print("Renumerando tablas consecutivamente tras retiro de Tabla 4...")
    # Old Tabla 5 -> Tabla 4
    # Old Tabla 6 -> Tabla 5
    # ... Old Tabla 13 -> Tabla 12
    table_renames = [
        ("Tabla 5. Matriz de trazabilidad", "Tabla 4. Matriz de trazabilidad"),
        ("Tabla 6. Diccionario de datos: Entidad Users", "Tabla 5. Diccionario de datos: Entidad Users"),
        ("Tabla 7. Diccionario de datos: Entidad OdfPanels", "Tabla 6. Diccionario de datos: Entidad OdfPanels"),
        ("Tabla 8. Diccionario de datos: Entidad PonPorts", "Tabla 7. Diccionario de datos: Entidad PonPorts"),
        ("Tabla 9. Diccionario de datos: Entidad FiberThreads", "Tabla 8. Diccionario de datos: Entidad FiberThreads"),
        ("Tabla 10. Diccionario de datos: Entidad NapBoxes", "Tabla 9. Diccionario de datos: Entidad NapBoxes"),
        ("Tabla 11. Diccionario de datos: Entidad NapPorts", "Tabla 10. Diccionario de datos: Entidad NapPorts"),
        ("Tabla 12. Diccionario de datos: Entidad Clients", "Tabla 11. Diccionario de datos: Entidad Clients"),
        ("Tabla 13. Paleta cromática", "Tabla 12. Paleta cromática")
    ]
    for p in doc.paragraphs:
        for old_t, new_t in table_renames:
            if old_t in p.text:
                p.text = p.text.replace(old_t, new_t)
                for r in p.runs:
                    if old_t in r.text:
                        r.text = r.text.replace(old_t, new_t)

    # Clean up empty paragraphs resulting from clear()
    out_primary = 'docs/PORTADA_INSTITUCIONAL (3).docx'
    out_final = 'docs/PORTADA_INSTITUCIONAL (3)_FINAL.docx'
    
    saved_paths = []
    try:
        doc.save(out_primary)
        saved_paths.append(out_primary)
        print(f"Successfully saved to {out_primary}")
    except PermissionError:
        print(f"Notice: Microsoft Word has {out_primary} open.")
        
    doc.save(out_final)
    saved_paths.append(out_final)
    print(f"Successfully saved updated document to {out_final}")
    print(f"Done! Files saved: {saved_paths}")

if __name__ == '__main__':
    main()
