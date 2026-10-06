import docx
from docx.shared import Pt, Inches
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import parse_xml, OxmlElement
from docx.oxml.ns import nsdecls, qn

def run_update():
    doc_path = 'docs/Documentacion_Residencias_avance.docx'
    print(f"Abriendo {doc_path}...")
    doc = docx.Document(doc_path)
    body = doc._body._element

    # -------------------------------------------------------------
    # 1. ACTUALIZAR REQUERIMIENTOS FUNCIONALES (3.2.3)
    # -------------------------------------------------------------
    print("Actualizando 3.2.3 Requerimientos Funcionales...")
    
    # 1.1 Encabezado de módulos
    for p in doc.paragraphs:
        if 'estructurados en ocho' in p.text:
            p.text = 'Los requerimientos funcionales especifican el comportamiento exacto y las operaciones del sistema, estructurados en nueve módulos técnicos:'
            p.runs[0].font.name = 'Arial'
            p.runs[0].font.size = Pt(11)
            p.paragraph_format.line_spacing = 1.5
            p.paragraph_format.space_after = Pt(6)
            print("  -> Actualizado encabezado de módulos a nueve.")
            break

    # 1.2 Autenticación estricta y recuperación de contraseña en Módulo 1
    for p in doc.paragraphs:
        if p.text.startswith('Autenticación JWT (Prioridad: Alta):'):
            p.text = ''
            r1 = p.add_run('Autenticación Estricta contra Base de Datos (Prioridad: Alta): ')
            r1.font.name = 'Arial'
            r1.font.size = Pt(11)
            r1.font.bold = True
            r2 = p.add_run('Inicio de sesión seguro mediante verificación estricta de credenciales con función hash unidireccional bcrypt contra la base de datos PostgreSQL, rechazando credenciales inválidas y emitiendo un token JWT firmado criptográficamente con vigencia de 24 horas.')
            r2.font.name = 'Arial'
            r2.font.size = Pt(11)
            p.paragraph_format.line_spacing = 1.5
            p.paragraph_format.space_after = Pt(6)
            print("  -> Actualizado requisito de autenticación estricta.")
            
            # Insertar Recuperación de Contraseña justo después
            p_elem = p._element
            new_p = parse_xml(f'<w:p {nsdecls("w")}/>')
            p_elem.addnext(new_p)
            p_recup = docx.text.paragraph.Paragraph(new_p, doc)
            r_rec_bold = p_recup.add_run('Recuperación Institucional de Contraseñas (Prioridad: Media): ')
            r_rec_bold.font.name = 'Arial'
            r_rec_bold.font.size = Pt(11)
            r_rec_bold.font.bold = True
            r_rec_txt = p_recup.add_run('Restablecimiento de credenciales de acceso mediante generación de tokens criptográficos de un solo uso con caducidad máxima de 15 minutos y despacho de correo electrónico transaccional con plantilla corporativa sobria de GPON TELECOM.')
            r_rec_txt.font.name = 'Arial'
            r_rec_txt.font.size = Pt(11)
            p_recup.paragraph_format.line_spacing = 1.5
            p_recup.paragraph_format.space_after = Pt(6)
            print("  -> Insertado requisito de recuperación institucional de contraseñas.")
            break

    # 1.3 Control de capas en Módulo 3 Cajas NAP
    for p in doc.paragraphs:
        if p.text.startswith('Calibración GPS en Sitio (Prioridad: Alta):'):
            p_elem = p._element
            new_p = parse_xml(f'<w:p {nsdecls("w")}/>')
            p_elem.addnext(new_p)
            p_capas = docx.text.paragraph.Paragraph(new_p, doc)
            r_c_bold = p_capas.add_run('Control de Capas y Cartografía de Planta Externa (Prioridad: Alta): ')
            r_c_bold.font.name = 'Arial'
            r_c_bold.font.size = Pt(11)
            r_c_bold.font.bold = True
            r_c_txt = p_capas.add_run('Selector dinámico de capas geoespaciales que permite superponer y alternar en tiempo real la visualización de cajas NAP, rutas troncales y de distribución, mufas de empalme, gasas de reserva técnica y postes de apoyo aéreo con actualización reactiva.')
            r_c_txt.font.name = 'Arial'
            r_c_txt.font.size = Pt(11)
            p_capas.paragraph_format.line_spacing = 1.5
            p_capas.paragraph_format.space_after = Pt(6)
            print("  -> Insertado requisito de control de capas en Módulo 3.")
            break

    # 1.4 Módulo 9: Interoperabilidad Cartográfica y Exportación KMZ (GIS)
    for p in doc.paragraphs:
        if p.text.startswith('Chatbot Técnico Integrado (Prioridad: Media):'):
            target_elem = p._element
            kmz_reqs = [
                ('9. Módulo: Interoperabilidad Cartográfica y Exportación KMZ (GIS)', '', True),
                ('Exportación de Red a Paquete KMZ (Prioridad: Alta): ', 'Generación y descarga directa con un solo clic de un archivo comprimido estándar KMZ (\'Red_GPON_San_Jose_del_Rincon.kmz\') compatible con Google Earth Desktop/Web, QGIS 3.x y ArcGIS, que consolida la totalidad de la infraestructura de planta externa en un único paquete autocontenido.', False),
                ('Semaforización Dinámica KML (Prioridad: Alta): ', 'Inyección de estilos geoespaciales normalizados en KML con iconos circulares y coloración idéntica al visor web: Disponible (Verde #00e676), Alerta preventiva (Amarillo #00d0ff) y Saturación total (Rojo #ff3333), permitiendo auditorías visuales inmediatas de capacidad instalada.', False),
                ('Fichas Técnicas Embebidas en Placemarks (Prioridad: Alta): ', 'Inclusión de descripciones HTML formateadas en bloques CDATA para cada elemento geográfico, desglosando nombre, código, zona, capacidad total de puertos, puertos ocupados, puertos libres, porcentaje de saturación, coordenadas GPS, tipo de cable, capacidad de hilos y metrajes.', False),
                ('Vectorización de Tendidos y Metrajes Ópticos (Prioridad: Alta): ', 'Exportación de rutas de fibra óptica como elementos LineString con coordenadas WGS84 interpoladas, LineStyle cromático según jerarquía de cableado (troncal vs distribución) y persistencia de distancias calculadas en metros y kilómetros.', False),
                ('Catastro de Apoyos y Elementos Pasivos (Prioridad: Media): ', 'Estructuración jerárquica en carpetas KML independientes para postes propios/propuestos, postes de arriendo CFE con código de rotulado, mufas de empalme tipo torpedo domo (IP68) con capacidad de fusiones y bucles de reserva técnica de fibra.', False),
                ('Compilación Asíncrona en el Cliente (Prioridad: Alta): ', 'Procesamiento en memoria del navegador mediante la librería JSZip y Blob API, permitiendo compilar el paquete KMZ sin sobrecargar el servidor backend y con operatividad completa incluso en entornos desconectados.', False),
            ]
            
            curr_elem = target_elem
            for bold_pfx, txt, is_module_title in kmz_reqs:
                new_p = parse_xml(f'<w:p {nsdecls("w")}/>')
                curr_elem.addnext(new_p)
                p_item = docx.text.paragraph.Paragraph(new_p, doc)
                p_item.paragraph_format.line_spacing = 1.5
                p_item.paragraph_format.space_after = Pt(6)
                
                if is_module_title:
                    r = p_item.add_run(bold_pfx)
                    r.font.name = 'Arial'
                    r.font.size = Pt(11)
                    r.font.bold = True
                else:
                    r1 = p_item.add_run(bold_pfx)
                    r1.font.name = 'Arial'
                    r1.font.size = Pt(11)
                    r1.font.bold = True
                    r2 = p_item.add_run(txt)
                    r2.font.name = 'Arial'
                    r2.font.size = Pt(11)
                    
                curr_elem = new_p
                
            print("  -> Insertado Módulo 9 de Exportación KMZ con 6 requerimientos funcionales.")
            break

    # -------------------------------------------------------------
    # 2. ACTUALIZAR REQUERIMIENTOS NO FUNCIONALES (3.2.4)
    # -------------------------------------------------------------
    print("Actualizando 3.2.4 Requerimientos No Funcionales...")
    for p in doc.paragraphs:
        if p.text.startswith('8.- Portabilidad:'):
            target_elem = p._element
            rnf_items = [
                ('9.- Interoperabilidad Geoespacial Abierta (Estándar OGC KML 2.2): ', 'El paquete cartográfico exportado debe cumplir rigurosamente con la especificación internacional OpenGIS KML 2.2 y compresión ZIP estándar (.kmz). Los archivos generados deben abrirse de forma limpia y transparente en Google Earth Pro, Google Earth Web, QGIS 3.x y ArcGIS Pro, sin arrojar anomalías de sintaxis XML ni requerir reproyecciones manuales (sistema de referencia WGS84 / EPSG:4326).'),
                ('10.- Rendimiento y Eficiencia en Generación KMZ en Cliente: ', 'La serialización XML del documento KML, la conversión cromática a formato KML (AABBGGRR) y la compresión DEFLATE en formato KMZ mediante JSZip deben completarse en un tiempo no mayor a 2.0 segundos para redes con hasta 1,000 elementos geográficos, ejecutándose en segundo plano sin bloquear el hilo de ejecución principal de la interfaz.'),
                ('11.- Seguridad Criptográfica en Autenticación y Recuperación: ', 'El sistema debe asegurar que las contraseñas nunca se almacenen en texto claro ni con algoritmos obsoletos (MD5, SHA1), empleando obligatoriamente bcrypt con un factor de costo no menor a 10 rondas de salado. Asimismo, los tokens de restablecimiento de contraseña deben generarse mediante entropía criptográficamente segura (CSPRNG) con validez temporal estricta de 15 minutos.')
            ]
            curr_elem = target_elem
            for bold_pfx, txt in rnf_items:
                new_p = parse_xml(f'<w:p {nsdecls("w")}/>')
                curr_elem.addnext(new_p)
                p_item = docx.text.paragraph.Paragraph(new_p, doc)
                p_item.paragraph_format.line_spacing = 1.5
                p_item.paragraph_format.space_after = Pt(6)
                r1 = p_item.add_run(bold_pfx)
                r1.font.name = 'Arial'
                r1.font.size = Pt(11)
                r1.font.bold = True
                r2 = p_item.add_run(txt)
                r2.font.name = 'Arial'
                r2.font.size = Pt(11)
                curr_elem = new_p
            print("  -> Insertados RNF 9, 10 y 11.")
            break

    # -------------------------------------------------------------
    # 3. ACTUALIZAR REQUERIMIENTOS DE DISEÑO (UI/UX) (3.2.5)
    # -------------------------------------------------------------
    print("Actualizando 3.2.5 Requerimientos de Diseño UI/UX...")
    for p in doc.paragraphs:
        if p.text.startswith('6. RDI-06:'):
            target_elem = p._element
            rdi_items = [
                ('7. RDI-07: Control Ergonómico de Exportación KMZ y Retroalimentación Visual: ', 'La barra superior de herramientas del visor cartográfico debe incorporar un botón accesible de descarga KMZ con icono dinámico animado (\'animate-bounce\') durante la compilación en segundo plano y retroalimentación mediante notificaciones Toast temporizadas (5 segundos) que confirmen el éxito de la descarga o señalen fallos de procesamiento.'),
                ('8. RDI-08: Isomorfismo Cromático y Simbología Cartográfica Homologada: ', 'La simbología gráfica e iconografía implementada en el visor web con Leaflet (cajas NAP verde/amarillo/rojo, mufas en cyan, gasas en naranja, postes en púrpura/gris) debe replicarse con exactitud en los estilos visuales del archivo KML exportado, asegurando una experiencia cognitiva continua y homogénea entre la plataforma web y Google Earth.')
            ]
            curr_elem = target_elem
            for bold_pfx, txt in rdi_items:
                new_p = parse_xml(f'<w:p {nsdecls("w")}/>')
                curr_elem.addnext(new_p)
                p_item = docx.text.paragraph.Paragraph(new_p, doc)
                p_item.paragraph_format.line_spacing = 1.5
                p_item.paragraph_format.space_after = Pt(6)
                r1 = p_item.add_run(bold_pfx)
                r1.font.name = 'Arial'
                r1.font.size = Pt(11)
                r1.font.bold = True
                r2 = p_item.add_run(txt)
                r2.font.name = 'Arial'
                r2.font.size = Pt(11)
                curr_elem = new_p
            print("  -> Insertados RDI-07 y RDI-08.")
            break

    # -------------------------------------------------------------
    # 4. ACTUALIZAR REQUERIMIENTOS DE RED (3.2.8)
    # -------------------------------------------------------------
    print("Actualizando 3.2.8 Requerimientos de Red...")
    for p in doc.paragraphs:
        if p.text.startswith('3. RCOM-03:'):
            target_elem = p._element
            new_p = parse_xml(f'<w:p {nsdecls("w")}/>')
            target_elem.addnext(new_p)
            p_item = docx.text.paragraph.Paragraph(new_p, doc)
            p_item.paragraph_format.line_spacing = 1.5
            p_item.paragraph_format.space_after = Pt(6)
            r1 = p_item.add_run('4. RCOM-04: Autonomía Local y Generación GIS Offline: ')
            r1.font.name = 'Arial'
            r1.font.size = Pt(11)
            r1.font.bold = True
            r2 = p_item.add_run('La compilación del paquete KMZ debe operar de manera 100% autónoma en el navegador cliente a partir de los datos en memoria o persistidos localmente en IndexedDB (Dexie.js), garantizando que las cuadrillas técnicas puedan exportar e inspeccionar la cartografía de red en Google Earth en campo, incluso en situaciones de corte imprevisto de conectividad celular o zonas sin cobertura.')
            r2.font.name = 'Arial'
            r2.font.size = Pt(11)
            print("  -> Insertado RCOM-04.")
            break

    # -------------------------------------------------------------
    # 5. ACTUALIZAR REQUERIMIENTOS DE PROCESO (3.2.11)
    # -------------------------------------------------------------
    print("Actualizando 3.2.11 Requerimientos de Proceso...")
    for p in doc.paragraphs:
        if p.text.startswith('6. RPR-06:'):
            target_elem = p._element
            new_p = parse_xml(f'<w:p {nsdecls("w")}/>')
            target_elem.addnext(new_p)
            p_item = docx.text.paragraph.Paragraph(new_p, doc)
            p_item.paragraph_format.line_spacing = 1.5
            p_item.paragraph_format.space_after = Pt(6)
            r1 = p_item.add_run('7. RPR-07: Proceso de Exportación Cartográfica, Auditoría en Google Earth y Validación Topológica: ')
            r1.font.name = 'Arial'
            r1.font.size = Pt(11)
            r1.font.bold = True
            r2 = p_item.add_run('El sistema debe normar el procedimiento técnico de auditoría y validación de planta externa: 1) Solicitud de generación del paquete KMZ desde la interfaz cartográfica; 2) Compilación asíncrona in-memory de los elementos georreferenciados; 3) Apertura del archivo .kmz en Google Earth o software SIG de escritorio; 4) Superposición visual del trazado óptico sobre fotografía satelital de alta resolución para contrastar postes físicos, vanos y cruces de vialidad; 5) Conciliación de postes inventariados con los convenios de compartición de infraestructura eléctrica de CFE; 6) Verificación visual del semáforo de saturación en cajas NAP para planificar expansiones de cobertura; y 7) Emisión de dictamen técnico de auditoría patrimonial de red.')
            r2.font.name = 'Arial'
            r2.font.size = Pt(11)
            print("  -> Insertado RPR-07.")
            break

    # -------------------------------------------------------------
    # 6. ACTUALIZAR DICCIONARIO DE DATOS (SECCIÓN 3.4)
    # -------------------------------------------------------------
    print("Actualizando Diccionario de Datos (Sección 3.4)...")
    
    # 6.1 Actualizar párrafo introductorio de entidades
    for p in doc.paragraphs:
        if 'siete entidades físicas implementadas' in p.text:
            p.text = 'A continuación, se presentan las tablas exhaustivas del Diccionario de Datos para las once entidades físicas del modelo relacional de base de datos PostgreSQL, la entidad de reservas técnicas de planta externa y la especificación formal de la estructura de datos geoespaciales para la exportación e interoperabilidad KMZ / OpenGIS KML 2.2, detallando atributo, tipo de dato nativo, restricciones y descripción funcional de negocio:'
            p.runs[0].font.name = 'Arial'
            p.runs[0].font.size = Pt(11)
            p.paragraph_format.line_spacing = 1.5
            p.paragraph_format.space_after = Pt(6)
            print("  -> Párrafo introductorio de Diccionario de Datos actualizado.")
            break

    # 6.2 Corregir títulos de Tablas 22, 23 y 24 en el cuerpo (no en el índice)
    for p in doc.paragraphs[300:]:
        if 'Tabla 22. Diccionario de infrastructure_oostes' in p.text:
            p.text = 'Tabla 22. Diccionario de datos: Entidad infrastructure_postes (Postes de Infraestructura Eléctrica y Telecomunicaciones).'
            p.runs[0].font.name = 'Arial'
            print("  -> Corregido título de Tabla 22 en cuerpo.")
        elif 'Tabla 23. Infraestructure_mufas' in p.text:
            p.text = 'Tabla 23. Diccionario de datos: Entidad infrastructure_mufas (Mufas y Cierres de Empalme FOSC).'
            p.runs[0].font.name = 'Arial'
            print("  -> Corregido título de Tabla 23 en cuerpo.")
        elif 'Tabla 24. Infraestructure_routes' in p.text:
            p.text = 'Tabla 24. Diccionario de datos: Entidad infrastructure_routes (Rutas y Trazados de Fibra Óptica).'
            p.runs[0].font.name = 'Arial'
            print("  -> Corregido título de Tabla 24 en cuerpo.")

    # 6.3 Localizar la Tabla 24 en el cuerpo (body index > 500)
    tbl24_elem = None
    for i in range(500, len(body)):
        elem = body[i]
        tag = elem.tag.split('}')[-1]
        if tag == 'p':
            p = docx.text.paragraph.Paragraph(elem, doc)
            if 'infrastructure_routes' in p.text.lower() and 'tabla 24' in p.text.lower():
                print(f"  -> Título de Tabla 24 encontrado en body index {i}: {p.text}")
                # Buscar el elemento tbl posterior
                for j in range(i+1, min(len(body), i+5)):
                    if body[j].tag.split('}')[-1] == 'tbl':
                        tbl24_elem = body[j]
                        print(f"  -> Elemento tbl de Tabla 24 encontrado en body index {j}.")
                        break
                break

    if tbl24_elem is None:
        raise Exception("No se encontró el elemento XML de la Tabla 24 en el cuerpo.")

    # Helper para formatear celdas
    def format_cell(cell, text, is_header=False, align_center=False, width_emu=None):
        cell.text = text
        p = cell.paragraphs[0]
        if align_center:
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        else:
            p.alignment = WD_ALIGN_PARAGRAPH.LEFT
        for r in p.runs:
            r.font.name = 'Arial'
            r.font.size = Pt(9.5 if is_header else 9)
            if is_header:
                r.font.bold = True
        if width_emu:
            cell.width = width_emu

    # -------------------------------------------------------------
    # INSERTAR TABLA 25: gasas_reserva
    # -------------------------------------------------------------
    # 1. Párrafo explicativo previo a Tabla 25
    p25_desc = parse_xml(f'<w:p {nsdecls("w")}/>')
    tbl24_elem.addnext(p25_desc)
    p_d25 = docx.text.paragraph.Paragraph(p25_desc, doc)
    p_d25.paragraph_format.line_spacing = 1.5
    p_d25.paragraph_format.space_after = Pt(6)
    r_d25 = p_d25.add_run('Para salvaguardar la continuidad del servicio ante eventuales cortes mecánicos en vanos aéreos, reconfiguraciones de trazado o futuras derivaciones hacia nuevas cajas terminales sin requerir el tendido de un cable completo, se implementó la entidad de Gasas de Reserva Técnica (gasas_reserva). Esta tabla almacena los bucles circulares de fibra óptica arrollados en crucetas o raquetas de poste:')
    r_d25.font.name = 'Arial'
    r_d25.font.size = Pt(11)

    # 2. Título de Tabla 25
    p25_cap = parse_xml(f'<w:p {nsdecls("w")}/>')
    p25_desc.addnext(p25_cap)
    p_c25 = docx.text.paragraph.Paragraph(p25_cap, doc)
    try:
        p_c25.style = 'Tablas'
    except Exception:
        pass
    p_c25.paragraph_format.space_after = Pt(3)
    r_c25 = p_c25.add_run('Tabla 25. Diccionario de datos: Entidad gasas_reserva (Gasas de Reserva Técnica de Fibra Óptica).')
    r_c25.font.name = 'Arial'

    # 3. Elaboración propia
    p25_el = parse_xml(f'<w:p {nsdecls("w")}/>')
    p25_cap.addnext(p25_el)
    p_e25 = docx.text.paragraph.Paragraph(p25_el, doc)
    p_e25.paragraph_format.space_after = Pt(6)
    r_e25 = p_e25.add_run('Elaboración propia')
    r_e25.font.name = 'Arial'
    r_e25.font.size = Pt(9)
    r_e25.font.bold = True

    # 4. Tabla 25 (gasas_reserva)
    t25 = doc.add_table(rows=11, cols=6)
    t25.style = 'Tabla con cuadrícula1'
    t25.alignment = WD_TABLE_ALIGNMENT.CENTER
    p25_el.addnext(t25._tbl)

    t25_headers = ['Campo', 'Tipo de Dato', 'Nulidad', 'Clave', 'Valor por Defecto', 'Restricciones y Reglas de Negocio']
    t25_widths = [1193165, 1146810, 652780, 510540, 774700, 1329055]
    
    t25_data = [
        ['id_gasa', 'VARCHAR(100)', 'NOT NULL', 'PK', 'gen_random_uuid()', 'Identificador alfanumérico único de la reserva técnica de fibra (ej. "gasa-sjr-reserva-01").'],
        ['nombre', 'VARCHAR(150)', 'NOT NULL', '', '', 'Denominación descriptiva de la gasa técnica (ej. "Gasa de Reserva 01 - El Fresno").'],
        ['longitud_metros', 'FLOAT', 'NOT NULL', '', '25.0', 'Metros lineales de cable arrollados en bucle de cruceta para contingencias operativas o empalmes futuros.'],
        ['metros_reserva', 'FLOAT', 'NULL', '', '25.0', 'Metraje técnico considerado en el cálculo topológico y metraje acumulado de la ruta.'],
        ['tipo_cable', 'VARCHAR(100)', 'NOT NULL', '', "'ADSS 48 Fibras'", 'Tipo y capacidad de cable de fibra óptica autosoportado contenido en el bucle de reserva.'],
        ['id_ruta', 'VARCHAR(100)', 'NULL', 'FK', '', 'Clave foránea opcional referenciando el tramo de tendido en infrastructure_routes(id_ruta).'],
        ['id_poste', 'VARCHAR(100)', 'NULL', 'FK', '', 'Clave foránea referenciando el poste de anclaje en infrastructure_postes(id_poste).'],
        ['coordenadas_gps', 'JSONB', 'NOT NULL', '', '', 'Coordenadas geográficas WGS84 del punto de sujeción: {"lat": Float, "lng": Float}.'],
        ['estado', 'VARCHAR(50)', 'NOT NULL', '', "'operativa'", 'Estado físico-operativo de la reserva (\'operativa\', \'en_mantenimiento\', \'dañada\').'],
        ['observaciones', 'TEXT', 'NULL', '', '', 'Notas técnicas de campo sobre la fijación mecánica, cruceta tipo raqueta o vano de fibra.']
    ]

    for c_idx, h_text in enumerate(t25_headers):
        format_cell(t25.rows[0].cells[c_idx], h_text, is_header=True, align_center=(c_idx in [2, 3, 4]), width_emu=t25_widths[c_idx])
    
    for r_idx, row_vals in enumerate(t25_data):
        for c_idx, val in enumerate(row_vals):
            format_cell(t25.rows[r_idx+1].cells[c_idx], val, is_header=False, align_center=(c_idx in [2, 3, 4]), width_emu=t25_widths[c_idx])

    print("  -> Tabla 25 (gasas_reserva) insertada exitosamente.")

    # -------------------------------------------------------------
    # INSERTAR TABLA 26: Estructura Geoespacial KMZ / KML 2.2
    # -------------------------------------------------------------
    # 1. Párrafo explicativo previo a Tabla 26
    p26_desc = parse_xml(f'<w:p {nsdecls("w")}/>')
    t25._tbl.addnext(p26_desc)
    p_d26 = docx.text.paragraph.Paragraph(p26_desc, doc)
    p_d26.paragraph_format.line_spacing = 1.5
    p_d26.paragraph_format.space_after = Pt(6)
    r_d26 = p_d26.add_run('Con el propósito de garantizar la interoperabilidad cartográfica y permitir la auditoría externa en herramientas de información geográfica como Google Earth, QGIS y ArcGIS, se definió la estructura formal de datos geoespaciales para la exportación en formato KMZ (OpenGIS KML 2.2 comprimido con JSZip). Esta especificación estipula la jerarquía de carpetas, los estilos cromáticos de semaforización y los metadatos tabulares inyectados en cada elemento de planta externa:')
    r_d26.font.name = 'Arial'
    r_d26.font.size = Pt(11)

    # 2. Título de Tabla 26
    p26_cap = parse_xml(f'<w:p {nsdecls("w")}/>')
    p26_desc.addnext(p26_cap)
    p_c26 = docx.text.paragraph.Paragraph(p26_cap, doc)
    try:
        p_c26.style = 'Tablas'
    except Exception:
        pass
    p_c26.paragraph_format.space_after = Pt(3)
    r_c26 = p_c26.add_run('Tabla 26. Estructura de datos geoespaciales y metadatos para exportación e interoperabilidad KMZ / OpenGIS KML 2.2.')
    r_c26.font.name = 'Arial'

    # 3. Elaboración propia
    p26_el = parse_xml(f'<w:p {nsdecls("w")}/>')
    p26_cap.addnext(p26_el)
    p_e26 = docx.text.paragraph.Paragraph(p26_el, doc)
    p_e26.paragraph_format.space_after = Pt(6)
    r_e26 = p_e26.add_run('Elaboración propia')
    r_e26.font.name = 'Arial'
    r_e26.font.size = Pt(9)
    r_e26.font.bold = True

    # 4. Tabla 26 (KMZ / KML Structure)
    t26 = doc.add_table(rows=12, cols=6)
    t26.style = 'Tabla con cuadrícula1'
    t26.alignment = WD_TABLE_ALIGNMENT.CENTER
    p26_el.addnext(t26._tbl)

    t26_headers = ['Capa / Componente', 'Elemento KML', 'Estilo / Icono', 'Propiedades y Metadatos CDATA', 'Color KML', 'Propósito en Google Earth / GIS']
    t26_widths = [1050000, 850000, 850000, 1150000, 700000, 1000000]

    t26_data = [
        ['<Document>', 'Encabezado Raíz', 'name, description, open', 'Metadatos institucionales GPON TELECOM', '-', 'Contenedor principal del proyecto cartográfico.'],
        ['<Style> Cajas NAP', 'IconStyle Dinámico', '#nap-disponible, #nap-alerta, #nap-saturada', 'Semaforización de ocupación de puertos', 'ff00e676 / ff00d0ff / ff3333ff', 'Representación visual del estado de capacidad de la caja.'],
        ['<Style> Central ODF', 'IconStyle Edificio', '#odf-central', 'Punto central de emisión y conmutación óptica', 'ff0284c7', 'Identificación de cabecera y origen de enlaces primarios.'],
        ['<Style> Infraestructura', 'IconStyle Formas', '#mufa-torpedo, #gasa-reserva, #poste-propuesto, #poste-cfe', 'Simbología unificada para elementos pasivos', 'Cyan / Naranja / Púrpura / Gris', 'Distinción clara de apoyos, mufas y reservas técnicas.'],
        ['<Folder> Central ODF', 'Placemark Point', '#odf-central', 'Nombre central, ubicación, capacidad hilos, coordenadas', 'Azul', 'Proyección satelital de la cabecera OLT/ODF.'],
        ['<Folder> Cajas NAP', 'Placemarks Point', 'Estilo según saturación', 'Tabla HTML: id_nap, zona, libres, ocupados, saturación %', 'Verde / Amarillo / Rojo', 'Inspección interactiva de cajas de distribución domiciliaria.'],
        ['<Folder> Rutas Fibra', 'Placemarks LineString', 'LineStyle grosor 3-4', 'Metraje en m/km, hilos (12/24/48), origen, destino', 'AABBGGRR según jerarquía', 'Trazado vectorial de cables troncales y de distribución.'],
        ['<Folder> Mufas FOSC', 'Placemarks Point', '#mufa-torpedo', 'Tipo cierre torpedo domo IP68, capacidad fusiones', 'ff00aaff', 'Ubicación de empalmes y fusiones en red de dispersión.'],
        ['<Folder> Gasas Reserva', 'Placemarks Point', '#gasa-reserva', 'Metros de reserva arrollada para contingencias', 'ffffaa00', 'Identificación de puntos con holgura de cable para averías.'],
        ['<Folder> Postes Red', 'Placemarks Point', '#poste-propuesto / #poste-cfe', 'Subcarpetas: Postes CFE y Propios, código rotulado', 'ffa855f7 / ff64748b', 'Catastro de apoyos aéreos para conciliación de derechos de paso.'],
        ['Paquete .kmz', 'Archivo Comprimido', 'doc.kml en archivo ZIP', 'Compresión DEFLATE vía JSZip, MIME kmz', '-', 'Distribución portátil lista para abrir con un clic en SIG.']
    ]

    for c_idx, h_text in enumerate(t26_headers):
        format_cell(t26.rows[0].cells[c_idx], h_text, is_header=True, align_center=(c_idx in [1, 2, 4]), width_emu=t26_widths[c_idx])
    
    for r_idx, row_vals in enumerate(t26_data):
        for c_idx, val in enumerate(row_vals):
            format_cell(t26.rows[r_idx+1].cells[c_idx], val, is_header=False, align_center=(c_idx in [1, 2, 4]), width_emu=t26_widths[c_idx])

    print("  -> Tabla 26 (Estructura Geoespacial KMZ) insertada exitosamente.")

    # -------------------------------------------------------------
    # 7. RENOMBRAR TABLAS POSTERIORES EN EL CUERPO (TABLA 25 -> 27, TABLA 26 -> 28)
    # -------------------------------------------------------------
    print("Renombrando tablas posteriores en el cuerpo...")
    for p in doc.paragraphs[500:]:
        if p.text.startswith('Tabla 25. Tabla de colores para contrastes en Adobe Color.'):
            p.text = 'Tabla 27. Tabla de colores para contrastes en Adobe Color.'
            p.runs[0].font.name = 'Arial'
            print("  -> Renombrada Tabla 25 a Tabla 27 en cuerpo.")
        elif p.text.startswith('Tabla 26. Esquema de la base local.'):
            p.text = 'Tabla 28. Esquema de la base de datos local IndexedDB (Dexie.js).'
            p.runs[0].font.name = 'Arial'
            print("  -> Renombrada Tabla 26 a Tabla 28 en cuerpo.")

    # -------------------------------------------------------------
    # 8. ACTUALIZAR ÍNDICE DE TABLAS AL INICIO DEL DOCUMENTO
    # -------------------------------------------------------------
    print("Actualizando Índice de Tablas al inicio del documento...")
    for i, p in enumerate(doc.paragraphs[:160]):
        txt = p.text.strip()
        if 'Tabla 22. Diccionario de infrastructure_oostes' in txt:
            p.text = 'Tabla 22. Diccionario de datos: Entidad infrastructure_postes (Postes de Infraestructura).\t117'
            p.runs[0].font.name = 'Arial'
            print("  -> Actualizado índice Tabla 22.")
        elif 'Tabla 23. Infraestructure_mufas' in txt:
            p.text = 'Tabla 23. Diccionario de datos: Entidad infrastructure_mufas (Mufas y Cierres de Empalme FOSC).\t119'
            p.runs[0].font.name = 'Arial'
            print("  -> Actualizado índice Tabla 23.")
        elif 'Tabla 24. Infraestructure_routes' in txt:
            p.text = 'Tabla 24. Diccionario de datos: Entidad infrastructure_routes (Rutas y Trazados de Fibra Óptica).\t120'
            p.runs[0].font.name = 'Arial'
            print("  -> Actualizado índice Tabla 24.")
            
            # Tras la Tabla 24 en el índice, insertamos Tabla 25 y Tabla 26
            target_p = p._element
            
            new_p25 = parse_xml(f'<w:p {nsdecls("w")}/>')
            target_p.addnext(new_p25)
            p_idx25 = docx.text.paragraph.Paragraph(new_p25, doc)
            try:
                p_idx25.style = 'toc 1'
            except Exception:
                pass
            r_idx25 = p_idx25.add_run('Tabla 25. Diccionario de datos: Entidad gasas_reserva (Gasas de Reserva Técnica).\t121')
            r_idx25.font.name = 'Arial'
            
            new_p26 = parse_xml(f'<w:p {nsdecls("w")}/>')
            new_p25.addnext(new_p26)
            p_idx26 = docx.text.paragraph.Paragraph(new_p26, doc)
            try:
                p_idx26.style = 'toc 1'
            except Exception:
                pass
            r_idx26 = p_idx26.add_run('Tabla 26. Estructura de datos geoespaciales y metadatos para exportación KMZ / KML 2.2.\t122')
            r_idx26.font.name = 'Arial'
            print("  -> Insertadas Tablas 25 y 26 en Índice de Tablas.")
            
        elif 'Tabla 25. Tabla de colores para contrastes' in txt:
            p.text = 'Tabla 27. Tabla de colores para contrastes en Adobe Color.\t135'
            p.runs[0].font.name = 'Arial'
            print("  -> Actualizado índice Tabla 27.")
        elif 'Tabla 26. Esquema de la base local.' in txt:
            p.text = 'Tabla 28. Esquema de la base de datos local IndexedDB (Dexie.js).\t161'
            p.runs[0].font.name = 'Arial'
            print("  -> Actualizado índice Tabla 28.")

    # Guardar documento
    print(f"Guardando cambios en {doc_path}...")
    doc.save(doc_path)
    print("Guardado exitoso.")

if __name__ == '__main__':
    run_update()

