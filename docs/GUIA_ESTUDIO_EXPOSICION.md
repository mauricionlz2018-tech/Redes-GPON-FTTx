# GUIA DE ESTUDIO Y DEFENSA DE AVANCE DE PROYECTO
## Residencia Profesional - Ingenieria en Sistemas Computacionales
## Universidad Mexiquense del Bicentenario - UES San Jose del Rincon

---

## 1. FICHA TECNICA GENERAL

- Titulo del Proyecto: Sistema de Inventario y Mapeo Logico de Redes GPON / FTTx
- Estudiante expositor: Mauricio Nolazco Lonjino
- Asesor Interno: I.S.C. Leonardo Becerril Sanchez
- Asesor Externo: L.I.A. Oscar Isaac Mendoza Garcia
- Empresa receptora: GPON TELECOM S.A. de C.V.
- Entorno de aplicacion: Municipio de San Jose del Rincon, Estado de Mexico
- Tecnologias principales: Node.js, Express, TypeScript, PostgreSQL, Docker, React 18, Tailwind CSS, Leaflet, PWA (IndexedDB / Dexie.js)

---

## 2. ESTRUCTURA Y TIEMPOS DE LA EXPOSICION

- Tiempo total recomendado: 6 a 8 minutos de exposicion oral, mas 1 a 2 minutos de demostracion practica y sesion de preguntas.
- Distribucion del tiempo:
  - Diapositiva 1 (Portada): 30 segundos
  - Diapositiva 2 (Introduccion y Contexto): 1 minuto
  - Diapositiva 3 (Planteamiento del Problema): 1 minuto 15 segundos
  - Diapositiva 4 (Justificacion): 1 minuto
  - Diapositiva 5 (Objetivos del Proyecto): 1 minuto
  - Diapositiva 6 (Herramientas Tecnologicas y Arquitectura): 1 minuto 30 segundos
  - Diapositiva 7 (Conclusion y Estado de Avance): 1 minuto
  - Demostracion opcional en vivo: 1 a 2 minutos

---

## 3. GUION DETALLADO DIAPOSITIVA POR DIAPOSITIVA

### Diapositiva 1: Portada
- Objetivo: Presentarte con seriedad, enunciar el titulo formal del proyecto y dar el credito correspondiente a la institucion, asesores y empresa.
- Que decir textualmente:
  "Buenos dias, profesor Leonardo Becerril, companeros y presentes. Mi nombre es Mauricio Nolazco Lonjino, estudiante del ultimo semestre de la carrera de Ingenieria en Sistemas Computacionales en la Universidad Mexiquense del Bicentenario, Unidad de Estudios Superiores San Jose del Rincon.
  El dia de hoy presento ante ustedes el avance de mi proyecto de residencia profesional titulado: 'Sistema de Inventario y Mapeo Logico de Redes GPON / FTTx', desarrollado para la empresa GPON TELECOM S.A. de C.V., bajo la asesoria interna del Ingeniero Leonardo Becerril Sanchez y la asesoria externa del Licenciado Oscar Isaac Mendoza Garcia."

### Diapositiva 2: Introduccion
- Objetivo: Explicar de forma sencilla que es una red GPON y ubicar el problema en San Jose del Rincon.
- Puntos clave: Red pasiva (sin electricidad intermedia), fibra hasta el hogar (FTTH), cajas NAP en postes.
- Que decir textualmente:
  "Para comprender el alcance de este proyecto, es importante recordar que las redes opticas pasivas con capacidad Gigabit, conocidas como GPON, son el estandar dominante para llevar internet de alta velocidad mediante fibra optica hasta el usuario final.
  Se denominan pasivas porque entre la central del proveedor y el domicilio del cliente no existe ningun equipo electronico intermedio que consuma energia electrica; todo el transporte de la luz se gestiona mediante divisores opticos pasivos, conocidos como splitters, y cajas terminales instaladas en la via publica, denominadas cajas NAP.
  En zonas con amplia dispersion geografica como San Jose del Rincon, la red de fibra optica crece continuamente. No obstante, este crecimiento genera un reto critico: si no existe un control riguroso de cada hilo de fibra, cada caja y cada conector, la infraestructura se vuelve inmanejable y propensa a fallas operativas."

### Diapositiva 3: Planteamiento del Problema
- Objetivo: Demostrar con claridad los 3 dolores operativos reales de la empresa.
- Puntos clave:
  1. Hojas de calculo y libretas manuales desfasadas.
  2. Cruces de puertos y desconexion accidental de clientes.
  3. Zonas rurales sin cobertura celular donde se trabaja a ciegas.
- Que decir textualmente:
  "En la operacion diaria de GPON TELECOM se detecto una problematica recurrente: el desfase de informacion entre las cuadrillas de tecnicos en campo y el area de soporte en oficina.
  Historicamente, el control de puertos se apoyaba en anotaciones en papel o en hojas de calculo aisladas. Esto detonaba tres problemas criticos:
  Primero, saturacion imprevista de cajas terminales. El tecnico se desplazaba varios kilometros para instalar un servicio asumiendo que habia disponibilidad, y al subir al poste encontraba la caja totalmente saturada.
  Segundo, cruces y colision de puertos. Al no existir sincronizacion en tiempo real, dos tecnicos podian registrar al mismo tiempo al mismo conector fisico, provocando la suspension involuntaria de clientes activos.
  Tercero, perdida de conectividad en campo. En zonas rurales de San Jose del Rincon donde no hay cobertura celular, los tecnicos no podian consultar el inventario central y se veian obligados a instalar a ciegas, provocando duplicidad de registros y traslados infructuosos."

### Diapositiva 4: Justificacion
- Objetivo: Argumentar por que el proyecto aporta valor empresarial y valor de ingenieria en sistemas.
- Puntos clave: Ahorro de costos y gasolina, transacciones ACID para evitar sobreventa, Offline-First para zonas sin senal.
- Que decir textualmente:
  "La justificacion de este desarrollo se fundamenta en dos vertientes:
  Desde el ambito operativo, la empresa requeria una plataforma que eliminara tiempos muertos, traslados innecesarios y costos por cancelacion de servicios, garantizando una unica fuente de verdad para el personal de oficina y de campo.
  Desde el punto de vista tecnologico y de ingenieria de software, el proyecto representa una solucion viable y robusta. No se limita a un formulario web convencional; resuelve de fondo el problema de la concurrencia de datos mediante transacciones ACID en PostgreSQL con bloqueo pesimista a nivel de fila, impidiendo que un mismo puerto pueda venderse dos veces de forma simultanea.
  Asimismo, incorpora una arquitectura Offline-First que garantiza la continuidad operativa de los instaladores aun cuando no cuenten con senal celular."

### Diapositiva 5: Objetivos del Proyecto
- Objetivo: Presentar las metas formales del trabajo de residencia.
- Puntos clave:
  - Objetivo general: Sistema web de inventario y mapeo logico.
  - Especifico 1: Analisis y modelo de datos relacional.
  - Especifico 2: Interfaz web responsiva con estado de puertos (libres, ocupados, danados).
  - Especifico 3: Backend transaccional centralizado para vincular clientes y puertos.
- Que decir textualmente:
  "Para dar solucion a esta problematica, se definieron los siguientes objetivos:
  Como Objetivo General: Desarrollar una aplicacion web para el inventario y mapeo logico de redes GPON / FTTx, mediante vistas tabulares y diagramas interactivos, para optimizar el control de la infraestructura en GPON TELECOM.
  Como Objetivos Especificos:
  1. Analizar los requerimientos de planta externa mediante el levantamiento de hardware como ODF y cajas NAP, disenando la arquitectura y el modelo de datos relacional.
  2. Construir una interfaz web responsiva orientada a dispositivos moviles para que los tecnicos en campo consulten y actualicen en sitio el estado de los puertos: libre, ocupado o danado.
  3. Programar el backend del sistema mediante una API REST centralizada con control transaccional, garantizando la integridad de los datos al vincular abonados a la infraestructura fisica."

### Diapositiva 6: Herramientas Tecnologicas y Arquitectura
- Objetivo: Demostrar solidez tecnica, explicando la arquitectura cliente-servidor desacoplada.
- Puntos clave:
  - Backend: Node.js, Express, TypeScript, Zod, JWT, RBAC, PDFKit.
  - Base de datos: PostgreSQL con bloqueo pesimista (SELECT FOR UPDATE) y Docker.
  - Frontend: React 18, Tailwind CSS, Leaflet con semaforizacion, Dexie.js (IndexedDB).
- Que decir textualmente:
  "La arquitectura del sistema fue disenada bajo un esquema desacoplado cliente-servidor, seleccionando tecnologias modernas y de codigo abierto:
  En la capa de Backend, utilizamos Node.js y Express con TypeScript, asegurando tipado estricto y prevencion de errores en ejecucion. Implementamos esquemas de validacion con Zod, seguridad con JSON Web Tokens y control de acceso basado en roles para diferenciar a Administradores, Soporte Tecnico y Tecnicos de Campo. Ademas, integramos PDFKit para la generacion automatica de reportes ejecutivos.
  En la capa de Base de Datos, se selecciono PostgreSQL contenerizado con Docker. Para resolver la concurrencia masiva implementamos bloqueos pesimistas mediante la clausula SELECT FOR UPDATE. De esta forma, si dos tecnicos intentan asignar el mismo puerto al mismo tiempo, la base de datos bloquea el registro: el primero concluye exitosamente y el segundo recibe un codigo HTTP 409 de conflicto, eliminando cualquier condicion de carrera.
  En la capa de Frontend, se desarrollo una aplicacion en React 18 con Tailwind CSS. Para la cartografia se implemento Leaflet sobre OpenStreetMap, desplegando un semaforo visual de tres colores segun la saturacion de cada caja NAP: verde para disponible, amarillo para alerta y rojo para saturada.
  Finalmente, para el trabajo en campo sin senal, se configuro como Aplicacion Web Progresiva utilizando IndexedDB mediante la libreria Dexie.js, encolando operaciones localmente y sincronizandolas de forma automatica en cuanto se recupera la red."

### Diapositiva 7: Conclusion y Estado de Avance
- Objetivo: Cerrar con seguridad, relacionar con el cronograma y dejar la puerta abierta a preguntas.
- Que decir textualmente:
  "A manera de conclusion de este avance, el proyecto ha completado exitosamente la fase de investigacion, especificacion de requerimientos y diseno arquitectonico, contando actualmente con el modelo relacional implementado y prototipos funcionales validados contra pruebas de estres y concurrencia.
  Esta solucion digital reemplaza definitivamente los registros manuales en papel, suprime la duplicidad de puertos y dota a GPON TELECOM de una herramienta escalable y profesional adaptada a la realidad geografica de San Jose del Rincon.
  Agradezco profundamente la atencion del profesor Leonardo Becerril y de los presentes, y quedo a su disposicion para atender cualquier duda o realizar una demostracion practica del sistema."

---

## 4. GUIA DE DEMOSTRACION EN VIVO (1 A 2 MINUTOS)

Si el asesor solicita ver el software funcionando, sigue este recorrido estructurado:

1. Inicio de la aplicacion:
   - Ejecutar el archivo 'iniciar.bat' previamente o mantener el navegador abierto en 'http://localhost:3000'.
   - Mencionar: "La plataforma esta conectada a una base de datos PostgreSQL y cuenta con credenciales de acceso rapido para pruebas de auditoria".

2. Pantalla de Mapa Cartografico (MapViewPage):
   - Mostrar el mapa centrado en San Jose del Rincon.
   - Senalar los marcadores: "Cada circulo es una caja NAP georreferenciada con coordenadas GPS. El color indica su nivel de ocupacion: verde menos del 70%, amarillo entre 70% y 99%, y rojo 100% saturada".

3. Matriz Fisica de la Caja NAP (NapPortMatrix):
   - Hacer clic en una caja NAP para abrir la vista modal.
   - Senalar: "El sistema reproduce la distribucion fisica real de los 16 puertos de la caja con luces LED de estado. El tecnico puede visualizar que cliente esta conectado a cada puerto, la fecha de alta y el nivel de atenuacion optica registrado en decibelios".

4. Asignacion y Control de Acceso:
   - Mostrar el conmutador de roles en pantalla: "Si inicio sesion como Tecnico de Campo, tengo permisos para dar de alta abonados y calibrar coordenadas GPS en sitio, pero el sistema me bloquea operaciones criticas como borrar cajas o modificar registros globales, arrojando codigos de seguridad HTTP 403 Forbidden".

5. Reporte Ejecutivo (ReportsPage):
   - Descargar el PDF generado: "El modulo administrativo compila al instante el porcentaje de ocupacion global y el listado de clientes mediante flujos de datos en memoria, sin sobrecargar el servidor".

---

## 5. BANCO DE PREGUNTAS Y RESPUESTAS TECNICAS

### Bloque A: Preguntas habituales del Asesor Interno (Nivel Ingenieria)

Pregunta 1: Por que seleccionaste una base de datos relacional como PostgreSQL en lugar de una base de datos documental como MongoDB?
Respuesta sugerida:
"Porque la topologia de una red de telecomunicaciones GPON es estrictamente jerarquica y relacional: un ODF central agrupa puertos PON, de los cuales derivan hilos de fibra troncal que llegan a cajas NAP, y estas a su vez contienen puertos fisicos vinculados a clientes abonados. La integridad referencial mediante llaves foraneas es indispensable. Ademas, PostgreSQL ofrece soporte nativo de transacciones ACID y bloqueos a nivel de fila mediante SELECT FOR UPDATE, lo cual es imprescindible para evitar condiciones de carrera en la venta de puertos. En MongoDB la consistencia es eventual por defecto, lo que incrementaria el riesgo de duplicidad en campo."

Pregunta 2: Como garantizas que no se vendan dos servicios en el mismo conector fisico al mismo tiempo?
Respuesta sugerida:
"A traves de una transaccion de base de datos con bloqueo pesimista. Cuando el backend recibe la solicitud de conexion, abre una transaccion y ejecuta un query con la clausula FOR UPDATE sobre el registro de ese puerto fisico. Esto adquiere un bloqueo exclusivo. Si otra cuadrilla intenta asignar el mismo puerto exactamente en el mismo milisegundo, su peticion queda esperando hasta que la primera transaccion realiza COMMIT. Al liberarse, la segunda transaccion detecta que el estado del puerto cambio a 'Ocupado' y el backend retorna un codigo HTTP 409 Conflict, denegando la asignacion y protegiendo los datos."

Pregunta 3: Como se resolvio el problema de operacion en zonas rurales sin cobertura celular?
Respuesta sugerida:
"Mediante una arquitectura Offline-First implementada como Aplicacion Web Progresiva (PWA). En el cliente utilizamos la base de datos IndexedDB en el navegador gestionada a traves de la biblioteca Dexie.js. Cuando el dispositivo detecta perdida de senal, las asignaciones de clientes y actualizaciones de coordenadas GPS se guardan en una cola local de operaciones pendientes. Al restablecerse el enlace celular, un worker en segundo plano procesa la cola y envia las peticiones al servidor de manera idempotente."

Pregunta 4: Que parametros opticos y fisicos registra el sistema sobre la red?
Respuesta sugerida:
"Se registran datos clave de infraestructura: identificador del ODF, chasis del puerto PON, identificador de caja NAP, numero de puerto fisico del 1 al 16, estado operativo (Libre, Ocupado, Danado), coordenadas GPS satelitales (latitud y longitud), nombre y direccion del abonado, y nivel de atenuacion optica medido en decibelios milivatio (dBm), conforme a las recomendaciones del estandar ITU-T G.984."

Pregunta 5: Como esta estructurada la seguridad de los servicios web?
Respuesta sugerida:
"La API REST implementa autenticacion sin estado basada en JSON Web Tokens (JWT). Cada peticion HTTP incluye en su cabecera un Bearer Token firmado con algoritmo HMAC-SHA256. Un middleware valida la vigencia del token y ejecuta un control de acceso basado en roles (RBAC), impidiendo que perfiles operativos ejecuten endpoints administrativos y respondiendo con codigos estandar HTTP 401 Unauthorized o 403 Forbidden."

---

### Bloque B: Preguntas habituales de Alumnos o Companeros

Pregunta 6: Que es exactamente una caja NAP y que funcion tiene en la calle?
Respuesta sugerida:
"La caja NAP, que significa Network Access Point o Punto de Acceso a la Red, es la caja sellada de plastico que vemos sujeta a los postes de luz. Su funcion es alojar un divisor optico pasivo y ofrecer conectores externos donde los instaladores acoplan el cable que llega hasta el modem de cada casa."

Pregunta 7: Por que una empresa no puede resolver esto simplemente con Google Sheets o Excel compartido?
Respuesta sugerida:
"Porque Excel no cuenta con control de concurrencia transaccional: si dos personas abren el archivo sin conexion o simultaneamente y escriben sobre la misma fila, uno de los registros se sobreescribe y se pierde. Ademas, Excel no ofrece semaforizacion cartografica en tiempo real sobre mapas GPS, ni controla roles de acceso a nivel de API, ni cuenta con validaciones estrictas de hardware."

Pregunta 8: Que fue lo que mas tiempo o trabajo te costo desarrollar?
Respuesta sugerida:
"El mayor desafio tecnico fue sincronizar la cola de operaciones fuera de linea con el servidor central, asegurando que cuando el tecnico recupere la conexion en carretera, los paquetes se envien en el orden correcto sin generar registros duplicados ni bloqueos en la base de datos."

Pregunta 9: Como se carga el mapa en la aplicacion web?
Respuesta sugerida:
"Se utiliza la libreria de codigo abierto Leaflet vinculada al servicio cartografico de OpenStreetMap. El frontend consume las coordenadas almacenadas en PostgreSQL y genera capas vectoriales interactivas con iconos dinamicos que cambian de color dependiendo del porcentaje de ocupacion de cada punto."

---

## 6. FORMULA DE CONTINGENCIA ANTE PREGUNTAS DESCONOCIDAS

Si el asesor o algun companero formula una pregunta muy especializada o sobre una funcion que aun no esta implementada:

Regla fundamental:
- Nunca responder con un 'No se', 'No me acuerdo' ni proporcionar informacion inventada.

Formula de respuesta profesional:
"Es una observacion muy pertinente. En la presente etapa de desarrollo priorizamos la robustez del motor transaccional, la consistencia del inventario y la capacidad de operacion fuera de linea. Ese punto especifico se encuentra contemplado para su analisis e integracion en la siguiente fase de pruebas del proyecto, conforme a lo establecido en el cronograma de actividades."

Si se trata de una sugerencia de mejora:
"Muchas gracias por la sugerencia. Es una aportacion muy valiosa para enriquecer la experiencia de usuario y la documentacion de entrega final de la residencia."

---

## 7. GLOSARIO TECNICO ESENCIAL

- GPON (Gigabit-capable Passive Optical Network): Estandar de telecomunicaciones ITU-T G.984 que permite transmitir datos por fibra optica a velocidades de 2.488 Gbps de bajada y 1.244 Gbps de subida mediante division pasiva de la senal.
- FTTx / FTTH: Fiber to the x / Fiber to the Home. Arquitectura de telecomunicaciones donde el enlace de fibra llega directamente hasta el interior del domicilio.
- ODF (Optical Distribution Frame): Bastidor o distribuidor optico central donde terminan los cables multifibra provenientes de la planta externa y se interconectan a los puertos de la OLT.
- OLT (Optical Line Terminal): Equipo activo ubicado en la central del proveedor que emite y recibe los pulsos de luz hacia toda la red pasiva.
- Caja NAP (Network Access Point): Caja de empalme y distribucion exterior colocada en postes para conectar las acometidas de los clientes finales.
- Splitter PLC: Divisor optico pasivo basado en circuitos de ondas de luz planas que divide un haz de luz de entrada en multiples salidas (por ejemplo 1:8 o 1:16).
- Atenuacion Optica: Perdida de potencia de la senal luminosa a lo largo de la fibra optica, medida en decibelios (dB) o decibelios milivatio (dBm).
- Concurrencia: Capacidad de un sistema para procesar multiples peticiones o transacciones de manera simultanea sin generar corrupcion de datos.
- Bloqueo Pesimista (Pessimistic Locking): Estrategia de base de datos donde se bloquea un registro en el momento de su lectura para evitar que otros procesos lo modifiquen hasta que la transaccion actual concluya.
- ACID: Acronimo de las cuatro propiedades fundamentales de las transacciones en bases de datos: Atomicidad, Consistencia, Aislamiento (Isolation) y Durabilidad.
- PWA (Progressive Web App): Aplicacion web que utiliza tecnologias modernas como Service Workers e IndexedDB para ofrecer una experiencia similar a una aplicacion nativa, incluyendo trabajo sin conexion a internet.
- IndexedDB: Sistema de almacenamiento no relacional integrado en el navegador web que permite persistir grandes volumenes de datos en el cliente.
- Dexie.js: Libreria de JavaScript que proporciona una interfaz sencilla, tipada y basada en promesas sobre la API nativa de IndexedDB.
- Leaflet: Biblioteca JavaScript de codigo abierto para la creacion y manipulacion de mapas interactivos adaptables a dispositivos moviles.
- RBAC (Role-Based Access Control): Metodo de control de seguridad informatica que restringe el acceso a recursos del sistema en funcion del rol asignado a cada usuario.
- HTTP 409 Conflict: Codigo de estado HTTP que indica que la peticion no pudo ser procesada debido a un conflicto con el estado actual del recurso en el servidor.
- HTTP 403 Forbidden: Codigo de estado HTTP que senala que el servidor entendio la peticion pero el usuario autenticado carece de permisos suficientes para ejecutarla.

---

## 8. RECOMENDACIONES DE LENGUAJE CORPORAL Y PRESENTACION

1. Postura y presencia:
   - Mantener una postura erguida con los hombros relajados.
   - Apoyar ambos pies firmes sobre el piso; evitar balancearse de un lado a otro por nerviosismo.
2. Contacto visual:
   - Alternar la mirada: un 60% del tiempo hacia el asesor interno y un 40% hacia los alumnos presentes. Esto demuestra seguridad y control de grupo.
3. Ritmo de voz y pausas:
   - No apresurar las palabras. Un ritmo pausado y con volumen claro transmite madurez tecnica.
   - Si se presenta sensacion de bloqueo mental, respirar profundamente por la nariz durante dos segundos, mirar las notas y retomar con la siguiente frase clave.
4. Uso de la pantalla:
   - No darle la espalda al publico para leer las diapositivas. Las diapositivas son un soporte visual para la audiencia, no un teleprompter para el expositor.
