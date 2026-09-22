import os
import math
from PIL import Image, ImageDraw, ImageFont

def create_project_flowchart():
def create_project_flowchart_bw():
    W, H = 2600, 3600
    img = Image.new('RGB', (W, H), (255, 255, 255))
    draw = ImageDraw.Draw(img)

    # Outer border
    draw.rectangle([(20, 20), (W - 20, H - 20)], outline=(33, 150, 243), width=8)
    # Outer border in solid black
    draw.rectangle([(20, 20), (W - 20, H - 20)], outline=(0, 0, 0), width=6)

    # Fonts
    font_title = ImageFont.truetype("C:/Windows/Fonts/arialbd.ttf", 46)
    font_sub = ImageFont.truetype("C:/Windows/Fonts/arial.ttf", 26)
    font_node_title = ImageFont.truetype("C:/Windows/Fonts/arialbd.ttf", 24)
    font_node_text = ImageFont.truetype("C:/Windows/Fonts/arial.ttf", 20)
    font_arrow = ImageFont.truetype("C:/Windows/Fonts/arialbd.ttf", 22)
    font_badge = ImageFont.truetype("C:/Windows/Fonts/arialbd.ttf", 20)

    # Header
    draw.text((W // 2, 75), "DIAGRAMA DE FLUJO GENERAL DE OPERACIÓN DEL SISTEMA", font=font_title, fill=(20, 20, 20), anchor="mm")
    draw.text((W // 2, 125), "Plataforma de Inventario, Concurrencia ACID y Mapeo Lógico GPON / FTTx | Proceso Operativo Integral", font=font_sub, fill=(100, 100, 100), anchor="mm")
    # Header in solid black
    draw.text((W // 2, 75), "DIAGRAMA DE FLUJO GENERAL DE OPERACIÓN DEL SISTEMA", font=font_title, fill=(0, 0, 0), anchor="mm")
    draw.text((W // 2, 125), "Plataforma de Inventario, Concurrencia ACID y Mapeo Lógico GPON / FTTx | Proceso Operativo Integral", font=font_sub, fill=(0, 0, 0), anchor="mm")

    # Colors
    C_START = (46, 125, 50)         # Dark Green
    C_START_FILL = (232, 245, 233)   # Pale Green
    C_START_BORDER = (46, 125, 50)
    # Black and White Colors
    C_FILL = (255, 255, 255)       # Pure White for all shapes
    C_BORDER = (0, 0, 0)           # Solid Black
    C_TEXT = (0, 0, 0)             # Solid Black
    C_LINE = (0, 0, 0)             # Solid Black

    C_PROC_FILL = (227, 242, 253)    # Pale Blue
    C_PROC_BORDER = (25, 118, 210)   # Blue
    C_PROC_TEXT = (13, 71, 161)

    C_DEC_FILL = (255, 248, 225)     # Pale Amber
    C_DEC_BORDER = (255, 143, 0)     # Amber
    C_DEC_TEXT = (191, 54, 12)

    C_IO_FILL = (243, 229, 245)      # Pale Purple
    C_IO_BORDER = (123, 31, 162)     # Purple
    C_IO_TEXT = (74, 20, 140)

    C_ERR_FILL = (255, 235, 238)     # Pale Red
    C_ERR_BORDER = (211, 47, 47)     # Red
    C_ERR_TEXT = (183, 28, 28)

    C_LINE = (50, 50, 50)
    C_YES = (46, 125, 50)
    C_NO = (198, 40, 40)

    # Draw arrow helper
    def draw_arrow(p1, p2, color=C_LINE, width=3, label=None, label_side="right", label_color=None):
    def draw_arrow(p1, p2, color=C_LINE, width=3, label=None, label_side="right"):
        draw.line([p1, p2], fill=color, width=width)
        # Arrowhead at p2
        dx = p2[0] - p1[0]
        dy = p2[1] - p1[1]
        import math
        angle = math.atan2(dy, dx)
        arrow_len = 16
        arrow_angle = math.pi / 6
        x3 = p2[0] - arrow_len * math.cos(angle - arrow_angle)
        y3 = p2[1] - arrow_len * math.sin(angle - arrow_angle)
        x4 = p2[0] - arrow_len * math.cos(angle + arrow_angle)
        y4 = p2[1] - arrow_len * math.sin(angle + arrow_angle)
        draw.polygon([p2, (x3, y3), (x4, y4)], fill=color)

        if label:
            lc = label_color if label_color else color
            mx = (p1[0] + p2[0]) / 2
            my = (p1[1] + p2[1]) / 2
            if label_side == "right":
                draw.text((mx + 18, my), label, font=font_arrow, fill=lc, anchor="lm")
                draw.text((mx + 18, my), label, font=font_arrow, fill=(0, 0, 0), anchor="lm")
            elif label_side == "left":
                draw.text((mx - 18, my), label, font=font_arrow, fill=lc, anchor="rm")
                draw.text((mx - 18, my), label, font=font_arrow, fill=(0, 0, 0), anchor="rm")
            elif label_side == "top":
                draw.text((mx, my - 16), label, font=font_arrow, fill=lc, anchor="mb")
                draw.text((mx, my - 16), label, font=font_arrow, fill=(0, 0, 0), anchor="mb")
            elif label_side == "bottom":
                draw.text((mx, my + 16), label, font=font_arrow, fill=lc, anchor="mt")
                draw.text((mx, my + 16), label, font=font_arrow, fill=(0, 0, 0), anchor="mt")

    # Draw nodes
    def draw_start_end(text, cx, cy, w=320, h=65, is_end=False):
    # Draw nodes in B&W
    def draw_start_end(text, cx, cy, w=320, h=65):
        x0, y0 = cx - w // 2, cy - h // 2
        x1, y1 = cx + w // 2, cy + h // 2
        r = h // 2
        col_border = (198, 40, 40) if is_end else C_START_BORDER
        col_fill = (255, 235, 238) if is_end else C_START_FILL
        col_text = (198, 40, 40) if is_end else C_START
        # Rounded rectangle
        draw.rounded_rectangle([(x0, y0), (x1, y1)], radius=r, fill=col_fill, outline=col_border, width=4)
        draw.text((cx, cy), text, font=font_node_title, fill=col_text, anchor="mm")
        draw.rounded_rectangle([(x0, y0), (x1, y1)], radius=r, fill=C_FILL, outline=C_BORDER, width=3)
        draw.text((cx, cy), text, font=font_node_title, fill=C_TEXT, anchor="mm")
        return {"cx": cx, "cy": cy, "x0": x0, "y0": y0, "x1": x1, "y1": y1, "w": w, "h": h}

    def draw_process(title, lines, cx, cy, w=600, h=95, fill_c=C_PROC_FILL, border_c=C_PROC_BORDER, text_c=C_PROC_TEXT):
    def draw_process(title, lines, cx, cy, w=600, h=95):
        x0, y0 = cx - w // 2, cy - h // 2
        x1, y1 = cx + w // 2, cy + h // 2
        draw.rectangle([(x0, y0), (x1, y1)], fill=fill_c, outline=border_c, width=3)
        draw.text((cx, y0 + 22), title, font=font_node_title, fill=text_c, anchor="mm")
        draw.rectangle([(x0, y0), (x1, y1)], fill=C_FILL, outline=C_BORDER, width=2)
        draw.text((cx, y0 + 22), title, font=font_node_title, fill=C_TEXT, anchor="mm")
        y_off = y0 + 50
        for ln in lines:
            draw.text((cx, y_off), ln, font=font_node_text, fill=(40, 40, 40), anchor="mm")
            draw.text((cx, y_off), ln, font=font_node_text, fill=C_TEXT, anchor="mm")
            y_off += 22
        return {"cx": cx, "cy": cy, "x0": x0, "y0": y0, "x1": x1, "y1": y1, "w": w, "h": h}

    def draw_decision(title, line2, cx, cy, rw=260, rh=70):
        pts = [(cx, cy - rh), (cx + rw, cy), (cx, cy + rh), (cx - rw, cy)]
        draw.polygon(pts, fill=C_DEC_FILL, outline=C_DEC_BORDER)
        draw.line(pts + [pts[0]], fill=C_DEC_BORDER, width=4)
        draw.text((cx, cy - 14), title, font=font_node_title, fill=C_DEC_TEXT, anchor="mm")
        draw.polygon(pts, fill=C_FILL, outline=C_BORDER)
        draw.line(pts + [pts[0]], fill=C_BORDER, width=3)
        draw.text((cx, cy - 14), title, font=font_node_title, fill=C_TEXT, anchor="mm")
        if line2:
            draw.text((cx, cy + 14), line2, font=font_node_text, fill=(70, 70, 70), anchor="mm")
            draw.text((cx, cy + 14), line2, font=font_node_text, fill=C_TEXT, anchor="mm")
        return {"cx": cx, "cy": cy, "rw": rw, "rh": rh, "x0": cx - rw, "y0": cy - rh, "x1": cx + rw, "y1": cy + rh}

    def draw_io(title, lines, cx, cy, w=540, h=85):
        x0, y0 = cx - w // 2, cy - h // 2
        x1, y1 = cx + w // 2, cy + h // 2
        offset = 30
        pts = [(x0 + offset, y0), (x1, y0), (x1 - offset, y1), (x0, y1)]
        draw.polygon(pts, fill=C_IO_FILL, outline=C_IO_BORDER)
        draw.line(pts + [pts[0]], fill=C_IO_BORDER, width=3)
        draw.text((cx, y0 + 22), title, font=font_node_title, fill=C_IO_TEXT, anchor="mm")
        draw.polygon(pts, fill=C_FILL, outline=C_BORDER)
        draw.line(pts + [pts[0]], fill=C_BORDER, width=2)
        draw.text((cx, y0 + 22), title, font=font_node_title, fill=C_TEXT, anchor="mm")
        y_off = y0 + 50
        for ln in lines:
            draw.text((cx, y_off), ln, font=font_node_text, fill=(50, 50, 50), anchor="mm")
            draw.text((cx, y_off), ln, font=font_node_text, fill=C_TEXT, anchor="mm")
            y_off += 22
        return {"cx": cx, "cy": cy, "x0": x0, "y0": y0, "x1": x1, "y1": y1, "w": w, "h": h}

    # -------------------------------------------------------------
    # FLOW NODES (Vertical Central Spine at x = 1100)
    # FLOW NODES (Central Spine at CX = 1100)
    # -------------------------------------------------------------
    CX = 1100

    # 1. Start
    N_START = draw_start_end("INICIO DEL SISTEMA", CX, 210, w=380, h=65)

    # 2. IO: Login
    N_LOGIN_IO = draw_io("Acceso a la Plataforma Web PWA", ["Ingreso de credenciales de usuario y clave criptográfica"], CX, 330, w=640, h=85)
    draw_arrow((CX, N_START["y1"]), (CX, N_LOGIN_IO["y0"]))

    # 3. Decision: Credentials valid?
    N_AUTH_DEC = draw_decision("¿Credenciales Válidas?", "Verificación hash bcrypt y JWT", CX, 485, rw=270, rh=65)
    draw_arrow((CX, N_LOGIN_IO["y1"]), (CX, N_AUTH_DEC["y0"]))

    # Auth Error (to the left)
    N_AUTH_ERR = draw_process("Error de Autenticación (401)", ["Credenciales inválidas o cuenta inactiva", "Mostrar alerta y solicitar reintento"], CX - 650, 485, w=440, h=85, fill_c=C_ERR_FILL, border_c=C_ERR_BORDER, text_c=C_ERR_TEXT)
    draw_arrow((N_AUTH_DEC["x0"], 485), (N_AUTH_ERR["x1"], 485), color=C_NO, label="NO", label_side="top", label_color=C_NO)
    # Arrow looping back to Login IO
    draw.line([(N_AUTH_ERR["cx"], N_AUTH_ERR["y0"]), (N_AUTH_ERR["cx"], 330), (N_LOGIN_IO["x0"], 330)], fill=C_NO, width=3)
    draw_arrow((N_LOGIN_IO["x0"] - 20, 330), (N_LOGIN_IO["x0"], 330), color=C_NO)
    N_AUTH_ERR = draw_process("Error de Autenticación (401)", ["Credenciales inválidas o cuenta inactiva", "Mostrar alerta y solicitar reintento"], CX - 650, 485, w=440, h=85)
    draw_arrow((N_AUTH_DEC["x0"], 485), (N_AUTH_ERR["x1"], 485), color=C_LINE, label="NO", label_side="top")
    draw.line([(N_AUTH_ERR["cx"], N_AUTH_ERR["y0"]), (N_AUTH_ERR["cx"], 330), (N_LOGIN_IO["x0"], 330)], fill=C_LINE, width=3)
    draw_arrow((N_LOGIN_IO["x0"] - 20, 330), (N_LOGIN_IO["x0"], 330), color=C_LINE)

    # 4. Auth OK -> Load Profile and Check Connectivity
    N_JWT_OK = draw_process("Emisión de Token JWT y RBAC", ["Firma digital con vigencia de 24 horas", "Almacenamiento de token y carga de rol asignado"], CX, 645, w=640, h=85)
    draw_arrow((CX, N_AUTH_DEC["y1"]), (CX, N_JWT_OK["y0"]), color=C_YES, label="SÍ", label_side="right", label_color=C_YES)
    draw_arrow((CX, N_AUTH_DEC["y1"]), (CX, N_JWT_OK["y0"]), color=C_LINE, label="SÍ", label_side="right")

    # 5. Decision: Connectivity status
    N_NET_DEC = draw_decision("¿Conexión a Red / Internet?", "Detección con Network Listener (navigator.onLine)", CX, 805, rw=320, rh=65)
    draw_arrow((CX, N_JWT_OK["y1"]), (CX, N_NET_DEC["y0"]))

    # Offline Branch (to the right)
    N_OFFLINE = draw_process("Modo Fuera de Línea (Offline-First)", ["Cargar datos locales cacheados desde Dexie.js", "Habilitar visor y encolar mutaciones pendientes"], CX + 720, 805, w=540, h=95)
    draw_arrow((N_NET_DEC["x1"], 805), (N_OFFLINE["x0"], 805), color=C_LINE, label="NO (Sin señal)", label_side="top")

    # 6. Online: Sync pending mutations
    N_SYNC = draw_process("Sincronización en Ráfaga", ["Descargar colas diferidas hacia PostgreSQL", "Actualizar caché local en IndexedDB con datos vigentes"], CX, 975, w=640, h=85)
    draw_arrow((CX, N_NET_DEC["y1"]), (CX, N_SYNC["y0"]), color=C_YES, label="SÍ (Online)", label_side="right", label_color=C_YES)
    draw_arrow((CX, N_NET_DEC["y1"]), (CX, N_SYNC["y0"]), color=C_LINE, label="SÍ (Online)", label_side="right")

    # Reconnect Offline branch to map
    draw.line([(N_OFFLINE["cx"], N_OFFLINE["y1"]), (N_OFFLINE["cx"], 1110), (CX + 340, 1110)], fill=C_LINE, width=3)

    # 7. Render GIS Map
    N_MAP = draw_process("Renderizado de Infraestructura Geoespacial (Leaflet)", [
        "1. Posicionamiento del ODF Central en Calle Hidalgo #10",
        "2. Trazado de polilíneas de fibra óptica troncal y ramales",
        "3. Semáforo de Cajas NAP: Verde (<80%), Amarillo (80-99%), Rojo (100%)"
        "3. Semáforo de Cajas NAP: Ocupación (<80%), Preventivo (80-99%), Saturado (100%)"
    ], CX, 1140, w=700, h=115)
    draw_arrow((CX, N_SYNC["y1"]), (CX, N_MAP["y0"]))
    draw_arrow((CX + 340, 1110), (N_MAP["x1"], 1110))

    # 8. User action: Select NAP
    N_NAP_SEL = draw_io("Selección de Caja NAP en Campo", ["El técnico presiona un marcador NAP en el visor cartográfico"], CX, 1315, w=660, h=85)
    draw_arrow((CX, N_MAP["y1"]), (CX, N_NAP_SEL["y0"]))

    # 9. Open Modal & Port Matrix
    N_MODAL = draw_process("Despliegue de Matriz Física de 16 Puertos (NapPortMatrix)", [
        "Presentación de la grilla de chasis SC-APC con estado cromático:",
        "Azul (Libre) | Verde (Ocupado) | Rojo (Dañado) | Amarillo (Reservado)"
        "Presentación de la grilla de chasis SC-APC con indicación de estado:",
        "Estado Libre | Estado Ocupado | Estado Dañado | Estado Reservado"
    ], CX, 1465, w=680, h=95)
    draw_arrow((CX, N_NAP_SEL["y1"]), (CX, N_MODAL["y0"]))

    # 10. Multi-path Decision: Select Action
    N_ACT_DEC = draw_decision("¿Tipo de Operación a Ejecutar?", "Acción operativa solicitada por el usuario", CX, 1640, rw=320, rh=70)
    draw_arrow((CX, N_MODAL["y1"]), (CX, N_ACT_DEC["y0"]))

    # -------------------------------------------------------------
    # 4 BRANCHES FOR ACTIONS
    # Branch 1 (Far Left): Consultation / Audit
    # Branch 2 (Center): New Client Assignment (ACID Lock) -> Core!
    # Branch 3 (Right Mid): Port Maintenance / Status Change
    # Branch 4 (Far Right): Mileage Log
    # -------------------------------------------------------------

    # Branch 1: Consult
    N_B1 = draw_process("Consulta de Abonado y Puerto", [
        "Lectura de potencia óptica dBm",
        "Inspección de MAC ONT asignada"
    ], CX - 650, 1810, w=400, h=85)
    draw.line([(N_ACT_DEC["x0"], 1640), (CX - 650, 1640), (CX - 650, N_B1["y0"])], fill=C_LINE, width=3)
    draw_arrow((CX - 650, N_B1["y0"] - 20), (CX - 650, N_B1["y0"]), label="Consulta", label_side="left")

    # Branch 3: Status Change (Admin/Soporte)
    N_B3 = draw_process("Mantenimiento de Puerto", [
        "Validación de rol Admin/Soporte",
        "Marcar como Dañado / Reservado"
    ], CX + 500, 1810, w=400, h=85)
    draw.line([(CX + 230, 1640), (CX + 500, 1640), (CX + 500, N_B3["y0"])], fill=C_LINE, width=3)
    draw_arrow((CX + 500, N_B3["y0"] - 20), (CX + 500, N_B3["y0"]), label="Mantenimiento", label_side="right")

    # Branch 4: Mileage Log
    N_B4 = draw_process("Bitácora de Kilometraje", [
        "Captura odómetro inicial/final",
        "Cálculo ruta GPS y consumo"
    ], CX + 950, 1810, w=380, h=85)
    draw.line([(CX + 230, 1640), (CX + 950, 1640), (CX + 950, N_B4["y0"])], fill=C_LINE, width=3)
    draw_arrow((CX + 950, N_B4["y0"] - 20), (CX + 950, N_B4["y0"]), label="Odometría", label_side="right")

    # Branch 2 (CENTER): Asignación de Cliente con ACID
    N_B2_IO = draw_io("Captura de Datos del Cliente", ["Número de contrato, nombre, dirección, marca ONT y MAC"], CX, 1810, w=540, h=85)
    draw_arrow((CX, N_ACT_DEC["y1"]), (CX, N_B2_IO["y0"]), label="Nueva Instalación", label_side="right")

    # Zod Validation
    N_ZOD = draw_process("Validación Declarativa con Zod", [
        "Comprobación de tipos, formato MAC y obligatoriedad de campos"
    ], CX, 1950, w=600, h=75)
    draw_arrow((CX, N_B2_IO["y1"]), (CX, N_ZOD["y0"]))

    # ACID Transaction Start & Pessimistic Lock
    N_ACID_LOCK = draw_process("Inicio de Transacción ACID y Bloqueo Pesimista", [
        "1. sequelize.transaction() -> Inicio de transacción atómica",
        "2. SELECT * FROM NapPorts WHERE id = :id FOR UPDATE (Bloqueo de fila)",
        "Garantiza exclusión mutua frente a concurrencia simultánea en campo"
    ], CX, 2110, w=740, h=115)
    draw_arrow((CX, N_ZOD["y1"]), (CX, N_ACID_LOCK["y0"]))

    # Concurrency Decision: Port Still Available?
    N_LOCK_DEC = draw_decision("¿Puerto Sigue Libre?", "Evaluación de estado bajo bloqueo exclusivo", CX, 2290, rw=280, rh=65)
    draw_arrow((CX, N_ACID_LOCK["y1"]), (CX, N_LOCK_DEC["y0"]))

    # Conflict / Rollback (to the left)
    N_ROLLBACK = draw_process("Conflicto de Concurrencia (HTTP 409)", [
        "El puerto fue asignado milisegundos antes por otro técnico",
        "Ejecutar ROLLBACK de transacción y alertar en pantalla"
    ], CX - 650, 2290, w=520, h=95, fill_c=C_ERR_FILL, border_c=C_ERR_BORDER, text_c=C_ERR_TEXT)
    draw_arrow((N_LOCK_DEC["x0"], 2290), (N_ROLLBACK["x1"], 2290), color=C_NO, label="NO (Conflicto)", label_side="top", label_color=C_NO)
    ], CX - 650, 2290, w=520, h=95)
    draw_arrow((N_LOCK_DEC["x0"], 2290), (N_ROLLBACK["x1"], 2290), color=C_LINE, label="NO (Conflicto)", label_side="top")

    # Commit / Success
    N_COMMIT = draw_process("Persistencia Atómica y COMMIT", [
        "1. UPDATE NapPorts SET estado = 'Ocupado'",
        "2. INSERT INTO Clients con MAC, ONT y datos del abonado",
        "3. COMMIT definitivo de la transacción en PostgreSQL"
    ], CX, 2465, w=680, h=105)
    draw_arrow((CX, N_LOCK_DEC["y1"]), (CX, N_COMMIT["y0"]), color=C_YES, label="SÍ (Disponible)", label_side="right", label_color=C_YES)
    draw_arrow((CX, N_LOCK_DEC["y1"]), (CX, N_COMMIT["y0"]), color=C_LINE, label="SÍ (Disponible)", label_side="right")

    # Merge branches
    MERGE_Y = 2620
    draw.line([(N_B1["cx"], N_B1["y1"]), (N_B1["cx"], MERGE_Y), (CX, MERGE_Y)], fill=C_LINE, width=3)
    draw.line([(N_ROLLBACK["cx"], N_ROLLBACK["y1"]), (N_ROLLBACK["cx"], MERGE_Y)], fill=C_LINE, width=3)
    draw.line([(N_COMMIT["cx"], N_COMMIT["y1"]), (CX, MERGE_Y)], fill=C_LINE, width=3)
    draw.line([(N_B3["cx"], N_B3["y1"]), (N_B3["cx"], MERGE_Y), (CX, MERGE_Y)], fill=C_LINE, width=3)
    draw.line([(N_B4["cx"], N_B4["y1"]), (N_B4["cx"], MERGE_Y), (CX, MERGE_Y)], fill=C_LINE, width=3)

    # Decision: Generate PDF Report?
    N_PDF_DEC = draw_decision("¿Generar Reporte de Saturación / Dictamen?", "Auditoría formal de planta externa", CX, 2760, rw=320, rh=65)
    draw_arrow((CX, MERGE_Y), (CX, N_PDF_DEC["y0"]))

    # PDF Generation Process (to the right)
    N_PDF_PROC = draw_process("Streaming de Reporte PDF (PDFKit)", [
        "Consulta de métricas globales y generación de buffer binario",
        "Descarga inmediata de reporte formal firmado con timestamp"
    ], CX + 650, 2760, w=540, h=95)
    draw_arrow((N_PDF_DEC["x1"], 2760), (N_PDF_PROC["x0"], 2760), color=C_YES, label="SÍ", label_side="top", label_color=C_YES)
    draw_arrow((N_PDF_DEC["x1"], 2760), (N_PDF_PROC["x0"], 2760), color=C_LINE, label="SÍ", label_side="top")

    # Reconnect PDF to spine
    draw.line([(N_PDF_PROC["cx"], N_PDF_PROC["y1"]), (N_PDF_PROC["cx"], 2920), (CX, 2920)], fill=C_LINE, width=3)

    # React State Refresh
    N_REACT = draw_process("Actualización Reactiva de la Interfaz y Caché", [
        "Refresco automático de colores en marcadores de mapa y matriz",
        "Registro de evento en bitácora de auditoría y notificación al técnico"
    ], CX, 2980, w=700, h=95)
    draw_arrow((CX, N_PDF_DEC["y1"]), (CX, N_REACT["y0"]), color=C_NO, label="NO", label_side="right")
    draw_arrow((CX, N_PDF_DEC["y1"]), (CX, N_REACT["y0"]), color=C_LINE, label="NO", label_side="right")

    # Decision: Continue session?
    N_END_DEC = draw_decision("¿Continuar Operaciones en Campo?", "Selección de nueva actividad o cierre", CX, 3160, rw=280, rh=65)
    draw_arrow((CX, N_REACT["y1"]), (CX, N_END_DEC["y0"]))

    # Loop back to map
    draw.line([(N_END_DEC["x0"], 3160), (CX - 780, 3160), (CX - 780, 1140), (N_MAP["x0"], 1140)], fill=C_YES, width=3)
    draw_arrow((CX - 780, 1140), (N_MAP["x0"], 1140), label="SÍ (Nueva operación)", label_side="top", label_color=C_YES)
    draw.line([(N_END_DEC["x0"], 3160), (CX - 780, 3160), (CX - 780, 1140), (N_MAP["x0"], 1140)], fill=C_LINE, width=3)
    draw_arrow((CX - 780, 1140), (N_MAP["x0"], 1140), label="SÍ (Nueva operación)", label_side="top")

    # End
    N_END = draw_start_end("FIN DEL PROCESO OPERATIVO", CX, 3350, w=440, h=65, is_end=True)
    draw_arrow((CX, N_END_DEC["y1"]), (CX, N_END["y0"]), color=C_NO, label="NO (Cerrar sesión)", label_side="right", label_color=C_NO)
    N_END = draw_start_end("FIN DEL PROCESO OPERATIVO", CX, 3350, w=440, h=65)
    draw_arrow((CX, N_END_DEC["y1"]), (CX, N_END["y0"]), color=C_LINE, label="NO (Cerrar sesión)", label_side="right")

    # -------------------------------------------------------------
    # LEGEND BOX (Bottom Right)
    # LEGEND BOX (Black and White)
    # -------------------------------------------------------------
    lx, ly = 1600, 3240
    draw.rectangle([(lx, ly), (lx + 900, ly + 260)], fill=(250, 250, 250), outline=(180, 180, 180), width=2)
    draw.text((lx + 450, ly + 25), "SIMBOLOGÍA ESTÁNDAR DE DIAGRAMA DE FLUJO (ANSI/ISO)", font=font_node_title, fill=(50, 50, 50), anchor="mm")
    draw.rectangle([(lx, ly), (lx + 900, ly + 260)], fill=(255, 255, 255), outline=(0, 0, 0), width=2)
    draw.text((lx + 450, ly + 25), "SIMBOLOGÍA ESTÁNDAR DE DIAGRAMA DE FLUJO (ANSI/ISO)", font=font_node_title, fill=(0, 0, 0), anchor="mm")

    # Terminal
    draw.rounded_rectangle([(lx + 30, ly + 55), (lx + 130, ly + 90)], radius=17, fill=C_START_FILL, outline=C_START_BORDER, width=2)
    draw.text((lx + 150, ly + 72), "Terminal (Inicio / Fin de la operación)", font=font_node_text, fill=(40, 40, 40), anchor="lm")
    draw.rounded_rectangle([(lx + 30, ly + 55), (lx + 130, ly + 90)], radius=17, fill=C_FILL, outline=C_BORDER, width=2)
    draw.text((lx + 150, ly + 72), "Terminal (Inicio / Fin de la operación)", font=font_node_text, fill=(0, 0, 0), anchor="lm")

    # Process
    draw.rectangle([(lx + 30, ly + 105), (lx + 130, ly + 140)], fill=C_PROC_FILL, outline=C_PROC_BORDER, width=2)
    draw.text((lx + 150, ly + 122), "Proceso (Ejecución computacional, API, DB o UI)", font=font_node_text, fill=(40, 40, 40), anchor="lm")
    draw.rectangle([(lx + 30, ly + 105), (lx + 130, ly + 140)], fill=C_FILL, outline=C_BORDER, width=2)
    draw.text((lx + 150, ly + 122), "Proceso (Ejecución computacional, API, DB o UI)", font=font_node_text, fill=(0, 0, 0), anchor="lm")

    # Decision
    d_pts = [(lx + 80, ly + 155), (lx + 130, ly + 175), (lx + 80, ly + 195), (lx + 30, ly + 175)]
    draw.polygon(d_pts, fill=C_DEC_FILL, outline=C_DEC_BORDER)
    draw.line(d_pts + [d_pts[0]], fill=C_DEC_BORDER, width=2)
    draw.text((lx + 150, ly + 175), "Decisión (Bifurcación lógica condicional SÍ / NO)", font=font_node_text, fill=(40, 40, 40), anchor="lm")
    draw.polygon(d_pts, fill=C_FILL, outline=C_BORDER)
    draw.line(d_pts + [d_pts[0]], fill=C_BORDER, width=2)
    draw.text((lx + 150, ly + 175), "Decisión (Bifurcación lógica condicional SÍ / NO)", font=font_node_text, fill=(0, 0, 0), anchor="lm")

    # I/O
    io_pts = [(lx + 45, ly + 210), (lx + 130, ly + 210), (lx + 115, ly + 245), (lx + 30, ly + 245)]
    draw.polygon(io_pts, fill=C_IO_FILL, outline=C_IO_BORDER)
    draw.line(io_pts + [io_pts[0]], fill=C_IO_BORDER, width=2)
    draw.text((lx + 150, ly + 228), "Entrada / Salida (Captura en formulario o reporte)", font=font_node_text, fill=(40, 40, 40), anchor="lm")
    draw.polygon(io_pts, fill=C_FILL, outline=C_BORDER)
    draw.line(io_pts + [io_pts[0]], fill=C_BORDER, width=2)
    draw.text((lx + 150, ly + 228), "Entrada / Salida (Captura en formulario o reporte)", font=font_node_text, fill=(0, 0, 0), anchor="lm")

    out_path = "docs/diagrama_flujo_global_proyecto.png"
    img.save(out_path, quality=95)
    print(f"Global Project Flowchart created at: {out_path}")
    print(f"Black & White Global Project Flowchart created at: {out_path}")

if __name__ == "__main__":
    create_project_flowchart()

    create_project_flowchart_bw()
