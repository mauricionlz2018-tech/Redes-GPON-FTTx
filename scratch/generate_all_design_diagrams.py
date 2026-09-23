import os, math
from PIL import Image, ImageDraw, ImageFont

# Common Fonts
FONT_TITLE = ImageFont.truetype('C:/Windows/Fonts/arialbd.ttf', 30)
FONT_SUBTITLE = ImageFont.truetype('C:/Windows/Fonts/arial.ttf', 16)
FONT_HDR = ImageFont.truetype('C:/Windows/Fonts/arialbd.ttf', 18)
FONT_SUBHDR = ImageFont.truetype('C:/Windows/Fonts/arialbd.ttf', 15)
FONT_BODY = ImageFont.truetype('C:/Windows/Fonts/arial.ttf', 13.5)
FONT_BODY_BOLD = ImageFont.truetype('C:/Windows/Fonts/arialbd.ttf', 13.5)
FONT_SMALL = ImageFont.truetype('C:/Windows/Fonts/arial.ttf', 11.5)
FONT_SMALL_BOLD = ImageFont.truetype('C:/Windows/Fonts/arialbd.ttf', 11.5)

# 100% Monochrome Palette (Zero Color)
C_BLACK = (0, 0, 0)
C_WHITE = (255, 255, 255)
C_GRAY_LIGHT = (245, 245, 245)
C_GRAY_MID = (230, 230, 230)
C_GRAY_DARK = (100, 100, 100)

def draw_arrow(draw, start, end, width=3, head_len=14, color=C_BLACK):
    x0, y0 = start
    x1, y1 = end
    draw.line([(x0, y0), (x1, y1)], fill=color, width=width)
    angle = math.atan2(y1 - y0, x1 - x0)
    left_x = x1 - head_len * math.cos(angle - math.pi / 6)
    left_y = y1 - head_len * math.sin(angle - math.pi / 6)
    right_x = x1 - head_len * math.cos(angle + math.pi / 6)
    right_y = y1 - head_len * math.sin(angle + math.pi / 6)
    draw.polygon([(x1, y1), (left_x, left_y), (right_x, right_y)], fill=color)

def draw_dashed_line(draw, start, end, dash_len=10, space_len=6, width=2, color=C_BLACK):
    x0, y0 = start
    x1, y1 = end
    dist = math.hypot(x1 - x0, y1 - y0)
    if dist == 0:
        return
    dx = (x1 - x0) / dist
    dy = (y1 - y0) / dist
    curr = 0
    while curr < dist:
        seg_end = min(curr + dash_len, dist)
        draw.line([(x0 + curr * dx, y0 + curr * dy), (x0 + seg_end * dx, y0 + seg_end * dy)], fill=color, width=width)
        curr += dash_len + space_len

def draw_stepped_arrow(draw, points, width=3, head_len=14, color=C_BLACK):
    for i in range(len(points) - 2):
        draw.line([points[i], points[i+1]], fill=color, width=width)
    draw_arrow(draw, points[-2], points[-1], width=width, head_len=head_len, color=color)

def draw_box(draw, xy, title, lines=None, fill=C_WHITE, outline=C_BLACK, width=2, radius=10, header_fill=C_GRAY_MID):
    x0, y0, x1, y1 = xy
    draw.rounded_rectangle([xy[0], xy[1], xy[2], xy[3]], radius=radius, fill=fill, outline=outline, width=width)
    if title:
        hdr_h = 36
        draw.rounded_rectangle([x0, y0, x1, y0 + hdr_h], radius=radius, fill=header_fill, outline=outline, width=width)
        draw.line([(x0, y0 + hdr_h), (x1, y0 + hdr_h)], fill=outline, width=width)
        draw.text(((x0 + x1) // 2, y0 + hdr_h // 2), title, font=FONT_HDR, fill=C_BLACK, anchor="mm")
        cur_y = y0 + hdr_h + 10
    else:
        cur_y = y0 + 12

    if lines:
        for item in lines:
            if isinstance(item, tuple):
                pfx, txt = item
                draw.text((x0 + 14, cur_y), pfx, font=FONT_BODY_BOLD, fill=C_BLACK)
                pfx_w = draw.textlength(pfx, font=FONT_BODY_BOLD)
                draw.text((x0 + 14 + pfx_w, cur_y), txt, font=FONT_BODY, fill=C_BLACK)
            else:
                draw.text((x0 + 14, cur_y), item, font=FONT_BODY, fill=C_BLACK)
            cur_y += 22

# =========================================================================
# DIAGRAM 1: DIAGRAMA DE NAVEGACIÓN DEL SISTEMA WEB (User Navigation Flow)
# =========================================================================
def generate_diagram_1():
    W, H = 2600, 1650
    img = Image.new('RGB', (W, H), C_WHITE)
    draw = ImageDraw.Draw(img)

    draw.rectangle([(40, 30), (W - 40, 100)], fill=C_GRAY_LIGHT, outline=C_BLACK, width=3)
    draw.text((W // 2, 52), "DIAGRAMA DE NAVEGACIÓN DEL SISTEMA WEB (USER NAVIGATION FLOW)", font=FONT_TITLE, fill=C_BLACK, anchor="mm")
    draw.text((W // 2, 82), "Flujo interactivo de navegación, control de acceso, cartografía GIS, chasis de puertos y sincronización offline", font=FONT_SUBTITLE, fill=C_GRAY_DARK, anchor="mm")

    draw_box(draw, (60, 140, 420, 330), "1. Módulo Autenticación", [
        ("• Vista: ", "Pantalla de Inicio de Sesión"),
        ("• Inputs: ", "Usuario / Correo y Password"),
        ("• Control: ", "Validación Zod y Hasheo"),
        ("• Servicio: ", "POST /api/auth/login"),
        ("• Salida: ", "Emisión Token JWT + Rol RBAC"),
        ("• Error: ", "Alerta 401 Credenciales Inválidas")
    ], header_fill=C_GRAY_MID)

    draw_box(draw, (500, 140, 980, 400), "2. Panel Principal (Dashboard)", [
        ("• Encabezado: ", "Barra Superior de Control"),
        ("• Indicador: ", "Semáforo Online / Offline"),
        ("• Métricas: ", "KPIs de NAPs y Puertos Libres"),
        ("• Navegación: ", "Pestañas Rápidas de Módulos:"),
        ("   - [1] ", "Visor Cartográfico GIS (Mapa)"),
        ("   - [2] ", "Directorio de Abonados (Clientes)"),
        ("   - [3] ", "Reportes Técnicos Ejecutivos (PDF)"),
        ("   - [4] ", "Catálogo de Infraestructura de Red"),
        ("• Sesión: ", "Perfil Activo y Cierre de Sesión")
    ], header_fill=C_GRAY_MID)

    draw_arrow(draw, (420, 235), (500, 235), width=3)
    draw.text((460, 215), "JWT Válido", font=FONT_SMALL_BOLD, fill=C_BLACK, anchor="mm")

    draw_box(draw, (1060, 140, 1640, 420), "3. Visor Cartográfico GIS (React Leaflet)", [
        ("• Motor: ", "OpenStreetMap + Capa Satelital"),
        ("• Entidades: ", "Postes, Mufas, Cajas NAP, ODF"),
        ("• Trazado: ", "Polilíneas de Fibra Monomodo"),
        ("• Filtros: ", "Por Sector, Estado y Capacidad"),
        ("• Herramientas: ", "Medición de distancias GPS"),
        ("• Interacción: ", "Click sobre Marcador de Caja NAP"),
        ("• Evento: ", "Apertura de Chasis Gráfico Interactivo"),
        ("• Estado Visual: ", "Color según saturación (0-50-80-100%)")
    ], header_fill=C_GRAY_MID)

    draw_arrow(draw, (980, 270), (1060, 270), width=3)
    draw.text((1020, 250), "Pestaña [1]", font=FONT_SMALL_BOLD, fill=C_BLACK, anchor="mm")

    draw_box(draw, (1720, 140, 2260, 450), "4. Chasis Interactivo de Caja NAP", [
        ("• Vista: ", "Diálogo Modal Emergente (Overlay)"),
        ("• Datos NAP: ", "Código, Coordenadas, ODF/Troncal"),
        ("• Matriz: ", "16 Puertos SC-APC interactivos"),
        ("• Semáforo: ", "Verde (Libre) / Azul (Ocupado) /"),
        ("              ", "Rojo (Dañado) / Amarillo (Bloqueado)"),
        ("• Click Puerto: ", "Despliegue de Acciones Disponibles:"),
        ("   -> [A] ", "Asignar Nuevo Suscriptor"),
        ("   -> [B] ", "Consultar Datos del Cliente"),
        ("   -> [C] ", "Reportar Falla / Daño en Puerto"),
        ("   -> [D] ", "Liberar Puerto / Cancelar Servicio")
    ], header_fill=C_GRAY_MID)

    draw_arrow(draw, (1640, 280), (1720, 280), width=3)
    draw.text((1680, 260), "Click NAP", font=FONT_SMALL_BOLD, fill=C_BLACK, anchor="mm")

    draw_box(draw, (1720, 520, 2120, 770), "4.A. Alta de Abonado", [
        ("• Formulario: ", "Validación Zod en tiempo real"),
        ("• Campos: ", "Nombre, Contrato, Teléfono, IP"),
        ("• Potencia: ", "Registro dBm (Recepción ONT)"),
        ("• Transacción: ", "SELECT ... FOR UPDATE"),
        ("• Salida: ", "Puerto Ocupado y Notificación")
    ], header_fill=C_GRAY_LIGHT)

    draw_box(draw, (2160, 520, 2540, 770), "4.B. Ficha de Abonado", [
        ("• Vista: ", "Detalle del Cliente"),
        ("• Datos: ", "Plan comercial y ONT"),
        ("• Trazabilidad: ", "Fecha de alta y técnico"),
        ("• Historial: ", "Atenuación óptica"),
        ("• Botón: ", "Editar / Descargar Contrato")
    ], header_fill=C_GRAY_LIGHT)

    draw_box(draw, (1720, 800, 2120, 1020), "4.C. Reporte de Daño", [
        ("• Estado: ", "Cambio a DAÑADO"),
        ("• Registro: ", "Causa (Conector/Fibra)"),
        ("• Prioridad: ", "Baja / Media / Urgente"),
        ("• Notificación: ", "Alerta al NOC"),
        ("• Acción: ", "Orden de brigada técnica")
    ], header_fill=C_GRAY_LIGHT)

    draw_box(draw, (2160, 800, 2540, 1020), "4.D. Liberación de Puerto", [
        ("• Confirmación: ", "Baja de servicio"),
        ("• Efecto: ", "Desvinculación de cliente"),
        ("• Estado: ", "Puerto vuelve a LIBRE"),
        ("• Recálculo: ", "Saturación NAP disminuye"),
        ("• Auditoría: ", "Log de fecha y técnico")
    ], header_fill=C_GRAY_LIGHT)

    draw_stepped_arrow(draw, [(1990, 450), (1990, 485), (1920, 485), (1920, 520)], width=2)
    draw_stepped_arrow(draw, [(1990, 450), (1990, 485), (2350, 485), (2350, 520)], width=2)
    draw_stepped_arrow(draw, [(1920, 770), (1920, 800)], width=2)
    draw_stepped_arrow(draw, [(2350, 770), (2350, 800)], width=2)

    draw_box(draw, (1060, 520, 1640, 830), "5. Directorio de Abonados (Clientes)", [
        ("• Vista: ", "Tabla de Datos Paginada (DataGrid)"),
        ("• Filtros: ", "Búsqueda por Nombre, NAP o Teléfono"),
        ("• Columnas: ", "Cliente, Estado, NAP, Puerto, Fecha"),
        ("• Acciones: ", "Ver Ubicación en Mapa / Modificar"),
        ("• Exportación: ", "Descarga de lista en formato CSV"),
        ("• Navegación: ", "Botón 'Ver en Mapa' enfoca la NAP")
    ], header_fill=C_GRAY_MID)

    draw_stepped_arrow(draw, [(800, 400), (800, 675), (1060, 675)], width=3)
    draw.text((930, 655), "Pestaña [2]", font=FONT_SMALL_BOLD, fill=C_BLACK, anchor="mm")

    draw_box(draw, (500, 520, 980, 830), "6. Reportería Técnica (PDFKit Streaming)", [
        ("• Vista: ", "Generador de Dictámenes Técnicos"),
        ("• Criterios: ", "Filtrado por Rango de Fechas / Nodos"),
        ("• Tipo Reporte: ", "Auditoría de Planta Externa / NAPs"),
        ("• Petición: ", "GET /api/reports/pdf?sector=SJR"),
        ("• Backend: ", "Generación binaria al vuelo (Stream)"),
        ("• Salida: ", "Descarga directa de archivo PDF formal")
    ], header_fill=C_GRAY_MID)

    draw_stepped_arrow(draw, [(650, 400), (650, 520)], width=3)
    draw.text((690, 460), "Pestaña [3]", font=FONT_SMALL_BOLD, fill=C_BLACK, anchor="mm")

    draw_box(draw, (60, 520, 420, 830), "7. Catálogo Infraestructura", [
        ("• Rol Requerido: ", "ADMIN / NOC"),
        ("• Gestión: ", "Altas de ODFs, Postes y Mufas"),
        ("• Cajas NAP: ", "Configuración de Splitters 1:16"),
        ("• Trazado: ", "Registro de cables troncales"),
        ("• Trazabilidad: ", "Bitácora completa de eventos")
    ], header_fill=C_GRAY_MID)

    draw_stepped_arrow(draw, [(500, 360), (320, 360), (320, 520)], width=3)
    draw.text((370, 340), "Pestaña [4]", font=FONT_SMALL_BOLD, fill=C_BLACK, anchor="mm")

    draw.rectangle([(60, 1100), (W - 60, 1580)], fill=C_GRAY_LIGHT, outline=C_BLACK, width=3)
    draw.rectangle([(60, 1100), (W - 60, 1150)], fill=C_GRAY_MID, outline=C_BLACK, width=3)
    draw.text((W // 2, 1125), "CAPA TRANSVERSAL DE NAVEGACIÓN: MOTOR OFFLINE-FIRST (DEXIE.JS + SERVICE WORKER)", font=FONT_TITLE, fill=C_BLACK, anchor="mm")

    draw_box(draw, (90, 1180, 620, 1540), "Detección de Conectividad", [
        ("• Evento window.onoffline: ", "Pérdida de señal 4G"),
        ("• Cambio de Estado: ", "Activación de Modo Local"),
        ("• Interfaz: ", "Banner ámbar 'Trabajando Offline'"),
        ("• Navegación: ", "Totalmente operativa sin bloqueo"),
        ("• Caché Service Worker: ", "Vistas HTML/JS/CSS y tiles"),
        ("• Visor GIS: ", "Consulta de mapas desde caché local")
    ], header_fill=C_WHITE, outline=C_BLACK, width=2)

    draw_box(draw, (700, 1180, 1380, 1540), "Encolamiento Local (Dexie.js / IndexedDB)", [
        ("• Transacciones en Campo: ", "Asignaciones, bajas y cambios de estado"),
        ("• Almacenamiento: ", "Tabla local 'pending_mutations' en IndexedDB"),
        ("• Estructura de Mutación: ", "ID, Timestamp, Endpoint, Body, UUID"),
        ("• Feedback Inmediato: ", "Puerto se actualiza en UI con icono de 'Reloj'"),
        ("• Resiliencia: ", "Persistencia garantizada si la batería se apaga"),
        ("• Integridad: ", "Cero pérdida de información en cuadrillas rurales")
    ], header_fill=C_WHITE, outline=C_BLACK, width=2)

    draw_box(draw, (1460, 1180, 2040, 1540), "Sincronización Automática (Al Reconectar)", [
        ("• Evento window.ononline: ", "Detección de enlace 4G / WiFi"),
        ("• Disparador: ", "SyncManager inicia vaciado de cola FIFO"),
        ("• Envío por Lotes: ", "Peticiones secuenciales a la API REST"),
        ("• Transacción ACID: ", "Backend aplica bloqueo pesimista"),
        ("• Confirmación HTTP 200: ", "Mutación eliminada de IndexedDB"),
        ("• Actualización UI: ", "Icono cambia de 'Reloj' a 'Verificado ✓'")
    ], header_fill=C_WHITE, outline=C_BLACK, width=2)

    draw_box(draw, (2110, 1180, 2520, 1540), "Resolución de Conflictos", [
        ("• Conflicto: ", "Puerto asignado por otro técnico"),
        ("• Detección: ", "Backend detecta choque"),
        ("• Respuesta: ", "HTTP 409 Conflict"),
        ("• Notificación: ", "Alerta al técnico en campo"),
        ("• Rollback: ", "Reversión segura en UI"),
        ("• Bitácora: ", "Registro en auditoría")
    ], header_fill=C_WHITE, outline=C_BLACK, width=2)

    draw_arrow(draw, (620, 1360), (700, 1360), width=3)
    draw_arrow(draw, (1380, 1360), (1460, 1360), width=3)
    draw_arrow(draw, (2040, 1360), (2110, 1360), width=3)

    draw_stepped_arrow(draw, [(300, 830), (300, 1100)], width=3)
    draw_stepped_arrow(draw, [(1350, 830), (1350, 1100)], width=3)
    draw_stepped_arrow(draw, [(1920, 1020), (1920, 1100)], width=3)

    out_path = 'scratch/diag_navegacion_sistema.png'
    img.save(out_path, quality=95)
    print(f"SUCCESS: Generated {out_path}")

# =========================================================================
# DIAGRAM 2: DIAGRAMA DE ARQUITECTURA DE INFORMACIÓN (Information Architecture)
# =========================================================================
def generate_diagram_2():
    W, H = 2600, 1500
    img = Image.new('RGB', (W, H), C_WHITE)
    draw = ImageDraw.Draw(img)

    draw.rectangle([(40, 30), (W - 40, 100)], fill=C_GRAY_LIGHT, outline=C_BLACK, width=3)
    draw.text((W // 2, 52), "DIAGRAMA DE ARQUITECTURA DE INFORMACIÓN DEL SISTEMA WEB", font=FONT_TITLE, fill=C_BLACK, anchor="mm")
    draw.text((W // 2, 82), "Jerarquía de módulos, niveles de navegación, pantallas funcionales, diálogos modales y controles operativos", font=FONT_SUBTITLE, fill=C_GRAY_DARK, anchor="mm")

    draw_box(draw, (1100, 130, 1500, 220), "Nivel 0: Autenticación", [
        ("• Vista: ", "Acceso Seguro (Login JWT)"),
        ("• Control: ", "RBAC (Admin / NOC / Técnico)")
    ], header_fill=C_GRAY_MID)

    m_w = 540
    g = 60
    xs = [(60 + i * (m_w + g)) for i in range(4)]
    
    draw_box(draw, (xs[0], 290, xs[0] + m_w, 410), "Módulo 1: Visor Cartográfico GIS", [
        ("• Rol: ", "Técnico de Campo, NOC y Administrador"),
        ("• Propósito: ", "Mapeo lógico y georreferenciado de red pasiva"),
        ("• Motor: ", "React Leaflet + Capa Satelital OpenStreetMap")
    ], header_fill=C_GRAY_LIGHT)

    draw_box(draw, (xs[1], 290, xs[1] + m_w, 410), "Módulo 2: Catálogo de Abonados", [
        ("• Rol: ", "Personal de Soporte Técnico y NOC"),
        ("• Propósito: ", "Consulta, filtrado y edición de suscriptores FTTx"),
        ("• Motor: ", "DataGrid interactivo con buscador reactivo")
    ], header_fill=C_GRAY_LIGHT)

    draw_box(draw, (xs[2], 290, xs[2] + m_w, 410), "Módulo 3: Dictamen y Reportes PDF", [
        ("• Rol: ", "Supervisores Operativos, NOC y Gerencia"),
        ("• Propósito: ", "Auditoría formal y estado de ocupación de NAPs"),
        ("• Motor: ", "PDFKit streaming de alta velocidad")
    ], header_fill=C_GRAY_LIGHT)

    draw_box(draw, (xs[3], 290, xs[3] + m_w, 410), "Módulo 4: Administración del Sistema", [
        ("• Rol: ", "Exclusivo Administrador del Sistema"),
        ("• Propósito: ", "Catálogo de ODF, gestión de usuarios y roles"),
        ("• Motor: ", "Mantenimiento relacional en PostgreSQL")
    ], header_fill=C_GRAY_LIGHT)

    draw.line([(1300, 220), (1300, 255)], fill=C_BLACK, width=3)
    draw.line([(xs[0] + m_w // 2, 255), (xs[3] + m_w // 2, 255)], fill=C_BLACK, width=3)
    for i in range(4):
        draw_arrow(draw, (xs[i] + m_w // 2, 255), (xs[i] + m_w // 2, 290), width=3)

    draw_box(draw, (60, 480, 600, 780), "1.1 Componentes del Visor GIS", [
        ("• Capa de Polilíneas: ", "Troncales (24h) y Ramales (6h)"),
        ("• Marcadores de Mufas: ", "Empalmes por fusión y splitters 1:4"),
        ("• Marcadores de NAPs: ", "Cajas terminales con semáforo"),
        ("• Calibración GPS: ", "Centrado automático en San José"),
        ("• Medidor Óptico: ", "Cálculo de longitud y atenuación"),
        ("• Buscador Rápido: ", "Localización por código de poste/NAP")
    ], header_fill=C_WHITE, outline=C_BLACK, width=2)

    draw_box(draw, (60, 830, 600, 1420), "1.2 Diálogo de Chasis NAP (Modal)", [
        ("• Cabecera del Chasis: ", "Código NAP, Coordenadas y ODF"),
        ("• Matriz 16 Puertos SC-APC: ", "Chasis visual SVG interactivo"),
        ("• Indicadores de Puerto: ", "Código de color por estado"),
        ("• Acciones sobre Puerto Seleccionado:", ""),
        ("   -> Sub-modal [1.2.1]: ", "Alta de Nuevo Suscriptor FTTx"),
        ("      - Validación: ", "Formulario reactivo con Zod"),
        ("      - Concurrencia: ", "Bloqueo pesimista ACID"),
        ("      - Parámetros: ", "Potencia óptica dBm y datos"),
        ("   -> Sub-modal [1.2.2]: ", "Ficha Técnica del Cliente"),
        ("      - Información: ", "IP, MAC ONT y fecha de alta"),
        ("   -> Sub-modal [1.2.3]: ", "Reporte de Puerto Dañado"),
        ("      - Diagnóstico: ", "Atenuación severa / conector roto"),
        ("   -> Acción [1.2.4]: ", "Liberación / Baja Inmediata"),
        ("      - Confirmación: ", "Diálogo modal de seguridad")
    ], header_fill=C_WHITE, outline=C_BLACK, width=2)

    draw_arrow(draw, (xs[0] + m_w // 2, 410), (xs[0] + m_w // 2, 480), width=3)
    draw_arrow(draw, (xs[0] + m_w // 2, 780), (xs[0] + m_w // 2, 830), width=3)

    draw_box(draw, (660, 480, 1200, 890), "2.1 Vistas y Funciones de Abonados", [
        ("• Tabla Maestra: ", "DataGrid reactivo con paginación"),
        ("• Buscador Multicriterio: ", "Nombre, contrato o teléfono"),
        ("• Filtro de Estado: ", "Activos, suspendidos y cancelados"),
        ("• Selector de Caja NAP: ", "Filtrar clientes por caja terminal"),
        ("• Exportación de Datos: ", "Generación de archivo CSV"),
        ("• Navegación Cruzada: ", "Botón 'Ver en Mapa' enfoca la NAP"),
        ("• Modales Hijos:", ""),
        ("   -> [2.1.1] Modal Edición: ", "Actualizar datos y teléfono"),
        ("   -> [2.1.2] Modal Historial: ", "Bitácora de atenuación óptica")
    ], header_fill=C_WHITE, outline=C_BLACK, width=2)

    draw_box(draw, (660, 940, 1200, 1420), "2.2 Capa de Persistencia Local (PWA)", [
        ("• Motor Local: ", "IndexedDB encapsulado con Dexie.js"),
        ("• Esquema Local: ", "Tablas 'cached_naps' y 'clients'"),
        ("• Cola de Mutaciones: ", "Tabla 'pending_mutations'"),
        ("• Modo de Consulta: ", "Lectura offline instantánea"),
        ("• Estados de Sincronización: ", "Synced, Pending, Failed"),
        ("• Manejador de Red: ", "Service Worker con Workbox"),
        ("• Mecanismo de Cache: ", "Stale-While-Revalidate en tiles"),
        ("• Resiliencia Móvil: ", "Operación completa en zonas sin señal")
    ], header_fill=C_WHITE, outline=C_BLACK, width=2)

    draw_arrow(draw, (xs[1] + m_w // 2, 410), (xs[1] + m_w // 2, 480), width=3)
    draw_arrow(draw, (xs[1] + m_w // 2, 890), (xs[1] + m_w // 2, 940), width=3)

    draw_box(draw, (1260, 480, 1800, 940), "3.1 Generación y Parámetros de Reporte", [
        ("• Filtro por Rango Fechas: ", "Selector de inicio y fin"),
        ("• Filtro Territorial: ", "Municipio, Sector o Nodo NOC"),
        ("• Criterio de Selección: ", "Por Caja NAP específica o global"),
        ("• Opciones de Salida:", ""),
        ("   - Dictamen Ejecutivo de Capacidad"),
        ("   - Listado de Puertos Dañados y en Falla"),
        ("   - Cédula de Trazabilidad por Técnico"),
        ("• Acciones de Salida:", ""),
        ("   -> [3.1.1] Previsualización: ", "Visor PDF en navegador"),
        ("   -> [3.1.2] Descarga Directa: ", "Descarga binaria .pdf"),
        ("   -> [3.1.3] Envío por Correo: ", "Notificación al supervisor")
    ], header_fill=C_WHITE, outline=C_BLACK, width=2)

    draw_box(draw, (1260, 990, 1800, 1420), "3.2 Arquitectura Streaming PDFKit", [
        ("• Capa Servidor: ", "Node.js + PDFKit Engine"),
        ("• Ventaja Operativa: ", "Cero almacenamiento en disco"),
        ("• Seguridad: ", "Encabezado y sellos institucionales"),
        ("• Tablas Dinámicas: ", "Renderizado vectorial de celdas"),
        ("• Pie de Página: ", "Folio oficial y fecha de emisión")
    ], header_fill=C_WHITE, outline=C_BLACK, width=2)

    draw_arrow(draw, (xs[2] + m_w // 2, 410), (xs[2] + m_w // 2, 480), width=3)
    draw_arrow(draw, (xs[2] + m_w // 2, 940), (xs[2] + m_w // 2, 990), width=3)

    draw_box(draw, (1860, 480, 2540, 940), "4.1 Configuración de Infraestructura", [
        ("• Catálogo ODF Central: ", "Paneles, bandejas y splitters 1:4"),
        ("• Catálogo de Postes y Mufas: ", "Ubicaciones, códigos y tipos"),
        ("• Editor de Cajas NAP: ", "Capacidad, marca y atenuación base"),
        ("• Trazado de Conexiones: ", "Vinculación lógica ODF -> NAP"),
        ("• Modales de Gestión:", ""),
        ("   -> [4.1.1] Crear Nuevo Poste / Mufa"),
        ("   -> [4.1.2] Instalar Nueva Caja NAP"),
        ("   -> [4.1.3] Asignar Hilo de Fibra Monomodo")
    ], header_fill=C_WHITE, outline=C_BLACK, width=2)

    draw_box(draw, (1860, 990, 2540, 1420), "4.2 Seguridad y Control de Acceso", [
        ("• Usuarios y Credenciales: ", "Altas, bajas y cambio de clave"),
        ("• Roles RBAC: ", "Admin, NOC, Técnico de Campo"),
        ("• Matriz de Permisos: ", "Control granular sobre endpoints"),
        ("• Auditoría de Sistema: ", "Bitácora de mutaciones con IP"),
        ("• Respaldo de Base de Datos: ", "Exportación lógica de PostgreSQL")
    ], header_fill=C_WHITE, outline=C_BLACK, width=2)

    draw_arrow(draw, (xs[3] + m_w // 2, 410), (xs[3] + m_w // 2, 480), width=3)
    draw_arrow(draw, (xs[3] + m_w // 2, 940), (xs[3] + m_w // 2, 990), width=3)

    out_path = 'scratch/diag_arquitectura_informacion.png'
    img.save(out_path, quality=95)
    print(f"SUCCESS: Generated {out_path}")

# =========================================================================
# DIAGRAM 3: DIAGRAMA DE MÁQUINA DE ESTADOS DEL PUERTO ÓPTICO (UML FSM)
# =========================================================================
def generate_diagram_3():
    W, H = 2600, 1400
    img = Image.new('RGB', (W, H), C_WHITE)
    draw = ImageDraw.Draw(img)

    draw.rectangle([(40, 30), (W - 40, 100)], fill=C_GRAY_LIGHT, outline=C_BLACK, width=3)
    draw.text((W // 2, 52), "DIAGRAMA DE MÁQUINA DE ESTADOS FINITOS DEL PUERTO ÓPTICO SC-APC (UML FSM)", font=FONT_TITLE, fill=C_BLACK, anchor="mm")
    draw.text((W // 2, 82), "Ciclo de vida transaccional, control de concurrencia pesimista ACID y contingencia operativa de red", font=FONT_SUBTITLE, fill=C_GRAY_DARK, anchor="mm")

    # Initial State
    draw.ellipse([(100, 350), (150, 400)], fill=C_BLACK, outline=C_BLACK)
    draw.text((125, 420), "Inicio", font=FONT_BODY_BOLD, fill=C_BLACK, anchor="mm")

    # State 1: LIBRE (Box 1: x=240..740, y=280..470)
    draw_box(draw, (240, 280, 740, 470), "ESTADO: LIBRE (DISPONIBLE)", [
        ("• Condición: ", "Puerto sin suscriptor asociado"),
        ("• Indicador UI: ", "Patrón Libre (Status: AVAILABLE)"),
        ("• Base de Datos: ", "status = 'AVAILABLE', client_id = NULL"),
        ("• Potencia: ", "Señal lumínica nominal presente en splitter"),
        ("• Acciones: ", "Apto para asignación técnica inmediata")
    ], header_fill=C_GRAY_LIGHT, width=3, radius=15)

    draw_arrow(draw, (150, 375), (240, 375), width=3)
    draw.text((195, 355), "Inicializar", font=FONT_SMALL_BOLD, fill=C_BLACK, anchor="mm")

    # State 2: EN PROCESO (Box 2: x=1020..1580, y=280..470)
    draw_box(draw, (1020, 280, 1580, 470), "ESTADO: EN PROCESO (RESERVADO)", [
        ("• Condición: ", "Técnico inició captura de formulario"),
        ("• Indicador UI: ", "Candado de Bloqueo (Status: LOCKED)"),
        ("• Concurrencia: ", "Bloqueo Pesimista (SELECT ... FOR UPDATE)"),
        ("• Aislamiento: ", "Transacción ACID abierta en PostgreSQL"),
        ("• Exclusión: ", "Ningún otro técnico puede seleccionarlo"),
        ("• Temporizador: ", "Timeout automático de 5 min por inactividad")
    ], header_fill=C_GRAY_MID, width=3, radius=15)

    # Transition 1 -> 2
    draw_arrow(draw, (740, 350), (1020, 350), width=3)
    draw.text((880, 330), "Inicia Asignación", font=FONT_BODY_BOLD, fill=C_BLACK, anchor="mm")
    draw.text((880, 370), "[Bloqueo Pesimista]", font=FONT_SMALL, fill=C_GRAY_DARK, anchor="mm")

    # Transition 2 -> 1 (Cancel / Rollback)
    draw_stepped_arrow(draw, [(1150, 470), (1150, 520), (600, 520), (600, 470)], width=3)
    draw.rectangle([(750, 505), (1000, 535)], fill=C_WHITE, outline=C_BLACK, width=1)
    draw.text((875, 520), "Cancelación / Timeout / Rollback", font=FONT_BODY_BOLD, fill=C_BLACK, anchor="mm")

    # State 3: OCUPADO (Box 3: x=1860..2480, y=280..470)
    draw_box(draw, (1860, 280, 2480, 470), "ESTADO: OCUPADO (EN SERVICIO)", [
        ("• Condición: ", "Suscriptor formalmente conectado"),
        ("• Indicador UI: ", "Patrón Activo con datos del suscriptor"),
        ("• Base de Datos: ", "status = 'OCCUPIED', client_id = ID"),
        ("• Transacción: ", "COMMIT ejecutado con éxito en PostgreSQL"),
        ("• Métrica: ", "Atenuación óptica registrada en contrato"),
        ("• Impacto: ", "Saturación de la Caja NAP se incrementa en +1")
    ], header_fill=C_GRAY_LIGHT, width=3, radius=15)

    # Transition 2 -> 3 (Commit)
    draw_arrow(draw, (1580, 350), (1860, 350), width=3)
    draw.text((1720, 330), "Confirmación Alta", font=FONT_BODY_BOLD, fill=C_BLACK, anchor="mm")
    draw.text((1720, 370), "[Commit Transacción]", font=FONT_SMALL, fill=C_GRAY_DARK, anchor="mm")

    # Transition 3 -> 1 (Baja de suscriptor)
    draw_stepped_arrow(draw, [(2170, 280), (2170, 190), (490, 190), (490, 280)], width=3)
    draw.rectangle([(980, 175), (1680, 205)], fill=C_WHITE, outline=C_BLACK, width=1)
    draw.text((1330, 190), "Baja de Suscriptor / Cancelación de Servicio [UPDATE status = 'AVAILABLE']", font=FONT_BODY_BOLD, fill=C_BLACK, anchor="mm")

    # State 5: EN MANTENIMIENTO (Box 4: x=240..740, y=750..960)
    draw_box(draw, (240, 750, 740, 960), "ESTADO: EN MANTENIMIENTO", [
        ("• Condición: ", "Brigada técnica ejecutando reparación"),
        ("• Operación: ", "Fusión de pigtail o reempalme de fibra"),
        ("• Verificación: ", "Prueba con VFL (láser rojo) y Power Meter"),
        ("• Requisito: ", "Potencia normalizada entre -15 y -24 dBm"),
        ("• Dictamen: ", "Registro de valores ópticos en la plataforma")
    ], header_fill=C_GRAY_LIGHT, width=3, radius=15)

    # State 4: DAÑADO (Box 5: x=1020..1580, y=750..960)
    draw_box(draw, (1020, 750, 1580, 960), "ESTADO: DAÑADO (EN INCIDENCIA)", [
        ("• Condición: ", "Atenuación excesiva (> -28 dBm) o conector roto"),
        ("• Indicador UI: ", "Alerta de Incidencia (Status: DAMAGED)"),
        ("• Base de Datos: ", "status = 'DAMAGED', incident_ticket = #ID"),
        ("• Notificación: ", "Alerta automática emitida hacia el NOC"),
        ("• Exclusión: ", "Inhabilitado para nuevas asignaciones"),
        ("• Diagnóstico: ", "Requiere inspección y limpieza de férrula")
    ], header_fill=C_GRAY_MID, width=3, radius=15)

    # State 6: COLA OFFLINE (Box 6: x=1860..2480, y=750..960)
    draw_box(draw, (1860, 750, 2480, 960), "TRANSICIÓN ASÍNCRONA: COLA OFFLINE", [
        ("• Escenario: ", "Técnico en zona rural sin red celular 4G"),
        ("• Acción: ", "Asignación guardada localmente en Dexie.js"),
        ("• Indicador UI: ", "Insignia de Reloj (Mutación Pendiente)"),
        ("• Disparador: ", "Evento window.ononline al recuperar cobertura"),
        ("• Sincronización: ", "Envío de mutación en cola FIFO al backend"),
        ("• Conclusión: ", "Commit definitivo en PostgreSQL y confirmación")
    ], header_fill=C_GRAY_MID, width=3, radius=15)

    # Transition DAÑADO -> EN MANTENIMIENTO
    draw_arrow(draw, (1020, 855), (740, 855), width=3)
    draw.text((880, 835), "Envío de Brigada Técnica", font=FONT_BODY_BOLD, fill=C_BLACK, anchor="mm")

    # Transition EN MANTENIMIENTO -> LIBRE
    draw_arrow(draw, (490, 750), (490, 470), width=3)
    draw.rectangle([(340, 595), (640, 625)], fill=C_WHITE, outline=C_BLACK, width=1)
    draw.text((490, 610), "Potencia OK / Reparado", font=FONT_BODY_BOLD, fill=C_BLACK, anchor="mm")

    # Transition LIBRE -> DAÑADO
    draw_stepped_arrow(draw, [(700, 470), (700, 640), (1020, 640), (1020, 750)], width=3)
    draw.rectangle([(730, 625), (990, 655)], fill=C_WHITE, outline=C_BLACK, width=1)
    draw.text((860, 640), "Prueba Falla / Conector Roto", font=FONT_BODY_BOLD, fill=C_BLACK, anchor="mm")

    # Transition OCUPADO -> DAÑADO
    draw_stepped_arrow(draw, [(1900, 470), (1900, 640), (1540, 640), (1540, 750)], width=3)
    draw.rectangle([(1570, 625), (1870, 655)], fill=C_WHITE, outline=C_BLACK, width=1)
    draw.text((1720, 640), "Falla / Atenuación > -28 dBm", font=FONT_BODY_BOLD, fill=C_BLACK, anchor="mm")

    # Transition OCUPADO -> COLA OFFLINE (down) & COLA OFFLINE -> OCUPADO (up)
    draw_arrow(draw, (2300, 470), (2300, 750), width=3)
    draw.rectangle([(2160, 610), (2440, 645)], fill=C_WHITE, outline=C_BLACK, width=1)
    draw.text((2300, 627), "Operación Sin Conexión 4G", font=FONT_BODY_BOLD, fill=C_BLACK, anchor="mm")

    draw_arrow(draw, (2020, 750), (2020, 470), width=3)
    draw.rectangle([(1880, 570), (2160, 605)], fill=C_WHITE, outline=C_BLACK, width=1)
    draw.text((2020, 587), "Reconexión: Sync Exitosa", font=FONT_BODY_BOLD, fill=C_BLACK, anchor="mm")

    # Rules
    draw.rectangle([(40, 1030), (W - 40, 1340)], fill=C_GRAY_LIGHT, outline=C_BLACK, width=2)
    draw.text((60, 1050), "REGLAS DE NEGOCIO Y CONDICIONES DE CONSISTENCIA TRANSACCIONAL (ACID):", font=FONT_HDR, fill=C_BLACK)
    rules = [
        ("1. Inmutabilidad Concurrente: ", "Dos técnicos no pueden reservar simultáneamente el mismo puerto; el bloqueo SELECT ... FOR UPDATE garantiza serialización estricta."),
        ("2. Integridad de Clave Foránea: ", "Un puerto sólo puede estar 'OCUPADO' si tiene un client_id válido y registrado en la tabla 'Clients'."),
        ("3. Tolerancia a Partición de Red: ", "El patrón de cola diferida en Dexie.js permite a las cuadrillas rurales operar sin detener el despliegue técnico."),
        ("4. Auditoría Total: ", "Toda transición genera un registro inmutable en 'audit_logs' con identificador de técnico, fecha exacta y valores de potencia dBm.")
    ]
    ry = 1085
    for pfx, body in rules:
        draw.text((60, ry), pfx, font=FONT_BODY_BOLD, fill=C_BLACK)
        pw = draw.textlength(pfx, font=FONT_BODY_BOLD)
        draw.text((60 + pw, ry), body, font=FONT_BODY, fill=C_BLACK)
        ry += 32

    out_path = 'scratch/diag_estados_puerto.png'
    img.save(out_path, quality=95)
    print(f"SUCCESS: Generated {out_path}")

# =========================================================================
# DIAGRAM 4: DIAGRAMA DE PAQUETES Y COMPONENTES DE SOFTWARE (UML Component)
# =========================================================================
def generate_diagram_4():
    W, H = 2600, 1600
    img = Image.new('RGB', (W, H), C_WHITE)
    draw = ImageDraw.Draw(img)

    draw.rectangle([(40, 30), (W - 40, 100)], fill=C_GRAY_LIGHT, outline=C_BLACK, width=3)
    draw.text((W // 2, 52), "DIAGRAMA DE PAQUETES Y COMPONENTES DE SOFTWARE (UML COMPONENT DIAGRAM)", font=FONT_TITLE, fill=C_BLACK, anchor="mm")
    draw.text((W // 2, 82), "Arquitectura multicapa desacoplada: Capa de Presentación (PWA), Lógica de Aplicación (REST API) y Persistencia Híbrida", font=FONT_SUBTITLE, fill=C_GRAY_DARK, anchor="mm")

    # Package Helper
    def draw_package(draw, xy, pkg_title, tab_w=520, width=3):
        x0, y0, x1, y1 = xy
        tab_h = 36
        draw.rectangle([(x0, y0), (x0 + tab_w, y0 + tab_h)], fill=C_GRAY_MID, outline=C_BLACK, width=width)
        draw.text((x0 + 15, y0 + tab_h // 2), pkg_title, font=FONT_SUBHDR, fill=C_BLACK, anchor="lm")
        draw.rectangle([(x0, y0 + tab_h), (x1, y1)], fill=C_WHITE, outline=C_BLACK, width=width)

    # Component Box Helper
    def draw_component(draw, xy, name, stereotype="<<component>>", lines=None, header_fill=C_GRAY_LIGHT):
        x0, y0, x1, y1 = xy
        draw.rectangle([xy[0], xy[1], xy[2], xy[3]], fill=C_WHITE, outline=C_BLACK, width=2)
        # Component icon top right
        icon_w, icon_h = 24, 16
        ix1 = x1 - 10
        ix0 = ix1 - icon_w
        iy0 = y0 + 8
        iy1 = iy0 + icon_h
        draw.rectangle([(ix0, iy0), (ix1, iy1)], fill=C_WHITE, outline=C_BLACK, width=1)
        draw.rectangle([(ix0 - 4, iy0 + 2), (ix0 + 2, iy0 + 6)], fill=C_WHITE, outline=C_BLACK, width=1)
        draw.rectangle([(ix0 - 4, iy0 + 10), (ix0 + 2, iy0 + 14)], fill=C_WHITE, outline=C_BLACK, width=1)

        draw.rectangle([(x0, y0), (x1, y0 + 38)], fill=header_fill, outline=C_BLACK, width=2)
        draw.text(((x0 + x1) // 2, y0 + 12), stereotype, font=FONT_SMALL_BOLD, fill=C_BLACK, anchor="mm")
        draw.text(((x0 + x1) // 2, y0 + 26), name, font=FONT_SUBHDR, fill=C_BLACK, anchor="mm")

        cur_y = y0 + 46
        if lines:
            for item in lines:
                if isinstance(item, tuple):
                    pfx, txt = item
                    draw.text((x0 + 10, cur_y), pfx, font=FONT_SMALL_BOLD, fill=C_BLACK)
                    pfx_w = draw.textlength(pfx, font=FONT_SMALL_BOLD)
                    draw.text((x0 + 10 + pfx_w, cur_y), txt, font=FONT_SMALL, fill=C_BLACK)
                else:
                    draw.text((x0 + 10, cur_y), item, font=FONT_SMALL, fill=C_BLACK)
                cur_y += 18

    # PACKAGE 1: FRONTEND PWA (Left Column: x=60..860, y=140..1540)
    draw_package(draw, (60, 140, 860, 1540), "Paquete: Capa de Presentación (Frontend React PWA)", tab_w=520)

    draw_component(draw, (90, 200, 830, 390), "Módulo Cartográfico GIS", lines=[
        ("• Biblioteca: ", "React-Leaflet v4 + Leaflet.js"),
        ("• Capas: ", "OpenStreetMap + Capa Vectorial de Fibra"),
        ("• Entidades: ", "Marcadores dinámicos de NAPs, Postes y Mufas"),
        ("• Medición: ", "Cálculo euclidiano y geodésico de distancias"),
        ("• Interfaz: ", "ILeafletMapConsumer (Eventos OnClick)")
    ], header_fill=C_GRAY_LIGHT)

    draw_component(draw, (90, 415, 830, 605), "Chasis Gráfico de Puertos", lines=[
        ("• Motor Gráfico: ", "SVG interactivo reactivo de 16 puertos"),
        ("• Modales Hijos: ", "FormAltaSuscriptor, FichaCliente, ReporteFalla"),
        ("• Estados: ", "Representación visual de Disponibilidad / Bloqueo"),
        ("• Validación: ", "Formularios tipados con Zod resolver")
    ], header_fill=C_GRAY_LIGHT)

    draw_component(draw, (90, 630, 830, 820), "Directorio y Reportería UI", lines=[
        ("• Componente: ", "SubscribersDataGrid con paginación"),
        ("• Filtros: ", "Búsqueda multicriterio en memoria"),
        ("• Exportador: ", "Descarga directa de archivos CSV"),
        ("• Visor PDF: ", "Visualizador de dictámenes técnicos")
    ], header_fill=C_GRAY_LIGHT)

    draw_component(draw, (90, 845, 830, 1035), "Control de Sesión y RBAC", lines=[
        ("• Almacenamiento: ", "JWT Token en SessionStorage"),
        ("• Guardias de Ruta: ", "ProtectedRoute (Verificación de rol)"),
        ("• Roles Soportados: ", "Administrador, Operador NOC, Técnico Rural"),
        ("• Interceptor: ", "Inyección automática de cabecera Bearer")
    ], header_fill=C_GRAY_LIGHT)

    draw_component(draw, (90, 1060, 830, 1260), "Adaptador de Cliente HTTP (Axios)", lines=[
        ("• Librería: ", "Axios Client con Interceptores HTTP"),
        ("• Token Handler: ", "Inyección de Bearer Token en peticiones"),
        ("• Reintentos: ", "Exponencial Backoff en contingencia"),
        ("• Interfaz: ", "IRestClient -> Endpoints JSON")
    ], header_fill=C_GRAY_LIGHT)

    draw_component(draw, (90, 1285, 830, 1515), "Núcleo de Resiliencia Offline", lines=[
        ("• Dexie.js Client: ", "Manejador sobre IndexedDB local"),
        ("• Service Worker: ", "Estrategias CacheFirst y NetworkFirst"),
        ("• Cola FIFO: ", "Tabla local 'pending_mutations'"),
        ("• Detector de Red: ", "Eventos window.ononline / onoffline"),
        ("• SyncManager: ", "Vaciado secuencial de cola al reconectar")
    ], header_fill=C_GRAY_LIGHT)

    # PACKAGE 2: BACKEND REST API (Middle Column: x=930..1750, y=140..1540)
    draw_package(draw, (930, 140, 1750, 1540), "Paquete: Lógica de Negocio (Backend Node.js/Express)", tab_w=520)

    draw_component(draw, (960, 200, 1720, 390), "Seguridad y Middleware", lines=[
        ("• Middleware Auth: ", "Verificación de firma JWT (HS256)"),
        ("• Control de Roles: ", "Filtro RBAC estricto por endpoint"),
        ("• Sanitización: ", "Middleware de validación con Zod Schemas"),
        ("• Protección: ", "Helmet.js, CORS y Rate Limiting anti DoS")
    ], header_fill=C_GRAY_LIGHT)

    draw_component(draw, (960, 415, 1720, 645), "Controlador de Puertos y Concurrencia", lines=[
        ("• Clase: ", "PortController.js"),
        ("• Método Crítico: ", "assignPortToClient()"),
        ("• Transaccionalidad: ", "sequelize.transaction({ isolation: SERIALIZABLE })"),
        ("• Bloqueo: ", "SELECT ... FOR UPDATE pesimista"),
        ("• Integridad: ", "Garantía de cero colisiones de asignación")
    ], header_fill=C_GRAY_LIGHT)

    draw_component(draw, (960, 670, 1720, 870), "Controladores de Red y Clientes", lines=[
        ("• NapController: ", "Gestión de cajas NAP, coordenadas y capacidades"),
        ("• ClientController: ", "Altas, consultas, bajas y contratos"),
        ("• FiberController: ", "Trazado de cables troncales y ramales"),
        ("• UserController: ", "Administración de cuentas técnicas y roles")
    ], header_fill=C_GRAY_LIGHT)

    draw_component(draw, (960, 895, 1720, 1105), "Motor de Reportería (PDFKit Stream)", lines=[
        ("• Librería: ", "PDFKit Server-side Engine"),
        ("• Rendimiento: ", "Generación binaria al vuelo (Streaming directo)"),
        ("• Formato: ", "Cédula ejecutiva formal con tablas y encabezados"),
        ("• Memoria: ", "0% retención en disco (Pipe directo a HTTP Response)")
    ], header_fill=C_GRAY_LIGHT)

    draw_component(draw, (960, 1130, 1720, 1320), "Gestor de Sincronización Diferida", lines=[
        ("• Endpoint: ", "POST /api/sync/batch"),
        ("• Algoritmo: ", "Conciliación secuencial FIFO por timestamp"),
        ("• Detección Conflicto: ", "Retorno de código HTTP 409 con detalle"),
        ("• Auditoría: ", "Logeo de toda mutación diferida exitosa")
    ], header_fill=C_GRAY_LIGHT)

    draw_component(draw, (960, 1345, 1720, 1515), "Capa ORM / Acceso a Datos", lines=[
        ("• Framework: ", "Sequelize ORM v6"),
        ("• Modelos: ", "NAP, Port, Client, Fiber, AuditLog, User"),
        ("• Pool Conexiones: ", "Max 20 conexiones persistentes con reconexión")
    ], header_fill=C_GRAY_LIGHT)

    # PACKAGE 3: PERSISTENCE LAYER (Right Column: x=1820..2540, y=140..1540)
    draw_package(draw, (1820, 140, 2540, 1540), "Paquete: Persistencia de Datos Híbrida", tab_w=520)

    draw_component(draw, (1850, 200, 2510, 420), "Cache HTTP Service Worker", stereotype="<<cache>>", lines=[
        ("• Estrategia: ", "Workbox CacheFirst para assets estáticos"),
        ("• Recursos en Cache: ", "Bundle JS, CSS, Iconos SVG y Leaflet Tiles"),
        ("• Tiempo Expiración: ", "7 días con invalidación por versión de release"),
        ("• Beneficio: ", "Carga de la aplicación web en menos de 1.2 segundos")
    ], header_fill=C_GRAY_LIGHT)

    draw_component(draw, (1850, 445, 2510, 775), "Almacén Local IndexedDB (Dexie.js)", stereotype="<<datastore>>", lines=[
        ("• Entorno: ", "Almacenamiento estructurado en dispositivo móvil"),
        ("• Objeto 'cached_naps': ", "Copia snapshot de red para visualización offline"),
        ("• Objeto 'pending_mutations': ", "Cola persistente FIFO de altas y cambios"),
        ("• Objeto 'cached_tiles': ", "Celdas cartográficas satelitales en caché"),
        ("• Capacidad: ", "Persistencia garantizada aún ante reinicios")
    ], header_fill=C_GRAY_LIGHT)

    draw_component(draw, (1850, 800, 2510, 1260), "Base de Datos Relacional PostgreSQL 15", stereotype="<<database>>", lines=[
        ("• Tabla 'users': ", "ID, username, password_hash, role"),
        ("• Tabla 'naps': ", "ID, code, lat, lng, capacity, status"),
        ("• Tabla 'ports': ", "ID, nap_id, port_number, status, client_id"),
        ("• Tabla 'clients': ", "ID, contract_num, name, phone, ip_address"),
        ("• Tabla 'fibers': ", "ID, fiber_type, strand_count, geojson_path"),
        ("• Tabla 'audit_logs': ", "ID, user_id, action, target, timestamp"),
        ("• Motor Transaccional: ", "ACID con nivel de aislamiento estricto"),
        ("• Índices: ", "B-Tree en port_number, code y client_id")
    ], header_fill=C_GRAY_LIGHT)

    draw_component(draw, (1850, 1290, 2510, 1515), "Bitácora Inmutable de Auditoría", stereotype="<<datastore>>", lines=[
        ("• Finalidad: ", "Trazabilidad forense y regulatoria"),
        ("• Campos Clave: ", "user_id, IP, MAC, action, prev_val, new_val"),
        ("• Restricción: ", "Sólo operaciones INSERT (Inmutable / No UPDATE)"),
        ("• Casos de Uso: ", "Investigación de saturación, sabotajes o bajas")
    ], header_fill=C_GRAY_LIGHT)

    # Clean horizontal connectors between packages
    # Frontend -> Backend
    draw_arrow(draw, (830, 510), (960, 510), width=3)
    draw.rectangle([(845, 495), (945, 525)], fill=C_WHITE, outline=C_BLACK, width=1)
    draw.text((895, 510), "POST /ports", font=FONT_SMALL_BOLD, fill=C_BLACK, anchor="mm")

    draw_arrow(draw, (830, 1160), (960, 1160), width=3)
    draw.rectangle([(845, 1145), (945, 1175)], fill=C_WHITE, outline=C_BLACK, width=1)
    draw.text((895, 1160), "HTTP REST", font=FONT_SMALL_BOLD, fill=C_BLACK, anchor="mm")

    # Backend -> Database
    draw_arrow(draw, (1720, 1030), (1850, 1030), width=3)
    draw.rectangle([(1745, 1015), (1825, 1045)], fill=C_WHITE, outline=C_BLACK, width=1)
    draw.text((1785, 1030), "SQL / ACID", font=FONT_SMALL_BOLD, fill=C_BLACK, anchor="mm")

    draw_arrow(draw, (1720, 1430), (1850, 1430), width=3)
    draw.rectangle([(1745, 1415), (1825, 1445)], fill=C_WHITE, outline=C_BLACK, width=1)
    draw.text((1785, 1430), "AuditLog", font=FONT_SMALL_BOLD, fill=C_BLACK, anchor="mm")

    out_path = 'scratch/diag_paquetes_componentes.png'
    img.save(out_path, quality=95)
    print(f"SUCCESS: Generated {out_path}")

# =========================================================================
# DIAGRAM 5: DIAGRAMA DE ROBUSTEZ V-O-C (Vista-Controlador-Entidad)
# =========================================================================
def generate_diagram_5():
    W, H = 2600, 1500
    img = Image.new('RGB', (W, H), C_WHITE)
    draw = ImageDraw.Draw(img)

    draw.rectangle([(40, 30), (W - 40, 100)], fill=C_GRAY_LIGHT, outline=C_BLACK, width=3)
    draw.text((W // 2, 52), "DIAGRAMA DE ROBUSTEZ V-O-C: ASIGNACIÓN Y CONCURRENCIA DE PUERTO ÓPTICO", font=FONT_TITLE, fill=C_BLACK, anchor="mm")
    draw.text((W // 2, 82), "Análisis semántico del Caso de Uso: Actores, Objetos Límite (Boundary), Controladores (Control) y Entidades (Entity)", font=FONT_SUBTITLE, fill=C_GRAY_DARK, anchor="mm")

    # Jacobson Symbol Helpers
    def draw_actor(draw, xy, name):
        cx, cy = xy
        draw.ellipse([(cx - 16, cy - 40), (cx + 16, cy - 8)], fill=C_WHITE, outline=C_BLACK, width=2)
        draw.line([(cx, cy - 8), (cx, cy + 24)], fill=C_BLACK, width=2)
        draw.line([(cx - 26, cy + 4), (cx + 26, cy + 4)], fill=C_BLACK, width=2)
        draw.line([(cx, cy + 24), (cx - 20, cy + 54)], fill=C_BLACK, width=2)
        draw.line([(cx, cy + 24), (cx + 20, cy + 54)], fill=C_BLACK, width=2)
        draw.text((cx, cy + 70), name, font=FONT_BODY_BOLD, fill=C_BLACK, anchor="mm")

    def draw_boundary(draw, xy, name, subtext=""):
        cx, cy = xy
        r = 38
        draw.ellipse([(cx - r, cy - r), (cx + r, cy + r)], fill=C_WHITE, outline=C_BLACK, width=2)
        draw.line([(cx - r, cy - r - 8), (cx - r, cy + r + 8)], fill=C_BLACK, width=3)
        draw.line([(cx - r, cy), (cx - r + 16, cy)], fill=C_BLACK, width=2)
        draw.text((cx, cy + r + 18), name, font=FONT_SUBHDR, fill=C_BLACK, anchor="mm")
        if subtext:
            draw.text((cx, cy + r + 36), subtext, font=FONT_SMALL, fill=C_GRAY_DARK, anchor="mm")

    def draw_control(draw, xy, name, subtext=""):
        cx, cy = xy
        r = 38
        draw.ellipse([(cx - r, cy - r), (cx + r, cy + r)], fill=C_WHITE, outline=C_BLACK, width=2)
        draw.polygon([(cx, cy - r), (cx + 12, cy - r - 12), (cx + 6, cy - r - 12), (cx + 6, cy - r - 22), (cx - 6, cy - r - 22), (cx - 6, cy - r - 12), (cx - 12, cy - r - 12)], fill=C_BLACK)
        draw.text((cx, cy + r + 18), name, font=FONT_SUBHDR, fill=C_BLACK, anchor="mm")
        if subtext:
            draw.text((cx, cy + r + 36), subtext, font=FONT_SMALL, fill=C_GRAY_DARK, anchor="mm")

    def draw_entity(draw, xy, name, subtext=""):
        cx, cy = xy
        r = 38
        draw.ellipse([(cx - r, cy - r), (cx + r, cy + r)], fill=C_WHITE, outline=C_BLACK, width=2)
        draw.line([(cx - r - 8, cy + r), (cx + r + 8, cy + r)], fill=C_BLACK, width=3)
        draw.text((cx, cy + r + 18), name, font=FONT_SUBHDR, fill=C_BLACK, anchor="mm")
        if subtext:
            draw.text((cx, cy + r + 36), subtext, font=FONT_SMALL, fill=C_GRAY_DARK, anchor="mm")

    # Column 1: ACTOR - FIELD TECHNICIAN (Left: x=160, y=600)
    draw_actor(draw, (160, 600), "Técnico de Campo\n(PWA Móvil / Terreno)")

    # ACTOR 2: NOC SUPERVISOR (Right: x=2420, y=920)
    draw_actor(draw, (2420, 920), "Operador NOC\n(Consola Central)")

    # Column 2: BOUNDARIES (x=580)
    draw_boundary(draw, (580, 260), "UI_Chasis_NAP", "Visor SVG interactivo")
    draw_boundary(draw, (580, 480), "UI_Formulario_Alta", "Captura de suscriptor y dBm")
    draw_boundary(draw, (580, 920), "UI_Notificacion_Estado", "Semáforo y badge de puerto")
    draw_boundary(draw, (580, 1160), "UI_Monitor_Offline", "Barra de estado de sincronización")

    # Column 3: CONTROLLERS (x=1200)
    draw_control(draw, (1200, 260), "Ctrl_Verificar_Disponibilidad", "Consulta de estado actual")
    draw_control(draw, (1200, 480), "Ctrl_Validar_Formulario", "Validación Zod y rangos ópticos")
    draw_control(draw, (1200, 700), "Ctrl_Bloqueo_Pesimista", "SELECT ... FOR UPDATE")
    draw_control(draw, (1200, 920), "Ctrl_Transaccion_ACID", "COMMIT / ROLLBACK Sequelize")
    draw_control(draw, (1200, 1160), "Ctrl_Encolador_Offline", "Dexie.js Queue Dispatcher")

    # Column 4: ENTITIES (x=1960)
    draw_entity(draw, (1960, 260), "Entidad: Puerto_Optico", "status, port_number, nap_id")
    draw_entity(draw, (1960, 480), "Entidad: Caja_NAP", "code, capacity, lat, lng, splitter")
    draw_entity(draw, (1960, 700), "Entidad: Cliente_Suscriptor", "contract_num, name, phone, ip")
    draw_entity(draw, (1960, 920), "Entidad: Bitacora_Auditoria", "audit_logs (user, timestamp, action)")
    draw_entity(draw, (1960, 1160), "Entidad: Cola_Mutaciones", "pending_mutations (IndexedDB)")

    # 100% CLEAN CONNECTING LINES (ZERO CROSSINGS!)
    # Technician -> 4 Boundaries (Fanning out naturally)
    draw_arrow(draw, (220, 560), (520, 260), width=2)
    draw.text((350, 390), "1. Selecciona NAP y Puerto", font=FONT_SMALL_BOLD, fill=C_BLACK, anchor="mm")

    draw_arrow(draw, (220, 580), (520, 480), width=2)
    draw.text((350, 510), "2. Ingresa Datos Suscriptor", font=FONT_SMALL_BOLD, fill=C_BLACK, anchor="mm")

    draw_arrow(draw, (220, 620), (520, 920), width=2)
    draw.text((350, 780), "4. Recibe Feedback Visual", font=FONT_SMALL_BOLD, fill=C_BLACK, anchor="mm")

    draw_arrow(draw, (220, 640), (520, 1160), width=2)
    draw.text((350, 920), "3. Detecta Modo Offline", font=FONT_SMALL_BOLD, fill=C_BLACK, anchor="mm")

    # Boundaries -> Controls (Tier by tier horizontal alignment)
    draw_arrow(draw, (640, 260), (1140, 260), width=2)
    draw.text((890, 240), "Solicitud Lectura Estado", font=FONT_SMALL_BOLD, fill=C_BLACK, anchor="mm")

    draw_arrow(draw, (640, 480), (1140, 480), width=2)
    draw.text((890, 460), "Envío Payload Alta", font=FONT_SMALL_BOLD, fill=C_BLACK, anchor="mm")

    draw_arrow(draw, (640, 1160), (1140, 1160), width=2)
    draw.text((890, 1140), "Encolar Mutación Local", font=FONT_SMALL_BOLD, fill=C_BLACK, anchor="mm")

    # Feedback from Ctrl_Transaccion_ACID to UI_Notificacion_Estado (Direct horizontal!)
    draw_arrow(draw, (1140, 920), (640, 920), width=2)
    draw.rectangle([(800, 905), (1040, 935)], fill=C_WHITE, outline=C_BLACK, width=1)
    draw.text((920, 920), "Confirmación Éxito / Feedback", font=FONT_SMALL_BOLD, fill=C_BLACK, anchor="mm")

    # Controls -> Controls
    draw_arrow(draw, (1200, 540), (1200, 640), width=2)
    draw.text((1290, 590), "Datos Válidos", font=FONT_SMALL_BOLD, fill=C_BLACK, anchor="mm")

    draw_arrow(draw, (1200, 760), (1200, 860), width=2)
    draw.text((1290, 810), "Candado Adquirido", font=FONT_SMALL_BOLD, fill=C_BLACK, anchor="mm")

    # Controls -> Entities (Direct horizontal or cleanly stepped)
    draw_arrow(draw, (1260, 260), (1900, 260), width=2)
    draw.text((1580, 240), "SELECT WHERE id = ? [Read]", font=FONT_SMALL_BOLD, fill=C_BLACK, anchor="mm")

    draw_arrow(draw, (1260, 480), (1900, 480), width=2)
    draw.text((1580, 460), "Validar Capacidad NAP", font=FONT_SMALL_BOLD, fill=C_BLACK, anchor="mm")

    # Bloqueo Pesimista to Puerto_Optico
    draw_stepped_arrow(draw, [(1260, 700), (1550, 700), (1550, 280), (1900, 280)], width=2)
    draw.rectangle([(1420, 560), (1680, 590)], fill=C_WHITE, outline=C_BLACK, width=1)
    draw.text((1550, 575), "LOCK ROW [FOR UPDATE]", font=FONT_SMALL_BOLD, fill=C_BLACK, anchor="mm")

    # Transaccion ACID to Cliente and Bitacora
    draw_stepped_arrow(draw, [(1260, 900), (1600, 900), (1600, 700), (1900, 700)], width=2)
    draw.rectangle([(1480, 785), (1720, 815)], fill=C_WHITE, outline=C_BLACK, width=1)
    draw.text((1600, 800), "INSERT INTO clients", font=FONT_SMALL_BOLD, fill=C_BLACK, anchor="mm")

    draw_arrow(draw, (1260, 920), (1900, 920), width=2)
    draw.rectangle([(1470, 905), (1730, 935)], fill=C_WHITE, outline=C_BLACK, width=1)
    draw.text((1600, 920), "INSERT INTO audit_logs", font=FONT_SMALL_BOLD, fill=C_BLACK, anchor="mm")

    draw_arrow(draw, (1260, 1160), (1900, 1160), width=2)
    draw.text((1580, 1140), "pending_mutations.add()", font=FONT_SMALL_BOLD, fill=C_BLACK, anchor="mm")

    # NOC Actor connection to Bitacora_Auditoria (Right side!)
    draw_arrow(draw, (2360, 920), (2020, 920), width=2)
    draw.rectangle([(2070, 905), (2310, 935)], fill=C_WHITE, outline=C_BLACK, width=1)
    draw.text((2190, 920), "Monitoreo y Auditoría NOC", font=FONT_SMALL_BOLD, fill=C_BLACK, anchor="mm")

    # Legend at bottom
    draw.rectangle([(60, 1340), (W - 60, 1460)], fill=C_GRAY_LIGHT, outline=C_BLACK, width=2)
    draw.text((80, 1360), "CONVENCIONES DEL ANÁLISIS DE ROBUSTEZ (MÉTODO DE IVAR JACOBSON):", font=FONT_HDR, fill=C_BLACK)
    draw.text((80, 1390), "• Objetos Límite (Boundary): Representan las pantallas, modales y formularios donde los técnicos interactúan con el sistema.", font=FONT_BODY, fill=C_BLACK)
    draw.text((80, 1412), "• Objetos de Control (Control): Encapsulan la lógica de negocio, validaciones Zod, transacciones ACID y coordinación de sincronización.", font=FONT_BODY, fill=C_BLACK)
    draw.text((80, 1434), "• Objetos de Entidad (Entity): Modelan la información persistente que se almacena en PostgreSQL (servidor) o IndexedDB (móvil).", font=FONT_BODY, fill=C_BLACK)

    out_path = 'scratch/diag_robustez_asignacion.png'
    img.save(out_path, quality=95)
    print(f"SUCCESS: Generated {out_path}")

# =========================================================================
# DIAGRAM 6: DIAGRAMA DE SECUENCIA UML (Offline-First Sync)
# =========================================================================
def generate_diagram_6():
    W, H = 2600, 1600
    img = Image.new('RGB', (W, H), C_WHITE)
    draw = ImageDraw.Draw(img)

    draw.rectangle([(40, 30), (W - 40, 100)], fill=C_GRAY_LIGHT, outline=C_BLACK, width=3)
    draw.text((W // 2, 52), "DIAGRAMA DE SECUENCIA UML: SINCRONIZACIÓN ASÍNCRONA EN DIFERIDO (OFFLINE-FIRST)", font=FONT_TITLE, fill=C_BLACK, anchor="mm")
    draw.text((W // 2, 82), "Flujo temporal de mutaciones, almacenamiento local en IndexedDB y conciliación transaccional al restaurar conectividad", font=FONT_SUBTITLE, fill=C_GRAY_DARK, anchor="mm")

    # Lifelines
    lifelines = [
        ("Técnico (UI PWA)", 200),
        ("Dexie.js (IndexedDB)", 650),
        ("SyncManager / SW", 1100),
        ("REST API (Express)", 1550),
        ("Sequelize (ORM)", 2000),
        ("PostgreSQL 15 (DB)", 2400)
    ]

    for name, lx in lifelines:
        draw.rounded_rectangle([(lx - 120, 130), (lx + 120, 190)], radius=8, fill=C_GRAY_MID, outline=C_BLACK, width=2)
        draw.text((lx, 160), name, font=FONT_SUBHDR, fill=C_BLACK, anchor="mm")
        draw_dashed_line(draw, (lx, 190), (lx, 1530), width=2, color=C_GRAY_DARK)

    # Shaded phases background
    # Phase 1: Offline operation (y=210..550)
    draw.rectangle([(60, 210), (W - 60, 540)], fill=C_GRAY_LIGHT, outline=C_BLACK, width=1)
    draw.rectangle([(70, 220), (750, 255)], fill=C_GRAY_MID, outline=C_BLACK, width=1)
    draw.text((410, 237), "FASE 1: OPERACIÓN EN CAMPO SIN COBERTURA (MODO OFFLINE)", font=FONT_SUBHDR, fill=C_BLACK, anchor="mm")

    # Phase 2: Reconnection & sync dispatch (y=560..860)
    draw.rectangle([(60, 560), (W - 60, 860)], fill=C_WHITE, outline=C_BLACK, width=1)
    draw.rectangle([(70, 570), (750, 605)], fill=C_GRAY_MID, outline=C_BLACK, width=1)
    draw.text((410, 587), "FASE 2: DETECCIÓN DE ENLACE Y DESPACHO DE COLA ASÍNCRONA", font=FONT_SUBHDR, fill=C_BLACK, anchor="mm")

    # Phase 3: Transactional reconciliation ACID (y=880..1520)
    draw.rectangle([(60, 880), (W - 60, 1520)], fill=C_GRAY_LIGHT, outline=C_BLACK, width=1)
    draw.rectangle([(70, 890), (750, 925)], fill=C_GRAY_MID, outline=C_BLACK, width=1)
    draw.text((410, 907), "FASE 3: AISLAMIENTO TRANSACCIONAL ACID Y COMMIT EN BASE DE DATOS", font=FONT_SUBHDR, fill=C_BLACK, anchor="mm")

    # Sequence Messages
    # 1. UI submits assignment
    draw_arrow(draw, (200, 280), (650, 280), width=3)
    draw.text((425, 265), "1. submitForm(cliente, puerto, -19.5 dBm)", font=FONT_BODY_BOLD, fill=C_BLACK, anchor="mm")

    # 1.1 Local check
    draw.line([(200, 320), (280, 320)], fill=C_BLACK, width=2)
    draw.line([(280, 320), (280, 350)], fill=C_BLACK, width=2)
    draw_arrow(draw, (280, 350), (200, 350), width=2)
    draw.text((370, 335), "navigator.onLine == false [Detecta Desconexión]", font=FONT_SMALL_BOLD, fill=C_BLACK, anchor="lm")

    # 2. Add to Dexie queue
    draw_arrow(draw, (200, 400), (650, 400), width=3)
    draw.text((425, 385), "2. pending_mutations.add({ endpoint, payload, timestamp, uuid })", font=FONT_BODY_BOLD, fill=C_BLACK, anchor="mm")

    # 2.1 Dexie returns ID
    draw_dashed_line(draw, (650, 440), (200, 440), width=2)
    draw_arrow(draw, (220, 440), (200, 440), width=2)
    draw.text((425, 425), "3. Promise resolved (ID local generado)", font=FONT_SMALL, fill=C_BLACK, anchor="mm")

    # 3. Update UI local feedback
    draw.line([(200, 480), (280, 480)], fill=C_BLACK, width=2)
    draw.line([(280, 480), (280, 510)], fill=C_BLACK, width=2)
    draw_arrow(draw, (280, 510), (200, 510), width=2)
    draw.text((300, 495), "4. Actualizar Chasis: Puerto 04 'Pendiente' (Icono Reloj)", font=FONT_BODY_BOLD, fill=C_BLACK, anchor="lm")

    # Phase 2 Messages
    # 5. Connection event
    draw.line([(1100, 630), (1180, 630)], fill=C_BLACK, width=2)
    draw.line([(1180, 630), (1180, 660)], fill=C_BLACK, width=2)
    draw_arrow(draw, (1180, 660), (1100, 660), width=2)
    draw.text((1200, 645), "5. Evento window.ononline detectado por SyncManager", font=FONT_BODY_BOLD, fill=C_BLACK, anchor="lm")

    # 6. Read Dexie queue
    draw_arrow(draw, (1100, 710), (650, 710), width=3)
    draw.text((875, 695), "6. getPendingMutations() [Lectura FIFO]", font=FONT_BODY_BOLD, fill=C_BLACK, anchor="mm")

    # 7. Dexie returns batch
    draw_dashed_line(draw, (650, 750), (1100, 750), width=2)
    draw_arrow(draw, (1080, 750), (1100, 750), width=2)
    draw.text((875, 735), "7. Array de mutaciones pendientes", font=FONT_SMALL, fill=C_BLACK, anchor="mm")

    # 8. Send to REST API
    draw_arrow(draw, (1100, 810), (1550, 810), width=3)
    draw.text((1325, 795), "8. HTTP POST /api/ports/4/assign (Payload + Bearer JWT)", font=FONT_BODY_BOLD, fill=C_BLACK, anchor="mm")

    # Phase 3 Messages
    # 9. API validates with Zod
    draw.line([(1550, 950), (1630, 950)], fill=C_BLACK, width=2)
    draw.line([(1630, 950), (1630, 980)], fill=C_BLACK, width=2)
    draw_arrow(draw, (1630, 980), (1550, 980), width=2)
    draw.text((1650, 965), "9. Zod.parse(req.body) [Validación Sintáctica]", font=FONT_BODY_BOLD, fill=C_BLACK, anchor="lm")

    # 10. Start transaction
    draw_arrow(draw, (1550, 1020), (2000, 1020), width=3)
    draw.text((1775, 1005), "10. sequelize.transaction() [Inicia Transacción]", font=FONT_BODY_BOLD, fill=C_BLACK, anchor="mm")

    # 11. Lock row in DB
    draw_arrow(draw, (2000, 1070), (2400, 1070), width=3)
    draw.text((2200, 1055), "11. SELECT * FROM \"Ports\" WHERE id = 4 FOR UPDATE", font=FONT_BODY_BOLD, fill=C_BLACK, anchor="mm")

    # 12. PostgreSQL grants lock
    draw_dashed_line(draw, (2400, 1110), (2000, 1110), width=2)
    draw_arrow(draw, (2020, 1110), (2000, 1110), width=2)
    draw.text((2200, 1095), "12. Row Lock Concedido (Bloqueo Pesimista)", font=FONT_SMALL, fill=C_BLACK, anchor="mm")

    # 13. Update port status
    draw_arrow(draw, (2000, 1160), (2400, 1160), width=3)
    draw.text((2200, 1145), "13. UPDATE \"Ports\" SET status='OCCUPIED', client_id=1042", font=FONT_BODY_BOLD, fill=C_BLACK, anchor="mm")

    # 14. Insert audit log
    draw_arrow(draw, (2000, 1210), (2400, 1210), width=3)
    draw.text((2200, 1195), "14. INSERT INTO \"AuditLogs\" (user, port, action, dBm)", font=FONT_BODY_BOLD, fill=C_BLACK, anchor="mm")

    # 15. Commit
    draw_arrow(draw, (2000, 1260), (2400, 1260), width=3)
    draw.text((2200, 1245), "15. COMMIT TRANSACTION [Liberación de Candado]", font=FONT_BODY_BOLD, fill=C_BLACK, anchor="mm")

    # 16. DB OK
    draw_dashed_line(draw, (2400, 1300), (1550, 1300), width=2)
    draw_arrow(draw, (1570, 1300), (1550, 1300), width=2)
    draw.text((1975, 1285), "16. Transacción Exitosa Persistida", font=FONT_SMALL, fill=C_BLACK, anchor="mm")

    # 17. HTTP 200 OK
    draw_dashed_line(draw, (1550, 1350), (1100, 1350), width=2)
    draw_arrow(draw, (1120, 1350), (1100, 1350), width=2)
    draw.text((1325, 1335), "17. HTTP 200 OK { success: true, port: 4, client: 1042 }", font=FONT_BODY_BOLD, fill=C_BLACK, anchor="mm")

    # 18. Delete local mutation
    draw_arrow(draw, (1100, 1400), (650, 1400), width=3)
    draw.text((875, 1385), "18. pending_mutations.delete(mutationId)", font=FONT_BODY_BOLD, fill=C_BLACK, anchor="mm")

    # 19. Update UI confirmed
    draw_dashed_line(draw, (1100, 1460), (200, 1460), width=2)
    draw_arrow(draw, (220, 1460), (200, 1460), width=2)
    draw.text((650, 1445), "19. BroadcastChannel -> UI: 'Puerto 04 Sincronizado Exitosamente ✓'", font=FONT_BODY_BOLD, fill=C_BLACK, anchor="mm")

    out_path = 'scratch/diag_secuencia_offline.png'
    img.save(out_path, quality=95)
    print(f"SUCCESS: Generated {out_path}")

# =========================================================================
# DIAGRAM 7: DIAGRAMA DE TOPOLOGÍA LÓGICA Y FÍSICA DE RED GPON / FTTx
# =========================================================================
def generate_diagram_7():
    W, H = 2600, 1600
    img = Image.new('RGB', (W, H), C_WHITE)
    draw = ImageDraw.Draw(img)

    draw.rectangle([(40, 30), (W - 40, 100)], fill=C_GRAY_LIGHT, outline=C_BLACK, width=3)
    draw.text((W // 2, 52), "DIAGRAMA DE TOPOLOGÍA LÓGICA Y FÍSICA DE LA RED PASIVA GPON / FTTx", font=FONT_TITLE, fill=C_BLACK, anchor="mm")
    draw.text((W // 2, 82), "Jerarquía de distribución punto a multipunto: OLT, ODF Central, Splitters Nivel 1 y 2, Cajas NAP y Acometida ONT", font=FONT_SUBTITLE, fill=C_GRAY_DARK, anchor="mm")

    # Column 1: Central Office
    draw_box(draw, (60, 140, 440, 880), "1. Cabecera Central (NOC)", [
        ("• Equipo: ", "Chasis OLT GPON Modular"),
        ("• Puerto PON: ", "Transceptor SFP Clase C+"),
        ("• Longitudes de Onda:", ""),
        ("   - Downstream: ", "1490 nm (Tx: +3 a +7 dBm)"),
        ("   - Upstream: ", "1310 nm (Rx: -8 a -28 dBm)"),
        ("• Tasa de Datos:", ""),
        ("   - Bajada: ", "2.488 Gbps TDM"),
        ("   - Subida: ", "1.244 Gbps TDMA"),
        ("• Conectorización: ", "Patchcord SC-UPC a SC-APC"),
        ("• Distribuidor ODF: ", "Panel de Fibra Central"),
        ("• Norma: ", "ITU-T G.984.1 / G.984.2"),
        ("• Capacidad Máx: ", "128 ONTs por puerto PON")
    ], header_fill=C_GRAY_MID)

    # Column 2: Feeder Cable
    draw_box(draw, (490, 140, 870, 880), "2. Red Troncal (Feeder)", [
        ("• Cable Troncal: ", "Monomodo ITU-T G.652.D"),
        ("• Capacidad: ", "24 Hilos de Fibra Óptica"),
        ("• Cubierta: ", "Doble chaqueta ADSS / PKP"),
        ("• Tendido: ", "Aéreo en postería C-9 / C-11"),
        ("• Distancia Feeder: ", "4.5 km desde NOC Central"),
        ("• Atenuación Cable: ", "0.35 dB/km @ 1310 nm"),
        ("                    ", "0.22 dB/km @ 1490 nm"),
        ("• Elementos de Paso: ", "Herrajes tipo D, preformados"),
        ("• Reservas: ", "Raquetas de 15 m cada 500 m"),
        ("• Mufa de Empalme: ", "FOSC Domo Termocontraíble")
    ], header_fill=C_GRAY_MID)

    # Column 3: Splitter Level 1 (1:4)
    draw_box(draw, (920, 140, 1300, 880), "3. División Nivel 1 (1:4)", [
        ("• Dispositivo: ", "Splitter PLC Óptico 1:4"),
        ("• Tipo: ", "Balanceado (25% por puerto)"),
        ("• Atenuación Teórica: ", "6.02 dB"),
        ("• Pérdida Inserción: ", "~7.2 dB típica"),
        ("• Pérdida Retorno: ", "> 55 dB (SC-APC)"),
        ("• Alojamiento: ", "Mufa de Distribución Aérea"),
        ("• Empalmes: ", "Fusión por arco eléctrico"),
        ("• Pérdida por Fusión: ", "< 0.05 dB por empalme"),
        ("• Salidas: ", "4 Ramales de Distribución"),
        ("• Destino: ", "Cajas de distribución barrial")
    ], header_fill=C_GRAY_MID)

    # Column 4: Secondary Distribution
    draw_box(draw, (1350, 140, 1730, 880), "4. Red Secundaria", [
        ("• Cable Ramal: ", "Cable Aéreo 6 a 12 Hilos"),
        ("• Norma Fibra: ", "ITU-T G.652.D Monomodo"),
        ("• Distancia Ramal: ", "1.8 km promedio a colonias"),
        ("• Código de Colores: ", "Código TIA/EIA-598"),
        ("• Hilos Activos: ", "Azul, Naranja, Verde, Marrón"),
        ("• Postería: ", "Postes urbanos y de paso"),
        ("• Fijación: ", "Flejes de acero y grapas tipo cruz"),
        ("• Trazabilidad GIS: ", "Identificado en visor del software"),
        ("• Cobertura: ", "San José del Rincón Sector 01")
    ], header_fill=C_GRAY_MID)

    # Column 5: NAP Box 1:16
    draw_box(draw, (1780, 140, 2160, 880), "5. Terminal NAP (1:16)", [
        ("• Dispositivo: ", "Caja NAP Terminal IP65"),
        ("• Splitter Secundario: ", "PLC Balanceado 1:16"),
        ("• Atenuación Teórica: ", "12.04 dB"),
        ("• Pérdida Inserción: ", "~13.8 dB típica"),
        ("• Conectores: ", "16 Puertos Hembra SC-APC"),
        ("• Pérdida Conector: ", "~0.30 dB"),
        ("• Gestión en Software: ", "Chasis Virtual SVG 16 Puertos"),
        ("• Identificador: ", "NAP-SJR-01 a NAP-SJR-24"),
        ("• Saturación Límite: ", "16 Clientes por Caja"),
        ("• Estado Monitoreado: ", "Libre, Ocupado, Dañado")
    ], header_fill=C_GRAY_MID)

    # Column 6: Drop & ONT
    draw_box(draw, (2210, 140, 2540, 880), "6. Acometida y ONT", [
        ("• Cable Drop: ", "Figura 8 Monomodo"),
        ("• Fibra Insensible: ", "ITU-T G.657.A2 (Radio 7.5mm)"),
        ("• Longitud Drop: ", "Vano máx 150 m hacia casa"),
        ("• Conector en Campo: ", "Conector Rápido SC-APC"),
        ("• Roseta Óptica: ", "Punto de demarcación interior"),
        ("• Equipo ONT: ", "Módem Óptico GPON ONT"),
        ("• Potencia Recibida: ", "-18.5 dBm a -22.5 dBm"),
        ("• Sensibilidad ONT: ", "-8.0 dBm a -28.0 dBm"),
        ("• Margen de Diseño: ", "+5.5 dB de seguridad"),
        ("• Interfaz LAN: ", "Gigabit Ethernet + Wi-Fi 6")
    ], header_fill=C_GRAY_MID)

    # Connecting Arrows between Tiers
    draw_arrow(draw, (440, 360), (490, 360), width=3)
    draw.text((465, 340), "Troncal", font=FONT_SMALL_BOLD, fill=C_BLACK, anchor="mm")

    draw_arrow(draw, (870, 360), (920, 360), width=3)
    draw.text((895, 340), "Hilos 1-4", font=FONT_SMALL_BOLD, fill=C_BLACK, anchor="mm")

    draw_arrow(draw, (1300, 360), (1350, 360), width=3)
    draw.text((1325, 340), "Ramal 1", font=FONT_SMALL_BOLD, fill=C_BLACK, anchor="mm")

    draw_arrow(draw, (1730, 360), (1780, 360), width=3)
    draw.text((1755, 340), "Entrada", font=FONT_SMALL_BOLD, fill=C_BLACK, anchor="mm")

    draw_arrow(draw, (2160, 360), (2210, 360), width=3)
    draw.text((2185, 340), "Drop", font=FONT_SMALL_BOLD, fill=C_BLACK, anchor="mm")

    # Bottom Table: PRESUPUESTO ÓPTICO DE POTENCIA (LINK BUDGET)
    draw.rectangle([(60, 930), (W - 60, 1540)], fill=C_GRAY_LIGHT, outline=C_BLACK, width=2)
    draw.rectangle([(60, 930), (W - 60, 980)], fill=C_GRAY_MID, outline=C_BLACK, width=2)
    draw.text((W // 2, 955), "BALANCE Y PRESUPUESTO DE POTENCIA ÓPTICA (OPTICAL LINK BUDGET) SEGÚN RECOMENDACIÓN ITU-T G.984.2", font=FONT_HDR, fill=C_BLACK, anchor="mm")

    budget_headers = ["Elemento de Red GPON / Segmento", "Parámetro Técnico / Longitud", "Atenuación Unitaria", "Atenuación Total Acumulada", "Potencia Resultante Estimada"]
    col_xs = [80, 700, 1250, 1750, 2200]

    draw.rectangle([(80, 995), (W - 80, 1030)], fill=C_WHITE, outline=C_BLACK, width=1)
    for i, h in enumerate(budget_headers):
        draw.text((col_xs[i], 1012), h, font=FONT_BODY_BOLD, fill=C_BLACK, anchor="lm")

    budget_rows = [
        ("Potencia de Transmisión Puerto OLT (SFP Clase C+)", "Longitud de onda Downstream: 1490 nm", "+3.0 dBm a +7.0 dBm", "0.00 dB", "+5.00 dBm (Valor Nominal)"),
        ("Cable Troncal Feeder Monomodo ITU-T G.652.D", "Distancia: 4.50 km", "0.22 dB/km (@1490nm)", "0.99 dB", "+4.01 dBm"),
        ("Splitter Óptico Primario Balanceado 1:4 (Nivel 1)", "División simétrica 25% por puerto", "7.20 dB (Pérdida Inserción)", "7.20 dB", "-3.19 dBm"),
        ("Cable Ramal Secundario Monomodo ITU-T G.652.D", "Distancia: 1.80 km", "0.22 dB/km (@1490nm)", "0.40 dB", "-3.59 dBm"),
        ("Splitter Óptico Secundario Balanceado 1:16 (NAP)", "Caja Terminal en poste (16 puertos)", "13.80 dB (Pérdida Inserción)", "13.80 dB", "-17.39 dBm"),
        ("Empalmes por Fusión de Fibra Óptica (FOSC)", "6 fusiones de arco eléctrico", "0.05 dB / empalme", "0.30 dB", "-17.69 dBm"),
        ("Conectores Ópticos Mecánicos SC-APC (ODF, NAP, ONT)", "4 pares acoplados SC-APC", "0.30 dB / par conector", "1.20 dB", "-18.89 dBm"),
        ("Cable Drop Acometida Domiciliaria G.657.A2", "Distancia máxima: 120 metros", "0.25 dB/km", "0.03 dB", "-18.92 dBm"),
        ("Margen de Seguridad por Envejecimiento / Reparación", "Reserva técnica para futuros reempalmes", "2.00 dB de holgura", "2.00 dB", "-20.92 dBm"),
        ("POTENCIA FINAL ESTIMADA EN RECEPTOR ONT (Rx)", "Rango Operativo Válido: -8.0 dBm a -28.0 dBm", "Margen Disponible: +7.08 dB", "Atenuación Total: 25.92 dB", "ESTADO: ÓPTIMO CONFORME (-20.92 dBm)")
    ]

    by = 1045
    for row in budget_rows:
        draw.line([(80, by - 5), (W - 80, by - 5)], fill=C_GRAY_MID, width=1)
        for i, val in enumerate(row):
            font = FONT_BODY_BOLD if i == 0 or "POTENCIA FINAL" in row[0] else FONT_BODY
            draw.text((col_xs[i], by + 8), val, font=font, fill=C_BLACK, anchor="lm")
        by += 44

    out_path = 'scratch/diag_topologia_gpon.png'
    img.save(out_path, quality=95)
    print(f"SUCCESS: Generated {out_path}")

# =========================================================================
# MAIN EXECUTION
# =========================================================================
if __name__ == '__main__':
    generate_diagram_1()
    generate_diagram_2()
    generate_diagram_3()
    generate_diagram_4()
    generate_diagram_5()
    generate_diagram_6()
    generate_diagram_7()
