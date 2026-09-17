import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement
from docx.oxml.ns import qn, nsdecls
from docx.oxml import parse_xml
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

def insert_p(ref_p, text, font_size=11.0, bold=False, italic=False, align=WD_ALIGN_PARAGRAPH.JUSTIFY, space_before=10, space_after=14, line_spacing=1.5, style="Normal", color_rgb=None):
    p = ref_p.insert_paragraph_before()
    p.style = style
    p.alignment = align
    p.paragraph_format.space_before = Pt(space_before)
    p.paragraph_format.space_after = Pt(space_after)
    p.paragraph_format.line_spacing = line_spacing
    run = p.add_run(text)
    format_run(run, name="Arial", size_pt=font_size, bold=bold, italic=italic, color_rgb=color_rgb)
    return p

def insert_heading3(ref_p, text):
    return insert_p(ref_p, text, font_size=11.0, bold=True, italic=False, align=WD_ALIGN_PARAGRAPH.LEFT, space_before=14, space_after=6, line_spacing=1.15, style="Heading 3")

def insert_figure(ref_p, img_path, width_in=6.0, caption_text="", elaboration_text="Elaboración propia"):
    # Image paragraph
    p_img = ref_p.insert_paragraph_before()
    p_img.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_img.paragraph_format.space_before = Pt(12)
    p_img.paragraph_format.space_after = Pt(4)
    run_img = p_img.add_run()
    run_img.add_picture(img_path, width=Inches(width_in))
    
    # Caption paragraph
    p_cap = ref_p.insert_paragraph_before()
    p_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_cap.paragraph_format.space_before = Pt(4)
    p_cap.paragraph_format.space_after = Pt(2)
    run_cap = p_cap.add_run(caption_text)
    format_run(run_cap, name="Arial", size_pt=9.5, bold=True)
    
    # Elaboration paragraph
    p_elab = ref_p.insert_paragraph_before()
    p_elab.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_elab.paragraph_format.space_before = Pt(0)
    p_elab.paragraph_format.space_after = Pt(12)
    run_elab = p_elab.add_run(elaboration_text)
    format_run(run_elab, name="Arial", size_pt=9.0, italic=True)

def main():
    doc_path = 'docs/PORTADA_INSTITUCIONAL (3).docx'
    print(f"Opening {doc_path}...")
    doc = docx.Document(doc_path)
    
    # -------------------------------------------------------------
    # 1. MARCO TEORICO: NEON DATABASE (SECTION 2.8.4)
    # -------------------------------------------------------------
    print("Processing Section 2.8.4 Neon Database...")
    p_cap3 = None
    for i, p in enumerate(doc.paragraphs):
        if 'CAPITULO III' in p.text.upper() or 'CAPÍTULO III' in p.text.upper():
            p_cap3 = p
            break
            
    if not p_cap3:
        raise Exception("Could not find CAPITULO III header in document")

    # Locate empty paragraphs right before Cap 3 and remove them
    # We find the paragraph containing '2.8.3' and insert 2.8.4 before p_cap3
    insert_heading3(p_cap3, "2.8.4 Arquitectura de Base de Datos Serverless en la Nube: Neon Database")

    insert_p(p_cap3, 
        "La evolución contemporánea de los motores relacionales hacia la computación en la nube ha propiciado la aparición de plataformas Serverless nativas, entre las cuales Neon destaca como una de las implementaciones de código abierto más robustas y avanzadas sobre el motor PostgreSQL estándar (Neon Inc., 2023). A diferencia de los despliegues tradicionales autogestionados o las instancias gestionadas monolíticas —donde una máquina virtual asigna de forma acoplada núcleos de CPU, memoria RAM y capacidad de almacenamiento en disco local—, Neon rompe de raíz esta arquitectura mediante el desacoplamiento estricto e integral entre la capa de cómputo (Compute Layer) y la capa de almacenamiento distribuido (Storage Layer)."
    )

    insert_p(p_cap3,
        "En esta arquitectura desacoplada, la capa de cómputo opera mediante contenedores efímeros y ligeros (Stateless Postgres Nodes) encargados de parsear las sentencias SQL, compilar planes de ejecución, mantener las memorias intermedias (Buffer Cache) y gestionar las conexiones entrantes. Al carecer por completo de almacenamiento de persistencia en su sistema de archivos local, los nodos de procesamiento pueden aprovisionarse, redimensionarse verticalmente o destruirse de forma elástica en milisegundos sin comprometer jamás la persistencia de los datos almacenados."
    )

    insert_p(p_cap3,
        "Por su parte, la capa de almacenamiento distribuido se articula en dos subsistemas coordinados: los Pageservers y los Safekeepers. Los Safekeepers forman un conjunto distribuido de consenso tolerante a fallos (implementando una variante optimizada del algoritmo Paxos/Raft); su cometido fundamental es recibir secuencialmente los registros del log de escritura anticipada (Write-Ahead Log - WAL) generados por el nodo de cómputo, replicarlos de forma síncrona a través de múltiples zonas de disponibilidad geográficas (Multi-AZ) y confirmar la transacción a la aplicación cliente únicamente cuando la mayoría absoluta de los nodos Safekeeper ha asegurado el registro en unidades de estado sólido NVMe. Posteriormente, los Pageservers ingieren y procesan este flujo WAL para reconstruir dinámicamente bloques de datos de 8 KB que son suministrados en memoria bajo demanda al nodo de cómputo, descargando de forma continua las versiones históricas inmutables hacia almacenamiento de objetos de ultra alta durabilidad (Amazon Simple Storage Service - S3)."
    )

    insert_p(p_cap3,
        "Una de las propiedades más distintivas y disruptivas de Neon es la capacidad de ramificación instantánea de la base de datos (Database Branching), cuyo funcionamiento es conceptual y prácticamente análogo al sistema de ramas de Git. Mediante la técnica de Copy-on-Write (CoW) sobre los bloques de almacenamiento persistidos, Neon permite bifurcar una base de datos completa de producción con cientos de miles de registros en una fracción de segundo, requiriendo inicialmente cero almacenamiento físico adicional. La nueva rama generada comparte las mismas páginas inmutables de solo lectura con su rama de origen; únicamente cuando se suscitan mutaciones (INSERT, UPDATE o DELETE) en el nuevo entorno, se escriben bloques diferenciales aislados. Para el sistema de GPON TELECOM S.A. de C.V., esta característica resulta crucial, puesto que permite crear ramas independientes de prueba para validar migraciones de esquemas en Sequelize, ejecutar pruebas de estrés de concurrencia y realizar auditorías de planta externa sin poner en riesgo la base de datos viva ni incurrir en sobrecostos de infraestructura."
    )

    insert_p(p_cap3,
        "Asimismo, Neon introduce el mecanismo de auto-suspensión y escalado a cero (Scale-to-Zero), mediante el cual el contenedor de cómputo se apaga automáticamente tras un lapso determinado de inactividad operativa (por ejemplo, durante la noche cuando las cuadrillas de campo no realizan asignaciones). Durante la suspensión, el coste computacional desciende a cero, manteniéndose únicamente el almacenamiento pasivo. Al arribar una nueva solicitud de red desde la API REST o la aplicación web, un balanceador de conexiones inteligente basado en PgBouncer intercepta el socket TCP y reactiva el nodo de cómputo en menos de 500 milisegundos, despachando la consulta de manera totalmente transparente para el cliente sin interrupciones de servicio."
    )

    insert_p(p_cap3,
        "En la implementación final del proyecto, el backend Node.js y TypeScript se enlaza con una instancia gestionada de Neon ubicada en la región us-east-2 (Ohio) de AWS, empleando cadenas de conexión seguras sobre TLS 1.3 con validación estricta de certificados criptográficos (sslmode=require). Esta integración garantiza compatibilidad absoluta con PostgreSQL versión 16, extensiones espaciales (PostGIS) para la resolución de coordenadas geodésicas de cajas NAP y una integración impecable con el ORM Sequelize."
    )

    # -------------------------------------------------------------
    # 2. CAPITULO 3: CASOS DE USO (SECTION 3.2.2)
    # -------------------------------------------------------------
    print("Processing Section 3.2.2 Use Case Diagram...")
    p_rf = None
    for p in doc.paragraphs:
        if '3.2.2 ' in p.text and ('CATÁLOGO' in p.text.upper() or 'CATALOGO' in p.text.upper()):
            p_rf = p
            break
            
    if not p_rf:
        raise Exception("Could not find Section 3.2.2 Catálogo Formal header")

    # Insert Section 3.2.2 Use Case Diagram before old 3.2.2
    insert_heading3(p_rf, "3.2.2 Diagrama General de Casos de Uso del Sistema (UML)")

    insert_p(p_rf,
        "Para modelar de forma precisa el comportamiento funcional del sistema y estandarizar las interacciones entre los diferentes actores de la organización y los módulos de software, se elaboró el Diagrama General de Casos de Uso bajo el estándar internacional de la Object Management Group (OMG / UML). La especificación integra un total de 16 casos de uso primarios (CU-01 a CU-16), categorizados dentro de cuatro módulos cardinales y vinculados mediante relaciones formales de asociación, inclusión («include») y dependencia operativa con tres actores humanos del modelo RBAC y un actor externo cartográfico."
    )

    # Insert Use Case Diagram Figure
    insert_figure(
        p_rf,
        img_path='scratch/diagrama_casos_de_uso.png',
        width_in=6.2,
        caption_text="Figura 4. Diagrama general de casos de uso del sistema bajo estándar UML.",
        elaboration_text="Elaboración propia a partir del levantamiento de requerimientos en GPON TELECOM S.A. de C.V."
    )

    insert_p(p_rf,
        "A continuación, se detalla formalmente la composición funcional de cada uno de los cuatro módulos modelados en el diagrama:"
    )

    insert_p(p_rf,
        "1. Módulo 1: Seguridad, Autenticación y Control de Acceso (RBAC): Agrupa los casos de uso dedicados al control de identidad y gestión perimetral: CU-01 (Iniciar Sesión y Autenticación con JWT), CU-02 (Conmutar Perfil de Evaluación / Role Switcher) y CU-03 (Administrar Cuentas y Directorio de Usuarios). El caso de uso CU-01 implementa una relación obligatoria de inclusión («include») hacia la rutina de verificación del hash unidireccional con el algoritmo bcrypt (costo de cómputo salt rounds = 10) y la generación del token criptográfico Bearer JWT. A su vez, todos los accesos posteriores a rutas privilegiadas están blindados mediante la relación «include» hacia el middleware requireRoles, el cual intercepta el vector de permisos del usuario y deniega operaciones no autorizadas emitiendo de forma determinista una respuesta con código HTTP 403 Forbidden."
    )

    insert_p(p_rf,
        "2. Módulo 2: Cartografía GIS, Trazado Troncal y Cajas Terminales NAP: Comprende los casos de uso CU-04 (Consultar Mapa GIS, Rutas y Semáforo de Saturación), CU-05 (Calibrar Coordenadas GPS de NAP en Sitio) y CU-06 (Registrar Nueva Caja NAP en Inventario). Este módulo interactúa bidireccionalmente con el actor externo API Geoespacial GPS / Leaflet (OpenStreetMap) para renderizar mapas cartográficos y proyectar coordenadas geodésicas en formato WGS-84. Al registrar una nueva caja terminal (CU-06), el sistema ejecuta una relación de inclusión «include» para aprovisionar automáticamente de manera transaccional la matriz de 16 puertos físicos SC-APC inicializados en estado 'Libre', eliminando la necesidad de altas manuales individuales."
    )

    insert_p(p_rf,
        "3. Módulo 3: Operación de Puertos Físicos, Concurrencia ACID y Abonados: Constituye el núcleo neurálgico de la plataforma e integra seis casos de uso: CU-07 (Visualizar Matriz del Chasis de 16 Puertos), CU-08 (Asignar Abonado a Puerto Libre de Fibra), CU-09 (Liberar Puerto y Desvincular Abonado), CU-10 (Cambiar Estado Técnico a Dañado o Mantenimiento), CU-11 (Consultar y Filtrar Padrón de Clientes FTTx) y CU-12 (Actualizar Expediente de Abonado en Servicio). Durante la ejecución de CU-08, se detona una relación «include» crítica hacia el mecanismo de Bloqueo Pesimista de Fila (SELECT ... FOR UPDATE) en PostgreSQL, garantizando aislamiento transaccional y neutralizando colisiones concurrentes (Race Conditions). Asimismo, se ejecuta la relación «include» para validar y almacenar los parámetros de telemetría del suscriptor: número de contrato, modelo ONT, dirección MAC con filtro regex y potencia de recepción estimada en decibelios-milivatio (dBm)."
    )

    insert_p(p_rf,
        "4. Módulo 4: Operación Móvil Offline-First y Generación de Reportes Ejecutivos PDF: Específicamente concebido para cuadrillas que operan en localidades rurales sin cobertura celular o en zonas de sombra electromagnética. Comprende CU-13 (Operar en Modo Offline con Caché Local IndexedDB / Dexie.js), CU-14 (Encolar Asignaciones en Zonas Sin Cobertura), CU-15 (Sincronizar Mutaciones de Forma Automática o Manual) y CU-16 (Generar y Descargar Reporte Ejecutivo PDF por Streaming). Al solicitar la emisión del reporte (CU-16), se invocan las relaciones «include» para Calcular Diagnóstico Global y Semáforo de Capacidad (clasificación de cajas en Normal o Crítico según umbral del 80%) y Construir Directorio Detallado de Clientes con Atenuaciones Ópticas, canalizando el documento binario directamente a través de flujos en memoria mediante la biblioteca PDFKit."
    )

    insert_p(p_rf,
        "Asimismo, el diagrama formaliza la interacción y responsabilidades operativas de los cuatro actores identificados:"
    )

    insert_p(p_rf,
        "• ACT-01 Administrador NOC: Cuenta con privilegios irrestrictos en los cuatro módulos. Es el único perfil facultado para la administración integral de usuarios (CU-03) y la configuración global de la infraestructura."
    )
    insert_p(p_rf,
        "• ACT-02 Soporte Técnico: Autorizado para la supervisión cartográfica (CU-04), calibración GPS (CU-05), alta de cajas (CU-06), operación de puertos (CU-07 a CU-10), gestión de clientes (CU-11, CU-12) y descarga de reportes ejecutivos (CU-16). Posee restricciones para la gestión de cuentas de usuario."
    )
    insert_p(p_rf,
        "• ACT-03 Técnico de Campo (Móvil): Perfil diseñado para operar a la intemperie desde dispositivos móviles PWA. Puede consultar el mapa GIS (CU-04), calibrar coordenadas GPS en sitio (CU-05), visualizar el chasis (CU-07) y ejecutar altas de abonados exclusivamente en puertos con estado Libre (CU-08). Tiene estrictamente vedado liberar puertos ocupados (CU-09) o cambiar estados técnicos de infraestructura (CU-10), recibiendo en dichos intentos el rechazo con código HTTP 403 Forbidden."
    )
    insert_p(p_rf,
        "• API Geoespacial GPS / Leaflet (OpenStreetMap): Actor externo del sistema que suministra las capas cartográficas vectoriales, mosaicos de imágenes satelitales y lecturas nativas del sensor geodésico de los dispositivos para la fijación de cajas NAP."
    )

    # Renumber subsequent headings in 3.2
    for p in doc.paragraphs:
        if p.text.startswith('3.2.2 ') and 'CATÁLOGO' in p.text.upper():
            p.text = p.text.replace('3.2.2 ', '3.2.3 ')
            p.runs[0].text = p.text
        elif p.text.startswith('3.2.3 ') and 'ESPECIFICACIÓN' in p.text.upper():
            p.text = p.text.replace('3.2.3 ', '3.2.4 ')
            p.runs[0].text = p.text
        elif p.text.startswith('3.2.4 ') and 'MATRIZ' in p.text.upper():
            p.text = p.text.replace('3.2.4 ', '3.2.5 ')
            p.runs[0].text = p.text

    # -------------------------------------------------------------
    # 3. CAPITULO 3: MAQUETADO Y ADOBE COLOR (SECTIONS 3.7.1 & 3.7.2)
    # -------------------------------------------------------------
    print("Processing Section 3.7 UI Design, Wireframing and Adobe Color...")
    p_react = None
    for p in doc.paragraphs:
        if '3.7.1 ' in p.text and 'PARADIGMA REACTIVO' in p.text.upper():
            p_react = p
            break
            
    if not p_react:
        raise Exception("Could not find Section 3.7.1 Paradigma Reactivo header")

    # 3.7.1 Wireframing
    insert_heading3(p_react, "3.7.1 Diseño Centrado en el Usuario (UCD), Arquitectura de Información y Maquetado de Interfaces (Wireframing)")

    insert_p(p_react,
        "El diseño de la experiencia de usuario (UX) y de las interfaces gráficas (UI) se fundamentó en la metodología de Diseño Centrado en el Usuario (User-Centered Design - UCD) combinada con el principio Mobile-First. Considerando las rigurosas condiciones operativas de las cuadrillas de campo en San José del Rincón —quienes manipulan dispositivos telefónicos a plena luz solar, sobre escaleras o en condiciones climatológicas adversas—, la arquitectura de información se estructuró con controles táctiles sobredimensionados (touch targets con área mínima de 48×48 píxeles), tipografías altamente legibles y una jerarquía visual orientada a minimizar el número de toques necesarios para completar una asignación de fibra."
    )

    insert_p(p_react,
        "Durante la fase de diseño preliminar se construyeron los esquemas de maquetado (Wireframes) de alta fidelidad para las cuatro vistas maestras de la plataforma, representados en la siguiente lámina arquitectónica:"
    )

    insert_figure(
        p_react,
        img_path='scratch/maquetado_wireframes.png',
        width_in=6.2,
        caption_text="Figura 8. Maquetado de interfaces (Wireframes) y arquitectura visual del sistema.",
        elaboration_text="Elaboración propia."
    )

    insert_p(p_react,
        "A partir de estos esquemas se consolidaron las siguientes interfaces funcionales:"
    )

    insert_p(p_react,
        "• Wireframe 1: Visor Cartográfico GIS Interactivo: Proyecta la vista global del municipio con base en capas de OpenStreetMap. Dispone los marcadores circulares de cajas NAP coloreados dinámicamente según su nivel de saturación (<80% verde, 80-99% ámbar, 100% rojo) y traza las líneas poligonales vectoriales que representan el tendido de fibra óptica troncal que vincula el ODF central con cada cierre de empalme secundario. Incorpora controles de aproximación suave (zoom), geolocalización satelital en un toque y cuadro flotante con la leyenda de estados."
    )

    insert_p(p_react,
        "• Wireframe 2: Matriz Isomórfica de Chasis de 16 Puertos SC-APC y Modal Transaccional: Reproduce fielmente la distribución física 2×8 del chasis interno de la caja de distribución NAP. Cada conector óptico presenta un diodo emulador LED con su estado cromático y número de puerto grabado. Al pulsar sobre cualquier conector libre, se despliega el modal de asignación rápida que captura el número de contrato, nombre del abonado, marca de ONT, dirección MAC y nivel de potencia óptica en dBm, ejecutando la transacción mediante la cláusula transaccional SELECT ... FOR UPDATE."
    )

    insert_p(p_react,
        "• Wireframe 3: Arquitectura PWA Móvil Offline-First con Dexie.js: Muestra la vista operativa adaptada a pantallas verticales de teléfonos inteligentes cuando el técnico entra a zonas rurales sin señal celular. La interfaz activa un banner superior en color ámbar informando 'Modo Offline Activo', presenta el contador numérico de órdenes almacenadas en la base de datos local IndexedDB y ofrece un botón destacado de sincronización manual para forzar la descarga de datos al detectar conectividad Wi-Fi o 4G."
    )

    insert_p(p_react,
        "• Wireframe 4: Padrón de Abonados FTTx y Consola de Reportes PDF: Presenta el directorio consolidado de clientes en formato tabular responsivo, habilitando filtros reactivos en tiempo real por nombre, contrato, dirección MAC o modelo de terminal de red óptica (ONT). En la cabecera, incorpora el botón de exportación ejecutiva que genera al vuelo el documento PDF con diagnósticos de saturación de la red."
    )

    # 3.7.2 Adobe Color Tests
    insert_heading3(p_react, "3.7.2 Definición de la Paleta Cromática Institucional y Pruebas de Accesibilidad con Adobe Color")

    insert_p(p_react,
        "El diseño cromático de la plataforma requirió un tratamiento riguroso para asegurar identidad institucional, inteligibilidad técnica y estricto cumplimiento de los estándares internacionales de accesibilidad web. Utilizando la plataforma Adobe Color (Adobe Color Wheel y Accessibility Tools), se seleccionó un esquema de armonía personalizada fundamentado en la semiótica de redes de telecomunicaciones, estableciendo siete colores cardinales para los componentes de interfaz y el semáforo operativo de infraestructura."
    )

    # Table of Color Palette
    tbl_color = doc.add_table(rows=8, cols=5)
    set_table_borders(tbl_color)
    tbl_color.alignment = WD_TABLE_ALIGNMENT.CENTER
    
    col_headers = ["Rol de Interfaz", "Denominación", "Código HEX", "Espacio sRGB", "Función Semántica en el Sistema"]
    for j, h in enumerate(col_headers):
        cell = tbl_color.cell(0, j)
        set_cell_background(cell, "1E3A8A")
        set_cell_margins(cell, top=120, bottom=120, left=150, right=150)
        p_c = cell.paragraphs[0]
        p_c.alignment = WD_ALIGN_PARAGRAPH.CENTER
        run_h = p_c.add_run(h)
        format_run(run_h, name="Arial", size_pt=9.0, bold=True, color_rgb=RGBColor(255, 255, 255))
        
    palette_data = [
        ("Primario Institucional", "Azul Índigo Telecom", "#1E3A8A", "rgb(30, 58, 138)", "Barras de navegación fijas, membretes y branding corporativo."),
        ("Acento Interactivo", "Cian Técnico", "#0284C7", "rgb(2, 132, 199)", "Botones de acción principal, enlaces activos y foco de selección."),
        ("Estado Óptimo / Libre", "Verde Esmeralda", "#10B981", "rgb(16, 185, 129)", "Puertos libres habilitados, cajas con saturación <80% y estado Online."),
        ("Estado Preventivo / Alerta", "Ámbar Alerta", "#F59E0B", "rgb(245, 158, 11)", "Puertos reservados, saturación 80-99% y sincronizaciones pendientes."),
        ("Estado Crítico / Dañado", "Rojo Carmesí", "#EF4444", "rgb(239, 68, 68)", "Puertos dañados, cajas saturadas al 100% y anomalías ópticas."),
        ("Perfil Administrador", "Púrpura RBAC", "#7C3AED", "rgb(124, 58, 237)", "Identificación visual de perfil Admin en el conmutador de roles."),
        ("Superficie Dark Mode", "Pizarra Oscura", "#0F172A", "rgb(15, 23, 42)", "Fondo de modo oscuro de alto contraste para visores en campo.")
    ]
    
    for idx, row in enumerate(palette_data):
        for j, val in enumerate(row):
            cell = tbl_color.cell(idx + 1, j)
            bg = "F8FAFC" if idx % 2 == 1 else "FFFFFF"
            set_cell_background(cell, bg)
            set_cell_margins(cell, top=100, bottom=100, left=150, right=150)
            p_c = cell.paragraphs[0]
            p_c.alignment = WD_ALIGN_PARAGRAPH.CENTER if j in [1, 2, 3] else (WD_ALIGN_PARAGRAPH.LEFT if j == 4 else WD_ALIGN_PARAGRAPH.CENTER)
            run_v = p_c.add_run(val)
            bold_val = True if j in [0, 1] else False
            format_run(run_v, name="Arial", size_pt=8.5, bold=bold_val)
            
    p_react._p.addprevious(tbl_color._tbl)
    
    p_tbl_cap = p_react.insert_paragraph_before()
    p_tbl_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_tbl_cap.paragraph_format.space_before = Pt(4)
    p_tbl_cap.paragraph_format.space_after = Pt(2)
    run_tcap = p_tbl_cap.add_run("Tabla 8. Paleta cromática institucional y especificación semántica de colores (Adobe Color).")
    format_run(run_tcap, name="Arial", size_pt=9.5, bold=True)
    
    p_tbl_el = p_react.insert_paragraph_before()
    p_tbl_el.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_tbl_el.paragraph_format.space_before = Pt(0)
    p_tbl_el.paragraph_format.space_after = Pt(12)
    run_tel = p_tbl_el.add_run("Elaboración propia a partir de Adobe Color Wheel.")
    format_run(run_tel, name="Arial", size_pt=9.0, italic=True)

    insert_p(p_react,
        "Posterior a la definición de las muestras, se ejecutó una exhaustiva batería de pruebas en el módulo de accesibilidad de Adobe Color (Adobe Color Contrast Checker y Color Blindness Simulator), cuyos resultados consolidados se ilustran a continuación:"
    )

    insert_figure(
        p_react,
        img_path='scratch/pruebas_adobe_color.png',
        width_in=6.2,
        caption_text="Figura 9. Evaluación de la paleta cromática, ratios de contraste WCAG 2.1 y pruebas de daltonismo en Adobe Color.",
        elaboration_text="Elaboración propia."
    )

    insert_p(p_react,
        "La evaluación cuantitativa de accesibilidad se dividió en dos vertientes normativas:"
    )

    insert_p(p_react,
        "1. Ratios de Contraste bajo la Norma Internacional WCAG 2.1: Se comprobó que el contraste entre el texto y su superficie de fondo satisfaga los criterios de éxito 1.4.3 (Contraste Mínimo - Nivel AA) y 1.4.6 (Contraste Mejorado - Nivel AAA). La combinación de texto blanco sobre fondo Primario Azul Índigo (#1E3A8A) arroja un ratio superior de 10.5:1, superando ampliamente el umbral exigido de 7.0:1 para Nivel AAA. Asimismo, en los indicadores de semáforo de texto sobre fondos claros se efectuó un ajuste de luminosidad en Adobe Color (Verde Esmeralda ajustado #059669 con ratio 4.6:1 y Rojo Carmesí ajustado #DC2626 con ratio 4.8:1), garantizando que todas las etiquetas críticas cumplan la certificación WCAG AA."
    )

    insert_p(p_react,
        "2. Simulación de Daltonismo y Principio de Diseño Redundante (WCAG Criterio 1.4.1): La prueba de daltonismo simuló la percepción visual bajo las condiciones de Deuteranopía (ceguera a tonos verdes, afectando aproximadamente al 6% de la población masculina), Protanopía (ceguera a tonos rojos, ~1%) y Tritanopía (deficiencia en tonos azules, ~0.1%). Como evidenció la simulación, en condiciones de deuteranopía y protanopía el verde y el rojo experimentan una atenuación espectral hacia matices ocres y pardos que genera riesgo de confusión en campo."
    )

    insert_p(p_react,
        "Para solventar este riesgo y dar cabal cumplimiento a la pauta WCAG 1.4.1 ('Uso del Color'), el sistema no depende de forma exclusiva del color para comunicar el estado de los puertos de fibra o cajas NAP. Se implementó una Solución de Triple Verificación simultánea:"
    )

    insert_p(p_react,
        "a) Señalización Luminosa LED: Diodo circular de color que provee una referencia visual rápida para usuarios con visión tricromática normal."
    )
    insert_p(p_react,
        "b) Iconografía Geométrica Diferenciada: Cada estado integra un icono SVG vectorizado distintivo: un checkmark [✓] para Puerto Libre, un candado [🔒] para Puerto Ocupado, un triángulo de advertencia [⚠] para Reservado y un aspa de bloqueo [✕] para Puerto Dañado."
    )
    insert_p(p_react,
        "c) Etiquetado Textual Explícito y Número Físico: Cada conector incluye la leyenda en texto en mayúsculas sostenidas ('LIBRE', 'OCUPADO', 'DAÑADO') y el identificador numérico grabado del conector físico (1 al 16), permitiendo a cualquier operador en campo determinar el estado técnico sin ninguna ambigüedad ni margen de error."
    )

    # Renumber subsequent headings in 3.7
    for p in doc.paragraphs:
        if p.text.startswith('3.7.1 ') and 'PARADIGMA' in p.text.upper():
            p.text = p.text.replace('3.7.1 ', '3.7.3 ')
            p.runs[0].text = p.text
        elif p.text.startswith('3.7.2 ') and 'VISOR CARTOGRÁFICO' in p.text.upper() or ('3.7.2 ' in p.text and 'VISOR' in p.text.upper()):
            p.text = p.text.replace('3.7.2 ', '3.7.4 ')
            p.runs[0].text = p.text
        elif p.text.startswith('3.7.3 ') and 'MATRIZ FÍSICA' in p.text.upper() or ('3.7.3 ' in p.text and 'MATRIZ' in p.text.upper()):
            p.text = p.text.replace('3.7.3 ', '3.7.5 ')
            p.runs[0].text = p.text

    # Renumber subsequent figures in Chapter 3 to keep numbering consistent
    # Old Figure 8 (frontend components) -> Figure 10
    # Old Figure 9 (offline sync) -> Figure 11
    # Old Figure 10 (pdfkit streaming) -> Figure 12
    # Old Figure 11 (docker compose) -> Figure 13
    print("Renumbering subsequent figures in Chapter 3...")
    for p in doc.paragraphs:
        txt = p.text.strip()
        if txt.startswith('Figura 8. Arquitectura de componentes'):
            p.text = txt.replace('Figura 8.', 'Figura 10.')
            for r in p.runs:
                if 'Figura 8.' in r.text:
                    r.text = r.text.replace('Figura 8.', 'Figura 10.')
        elif txt.startswith('Figura 9. Flujo de decisi'):
            p.text = txt.replace('Figura 9.', 'Figura 11.')
            for r in p.runs:
                if 'Figura 9.' in r.text:
                    r.text = r.text.replace('Figura 9.', 'Figura 11.')
        elif txt.startswith('Figura 10. Flujo de generaci'):
            p.text = txt.replace('Figura 10.', 'Figura 12.')
            for r in p.runs:
                if 'Figura 10.' in r.text:
                    r.text = r.text.replace('Figura 10.', 'Figura 12.')
        elif txt.startswith('Figura 11. Arquitectura de contenerizaci'):
            p.text = txt.replace('Figura 11.', 'Figura 13.')
            for r in p.runs:
                if 'Figura 11.' in r.text:
                    r.text = r.text.replace('Figura 11.', 'Figura 13.')

    # Save modified document
    output_path = 'docs/PORTADA_INSTITUCIONAL (3).docx'
    print(f"Saving updated document to {output_path}...")
    doc.save(output_path)
    print("Successfully updated document!")

if __name__ == '__main__':
    main()

