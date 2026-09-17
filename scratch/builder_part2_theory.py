import docx
from docx.shared import Pt, Inches, RGBColor
from scratch.common_docx import (
    add_heading_1, add_heading_2, add_heading_3, add_paragraph, add_figure, sanitize_text
)

def build_chapter_2(doc, tables_source):
    """
    Construye el Capítulo II: Marco Teórico o Estado del Arte con enriquecimiento teórico exhaustivo,
    fórmulas matemáticas, explicaciones rigurosas y las Figuras 1 a 15 con títulos abajo en Arial 9 negrita
    y fuentes en Arial 8.5 cursiva.
    """
    add_heading_1(doc, "CAPÍTULO II. MARCO TEÓRICO O ESTADO DEL ARTE")
    
    add_paragraph(doc, 
        "El presente marco teórico compendia los fundamentos científicos, modelos de referencia y estándares "
        "tecnológicos internacionales que sustentan la concepción, diseño e implementación del Sistema de Inventario "
        "y Mapeo Lógico GPON / FTTx desarrollado para la empresa GPON TELECOM S.A. de C.V. Se abordan de forma articulada "
        "las disciplinas de ingeniería en telecomunicaciones ópticas pasivas, cartografía geoespacial computarizada, "
        "arquitectura transaccional de bases de datos relacionales, programación reactiva basada en componentes, "
        "sistemas móviles con tolerancia a la desconexión y virtualización ligera para despliegues en la nube.")

    # 2.1
    add_heading_2(doc, "2.1 Fundamentos de redes de computadoras y telecomunicaciones")
    
    add_heading_3(doc, "2.1.1 Definición, Concepto y Propósito de una Red de Datos")
    add_paragraph(doc,
        "Una red de computadoras se define formalmente como un conjunto coordinado de nodos de cómputo autónomos "
        "interconectados entre sí mediante enlaces físicos guiados o no guiados, capaces de intercambiar datos, compartir "
        "recursos de procesamiento y ejecutar protocolos de comunicación estandarizados (Kurose y Ross, 2017). En el ámbito "
        "operativo de los proveedores de servicios de internet (Internet Service Providers - ISP), la red de datos constituye "
        "el pilar sobre el cual se orquestan los flujos de tráfico residencial y empresarial, demandando alta disponibilidad, "
        "latencias mínimas y mecanismos deterministas para el direccionamiento y entrega íntegra de paquetes IP.")

    add_heading_3(doc, "2.1.2 Clasificación de las Redes por su Cobertura Geográfica")
    add_paragraph(doc,
        "La topología y dispersión territorial de las redes demanda una categorización taxonómica estricta:")
    add_paragraph(doc, 
        "Abarca el entorno cercano de un usuario en un rango no mayor a 10 metros, empleada para interconexión de terminales periféricos.",
        bold_prefix="a) Red de Área Personal (PAN): ", indent=True)
    add_paragraph(doc,
        "Confinada a un área física controlada, tal como una oficina, edificio institucional o residencia. Ofrece altas tasas de transmisión y baja tasa de error.",
        bold_prefix="b) Red de Área Local (LAN): ", indent=True)
    add_paragraph(doc,
        "Comprende una demarcación geográfica metropolitana o regional (típicamente entre 10 y 50 kilómetros), interconectando múltiples segmentos LAN a través de enlaces de agregación.",
        bold_prefix="c) Red de Área Metropolitana (MAN): ", indent=True)
    add_paragraph(doc,
        "Interconecta regiones territoriales distantes mediante infraestructuras troncales de fibra óptica submarina o terrestre.",
        bold_prefix="d) Red de Área Amplia (WAN): ", indent=True)

    # Insert Table 1 (Clasificación de redes)
    if len(tables_source) > 2:
        from copy import deepcopy
        doc._body._element.append(deepcopy(tables_source[2]._element))
        p_cap_t1 = doc.add_paragraph()
        p_cap_t1.paragraph_format.space_before = Pt(4)
        p_cap_t1.paragraph_format.space_after = Pt(10)
        r1 = p_cap_t1.add_run("Tabla 1. Clasificación taxonómica de las redes según su cobertura geográfica.\n")
        r1.font.name = 'Arial'
        r1.font.size = Pt(9)
        r1.bold = True
        r2 = p_cap_t1.add_run("Fuente: Elaboración propia a partir de estándares IEEE 802.")
        r2.font.name = 'Arial'
        r2.font.size = Pt(8.5)
        r2.italic = True

    add_heading_3(doc, "2.1.3 Topologías de Red Físicas y Lógicas")
    add_paragraph(doc,
        "La topología describe la ordenación geométrica de los enlaces (topología física) o el patrón de flujo de los datos "
        "entre los nodos (topología lógica). Mientras que las topologías convencionales de red de área local emplean esquemas "
        "en estrella o malla con conmutadores activos, las redes de distribución óptica para acceso residencial recurren a la "
        "topología de árbol o Punto a Multipunto (P2MP). Dicho esquema optimiza sustancialmente la inversión en planta externa "
        "al ramificar un único hilo de fibra troncal hacia decenas de suscriptores finales mediante elementos divisores pasivos.")

    add_heading_3(doc, "2.1.4 Modelos de Referencia: Modelo OSI y Arquitectura TCP/IP")
    add_paragraph(doc,
        "El diseño modular de los sistemas de telecomunicaciones se rige por arquitecturas en capas. El Modelo de Referencia "
        "OSI (ISO/IEC 7498-1) estructura las funciones en siete capas independientes: Física, Enlace de Datos, Red, Transporte, "
        "Sesión, Presentación y Aplicación. En contraparte, la arquitectura pragmática de Internet consolida estas funciones en "
        "cuatro niveles: Acceso a la Red, Internet (IP), Transporte (TCP/UDP) y Aplicación (HTTP/HTTPS, DNS).")

    # Figura 1
    add_figure(doc, "scratch/figures_named/image5.png",
               "Figura 1. Modelo de referencia OSI de 7 capas frente a la arquitectura TCP/IP.",
               "Fuente: Recuperado de Kurose y Ross, Redes de Computadores: Un Enfoque Descendente, Pearson Education, 2017.",
               width_inches=5.8)

    add_heading_3(doc, "2.1.5 Medios Físicos de Transmisión: Medios Guiados frente a No Guiados")
    add_paragraph(doc,
        "Los medios de transmisión canalizan las señales electromagnéticas. Los medios no guiados (radioenlaces de microondas y satelitales) "
        "ofrecen despliegue rápido pero sufren atenuaciones severas por fenómenos meteorológicos, desvanecimiento por multicamino y limitaciones de ancho de banda. "
        "Por el contrario, los medios guiados (cables coaxiales, pares trenzados y fibra óptica) confinan la propagación a un medio físico continuo. "
        "La fibra óptica supera a cualquier medio de cobre al brindar inmunidad electromagnética absoluta, nula diafonía y distancias de propagación superiores a 20 kilómetros sin repetidores.")

    add_heading_3(doc, "2.1.6 Física de la Transmisión Óptica: Ley de Snell, Ángulo Crítico y Reflexión Interna Total")
    add_paragraph(doc,
        "El fenómeno físico fundamental que permite guiar la luz a lo largo del núcleo de vidrio es la Reflexión Interna Total (Total Internal Reflection - TIR). "
        "La refracción electromagnética en la interfaz entre dos medios dieléctricos transparentes está gobernada por la Ley de Snell:")
    add_paragraph(doc,
        "n1 * sen(θ1) = n2 * sen(θ2)",
        bold_prefix="Ecuación de Snell: ", indent=True)
    add_paragraph(doc,
        "Donde n1 es el índice de refracción del núcleo de sílice dopado con germanio (aproximadamente 1.468), n2 es el índice de refracción del revestimiento de sílice pura (aproximadamente 1.447), "
        "θ1 representa el ángulo de incidencia y θ2 el ángulo de refracción. Como n1 > n2, existe un ángulo de incidencia denominado Ángulo Crítico (θc), calculado como:")
    add_paragraph(doc,
        "θc = arcsen(n2 / n1)",
        bold_prefix="Ángulo Crítico: ", indent=True)
    add_paragraph(doc,
        "Cuando el rayo luminoso incide con un ángulo superior a θc, la refracción hacia el revestimiento se anula por completo y la totalidad de la energía lumínica se refleja internamente, "
        "propagándose en zigzag a través del núcleo sin fugas radiales hacia el exterior.")

    # Figura 2
    add_figure(doc, "scratch/figures_named/image6.png",
               "Figura 2. Principio físico de propagación: Refracción, ángulo crítico y reflexión interna total (TIR).",
               "Fuente: Recuperado de Hecht, Optics and Fiber Optics Principles, Addison-Wesley, 2017.",
               width_inches=5.6)

    add_heading_3(doc, "2.1.7 Tipos de Fibra Óptica, Ventanas de Transmisión y Estándares ITU-T")
    add_paragraph(doc,
        "En función del diámetro del núcleo se distinguen dos categorías esenciales:")
    add_paragraph(doc,
        "Posee un núcleo amplio de 50 o 62.5 micrómetros, lo que provoca que los pulsos de luz se dispersen en múltiples caminos o modos, generando dispersión intermodal que restringe su alcance a distancias menores a 2 kilómetros.",
        bold_prefix="1. Fibra Multimodo (MMF): ", indent=True)
    add_paragraph(doc,
        "Posee un núcleo microscópico de aproximadamente 9 micrómetros, permitiendo que la luz viaje en un único modo electromagnético axial. Elimina la dispersión modal y permite enlaces de gran capacidad a decenas de kilómetros.",
        bold_prefix="2. Fibra Monomodo (SMF): ", indent=True)
    add_paragraph(doc,
        "La planta externa de GPON TELECOM utiliza fibra monomodo bajo recomendaciones ITU-T G.652.D (baja absorción del pico de agua) para cables troncales de distribución "
        "y G.657.A2 (radio de curvatura insensible de hasta 7.5 mm) para las acometidas domiciliarias Drop hacia las residencias de los suscriptores.")

    # 2.2
    add_heading_2(doc, "2.2 Redes ópticas pasivas (PON) y arquitecturas FTTx")
    
    add_heading_3(doc, "2.2.1 Paradigma FTTx: Concepto y Variantes Topológicas")
    add_paragraph(doc,
        "El paradigma FTTx (Fiber to the X) comprende diversas configuraciones según la proximidad de la terminación óptica al usuario final:")
    add_paragraph(doc, "FTTH (Fiber to the Home): El filamento óptico ingresa directamente al domicilio del abonado, rematando en una roseta y una ONT.", indent=True)
    add_paragraph(doc, "FTTB (Fiber to the Building): La fibra arriba al sótano o armario de telecomunicaciones de un edificio, distribuyéndose por cobre a cada departamento.", indent=True)
    add_paragraph(doc, "FTTC (Fiber to the Curb): La fibra concluye en una acera o pedestal exterior ubicado a menos de 300 metros de los inmuebles.", indent=True)
    add_paragraph(doc, "FTTN (Fiber to the Node): La fibra culmina en un nodo concentrador de vecindario, abasteciendo un radio de hasta 1.5 kilómetros.", indent=True)

    # Figura 3
    add_figure(doc, "scratch/figures_named/image7.png",
               "Figura 3. Variantes de arquitectura y topologías del paradigma FTTx.",
               "Fuente: Recuperado de Fiber Broadband Association (FBA) Standards, 2025.",
               width_inches=5.8)

    add_heading_3(doc, "2.2.2 Redes Ópticas Pasivas (PON) frente a Redes Ópticas Activas (AON)")
    add_paragraph(doc,
        "A diferencia de las redes AON, que requieren conmutadores intermedios alimentados por corriente eléctrica en postes y gabinetes de calle, "
        "las redes PON sustituyen todo equipamiento activo intermedio por prismas divisores ópticos pasivos (Splitters PLC). Esto reduce drásticamente "
        "los costos de mantenimiento, consumo energético e incidencias por fallas eléctricas en la vía pública.")

    add_heading_3(doc, "2.2.3 El Estándar GPON (ITU-T G.984): Tasas, Longitudes de Onda y Encapsulamiento GEM")
    add_paragraph(doc,
        "El estándar GPON (Gigabit-capable Passive Optical Networks), regulado por la recomendación ITU-T serie G.984, establece una tasa nominal "
        "asimétrica de 2.488 Gbps en sentido descendente (Downstream) y 1.244 Gbps en sentido ascendente (Upstream). "
        "Para compartir el mismo filamento de fibra monomodo de manera bidireccional, se implementa Multiplexación por División de Longitud de Onda (WDM):")
    add_paragraph(doc, "Longitud de onda descendente: 1490 nm, para tráfico de datos e internet.", indent=True)
    add_paragraph(doc, "Longitud de onda ascendente: 1310 nm, con asignación de ranuras temporales TDMA.", indent=True)
    add_paragraph(doc, "Longitud de onda de video RF (opcional): 1550 nm, para difusión de televisión por cable.", indent=True)

    # Figura 4
    add_figure(doc, "scratch/figures_named/image8.png",
               "Figura 4. Espectro y plan de longitudes de onda en GPON (ITU-T G.984.2 WDM).",
               "Fuente: Recuperado de ITU-T Recommendation G.984.2, Gigabit-capable Passive Optical Networks, 2019.",
               width_inches=5.6)

    # Insert Table 2 (Parámetros operativos GPON)
    if len(tables_source) > 3:
        from copy import deepcopy
        doc._body._element.append(deepcopy(tables_source[3]._element))
        p_cap_t2 = doc.add_paragraph()
        p_cap_t2.paragraph_format.space_before = Pt(4)
        p_cap_t2.paragraph_format.space_after = Pt(10)
        r1 = p_cap_t2.add_run("Tabla 2. Parámetros operativos del estándar GPON según ITU-T G.984.\n")
        r1.font.name = 'Arial'
        r1.font.size = Pt(9)
        r1.bold = True
        r2 = p_cap_t2.add_run("Fuente: Unión Internacional de Telecomunicaciones (ITU-T).")
        r2.font.name = 'Arial'
        r2.font.size = Pt(8.5)
        r2.italic = True

    add_heading_3(doc, "2.2.4 Componentes de la Red de Distribución Óptica (ODN)")
    add_paragraph(doc,
        "La ODN (Optical Distribution Network) abarca los elementos pasivos ubicados entre la OLT y las ONT:")
    add_paragraph(doc, "1. Bastidor de Distribución Óptica (ODF): Gabinete modular de cabecera con acopladores SC/APC para conmutar puertos PON con la fibra externa troncal.", indent=True)
    add_paragraph(doc, "2. Cajas de Empalme o Mufas Torpedo: Envolventes herméticas IP68 donde se protegen las fusiones por arco eléctrico de los cables troncales de distribución.", indent=True)
    add_paragraph(doc, "3. Cajas Terminales NAP (Network Access Point): Cajas poliméricas aéreas instaladas en postes CFE que alojan splitters secundarios de 1:8 o 1:16 con puertos reforzados para acometidas.", indent=True)

    # Insert Table 3 (Pérdidas splitters PLC)
    if len(tables_source) > 4:
        from copy import deepcopy
        doc._body._element.append(deepcopy(tables_source[4]._element))
        p_cap_t3 = doc.add_paragraph()
        p_cap_t3.paragraph_format.space_before = Pt(4)
        p_cap_t3.paragraph_format.space_after = Pt(10)
        r1 = p_cap_t3.add_run("Tabla 3. Pérdidas de inserción típicas introducidas por divisores ópticos pasivos (Splitters PLC).\n")
        r1.font.name = 'Arial'
        r1.font.size = Pt(9)
        r1.bold = True
        r2 = p_cap_t3.add_run("Fuente: Especificación técnica Telcordia GR-1209-CORE.")
        r2.font.name = 'Arial'
        r2.font.size = Pt(8.5)
        r2.italic = True

    add_heading_3(doc, "2.2.5 Presupuesto Óptico de Potencia (Optical Power Budget)")
    add_paragraph(doc,
        "El balance de potencia óptica garantiza que la intensidad de la señal lumínica que alcanza el fotodiodo receptor de la ONT "
        "se ubique dentro de la ventana de sensibilidad nominal (típicamente entre -8 dBm y -27 dBm bajo norma ITU-T G.984 Clase B+ o C+). "
        "La atenuación total se modela matemáticamente como:")
    add_paragraph(doc,
        "Atenuación_Total (dB) = (Longitud * α) + (N_empalmes * P_empalme) + (N_conectores * P_conector) + P_splitter + Margen_Seguridad",
        bold_prefix="Fórmula del Presupuesto Óptico: ", indent=True)

    # 2.3
    add_heading_2(doc, "2.3 Sistemas de información geográfica (GIS) y cartografía digital")
    
    add_heading_3(doc, "2.3.1 Fundamentos de los Sistemas de Información Geográfica (GIS)")
    add_paragraph(doc,
        "Un Sistema de Información Geográfica (GIS) es una arquitectura computacional integrada diseñada para capturar, almacenar, "
        "manipular, analizar y desplegar datos espacialmente referenciados a la superficie terrestre. En la gestión de redes de telecomunicaciones, "
        "el GIS permite abandonar los planos estáticos en papel para adoptar gemelos digitales donde cada poste, mufa y caja NAP está georreferenciada "
        "con coordenadas geodésicas de alta precisión métrica.")

    # Figura 5
    add_figure(doc, "scratch/figures_named/image9.png",
               "Figura 5. Arquitectura de superposición de capas en un Sistema de Información Geográfica (GIS).",
               "Fuente: Recuperado de Environmental Systems Research Institute (ESRI), GIS Concepts, 2024.",
               width_inches=5.6)

    add_heading_3(doc, "2.3.2 Modelos de Datos Espaciales: Vectorial frente a Ráster")
    add_paragraph(doc,
        "El modelo ráster descompone el espacio en una rejilla regular de píxeles (utilizado para ortofotografías satelitales). "
        "En contraste, el modelo vectorial representa la infraestructura mediante primitivas geométricas discretas (Puntos para postes y cajas NAP, "
        "Polilíneas para trayectorias de cables de fibra, y Polígonos para polígonos de cobertura de servicio), estructurados bajo el estándar GeoJSON (IETF RFC 7946).")

    add_heading_3(doc, "2.3.3 Sistemas Geodésicos de Referencia: WGS84 y Web Mercator")
    add_paragraph(doc,
        "El sistema WGS84 (EPSG:4326) modela la superficie terrestre mediante un elipsoide geocéntrico con latitud y longitud en grados decimales, "
        "empleado universalmente por los receptores GPS móviles. Por su parte, la proyección Web Mercator (EPSG:3857) proyecta el esferoide "
        "sobre un plano cartesiano bidimensional conforme, estandarizado en los motores de mapas web.")

    add_heading_3(doc, "2.3.4 Cartografía Colaborativa: OpenStreetMap (OSM)")
    add_paragraph(doc,
        "OpenStreetMap (OSM) proporciona una base de datos cartográfica global abierta y colaborativa que alimenta de teselas vectoriales "
        "y ráster a los motores de visualización web sin costos comerciales por consumo de llamadas a la API.")

    add_heading_3(doc, "2.3.5 Librerías Cartográficas Web: Leaflet y React-Leaflet")
    add_paragraph(doc,
        "Leaflet es una biblioteca JavaScript ligera de código abierto optimizada para el renderizado eficiente de mapas interactivos en clientes móviles y de escritorio. "
        "React-Leaflet proporciona enlaces declarativos que sincronizan el ciclo de vida de los componentes React con las capas Leaflet.")

    # Figura 6
    add_figure(doc, "scratch/figures_named/image10.png",
               "Figura 6. Librería Leaflet para renderizado de mapas interactivos en React.",
               "Fuente: Recuperado de Leaflet Official Documentation (https://leafletjs.com), 2026.",
               width_inches=5.8)

    # 2.4
    add_heading_2(doc, "2.4 Sistemas gestores de bases de datos relacionales y concurrencia")
    
    add_heading_3(doc, "2.4.1 Concepto de Base de Datos y Sistemas RDBMS")
    add_paragraph(doc,
        "Un Sistema Gestor de Bases de Datos Relacionales (RDBMS) asegura la integridad y consistencia de los datos organizando las entidades "
        "en tablas de filas y columnas vinculadas mediante claves foráneas y álgebra relacional.")

    add_heading_3(doc, "2.4.2 El Motor Relacional PostgreSQL y Tipos de Datos Avanzados")
    add_paragraph(doc,
        "PostgreSQL es un motor relacional de objetos de código abierto reconocido por su estricto apego al estándar SQL, soporte de tipos de datos JSONB, "
        "identificadores UUIDv4 nativos y capacidades espaciales avanzadas.")

    # Figura 7
    add_figure(doc, "scratch/figures_named/image11.png",
               "Figura 7. Arquitectura interna del motor relacional PostgreSQL y procesamiento de transacciones.",
               "Fuente: Recuperado de PostgreSQL Global Development Group (https://www.postgresql.org), 2026.",
               width_inches=5.6)

    add_heading_3(doc, "2.4.3 Propiedades ACID en Transacciones de Datos")
    add_paragraph(doc,
        "Las transacciones en sistemas de telecomunicaciones demandan las garantías ACID:")
    add_paragraph(doc, "Atomicidad (Atomicity): Todas las operaciones de la transacción se ejecutan con éxito o ninguna surte efecto.", indent=True)
    add_paragraph(doc, "Consistencia (Consistency): Toda transición conduce a la base de datos de un estado válido a otro estado válido cumpliendo restricciones.", indent=True)
    add_paragraph(doc, "Aislamiento (Isolation): Las operaciones concurrentes no interfieren entre sí.", indent=True)
    add_paragraph(doc, "Durabilidad (Durability): Los cambios confirmados persisten ante fallos de energía.", indent=True)

    add_heading_3(doc, "2.4.4 Concurrencia de Datos y Anomalías Transaccionales")
    add_paragraph(doc,
        "En ausencia de controles de concurrencia surgen anomalías severas:")
    add_paragraph(doc, "1. Lectura Sucia (Dirty Read): Una transacción lee datos modificados por otra transacción aún no confirmada.", indent=True)
    add_paragraph(doc, "2. Lectura No Repetible (Non-Repeatable Read): Consultas idénticas en la misma transacción obtienen valores distintos debido a modificaciones concurrentes.", indent=True)
    add_paragraph(doc, "3. Lectura Fantasma (Phantom Read): Nuevas filas insertadas por transacciones concurrentes aparecen en lecturas repetidas.", indent=True)

    add_heading_3(doc, "2.4.5 Mecanismos de Control de Concurrencia: Bloqueo Optimista vs. Bloqueo Pesimista")
    add_paragraph(doc,
        "El Bloqueo Optimista valida versiones al guardar, asumiendo colisiones infrecuentes. Sin embargo, en cuadrillas de telecomunicaciones donde múltiples "
        "técnicos en campo compiten simultáneamente por el último puerto libre de una caja NAP, el Bloqueo Pesimista (SELECT ... FOR UPDATE) es la única estrategia "
        "que garantiza la exclusión mutua estricta a nivel de fila, serializando las peticiones y bloqueando atómicamente el recurso hasta el fin de la transacción.")

    add_heading_3(doc, "2.4.6 Mapeo Objeto-Relacional (ORM) y la Biblioteca Sequelize")
    add_paragraph(doc,
        "Sequelize actúa como capa de abstracción entre las clases de dominio TypeScript y el catálogo relacional de PostgreSQL, gestionando migraciones, "
        "asociaciones de claves foráneas y control programático de transacciones.")

    # 2.5
    add_heading_2(doc, "2.5 Tecnologías y arquitectura para el desarrollo web moderno")
    
    add_heading_3(doc, "2.5.1 El Modelo Cliente-Servidor y Servicios Web RESTful")
    add_paragraph(doc,
        "La arquitectura desacopla el cliente (interfaz de usuario) del servidor (lógica de negocio y persistencia), "
        "comunicándose mediante servicios web RESTful basados en los métodos HTTP estándar (GET, POST, PATCH, DELETE) con payloads JSON.")

    # Figura 8
    add_figure(doc, "scratch/figures_named/image12.png",
               "Figura 8. Arquitectura Cliente-Servidor y protocolo de intercambio RESTful en aplicaciones web.",
               "Fuente: Recuperado de Fielding, Architectural Styles and the Design of Network-based Software Architectures, 2000.",
               width_inches=5.6)

    add_heading_3(doc, "2.5.2 Entorno de Ejecución en Servidor: Node.js y el Bucle de Eventos (Event Loop)")
    add_paragraph(doc,
        "Node.js es un entorno de ejecución basado en el motor V8 de Google Chrome. Su núcleo descansa sobre la biblioteca libuv, "
        "implementando un modelo de entrada y salida no bloqueante dirigido por eventos (Event-Driven Non-Blocking I/O). "
        "El bucle de eventos (Event Loop) opera sobre un único hilo principal de ejecución, descargando las operaciones pesadas de acceso a disco y red "
        "al conjunto de subprocesos en segundo plano del sistema operativo. El bucle procesa los callbacks a través de seis fases secuenciales continuas:")
    add_paragraph(doc, "1. Fase de Timers: Procesa callbacks programados por setTimeout() y setInterval().", indent=True)
    add_paragraph(doc, "2. Fase de Pending Callbacks: Ejecuta callbacks de operaciones de I/O diferidas o pendientes de errores TCP.", indent=True)
    add_paragraph(doc, "3. Fase de Idle, Prepare: Utilizada internamente para la preparación del bucle.", indent=True)
    add_paragraph(doc, "4. Fase de Poll (Sondeo): Calcula el tiempo de bloqueo para nuevos eventos de I/O y despacha callbacks entrantes.", indent=True)
    add_paragraph(doc, "5. Fase de Check (Verificación): Ejecuta callbacks específicos agendados mediante setImmediate().", indent=True)
    add_paragraph(doc, "6. Fase de Close Callbacks: Gestiona el cierre explícito de sockets y descriptores de archivo.", indent=True)
    add_paragraph(doc,
        "Adicionalmente, la cola de microtareas (Microtask Queue) gestiona process.nextTick() y resoluciones de promesas (Promises), "
        "las cuales poseen prioridad absoluta y se drenan inmediatamente entre cada una de las fases del bucle.")

    # Figura 9 (NUEVA: Event Loop)
    add_figure(doc, "scratch/teoria_event_loop_nodejs.png",
               "Figura 9. Arquitectura del Bucle de Eventos (Event Loop) en Node.js y fases de ejecución no bloqueante.",
               "Fuente: Recuperado de Node.js Guides (https://nodejs.org/docs/guides/event-loop-timers-and-nexttick), 2026.",
               width_inches=5.8)

    add_heading_3(doc, "2.5.3 Framework de Backend: Express.js y Arquitectura de Middlewares")
    add_paragraph(doc,
        "Express.js proporciona una infraestructura minimalista y flexible construida sobre una cadena de middlewares. "
        "Cada función middleware intercepta los objetos Request y Response, ejecutando autenticaciones, validaciones de esquemas y sanitizaciones "
        "antes de delegar el control al controlador final mediante la función next().")

    add_heading_3(doc, "2.5.4 Lenguaje y Sistema de Tipado Estático: TypeScript")
    add_paragraph(doc,
        "TypeScript incorpora tipado estático opcional sobre JavaScript, permitiendo modelar interfaces de datos estrictas para nodos ópticos, "
        "puertos y clientes. La validación se realiza en tiempo de compilación, eliminando fallos en tiempo de ejecución derivados de referencias nulas o discrepancias de tipos.")

    add_heading_3(doc, "2.5.5 Biblioteca de Interfaz de Usuario: React.js, Virtual DOM y Hooks")
    add_paragraph(doc,
        "React.js implementa un paradigma declarativo basado en componentes reactivos. Para optimizar el rendimiento y evitar repintados costosos "
        "del árbol DOM real del navegador (Reflow y Repaint), React conserva en memoria una copia abstracta denominada Virtual DOM. "
        "Cuando el estado de la aplicación muta, React genera un nuevo árbol Virtual DOM y ejecuta el algoritmo de reconciliación (Fiber Reconciler). "
        "Dicho algoritmo compara de forma heurística los dos árboles con complejidad computacional O(n), identificando de manera quirúrgica los nodos exactos que cambiaron "
        "y aplicando una ráfaga mínima de actualizaciones al DOM real.")

    # Figura 10 (NUEVA: Virtual DOM)
    add_figure(doc, "scratch/teoria_react_virtual_dom.png",
               "Figura 10. Mecanismo de Reconciliación y Virtual DOM en React.js mediante Fiber Reconciler.",
               "Fuente: Recuperado de React Official Architecture Documentation (https://react.dev), 2026.",
               width_inches=5.8)

    add_heading_3(doc, "2.5.6 Framework de Estilos: Tailwind CSS y Paradigma Utility-First")
    add_paragraph(doc,
        "Tailwind CSS adopta el paradigma de clases de utilidad atómicas directly in the markup, compilando mediante PurgeCSS únicamente las clases empleadas "
        "para producir hojas de estilo extremadamente ligeras de menos de 15 KB.")

    add_heading_3(doc, "2.5.7 Herramienta de Compilación y Empaquetado: Vite")
    add_paragraph(doc,
        "Vite aprovecha los módulos ES nativos (ESM) en el navegador y el compilador esbuild escrito en Go, ofreciendo recarga en caliente instantánea (HMR) "
        "y empaquetado optimizado mediante Rollup para producción.")

    add_heading_3(doc, "2.5.8 Generación Dinámica de Reportes en el Servidor: PDFKit y Streaming")
    add_paragraph(doc,
        "PDFKit permite generar documentos PDF vectoriales mediante código imperativo en Node.js. Al integrarse con Node Streams, los bytes se canalizan "
        "directamente hacia el socket HTTP de la respuesta conforme se dibujan en memoria, eliminando la creación de archivos temporales en el disco duro del servidor.")

    # 2.6
    add_heading_2(doc, "2.6 Aplicaciones web progresivas (PWA) y arquitectura sin conexión (Offline-First)")
    
    add_heading_3(doc, "2.6.1 Concepto de Progressive Web App (PWA)")
    add_paragraph(doc,
        "Una PWA combina la universalidad y facilidad de distribución de la web con capacidades nativas de dispositivos móviles, permitiendo su instalación "
        "en pantalla de inicio, acceso a sensores de geolocalización satelital y ejecución en ausencia total de cobertura de red celular.")

    add_heading_3(doc, "2.6.2 Service Workers: Ciclo de Vida e Intercepción de Red")
    add_paragraph(doc,
        "El Service Worker es un script que el navegador ejecuta en un hilo de ejecución independiente en segundo plano, completamente desacoplado "
        "de la página web y del árbol DOM. Actúa como un servidor proxy programable ubicado entre la aplicación web, el navegador y la red física. "
        "Su ciclo de vida comprende cuatro etapas fundamentales:")
    add_paragraph(doc, "1. Registro: El script principal registra el archivo service-worker.js mediante navigator.serviceWorker.register().", indent=True)
    add_paragraph(doc, "2. Instalación: El navegador dispara el evento 'install', donde se descargan y almacenan en Cache Storage los recursos estáticos del Application Shell (HTML, JS, CSS, iconos).", indent=True)
    add_paragraph(doc, "3. Activación: Se dispara el evento 'activate', donde se purgan cachés obsoletas de versiones anteriores del software.", indent=True)
    add_paragraph(doc, "4. Operatividad y Manejo de Eventos: El Service Worker entra en modo activo y escucha eventos 'fetch'. Toda solicitud de red de la aplicación es interceptada. Si no existe conexión a Internet, sirve los recursos desde el almacenamiento local.", indent=True)

    # Figura 11 (NUEVA: Service Worker)
    add_figure(doc, "scratch/teoria_service_worker_lifecycle.png",
               "Figura 11. Ciclo de vida y operación del Service Worker en una Progressive Web App (PWA).",
               "Fuente: Recuperado de MDN Web Docs - Service Worker API (https://developer.mozilla.org), 2026.",
               width_inches=5.8)

    add_heading_3(doc, "2.6.3 Manifiesto de la Aplicación Web (Web App Manifest)")
    add_paragraph(doc,
        "El archivo manifest.json define los metadatos institucionales requeridos para la instalación en pantalla de inicio, incluyendo el nombre formal, "
        "iconos de alta resolución, colores de tema y modo de visualización independiente (display: standalone).")

    add_heading_3(doc, "2.6.4 Almacenamiento Local Estructurado en el Navegador: IndexedDB y Dexie.js")
    add_paragraph(doc,
        "A diferencia de localStorage (que está limitado a 5 MB y opera de forma síncrona bloqueante), IndexedDB es un motor transaccional no relacional "
        "asíncrono embebido en el navegador, estructurado mediante almacenes de objetos (Object Stores) e índices en árbol B+. "
        "Dexie.js proporciona una capa tipada sobre IndexedDB, facilitando consultas de alta velocidad y transacciones atómicas locales.")

    add_heading_3(doc, "2.6.5 Patrón de Sincronización en Diferido (Queue-Based Synchronization)")
    add_paragraph(doc,
        "Cuando el técnico en campo ejecuta mutaciones en modo desconectado (asignación de un puerto o captura de GPS en poste), "
        "la acción se encola en una tabla local pending_mutations. Al detectar el evento 'online', el cliente vacía la cola en ráfaga "
        "enviando las peticiones al backend para su consolidación definitiva.")

    # 2.7
    add_heading_2(doc, "2.7 Seguridad informática, autenticación y autorización")
    
    add_heading_3(doc, "2.7.1 Principios Fundamentales: Confidencialidad, Integridad y Disponibilidad (Tríada CIA)")
    add_paragraph(doc,
        "La seguridad del sistema descansa sobre la Tríada CIA: confidencialidad para restringir accesos según roles, "
        "integridad para evitar alteraciones accidentales o maliciosas en las conexiones de fibra, y disponibilidad para asegurar el acceso continuo al gemelo digital.")

    add_heading_3(doc, "2.7.2 Funciones Criptográficas de Dispersiúon Unidireccional: Algoritmo bcrypt")
    add_paragraph(doc,
        "Las contraseñas nunca se persisten en texto plano. Se emplea la función de dispersión unidireccional bcrypt, "
        "la cual incorpora una sal aleatoria (Salt) de 10 rondas y una función criptográfica adaptativa basada en el cifrado Blowfish para repeler ataques de diccionario y tablas arcoíris.")

    add_heading_3(doc, "2.7.3 Autenticación sin Estado mediante JSON Web Tokens (JWT)")
    add_paragraph(doc,
        "El estándar IETF RFC 7519 define un token compacto y autónomo para transmitir identidades de forma segura en formato JSON. "
        "Un token JWT consta de tres fragmentos codificados en Base64Url y concatenados por puntos:")
    add_paragraph(doc, "1. Header: Declara el tipo de token y el algoritmo de firma (HS256 - HMAC-SHA256).", indent=True)
    add_paragraph(doc, "2. Payload: Almacena las declaraciones o Claims del usuario (id, credencial, rol asignado, tiempo de emisión y tiempo de expiración).", indent=True)
    add_paragraph(doc, "3. Signature: Generada mediante el hash criptográfico del Header concatenado al Payload utilizando una clave secreta privada conocida únicamente por el backend.", indent=True)
    add_paragraph(doc,
        "El token viaja en cada solicitud HTTP dentro de la cabecera Authorization con el prefijo Bearer, permitiendo al servidor validar la identidad sin realizar consultas adicionales a la base de datos.")

    # Figura 12 (NUEVA: JWT)
    add_figure(doc, "scratch/teoria_jwt_structure_flow.png",
               "Figura 12. Estructura criptográfica y protocolo de JSON Web Tokens (JWT) bajo estándar RFC 7519.",
               "Fuente: Recuperado de Internet Engineering Task Force (IETF RFC 7519) y Auth0 Open Source, 2026.",
               width_inches=5.8)

    add_heading_3(doc, "2.7.4 Control de Acceso Basado en Roles (Role-Based Access Control - RBAC)")
    add_paragraph(doc,
        "El modelo formal RBAC (estándar ANSI/INCITS 359-2004 / NIST SP 800-162) vincula los permisos de ejecución a roles funcionales en lugar de asignarlos directamente a usuarios individuales. "
        "Se definen tres roles jerárquicos:")
    add_paragraph(doc, "Administrador: Acceso irrestricto de lectura, creación, edición, auditoría y eliminación de toda la infraestructura y cuentas de usuario.", indent=True)
    add_paragraph(doc, "Soporte Técnico: Privilegios de consulta, supervisión cartográfica, auditoría técnica, reasignación y descarga de reportes ejecutivos.", indent=True)
    add_paragraph(doc, "Técnico de Campo: Privilegios acotados a la asignación de puertos en cajas NAP asignadas y calibración de coordenadas GPS en sitio.", indent=True)
    add_paragraph(doc,
        "Cualquier intento de ejecutar una operación restringida por parte de un rol no autorizado es interceptado por el middleware de autorización del backend, denegando el acceso y retornando un código formal HTTP 403 Forbidden.")

    # Figura 13 (NUEVA: RBAC)
    add_figure(doc, "scratch/teoria_rbac_model.png",
               "Figura 13. Modelo jerárquico de Control de Acceso Basado en Roles (NIST RBAC Standard).",
               "Fuente: Recuperado de National Institute of Standards and Technology (NIST SP 800-162), 2026.",
               width_inches=5.8)

    add_heading_3(doc, "2.7.5 Validación y Sanitización Estricta de Datos con Zod")
    add_paragraph(doc,
        "Zod es una biblioteca de validación declarativa con inferencia estática de tipos para TypeScript. "
        "Permite interceptar payloads HTTP maliciosos o incompletos antes de que alcancen la lógica del controlador, bloqueando inyecciones y datos anómalos.")

    # 2.8
    add_heading_2(doc, "2.8 Contenedores de software y entornos de despliegue en la nube")
    
    add_heading_3(doc, "2.8.1 Virtualización Ligera mediante Contenedores: Docker")
    add_paragraph(doc,
        "A diferencia de las máquinas virtuales tradicionales, que requieren un hipervisor y un sistema operativo invitado completo para cada aplicación "
        "(incurriendo en un elevado sobrecosto de memoria RAM y CPU), los contenedores Docker implementan virtualización a nivel de sistema operativo. "
        "Aprovechan los namespaces de Linux (para aislar procesos, redes y sistemas de archivos) y los cgroups (para limitar el consumo de memoria y CPU), "
        "compartiendo el mismo núcleo del sistema operativo anfitrión. Esto permite instanciar contenedores ligeros de menos de 100 MB con tiempos de arranque inferiores a un segundo.")

    # Figura 14 (NUEVA: Docker vs VM)
    add_figure(doc, "scratch/teoria_docker_vs_vm.png",
               "Figura 14. Comparativa arquitectónica entre Máquinas Virtuales tradicionales y Contenedores Docker.",
               "Fuente: Recuperado de Docker Documentation (https://docs.docker.com/get-started/overview), 2026.",
               width_inches=5.8)

    add_heading_3(doc, "2.8.2 Orquestación Multicontenedor: Docker Compose")
    add_paragraph(doc,
        "Docker Compose define mediante archivos YAML el ciclo de vida coordinado de múltiples contenedores, configurando redes aisladas, "
        "volúmenes de datos persistentes y variables de entorno de manera determinista.")

    add_heading_3(doc, "2.8.3 Modelos de Infraestructura en la Nube: DBaaS y PaaS")
    add_paragraph(doc,
        "Las arquitecturas modernas en la nube delegan la gestión de infraestructura física mediante modelos de Plataforma como Servicio (PaaS) "
        "y Base de Datos como Servicio (DBaaS), garantizando alta disponibilidad sin requerir mantenimiento manual de servidores.")

    add_heading_3(doc, "2.8.4 Arquitectura de Base de Datos Serverless en la Nube: Neon Database")
    add_paragraph(doc,
        "Neon es una plataforma Serverless PostgreSQL que revoluciona el almacenamiento relacional al desacoplar por completo la capa de cómputo de la capa de almacenamiento:")
    add_paragraph(doc, "1. Capa de Cómputo: Instancias PostgreSQL efímeras y sin estado (Stateless) que planifican y ejecutan consultas SQL. Escalan automáticamente a cero tras periodos de inactividad, eliminando costos ociosos.", indent=True)
    add_paragraph(doc, "2. Capa de Almacenamiento Distribuido: Desarrollada a la medida por Neon, descompone la base de datos en un clúster de Pageservers (caché de bloques en discos NVMe de alta velocidad) y Safekeepers (que implementan consenso basado en Paxos para garantizar la durabilidad del Write-Ahead Log - WAL), respaldando el almacenamiento histórico de páginas en nubes de objetos tipo Amazon S3.", indent=True)
    add_paragraph(doc,
        "Esta arquitectura permite ramificación instantánea de bases de datos (Branching Copy-on-Write) para entornos de prueba y recuperación ante desastres en cuestión de milisegundos.")

    # Figura 15 (NUEVA: Neon Database)
    add_figure(doc, "scratch/teoria_neon_serverless_architecture.png",
               "Figura 15. Arquitectura de base de datos Serverless desacoplada en Neon Database (Postgres).",
               "Fuente: Recuperado de Neon Serverless Postgres Documentation (https://neon.tech/docs), 2026.",
               width_inches=5.8)
    
    print("Capítulo II (Marco Teórico) construido exitosamente con 15 figuras técnicas y tablas.")

