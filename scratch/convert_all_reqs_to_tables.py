import docx
from docx.shared import Pt, Inches, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import parse_xml
from docx.oxml.ns import nsdecls, qn
import shutil
import re

src_path = 'docs/Documentacion_Residencias_avance.docx'
backup_path = 'docs/Documentacion_Residencias_avance_BACKUP_11OCT_PRE_REQ_TABLES.docx'
target_avance = 'docs/Documentacion_Residencias_avance.docx'
target_mirror = 'docs/Documentacion_Residencias (4).docx'

shutil.copyfile(src_path, backup_path)
print(f"Backup creado en: {backup_path}")

doc = docx.Document(src_path)

# Helper para crear párrafo de título de Tabla (estilo 'Tablas')
def make_table_caption_el(doc, title_text):
    p = doc.add_paragraph(style='Tablas')
    r = p.add_run(title_text)
    r.font.name = 'Arial'
    r.font.size = Pt(9)
    r.font.bold = True
    r.font.color.rgb = RGBColor(0, 0, 0)
    return p._element

# Helper para crear párrafo de nota 'Elaboración propia'
def make_table_note_el(doc, note_text="Elaboración propia"):
    p = doc.add_paragraph(style='Normal')
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(4)
    p.paragraph_format.space_after = Pt(4)
    r = p.add_run(note_text)
    r.font.name = 'Arial'
    r.font.size = Pt(9)
    r.font.bold = True
    r.font.color.rgb = RGBColor(0, 0, 0)
    return p._element

# Helper para crear tabla en formato blanco y negro sencillo ('Table Grid')
def make_bw_table_el(doc, headers, rows_data, col_widths_inches=None):
    tbl = doc.add_table(rows=len(rows_data) + 1, cols=len(headers))
    tbl.style = 'Table Grid'
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER

    # Configurar repetición de encabezado en cada página (tblHeader)
    trPr_hdr = tbl.rows[0]._tr.get_or_add_trPr()
    trPr_hdr.append(parse_xml(f'<w:tblHeader {nsdecls("w")}/>'))

    # Poblar fila de encabezado (Blanco y negro, negrita, centrado)
    for col_idx, h_text in enumerate(headers):
        cell = tbl.rows[0].cells[col_idx]
        if col_widths_inches and col_idx < len(col_widths_inches):
            cell.width = Inches(col_widths_inches[col_idx])
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.paragraph_format.space_before = Pt(3)
        p.paragraph_format.space_after = Pt(3)
        p.paragraph_format.line_spacing = 1.15
        r = p.add_run(h_text)
        r.font.name = 'Arial'
        r.font.size = Pt(9.5)
        r.font.bold = True
        r.font.color.rgb = RGBColor(0, 0, 0)

    # Poblar filas de datos (Blanco y negro, sin fondo de color)
    for row_idx, r_data in enumerate(rows_data, start=1):
        row = tbl.rows[row_idx]
        for col_idx, val_text in enumerate(r_data):
            cell = row.cells[col_idx]
            if col_widths_inches and col_idx < len(col_widths_inches):
                cell.width = Inches(col_widths_inches[col_idx])
            p = cell.paragraphs[0]
            # Centrar Código (col 0) y Prioridad (última col)
            if col_idx == 0 or col_idx == len(headers) - 1:
                p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            else:
                p.alignment = WD_ALIGN_PARAGRAPH.LEFT
            p.paragraph_format.space_before = Pt(2)
            p.paragraph_format.space_after = Pt(2)
            p.paragraph_format.line_spacing = 1.15
            r = p.add_run(val_text)
            r.font.name = 'Arial'
            r.font.size = Pt(9)
            r.font.bold = (col_idx == 0)  # Código en negrita para legibilidad en B/N
            r.font.color.rgb = RGBColor(0, 0, 0)

    return tbl._element

# Helper para reemplazar los párrafos de una subsección por su tabla
def replace_subsection_with_table(doc, heading_prefix, next_heading_prefix, caption_title, headers, rows_data, col_widths):
    paras = doc.paragraphs
    start_idx = None
    end_idx = None
    for i, p in enumerate(paras):
        if p.text.strip().startswith(heading_prefix) and p.style.name.startswith('Heading'):
            start_idx = i
        elif start_idx is not None and p.text.strip().startswith(next_heading_prefix) and p.style.name.startswith('Heading'):
            end_idx = i
            break

    if start_idx is None or end_idx is None:
        raise RuntimeError(f"No se encontró el rango para {heading_prefix} -> {next_heading_prefix}")

    # Conservamos el Heading (start_idx) y el párrafo introductorio (start_idx + 1)
    intro_p = paras[start_idx + 1]
    # Eliminamos los párrafos planos desde start_idx + 2 hasta end_idx - 1
    for j in range(start_idx + 2, end_idx):
        p_el = paras[j]._element
        p_el.getparent().remove(p_el)

    # Creamos título de tabla, nota y tabla, y los insertamos después de intro_p
    cap_el = make_table_caption_el(doc, caption_title)
    note_el = make_table_note_el(doc, "Elaboración propia")
    tbl_el = make_bw_table_el(doc, headers, rows_data, col_widths)

    intro_el = intro_p._element
    intro_el.addnext(cap_el)
    cap_el.addnext(note_el)
    note_el.addnext(tbl_el)
    print(f"  -> Convertido {heading_prefix} en tabla ({len(rows_data)} filas).")

# ==============================================================================
# DEFINICIÓN DE DATOS DE LAS 9 TABLAS DE REQUERIMIENTOS CON SUS CÓDIGOS
# ==============================================================================

# 1. 3.2.3 Requerimientos Funcionales (RF-01 a RF-35)
rf_headers = ["Código", "Módulo", "Requerimiento", "Descripción Funcional", "Prioridad"]
rf_widths = [0.75, 1.15, 1.35, 2.45, 0.70]
rf_rows = [
    ("RF-01", "Seguridad", "Autenticación Estricta contra Base de Datos", "Inicio de sesión seguro mediante verificación estricta de credenciales con función hash unidireccional bcrypt contra la base de datos PostgreSQL, rechazando credenciales inválidas y emitiendo un token JWT firmado criptográficamente con vigencia de 24 horas.", "Alta"),
    ("RF-02", "Seguridad", "Recuperación Institucional de Contraseñas", "Restablecimiento de credenciales de acceso mediante generación de tokens criptográficos de un solo uso con caducidad máxima de 15 minutos y despacho de correo electrónico transaccional con plantilla corporativa sobria de GPON TELECOM.", "Media"),
    ("RF-03", "Seguridad", "Control RBAC y Bloqueo 403", "Validación de privilegios en cada endpoint HTTP, rechazando accesos no autorizados con código de estado HTTP 403.", "Alta"),
    ("RF-04", "Seguridad", "Conmutador Demo Roles", "Selector en la barra superior para alternar perfiles (Admin, Soporte, Técnico) con un solo clic con fines de auditoría y pruebas.", "Media"),
    ("RF-05", "Seguridad", "Gestión de Cuentas", "Listado, consulta y actualización de perfiles de usuario (nombre, contraseña cifrada, rol y estado operativo).", "Media"),
    ("RF-06", "Cabecera (Central / OLT / ODF)", "Monitoreo de Panel ODF", "Visualización de panel ODF central de 48 puertos con ubicación física y capacidad de hilos troncales.", "Media"),
    ("RF-07", "Cabecera (Central / OLT / ODF)", "Trazabilidad Puertos PON", "Inventario de puertos PON OLT (tarjeta, slot, potencia emitida en dBm y tasa nominal 2.488/1.244 Gbps).", "Alta"),
    ("RF-08", "Cabecera (Central / OLT / ODF)", "Inventario Hilos Fibra", "Registro de hilos ópticos desde el ODF hacia derivaciones primarias, categorizados como Activo, Reserva o Muerto.", "Media"),
    ("RF-09", "Cajas NAP", "Alta de Cajas NAP", "Registro de nueva caja terminal con código único, ubicación geográfica WGS84 y autogeneración de sus 16 puertos.", "Alta"),
    ("RF-10", "Cajas NAP", "Saturación Dinámica", "Cálculo en tiempo real del porcentaje de ocupación clasificando en: Verde (<80%), Amarillo (80-99%) y Rojo (100%).", "Alta"),
    ("RF-11", "Cajas NAP", "Búsqueda Cartográfica", "Buscador predictivo por código de caja, dirección o zona con centrado y zoom automático en el mapa.", "Alta"),
    ("RF-12", "Cajas NAP", "Edición de Metadatos", "Actualización de código, capacidad, atenuación óptica calculada y notas de campo de la caja NAP.", "Media"),
    ("RF-13", "Cajas NAP", "Eliminación Controlada", "Baja lógica de la caja terminal condicionada a que la totalidad de sus puertos se encuentren en estado Libre.", "Alta"),
    ("RF-14", "Cajas NAP", "Calibración GPS en Sitio", "Captura satelital de coordenadas de alta precisión mediante la API nativa de geolocalización del dispositivo móvil del técnico.", "Alta"),
    ("RF-15", "Cajas NAP", "Control de Capas y Cartografía de Planta Externa", "Selector dinámico de capas geoespaciales que permite superponer y alternar en tiempo real la visualización de cajas NAP, rutas troncales y de distribución, mufas de empalme, gasas de reserva técnica y postes de apoyo aéreo con actualización reactiva.", "Alta"),
    ("RF-16", "Puertos", "Matriz Visual 16 Puertos", "Representación gráfica interactiva del chasis físico de 16 adaptadores SC-APC con código de colores LED indicativo de estado.", "Alta"),
    ("RF-17", "Puertos", "Asignación Transaccional", "Vinculación atómica de puerto libre a cliente mediante bloqueo pesimista ACID (SELECT ... FOR UPDATE).", "Alta"),
    ("RF-18", "Puertos", "Liberación de Puertos", "Desvinculación de abonado y restitución del puerto al estado Libre, reservado a roles Admin y Soporte.", "Alta"),
    ("RF-19", "Puertos", "Mantenimiento de Puertos", "Marcado de puerto como Dañado o Reservado para impedir asignaciones durante fallas mecánicas o inspecciones.", "Alta"),
    ("RF-20", "Puertos", "Historial de Asignaciones", "Registro inmutable con marca de tiempo (timestamp) de fecha, hora y usuario responsable de la asignación o liberación del puerto.", "Media"),
    ("RF-21", "Abonados / Clientes", "Alta de Suscriptores", "Registro de abonado con contrato único, nombres, dirección física, plan de velocidad (Mbps) y teléfono de contacto.", "Alta"),
    ("RF-22", "Abonados / Clientes", "Directorio y Filtros", "Búsqueda de clientes por contrato, nombre o caja NAP asociada con paginación optimizada.", "Alta"),
    ("RF-23", "Abonados / Clientes", "Expediente Técnico", "Visualización de caja terminal, puerto de conexión, atenuación óptica calculada y coordenadas de domicilio.", "Media"),
    ("RF-24", "Abonados / Clientes", "Modificación de Datos", "Actualización de domicilio, teléfono, plan de ancho de banda o cambio de estado operativo del cliente.", "Media"),
    ("RF-25", "Operación Offline", "Caché de Aplicación PWA", "Pre-carga e instalación en el dispositivo móvil de todos los activos estáticos mediante Service Worker.", "Alta"),
    ("RF-26", "Operación Offline", "Almacenamiento IndexedDB", "Persistencia local en el navegador (vía Dexie.js) de cajas NAP, puertos y clientes para consulta en campo sin red.", "Alta"),
    ("RF-27", "Operación Offline", "Sincronización por Cola", "Encolamiento local de órdenes de asignación en modo offline y despacho automático en ráfaga al restablecer conectividad.", "Alta"),
    ("RF-28", "Reportes", "Reporte PDF en Streaming", "Generación en tiempo real y descarga de reporte técnico de caja NAP y clientes asociados vía PDFKit.", "Alta"),
    ("RF-29", "Asistente", "Chatbot Técnico Integrado", "Módulo de soporte virtual con base de conocimientos del código de colores de fibra TIA/EIA-598-A y diagnóstico de fallas ópticas.", "Media"),
    ("RF-30", "Interoperabilidad GIS / KMZ", "Exportación de Red a Paquete KMZ", "Generación y descarga directa con un solo clic de un archivo comprimido estándar KMZ ('Red_GPON_San_Jose_del_Rincon.kmz') compatible con Google Earth Desktop/Web, QGIS 3.x y ArcGIS, que consolida la totalidad de la infraestructura de planta externa en un único paquete autocontenido.", "Alta"),
    ("RF-31", "Interoperabilidad GIS / KMZ", "Semaforización Dinámica KML", "Inyección de estilos geoespaciales normalizados en KML con iconos circulares y coloración idéntica al visor web: Disponible (Verde #00e676), Alerta preventiva (Amarillo #00d0ff) y Saturación total (Rojo #ff3333), permitiendo auditorías visuales inmediatas de capacidad instalada.", "Alta"),
    ("RF-32", "Interoperabilidad GIS / KMZ", "Fichas Técnicas Embebidas en Placemarks", "Inclusión de descripciones HTML formateadas en bloques CDATA para cada elemento geográfico, desglosando nombre, código, zona, capacidad total de puertos, puertos ocupados, puertos libres, porcentaje de saturación, coordenadas GPS, tipo de cable, capacidad de hilos y metrajes.", "Alta"),
    ("RF-33", "Interoperabilidad GIS / KMZ", "Vectorización de Tendidos y Metrajes Ópticos", "Exportación de rutas de fibra óptica como elementos LineString con coordenadas WGS84 interpoladas, LineStyle cromático según jerarquía de cableado (troncal vs distribución) y persistencia de distancias calculadas en metros y kilómetros.", "Alta"),
    ("RF-34", "Interoperabilidad GIS / KMZ", "Catastro de Apoyos y Elementos Pasivos", "Estructuración jerárquica en carpetas KML independientes para postes propios/propuestos, postes de arriendo CFE con código de rotulado, mufas de empalme tipo torpedo domo (IP68) con capacidad de fusiones y bucles de reserva técnica de fibra.", "Media"),
    ("RF-35", "Interoperabilidad GIS / KMZ", "Compilación Asíncrona en el Cliente", "Procesamiento en memoria del navegador mediante la librería JSZip y Blob API, permitiendo compilar el paquete KMZ sin sobrecargar el servidor backend y con operatividad completa incluso en entornos desconectados.", "Alta"),
]

# 2. 3.2.4 Requerimientos No Funcionales (RNF-01 a RNF-11)
rnf_headers = ["Código", "Atributo de Calidad (ISO/IEC 25010)", "Descripción y Criterio de Aceptación Técnico", "Prioridad"]
rnf_widths = [0.80, 1.55, 3.35, 0.70]
rnf_rows = [
    ("RNF-01", "Adecuación Funcional", "El sistema garantiza exactitud matemática absoluta (100%) en el inventario de puertos. Se prohíbe de manera categórica cualquier discrepancia entre los puertos físicos disponibles y los registrados en base de datos.", "Alta"),
    ("RNF-02", "Eficiencia de Desempeño", "Las peticiones de lectura y escritura al backend REST deben completarse en un tiempo medio inferior a 180 ms bajo condiciones normales de red. La generación en streaming de reportes en PDF no debe exceder los 500 ms y el consumo de memoria RAM del backend en producción no debe sobrepasar los 200 MB.", "Alta"),
    ("RNF-03", "Compatibilidad e Interoperabilidad", "La interfaz de usuario debe ejecutarse de forma fluida y transparente en los motores de navegación modernos (Google Chrome / Chromium v110+, Mozilla Firefox v115+, Apple Safari v16+) tanto en dispositivos móviles (Android 10+, iOS 15+) como en terminales de escritorio Windows y Linux.", "Alta"),
    ("RNF-04", "Usabilidad y Accesibilidad", "El diseño de la interfaz responde al principio Mobile-First con Tailwind CSS, garantizando áreas mínimas de contacto táctil de 48 x 48 píxeles para facilitar la pulsación con una sola mano por técnicos equipados con guantes de liniero. El contraste cromático cumple con WCAG 2.1 nivel AA.", "Alta"),
    ("RNF-05", "Fiabilidad y Tolerancia a Fallos", "Disponibilidad operativa objetivo de la plataforma del 99.9%. Ante una pérdida imprevista de conexión de datos celulares en campo, el sistema no experimenta congelamiento ni pérdida de datos, conmutando de forma imperceptible hacia la base de datos local Dexie.js (IndexedDB).", "Alta"),
    ("RNF-06", "Seguridad Criptográfica", "Las contraseñas de usuario se procesan mediante la función criptográfica unidireccional bcrypt incorporando un factor de costo de trabajo computacional (cost factor = 10) y sal aleatoria. Las comunicaciones cliente-servidor se canalizan sobre TLS 1.3 (HTTPS) y las consultas SQL se parametrizan mediante Sequelize.", "Alta"),
    ("RNF-07", "Mantenibilidad y Modularidad", "El 100% de la base de código está escrita bajo el sistema de tipado estático estricto de TypeScript tanto en frontend como en backend, eliminando errores de tipado en tiempo de ejecución. La arquitectura se desacopla en capas de configuración, modelos, controladores, middlewares y rutas.", "Media"),
    ("RNF-08", "Portabilidad", "La aplicación completa está contenerizada con Docker y Docker Compose, permitiendo desplegar la base de datos, el backend y el frontend en cualquier infraestructura cloud o servidor local en menos de tres minutos mediante un único comando.", "Media"),
    ("RNF-09", "Interoperabilidad Geoespacial (OGC KML 2.2)", "El paquete cartográfico exportado debe cumplir rigurosamente con la especificación internacional OpenGIS KML 2.2 y compresión ZIP estándar (.kmz), abriéndose sin anomalías de sintaxis XML ni reproyecciones manuales (WGS84 / EPSG:4326) en Google Earth, QGIS 3.x y ArcGIS.", "Alta"),
    ("RNF-10", "Eficiencia en Compilación KMZ en Cliente", "La serialización XML del documento KML, la conversión cromática a formato KML (AABBGGRR) y la compresión DEFLATE mediante JSZip deben completarse en un tiempo no mayor a 2.0 segundos para redes con hasta 1,000 elementos geográficos, sin bloquear el hilo principal.", "Alta"),
    ("RNF-11", "Seguridad en Recuperación de Credenciales", "Los tokens de restablecimiento de contraseña deben generarse mediante entropía criptográficamente segura (CSPRNG) con validez temporal estricta de 15 minutos y un solo uso, impidiendo ataques de repetición o fuerza bruta.", "Alta"),
]

# 3. 3.2.5 Requerimientos de Diseño e Interfaz de Usuario (UI/UX) (RDI-01 a RDI-08)
rdi_headers = ["Código", "Requerimiento de Diseño (UI/UX)", "Especificación Ergonómica y Visual (ISO 9241-210 / WCAG 2.1)", "Prioridad"]
rdi_widths = [0.80, 1.55, 3.35, 0.70]
rdi_rows = [
    ("RDI-01", "Ergonomía Visual y Accesibilidad Bajo Luz Solar", "La interfaz debe implementar una relación de contraste cromático mínima de 4.5:1 para texto normal y de 3.0:1 para elementos de control gráfico contra el fondo, garantizando total legibilidad bajo condiciones de radiación solar directa en campo abierto.", "Alta"),
    ("RDI-02", "Dimensiones de Controles Táctiles (Touch Targets)", "Todos los elementos interactivos, botones de acción, marcadores cartográficos y conectores de puerto deben presentar un área táctil mínima de 48×48 píxeles con separación perimetral de al menos 8 px, facultando la pulsación precisa con una sola mano por técnicos con guantes.", "Alta"),
    ("RDI-03", "Semaforización Cromática Tri-Estado Intuitiva", "El estado operativo de las terminales ópticas NAP debe expresarse inequívocamente mediante tres estados visuales: Verde pulsante (#10B981) para holgura (<80%), Ámbar preventivo (#F59E0B) para alerta (80-99%) y Rojo de bloqueo (#EF4444) para saturación total (100%), con etiquetas de ocupación.", "Alta"),
    ("RDI-04", "Matriz Isomórfica de Chasis de Puertos", "La vista de inspección de caja NAP debe proyectar una réplica isomórfica 2×8 fiel a la distribución física del chasis interno de 16 puertos SC-APC, mostrando diodos LED emulados con grabado numérico secuencial del 1 al 16 en cada conector.", "Alta"),
    ("RDI-05", "Arquitectura Responsiva Mobile-First", "El diseño visual debe estructurarse bajo el principio Mobile-First con Tailwind CSS, adaptando formularios, cuadrículas de abonados y herramientas cartográficas a pantallas táctiles verticales de teléfonos inteligentes (5 a 6.7 pulgadas) con navegación al alcance del pulgar.", "Alta"),
    ("RDI-06", "Densidad de Información y Jerarquía Geoespacial", "El visor cartográfico debe prevenir la sobrecarga cognitiva del operador aplicando renderizado progresivo y agrupamiento de capas, desplegando los datos técnicos detallados únicamente a través de modales contextuales activados bajo demanda.", "Media"),
    ("RDI-07", "Control Ergonómico de Exportación KMZ", "La barra superior de herramientas del visor cartográfico debe incorporar un botón accesible de descarga KMZ con icono dinámico animado ('animate-bounce') durante la compilación en segundo plano y notificaciones Toast temporizadas (5 segundos) de confirmación.", "Alta"),
    ("RDI-08", "Isomorfismo Cromático y Simbología Homologada", "La simbología gráfica e iconografía implementada en el visor web con Leaflet (cajas NAP verde/amarillo/rojo, mufas en cyan, gasas en naranja, postes en púrpura/gris) debe replicarse con exactitud en los estilos visuales del archivo KML exportado hacia Google Earth.", "Alta"),
]

# 4. 3.2.6 Requerimientos de Hardware y Entorno Físico de Despliegue (RHW-01 a RHW-03)
rhw_headers = ["Código", "Componente / Nodo Físico", "Especificación Técnica Mínima Requerida", "Prioridad"]
rhw_widths = [0.80, 1.55, 3.35, 0.70]
rhw_rows = [
    ("RHW-01", "Dispositivos Móviles de Cuadrilla (Clientes de Campo)", "Los teléfonos inteligentes operados por las cuadrillas de campo deben contar con procesador de arquitectura ARM de 64 bits (octa-core a 2.0 GHz mínimo), memoria RAM mínima de 3 GB, almacenamiento libre de 4 GB y pantalla táctil capacitiva con brillo de al menos 450 nits.", "Alta"),
    ("RHW-02", "Sensor de Posicionamiento Global Satelital (GPS)", "El hardware móvil debe integrar receptor satelital multi-constelación (A-GPS, GLONASS y Galileo) con precisión geodésica inferior a 5 metros bajo cielo abierto, permitiendo la captura fehaciente de coordenadas geográficas (WGS84) al pie de poste.", "Alta"),
    ("RHW-03", "Servidor de Producción Central (Host y BD)", "La infraestructura centralizada que aloja el backend REST y la base de datos PostgreSQL debe contar con arquitectura x86_64, mínimo 4 núcleos virtuales de CPU (vCPU), 8 GB de memoria RAM DDR4 ECC y 100 GB de almacenamiento en disco de estado sólido NVMe en arreglo redundante.", "Alta"),
]

# 5. 3.2.7 Requerimientos de Software y Plataforma Tecnológica (RSW-01 a RSW-04)
rsw_headers = ["Código", "Componente de Software", "Especificación Tecnológica y Versión Homologada", "Prioridad"]
rsw_widths = [0.80, 1.55, 3.35, 0.70]
rsw_rows = [
    ("RSW-01", "Motores de Navegación Web Homologados", "La plataforma debe ejecutarse sin requerir complementos propietarios en navegadores compatibles con ECMAScript 2022+: Google Chrome (v100+), Mozilla Firefox (v100+), Apple Safari (v15+) y Microsoft Edge (v100+).", "Alta"),
    ("RSW-02", "Soporte para Progressive Web App (PWA)", "El entorno cliente debe registrar un Service Worker que gestione la Cache Storage API y un Web App Manifest para permitir la instalación de la plataforma como aplicación web progresiva (PWA) en el dispositivo móvil.", "Alta"),
    ("RSW-03", "Entorno de Ejecución Backend", "El servidor debe ejecutarse sobre el entorno Node.js en su versión 18.x o 20.x LTS, estructurado bajo el framework Express 4.x y el compilador TypeScript 5.x configurado con directivas de tipado estricto.", "Alta"),
    ("RSW-04", "Motor de Base de Datos Relacional", "El gestor de base de datos relacional debe ser PostgreSQL versión 16+, con soporte nativo para transacciones concurrentes ACID, operadores JSONB y extensiones criptográficas integradas.", "Alta"),
]

# 6. 3.2.8 Requerimientos de Red, Comunicaciones y Conectividad (RCOM-01 a RCOM-04)
rcom_headers = ["Código", "Requerimiento de Red y Conectividad", "Especificación Técnica de Transporte y Resiliencia", "Prioridad"]
rcom_widths = [0.80, 1.55, 3.35, 0.70]
rcom_rows = [
    ("RCOM-01", "Cifrado Forzoso de Canal de Transporte", "La totalidad de las comunicaciones cliente-servidor debe cifrarse obligatoriamente mediante HTTPS sobre TLS 1.3 con certificados X.509 validados, bloqueando cualquier intento de conexión bajo texto plano HTTP por el puerto 80.", "Alta"),
    ("RCOM-02", "Optimización de Ancho de Banda y Cargas Útiles", "Los endpoints de la API REST deben transferir exclusivamente datos en formato JSON compacto con compresión HTTP activa (GZIP o Brotli), limitando el tamaño promedio de los payloads a menos de 50 KB para optimizar el consumo de datos móviles en campo.", "Media"),
    ("RCOM-03", "Resiliencia ante Desconexión Celular", "La aplicación debe monitorizar dinámicamente el estado de la conexión mediante eventos de red, alternando de manera transparente a persistencia local en Dexie.js (IndexedDB) ante desconexión y encolando transacciones para su sincronización diferida al reanudar enlace.", "Alta"),
    ("RCOM-04", "Autonomía Local y Generación GIS Offline", "La compilación del paquete KMZ debe operar de manera 100% autónoma en el navegador cliente a partir de los datos en memoria o persistidos localmente en IndexedDB (Dexie.js), garantizando que las cuadrillas técnicas puedan exportar e inspeccionar la cartografía en Google Earth aún sin cobertura celular.", "Alta"),
]

# 7. 3.2.9 Requerimientos de Datos e Integridad Transaccional (RDAT-01 a RDAT-04)
rdat_headers = ["Código", "Requerimiento de Datos", "Regla de Gobernanza e Integridad Transaccional", "Prioridad"]
rdat_widths = [0.80, 1.55, 3.35, 0.70]
rdat_rows = [
    ("RDAT-01", "Integridad Transaccional ACID y Bloqueo Pesimista", "Toda mutación del estado de un puerto óptico debe procesarse dentro de una transacción gestionada bajo nivel de aislamiento Read Committed, aplicando bloqueo pesimista a nivel de fila mediante 'SELECT ... FOR UPDATE' para eliminar colisiones concurrentes.", "Alta"),
    ("RDAT-02", "Normalización en Tercera Forma Normal (3FN)", "El esquema relacional debe cumplir estrictamente con la Tercera Forma Normal (3FN), eliminando dependencias transitivas y anomalías de actualización mediante claves foráneas y normalización de catálogos.", "Alta"),
    ("RDAT-03", "Restricciones de Integridad Referencial", "Se deben programar restricciones de clave foránea con cláusula 'ON DELETE RESTRICT' en elementos padre (cajas NAP y splitters), prohibiendo la eliminación física de cualquier nodo que mantenga puertos ocupados por clientes con servicio activo.", "Alta"),
    ("RDAT-04", "Registro Inmutable de Auditoría", "Cada asignación, liberación o cambio de estado de puerto debe registrar de forma automática e inmutable el identificador del usuario, dirección IP, fecha/hora UTC y valores previos en la tabla de bitácora transaccional.", "Alta"),
]

# 8. 3.2.10 Requerimientos Organizacionales, de Operación y Normativos (ROPR-01 a ROPR-04)
ropr_headers = ["Código", "Requerimiento Organizacional / Normativo", "Estándar de Referencia y Criterio Operativo", "Prioridad"]
ropr_widths = [0.80, 1.55, 3.35, 0.70]
ropr_rows = [
    ("ROPR-01", "Curva de Aprendizaje y Usabilidad Operativa", "La interfaz debe ser lo suficientemente intuitiva para que un técnico instalador de cuadrilla aprenda a consultar una caja NAP y registrar una nueva acometida en un periodo de capacitación menor a dos horas.", "Media"),
    ("ROPR-02", "Apego a Estándares de Redes GPON (ITU-T)", "Los cálculos de atenuación y el presupuesto de potencia óptica deben regirse bajo los parámetros técnicos de las recomendaciones ITU-T G.984.1 y G.984.2 para redes GPON Clase B+ (margen admisible de pérdida entre 13 dB y 28 dB).", "Alta"),
    ("ROPR-03", "Código de Colores de Fibra Óptica (TIA/EIA-598-A)", "El sistema debe desplegar la nomenclatura de los 12 hilos ópticos del cable de distribución conforme al código cromático normalizado TIA/EIA-598-A (Azul, Naranja, Verde, Marrón, Gris, Blanco, Rojo, Negro, Amarillo, Violeta, Rosa y Aqua), eliminando confusiones en campo.", "Alta"),
    ("ROPR-04", "Trazabilidad y Dictámenes Formales en PDF", "El sistema debe proveer la generación inmediata de reportes de auditoría técnica en PDF con encabezados institucionales y firmas de responsabilidad técnica para soportar inspecciones de calidad y control de inventario patrimonial.", "Alta"),
]

# 9. 3.2.11 Requerimientos de Proceso y Flujos Operativos de Red (RPR-01 a RPR-07)
rpr_headers = ["Código", "Proceso Operativo de Red", "Secuencia Metodológica y Reglas de Control", "Prioridad"]
rpr_widths = [0.80, 1.55, 3.35, 0.70]
rpr_rows = [
    ("RPR-01", "Proceso de Aprovisionamiento y Alta de Nuevo Abonado", "Flujo secuencial obligatorio: 1) Verificación geoespacial de cobertura en visor GIS (distancia NAP a predio <= 150 m); 2) Selección de puerto 'Disponible' en matriz isomórfica; 3) Bloqueo transaccional temporal; 4) Captura del expediente técnico (nombre, domicilio, contrato, plan y MAC/SN de ONT); 5) Registro de potencia óptica en campo; y 6) Confirmación atómica mutando a 'Ocupado' con timestamp UTC.", "Alta"),
    ("RPR-02", "Proceso de Mantenimiento Correctivo y Liberación de Puerto", "Flujo de desvinculación: 1) Búsqueda reactiva por contrato, ONT o posición física; 2) Validación de perfil (Supervisor o Administrador); 3) Desvinculación atómica de la ONT; 4) Reclasificación del puerto a 'Disponible' (o 'Dañado/Atenuado' si presenta daño físico en conector SC-APC); y 5) Recálculo instantáneo del índice de saturación de la caja NAP.", "Alta"),
    ("RPR-03", "Proceso de Certificación Óptica y Calibración de Potencia", "Exige el registro forzoso de la potencia óptica recibida (Prx en dBm) medida con Power Meter en 1490 nm en la salida de la caja NAP. El valor debe situarse dentro del rango normativo ITU-T G.984.2 (-8.0 dBm a -27.0 dBm; óptimo de -15.0 a -22.0 dBm). Si está fuera de rango (<= -27.1 dBm o >= -7.9 dBm), el sistema bloquea el alta y emite alerta de degradación óptica.", "Alta"),
    ("RPR-04", "Proceso de Operación Resiliente y Sincronización Offline-First", "Protocolo sin conexión: 1) Detección de red vía navigator.onLine y heartbeat HTTP; 2) Consultas locales sobre capas y cajas NAP en IndexedDB (Dexie.js); 3) Serialización de mutaciones en cola local inmutable (offline_sync_queue) con timestamp; 4) Banner visual de modo desconectado; y 5) Conciliación transaccional por lotes (Batch Sync) en orden FIFO al recuperar red.", "Alta"),
    ("RPR-05", "Proceso de Auditoría y Dictamen Técnico de Planta Externa", "Procedimiento de supervisión gerencial: 1) Extracción de métricas de planta externa (terminales NAP, desglose de puertos libres, ocupados y dañados, metraje de cable troncal y ramales); 2) Generación asíncrona en streaming (PDFKit) de reportes ejecutivos foliados; y 3) Registro inmutable en bitácora (audit_logs) con usuario, fecha, hora y filtros aplicados.", "Media"),
    ("RPR-06", "Proceso de Detección de Saturación y Balanceo de Carga", "Supervisión automatizada de capacidad: 1) Evaluación continua del porcentaje de ocupación por caja NAP; 2) Al alcanzar 80% (13/16 puertos), activación de alerta preventiva (icono ámbar); 3) Al alcanzar 100% (16/16 puertos), bloqueo preventivo estricto (marcador rojo) para nuevas altas; y 4) Sugerencia de derivación hacia cajas NAP adyacentes con disponibilidad.", "Alta"),
    ("RPR-07", "Proceso de Exportación Cartográfica y Auditoría en Google Earth", "Procedimiento de validación topológica: 1) Solicitud del paquete KMZ desde el visor; 2) Compilación in-memory de elementos georreferenciados; 3) Apertura en Google Earth o SIG de escritorio; 4) Superposición sobre fotografía satelital para contrastar postes, vanos y cruces; 5) Conciliación de postería con CFE; 6) Verificación de semáforos de saturación; y 7) Dictamen patrimonial.", "Alta"),
]

# Ejecutar reemplazos en las 9 subsecciones de requerimientos (3.2.3 a 3.2.11)
replace_subsection_with_table(
    doc, "3.2.3 ", "3.2.4 ",
    "Tabla 12. Especificación de requerimientos funcionales del sistema.",
    rf_headers, rf_rows, rf_widths
)
replace_subsection_with_table(
    doc, "3.2.4 ", "3.2.5 ",
    "Tabla 13. Especificación de requerimientos no funcionales del sistema (ISO/IEC 25010).",
    rnf_headers, rnf_rows, rnf_widths
)
replace_subsection_with_table(
    doc, "3.2.5 ", "3.2.6 ",
    "Tabla 14. Especificación de requerimientos de diseño e interfaz de usuario (UI/UX).",
    rdi_headers, rdi_rows, rdi_widths
)
replace_subsection_with_table(
    doc, "3.2.6 ", "3.2.7 ",
    "Tabla 15. Especificación de requerimientos de hardware y entorno físico de despliegue.",
    rhw_headers, rhw_rows, rhw_widths
)
replace_subsection_with_table(
    doc, "3.2.7 ", "3.2.8 ",
    "Tabla 16. Especificación de requerimientos de software y plataforma tecnológica.",
    rsw_headers, rsw_rows, rsw_widths
)
replace_subsection_with_table(
    doc, "3.2.8 ", "3.2.9 ",
    "Tabla 17. Especificación de requerimientos de red, comunicaciones y conectividad.",
    rcom_headers, rcom_rows, rcom_widths
)
replace_subsection_with_table(
    doc, "3.2.9 ", "3.2.10 ",
    "Tabla 18. Especificación de requerimientos de datos e integridad transaccional.",
    rdat_headers, rdat_rows, rdat_widths
)
replace_subsection_with_table(
    doc, "3.2.10 ", "3.2.11 ",
    "Tabla 19. Especificación de requerimientos organizacionales, de operación y normativos.",
    ropr_headers, ropr_rows, ropr_widths
)
replace_subsection_with_table(
    doc, "3.2.11 ", "3.2.12 ",
    "Tabla 20. Especificación de requerimientos de proceso y flujos operativos de red.",
    rpr_headers, rpr_rows, rpr_widths
)

# Renumerar secuencialmente TODOS los títulos de tablas (estilo 'Tablas') en el cuerpo del documento
tbl_counter = 1
for i, p in enumerate(doc.paragraphs):
    if i < 160:
        continue  # Saltar índices preliminares
    if p.style.name == 'Tablas':
        old_text = p.text.strip()
        new_text = re.sub(r'^Tabla\s+\d+\.?\s*', f'Tabla {tbl_counter}. ', old_text)
        p.text = ''
        r = p.add_run(new_text)
        r.font.name = 'Arial'
        r.font.size = Pt(9)
        r.font.bold = True
        r.font.color.rgb = RGBColor(0, 0, 0)
        print(f"  [Renumerada] {new_text[:75]}")
        tbl_counter += 1

print(f"\nTotal de tablas numeradas en el documento: {tbl_counter - 1}")

doc.save(target_avance)
shutil.copyfile(target_avance, target_mirror)
print("Documentos guardados exitosamente.")

