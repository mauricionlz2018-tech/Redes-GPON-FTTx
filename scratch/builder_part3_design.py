import docx
from docx.shared import Pt, Inches, RGBColor
from scratch.common_docx import (
    add_heading_1, add_heading_2, add_heading_3, add_paragraph, add_figure, sanitize_text
)

def build_chapter_3(doc, tables_source):
    """
    Construye el Capítulo III: Diseño, Modelado y Maquetado del Sistema.
    Abarca SRS, Casos de Uso (Fig 16), lista de 27 requerimientos sin RF-, DER (Fig 17),
    diccionarios de datos (Tablas 5-11), Wireframing real parte por parte (Figs 18-21),
    y accesibilidad cromática con Adobe Color (Fig 22 y Tabla 12).
    """
    add_heading_1(doc, "CAPÍTULO III. DISEÑO, MODELADO Y MAQUETADO DEL SISTEMA")
    
    add_paragraph(doc,
        "En el presente capítulo se aborda integralmente la etapa de diseño de ingeniería, especificación formal de requerimientos, "
        "modelado topológico de planta externa, normalización de la base de datos relacional y diseño de la experiencia de usuario (UX/UI). "
        "Se presenta el análisis operativo realizado en el municipio de San José del Rincón, la formalización de casos de uso bajo estándar UML, "
        "el catálogo estructurado de requerimientos funcionales y no funcionales, el cálculo riguroso del presupuesto óptico de potencia, "
        "el modelado de la base de datos en Tercera Forma Normal (3FN), el maquetado detallado de interfaces a partir de capturas de la plataforma web "
        "en producción y la auditoría cromática de accesibilidad basada en el analizador de contraste de Adobe Color.")

    # 3.1
    add_heading_2(doc, "3.1 Recolección y levantamiento de información de planta externa")
    
    add_heading_3(doc, "3.1.1 Contexto Geográfico, Orografía y Diagnóstico Operativo en San José del Rincón")
    add_paragraph(doc,
        "El municipio de San José del Rincón, ubicado en la zona noroccidental del Estado de México, presenta una orografía montañosa "
        "con altitudes superiores a los 2,600 metros sobre el nivel del mar y una notable dispersión de comunidades rurales (tales como Ejido San José, "
        "Concepción la Venta y áreas aledañas). Históricamente, la empresa GPON TELECOM operaba mediante bitácoras físicas en papel y libretas de campo "
        "desarticuladas, provocando pérdida de trazabilidad en los hilos de fibra óptica, errores de asignación de puertos y ausencia de coordenadas satelitales fidedignas.")

    add_heading_3(doc, "3.1.2 Protocolo Metodológico y Técnicas de Levantamiento de Campo")
    add_paragraph(doc,
        "El protocolo de campo implementó técnicas de levantamiento georreferenciado directo:")
    add_paragraph(doc, "1. Georreferenciación GPS en Sitio: Inspección visual de la postería de la Comisión Federal de Electricidad (CFE), registrando coordenadas WGS84 de cada caja terminal NAP y mufa de empalme.", indent=True)
    add_paragraph(doc, "2. Auditoría Fotográfica y Ficha Técnica de Infraestructura: Captura fotográfica de la estructura interna de cajas NAP, validando relaciones de splitteo 1:8 y 1:16 y el estado físico de los acopladores SC/APC.", indent=True)
    add_paragraph(doc, "3. Mediciones de Potencia Óptica con Power Meter: Comprobación de potencia en longitudes de onda de 1310 nm y 1490 nm en derivaciones ópticas de campo.", indent=True)

    add_heading_3(doc, "3.1.3 Formulación de la Estrategia de Solución de Ingeniería")
    add_paragraph(doc,
        "A partir del diagnóstico, se proyectó el desarrollo de una plataforma web geoespacial responsiva equipada con capacidades Offline-First "
        "para garantizar la operatividad de las cuadrillas técnicas aún en zonas sin cobertura de telefonía celular, respaldada por una base de datos relacional "
        "en la nube con control de concurrencia pesimista.")

    # 3.2
    add_heading_2(doc, "3.2 Especificación formal de requerimientos de software (SRS)")
    
    add_heading_3(doc, "3.2.1 Modelado de Actores y Control de Acceso Basado en Roles (RBAC)")
    add_paragraph(doc,
        "Se definieron tres perfiles de usuario formalmente diferenciados:")
    add_paragraph(doc, "Administrador (ACT-01): Personal con atribuciones directivas, habilitado para la creación, reconfiguración y eliminación de cajas NAP, gestión de usuarios, auditoría global y parametrización de red.", indent=True)
    add_paragraph(doc, "Ingeniero de Soporte Técnico (ACT-02): Personal de gabinete y campo responsable de la atención de incidencias, supervisión cartográfica en tiempo real, liberación de puertos y descarga de reportes ejecutivos en PDF.", indent=True)
    add_paragraph(doc, "Técnico de Campo (ACT-03): Cuadrillas operativas en calle equipadas con terminales móviles, facultadas para la asignación transaccional de clientes a puertos físicos y actualización de coordenadas GPS en postes.", indent=True)

    add_heading_3(doc, "3.2.2 Diagrama General de Casos de Uso del Sistema (UML)")
    add_paragraph(doc,
        "El comportamiento funcional del sistema y las fronteras de interacción entre actores y subsistemas se modelan mediante el estándar UML:")

    # Figura 16 (UML)
    add_figure(doc, "scratch/diagrama_casos_de_uso_real.png",
               "Figura 16. Diagrama general de casos de uso del sistema bajo estándar UML.",
               "Fuente: Elaboración propia basada en los requerimientos operativos de GPON TELECOM.",
               width_inches=5.8)

    add_heading_3(doc, "3.2.3 Catálogo Formal de Requerimientos Funcionales")
    add_paragraph(doc,
        "Se estructuraron 27 requerimientos funcionales clasificados en los 8 módulos esenciales de la plataforma, omitiendo prefijos artificiales para privilegiar su claridad técnica:")

    # Requirements list
    reqs_text = [
        ("Módulo: Seguridad", [
            ("Autenticación JWT (Prioridad: Alta)", "Inicio de sesión seguro mediante correo y contraseña cifrada con emisión de token JWT firmado con vigencia de 24 horas."),
            ("Control RBAC y Bloqueo 403 (Prioridad: Alta)", "Validación de privilegios en cada endpoint HTTP, rechazando accesos no autorizados con código de estado HTTP 403."),
            ("Conmutador Demo Roles (Prioridad: Media)", "Selector en la barra superior para alternar perfiles (Admin, Soporte, Técnico) con fines de evaluación operativa."),
            ("Gestión de Cuentas (Prioridad: Baja)", "Administración de usuarios (creación, edición de contraseñas y desactivación de accesos).")
        ]),
        ("Módulo: Cabecera (Central / OLT / ODF)", [
            ("Monitoreo de Panel ODF (Prioridad: Media)", "Visualización interactiva del bastidor ODF de cabecera con indicadores de ocupación física."),
            ("Trazabilidad Puertos PON (Prioridad: Alta)", "Identificación del puerto PON emisor y cálculo de atenuación teórica acumulada."),
            ("Inventario Hilos Fibra (Prioridad: Media)", "Mapeo del código de colores oficial de 12 fibras de buffer de acuerdo con la norma Munsell / TIA-598-C.")
        ]),
        ("Módulo: Cajas NAP", [
            ("Alta de Cajas NAP (Prioridad: Alta)", "Registro de nuevas cajas con identificador normalizado, splitteo 1:8 o 1:16, zona y coordenadas GPS."),
            ("Saturación Dinámica (Prioridad: Alta)", "Cálculo en tiempo real del porcentaje de ocupación con semaforización cromática (Verde, Amarillo, Rojo)."),
            ("Búsqueda Cartográfica (Prioridad: Media)", "Localizador predictivo en mapa para enfocar cajas por identificador o coordenadas."),
            ("Edición de Metadatos (Prioridad: Media)", "Actualización del identificador, zona operativa o estado operativo de la caja."),
            ("Eliminación Controlada (Prioridad: Alta)", "Borrado lógico y físico condicionado a que la caja no tenga puertos con abonados activos."),
            ("Calibración GPS en Sitio (Prioridad: Alta)", "Ajuste de coordenadas satelitales mediante el sensor GPS del dispositivo móvil del técnico.")
        ]),
        ("Módulo: Puertos", [
            ("Matriz Visual 16 Puertos (Prioridad: Alta)", "Representación física en cuadrícula de los conectores con código semántico de colores."),
            ("Asignación Transaccional (Prioridad: Alta)", "Vinculación atómica de un puerto libre a un suscriptor mediante bloqueo pesimista ACID."),
            ("Liberación de Puertos (Prioridad: Alta)", "Desvinculación del cliente restableciendo el puerto a estado 'Libre' con bitácora de auditoría."),
            ("Mantenimiento de Puertos (Prioridad: Media)", "Marcado de puertos dañados por atenuación excesiva o rotura mecánica de conector."),
            ("Historial de Asignaciones (Prioridad: Baja)", "Registro cronológico de altas, bajas y reasignaciones en cada conector.")
        ]),
        ("Módulo: Abonados / Clientes", [
            ("Alta de Suscriptores (Prioridad: Alta)", "Captura de nombre completo, contrato, dirección, marca de ONT y dirección MAC física."),
            ("Directorio y Filtros (Prioridad: Media)", "Listado tabular de clientes con buscador por texto y filtros por fabricante de ONT."),
            ("Expediente Técnico (Prioridad: Media)", "Ficha técnica del abonado con indicación de caja NAP, puerto y potencia óptica estimada."),
            ("Modificación de Datos (Prioridad: Media)", "Actualización de domicilio, cambio de equipo ONT o reubicación de servicio.")
        ]),
        ("Módulo: Operación Offline", [
            ("Caché de Aplicación PWA (Prioridad: Alta)", "Almacenamiento en caché de la interfaz completa para arranque instantáneo sin señal."),
            ("Almacenamiento IndexedDB (Prioridad: Alta)", "Persistencia local de cajas y puertos mediante Dexie.js para consulta en campo."),
            ("Sincronización por Cola (Prioridad: Alta)", "Encolamiento de mutaciones locales y sincronización automática en ráfaga al recuperar conexión celular.")
        ]),
        ("Módulo: Reportes", [
            ("Reporte PDF en Streaming (Prioridad: Alta)", "Generación vectorial de dictámenes de saturación en memoria con PDFKit y descarga directa.")
        ]),
        ("Módulo: Asistente", [
            ("Chatbot Técnico Integrado (Prioridad: Baja)", "Asistente inteligente para resolución de dudas operativas y protocolos de planta externa.")
        ])
    ]

    for mod_title, reqs in reqs_text:
        add_paragraph(doc, "", bold_prefix=f"{mod_title}")
        for r_title, r_desc in reqs:
            add_paragraph(doc, r_desc, bold_prefix=f"- {r_title}: ", indent=True)

    add_heading_3(doc, "3.2.4 Especificación Rigurosa de Requerimientos No Funcionales (ISO/IEC 25010)")
    add_paragraph(doc,
        "Bajo el estándar internacional de calidad ISO/IEC 25010 se definieron las directrices no funcionales:")
    add_paragraph(doc, "Rendimiento y Eficiencia: El visor cartográfico debe renderizar hasta 1,000 nodos vectoriales a 60 cuadros por segundo sin degradación de memoria.", indent=True)
    add_paragraph(doc, "Concurrencia ACID: Tiempo de respuesta menor a 300 ms en la resolución transaccional de bloqueos pesimistas en base de datos.", indent=True)
    add_paragraph(doc, "Compatibilidad y Portabilidad: Ejecución fluida en navegadores modernos Chrome, Firefox, Safari y Edge bajo entornos Android, iOS y Windows.", indent=True)
    add_paragraph(doc, "Tolerancia a Fallos: El sistema debe operar en modo lectura y encolamiento de mutaciones aún con desconexión total de red.", indent=True)

    add_heading_3(doc, "3.2.5 Matriz de Trazabilidad de Permisos por Rol y Códigos HTTP")
    add_paragraph(doc,
        "La correspondencia formal entre operaciones del sistema, roles de usuario y códigos de estado HTTP se sintetiza en la Tabla 4:")

    # Table 4 (Matriz RBAC)
    if len(tables_source) > 5:
        from copy import deepcopy
        doc._body._element.append(deepcopy(tables_source[5]._element))
        p_cap_t4 = doc.add_paragraph()
        p_cap_t4.paragraph_format.space_before = Pt(4)
        p_cap_t4.paragraph_format.space_after = Pt(10)
        r1 = p_cap_t4.add_run("Tabla 4. Matriz de trazabilidad de permisos por rol (RBAC) y respuestas HTTP.\n")
        r1.font.name = 'Arial'
        r1.font.size = Pt(9)
        r1.bold = True
        r2 = p_cap_t4.add_run("Fuente: Elaboración propia a partir del estándar de seguridad NIST RBAC.")
        r2.font.name = 'Arial'
        r2.font.size = Pt(8.5)
        r2.italic = True

    # 3.3
    add_heading_2(doc, "3.3 Arquitectura topológica de la red óptica y plan de atenuación")
    
    add_heading_3(doc, "3.3.1 Estructura Jerárquica de Planta Externa Desplegada en San José del Rincón")
    add_paragraph(doc,
        "La red FTTx desplegada en San José del Rincón se estructura en cinco niveles jerárquicos continuos:")
    add_paragraph(doc, "Nivel 1 (Cabecera Central): Chasis OLT con tarjetas PON de 16 puertos Clase C+, conmutados a un ODF central de 144 hilos.", indent=True)
    add_paragraph(doc, "Nivel 2 (Red de Alimentación Troncal): Cable de fibra óptica monomodo autosoportado ADSS de 24 hilos G.652.D tendido sobre infraestructura CFE.", indent=True)
    add_paragraph(doc, "Nivel 3 (Puntos de Distribución y Mufas Torpedo): Mufas herméticas de empalme donde se alojan splitters primarios no balanceados o balanceados 1:2 y 1:4.", indent=True)
    add_paragraph(doc, "Nivel 4 (Puntos de Acceso Terminal NAP): Cajas aéreas de distribución NAP-SJR equipadas con splitters balanceados 1:8 o 1:16 con adaptadores SC/APC.", indent=True)
    add_paragraph(doc, "Nivel 5 (Acometida Drop Domiciliaria): Cable Drop plano de 1 hilo G.657.A2 tendido hacia la roseta óptica del suscriptor.", indent=True)

    add_heading_3(doc, "3.3.2 Cálculo Matemático Formal del Presupuesto Óptico de Potencia (Optical Power Budget)")
    add_paragraph(doc,
        "Para una caja terminal NAP típica ubicada a 6.8 kilómetros de la central ODF en Concepción la Venta, se calcularon las pérdidas matemáticas:")
    add_paragraph(doc, "Pérdida por longitud de fibra: 6.8 km * 0.35 dB/km = 2.38 dB", indent=True)
    add_paragraph(doc, "Pérdida por empalmes de fusión (6 empalmes * 0.05 dB): 0.30 dB", indent=True)
    add_paragraph(doc, "Pérdida por conectores SC/APC (4 pares * 0.25 dB): 1.00 dB", indent=True)
    add_paragraph(doc, "Pérdida por splitter primario 1:2: 3.70 dB", indent=True)
    add_paragraph(doc, "Pérdida por splitter secundario 1:16 en caja NAP: 13.80 dB", indent=True)
    add_paragraph(doc, "Margen de degradación por mantenimiento preventivo: 2.00 dB", indent=True)
    add_paragraph(doc,
        "Atenuación Teórica Total = 2.38 + 0.30 + 1.00 + 3.70 + 13.80 + 2.00 = 23.18 dB",
        bold_prefix="Resultado: ", indent=True)
    add_paragraph(doc,
        "Considerando una potencia de emisión OLT de +4.0 dBm (Clase C+), la potencia estimada que alcanza el fotodiodo receptor de la ONT es:")
    add_paragraph(doc,
        "Potencia Recibida (Rx) = +4.0 dBm - 23.18 dB = -19.18 dBm",
        bold_prefix="Potencia Rx Estimada: ", indent=True)
    add_paragraph(doc,
        "El valor de -19.18 dBm se ubica plenamente dentro del intervalo óptimo de operación (-15 dBm a -24 dBm), "
        "dejando un margen de seguridad de más de 7.8 dB respecto a la sensibilidad de corte de la ONT (-27.0 dBm).")

    # 3.4
    add_heading_2(doc, "3.4 Modelado conceptual, lógico y físico de la base de datos relacional")
    
    add_heading_3(doc, "3.4.1 Justificación del Motor PostgreSQL y Proceso de Normalización en 3FN")
    add_paragraph(doc,
        "El esquema relacional fue diseñado siguiendo rigurosamente las reglas de normalización de Boyce-Codd y Tercera Forma Normal (3FN), "
        "eliminando dependencias transitivas y parciales. Se utilizó PostgreSQL por su robustez en el aislamiento transaccional y su compatibilidad nativa con UUIDs.")

    add_heading_3(doc, "3.4.2 Diagrama Entidad-Relación (DER) del Sistema")
    add_paragraph(doc,
        "El modelo relacional interconecta siete entidades principales organizadas jerárquicamente:")

    # Figura 17 (DER)
    add_figure(doc, "scratch/figures_named/image17.png",
               "Figura 17. Diagrama Entidad-Relación (DER) del sistema de inventario GPON en PostgreSQL.",
               "Fuente: Elaboración propia del esquema físico relacional en PostgreSQL.",
               width_inches=5.8)

    add_heading_3(doc, "3.4.3 Diccionario de Datos Físico del Sistema")
    add_paragraph(doc,
        "A continuación se detallan las tablas físicas de la base de datos con sus respectivos tipos de datos, restricciones de no nulidad y claves foráneas:")

    # Tables 5 to 11 (Data Dictionaries)
    dict_tables_info = [
        ("Tabla 5. Diccionario de datos físico: Entidad Users (Usuarios y roles).", 6),
        ("Tabla 6. Diccionario de datos físico: Entidad OdfPanels (Paneles ODF de cabecera).", 7),
        ("Tabla 7. Diccionario de datos físico: Entidad PonPorts (Puertos PON de OLT).", 8),
        ("Tabla 8. Diccionario de datos físico: Entidad FiberThreads (Hilos de fibra óptica troncal).", 9),
        ("Tabla 9. Diccionario de datos físico: Entidad NapBoxes (Cajas terminales NAP).", 10),
        ("Tabla 10. Diccionario de datos físico: Entidad NapPorts (Puertos de derivación de cajas NAP).", 11),
        ("Tabla 11. Diccionario de datos físico: Entidad Clients (Abonados y parámetros ópticos de potencia).", 12)
    ]
    for cap_title, tbl_idx in dict_tables_info:
        if len(tables_source) > tbl_idx:
            from copy import deepcopy
            doc._body._element.append(deepcopy(tables_source[tbl_idx]._element))
            p_cap = doc.add_paragraph()
            p_cap.paragraph_format.space_before = Pt(4)
            p_cap.paragraph_format.space_after = Pt(10)
            r1 = p_cap.add_run(cap_title + "\n")
            r1.font.name = 'Arial'
            r1.font.size = Pt(9)
            r1.bold = True
            r2 = p_cap.add_run("Fuente: Elaboración propia del esquema de base de datos en PostgreSQL 16.")
            r2.font.name = 'Arial'
            r2.font.size = Pt(8.5)
            r2.italic = True

    # 3.5
    add_heading_2(doc, "3.5 Diseño centrado en el usuario, arquitectura de información y maquetado de pantallas")
    
    add_heading_3(doc, "3.5.1 Principios de Diseño Centrado en el Usuario aplicados al trabajo de campo")
    add_paragraph(doc,
        "La interfaz fue diseñada priorizando la ergonomía cognitiva y visual del personal en campo. "
        "En lugar de tablas densas con datos dispersos, la interfaz presenta una arquitectura limpia 'parte por parte' con jerarquía clara y elementos accesibles con un solo toque.")

    add_heading_3(doc, "3.5.2 Maquetado detallado de interfaces a partir de capturas de la plataforma")
    add_paragraph(doc,
        "Se documentan individualmente las pantallas y componentes visuales desplegados en producción en la plataforma web oficial "
        "(https://redes-gpon-ft-txs.vercel.app/mapa):")

    add_paragraph(doc, "1. Visor Cartográfico Geoespacial (Leaflet): Presenta la visualización interactiva del mapa con iconos circulares para cajas NAP, "
                      "badges con indicador de puertos ocupados (ej. '1/8') y capas conmutables de satélite y calles.")
    # Figura 18 (Mapa)
    add_figure(doc, "scratch/real_gis_map.png",
               "Figura 18. Visor cartográfico geoespacial interactivo y localización de cajas NAP.",
               "Fuente: Plataforma GPON TELECOM (https://redes-gpon-ft-txs.vercel.app/mapa).",
               width_inches=5.8)

    add_paragraph(doc, "2. Matriz de Distribución Física de 16 Puertos: Despliega una cuadrícula que simula fielmente la cara frontal de los conectores "
                      "en la caja NAP con convención cromática semántica: Verde para puertos libres, Azul para ocupados y Ámbar para reservados.")
    # Figura 19 (Matriz)
    add_figure(doc, "scratch/real_chassis_matrix.png",
               "Figura 19. Matriz de distribución física FTTx de 16 puertos y código semántico de colores.",
               "Fuente: Plataforma GPON TELECOM (https://redes-gpon-ft-txs.vercel.app/mapa).",
               width_inches=5.8)

    add_paragraph(doc, "3. Interfaz Modal de Registro y Despliegue de Cajas NAP: Modal reactivo que permite ingresar el identificador normalizado (ej. 'NAP-SJR-27'), "
                      "seleccionar la zona geográfica, elegir la relación de splitteo (1:8 o 1:16) y registrar coordenadas GPS precisas con validación inmediata.")
    # Figura 20 (Modal NAP)
    add_figure(doc, "scratch/real_modal_nap.png",
               "Figura 20. Interfaz modal para el registro, despliegue y geolocalización GPS de cajas NAP.",
               "Fuente: Plataforma GPON TELECOM (https://redes-gpon-ft-txs.vercel.app/mapa).",
               width_inches=5.4)

    add_paragraph(doc, "4. Directorio General de Abonados FTTx: Padrón tabular con filtros dinámicos por marca de ONT, identificador de contrato (ej. 'CLI-64022'), "
                      "nombre del cliente, dirección, caja NAP conectada y lectura de potencia óptica recibida en dBm.")
    # Figura 21 (Clientes)
    add_figure(doc, "scratch/real_clients_table.png",
               "Figura 21. Directorio general de abonados FTTx y parámetros de potencia óptica de recepción.",
               "Fuente: Plataforma GPON TELECOM (https://redes-gpon-ft-txs.vercel.app/mapa).",
               width_inches=5.8)

    # 3.6
    add_heading_2(doc, "3.6 Definición de la paleta cromática institucional y evaluación de accesibilidad con Adobe Color")
    
    add_heading_3(doc, "3.6.1 Especificación de la Paleta Cromática Institucional")
    add_paragraph(doc,
        "La paleta combina el azul corporativo de GPON TELECOM (#0284C7) con tonos pizarra oscuros (#0F172A) para fondos y bordes, "
        "y un código semántico universal para puertos e indicadores: Verde Esmeralda (#10B981) para libre, Azul Zafiro (#0284C7) para ocupado, "
        "Ámbar (#F59E0B) para reservado y Rojo (#EF4444) para estados críticos o puertos dañados.")

    add_heading_3(doc, "3.6.2 Evaluación experimental en Adobe Color Contrast Analyzer y cumplimiento WCAG 2.1")
    add_paragraph(doc,
        "Para verificar la legibilidad bajo condiciones adversas de iluminación solar en campo, se auditaron los colores en la herramienta "
        "oficial Adobe Color Contrast Analyzer (https://color.adobe.com/create/color-contrast-analyzer). "
        "Cada muestra fue evaluada contra fondo blanco (#FFFFFF) y fondo oscuro (#0F172A), garantizando ratios superiores al estándar WCAG 2.1 AA y AAA.")

    # Figura 22 (Adobe Color)
    add_figure(doc, "scratch/adobe_color_contrast_analyzer.png",
               "Figura 22. Evaluación de contraste en Adobe Color Contrast Analyzer y cumplimiento WCAG 2.1.",
               "Fuente: Recuperado de Adobe Color Contrast Analyzer (https://color.adobe.com/create/color-contrast-analyzer), 2026.",
               width_inches=5.8)

    # Table 12 (Tabla de contrastes Adobe Color)
    if len(tables_source) > 13:
        from copy import deepcopy
        doc._body._element.append(deepcopy(tables_source[13]._element))
        p_cap_t12 = doc.add_paragraph()
        p_cap_t12.paragraph_format.space_before = Pt(4)
        p_cap_t12.paragraph_format.space_after = Pt(10)
        r1 = p_cap_t12.add_run("Tabla 12. Paleta cromática institucional y especificación semántica de colores (Adobe Color y WCAG 2.1).\n")
        r1.font.name = 'Arial'
        r1.font.size = Pt(9)
        r1.bold = True
        r2 = p_cap_t12.add_run("Fuente: Elaboración propia a partir de auditoría en Adobe Color Contrast Analyzer.")
        r2.font.name = 'Arial'
        r2.font.size = Pt(8.5)
        r2.italic = True

    print("Capítulo III (Diseño, Modelado y Maquetado) construido exitosamente.")

