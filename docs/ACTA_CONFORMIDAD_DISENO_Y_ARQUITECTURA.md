# ACTA DE CONFORMIDAD Y APROBACIÓN DE DISEÑO DE INTERFAZ (UI/UX), ACCESIBILIDAD Y ARQUITECTURA DE DATOS

**FOLIO OFICIAL:** `ACTA-CONF-DSN-2026-002`  
**PROYECTO:** Sistema de Inventario y Mapeo Lógico de Redes GPON / FTTx  
**ORGANIZACIÓN RECEPTORA:** GPON TELECOM S.A. de C.V.  
**INSTITUCIÓN EDUCATIVA:** Universidad Mexiquense del Bicentenario No aplica UES San José del Rincón  
**PROGRAMA ACADÉMICO:** Residencia Profesional No aplica Ingeniería en Sistemas Computacionales  
**FECHA DE EMISIÓN:** 13 de Octubre de 2026  
**LUGAR DE CONCERTACIÓN:** San José del Rincón, Estado de México  

---

## 1. DATOS GENERALES Y COMPARECIENTES

En las instalaciones de **GPON TELECOM S.A. de C.V.**, en el Municipio de San José del Rincón, Estado de México, siendo las 11:30 horas del día 13 de octubre de 2026, se constituyen las partes interesadas:

| Rol en el Proyecto | Nombre Completo | Cargo / Dependencia | Identificación / Cédula |
| :--- | :--- | :--- | :--- |
| **Diseñador UI/UX y Desarrollador** | C. Mauricio Nolazco Lonjino | Residente de Ing. en Sistemas Computacionales | Matrícula UMB: 13SC161 |
| **Asesor Externo (Empresa)** | L.I.A. Oscar Isaac Mendoza García | Asesor Técnico y Jefe de Proyecto en GPON TELECOM S.A. de C.V. | Céd. Prof. 8492019 / GPON-ID: OP-01 |
| **Asesor Interno (Académico)**| I.S.C. Leonardo Becerril Sánchez | Docente / Asesor de Residencia Profesional (UMB) | Céd. Prof. 7102941 / UMB-DEP-ISC |
| **Representante Empresarial** | Ing. Carlos Mendoza | Director de Operaciones y Redes GPON TELECOM | R.F.C.: GTE-180412-K71 |

---

## 2. OBJETO DEL ACTA

El presente instrumento tiene por objeto asentar la **Conformidad, Validación y Aprobación Formal del Diseño de Interfaz de Usuario (UI), Experiencia de Usuario (UX), Accesibilidad Visual bajo el Estándar Internacional WCAG 2.1 y la Arquitectura del Modelo Relacional de Base de Datos** para el software *"Sistema de Inventario y Mapeo Lógico GPON / FTTx"*.

Las partes han examinado detalladamente los prototipos de alta fidelidad maquetados para Figma, los tokens del sistema de diseño (*Design Tokens*), las pruebas fotométricas de luminancia relativa y contraste de color, los layouts adaptativos (*Responsive Design*) y las 11 tablas del esquema físico relacional en PostgreSQL.

---

## 3. DECLARACIONES Y ALCANCE TÉCNICO DE DISEÑO

1. **La Empresa Receptora (GPON TELECOM S.A. de C.V.)** valida que la interfaz gráfica propuesta:
   - Provee una representación fiel y ergonómica de la infraestructura pasiva en campo y de la cabecera OLT/ODF.
   - Implementa una matriz de 16 puertos que replica visualmente el chasis de una caja terminal NAP con microinteracciones y códigos LED comprensibles para el personal operativo.
   - Cumple con criterios ergonómicos aptos para visibilidad bajo luz solar directa en campo y modo nocturno para el centro de control NOC.
   - Modela fielmente en la base de datos la topología de red establecida por la recomendación internacional **ITU-T G.984**.
2. **El Asesor Interno (UMB)** dictamina que la arquitectura de diseño y modelado de datos cumple con las buenas prácticas de normalización relacional (3FN), integridad referencial y diseño centrado en el usuario.
3. **El Residente / Desarrollador** certifica la coincidencia exacta entre los prototipos aprobados y los componentes implementados en el entorno de producción web y móvil.

---

## 4. TABLA 1: TOKENS Y SISTEMA DE DISEÑO (DESIGN SYSTEM TOKENS)

Se aprueban formalmente las directrices estilísticas y variables fundamentales de diseño para toda la plataforma:

| Categoría de Token | Propiedad / Token | Valor Técnico Oficial | Propósito y Comportamiento en la UI |
| :--- | :--- | :--- | :--- |
| **Tipografía** | Fuente Primaria | `Inter, SF Pro Display, system-ui` | Alta legibilidad técnica en pantallas móviles y monitores de campo. |
| | Escala Tipográfica | `12px` (Caption), `14px` (Body), `16px` (Subtitle), `20px` (H2), `28px` (H1) | Jerarquía visual clara para telemetría óptica y rótulos de puertos. |
| **Espaciado y Grid** | Sistema Espacial | Rejilla base de `8px` (`4, 8, 12, 16, 24, 32, 48px`) | Alineación y ritmo vertical consistente en tarjetas y paneles. |
| **Bordes y Radios** | Border Radius | `rounded-lg (8px)`, `rounded-xl (12px)`, `rounded-full (píldoras)` | Estética moderna, limpia y suave para controles interactivos. |
| **Superficie y Fondos**| Fondo Base de App | `#F8FAFC` (Slate-50) / `#EEF3F8` (Ice Blue) | Fondo neutro que minimiza reflejos en dispositivos móviles. |
| | Tarjetas y Paneles | `#FFFFFF` (Blanco puro con borde `1px solid #E2E8F0`) | Contenedores modulares con sombras suaves (*shadow-sm / shadow-md*). |
| | Texto Principal | `#0F172A` (Slate-900) | Máxima legibilidad y contraste en cabeceras y títulos de cajas. |
| | Texto Secundario | `#334155` (Slate-700) y `#64748B` (Slate-500) | Etiquetas secundarias, coordenadas y datos de atenuación. |
| **Identidad Corporativa**| Color Primario | `#0284C7` (Sky-600) / `#0369A1` (Sky-700) | Color institucional que representa telecomunicaciones y fibra óptica. |
| | Color Secundario | `#4F46E5` (Índigo-600) / `#7C3AED` (Púrpura-600) | Destacado de privilegios administrativos y rutas de navegación. |
| **Semáforo GPON: Libre**| Puerto / Caja Libre | Fondo: `#DCFCE7` \| Borde: `#86EFAC` \| Texto: `#047857` \| LED: `#10B981` | Indica disponibilidad inmediata para nuevas instalaciones (<80%). |
| **Semáforo GPON: Ocupado**| Puerto Ocupado | Fondo: `#E0F2FE` \| Borde: `#7DD3FC` \| Texto: `#0369A1` \| LED: `#0284C7` | Indica cliente activo conectado 1:1 con módem ONT. |
| **Semáforo GPON: Reserva**| Puerto Reservado | Fondo: `#FEF3C7` \| Borde: `#FCD34D` \| Texto: `#B45309` \| LED: `#F59E0B` | Indica apartado preventivo o saturación de caja en alerta (80-99%). |
| **Semáforo GPON: Dañado** | Puerto Dañado / Crítico| Fondo: `#FEE2E2` \| Borde: `#FCA5A5` \| Texto: `#B91C1C` \| LED: `#EF4444` | Falla física en conector o caja saturada al 100% (cero libres). |
| **Vector de Fibra** | Trazado Troncal ADSS | Trazo vectorial sólido `#8D5B4C` con grosor de `4px` | Simulación cartográfica del cable autosoportado de 48 fibras. |

---

## 5. TABLA 2: MATRIZ MAESTRA DE PRUEBAS DE CONTRASTE Y ACCESIBILIDAD VISUAL (WCAG 2.1)

Evaluación fotométrica extraída de la interfaz real desplegada en producción (`/mapa`), certificando el cumplimiento de la norma internacional **W3C WCAG 2.1**:

| Zona de la Interfaz | Componente / Elemento Evaluado | Color Primer Plano | Color Fondo | Ratio de Contraste | Nivel AA (Texto $\ge 4.5:1$) | Nivel AAA (Texto $\ge 7.0:1$) | Dictamen Oficial WCAG 2.1 |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :--- |
| **1. Barra RBAC (Superior)** | **Botón Admin (Activo)** | `#FFFFFF` | `#4F46E5` | **6.29:1** | Cumple | Cumple (Grande) | **Aprobado AA y AAA Grande** |
| | **Botones Soporte / Técnico (Inactivos)** | `#334155` | `#FFFFFF` | **10.35:1** | Cumple | Cumple | **Excelente (Aprobado AAA)** |
| | **Badge "Datos de Prueba" (Texto)** | `#0369A1` | `#F0F9FF` | **5.57:1** | Cumple | Cumple (Grande) | **Aprobado AA y AAA Grande** |
| | **Pastilla "Demo" (Badge)** | `#FFFFFF` | `#0284C7` | **4.10:1** | Cumple (UI/Negrita) | No aplica | **Aprobado AA Componente UI** |
| **2. Barra Navbar** | **Pestaña "Mapa de Red" (Activa)** | `#0284C7` | `#E0F2FE` | **3.57:1** | Cumple (UI/Negrita) | No aplica | **Aprobado AA Componente UI** |
| | **Pestañas "Abonados" / "Reportes"** | `#334155` | `#FFFFFF` | **10.35:1** | Cumple | Cumple | **Excelente (Aprobado AAA)** |
| | **Botón "APK" (Descarga PWA)** | `#FFFFFF` | `#059669` | **3.77:1** | Cumple (UI/Negrita) | No aplica | **Aprobado AA Componente UI** |
| | **Badge "En Línea" (Online)** | `#047857` | `#ECFDF5` | **5.21:1** | Cumple | Cumple (Grande) | **Aprobado AA y AAA Grande** |
| | **Tag Rol "ADMIN" (Perfil)** | `#6D28D9` | `#EDE9FE` | **5.98:1** | Cumple | Cumple (Grande) | **Aprobado AA y AAA Grande** |
| **3. Acciones de Planta Externa**| **Botón "+ Troncal / Ramal"** | `#7E22CE` | `#FAF5FF` | **6.51:1** | Cumple | Cumple (Grande) | **Aprobado AA y AAA Grande** |
| | **Botón "+ Mufa" (Empalme)** | `#92400E` | `#FEF3C7` | **6.37:1** | Cumple | Cumple (Grande) | **Aprobado AA y AAA Grande** |
| | **Botón "+ Poste" (Soporte Aéreo)** | `#BE123C` | `#FFE4E6` | **5.24:1** | Cumple | Cumple (Grande) | **Aprobado AA y AAA Grande** |
| | **Botón "Ruta a Caja" (Navegación)** | `#4338CA` | `#EEF2FF` | **7.07:1** | Cumple | Cumple | **Excelente (Aprobado AAA)** |
| | **Botón "+ Nueva Caja NAP" (Primario)** | `#FFFFFF` | `#0284C7` | **4.10:1** | Cumple (UI/Negrita) | No aplica | **Aprobado AA Componente UI** |
| | **Botón "Bitácora Km"** | `#047857` | `#FFFFFF` | **5.48:1** | Cumple | Cumple (Grande) | **Aprobado AA y AAA Grande** |
| **4. Panel Lateral NAP** | **Título de Caja ("NAP-SJR-01")** | `#0F172A` | `#FFFFFF` | **17.85:1** | Cumple | Cumple | **Excelente (Aprobado AAA)** |
| | **Badge Saturación "75% (12/16)"** | `#15803D` | `#DCFCE7` | **4.57:1** | Cumple | Cumple (Grande) | **Aprobado AA y AAA Grande** |
| | **Badge "1 reservado (ámbar)"** | `#B45309` | `#FEF3C7` | **4.51:1** | Cumple | Cumple (Grande) | **Aprobado AA y AAA Grande** |
| | **Botón "Ruta de llegada"** | `#4338CA` | `#EEF2FF` | **7.07:1** | Cumple | Cumple | **Excelente (Aprobado AAA)** |
| | **Botón "Eliminar Caja"** | `#B91C1C` | `#FEE2E2` | **5.30:1** | Cumple | Cumple (Grande) | **Aprobado AA y AAA Grande** |
| **5. Matriz de 16 Puertos FTTx**| **Puerto Ocupado (Azul)** | `#0369A1` | `#E0F2FE` | **5.17:1** | Cumple | Cumple (Grande) | **Aprobado AA y AAA Grande** |
| | **Puerto Libre (Verde)** | `#047857` | `#DCFCE7` | **4.99:1** | Cumple | Cumple (Grande) | **Aprobado AA y AAA Grande** |
| | **Puerto Reservado (Ámbar)** | `#B45309` | `#FEF3C7` | **4.51:1** | Cumple | Cumple (Grande) | **Aprobado AA y AAA Grande** |
| | **Puerto Dañado (Rojo)** | `#B91C1C` | `#FEE2E2` | **5.30:1** | Cumple | Cumple (Grande) | **Aprobado AA y AAA Grande** |
| **6. Asistente Flotante** | **Botón Flotante "Asistente GPON"** | `#FFFFFF` | `#2563EB` | **5.17:1** | Cumple | Cumple (Grande) | **Aprobado AA y AAA Grande** |

---

## 6. TABLA 3: CATÁLOGO DE VISTAS, PANTALLAS Y COMPONENTES MAQUETADOS

Se valida la arquitectura de información y la composición de pantallas del sistema:

| Código de Vista | Nombre de Pantalla / Módulo | Descripción de Componentes Visuales y UX | Estado de Validación |
| :---: | :--- | :--- | :---: |
| **UI-01** | Visor Cartográfico GIS Principal | Mapa interactivo Leaflet a pantalla completa o dividida (70/30). Controles de zoom, capas satelital/calle, polilíneas de fibra, postes CFE, mufas y marcadores circulares de saturación NAP. | **APROBADO** |
| **UI-02** | Panel Lateral de Detalle NAP | Panel lateral deslizante (*drawer*) de 30% de ancho con cabecera de caja, porcentaje dinámico de ocupación con barra de progreso, badges de capacidad y coordenadas GPS. | **APROBADO** |
| **UI-03** | Matriz Gráfica de 16 Puertos SC-APC | Matriz interactiva de puertos con cuadrícula de 8 columnas (desktop) o 4 columnas (móvil). Indicador LED por puerto, número de conector y tooltip con datos del abonado vinculado. | **APROBADO** |
| **UI-04** | Modal de Asignación Atómica de Abonado | Ventana modal emergente con formulario validado en tiempo real: número de cliente, nombre, marca ONT (selector), MAC con máscara regex y potencia óptica en dBm. | **APROBADO** |
| **UI-05** | Modal de Calibración GPS en Sitio | Diálogo con captura en tiempo real mediante API de geolocalización de HTML5 del teléfono móvil, botón "Obtener Coordenadas Actuales" y preview geográfico inmediato. | **APROBADO** |
| **UI-06** | Módulo de Bitácora de Kilometraje | Formulario modal y tabla de desplazamientos vehiculares para cuadrillas: odómetro inicial, final, cálculo geodésico de ruta GIS, destino y justificación de traslado. | **APROBADO** |
| **UI-07** | Directorio Tabular de Abonados | Vista de tabla corporativa con buscador en vivo, filtro por marca ONT (`ZTE`, `Huawei`, `V-SOL`, `TP-Link`), paginación dinámica y acciones de edición/desvinculación. | **APROBADO** |
| **UI-08** | Vista y Generador de Reportes PDF | Panel con selector de fechas, botón de descarga directa en streaming y previsualización de tabla resumen de saturación global de la red FTTx. | **APROBADO** |
| **UI-09** | Indicador de Estado y Cola Offline PWA | Banner informativo flotante que avisa "Modo Desconectado", pastilla con contador de mutaciones pendientes y botón de sincronización forzada al recuperar conexión. | **APROBADO** |

---

## 7. TABLA 4: MATRIZ DE ADAPTABILIDAD RESPONSIVA (DESKTOP VS. MOBILE)

Comportamiento de la interfaz gráfica en las resoluciones oficiales del proyecto:

| Criterio de Adaptabilidad | Versión Escritorio / Monitor NOC (1440 x 960 px) | Versión Móvil Cuadrilla en Campo (390 x 844 px) | Dictamen |
| :--- | :--- | :--- | :---: |
| **Disposición de Pantalla** | Pantalla dividida simultánea: 70% Mapa GIS + 30% Panel Lateral fijo. | Pantalla completa con mapa; panel lateral como hoja inferior colapsable (*Bottom Sheet*). | **CONFORME** |
| **Matriz de Puertos NAP** | Rejilla de **8 columnas $\times$ 2 filas** (reproducción chasis físico ancho). | Rejilla de **4 columnas $\times$ 4 filas** optimizada para manipulación táctil con una sola mano. | **CONFORME** |
| **Barra de Herramientas** | Barra horizontal completa con botones de texto e iconos agrupados. | Botones de acceso rápido condensados con menú hamburguesa deslizable. | **CONFORME** |
| **Tamaño de Objetivos Táctiles** | Padding estándar de botones de 32 a 40 px. | Botones táctiles amplios con área mínima de contacto de **48 x 48 px** según estándares de usabilidad móvil. | **CONFORME** |
| **Navegación Navbar** | Menú horizontal completo con pastillas de pestaña visibles. | Barra de navegación inferior fija (*Bottom Navigation Bar*) con iconos de fácil alcance. | **CONFORME** |

---

## 8. TABLA 5: ESPECIFICACIÓN ARQUITECTÓNICA DE TABLAS DEL MODELO DE DATOS (POSTGRESQL)

Se valida y aprueba formalmente el esquema relacional de 11 tablas desarrollado con **PostgreSQL y Sequelize**:

| # | Nombre de la Tabla en BD | Descripción de la Entidad | Clave Primaria (PK) | Claves Foráneas (FK) y Cardinalidad | Restricciones e Integridad de Negocio | Dictamen |
| :-: | :--- | :--- | :--- | :--- | :--- | :---: |
| **1** | `usuarios` | Gestión de cuentas de usuario, credenciales y roles RBAC. | `id_usuario` (UUID) | Ninguna | `credencial_acceso UNIQUE`. Password cifrado con `bcrypt` salt $\ge 10$. Rol: `Admin`, `Soporte`, `Tecnico`. | **APROBADO** |
| **2** | `odf_panels` | Distribuidor Óptico Central de cabecera en el NOC. | `id_odf` (UUID) | Ninguna | Capacidad nominal predeterminada: 48 hilos pasantes. Coordenadas GPS en formato `JSONB`. | **APROBADO** |
| **3** | `pon_ports` | Puertos PON de tarjetas ópticas en chasis OLT. | `id_puerto_pon` (UUID) | `id_odf` $\rightarrow$ `odf_panels(id_odf)` (1:N) | Split ratio máximo: 64 ONTs. Potencia de transmisión emitida: $+4.5\text{ a }+5.2\text{ dBm}$. | **APROBADO** |
| **4** | `fiber_threads` | Hilos individuales de fibra óptica en cable troncal. | `id_hilo` (UUID) | `id_odf_origen` $\rightarrow$ `odf_panels(id_odf)` (1:N) | Rango de hilos: 1 a 48. Código de colores TIA-598. Estados: `Activo`, `Reserva`, `Muerto`. | **APROBADO** |
| **5** | `nap_boxes` | Cajas terminales de distribución de fibra en campo. | `id_nap` (UUID) | `id_puerto_pon` $\rightarrow$ `pon_ports(id_puerto_pon)` (1:N) | `identificador UNIQUE` (ej. `NAP-SJR-01`). 16 puertos por caja. Coordenadas geodésicas en `JSONB`. | **APROBADO** |
| **6** | `nap_ports` | Puertos físicos acopladores SC-APC de cada caja NAP. | `id_puerto` (UUID) | `id_nap` $\rightarrow$ `nap_boxes(id_nap)` (1:16) | `UNIQUE(id_nap, indice_puerto)`. Estados: `Libre`, `Ocupado`, `Dañado`, `Reservado`, `Mantenimiento`. | **APROBADO** |
| **7** | `clients` | Expediente y padrón de abonados con servicio activo. | `id_cliente` (UUID) | `id_puerto_nap` $\rightarrow$ `nap_ports(id_puerto)` (1:1 Estricta) | `numero_cliente UNIQUE`, `id_puerto_nap UNIQUE`, formato MAC válido. Potencia Rx esperada (dBm). | **APROBADO** |
| **8** | `mileage_logs` | Bitácora de traslados y control de kilometraje de cuadrillas. | `id` (UUID) | `id_nap` $\rightarrow$ `nap_boxes(id_nap)` (Opcional 0:N) | Registro de odómetro inicial/final y distancia geodésica calculada en GIS por traslado. | **APROBADO** |
| **9** | `infrastructure_postes` | Postes aéreos de soporte de tendido (CFE / Propuestos). | `id_poste` (VARCHAR) | Ninguna (Entidad GIS independiente) | Tipo: `'poste_propuesto'` o `'poste_cfe'`. Coordenadas georreferenciadas `{lat, lng}` en `JSONB`. | **APROBADO** |
| **10**| `infrastructure_mufas` | Cierres de empalme herméticos (*Torpedo Domo IP68*). | `id_empalme` (VARCHAR) | Ninguna (Puntos de derivación GIS) | Capacidad estándar: 48 hilos. Estado: `'operativa'`, `'mantenimiento'`. Sellado contra intemperie. | **APROBADO** |
| **11**| `infrastructure_routes` | Trazados vectoriales de cables de fibra troncal y ramales. | `id_ruta` (VARCHAR) | Ninguna (Polilíneas GeoJSON) | Tipo: `'troncal'` (48 hilos) o `'distribucion'`. Array de coordenadas geográficas `[[lat, lng], ...]`. | **APROBADO** |

---

## 9. CLÁUSULAS DE CONFORMIDAD Y CONGELAMIENTO DE DISEÑO (*DESIGN FREEZE*)

1. **PRIMERA (LÍNEA BASE DE DISEÑO Y ARQUITECTURA):** Las partes manifiestan su absoluta conformidad con las especificaciones visuales, los tokens del sistema de diseño, la matriz de accesibilidad y las 11 entidades del modelo relacional. Se declara formalmente el **Congelamiento de Línea Base de Diseño (*Design Freeze*)**.
2. **SEGUNDA (AUDITORÍA DE ACCESIBILIDAD):** Se certifica que los componentes implementados en el código fuente de producción satisfacen el estándar internacional **WCAG 2.1 Nivel AA**, con múltiples áreas clave en **Nivel AAA**, garantizando la legibilidad para las cuadrillas operativas en campo bajo sol intenso.
3. **TERCERA (INTEGRIDAD DE BASE DE DATOS):** Se constata que el esquema en PostgreSQL asegura cero redundancia de datos, relaciones 1:1 estrictas en conexiones de abonados y soporte para transacciones atómicas seguras bajo concurrencia.

---

## 10. FIRMAS DE CONFORMIDAD Y APROBACIÓN

Para constancia de lo acordado y en señal de formal aprobación técnica, firman las partes involucradas al calce y al margen por cuadruplicado, en el Municipio de San José del Rincón, Estado de México, el día trece de octubre de dos mil veintiséis.

<br/><br/>

| DISEÑADOR UI/UX Y DESARROLLADOR LÍDER | ASESOR EXTERNO (EMPRESA) |
| :---: | :---: |
| <br/><br/>_____________________________________________ | <br/><br/>_____________________________________________ |
| **C. Mauricio Nolazco Lonjino**<br/>Diseñador UI/UX y Desarrollador<br/>Estudiante de Ing. en Sistemas Computacionales<br/>Matrícula UMB: 13SC161 | **L.I.A. Oscar Isaac Mendoza García**<br/>Asesor Externo de Residencia<br/>Jefe de Proyecto de Software<br/>GPON TELECOM S.A. de C.V. |

<br/><br/>

| ASESOR INTERNO (ACADÉMICO) | DIRECCIÓN DE OPERACIONES (EMPRESA) |
| :---: | :---: |
| <br/><br/>_____________________________________________ | <br/><br/>_____________________________________________ |
| **I.S.C. Leonardo Becerril Sánchez**<br/>Asesor Interno de Residencia Profesional<br/>División de Ing. en Sistemas Computacionales<br/>Universidad Mexiquense del Bicentenario | **Ing. Carlos Mendoza**<br/>Director de Operaciones y Planta Externa<br/>GPON TELECOM S.A. de C.V.<br/>Vo.Bo. Aprobación de Arquitectura |

<br/><br/>
<div align="center">
  <b>SELLO DE LA EMPRESA RECEPTORA &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; SELLO DE LA INSTITUCIÓN EDUCATIVA</b><br/>
  (GPON TELECOM S.A. de C.V.) &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; (UMB UES San José del Rincón)
</div>

