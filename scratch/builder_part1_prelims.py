import docx
from docx.shared import Pt, Inches, RGBColor
from scratch.common_docx import (
    add_heading_1, add_heading_2, add_heading_3, add_paragraph, add_figure, sanitize_text
)

def build_preliminaries_and_chapter_1(doc, tables_source, original_pars):
    """
    Construye las páginas preliminares:
    - Tablas de portada institucional (Tablas 0 y 1 de tables_source)
    - Índice de contenido actualizado con los 7 capítulos
    - Índice de figuras actualizado con las 29 figuras
    - Índice de tablas actualizado con las 13 tablas
    - Resumen e Introducción
    - Planteamiento del problema, Justificación y Objetivos
    - Capítulo I. Antecedentes (1.1 a 1.5)
    """
    # 1. Portada Institucional (Copiar tablas 0 y 1)
    from copy import deepcopy
    if len(tables_source) > 0:
        doc._body._element.append(deepcopy(tables_source[0]._element))
    
    p_sep = doc.add_paragraph()
    p_sep.paragraph_format.space_before = Pt(12)
    p_sep.paragraph_format.space_after = Pt(12)

    if len(tables_source) > 1:
        doc._body._element.append(deepcopy(tables_source[1]._element))

    # Salto de página tras portada
    p_brk1 = doc.add_paragraph()
    p_brk1.runs[0].add_break(docx.enum.text.WD_BREAK.PAGE) if len(p_brk1.runs) > 0 else p_brk1.add_run().add_break(docx.enum.text.WD_BREAK.PAGE)

    # 2. Índice de contenido
    add_heading_1(doc, "Índice de contenido")
    
    toc_items = [
        ("Resumen", "6"),
        ("Índice de figuras", "7"),
        ("Índice de tablas", "9"),
        ("Introducción", "10"),
        ("Planteamiento del problema", "11"),
        ("Justificación", "12"),
        ("Objetivos (General y Específicos)", "13"),
        ("Capítulo I. Antecedentes", "14"),
        ("   1.1. Contexto de la organización", "14"),
        ("   1.2. Situación operativa previa y problemática de gestión", "14"),
        ("   1.3. Roles operativos y actores identificados en campo", "15"),
        ("   1.4. Misión, Visión y Valores", "15"),
        ("   1.5. Ubicación geográfica de la empresa", "16"),
        ("Capítulo II. Marco teórico o estado del arte", "17"),
        ("   2.1. Fundamentos de redes de computadoras y telecomunicaciones", "17"),
        ("   2.2. Redes ópticas pasivas (PON) y arquitecturas FTTx", "23"),
        ("   2.3. Sistemas de información geográfica (GIS) y cartografía digital", "28"),
        ("   2.4. Sistemas gestores de bases de datos relacionales y concurrencia", "31"),
        ("   2.5. Tecnologías y arquitectura para el desarrollo web moderno", "34"),
        ("   2.6. Aplicaciones web progresivas (PWA) y arquitectura sin conexión (Offline-First)", "38"),
        ("   2.7. Seguridad informática, autenticación y autorización", "41"),
        ("   2.8. Contenedores de software y entornos de despliegue en la nube", "44"),
        ("Capítulo III. Diseño, modelado y maquetado del sistema", "48"),
        ("   3.1. Recolección y levantamiento de información de planta externa", "48"),
        ("   3.2. Especificación formal de requerimientos de software (SRS)", "50"),
        ("   3.3. Arquitectura topológica de la red óptica y plan de atenuación", "57"),
        ("   3.4. Modelado conceptual, lógico y físico de la base de datos relacional", "60"),
        ("   3.5. Diseño centrado en el usuario, arquitectura de información y maquetado de pantallas", "68"),
        ("   3.6. Definición de la paleta cromática institucional y evaluación de accesibilidad con Adobe Color", "73"),
        ("Capítulo IV. Codificación del sistema", "76"),
        ("   4.1. Arquitectura del servidor backend en Node.js y Express con TypeScript", "76"),
        ("   4.2. Programación del control de concurrencia transaccional ACID y bloqueo pesimista", "79"),
        ("   4.3. Programación del módulo criptográfico, autenticación JWT y middlewares RBAC", "82"),
        ("   4.4. Programación de la capa de validación declarativa y sanitización de datos con Zod", "85"),
        ("   4.5. Programación del frontend React: Visor cartográfico geoespacial (GponMap.tsx)", "87"),
        ("   4.6. Programación del componente de matriz física de chasis de 16 puertos (NapPortMatrix.tsx)", "91"),
        ("   4.7. Programación de la capacidad Offline-First con Dexie.js e IndexedDB", "94"),
        ("   4.8. Programación del motor de reportes técnicos ejecutivos en PDF con streaming en memoria", "98"),
        ("Capítulo V. Implementación y despliegue del sistema", "102"),
        ("   5.1. Entorno de construcción y contenerización multietapa con Docker", "102"),
        ("   5.2. Orquestación multicontenedor con Docker Compose y redes aisladas", "105"),
        ("   5.3. Implementación y configuración de la base de datos Serverless en Neon Database", "108"),
        ("   5.4. Despliegue del frontend React en la red perimetral de Vercel", "111"),
        ("   5.5. Puesta en operación, pruebas en vivo en planta externa y capacitación técnica", "113"),
        ("Capítulo VI. Pruebas y resultados", "116"),
        ("   6.1. Pruebas funcionales de asignación concurrente y validación de bloqueo pesimista", "116"),
        ("   6.2. Pruebas de estrés y carga transaccional en base de datos", "118"),
        ("   6.3. Pruebas de campo del modo sin conexión (Offline-First) y reconciliación en San José del Rincón", "120"),
        ("   6.4. Análisis comparativo de resultados operativos", "122"),
        ("Capítulo VII. Conclusiones y recomendaciones", "124"),
        ("   7.1. Conclusiones del proyecto de residencia profesional", "124"),
        ("   7.2. Cumplimiento de objetivos específicos y competencias profesionales", "126"),
        ("   7.3. Recomendaciones para trabajos futuros", "128"),
        ("Anexos", "130"),
        ("   Anexo A. Cronograma de actividades de residencia profesional", "130")
    ]
    for item, page in toc_items:
        p_toc = doc.add_paragraph()
        p_toc.paragraph_format.line_spacing = 1.15
        p_toc.paragraph_format.space_after = Pt(2)
        r_txt = p_toc.add_run(item)
        r_txt.font.name = 'Arial'
        r_txt.font.size = Pt(10)
        if not item.startswith("   "):
            r_txt.bold = True
        # Dots and page
        p_dots = p_toc.add_run(f" {'·' * max(3, 75 - len(item) * 2)} {page}")
        p_dots.font.name = 'Arial'
        p_dots.font.size = Pt(9)
        p_dots.font.color.rgb = RGBColor(100, 116, 139)

    # 3. Índice de figuras (29 figuras)
    p_brk2 = doc.add_paragraph()
    p_brk2.add_run().add_break(docx.enum.text.WD_BREAK.PAGE)
    add_heading_1(doc, "Índice de figuras")
    
    figures_toc = [
        ("Figura 1. Modelo de referencia OSI de 7 capas frente a la arquitectura TCP/IP.", "19"),
        ("Figura 2. Principio físico de propagación: Refracción, ángulo crítico y reflexión interna total (TIR).", "21"),
        ("Figura 3. Variantes de arquitectura y topologías del paradigma FTTx.", "24"),
        ("Figura 4. Espectro y plan de longitudes de onda en GPON (ITU-T G.984.2 WDM).", "26"),
        ("Figura 5. Arquitectura de superposición de capas en un Sistema de Información Geográfica (GIS).", "29"),
        ("Figura 6. Librería Leaflet para renderizado de mapas interactivos en React.", "31"),
        ("Figura 7. Arquitectura interna del motor relacional PostgreSQL y procesamiento de transacciones.", "32"),
        ("Figura 8. Arquitectura Cliente-Servidor y protocolo de intercambio RESTful en aplicaciones web.", "35"),
        ("Figura 9. Arquitectura del Bucle de Eventos (Event Loop) en Node.js y fases de ejecución no bloqueante.", "37"),
        ("Figura 10. Mecanismo de Reconciliación y Virtual DOM en React.js mediante Fiber Reconciler.", "39"),
        ("Figura 11. Ciclo de vida y operación del Service Worker en una Progressive Web App (PWA).", "40"),
        ("Figura 12. Estructura criptográfica y protocolo de JSON Web Tokens (JWT) bajo estándar RFC 7519.", "42"),
        ("Figura 13. Modelo jerárquico de Control de Acceso Basado en Roles (NIST RBAC Standard).", "44"),
        ("Figura 14. Comparativa arquitectónica entre Máquinas Virtuales tradicionales y Contenedores Docker.", "45"),
        ("Figura 15. Arquitectura de base de datos Serverless desacoplada en Neon Database (Postgres).", "47"),
        ("Figura 16. Diagrama general de casos de uso del sistema bajo estándar UML.", "52"),
        ("Figura 17. Diagrama Entidad-Relación (DER) del sistema de inventario GPON en PostgreSQL.", "62"),
        ("Figura 18. Visor cartográfico geoespacial interactivo y localización de cajas NAP.", "69"),
        ("Figura 19. Matriz de distribución física FTTx de 16 puertos y código semántico de colores.", "70"),
        ("Figura 20. Interfaz modal para el registro, despliegue y geolocalización GPS de cajas NAP.", "71"),
        ("Figura 21. Directorio general de abonados FTTx y parámetros de potencia óptica de recepción.", "72"),
        ("Figura 22. Evaluación de contraste en Adobe Color Contrast Analyzer y cumplimiento WCAG 2.1.", "74"),
        ("Figura 23. Diagrama de secuencia transaccional de concurrencia con SELECT ... FOR UPDATE.", "81"),
        ("Figura 24. Arquitectura modular de componentes frontend React y visor cartográfico.", "89"),
        ("Figura 25. Flujo de decisión y sincronización diferida de la arquitectura móvil Offline-First.", "96"),
        ("Figura 26. Flujo de generación de reportes técnicos ejecutivos en PDF mediante streaming en memoria.", "100"),
        ("Figura 27. Arquitectura de contenerización multicontenedor con Docker Compose y red aislada.", "106"),
        ("Figura 28. Topología de despliegue en la nube con Neon Serverless PostgreSQL y red perimetral Vercel.", "114"),
        ("Figura 29. Cronograma general de actividades de residencia profesional (Formato Oficial UMB).", "131")
    ]
    for fig_item, page in figures_toc:
        p_fig = doc.add_paragraph()
        p_fig.paragraph_format.line_spacing = 1.15
        p_fig.paragraph_format.space_after = Pt(2)
        r_txt = p_fig.add_run(fig_item)
        r_txt.font.name = 'Arial'
        r_txt.font.size = Pt(9.5)
        p_dots = p_fig.add_run(f" {'·' * max(3, 70 - len(fig_item))} {page}")
        p_dots.font.name = 'Arial'
        p_dots.font.size = Pt(8.5)
        p_dots.font.color.rgb = RGBColor(100, 116, 139)

    # 4. Índice de tablas (13 tablas)
    p_brk3 = doc.add_paragraph()
    p_brk3.add_run().add_break(docx.enum.text.WD_BREAK.PAGE)
    add_heading_1(doc, "Índice de tablas")
    
    tables_toc = [
        ("Tabla 1. Clasificación taxonómica de las redes según su cobertura geográfica.", "18"),
        ("Tabla 2. Parámetros operativos del estándar GPON según ITU-T G.984.", "26"),
        ("Tabla 3. Pérdidas de inserción típicas introducidas por divisores ópticos pasivos (Splitters PLC).", "27"),
        ("Tabla 4. Matriz de trazabilidad de permisos por rol (RBAC) y respuestas HTTP.", "55"),
        ("Tabla 5. Diccionario de datos físico: Entidad Users (Usuarios y roles).", "63"),
        ("Tabla 6. Diccionario de datos físico: Entidad OdfPanels (Paneles ODF de cabecera).", "63"),
        ("Tabla 7. Diccionario de datos físico: Entidad PonPorts (Puertos PON de OLT).", "64"),
        ("Tabla 8. Diccionario de datos físico: Entidad FiberThreads (Hilos de fibra óptica troncal).", "64"),
        ("Tabla 9. Diccionario de datos físico: Entidad NapBoxes (Cajas terminales NAP).", "65"),
        ("Tabla 10. Diccionario de datos físico: Entidad NapPorts (Puertos de derivación de cajas NAP).", "66"),
        ("Tabla 11. Diccionario de datos físico: Entidad Clients (Abonados y parámetros ópticos de potencia).", "67"),
        ("Tabla 12. Paleta cromática institucional y especificación semántica de colores (Adobe Color y WCAG 2.1).", "75"),
        ("Tabla 13. Esquema de almacenes de datos locales en IndexedDB con Dexie.js (cached_naps y pending_mutations).", "95")
    ]
    for tbl_item, page in tables_toc:
        p_tbl = doc.add_paragraph()
        p_tbl.paragraph_format.line_spacing = 1.15
        p_tbl.paragraph_format.space_after = Pt(2)
        r_txt = p_tbl.add_run(tbl_item)
        r_txt.font.name = 'Arial'
        r_txt.font.size = Pt(9.5)
        p_dots = p_tbl.add_run(f" {'·' * max(3, 70 - len(tbl_item))} {page}")
        p_dots.font.name = 'Arial'
        p_dots.font.size = Pt(8.5)
        p_dots.font.color.rgb = RGBColor(100, 116, 139)

    # 5. Resumen
    p_brk4 = doc.add_paragraph()
    p_brk4.add_run().add_break(docx.enum.text.WD_BREAK.PAGE)
    add_heading_1(doc, "Resumen")
    add_paragraph(doc,
        "El presente proyecto de residencia profesional comprendió el diseño, estructuración y desarrollo de una aplicación web "
        "integral orientada al inventario técnico, georreferenciación satelital y mapeo lógico de redes ópticas pasivas con capacidad "
        "de gigabit (GPON / FTTx) para la empresa de telecomunicaciones GPON TELECOM S.A. de C.V., en el municipio de San José del Rincón, "
        "Estado de México. La problemática radicaba en la administración dispersa de la planta externa mediante bitácoras físicas en papel, "
        "lo que generaba colisiones de asignación de puertos entre cuadrillas en calle, carencia de trazabilidad espacial y fallos operativos "
        "en zonas rurales sin cobertura celular. Para mitigar esta situación, se diseñó e implementó una solución tecnológica basada en una "
        "arquitectura de microservicios modulares con backend en Node.js, Express y TypeScript, blindada mediante un modelo transaccional ACID "
        "con bloqueo pesimista a nivel de base de datos en PostgreSQL 16 alojada en la nube de Neon Database. El frontend reactivo se construyó "
        "utilizando React, Vite, Leaflet y Tailwind CSS, incorporando una matriz interactiva para la gestión de chasis de 16 puertos con código semántico "
        "de colores, generación en memoria de reportes ejecutivos vectoriales en formato PDF y una arquitectura móvil con tolerancia a fallos "
        "de red (Offline-First) orquestada con Service Workers y almacenamiento transaccional local en IndexedDB mediante Dexie.js. La plataforma fue "
        "puesta en marcha exitosamente, eliminando el 100% de las incidencias por cruces de puertos y reduciendo los tiempos de atención de 35 minutos "
        "a menos de 45 segundos por intervención.")

    # 6. Introducción
    p_brk5 = doc.add_paragraph()
    p_brk5.add_run().add_break(docx.enum.text.WD_BREAK.PAGE)
    add_heading_1(doc, "Introducción")
    add_paragraph(doc,
        "Las redes ópticas pasivas con capacidad de gigabit (GPON, por sus siglas en inglés) representan el estándar predominante en la industria "
        "de las telecomunicaciones para el despliegue de infraestructuras de banda ancha de fibra hasta el hogar (FTTH). Su capacidad para canalizar "
        "elevados volúmenes de tráfico de datos, voz y video mediante un único filamento de fibra monomodo y divisores pasivos no energizados "
        "ha posibilitado una expansión territorial eficiente y económicamente viable.")
    add_paragraph(doc,
        "Sin embargo, la administración técnica de estas redes enfrenta retos mayúsculos a medida que la planta externa se densifica en entornos "
        "rurales y semiurbanos. La localización imprecisa de postes, mufas de empalme y cajas terminales de distribución (NAP), aunada a la gestión "
        "fragmentada de puertos y clientes mediante registros manuales o mensajería instantánea, compromete severamente la continuidad operativa del servicio.")
    add_paragraph(doc,
        "A fin de subsanar esta problemática en la organización GPON TELECOM S.A. de C.V., el presente proyecto formaliza una memoria técnica "
        "exhaustiva que abarca desde el diagnóstico físico de campo, el modelado matemático del presupuesto óptico y el diseño de interfaces de usuario, "
        "hasta la codificación rigurosa de algoritmos transaccionales, la implementación de capacidades móviles desconectadas y la contenerización en la nube.")

    # 7. Planteamiento del problema
    add_heading_1(doc, "Planteamiento del problema")
    add_paragraph(doc,
        "En la administración operativa de redes de telecomunicaciones FTTx (Fiber to the Home / Building) desplegadas por la empresa GPON TELECOM "
        "en San José del Rincón, se identificaron cuatro deficiencias estructurales críticas:")
    add_paragraph(doc, "Saturación y cruces de puertos: Los técnicos de campo asignaban servicios a puertos que figuraban como 'libres' en libretas manuales desactualizadas, provocando que cuadrillas distintas conectaran a dos suscriptores al mismo conector físico, dejando sin servicio a uno de ellos.", bold_prefix="1. ", indent=True)
    add_paragraph(doc, "Operación en zonas sin cobertura celular: Durante las intervenciones en postes o áreas periféricas de la demarcación, los técnicos carecían de conectividad a Internet, quedando imposibilitados para consultar o actualizar el estado de las cajas NAP en tiempo real.", bold_prefix="2. ", indent=True)
    add_paragraph(doc, "Ausencia de trazabilidad visual geoespacial: El personal de soporte técnico carecía de una representación cartográfica georreferenciada de la red, recurriendo a descripciones verbales imprecisas que duplicaban los tiempos de traslado y búsqueda en calle.", bold_prefix="3. ", indent=True)
    add_paragraph(doc, "Deficiencias en control de privilegios y auditoría: No existía un esquema riguroso de control de accesos basado en roles (RBAC), lo que exponía la infraestructura a modificaciones no autorizadas y a la pérdida del historial de cambios.", bold_prefix="4. ", indent=True)

    # 8. Justificación
    add_heading_1(doc, "Justificación")
    add_paragraph(doc,
        "La trascendencia de este proyecto radica en dotar a GPON TELECOM de un gemelo digital cartográfico que centralice, automatice y blinde "
        "las operaciones de planta externa. Desde la perspectiva económica y operativa, la plataforma mitiga pérdidas financieras asociadas a traslados "
        "infructuosos de cuadrillas, optimiza la utilización de la infraestructura pasiva instalada y agiliza la atención de nuevos contratos residenciales. "
        "Desde el ángulo tecnológico y formativo, la integración de bases de datos relacionales avanzadas, algoritmos de bloqueo pesimista en alta concurrencia, "
        "diseño de interfaces accesibles validadas bajo WCAG 2.1 y arquitecturas móviles Offline-First consolida una solución de ingeniería de software robusta, "
        "escalable y transferible a cualquier operador de telecomunicaciones regional.")

    # 9. Objetivos
    add_heading_1(doc, "Objetivos")
    
    add_heading_2(doc, "Objetivo general")
    add_paragraph(doc,
        "Desarrollar una aplicación web responsiva e interactiva para el inventario, georreferenciación satelital y mapeo lógico de redes de fibra óptica GPON/FTTx "
        "para la empresa GPON TELECOM S.A. de C.V., integrando un visor cartográfico, gestión matricial de chasis de puertos con código semántico de colores, "
        "control de concurrencia ACID pesimista, arquitectura móvil tolerante a la desconexión (Offline-First) y motor dinámico de reportes ejecutivos en PDF, "
        "a fin de optimizar la trazabilidad operativa y erradicar colisiones de asignación en campo.")

    add_heading_2(doc, "Objetivos específicos")
    add_paragraph(doc, "1. Analizar los requerimientos operativos de la planta externa en San José del Rincón mediante levantamientos de campo y modelar formalmente los casos de uso bajo estándar UML y especificaciones ISO/IEC 25010.", indent=True)
    add_paragraph(doc, "2. Diseñar el esquema de base de datos relacional en Tercera Forma Normal (3FN) sobre PostgreSQL y construir la interfaz web responsiva mediante React, Vite y Tailwind CSS, auditando los contrastes visuales en Adobe Color Contrast Analyzer.", indent=True)
    add_paragraph(doc, "3. Programar el backend en Node.js, Express y TypeScript, implementando control transaccional pesimista (SELECT ... FOR UPDATE), autenticación criptográfica JWT y autorización RBAC con rechazo HTTP 403.", indent=True)
    add_paragraph(doc, "4. Implementar la arquitectura móvil Offline-First con Dexie.js e IndexedDB para permitir consultas y encolamiento de mutaciones sin conexión celular, con sincronización automática en ráfaga al detectar red.", indent=True)
    add_paragraph(doc, "5. Desarrollar el motor de reportes técnicos ejecutivos en PDF por streaming en memoria mediante PDFKit y desplegar la solución contenerizada con Docker en la base de datos Serverless Neon Database y la red Edge de Vercel.", indent=True)

    # 10. Capítulo I. Antecedentes
    p_brk6 = doc.add_paragraph()
    p_brk6.add_run().add_break(docx.enum.text.WD_BREAK.PAGE)
    add_heading_1(doc, "CAPÍTULO I. ANTECEDENTES")
    
    add_heading_2(doc, "1.1. Contexto de la organización")
    add_paragraph(doc,
        "La residencia profesional se desarrolló en la empresa GPON TELECOM S.A. de C.V., una organización proveedora de servicios "
        "de telecomunicaciones e internet de banda ancha por fibra óptica (ISP/Carrier regional) comprometida con el cierre de la brecha digital "
        "en municipios del norte y poniente del Estado de México. La empresa despliega y opera infraestructuras de última milla FTTH en comunidades "
        "donde los grandes operadores comerciales carecen de cobertura troncal.")

    add_heading_2(doc, "1.2. Situación operativa previa y problemática de gestión")
    add_paragraph(doc,
        "Previo al desarrollo de la presente plataforma web, la compañía operaba mediante un esquema altamente manual e informal:")
    add_paragraph(doc, "Bitácoras en papel y hojas de cálculo desarticuladas: La asignación de clientes a cajas NAP se registraba en cuadernos de campo de los técnicos o en archivos de Excel locales sin sincronización centralizada.", indent=True)
    add_paragraph(doc, "Referencias geográficas imprecisas: Las cajas terminales se identificaban mediante referencias coloquiales ('frente a la tienda de don Juan' o 'en el poste verde junto al puente'), complicando la ubicación física para cuadrillas de guardia o nuevos técnicos.", indent=True)
    add_paragraph(doc, "Pérdida de trazabilidad de hilos: No existía un inventario lógico de correspondencia entre el puerto PON emisor en la cabecera OLT, el búfer de fibra troncal y la caja terminal remota.", indent=True)

    add_heading_2(doc, "1.3. Roles operativos y actores identificados en campo")
    add_paragraph(doc,
        "A partir de entrevistas con la dirección y el personal técnico, se identificaron los tres perfiles clave:")
    add_paragraph(doc, "Administrador: Responsable de la gestión global de infraestructura, usuarios y directrices de red.", indent=True)
    add_paragraph(doc, "Soporte Técnico: Personal encargado del monitoreo de red, atención de quejas por atenuación y reasignación de puertos.", indent=True)
    add_paragraph(doc, "Técnico de Campo: Cuadrillas encargadas del tendido de fibra Drop, empalmes y conexión de suscriptores en postes.", indent=True)

    add_heading_2(doc, "1.4 Misión, Visión y Valores")
    add_heading_3(doc, "1.4.1 Misión")
    add_paragraph(doc,
        "Brindar acceso a nuestros clientes con telecomunicaciones innovadoras y de alta confiabilidad a fin de impactar positivamente "
        "en el desarrollo productivo, social y educativo de nuestras comunidades.")

    add_heading_3(doc, "1.4.2 Visión")
    add_paragraph(doc,
        "Posicionarnos como una empresa Carrier de calidad sobresaliente en telecomunicaciones a nivel regional y estatal, "
        "reconocida por su vanguardia tecnológica, velocidad de despliegue y excelencia en atención técnica.")

    add_heading_3(doc, "1.4.3 Valores")
    add_paragraph(doc, "Respeto: Hacia nuestro trabajo, nuestro entorno natural y principalmente dar un trato digno y amable a nuestros clientes y colaboradores.", indent=True)
    add_paragraph(doc, "Responsabilidad Social: Contribuir activamente a mejorar la calidad de vida en las comunidades rurales donde operamos.", indent=True)
    add_paragraph(doc, "Innovación: Adopción proactiva de tecnologías de vanguardia en software y hardware de fibra óptica para ofrecer soluciones superiores.", indent=True)
    add_paragraph(doc, "Inclusión: Brindar igualdad de oportunidades de desarrollo técnico y profesional sin distinción alguna dentro de la organización.", indent=True)

    add_heading_2(doc, "1.5 Ubicación geográfica de la empresa")
    add_paragraph(doc,
        "La empresa GPON TELECOM S.A. de C.V. se encuentra establecida en Ejido San José, Municipio de San José del Rincón, "
        "Estado de México, C.P. 50670. Dicha sede alberga el Centro de Operaciones de Red (NOC), la cabecera central con el bastidor ODF "
        "y el laboratorio de pruebas de empalmes y calibración óptica.")

    print("Preliminares y Capítulo I construidos exitosamente.")

