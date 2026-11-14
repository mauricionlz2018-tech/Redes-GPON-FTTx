# ACTA DE CONFORMIDAD Y APROBACIÓN DE REQUERIMIENTOS DE SOFTWARE (SRS)

**FOLIO OFICIAL:** `ACTA-CONF-SRS-2026-001`  
**PROYECTO:** Sistema de Inventario y Mapeo Lógico de Redes GPON / FTTx  
**ORGANIZACIÓN RECEPTORA:** GPON TELECOM S.A. de C.V.  
**INSTITUCIÓN EDUCATIVA:** Universidad Mexiquense del Bicentenario No aplica UES San José del Rincón  
**PROGRAMA ACADÉMICO:** Residencia Profesional No aplica Ingeniería en Sistemas Computacionales  
**FECHA DE EMISIÓN:** 13 de Octubre de 2026  
**LUGAR DE CONCERTACIÓN:** San José del Rincón, Estado de México  

---

## 1. DATOS GENERALES Y COMPARECIENTES

En la sede de operaciones de **GPON TELECOM S.A. de C.V.**, ubicada en el Municipio de San José del Rincón, Estado de México, siendo las 10:00 horas del día 13 de octubre de 2026, se reúnen las partes interesadas y miembros del comité de evaluación del proyecto de desarrollo de software, cuyos datos se detallan a continuación:

| Rol en el Proyecto | Nombre Completo | Cargo / Dependencia | Identificación / Cédula |
| :--- | :--- | :--- | :--- |
| **Desarrollador / Residente** | C. Mauricio Nolazco Lonjino | Estudiante Residente de Ing. en Sistemas Computacionales | Matrícula UMB: 13SC161 |
| **Asesor Externo (Empresa)** | L.I.A. Oscar Isaac Mendoza García | Asesor Técnico y Jefe de Proyecto en GPON TELECOM S.A. de C.V. | Céd. Prof. 8492019 / GPON-ID: OP-01 |
| **Asesor Interno (Académico)**| I.S.C. Leonardo Becerril Sánchez | Docente / Asesor de Residencia Profesional (UMB) | Céd. Prof. 7102941 / UMB-DEP-ISC |
| **Representante Empresarial** | Ing. Carlos Mendoza | Director de Operaciones y Redes GPON TELECOM | R.F.C.: GTE-180412-K71 |

---

## 2. OBJETO DEL ACTA

El presente documento constituye el **Acta de Conformidad y Aprobación Formal de la Especificación de Requerimientos de Software (SRS)** para el proyecto **"Sistema de Inventario y Mapeo Lógico GPON / FTTx"**. 

Las partes comparecientes declaran haber revisado, analizado y validado conjuntamente el alcance técnico, la viabilidad operativa y la especificación detallada de los **Requerimientos Funcionales (RF)**, **Requerimientos No Funcionales (RNF)** y la **Matriz de Control de Acceso Basado en Roles (RBAC)**, estableciendo formalmente la línea base de requerimientos (*Scope Baseline*) para el desarrollo, pruebas e implantación del software.

---

## 3. DECLARACIONES Y ALCANCE GENERAL DEL SISTEMA

1. **La Empresa Receptora (GPON TELECOM S.A. de C.V.)** declara que los requerimientos aquí descritos satisfacen íntegramente las necesidades operativas de la planta externa e interna de fibra óptica en San José del Rincón, resolviendo:
   - La eliminación de bitácoras manuales y hojas de cálculo desactualizadas.
   - El control atómico y prevención de colisiones en la asignación de puertos físicos SC-APC mediante transacciones ACID.
   - La operación móvil en campo sin cobertura celular a través de una arquitectura PWA *Offline-First*.
   - El cálculo dinámico del porcentaje de saturación de cajas NAP (Verde, Ámbar, Rojo).
   - El mapeo cartográfico GIS con OpenStreetMap y Leaflet de cajas NAP, postes CFE/propuestos, mufas IP68 y rutas vectoriales.
2. **El Asesor Interno (UMB)** declara que el planteamiento metodológico de la especificación técnica cumple con los estándares de la ingeniería de software y el plan de estudios de la carrera de Ingeniería en Sistemas Computacionales.
3. **El Desarrollador / Residente** se compromete a ejecutar la implementación estricta de las funcionalidades aquí acordadas, garantizando las restricciones de calidad, rendimiento y seguridad establecidas.

---

## 4. ROLES DE USUARIO Y MODELO DE CONTROL DE ACCESO (RBAC)

Se aprueba formalmente la estructura de actores del sistema:

| Código | Rol de Usuario | Nivel de Privilegios y Alcance Operativo | Estado de Aprobación |
| :---: | :--- | :--- | :---: |
| **ACT-01** | **Administrador** | Privilegios globales e irrestrictos. Gestión integral de usuarios, infraestructura NAP, liberación/reasignación de puertos, clientes, reportes ejecutivos e infraestructura pasiva. | **ACEPTADO CONFORME** |
| **ACT-02** | **Soporte Técnico** | Privilegios de mesa de ayuda y soporte de planta externa. Mantenimiento de puertos (Dañado, Mantenimiento, Libre), desvinculación de clientes, registro de cajas NAP y reportes. | **ACEPTADO CONFORME** |
| **ACT-03** | **Técnico de Campo** | Privilegios operativos móviles. Lectura de cartografía, calibración GPS de cajas NAP y asignación inicial de abonados en puertos libres. **Restringida la alteración, liberación o eliminación de puertos ocupados (HTTP 403 Forbidden).** | **ACEPTADO CONFORME** |

---

## 5. TABLAS DETALLADAS DE REQUERIMIENTOS FUNCIONALES (RF)

A continuación se presentan las tablas de los 27 requerimientos funcionales distribuidos en los 8 módulos del sistema, evaluados y aceptados en su totalidad:

### Módulo 1: Seguridad, Autenticación y Control de Acceso

| Código | Requerimiento Funcional | Descripción Detallada | Actores | Entradas / Salidas | Prioridad | Dictamen |
| :---: | :--- | :--- | :---: | :--- | :---: | :---: |
| **RF-01** | Autenticación con Credenciales y JWT | El sistema autentica usuarios mediante correo institucional y contraseña, emitiendo un token JSON Web Token (JWT) firmado de 24 horas de vigencia. | ACT-01<br/>ACT-02<br/>ACT-03 | **E:** `credencial_acceso`, `password`<br/>**S:** Token JWT Bearer, objeto de usuario autenticado. | Alta | **ACEPTADO** |
| **RF-02** | Control de Acceso RBAC y Bloqueo 403 | Valida en cada endpoint del backend los privilegios del rol solicitante. Si un Técnico de Campo invoca operaciones reservadas, deniega con HTTP 403 Forbidden. | Backend | **E:** Encabezado `Authorization: Bearer <token>`<br/>**S:** Acceso autorizado o respuesta HTTP 403 Forbidden. | Alta | **ACEPTADO** |
| **RF-03** | Conmutador Rápido de Roles (Demo) | Interfaz web con selector de un solo clic entre perfiles de Administrador, Soporte y Técnico para demostraciones y auditorías académicas sin reingreso de claves. | ACT-01<br/>ACT-02<br/>ACT-03 | **E:** Clic en pastilla de rol (`Admin`, `Soporte`, `Técnico`)<br/>**S:** Cambio instantáneo de permisos y contexto visual en UI. | Media | **ACEPTADO** |
| **RF-04** | Gestión de Perfiles y Directorio | El Administrador lista y administra los usuarios del sistema. Cada usuario puede consultar y actualizar su perfil propio (nombre, email y clave). | ACT-01 (Listar)<br/>Todos (Perfil) | **E:** Datos de perfil de usuario (`nombre`, `email`, `password`)<br/>**S:** Registro actualizado en base de datos. | Media | **ACEPTADO** |

---

### Módulo 2: Gestión de Infraestructura Pasiva (ODF y Puertos PON)

| Código | Requerimiento Funcional | Descripción Detallada | Actores | Entradas / Salidas | Prioridad | Dictamen |
| :---: | :--- | :--- | :---: | :--- | :---: | :---: |
| **RF-05** | Consulta y Monitoreo de ODF Central | Permite consultar los paneles distribuidores ópticos ODF de cabecera: nombre, central física, coordenadas GPS y capacidad nominal (48 hilos). | ACT-01<br/>ACT-02<br/>ACT-03 | **E:** Petición GET al catálogo ODF<br/>**S:** Detalle de panel ODF, hilos pasantes y estado físico. | Media | **ACEPTADO** |
| **RF-06** | Trazabilidad de Puertos PON en OLT | Registra y monitorea el inventario de puertos PON por slot en la central OLT, split ratio nominal (1:64) y potencia de emisión óptica (+4.5 a +5.2 dBm). | ACT-01<br/>ACT-02 | **E:** Parámetros de puerto PON (`slot`, `puerto`, `tx_power`)<br/>**S:** Ficha técnica de puerto PON vinculada a ODF. | Alta | **ACEPTADO** |
| **RF-07** | Inventario de Hilos de Fibra Troncal | Gestiona el estado de cada hilo óptico originado en el ODF hacia los ramales primarios, clasificándolos en: `Activo`, `Reserva` o `Muerto`. | ACT-01<br/>ACT-02 | **E:** Número de hilo (1 a 48), estado operativo<br/>**S:** Registro actualizado de conectividad del hilo. | Media | **ACEPTADO** |

---

### Módulo 3: Gestión y Geolocalización de Cajas NAP

| Código | Requerimiento Funcional | Descripción Detallada | Actores | Entradas / Salidas | Prioridad | Dictamen |
| :---: | :--- | :--- | :---: | :--- | :---: | :--- |
| **RF-08** | Registro y Provisión de Cajas NAP | Alta transaccional de nuevas cajas NAP en inventario, aprovisionando automáticamente sus 16 puertos físicos acopladores SC-APC en estado inicial `Libre`. | ACT-01<br/>ACT-02 | **E:** `identificador`, `zona`, `direccion`, `lat`, `lng`, `id_puerto_pon`<br/>**S:** Caja creada y 16 registros de puertos generados en BD. | Alta | **ACEPTADO** |
| **RF-09** | Cálculo de Saturación Dinámica | Calcula en tiempo real el porcentaje de ocupación de cada caja NAP clasificándola: **Verde/Normal** (<80%), **Ámbar/Preventivo** (80-99%), **Rojo/Saturada** (100%). | ACT-01<br/>ACT-02<br/>ACT-03 | **E:** Conteo de puertos ocupados vs. total de puertos<br/>**S:** Porcentaje numérico, color semafórico y diagnóstico. | Alta | **ACEPTADO** |
| **RF-10** | Calibración GPS de Cajas en Sitio | Permite a cuadrillas capturar y sincronizar las coordenadas geodésicas de una caja NAP con el sensor GPS de su teléfono o entrada manual (6 decimales). | ACT-01<br/>ACT-02<br/>ACT-03 | **E:** `id_nap`, `lat`, `lng` capturados con GPS móvil<br/>**S:** Coordenadas actualizadas y reubicación en mapa Leaflet. | Alta | **ACEPTADO** |

---

### Módulo 4: Operación de Puertos NAP y Concurrencia Transaccional ACID

| Código | Requerimiento Funcional | Descripción Detallada | Actores | Entradas / Salidas | Prioridad | Dictamen |
| :---: | :--- | :--- | :---: | :--- | :---: | :---: |
| **RF-11** | Visualización Matricial de 16 Puertos | Despliega una matriz gráfica interactiva simulando el chasis físico de la caja NAP con LEDs de colores por estado (`Libre`, `Ocupado`, `Dañado`, `Reservado`). | ACT-01<br/>ACT-02<br/>ACT-03 | **E:** Selección de caja NAP en el mapa o lista<br/>**S:** Matriz gráfica interactiva con los 16 puertos físicos. | Alta | **ACEPTADO** |
| **RF-12** | Asignación Atómica ACID con Bloqueo | Conecta un cliente a un puerto libre bajo transacción con bloqueo exclusivo a nivel de fila (`SELECT ... FOR UPDATE`). Si hay colisión, emite HTTP 409 Conflict. | ACT-01<br/>ACT-02<br/>ACT-03 | **E:** `id_puerto`, `numero_cliente`, `nombre`, `ont_mac`, `potencia`<br/>**S:** Puerto marcado `Ocupado`, cliente creado 1:1. | Crítica | **ACEPTADO** |
| **RF-13** | Liberación de Puerto y Desvinculación | Desvincula a un abonado de un puerto de fibra óptica, eliminando el registro del cliente y restableciendo el estado a `Libre` con recálculo de saturación. | ACT-01<br/>ACT-02<br/>*(403 Técnico)* | **E:** `id_puerto` a liberar<br/>**S:** Puerto en estado `Libre`, capacidad actualizada. | Alta | **ACEPTADO** |
| **RF-14** | Cambio Manual de Estado Técnico | Permite a Soporte y Administrador asignar estados técnicos a puertos (`Dañado`, `En Mantenimiento`, `Reservado`, `Libre`) para bloquear asignaciones indebidas. | ACT-01<br/>ACT-02<br/>*(403 Técnico)* | **E:** `id_puerto`, `nuevo_estado`<br/>**S:** Estado de puerto actualizado y LED reflejado en UI. | Media | **ACEPTADO** |

---

### Módulo 5: Padrón y Expediente de Clientes Abonados

| Código | Requerimiento Funcional | Descripción Detallada | Actores | Entradas / Salidas | Prioridad | Dictamen |
| :---: | :--- | :--- | :---: | :--- | :---: | :---: |
| **RF-15** | Directorio Centralizado de Abonados | Vista tabular completa de todos los clientes activos con código de cliente, nombre, caja NAP, puerto, marca ONT, MAC, potencia óptica (dBm) y dirección. | ACT-01<br/>ACT-02<br/>ACT-03 | **E:** Solicitud de listado con paginación<br/>**S:** Tabla de clientes con atributos técnicos y operativos. | Alta | **ACEPTADO** |
| **RF-16** | Búsqueda y Filtrado Multicriterio | Búsqueda en tiempo real por nombre de cliente, código, dirección MAC o calle, y filtrado por fabricante de ONT (`ZTE`, `Huawei`, `V-SOL`, `TP-Link`). | ACT-01<br/>ACT-02<br/>ACT-03 | **E:** Término de búsqueda en input, filtro de marca ONT<br/>**S:** Lista filtrada de abonados en tiempo real. | Media | **ACEPTADO** |
| **RF-17** | Edición de Expediente de Abonado | Actualización de datos de instalación del abonado (nombre, domicilio, marca ONT, dirección MAC y nivel de atenuación óptica estimada). | ACT-01<br/>ACT-02<br/>*(403 Técnico)* | **E:** `id_cliente`, datos técnicos modificados<br/>**S:** Expediente de abonado actualizado en PostgreSQL. | Media | **ACEPTADO** |

---

### Módulo 6: Cartografía Interactiva y Sistema de Información Geográfica (GIS)

| Código | Requerimiento Funcional | Descripción Detallada | Actores | Entradas / Salidas | Prioridad | Dictamen |
| :---: | :--- | :--- | :---: | :--- | :---: | :---: |
| **RF-18** | Renderizado Cartográfico Leaflet | Despliegue de un visor cartográfico interactivo basado en OpenStreetMap y Leaflet centrado en la zona de servicio de San José del Rincón, Estado de México. | ACT-01<br/>ACT-02<br/>ACT-03 | **E:** Coordenadas de encuadre geográfico de la red<br/>**S:** Mapa vectorial interactivo con zoom, capas y controles. | Alta | **ACEPTADO** |
| **RF-19** | Marcadores Semánticos por Saturación | Cajas NAP representadas en el mapa con marcadores circulares y badges de color según su saturación: Verde (<80%), Amarillo (80-99%) y Rojo (100%). | ACT-01<br/>ACT-02<br/>ACT-03 | **E:** Catálogo de cajas NAP con puertos calculados<br/>**S:** Marcadores geolocalizados con estilo cromático dinámico. | Alta | **ACEPTADO** |
| **RF-20** | Trazado Cartográfico de Enlaces y Red | Representación vectorial de rutas de fibra troncal y distribución (`Polyline` GeoJSON), mufas herméticas IP68 y postes aéreos CFE/propuestos. | ACT-01<br/>ACT-02<br/>ACT-03 | **E:** Coordenadas vectoriales de rutas, postes y mufas<br/>**S:** Capas gráficas de infraestructura pasiva sobre el mapa. | Media | **ACEPTADO** |

---

### Módulo 7: Operación Offline-First y Soporte Móvil en Campo

| Código | Requerimiento Funcional | Descripción Detallada | Actores | Entradas / Salidas | Prioridad | Dictamen |
| :---: | :--- | :--- | :---: | :--- | :---: | :---: |
| **RF-21** | Almacenamiento Local (IndexedDB) | Almacenamiento en caché local del dispositivo móvil (Dexie.js / IndexedDB) del inventario de cajas NAP, topología de puertos y coordenadas cartográficas. | ACT-03<br/>ACT-02 | **E:** Datos descargados en la última conexión activa<br/>**S:** Disponibilidad de consulta de red sin acceso a internet. | Alta | **ACEPTADO** |
| **RF-22** | Encolamiento de Mutaciones Offline | Si el técnico asigna un abonado o calibra GPS en zona sin señal celular, la transacción se encola en `pending_mutations`, notificando estado "Modo Offline". | ACT-03 | **E:** Acción de asignación o calibración sin conectividad<br/>**S:** Registro encolado localmente con UI optimista actualizada. | Alta | **ACEPTADO** |
| **RF-23** | Sincronización Automática Online | Al restablecerse la conectividad (`window.addEventListener('online')`), el sistema despacha secuencialmente la cola de mutaciones hacia la API central. | Backend /<br/>Frontend | **E:** Evento de red `online`<br/>**S:** Mutaciones procesadas en el servidor y cola vaciada. | Alta | **ACEPTADO** |
| **RF-24** | Sincronización Manual con Contador | Botón en barra superior con contador visual de transacciones pendientes (ej. `Sync (2)`), permitiendo al técnico forzar la sincronización en demanda. | ACT-01<br/>ACT-02<br/>ACT-03 | **E:** Clic en botón de sincronización manual<br/>**S:** Envío forzado de la cola y notificación de resultado. | Media | **ACEPTADO** |

---

### Módulo 8: Generación y Descarga de Reportes Ejecutivos

| Código | Requerimiento Funcional | Descripción Detallada | Actores | Entradas / Salidas | Prioridad | Dictamen |
| :---: | :--- | :--- | :---: | :--- | :---: | :---: |
| **RF-25** | Generación de Reporte PDF al Vuelo | Genera reportes técnicos ejecutivos en formato PDF formal con membrete de *GPON TELECOM S.A. de C.V.*, fecha/hora y central ODF mediante biblioteca PDFKit. | ACT-01<br/>ACT-02<br/>*(403 Técnico)* | **E:** Clic en "Generar Reporte PDF"<br/>**S:** Descarga binaria de `reporte_gpon_saturacion.pdf`. | Alta | **ACEPTADO** |
| **RF-26** | Tabla Ejecutiva de Saturación en PDF | Incluye inventario consolidado de cajas NAP con total de puertos, libres, ocupados, porcentaje de saturación, dictamen y porcentaje global de toda la red. | ACT-01<br/>ACT-02 | **E:** Datos consolidados de inventario de infraestructura<br/>**S:** Sección tabular formateada en documento PDF. | Alta | **ACEPTADO** |
| **RF-27** | Padrón de Abonados en Reporte PDF | Lista el padrón de clientes en servicio con código, nombre, caja NAP, puerto asignado, marca ONT, MAC y atenuación óptica calculada (dBm). | ACT-01<br/>ACT-02 | **E:** Padrón de clientes activos vinculados<br/>**S:** Directorio formal de clientes impreso en PDF. | Media | **ACEPTADO** |

---

## 6. TABLAS DETALLADAS DE REQUERIMIENTOS NO FUNCIONALES (RNF - ISO/IEC 25010)

Se verifican y aprueban los 18 requerimientos no funcionales bajo la norma internacional **ISO/IEC 25010**:

### 6.1. Seguridad y Confidencialidad

| Código | Requerimiento No Funcional | Métrica / Estándar de Cumplimiento | Especificación Técnica | Dictamen |
| :---: | :--- | :--- | :--- | :---: |
| **RNF-01** | Cifrado en Tránsito | HTTPS / TLS 1.3 | Todo el tráfico entre cliente y API REST debe viajar encriptado punto a punto con certificados SSL/TLS válidos. | **ACEPTADO** |
| **RNF-02** | Hash Seguro de Contraseñas | bcrypt (Salt Rounds $\ge 10$) | Almacenamiento irreversible de claves de usuario; prohibido estrictamente texto plano en base de datos. | **ACEPTADO** |
| **RNF-03** | Autenticación Stateless JWT | Token Bearer en encabezado HTTP | Sesiones validadas mediante firma criptográfica con secreto de servidor `JWT_SECRET` y caducidad de 24h. | **ACEPTADO** |
| **RNF-04** | Validación y Sanitización Zod | Validación 100% en endpoints | Esquemas Zod en backend para validar UUIDs, rangos de coordenadas y formato MAC: `^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$`. | **ACEPTADO** |

---

### 6.2. Concurrencia, Consistencia e Integridad (ACID)

| Código | Requerimiento No Funcional | Métrica / Estándar de Cumplimiento | Especificación Técnica | Dictamen |
| :---: | :--- | :--- | :--- | :---: |
| **RNF-05** | Transaccionalidad ACID | Aislamiento y Atomicidad PostgreSQL | Asignaciones y liberaciones de puertos deben ejecutarse bajo transacciones atómicas; ante cualquier error, se aplica rollback total. | **ACEPTADO** |
| **RNF-06** | Bloqueo Pesimista de Fila | `SELECT ... FOR UPDATE` | Bloqueo exclusivo a nivel de fila sobre el puerto NAP durante la asignación; elimina condiciones de carrera con código HTTP 409 Conflict. | **ACEPTADO** |
| **RNF-07** | Integridad Referencial Estricta | Restricciones `FK` y `UNIQUE` | Clave foránea 1:1 estricta entre cliente y puerto NAP (`clients.id_puerto_nap UNIQUE`), e unicidad en `[id_nap, indice_puerto]`. | **ACEPTADO** |

---

### 6.3. Rendimiento y Eficiencia

| Código | Requerimiento No Funcional | Métrica / Estándar de Cumplimiento | Especificación Técnica | Dictamen |
| :---: | :--- | :--- | :--- | :---: |
| **RNF-08** | Tiempo de Respuesta API | Latencia media $< 250\text{ ms}$ | Consultas de inventario, cajas NAP y clientes deben responder en menos de 250 ms en condiciones normales de red. | **ACEPTADO** |
| **RNF-09** | Generación PDF en Streaming | Flujo `doc.pipe(res)` sin buffering | Generación en memoria dinámica con PDFKit sin almacenar archivos temporales en disco del servidor. | **ACEPTADO** |
| **RNF-10** | Fluidez Cartográfica GIS | 60 FPS en Leaflet | Renderizado ágil de polilíneas de fibra, postes y marcadores NAP sin degradación de memoria en navegadores móviles. | **ACEPTADO** |

---

### 6.4. Disponibilidad y Operación en Campo (Offline-First)

| Código | Requerimiento No Funcional | Métrica / Estándar de Cumplimiento | Especificación Técnica | Dictamen |
| :---: | :--- | :--- | :--- | :---: |
| **RNF-11** | Arquitectura Offline-First | Disponibilidad local 100% sin internet | Los técnicos pueden consultar mapa y datos técnicos almacenados en IndexedDB aun en zonas rurales sin cobertura. | **ACEPTADO** |
| **RNF-12** | Resistencia de Cola de Mutaciones | Cero pérdida de datos | Mutaciones encoladas en `pending_mutations` persisten ante reinicio del equipo o cierre del navegador con contador de reintentos. | **ACEPTADO** |

---

### 6.5. Portabilidad, Usabilidad y Accesibilidad

| Código | Requerimiento No Funcional | Métrica / Estándar de Cumplimiento | Especificación Técnica | Dictamen |
| :---: | :--- | :--- | :--- | :---: |
| **RNF-13** | Progressive Web App (PWA) | Instalación con Manifiesto y SW | Manifest `manifest.json`, iconos corporativos (192x192 y 512x512) y Service Worker para instalación nativa en Android/iOS. | **ACEPTADO** |
| **RNF-14** | Diseño Responsivo Multi-Dispositivo | Desde 360 px hasta monitores 4K | Adaptabilidad de interfaz: matriz de 4 columnas en teléfonos móviles y 8 columnas en pantallas de escritorio. | **ACEPTADO** |
| **RNF-15** | Accesibilidad y Ergonomía Visual | WCAG 2.1 Nivel AA / Modo Oscuro | Paleta cromática de alto contraste para visibilidad bajo luz solar en calle y modo oscuro para trabajo en centros NOC. | **ACEPTADO** |

---

### 6.6. Mantenibilidad, Escalabilidad y Despliegue

| Código | Requerimiento No Funcional | Métrica / Estándar de Cumplimiento | Especificación Técnica | Dictamen |
| :---: | :--- | :--- | :--- | :---: |
| **RNF-16** | Tipado Estático de Extremo a Extremo | TypeScript 100% | Frontend y Backend programados estrictamente en TypeScript con interfaces de datos compartidas. | **ACEPTADO** |
| **RNF-17** | Contenedorización con Docker | Dockerfile y Docker Compose | Empaquetamiento desacoplado para PostgreSQL, API Express y Frontend Nginx reproducible en cualquier servidor. | **ACEPTADO** |
| **RNF-18** | Compatibilidad con Nube Moderna | Despliegue en PaaS / Serverless | Arquitectura compatible con PostgreSQL en la nube (Supabase/Neon), API en Render/Railway y Frontend en Vercel. | **ACEPTADO** |

---

## 7. MATRIZ DE TRAZABILIDAD Y PERMISOS POR ROL (RBAC)

Se aprueba formalmente la matriz de control de acceso que define el comportamiento del sistema ante cada petición operativa:

| Módulo / Acción Operativa | Requerimiento | Administrador | Soporte Técnico | Técnico de Campo | Código de Respuesta ante Denegación |
| :--- | :---: | :---: | :---: | :---: | :---: |
| Iniciar sesión y validar credenciales | `RF-01` | Autorizado | Autorizado | Autorizado | HTTP 401 Unauthorized |
| Alternar rol rápido para evaluación | `RF-03` | Autorizado | Autorizado | Autorizado | No aplica (Modo Demo) |
| Visualizar mapa y cajas NAP | `RF-09`, `RF-18` | Autorizado | Autorizado | Autorizado | HTTP 401 Unauthorized |
| Registrar nueva caja NAP en inventario | `RF-08` | Autorizado | Autorizado | **Denegado** | **HTTP 403 Forbidden** |
| Calibrar coordenadas GPS de caja | `RF-10` | Autorizado | Autorizado | Autorizado | HTTP 401 Unauthorized |
| Visualizar matriz de 16 puertos NAP | `RF-11` | Autorizado | Autorizado | Autorizado | HTTP 401 Unauthorized |
| Asignar nuevo abonado a puerto libre | `RF-12` | Autorizado | Autorizado | Autorizado | HTTP 409 Conflict (si hay colisión) |
| Liberar puerto ocupado (desvincular) | `RF-13` | Autorizado | Autorizado | **Denegado** | **HTTP 403 Forbidden** |
| Cambiar estado a Dañado / Mantenimiento| `RF-14` | Autorizado | Autorizado | **Denegado** | **HTTP 403 Forbidden** |
| Consultar catálogo de clientes | `RF-15`, `RF-16` | Autorizado | Autorizado | Autorizado | HTTP 401 Unauthorized |
| Editar expediente de cliente abonado | `RF-17` | Autorizado | Autorizado | **Denegado** | **HTTP 403 Forbidden** |
| Operación offline y encolamiento | `RF-21`, `RF-22` | Autorizado | Autorizado | Autorizado | No aplica (IndexedDB local) |
| Generar y descargar reporte PDF | `RF-25`, `RF-26` | Autorizado | Autorizado | **Denegado** | **HTTP 403 Forbidden** |
| Administrar usuarios y credenciales | `RF-04` | Autorizado | **Denegado** | **Denegado** | **HTTP 403 Forbidden** |

---

## 8. CLÁUSULAS DE CONFORMIDAD Y CONTROL DE CAMBIOS

1. **PRIMERA (LÍNEA BASE DE ALCANCE):** Con la firma de la presente acta, queda formalmente aprobada y congelada la **Línea Base de Requerimientos (*Scope Baseline*)**. Cualquier modificación, adición o supresión de requerimientos solicitada con posterioridad deberá tramitarse mediante una **Solicitud Formal de Control de Cambios (RFC)** sujeta a reevaluación de cronograma e impacto.
2. **SEGUNDA (CRITERIOS DE ACEPTACIÓN TÉCNICA):** La entrega final del sistema será evaluada y aceptada mediante pruebas funcionales de caja negra y pruebas de estrés que comprueben el 100% de cumplimiento de las especificaciones consignadas en esta acta.
3. **TERCERA (VALIDEZ ACADÉMICA Y LABORAL):** La presente acta tiene plena validez documental para la evaluación del avance de **Residencia Profesional** en la carrera de Ingeniería en Sistemas Computacionales de la UMB y como entregable de ingeniería de software para **GPON TELECOM S.A. de C.V.**

---

## 9. FIRMAS DE CONFORMIDAD Y APROBACIÓN

Leída la presente acta y conformes las partes con su contenido y alcances jurídicos y técnicos, firman al calce y al margen por cuadruplicado en el Municipio de San José del Rincón, Estado de México, a los trece días del mes de octubre de dos mil veintiséis.

<br/><br/>

| DESARROLLADOR / RESIDENTE PROFESIONAL | ASESOR EXTERNO (EMPRESA) |
| :---: | :---: |
| <br/><br/>_____________________________________________ | <br/><br/>_____________________________________________ |
| **C. Mauricio Nolazco Lonjino**<br/>Desarrollador Líder del Sistema<br/>Estudiante de Ing. en Sistemas Computacionales<br/>Matrícula UMB: 13SC161 | **L.I.A. Oscar Isaac Mendoza García**<br/>Asesor Externo de Residencia<br/>Jefe de Proyecto de Software<br/>GPON TELECOM S.A. de C.V. |

<br/><br/>

| ASESOR INTERNO (ACADÉMICO) | DIRECCIÓN DE OPERACIONES (EMPRESA) |
| :---: | :---: |
| <br/><br/>_____________________________________________ | <br/><br/>_____________________________________________ |
| **I.S.C. Leonardo Becerril Sánchez**<br/>Asesor Interno de Residencia Profesional<br/>División de Ing. en Sistemas Computacionales<br/>Universidad Mexiquense del Bicentenario | **Ing. Carlos Mendoza**<br/>Director de Operaciones y Planta Externa<br/>GPON TELECOM S.A. de C.V.<br/>Vo.Bo. Aceptación Empresarial |

<br/><br/>
<div align="center">
  <b>SELLO DE LA EMPRESA RECEPTORA &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; SELLO DE LA INSTITUCIÓN EDUCATIVA</b><br/>
  (GPON TELECOM S.A. de C.V.) &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; (UMB UES San José del Rincón)
</div>

