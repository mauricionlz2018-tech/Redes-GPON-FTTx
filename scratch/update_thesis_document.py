import os
import re
import docx
from docx.shared import Pt, RGBColor, Inches
from docx.enum.text import WD_ALIGN_PARAGRAPH

def sanitize_text(text):
    if not text:
        return text
    # Prohibit em-dash, semicolon, emojis
    text = text.replace('—', ' - ').replace('–', ' - ')
    text = text.replace(';', ',')
    # Remove emojis
    for char in ['✔', '🚀', '📡', '❌', '💡', '📌', '⚡', '📊', '🔧', '🗺', '📦', '🔒', '🔑', '📱', '💻']:
        text = text.replace(char, '')
    return text

def format_caption(p, text):
    p.text = ""
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(4)
    p.paragraph_format.space_after = Pt(2)
    r = p.add_run(sanitize_text(text))
    r.font.name = 'Arial'
    r.font.size = Pt(9)
    r.font.bold = True
    r.font.color.rgb = RGBColor(0, 0, 0)

def format_source(p, text="Elaboración propia"):
    p.text = ""
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after = Pt(12)
    r = p.add_run(sanitize_text(text))
    r.font.name = 'Arial'
    r.font.size = Pt(9)
    r.font.bold = True
    r.font.color.rgb = RGBColor(0, 0, 0)

def format_heading(p, text, level=2):
    p.text = ""
    p.style = f"Heading {level}"
    p.alignment = WD_ALIGN_PARAGRAPH.LEFT
    p.paragraph_format.space_before = Pt(12)
    p.paragraph_format.space_after = Pt(6)
    r = p.add_run(sanitize_text(text))
    r.font.name = 'Arial'
    r.font.bold = True
    r.font.color.rgb = RGBColor(0, 0, 0)
    if level == 2:
        r.font.size = Pt(13)
    elif level == 3:
        r.font.size = Pt(11.5)

def format_body_p(p, text):
    p.text = ""
    p.style = "Normal"
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after = Pt(6)
    p.paragraph_format.line_spacing = 1.15
    r = p.add_run(sanitize_text(text))
    r.font.name = 'Arial'
    r.font.size = Pt(10)
    r.font.bold = False
    r.font.color.rgb = RGBColor(0, 0, 0)

def run_update():
    doc_path = "docs/Documentacion_Residencias (4).docx"
    doc = docx.Document(doc_path)
    print(f"Loaded document: {len(doc.paragraphs)} paragraphs.")

    # -------------------------------------------------------------
    # 1. INSERCIÓN DE SUBSECCIÓN 3.2.6: DIAGRAMA DE FLUJO GENERAL
    # -------------------------------------------------------------
    # Buscar el inicio de 3.3 Arquitectura topológica
    idx_3_3 = None
    for i, p in enumerate(doc.paragraphs):
        if "3.3" in p.text and "arquitectura topol" in p.text.lower():
            idx_3_3 = i
            break
    
    if idx_3_3 is None:
        raise ValueError("No se encontró el encabezado 3.3 en el documento")

    print(f"Found 3.3 at paragraph index {idx_3_3}")
    target_p = doc.paragraphs[idx_3_3]

    # Inserción de encabezado 3.2.6
    p_h = target_p.insert_paragraph_before()
    format_heading(p_h, "3.2.6 Diagrama de Flujo General de Operación y Procesos del Sistema", level=3)

    # Párrafos explicativos
    t1 = ("Para comprender de manera integral y dinámica la interacción entre los diferentes módulos del sistema, "
          "se diseñó el diagrama de flujo general bajo la norma estándar ANSI/ISO. Este modelo describe la secuencia "
          "cronológica y lógica de eventos, decisiones condicionales y bifurcaciones transaccionales que guían la jornada "
          "de un técnico de campo desde el inicio de sesión en la aplicación web progresiva (PWA) hasta la consolidación de "
          "operaciones en la base de datos central PostgreSQL.")
    p1 = target_p.insert_paragraph_before()
    format_body_p(p1, t1)

    t2 = ("El flujo operacional se desglosa en las siguientes etapas fundamentales:\n"
          "1. Fase de Autenticación Criptográfica y Control de Acceso: El usuario ingresa sus credenciales en la interfaz de "
          "acceso. El backend valida el hash de contraseña mediante bcrypt y emite un token JWT con vigencia de 24 horas. Si la "
          "autenticación es insatisfactoria, se retorna un código de error HTTP 401 y se solicita un nuevo intento. Al verificarse "
          "con éxito, se recupera el rol operativo del usuario (Administrador, Soporte o Técnico).\n"
          "2. Evaluación del Entorno de Red y Resiliencia Offline-First: El sistema evalúa el estado de conexión mediante el "
          "evento 'navigator.onLine'. Si el dispositivo carece de cobertura móvil en campo, se activa de forma transparente el modo "
          "sin conexión, extrayendo los activos geográficos y cajas NAP desde el almacenamiento local IndexedDB con Dexie.js. En "
          "caso de contar con enlace a Internet, se verifica la presencia de mutaciones diferidas en cola y se sincronizan en ráfaga "
          "hacia el servidor central.\n"
          "3. Despliegue Cartográfico Geoespacial: El visor Leaflet procesa las coordenadas geográficas, posicionando el ODF central "
          "en la Calle Hidalgo #10, trazando las polilíneas de fibra óptica troncal con su cálculo de atenuación y desplegando los "
          "marcadores de cajas NAP con semaforización cromática de saturación: verde (menos del 80%), amarillo (80% al 99%) y rojo (100%).\n"
          "4. Selección e Inspección de Chasis NAP: Al presionar un marcador en el mapa, el sistema abre la ventana modal con la "
          "matriz física de 16 puertos SC-APC, reflejando el estado individual de cada acoplador: Libre, Ocupado, Dañado o Reservado.\n"
          "5. Ejecución Transaccional con Bloqueo Pesimista (ACID): Ante una solicitud de asignación de cliente, los datos se someten a "
          "validación declarativa con esquemas Zod. El backend inicia una transacción atómica y ejecuta un bloqueo de fila pesimista "
          "(SELECT ... FOR UPDATE). Si el puerto continúa libre, se actualiza su estado a 'Ocupado', se inserta el registro del cliente y "
          "se efectúa el COMMIT definitivo. Si otro técnico ocupó el puerto concurrentemente, se revierte la operación (ROLLBACK) y se "
          "emite una respuesta HTTP 409 Conflicto.\n"
          "6. Dictámenes Formales y Bitácora de Desplazamiento: El sistema permite emitir reportes técnicos en PDF mediante streaming binario "
          "con PDFKit y registrar la bitácora de kilometraje y odometría de los vehículos de servicio.")
    p2 = target_p.insert_paragraph_before()
    format_body_p(p2, t2)

    # Imagen del diagrama de flujo
    p_img_flow = target_p.insert_paragraph_before()
    p_img_flow.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_img_flow = p_img_flow.add_run()
    r_img_flow.add_picture("docs/diagrama_flujo_global_proyecto.png", width=Inches(6.2))

    # Título de la figura (marcador provisional para renumeración)
    p_tit_flow = target_p.insert_paragraph_before()
    format_caption(p_tit_flow, "Figura TEMP_FLOW. Diagrama de flujo general de operación y procesos del sistema GPON.")

    # Fuente
    p_src_flow = target_p.insert_paragraph_before()
    format_source(p_src_flow, "Elaboración propia")

    # Párrafo en blanco de separación
    p_sep_flow = target_p.insert_paragraph_before()
    p_sep_flow.text = ""

    print("Subsección 3.2.6 y Diagrama de Flujo insertados con éxito.")

    # -------------------------------------------------------------
    # 2. REEMPLAZO DEL DIAGRAMA ENTIDAD-RELACIÓN POR NOTACIÓN CHEN (3.4.2)
    # -------------------------------------------------------------
    # Buscar el diagrama actual en 3.4.2
    idx_der_img = None
    for i, p in enumerate(doc.paragraphs):
        txt = p.text.strip().lower()
        if "figura" in txt and "diagrama entidad" in txt and "der" in txt:
            idx_der_caption = i
            idx_der_img = i - 1
            break

    if idx_der_img is not None:
        print(f"Found ER Diagram at paragraph {idx_der_img}, caption at {idx_der_caption}")
        p_img_der = doc.paragraphs[idx_der_img]
        p_img_der.text = ""
        p_img_der.alignment = WD_ALIGN_PARAGRAPH.CENTER
        r_img_der = p_img_der.add_run()
        r_img_der.add_picture("docs/diagrama_er_chen_gpon.png", width=Inches(6.3))

        # Actualizar texto de descripción en el párrafo anterior
        p_desc_der = doc.paragraphs[idx_der_img - 1]
        t_der = ("A solicitud de la coordinación institucional y atendiendo a los fundamentos formales de la ingeniería de datos, "
                 "se desarrolló el Diagrama Entidad - Relación adoptando la notación conceptual clásica de Peter Chen. En este estándar, "
                 "las entidades del dominio se configuran como rectángulos dorados, las relaciones de correspondencia se modelan a través "
                 "de rombos con su respectiva cardinalidad matemática (1:1 y 1:N), y las propiedades o atributos se representan mediante "
                 "elipses, resaltando con subrayado los campos que componen la Clave Primaria (PK). El esquema modela las ocho entidades "
                 "cardinales: USUARIO, ODF_PANEL, PUERTO_PON, HILO_FIBRA, CAJA_NAP, PUERTO_NAP, CLIENTE y BITACORA_KM.")
        format_body_p(p_desc_der, t_der)

        p_tit_der = doc.paragraphs[idx_der_caption]
        format_caption(p_tit_der, "Figura TEMP_CHEN. Diagrama Entidad-Relación (DER) conceptual con notación Chen del sistema de inventario GPON.")
        format_source(doc.paragraphs[idx_der_caption + 1], "Elaboración propia")
        print("Diagrama ER de Chen actualizado con éxito en 3.4.2.")

    # -------------------------------------------------------------
    # 3. REEMPLAZO DE CAPTURAS DE CÓDIGO EN CAPÍTULO IV (DESARROLLO)
    # -------------------------------------------------------------
    # A. Buscar Figura 44 (controladores) y reemplazar por code_portController.png
    for i, p in enumerate(doc.paragraphs):
        txt = p.text.strip().lower()
        if "figura 44" in txt and "controlador" in txt:
            print(f"Replacing Figura 44 at P{i}")
            # El párrafo de la imagen es i - 1
            p_img_ctrl = doc.paragraphs[i - 1]
            p_img_ctrl.text = ""
            p_img_ctrl.alignment = WD_ALIGN_PARAGRAPH.CENTER
            r_ctrl = p_img_ctrl.add_run()
            r_ctrl.add_picture("docs/code_portController.png", width=Inches(6.2))
            # Actualizar título
            format_caption(p, "Figura TEMP_CTRL. Controlador de asignación concurrente de puertos con transacción pesimista ACID (portController.ts).")
            format_source(doc.paragraphs[i + 1], "Elaboración propia")
            break

    # B. Buscar Figura 45 (rutas api.ts) y reemplazar por code_api_routes.png
    for i, p in enumerate(doc.paragraphs):
        txt = p.text.strip().lower()
        if "figura 45" in txt and "rutas" in txt:
            print(f"Replacing Figura 45 at P{i}")
            # El párrafo de la imagen es i - 1
            p_img_routes = doc.paragraphs[i - 1]
            p_img_routes.text = ""
            p_img_routes.alignment = WD_ALIGN_PARAGRAPH.CENTER
            r_routes = p_img_routes.add_run()
            r_routes.add_picture("docs/code_api_routes.png", width=Inches(6.2))
            # Actualizar título
            format_caption(p, "Figura TEMP_ROUTES. Definición de rutas y endpoints de la API REST con middlewares de seguridad y RBAC (api.ts).")
            format_source(doc.paragraphs[i + 1], "Elaboración propia")
            break

    # C. Inserción de 4.1.4 (index.ts) y 4.1.5 (Integración Frontend - Backend)
    # Buscamos el encabezado 4.2 Construcción de la interfaz de usuario
    idx_4_2 = None
    for i, p in enumerate(doc.paragraphs):
        if "4.2" in p.text and "construcci" in p.text.lower() and "interfaz" in p.text.lower():
            idx_4_2 = i
            break

    if idx_4_2 is not None:
        print(f"Found 4.2 at paragraph index {idx_4_2}")
        target_p_42 = doc.paragraphs[idx_4_2]

        # 4.1.4 Encabezado
        p_h414 = target_p_42.insert_paragraph_before()
        format_heading(p_h414, "4.1.4 Inicialización del Servidor Backend y Orquestación Express (index.ts)", level=3)

        t_srv = ("El punto de entrada y arranque del servicio backend se ubica en 'backend/src/index.ts'. En este módulo se "
                 "inicializa la instancia del framework Express, se configuran las políticas de intercambio de recursos de origen "
                 "cruzado (CORS) para autorizar las solicitudes entrantes desde el cliente web y móvil PWA, se activa el analizador "
                 "de cuerpos en formato JSON y se enlaza el enrutador central de la API versión 1 ('/api/v1'). Asimismo, la función "
                 "'startServer()' valida la conectividad con el clúster de base de datos PostgreSQL mediante 'sequelize.authenticate()', "
                 "asegurando la existencia del pool de conexiones antes de habilitar la escucha en el puerto de red 4000.")
        p_srv = target_p_42.insert_paragraph_before()
        format_body_p(p_srv, t_srv)

        # Imagen index.ts
        p_img_srv = target_p_42.insert_paragraph_before()
        p_img_srv.alignment = WD_ALIGN_PARAGRAPH.CENTER
        r_img_srv = p_img_srv.add_run()
        r_img_srv.add_picture("docs/code_index_server.png", width=Inches(6.2))

        # Título y fuente
        p_tit_srv = target_p_42.insert_paragraph_before()
        format_caption(p_tit_srv, "Figura TEMP_SRV. Inicialización del servidor Express, configuración CORS y conexión Sequelize (index.ts).")
        p_src_srv = target_p_42.insert_paragraph_before()
        format_source(p_src_srv, "Elaboración propia")

        # 4.1.5 Integración Frontend y Backend
        p_h415 = target_p_42.insert_paragraph_before()
        format_heading(p_h415, "4.1.5 Arquitectura de Integración Cliente - Servidor (Frontend y Backend)", level=3)

        t_int1 = ("La cohesión funcional de la plataforma descansa en una arquitectura desacoplada y asíncrona entre la aplicación "
                  "cliente (Single Page Application desarrollada con React, Vite y Leaflet) y el backend RESTful (desarrollado con "
                  "Node.js, Express, Sequelize y PostgreSQL). Para lograr una integración sólida y tolerante a fallos en campo, se "
                  "establecieron cuatro mecanismos fundamentales:\n"
                  "1. Contrato de Datos Unificado: Se definieron interfaces de TypeScript en 'frontend/src/types/index.ts' que reflejan "
                  "con exactitud los atributos de los modelos de base de datos del backend, eliminando cualquier inconsistencia de tipo o "
                  "campos nulos entre las capas.\n"
                  "2. Cliente HTTP Singleton con Interceptores Axios: En el archivo 'frontend/src/api/client.ts' se centralizan las "
                  "peticiones salientes. Un interceptor inyecta de manera automática el encabezado 'Authorization: Bearer <token>' "
                  "recuperado del almacenamiento local seguro. Asimismo, un interceptor de respuesta captura códigos HTTP 401 (sesión caducada) "
                  "redirigiendo al usuario a la vista de autenticación sin interrumpir abruptamente la ejecución en memoria.\n"
                  "3. Sincronización Reactiva de Estados: Cuando un técnico realiza una operación en la interfaz (por ejemplo, asignar un abonado "
                  "en el modal de puertos), la petición es despachada al backend bajo bloqueo pesimista. Al recibir la confirmación HTTP 200 OK, "
                  "el componente actualiza inmediatamente el árbol de estado de React, refrescando el color del puerto a verde (Ocupado) y "
                  "recalculando la saturación de la caja NAP en el mapa sin requerir la recarga completa del navegador.\n"
                  "4. Tolerancia a Fallos y Manejo de Errores: La siguiente tabla resume el protocolo de comunicación y los códigos de respuesta "
                  "estandarizados entre cliente y servidor.")
        p_int1 = target_p_42.insert_paragraph_before()
        format_body_p(p_int1, t_int1)

        # Imagen client.ts
        p_img_cli = target_p_42.insert_paragraph_before()
        p_img_cli.alignment = WD_ALIGN_PARAGRAPH.CENTER
        r_img_cli = p_img_cli.add_run()
        r_img_cli.add_picture("docs/code_frontend_client.png", width=Inches(6.0))

        p_tit_cli = target_p_42.insert_paragraph_before()
        format_caption(p_tit_cli, "Figura TEMP_CLI. Cliente HTTP Axios con interceptor de autorización Bearer JWT y manejo de sesión (client.ts).")
        p_src_cli = target_p_42.insert_paragraph_before()
        format_source(p_src_cli, "Elaboración propia")

        print("Subsecciones 4.1.4 y 4.1.5 de integración insertadas con éxito.")

    # D. Inserción de 4.3.4 (Dexie.js offlineDb.ts)
    # Buscamos el encabezado 4.4 Automatización de reportes
    idx_4_4 = None
    for i, p in enumerate(doc.paragraphs):
        if "4.4" in p.text and "automatizaci" in p.text.lower() and "reportes" in p.text.lower():
            idx_4_4 = i
            break

    if idx_4_4 is not None:
        print(f"Found 4.4 at paragraph index {idx_4_4}")
        target_p_44 = doc.paragraphs[idx_4_4]

        p_h434 = target_p_44.insert_paragraph_before()
        format_heading(p_h434, "4.3.4 Persistencia Local en IndexedDB y Esquema de Tablas con Dexie.js (offlineDb.ts)", level=3)

        t_off = ("Para materializar la arquitectura Offline-First requerida por el personal técnico en comunidades con cobertura celular "
                 "intermitente o nula en el municipio de San José del Rincón, se implementó una base de datos local embebida en el navegador "
                 "mediante IndexedDB, gestionada a través de la librería Dexie.js en 'frontend/src/db/offlineDb.ts'. La clase "
                 "'GponOfflineDatabase' define dos tablas fundamentales:\n"
                 "1. 'cached_naps': Almacena la réplica local de las cajas terminales ópticas, sus coordenadas GPS, identificación y capacidad, "
                 "permitiendo consultar la topología de la red sin conexión activa.\n"
                 "2. 'pending_mutations': Estructura una cola de persistencia con clave autoincremental que registra cronológicamente cada cambio "
                 "de estado de puerto, asignación de cliente o captura de coordenadas efectuada en campo. Al restablecerse la conectividad móvil, "
                 "el servicio de sincronización descarga secuencialmente los registros de esta cola hacia los endpoints RESTful del backend.")
        p_off = target_p_44.insert_paragraph_before()
        format_body_p(p_off, t_off)

        # Imagen offlineDb.ts
        p_img_off = target_p_44.insert_paragraph_before()
        p_img_off.alignment = WD_ALIGN_PARAGRAPH.CENTER
        r_img_off = p_img_off.add_run()
        r_img_off.add_picture("docs/code_offline_db.png", width=Inches(6.0))

        p_tit_off = target_p_44.insert_paragraph_before()
        format_caption(p_tit_off, "Figura TEMP_OFF. Esquema de persistencia local IndexedDB con Dexie.js para trabajo sin conexión (offlineDb.ts).")
        p_src_off = target_p_44.insert_paragraph_before()
        format_source(p_src_off, "Elaboración propia")

        print("Subsección 4.3.4 de Dexie.js insertada con éxito.")

    # -------------------------------------------------------------
    # 4. RENUMERACIÓN CONTIGUA DE TODAS LAS FIGURAS DEL DOCUMENTO
    # -------------------------------------------------------------
    print("Iniciando renumeración contigua de figuras...")
    fig_counter = 1
    new_figures_list = []

    # Localizar donde termina el índice preliminar de figuras
    # Las figuras del cuerpo inician aproximadamente después del párrafo 170 (Capítulo I)
    idx_cap1 = None
    for i, p in enumerate(doc.paragraphs):
        if "capítulo i." in p.text.lower() or "capitulo i." in p.text.lower():
            idx_cap1 = i
            break

    print(f"Capitulo I starts at paragraph {idx_cap1}")

    for i in range(idx_cap1, len(doc.paragraphs)):
        p = doc.paragraphs[i]
        txt = p.text.strip()
        if txt.startswith("Figura ") or txt.startswith("Figura."):
            # Extraer el título limpio
            # Quitar "Figura X." o "Figura TEMP_XXX."
            parts = re.split(r'Figura\s*(\d+|TEMP_[A-Za-z0-9_]+)\.?\s*', txt)
            if len(parts) >= 3:
                clean_title = parts[2].strip()
            else:
                clean_title = txt[txt.find('.') + 1:].strip() if '.' in txt else txt

            new_caption_text = f"Figura {fig_counter}. {clean_title}"
            format_caption(p, new_caption_text)
            new_figures_list.append((fig_counter, clean_title))
            print(f"Renumbered P{i}: Figura {fig_counter}. {clean_title[:60]}")
            fig_counter += 1

    print(f"Total figures renumbered in document body: {len(new_figures_list)}")

    # -------------------------------------------------------------
    # 5. ACTUALIZAR ÍNDICE DE FIGURAS EN PÁGINAS PRELIMINARES
    # -------------------------------------------------------------
    # Localizar los párrafos del índice de figuras preliminar (entre P50 y P120)
    idx_figs_list_start = None
    idx_figs_list_end = None
    for i in range(40, 160):
        p = doc.paragraphs[i]
        if p.text.strip().startswith("Figura 1."):
            idx_figs_list_start = i
            break

    if idx_figs_list_start is not None:
        for i in range(idx_figs_list_start, 170):
            p = doc.paragraphs[i]
            if not p.text.strip().startswith("Figura "):
                idx_figs_list_end = i
                break

        print(f"Prelim figures index found from P{idx_figs_list_start} to P{idx_figs_list_end}")

        # Actualizar o reemplazar párrafos en el índice preliminar
        # Para no romper formato de página, actualizamos los párrafos existentes
        for k, (f_num, f_title) in enumerate(new_figures_list):
            p_idx = idx_figs_list_start + k
            entry_text = f"Figura {f_num}. {f_title}"
            if p_idx < idx_figs_list_end:
                p_entry = doc.paragraphs[p_idx]
                p_entry.text = ""
                p_entry.alignment = WD_ALIGN_PARAGRAPH.LEFT
                r = p_entry.add_run(sanitize_text(entry_text))
                r.font.name = "Arial"
                r.font.size = Pt(10)
                r.font.color.rgb = RGBColor(0, 0, 0)
            else:
                # Si hay más figuras de las que había originalmente, insertar antes de idx_figs_list_end
                target_idx_p = doc.paragraphs[idx_figs_list_end]
                p_new_entry = target_idx_p.insert_paragraph_before()
                p_new_entry.alignment = WD_ALIGN_PARAGRAPH.LEFT
                r = p_new_entry.add_run(sanitize_text(entry_text))
                r.font.name = "Arial"
                r.font.size = Pt(10)
                r.font.color.rgb = RGBColor(0, 0, 0)
                idx_figs_list_end += 1

    # -------------------------------------------------------------
    # 6. SANITIZAR TODO EL DOCUMENTO (CERO GUION LARGO, CERO SEMICOLON, CERO AZUL)
    # -------------------------------------------------------------
    print("Sanitizando caracteres y colores en todo el documento...")
    for p in doc.paragraphs:
        if '—' in p.text or ';' in p.text:
            for r in p.runs:
                if '—' in r.text or ';' in r.text:
                    r.text = sanitize_text(r.text)
        # Forzar negro en todos los runs
        for r in p.runs:
            r.font.color.rgb = RGBColor(0, 0, 0)

    for table in doc.tables:
        for row in table.rows:
            for cell in row.cells:
                for p in cell.paragraphs:
                    if '—' in p.text or ';' in p.text:
                        for r in p.runs:
                            if '—' in r.text or ';' in r.text:
                                r.text = sanitize_text(r.text)
                    for r in p.runs:
                        r.font.color.rgb = RGBColor(0, 0, 0)

    # Guardar documento final
    out_final = "docs/Documentacion_Residencias (4).docx"
    doc.save(out_final)
    print(f"Document updated and saved successfully at: {out_final}")

if __name__ == "__main__":
    run_update()

