# Especificación de Requerimientos de Software (SRS)
## Sistema de Inventario y Mapeo Lógico GPON / FTTx
**GPON TELECOM S.A. de C.V.**

---

## 1. Introducción y Alcance del Sistema

El **Sistema de Inventario y Mapeo Lógico GPON / FTTx** es una solución tecnológica integral orientada a la administración, documentación técnica, auditoría y supervisión geoespacial de la infraestructura pasiva de telecomunicaciones por fibra óptica.

El sistema comprende el ciclo completo de la planta externa e interna:
- **ODF Central (Optical Distribution Frame)** y módulos OLT.
- **Puertos PON** y capacidad de derivación (splitters ópticos).
- **Hilos de fibra óptica troncal y distribución**.
- **Cajas terminales de distribución NAP (Network Access Point)** geolocalizadas mediante GPS.
- **Puertos físicos de abonado** (matrices de 16 puertos con conectores SC-APC).
- **Padrón de clientes/abonados conectados** con parámetros de atenuación óptica (dBm) y dirección física.
- **Arquitectura móvil Offline-First** con sincronización automática para cuadrillas en zonas sin cobertura celular.

---

## 2. Actores del Sistema y Roles de Acceso (RBAC)

El sistema implementa un control de acceso basado en roles (**Role-Based Access Control - RBAC**):

| Código de Actor | Rol de Usuario | Descripción y Nivel de Autorización |
| :--- | :--- | :--- |
| **ACT-01** | **Administrador** | Posee privilegios totales e irrestrictos sobre la plataforma. Puede crear y dar de baja usuarios, dar de alta cajas NAP, liberar y reasignar puertos, gestionar clientes y exportar reportes ejecutivos. |
| **ACT-02** | **Soporte Técnico** | Encargado del mantenimiento de la red y resolución de incidencias. Autorizado para modificar el estado de puertos (Dañado, En Mantenimiento, Libre), desvincular o liberar abonados, registrar NAPs y generar reportes. |
| **ACT-03** | **Técnico de Campo** | Personal operativo en calle con dispositivos móviles. Autorizado para consultar el mapa cartográfico, capturar/calibrar coordenadas GPS de cajas en sitio y realizar la asignación inicial de nuevos abonados en puertos libres. **Tiene prohibido estrictamente modificar, liberar o eliminar puertos ocupados (HTTP 403 Forbidden).** |

---

## 3. Requerimientos Funcionales (RF)

Los requerimientos funcionales especifican el comportamiento y las funciones operativas del sistema organizadas por módulos técnicos.

---

### Módulo 1: Seguridad, Autenticación y Control de Acceso

#### `RF-01` Autenticación de Usuarios mediante Credenciales y JWT
- **Descripción**: El sistema debe permitir el inicio de sesión seguro mediante credenciales de acceso (correo electrónico institucional y contraseña). Si las credenciales son válidas, debe emitir un token firmado **JSON Web Token (JWT)** con un tiempo de caducidad establecido (24 horas).
- **Actores**: ACT-01, ACT-02, ACT-03.
- **Entradas**: `credencial_acceso` (email institucional), `password` (texto plano cifrado con TLS).
- **Salidas**: Objeto de usuario autenticado (`id_usuario`, `nombre_completo`, `rol`) y token Bearer JWT.
- **Prioridad**: Alta.

#### `RF-02` Control de Acceso Basado en Roles (RBAC) y Bloqueo de Rutas Sensibles
- **Descripción**: El sistema debe validar en cada endpoint del backend el rol del usuario que envía la petición. Si un usuario con rol *Técnico de Campo* intenta invocar acciones restringidas (como liberar puertos ocupados, alterar estados técnicos o editar abonados existentes), el backend debe denegar la operación retornando el código de estado estándar **HTTP 403 Forbidden**.
- **Actores**: Backend (Middleware de seguridad `requireRoles`).
- **Regla de Negocio**: Solo los roles `Admin` y `Soporte` poseen privilegios de modificación de estados de infraestructura y desvinculación de clientes.
- **Prioridad**: Alta.

#### `RF-03` Conmutador Rápido de Roles para Evaluación (Demo Role Switcher)
- **Descripción**: La interfaz web debe proveer un conmutador rápido de roles en un solo clic que permita alternar instantáneamente entre los perfiles de `Administrador`, `Soporte Técnico` y `Técnico de Campo` sin requerir reescritura manual de credenciales, con fines de demostración, pruebas y auditoría académica/empresarial.
- **Actores**: ACT-01, ACT-02, ACT-03.
- **Prioridad**: Media.

#### `RF-04` Gestión de Perfiles y Directorio de Cuentas de Usuario
- **Descripción**: El sistema debe permitir a los administradores listar todos los usuarios del sistema y a los usuarios consultar y actualizar los datos de su perfil personal (nombre completo, credencial de acceso y contraseña).
- **Actores**: ACT-01 (Listar usuarios), Todos (Editar perfil propio).
- **Prioridad**: Media.

---

### Módulo 2: Gestión de Infraestructura Pasiva (ODF y Puertos PON)

#### `RF-05` Consulta y Monitoreo del Distribuidor Óptico Central (ODF)
- **Descripción**: El sistema debe permitir consultar los datos del panel ODF central de la cabecera (nombre, ubicación física de la central, coordenadas geográficas y capacidad nominal de hilos de fibra óptica).
- **Actores**: ACT-01, ACT-02, ACT-03.
- **Salidas**: Lista de paneles ODF registrados y detalles de capacidad física (ej. 48 hilos).
- **Prioridad**: Media.

#### `RF-06` Trazabilidad de Puertos PON de la OLT
- **Descripción**: El sistema debe mantener el inventario de puertos PON asociados a cada tarjeta/slot de la central OLT, registrando número de slot, número de puerto, capacidad máxima de abonados (split 1:64) y nivel de potencia de transmisión óptica emitida (`potencia_tx_dbm`, típicamente +4.5 dBm).
- **Actores**: ACT-01, ACT-02.
- **Prioridad**: Alta.

#### `RF-07` Inventario de Hilos de Fibra Óptica Troncal
- **Descripción**: El sistema debe registrar los hilos ópticos originados en el ODF hacia las derivaciones primarias, clasificándolos según su estado operativo: `Activo`, `Reserva` o `Muerto`.
- **Actores**: ACT-01, ACT-02.
- **Prioridad**: Media.

---

### Módulo 3: Gestión y Geolocalización de Cajas NAP

#### `RF-08` Registro y Alta de Cajas de Acceso Terminal (NAP)
- **Descripción**: El sistema debe permitir a los roles autorizados registrar una nueva caja NAP en el inventario. Al registrarse la caja, el sistema debe aprovisionar automáticamente de manera transaccional sus puertos ópticos (predeterminado 16 puertos) en estado inicial `Libre`.
- **Actores**: ACT-01, ACT-02.
- **Entradas**: `identificador` (ej. NAP-SJR-05), `zona`, `direccion_texto`, `total_puertos` (8, 16 o 24), `coordenadas_gps` (`lat`, `lng`), `id_puerto_pon`.
- **Salidas**: Objeto de caja creada y matriz de 16 puertos físicos vinculados.
- **Prioridad**: Alta.

#### `RF-09` Consulta y Cálculo de Saturación Dinámica de Cajas NAP
- **Descripción**: El sistema debe calcular en tiempo real el porcentaje de saturación de cada caja NAP considerando el total de puertos y los puertos en estado `Ocupado`. Con base en dicho cálculo, debe clasificar dinámicamente el estado de saturación:
  - **Disponible / Normal**: Menor al 80% de ocupación.
  - **Alerta / Preventivo**: Entre 80% y 99% de ocupación.
  - **Saturada / Crítico**: 100% de ocupación (0 puertos libres).
- **Actores**: ACT-01, ACT-02, ACT-03.
- **Prioridad**: Alta.

#### `RF-10` Calibración y Actualización de Coordenadas GPS en Campo
- **Descripción**: El sistema debe permitir que los técnicos en sitio calibren la ubicación geográfica de una caja NAP existente utilizando el sensor de geolocalización de su teléfono inteligente (`lat`, `lng`) o ingresando los valores numéricos manualmente con precisión de 6 decimales.
- **Actores**: ACT-01, ACT-02, ACT-03.
- **Entradas**: `id_nap`, `lat`, `lng`.
- **Prioridad**: Alta.

---

### Módulo 4: Operación de Puertos NAP y Concurrencia Transaccional ACID

#### `RF-11` Visualización Matricial del Chasis de 16 Puertos
- **Descripción**: La interfaz de usuario debe presentar una matriz gráfica interactiva que reproduzca visualmente el chasis de la caja NAP con sus 16 puertos ópticos, identificando mediante indicadores luminosos (LEDs de color) el estado de cada puerto (`Libre`, `Ocupado`, `Dañado`, `Reservado`, `En Mantenimiento`).
- **Actores**: ACT-01, ACT-02, ACT-03.
- **Prioridad**: Alta.

#### `RF-12` Asignación Atómica de Abonado a Puerto NAP con Bloqueo de Fila
- **Descripción**: El sistema debe permitir conectar a un nuevo abonado a un puerto libre. La operación debe ejecutarse dentro de una transacción ACID con bloqueo exclusivo a nivel de fila (`SELECT ... FOR UPDATE`), garantizando que si dos técnicos intentan tomar el mismo puerto al mismo tiempo, la primera solicitud tenga éxito y la segunda reciba un rechazo ordenado con código **HTTP 409 Conflict**.
- **Actores**: ACT-01, ACT-02, ACT-03.
- **Entradas**: `id_puerto`, `numero_cliente`, `nombre_completo`, `marca_ont`, `direccion`, `ont_mac`, `potencia_rx_estimada`.
- **Salidas**: Puerto actualizado a estado `Ocupado` y registro del cliente creado y vinculado 1:1.
- **Prioridad**: Crítica.

#### `RF-13` Liberación de Puerto y Desvinculación de Abonado
- **Descripción**: El sistema debe permitir desvincular a un abonado de un puerto de fibra, eliminando el registro del cliente y restableciendo el estado del puerto a `Libre`, recalculando inmediatamente la saturación de la caja.
- **Actores**: ACT-01, ACT-02 (Prohibido a ACT-03 con 403 Forbidden).
- **Entradas**: `id_puerto`.
- **Salidas**: Puerto restablecido a `Libre` y mensaje de confirmación.
- **Prioridad**: Alta.

#### `RF-14` Cambio Manual de Estado Operativo de Puerto
- **Descripción**: El sistema debe permitir a Soporte y Administradores modificar el estado operativo de un puerto a valores técnicos (`Dañado`, `En Mantenimiento`, `Reservado`, `Libre`) para bloquear la conexión de abonados cuando exista una falla física en el conector SC o en la fibra drop.
- **Actores**: ACT-01, ACT-02.
- **Prioridad**: Media.

---

### Módulo 5: Padrón y Expediente de Clientes Abonados

#### `RF-15` Directorio Centralizado de Abonados FTTx
- **Descripción**: El sistema debe proveer una vista tabular completa de todos los clientes activos conectados a la red, mostrando su código de abonado, nombre completo, caja NAP y número de puerto al que están conectados, marca del módem ONT, dirección MAC, nivel de potencia de recepción y dirección física de instalación.
- **Actores**: ACT-01, ACT-02, ACT-03.
- **Prioridad**: Alta.

#### `RF-16` Búsqueda y Filtrado Multicriterio de Clientes
- **Descripción**: El sistema debe permitir realizar búsquedas en tiempo real en el padrón de abonados por nombre, código de cliente, dirección MAC o calle, así como filtrar por fabricante de equipo terminal ONT (`ZTE`, `Huawei`, `V-SOL`, `TP-Link`).
- **Actores**: ACT-01, ACT-02, ACT-03.
- **Prioridad**: Media.

#### `RF-17` Edición y Actualización de Expediente de Abonado
- **Descripción**: El sistema debe permitir actualizar los datos del abonado (nombre, domicilio, marca de ONT, dirección MAC y potencia de recepción estimada).
- **Actores**: ACT-01, ACT-02 (Restringido para ACT-03).
- **Prioridad**: Media.

---

### Módulo 6: Cartografía Interactiva y Sistema de Información Geográfica (GIS)

#### `RF-18` Renderizado de Mapa Geoespacial con OpenStreetMap
- **Descripción**: El sistema debe desplegar un visor cartográfico interactivo basado en OpenStreetMap y Leaflet centrado en la zona de cobertura de la red (ej. San José del Rincón, Estado de México).
- **Actores**: ACT-01, ACT-02, ACT-03.
- **Prioridad**: Alta.

#### `RF-19` Marcadores Semánticos por Nivel de Saturación
- **Descripción**: Cada caja NAP debe representarse en el mapa mediante un marcador visual coloreado según su nivel de ocupación:
  - **Verde**: Menor a 80% de ocupación (capacidad disponible para altas).
  - **Amarillo / Ámbar**: Entre 80% y 99% de ocupación (alerta de ampliación preventiva).
  - **Rojo**: 100% de ocupación (caja saturada, requiere splitters adicionales).
- **Actores**: ACT-01, ACT-02, ACT-03.
- **Prioridad**: Alta.

#### `RF-20` Trazado Cartográfico de Enlaces Ópticos (Troncales ODF a NAP)
- **Descripción**: El mapa debe trazar líneas vectoriales (`Polyline`) que conecten visualmente la estación central ODF con cada una de las cajas NAP desplegadas, simulando la ruta de la fibra troncal.
- **Actores**: ACT-01, ACT-02, ACT-03.
- **Prioridad**: Media.

---

### Módulo 7: Operación Offline-First y Soporte Móvil en Campo

#### `RF-21` Almacenamiento Local en Dispositivo Móvil (IndexedDB)
- **Descripción**: La aplicación web debe almacenar en el almacenamiento local del dispositivo del técnico (mediante Dexie.js / IndexedDB) la lista de cajas NAP, su topología de puertos y las coordenadas cartográficas para permitir su consulta aún sin señal celular.
- **Actores**: ACT-03.
- **Prioridad**: Alta.

#### `RF-22` Encolamiento de Asignaciones y Modificaciones sin Conexión
- **Descripción**: Si el técnico realiza la asignación de un abonado o captura coordenadas GPS en una "zona muerta" (sin señal de datos móviles ni Wi-Fi), el sistema debe registrar la transacción en una cola local de mutaciones pendientes (`pending_mutations`), reflejar el cambio en la interfaz gráfica y notificar al técnico que se encuentra en "Modo Offline".
- **Actores**: ACT-03.
- **Prioridad**: Alta.

#### `RF-23` Sincronización Automática al Restaurar Conectividad
- **Descripción**: La aplicación debe escuchar continuamente los eventos de red del navegador (`window.addEventListener('online')`). En cuanto se restablece la conexión a internet, debe procesar secuencialmente la cola de operaciones pendientes hacia el backend y limpiar los registros locales exitosos.
- **Actores**: Backend y Aplicación Frontend PWA.
- **Prioridad**: Alta.

#### `RF-24` Sincronización Manual de Transacciones Pendientes
- **Descripción**: La interfaz de usuario debe incluir un botón de sincronización manual con contador visible de mutaciones pendientes (ej. `Sync (2)`), permitiendo al usuario forzar el envío de datos al servidor cuando lo considere conveniente.
- **Actores**: ACT-01, ACT-02, ACT-03.
- **Prioridad**: Media.

---

### Módulo 8: Generación y Descarga de Reportes Ejecutivos

#### `RF-25` Generación de Reporte Ejecutivo en Formato PDF
- **Descripción**: El sistema debe generar al vuelo un reporte ejecutivo formal en formato PDF (utilizando la biblioteca PDFKit en backend) con membrete institucional de *GPON TELECOM S.A. de C.V.*, fecha y hora de emisión y central ODF de procedencia.
- **Actores**: ACT-01, ACT-02.
- **Salidas**: Archivo binario `reporte_gpon_saturacion.pdf` descargable.
- **Prioridad**: Alta.

#### `RF-26` Tabla Ejecutiva de Saturación y Diagnóstico de Capacidad
- **Descripción**: El documento PDF debe incluir una tabla con el inventario de todas las cajas NAP, indicando identificador, zona, total de puertos, libres, ocupados, porcentaje de saturación y dictamen diagnóstico (`NORMAL` o `CRÍTICO`). Asimismo, debe calcular el porcentaje global de saturación de toda la red de fibra.
- **Actores**: ACT-01, ACT-02.
- **Prioridad**: Alta.

#### `RF-27` Directorio de Abonados Conectados en Reporte PDF
- **Descripción**: El reporte PDF debe listar el padrón completo de abonados en servicio, detallando código de cliente, nombre completo, caja NAP y puerto asignado, marca del módem ONT, dirección MAC y atenuación óptica calculada (dBm).
- **Actores**: ACT-01, ACT-02.
- **Prioridad**: Media.

---

## 4. Requerimientos No Funcionales (RNF)

Los requerimientos no funcionales definen los atributos de calidad, rendimiento, restricciones de seguridad, arquitectura y cumplimiento normativo del sistema, clasificados bajo la norma internacional **ISO/IEC 25010**.

---

### 4.1. Seguridad y Confidencialidad (RNF-SEG)

- **`RNF-01` Cifrado en Tránsito y Comunicaciones Seguras**: Todo el tráfico entre la aplicación cliente y la API REST debe transmitirse mediante protocolos seguros HTTPS / TLS 1.3 en ambientes de producción.
- **`RNF-02` Cifrado Unidireccional de Contraseñas**: Las contraseñas de los usuarios deben almacenarse irreversiblemente en la base de datos aplicando algoritmos de hash criptográfico **bcrypt** con un factor de costo (*salt rounds*) no inferior a 10.
- **`RNF-03` Autenticación Sin Estado (Stateless JWT)**: La autenticación debe manejarse mediante tokens JWT firmados criptográficamente con una clave secreta (`JWT_SECRET`), transmitidos en las cabeceras HTTP mediante el esquema `Authorization: Bearer <TOKEN>`.
- **`RNF-04` Validación Estricta de Parámetros y Sanitización**: Todas las peticiones HTTP hacia el backend deben ser validadas exhaustivamente mediante esquemas **Zod**, rechazando datos malformados antes de tocar la base de datos (por ejemplo, validación de formato MAC con la expresión regular `^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$`, validación de UUIDs y rangos de latitud/longitud).

---

### 4.2. Concurrencia, Consistencia e Integridad de Datos (RNF-CON)

- **`RNF-05` Garantía de Transacciones ACID**: Las operaciones críticas de asignación, reasignación y liberación de puertos de fibra deben ejecutarse dentro de transacciones de base de datos que cumplan estrictamente los principios de **Atomicidad, Consistencia, Aislamiento y Durabilidad (ACID)**.
- **`RNF-06` Bloqueo Pesimista a Nivel de Fila (Pessimistic Row Locking)**: Durante la asignación de un puerto, el motor de base de datos PostgreSQL debe bloquear exclusivamente la fila del puerto mediante la instrucción `SELECT ... FOR UPDATE` (`Transaction.LOCK.UPDATE`), imposibilitando que dos técnicos concurrentes asignen clientes distintos al mismo puerto óptico físico.
- **`RNF-07` Integridad Referencial Estricta**: La base de datos relacional debe imponer restricciones de integridad referencial mediante llaves foráneas (`FOREIGN KEY`), restricciones de unicidad (`UNIQUE`) en números de cliente, direcciones MAC y combinaciones de `[id_nap, indice_puerto]`, impidiendo estados inconsistentes o puertos duplicados.

---

### 4.3. Rendimiento y Eficiencia (RNF-REN)

- **`RNF-08` Tiempo de Respuesta de la API**: Las consultas de lectura de cajas NAP, estado de puertos y catálogo de clientes deben responder en un tiempo medio inferior a **250 milisegundos** bajo condiciones normales de red.
- **`RNF-09` Generación de Reportes en Streaming**: La generación del reporte ejecutivo en PDF debe realizarse mediante canalización por flujos (*streaming pipeline* con `doc.pipe(res)`), permitiendo servir el documento directamente al cliente sin saturar la memoria RAM del servidor.
- **`RNF-10` Optimización Cartográfica en Frontend**: El visor cartográfico Leaflet debe procesar de manera fluida (a 60 fotogramas por segundo) el renderizado de decenas de marcadores vectoriales, enlaces troncales y popups interactivos sin presentar congelamiento en dispositivos móviles.

---

### 4.4. Disponibilidad, Resiliencia y Operación en Campo (RNF-DIS)

- **`RNF-11` Arquitectura Offline-First**: La plataforma debe contar con resiliencia total frente a cortes de red en campo. El técnico debe ser capaz de abrir la aplicación y consultar información cartográfica y técnica almacenada en memoria local incluso con desconexión total a internet.
- **`RNF-12` Cero Pérdida de Datos en Operaciones Locales**: Las mutaciones encoladas en IndexedDB (`pending_mutations`) deben persistir ante reinicios del navegador o del dispositivo móvil, conservando el orden cronológico de ejecución y el contador de reintentos hasta su confirmación exitosa por el servidor central.

---

### 4.5. Portabilidad, Usabilidad y Accesibilidad (RNF-USA)

- **`RNF-13` Progressive Web App (PWA) e Instalación Nativa**: La interfaz cliente debe incluir manifiesto web (`manifest.json`) y Service Worker (`sw.js`) con iconos corporativos (192x192 y 512x512 px), permitiendo su instalación directa en pantallas de inicio de dispositivos móviles con apariencia y comportamiento de aplicación nativa a pantalla completa.
- **`RNF-14` Interfaz Adaptativa (Responsive Design)**: El diseño de interfaz debe adaptarse a pantallas de teléfonos inteligentes (360px de ancho en adelante), tabletas y monitores de oficina (hasta resoluciones 4K), organizando adecuadamente la matriz de puertos (distribución de 4 columnas en móvil y 8 columnas en monitor).
- **`RNF-15` Ergonomía Visual en Campo (Dark Theme)**: La aplicación debe emplear un tema oscuro con contrastes luminosos calibrados (estilo centro de control NOC / panel de fibra), facilitando la lectura en condiciones de iluminación solar intensa en exteriores y reduciendo la fatiga visual.

---

### 4.6. Mantenibilidad, Escalabilidad y Despliegue (RNF-MAN)

- **`RNF-16` Tipado Estático de Extremo a Extremo**: Todo el código fuente de la plataforma (Backend Express y Frontend React) debe escribirse en **TypeScript**, garantizando interfaces compartidas para modelos de datos, evitando errores de tipo en tiempo de ejecución.
- **`RNF-17` Despliegue Automatizado con Docker**: El sistema debe contener archivos de configuración `Dockerfile` y `docker-compose.yml` listos para desplegar la base de datos PostgreSQL, el backend Node.js y el frontend empaquetado con Nginx en cualquier sistema operativo compatible con Docker.
- **`RNF-18` Compatibilidad con Servicios Cloud Modernos**: La arquitectura debe soportar despliegue serverless o PaaS (PostgreSQL en Supabase/Neon, API Backend en Render/Railway y Frontend estático en Vercel/Netlify).

---

## 5. Matriz de Trazabilidad de Permisos por Rol (RBAC)

| Módulo / Acción del Sistema | Requerimiento | Administrador | Soporte Técnico | Técnico de Campo | Código HTTP en Rechazo |
| :--- | :---: | :---: | :---: | :---: | :---: |
| Iniciar sesión y autenticarse | `RF-01` | ✔ Permitido | ✔ Permitido | ✔ Permitido | 401 Unauthorized |
| Cambiar de rol en demostración | `RF-03` | ✔ Permitido | ✔ Permitido | ✔ Permitido | — |
| Ver mapa y ubicación de NAPs | `RF-09`, `RF-18` | ✔ Permitido | ✔ Permitido | ✔ Permitido | 401 Unauthorized |
| Registrar nueva caja NAP | `RF-08` | ✔ Permitido | ✔ Permitido | ⛔ Prohibido | **403 Forbidden** |
| Calibrar coordenadas GPS de NAP | `RF-10` | ✔ Permitido | ✔ Permitido | ✔ Permitido | 401 Unauthorized |
| Ver matriz de 16 puertos de NAP | `RF-11` | ✔ Permitido | ✔ Permitido | ✔ Permitido | 401 Unauthorized |
| Asignar nuevo abonado a puerto libre | `RF-12` | ✔ Permitido | ✔ Permitido | ✔ Permitido | 409 si hay colisión |
| Liberar puerto ocupado (desvincular) | `RF-13` | ✔ Permitido | ✔ Permitido | ⛔ Prohibido | **403 Forbidden** |
| Marcar puerto Dañado / Mantenimiento | `RF-14` | ✔ Permitido | ✔ Permitido | ⛔ Prohibido | **403 Forbidden** |
| Consultar padrón de clientes | `RF-15`, `RF-16` | ✔ Permitido | ✔ Permitido | ✔ Permitido | 401 Unauthorized |
| Modificar datos de cliente abonado | `RF-17` | ✔ Permitido | ✔ Permitido | ⛔ Prohibido | **403 Forbidden** |
| Operación sin conexión (Offline-First) | `RF-21`, `RF-22` | ✔ Permitido | ✔ Permitido | ✔ Permitido | — |
| Descargar Reporte PDF Ejecutivo | `RF-25`, `RF-26` | ✔ Permitido | ✔ Permitido | ⛔ Prohibido | **403 Forbidden** |
| Administrar usuarios del sistema | `RF-04` | ✔ Permitido | ⛔ Prohibido | ⛔ Prohibido | **403 Forbidden** |
| Iniciar sesión y autenticarse | `RF-01` | Permitido | Permitido | Permitido | 401 Unauthorized |
| Cambiar de rol en demostración | `RF-03` | Permitido | Permitido | Permitido | — |
| Ver mapa y ubicación de NAPs | `RF-09`, `RF-18` | Permitido | Permitido | Permitido | 401 Unauthorized |
| Registrar nueva caja NAP | `RF-08` | Permitido | Permitido | Prohibido | **403 Forbidden** |
| Calibrar coordenadas GPS de NAP | `RF-10` | Permitido | Permitido | Permitido | 401 Unauthorized |
| Ver matriz de 16 puertos de NAP | `RF-11` | Permitido | Permitido | Permitido | 401 Unauthorized |
| Asignar nuevo abonado a puerto libre | `RF-12` | Permitido | Permitido | Permitido | 409 si hay colisión |
| Liberar puerto ocupado (desvincular) | `RF-13` | Permitido | Permitido | Prohibido | **403 Forbidden** |
| Marcar puerto Dañado / Mantenimiento | `RF-14` | Permitido | Permitido | Prohibido | **403 Forbidden** |
| Consultar padrón de clientes | `RF-15`, `RF-16` | Permitido | Permitido | Permitido | 401 Unauthorized |
| Modificar datos de cliente abonado | `RF-17` | Permitido | Permitido | Prohibido | **403 Forbidden** |
| Operación sin conexión (Offline-First) | `RF-21`, `RF-22` | Permitido | Permitido | Permitido | — |
| Descargar Reporte PDF Ejecutivo | `RF-25`, `RF-26` | Permitido | Permitido | Prohibido | **403 Forbidden** |
| Administrar usuarios del sistema | `RF-04` | Permitido | Prohibido | Prohibido | **403 Forbidden** |

---

## 6. Conclusión Técnica

La presente especificación de requerimientos funcionales y no funcionales consolida el diseño arquitectónico del **Sistema de Inventario y Mapeo Lógico GPON / FTTx**, garantizando consistencia matemática en transacciones de fibra, alta disponibilidad para operaciones móviles en campo y estricta separación de responsabilidades de seguridad corporativa.

