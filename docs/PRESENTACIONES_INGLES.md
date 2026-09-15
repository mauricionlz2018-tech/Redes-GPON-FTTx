# Guía de Presentaciones en Inglés (3 Parciales)
## Sistema de Inventario y Mapeo Lógico GPON / FTTx
**GPON TELECOM S.A. de C.V. — Residencia Profesional / UES San José del Rincón**

---

## 🎯 Instrucciones Generales para las Presentaciones

1. **Límite de tiempo**: Máximo **3 minutos** por presentación.
   - Cada guión está calculado para durar entre **2:00 y 2:30 minutos** a un ritmo normal y pausado (aprox. 110 a 125 palabras por minuto).
   - Esto te deja un margen de seguridad de 30 a 60 segundos por si hablas más despacio o haces pausas.
2. **Estructura recomendada**:
   - **0:00 - 0:25**: Saludo, tu nombre y el título/objetivo de la presentación.
   - **0:25 - 1:45**: Contenido principal (Problema, Desarrollo o Pruebas según el parcial).
   - **1:45 - 2:15**: Conclusión y valor aportado.
   - **2:15 - 2:30**: Agradecimiento y apertura a preguntas (*"Thank you. I welcome your questions"*).
3. **Consejos para memorizar y pronunciar**:
   - No intentes hablar rápido. Hablar claro y con pausas suena mucho más profesional.
   - Practica con un cronómetro frente al espejo o grabándote con tu celular.
   - Si te trabas en una palabra, respira un segundo, sonríe y continúa con la siguiente frase.

---

## 🗣️ Guía de Pronunciación de Términos Clave

| Término Técnico | Pronunciación Aproximada en Español | Significado |
| :--- | :--- | :--- |
| **GPON** | *"yi-pon"* | Red Óptica Pasiva con Capacidad Gigabit |
| **FTTx / FTTH** | *"ef-ti-ti-eks"* / *"ef-ti-ti-eich"* | Fibra hasta la X / Hogar |
| **NAP Box** | *"nap boks"* | Caja de Distribución Terminal |
| **ODF** | *"ou-di-ef"* | Distribuidor Óptico Central |
| **ACID** | *"ásid"* | Atomicidad, Consistencia, Aislamiento y Durabilidad |
| **Pessimistic Locking** | *"pesimístik lóking"* | Bloqueo pesimista |
| **PostgreSQL** | *"poust-gres-kiu-el"* | Motor de Base de Datos |
| **Simultaneous** | *"saimol-téinios"* | Simultáneo |
| **Concurrency** | *"kon-kérrensi"* | Concurrencia |
| **Queue / Queued** | *"kiu"* / *"kiud"* | Cola / Encolado |
| **Offline-First** | *"of-lain-ferst"* | Primero sin conexión |
| **Leaflet** | *"líf-let"* | Biblioteca de mapas |
| **Conflict (409)** | *"kónflikt"* | Conflicto HTTP |
| **Forbidden (403)** | *"for-bíden"* | Prohibido HTTP |
| **Attenuation** | *"ateniu-éishon"* | Atenuación óptica |
| **Decibels (dBm)** | *"désibels"* / *"di-bi-em"* | Decibelios milivatio |

---

# 📌 PARCIAL 1: Presentación del Proyecto (Overview & Problem Statement)

### ⏱️ Duración estimada: ~2 minutos y 15 segundos (~215 palabras)

---

### 🇺🇸 Speech in English (Texto para Estudiar y Presentar)

> *"Good morning, professor and classmates.*
>
> *Today, I am pleased to present our project: **'GPON and FTTx Logical Network Mapping and Inventory System'**, developed for **GPON Telecom**.*
>
> *In modern telecommunications, fiber optic networks are expanding rapidly. However, many Internet Service Providers still manage their physical infrastructure manually, using spreadsheets or paper notes.*
>
> *In rural and semi-urban areas like **San José del Rincón**, this manual approach causes three critical problems:*
> * **First**, terminal access boxes—known as **NAP boxes**—saturate unexpectedly without prior warning.*
> * **Second**, field technicians working at the same time can accidentally assign two different customers to the exact same physical optical port.*
> * **And third**, in areas with poor cellular signal, technicians cannot access central records, leading to blind installations and lost time.*
>
> *To solve this, we designed a comprehensive web platform for fiber infrastructure management.*
>
> *Our system covers the complete passive network:*
> * *It tracks the Central Optical Distribution Frame (ODF), PON ports, and optical cables.*
> * *It visualizes every NAP box on an interactive map using GPS coordinates.*
> * *And it features an **Offline-First architecture**, allowing technicians to work smoothly even without internet connection.*
>
> *In conclusion, our objective is to eliminate duplicate connections, optimize technical response times, and provide real-time visibility of the whole network.*
>
> *Thank you very much for your attention. I am happy to answer any questions."*

---

### 🇲🇽 Traducción al Español (Para Entender Cada Línea)

> "Buenos días, profesor y compañeros.  
> Hoy me complace presentar nuestro proyecto: **'Sistema de Inventario y Mapeo Lógico de Redes GPON y FTTx'**, desarrollado para **GPON Telecom**.  
>  
> En las telecomunicaciones modernas, las redes de fibra óptica se expanden rápidamente. Sin embargo, muchos proveedores de internet todavía administran su infraestructura física manualmente, usando hojas de cálculo o notas en papel.  
>  
> En zonas rurales y semiurbanas como **San José del Rincón**, este enfoque manual provoca tres problemas críticos:  
> * **Primero**, las cajas terminales de acceso —conocidas como **cajas NAP**— se saturan de forma imprevista sin previo aviso.  
> * **Segundo**, los técnicos en campo que trabajan al mismo tiempo pueden asignar accidentalmente a dos clientes diferentes al mismo puerto óptico físico.  
> * **Y tercero**, en áreas con poca señal celular, los técnicos no pueden consultar los registros centrales, lo que causa instalaciones a ciegas y pérdida de tiempo.  
>  
> Para solucionar esto, diseñamos una plataforma web integral para la gestión de infraestructura de fibra.  
>  
> Nuestro sistema abarca toda la red pasiva:  
> * Da seguimiento al Distribuidor Óptico Central (ODF), puertos PON y cables ópticos.  
> * Visualiza cada caja NAP en un mapa interactivo mediante coordenadas GPS.  
> * Y cuenta con una **arquitectura Offline-First**, permitiendo a los técnicos trabajar sin problemas incluso sin conexión a internet.  
>  
> En conclusión, nuestro objetivo es eliminar conexiones duplicadas, optimizar los tiempos de respuesta técnica y ofrecer visibilidad en tiempo real de toda la red.  
>  
> Muchas gracias por su atención. Con gusto respondo cualquier pregunta."

---

### ❓ Posibles Preguntas del Profesor (Parcial 1)

1. **Question**: *"Why did you choose an Offline-First approach?"*  
   **Answer**: *"Because in rural areas like San José del Rincón, cellular coverage is frequently lost. Technicians must be able to work and save data without internet."*  
   *(Porque en zonas rurales como San José del Rincón, la cobertura celular se pierde con frecuencia. Los técnicos deben poder trabajar y guardar datos sin internet).*

2. **Question**: *"What is the main goal of the project?"*  
   **Answer**: *"To replace manual spreadsheets with an automated, real-time map that prevents port duplication and tracks network saturation."*  
   *(Reemplazar las hojas de cálculo manuales con un mapa automatizado en tiempo real que previene duplicidad de puertos y monitorea la saturación).*

---

# 📌 PARCIAL 2: Desarrollo del Proyecto y Arquitectura (Technical Development)

### ⏱️ Duración estimada: ~2 minutos y 20 segundos (~245 palabras)

---

### 🇺🇸 Speech in English (Texto para Estudiar y Presentar)

> *"Good morning, professor and classmates.*
>
> *Today, for the second term, I will explain the technical development and software architecture of our GPON Mapping System.*
>
> *Our solution is built upon a modern, decoupled client-server architecture.*
>
> *On the backend, we use **Node.js** and **Express** with **TypeScript** for strict type safety. Data validation is enforced using **Zod schemas** to sanitize and validate every request before it hits the database.*
>
> *For our database, we selected **PostgreSQL**. The most critical engineering challenge was handling high concurrency. When multiple field technicians attempt to connect a customer to the same port at the exact same millisecond, our backend uses **ACID transactions with pessimistic row-level locking**—specifically `SELECT FOR UPDATE`.*
> *This guarantees that the first transaction succeeds, while the second receives a clean **HTTP 409 Conflict** error, completely preventing race conditions.*
>
> *On the frontend, we developed a responsive web application using **React** and **Tailwind CSS**.*
> *It features an interactive geospatial map powered by **Leaflet** and **OpenStreetMap**.*
> *Each NAP box displays a traffic-light status based on its saturation: **green** for available, **yellow** for warning, and **red** for fully saturated.*
> *Inside each box, technicians interact with a digital representation of the physical 16-port chassis with color-coded status LEDs.*
>
> *Finally, for field operations, we implemented a **Progressive Web App** using **IndexedDB**. If a technician enters an area without cellular signal, port changes are stored in a local queue and automatically synchronized once internet connectivity is restored.*
>
> *Thank you very much. I am ready for your questions."*

---

### 🇲🇽 Traducción al Español (Para Entender Cada Línea)

> "Buenos días, profesor y compañeros.  
> Hoy, para el segundo parcial, explicaré el desarrollo técnico y la arquitectura de software de nuestro Sistema de Mapeo GPON.  
>  
> Nuestra solución está construida sobre una arquitectura moderna cliente-servidor desacoplada.  
>  
> En el backend, utilizamos **Node.js** y **Express** con **TypeScript** para un tipado estricto. La validación de datos se aplica mediante **esquemas Zod** para sanitizar y validar cada petición antes de llegar a la base de datos.  
>  
> Para nuestra base de datos, elegimos **PostgreSQL**. El reto de ingeniería más crítico fue manejar la alta concurrencia. Cuando múltiples técnicos en campo intentan conectar un cliente al mismo puerto exactamente en el mismo milisegundo, nuestro backend utiliza **transacciones ACID con bloqueo pesimista a nivel de fila** —específicamente `SELECT FOR UPDATE`—.  
> Esto garantiza que la primera transacción tenga éxito, mientras que la segunda reciba un error limpio **HTTP 409 Conflict**, previniendo por completo las condiciones de carrera.  
>  
> En el frontend, desarrollamos una aplicación web responsiva usando **React** y **Tailwind CSS**.  
> Cuenta con un mapa geoespacial interactivo impulsado por **Leaflet** y **OpenStreetMap**.  
> Cada caja NAP muestra un estado estilo semáforo según su saturación: **verde** para disponible, **amarillo** para advertencia y **rojo** para totalmente saturada.  
> Dentro de cada caja, los técnicos interactúan con una representación digital del chasis físico de 16 puertos con LEDs de estado por colores.  
>  
> Finalmente, para el trabajo en campo, implementamos una **Aplicación Web Progresiva (PWA)** utilizando **IndexedDB**. Si un técnico entra a una zona sin señal celular, los cambios de puerto se guardan en una cola local y se sincronizan automáticamente en cuanto se recupera la conexión a internet.  
>  
> Muchas gracias. Estoy listo para sus preguntas."

---

### ❓ Posibles Preguntas del Profesor (Parcial 2)

1. **Question**: *"How does the system prevent two technicians from taking the same port?"*  
   **Answer**: *"Through PostgreSQL's pessimistic row-level locking. The database locks the port row during the transaction, so only one technician succeeds, and the other receives an HTTP 409 error."*  
   *(Mediante el bloqueo pesimista a nivel de fila de PostgreSQL. La base de datos bloquea la fila del puerto durante la transacción, de modo que solo un técnico tiene éxito y el otro recibe un error HTTP 409).*

2. **Question**: *"What technology do you use for offline data storage?"*  
   **Answer**: *"We use IndexedDB in the browser through Dexie.js to store pending operations in a local queue."*  
   *(Usamos IndexedDB en el navegador a través de Dexie.js para almacenar operaciones pendientes en una cola local).*

---

# 📌 PARCIAL 3: Pruebas, Validación y Resultados (Testing & Results)

### ⏱️ Duración estimada: ~2 minutos y 20 segundos (~240 palabras)

---

### 🇺🇸 Speech in English (Texto para Estudiar y Presentar)

> *"Good morning, professor and classmates.*
>
> *Today, for the final evaluation, I will present the testing phase, experimental validation, and conclusions of our GPON Network Mapping System.*
>
> *To verify that our platform is reliable and production-ready, we executed four key testing procedures:*
>
> * **First, Concurrency and Stress Testing:**  
>   *Using an automated script, we sent twenty simultaneous HTTP requests to the exact same optical port at the exact same millisecond.*  
>   *The result was a complete success: exactly one request succeeded with an **HTTP 201 Created** status, while the other nineteen were safely rejected with an **HTTP 409 Conflict** status. We achieved zero deadlocks and zero data corruptions.*
>
> * **Second, Security and Role-Based Access Control (RBAC):**  
>   *We validated user roles. Field technicians are strictly restricted from deleting or freeing occupied ports, receiving an **HTTP 403 Forbidden** status, while administrators and support maintain full permissions.*
>
> * **Third, Offline Synchronization Validation:**  
>   *We simulated field conditions by disabling network connectivity. We created port assignments offline using IndexedDB, and upon reconnecting, the queue synchronized automatically and idempotently to PostgreSQL without losing a single record.*
>
> * **Fourth, Executive Report Automation:**  
>   *We verified the automatic generation of official PDF reports using **PDFKit**, detailing network saturation rates, customer lists, and optical attenuation levels in decibels (dBm).*
>
> *In conclusion, the system achieved a **one hundred percent reduction** in port collision errors, decreased installation times, and provided full operational transparency.*
>
> *Thank you very much for your time and guidance throughout this project. I am open to any questions."*

---

### 🇲🇽 Traducción al Español (Para Entender Cada Línea)

> "Buenos días, profesor y compañeros.  
> Hoy, para la evaluación final, presentaré la fase de pruebas, la validación experimental y las conclusiones de nuestro Sistema de Mapeo de Redes GPON.  
>  
> Para verificar que nuestra plataforma es confiable y está lista para producción, ejecutamos cuatro procedimientos clave de prueba:  
>  
> * **Primero, Pruebas de Concurrencia y Estrés:**  
>   *Usando un script automatizado, enviamos veinte peticiones HTTP simultáneas al mismo puerto óptico exacto en el mismo milisegundo.*  
>   *El resultado fue un éxito total: exactamente una petición tuvo éxito con estado **HTTP 201 Created**, mientras que las otras diecinueve fueron rechazadas de forma segura con estado **HTTP 409 Conflict**. Logramos cero bloqueos mutuos y cero corrupciones de datos.*  
>  
> * **Segundo, Seguridad y Control de Acceso Basado en Roles (RBAC):**  
>   *Validamos los roles de usuario. Los técnicos de campo tienen estrictamente prohibido eliminar o liberar puertos ocupados, recibiendo un estado **HTTP 403 Forbidden**, mientras que los administradores y soporte mantienen todos los permisos.*  
>  
> * **Tercero, Validación de Sincronización Fuera de Línea:**  
>   *Simulamos condiciones de campo desactivando la conectividad de red. Realizamos asignaciones de puertos offline usando IndexedDB, y al reconectarnos, la cola se sincronizó de forma automática e idempotente con PostgreSQL sin perder un solo registro.*  
>  
> * **Cuarto, Automatización de Reportes Ejecutivos:**  
>   *Verificamos la generación automática de reportes oficiales en PDF utilizando **PDFKit**, detallando porcentajes de saturación de red, listados de clientes y niveles de atenuación óptica en decibelios (dBm).*  
>  
> *En conclusión, el sistema logró una **reducción del cien por ciento** en errores por colisión de puertos, disminuyó los tiempos de instalación y brindó total transparencia operativa.*  
>  
> Muchas gracias por su tiempo y orientación a lo largo de este proyecto. Quedo abierto a sus preguntas."

---

### ❓ Posibles Preguntas del Profesor (Parcial 3)

1. **Question**: *"What were the quantitative results of the concurrency stress test?"*  
   **Answer**: *"Out of twenty simultaneous requests, exactly one was accepted (HTTP 201) and nineteen were rejected (HTTP 409), proving one hundred percent transactional integrity."*  
   *(De veinte peticiones simultáneas, exactamente una fue aceptada (HTTP 201) y diecinueve fueron rechazadas (HTTP 409), demostrando un cien por ciento de integridad transaccional).*

2. **Question**: *"How does the system ensure data isn't duplicated during offline sync?"*  
   **Answer**: *"Through unique database constraints and idempotent backend operations, ensuring that retried requests do not create duplicate records."*  
   *(A través de restricciones únicas en la base de datos y operaciones backend idempotentes, asegurando que las peticiones reintentadas no creen registros duplicados).*

---

## 📋 Fichas Rápidas de Mano (Flashcards para el Día de la Exposición)

Si tu profesor te permite tener una tarjeta o ficha bibliográfica pequeña en la mano, puedes anotar estas viñetas clave en inglés para no perder el hilo:

### 📇 Flashcard - Term 1 (Project Overview)
- **Topic:** GPON / FTTx Network Mapping System for GPON Telecom.
- **The Problem:** Manual spreadsheets, NAP box saturation, port collisions, no cellular signal.
- **The Solution:** Web platform covering ODF, PON ports, GPS map (OpenStreetMap), and Offline-First sync.
- **Goal:** Real-time visibility, 0 duplicate ports, faster response times.

### 📇 Flashcard - Term 2 (Development)
- **Backend:** Node.js + Express + TypeScript + Zod validation.
- **Database & Concurrency:** PostgreSQL + ACID transactions + Pessimistic Row Locking (`SELECT FOR UPDATE`) -> Prevents race conditions with HTTP 409.
- **Frontend:** React + Tailwind CSS + Leaflet map (Green/Yellow/Red saturation) + 16-port virtual chassis.
- **Field/Mobile:** PWA + IndexedDB (Dexie.js) for local queuing and auto-sync.

### 📇 Flashcard - Term 3 (Testing & Results)
- **Stress Test:** 20 simultaneous HTTP requests -> 1 HTTP 201 Created vs 19 HTTP 409 Conflict. 0 deadlocks!
- **Security Test:** RBAC enforced. Field Tech gets HTTP 403 Forbidden on restricted endpoints.
- **Offline Test:** Disconnected network, assigned port in IndexedDB, reconnected -> 100% synced without data loss.
- **Reports:** Automated executive PDF with saturation rates & dBm optical attenuation.
- **Impact:** 100% elimination of port collision errors.

