import os
import math
from PIL import Image, ImageDraw, ImageFont

def create_flowchart_bw():
    W, H = 2600, 3200
    img = Image.new('L', (W, H), 255)
    draw = ImageDraw.Draw(img)

    # Outer border
    draw.rectangle([(20, 20), (W - 20, H - 20)], outline=0, width=4)

    # Fonts
    font_node_title = ImageFont.truetype("C:/Windows/Fonts/arialbd.ttf", 22)
    font_node_text = ImageFont.truetype("C:/Windows/Fonts/arial.ttf", 18)
    font_label = ImageFont.truetype("C:/Windows/Fonts/arialbd.ttf", 18)
    font_sub = ImageFont.truetype("C:/Windows/Fonts/ariali.ttf", 16)
    font_leg_title = ImageFont.truetype("C:/Windows/Fonts/arialbd.ttf", 22)
    font_leg_text = ImageFont.truetype("C:/Windows/Fonts/arial.ttf", 18)

    C_FILL = 255
    C_SHADE = 245
    C_BORDER = 0
    C_TEXT = 0

    def draw_terminator(text, cx, cy, rw=180, rh=40):
        draw.rounded_rectangle([(cx - rw, cy - rh), (cx + rw, cy + rh)], radius=rh, fill=C_SHADE, outline=C_BORDER, width=3)
        draw.text((cx, cy), text, font=font_node_title, fill=C_TEXT, anchor="mm")
        return {"cx": cx, "cy": cy, "rw": rw, "rh": rh, "y0": cy - rh, "y1": cy + rh}

    def draw_process(title, lines, cx, cy, w=600, h=95):
        x0, y0 = cx - w // 2, cy - h // 2
        x1, y1 = cx + w // 2, cy + h // 2
        draw.rectangle([(x0, y0), (x1, y1)], fill=C_FILL, outline=C_BORDER, width=2)
        draw.text((cx, y0 + 22), title, font=font_node_title, fill=C_TEXT, anchor="mm")
        for i, l in enumerate(lines):
            draw.text((cx, y0 + 50 + i * 22), l, font=font_node_text, fill=C_TEXT, anchor="mm")
        return {"cx": cx, "cy": cy, "w": w, "h": h, "x0": x0, "x1": x1, "y0": y0, "y1": y1}

    def draw_decision(title, line2, cx, cy, rw=260, rh=70):
        pts = [(cx, cy - rh), (cx + rw, cy), (cx, cy + rh), (cx - rw, cy)]
        draw.polygon(pts, fill=C_SHADE, outline=C_BORDER)
        draw.line(pts + [pts[0]], fill=C_BORDER, width=3)
        draw.text((cx, cy - 14), title, font=font_node_title, fill=C_TEXT, anchor="mm")
        draw.text((cx, cy + 14), line2, font=font_sub, fill=C_TEXT, anchor="mm")
        return {"cx": cx, "cy": cy, "rw": rw, "rh": rh, "x0": cx - rw, "x1": cx + rw, "y0": cy - rh, "y1": cy + rh}

    def draw_io(title, lines, cx, cy, w=540, h=85):
        sk = 30
        x0, y0 = cx - w // 2, cy - h // 2
        x1, y1 = cx + w // 2, cy + h // 2
        pts = [(x0 + sk, y0), (x1, y0), (x1 - sk, y1), (x0, y1)]
        draw.polygon(pts, fill=C_FILL, outline=C_BORDER)
        draw.line(pts + [pts[0]], fill=C_BORDER, width=2)
        draw.text((cx, y0 + 22), title, font=font_node_title, fill=C_TEXT, anchor="mm")
        for i, l in enumerate(lines):
            draw.text((cx, y0 + 50 + i * 22), l, font=font_node_text, fill=C_TEXT, anchor="mm")
        return {"cx": cx, "cy": cy, "w": w, "h": h, "x0": x0, "x1": x1, "y0": y0, "y1": y1}

    def draw_arrow(p1, p2, label=None, label_side="right"):
        draw.line([p1, p2], fill=C_BORDER, width=2)
        dx = p2[0] - p1[0]
        dy = p2[1] - p1[1]
        dist = math.hypot(dx, dy)
        if dist > 0:
            angle = math.atan2(dy, dx)
            ah_len = 14
            ah_angle = math.pi / 6
            a1 = (p2[0] - ah_len * math.cos(angle - ah_angle), p2[1] - ah_len * math.sin(angle - ah_angle))
            a2 = (p2[0] - ah_len * math.cos(angle + ah_angle), p2[1] - ah_len * math.sin(angle + ah_angle))
            draw.polygon([p2, a1, a2], fill=C_BORDER)
        if label:
            mx = (p1[0] + p2[0]) / 2
            my = (p1[1] + p2[1]) / 2
            off_x = 12 if label_side == "right" else (-12 if label_side == "left" else 0)
            off_y = -14 if label_side == "top" else (14 if label_side == "bottom" else 0)
            draw.text((mx + off_x, my + off_y), label, font=font_label, fill=C_TEXT, anchor="mm")

    CX = W // 2
    curr_y = 100

    # 1. INICIO
    N_START = draw_terminator("INICIO", CX, curr_y)
    curr_y += 120

    # 2. Acceso y Credenciales
    N_LOGIN = draw_io("Captura de Credenciales", ["Ingreso de usuario y contrasea en cliente Web / PWA"], CX, curr_y)
    draw_arrow((CX, N_START["y1"]), (CX, N_LOGIN["y0"]))
    curr_y += 130

    # 3. Autenticación Bcrypt + JWT
    N_AUTH = draw_process("Autenticacin y Verificacin Criptogrfica", [
        "1. Consulta hash en tabla Users con Sequelize",
        "2. bcrypt.compare() con costo de cmputo (10 salt rounds)"
    ], CX, curr_y, w=640, h=100)
    draw_arrow((CX, N_LOGIN["y1"]), (CX, N_AUTH["y0"]))
    curr_y += 140

    # 4. Decisión Auth
    N_AUTH_DEC = draw_decision(" Credenciales Vlidas?", "Comparacin exitosa del hash criptogrfico", CX, curr_y, rw=260, rh=65)
    draw_arrow((CX, N_AUTH["y1"]), (CX, N_AUTH_DEC["y0"]))

    # Error Auth (to the left)
    N_AUTH_ERR = draw_process("Denegacin de Acceso (HTTP 401)", [
        "Emitir alerta: 'Usuario o contrasea incorrectos'",
        "Retornar al formulario de inicio de sesin"
    ], CX - 650, curr_y, w=480, h=95)
    draw_arrow((N_AUTH_DEC["x0"], curr_y), (N_AUTH_ERR["x1"], curr_y), label="NO", label_side="top")
    draw.line([(N_AUTH_ERR["cx"], N_AUTH_ERR["y0"]), (N_AUTH_ERR["cx"], N_LOGIN["cy"]), (N_LOGIN["x0"], N_LOGIN["cy"])], fill=C_BORDER, width=2)

    curr_y += 140
    # 5. Emisión JWT y Carga Dashboard
    N_JWT = draw_process("Emisin de Token Bearer JWT y RBAC", [
        "1. Generar token firmado con secreto HMAC-SHA256",
        "2. Cargar perfil de rol: ADMIN_NOC, SOPORTE o TECNICO_CAMPO",
        "3. Precarga de mdulos y capas cartogrficas autorizadas"
    ], CX, curr_y, w=680, h=110)
    draw_arrow((CX, N_AUTH_DEC["y1"]), (CX, N_JWT["y0"]), label="S", label_side="right")
    curr_y += 150

    # 6. Render GIS
    N_GIS = draw_process("Inicializacin de Interfaz Cartogrfica GIS", [
        "1. Montar mapa reactivo Leaflet con OpenStreetMap (WGS-84)",
        "2. Consultar /api/nap-boxes y renderizar marcadores de cajas NAP",
        "3. Trazar polilneas vectoriales de cables troncales y ramales",
        "4. Aplicar semforo: Verde (<80%), Amarillo (80-99%), Rojo (100%)"
    ], CX, curr_y, w=720, h=125)
    draw_arrow((CX, N_JWT["y1"]), (CX, N_GIS["y0"]))
    curr_y += 165

    # 7. Selección de Caja
    N_SEL_NAP = draw_io("Interaccin Tcnica en Mapa GIS", [
        "Tcnico pulsa sobre un marcador de caja NAP en el visor cartogrfico"
    ], CX, curr_y, w=620, h=85)
    draw_arrow((CX, N_GIS["y1"]), (CX, N_SEL_NAP["y0"]))
    curr_y += 135

    # 8. Chasis de 16 puertos
    N_CHASSIS = draw_process("Apertura de Matriz Isomrfica de Chasis", [
        "1. Cargar chasis de 16 puertos pticos SC-APC (G.652.D)",
        "2. Identificar estados: Libre, En Proceso, Ocupado, Daado",
        "3. Desplegar telemetra: Atenuacin acumulada y porcentaje de saturacin"
    ], CX, curr_y, w=720, h=110)
    draw_arrow((CX, N_SEL_NAP["y1"]), (CX, N_CHASSIS["y0"]))
    curr_y += 150

    # 9. Asignación de cliente
    N_ASSIGN = draw_io("Solicitud de Asignacin de Puerto", [
        "Tcnico selecciona puerto Libre e ingresa: Contrato, Nombre, Direccin y ONT MAC"
    ], CX, curr_y, w=700, h=85)
    draw_arrow((CX, N_CHASSIS["y1"]), (CX, N_ASSIGN["y0"]))
    curr_y += 135

    # 10. Validación Zod
    N_ZOD = draw_process("Validacin de Esquema en API (Middleware Zod)", [
        "Validar formato regex de Direccin MAC, longitud de contrato y tipado"
    ], CX, curr_y, w=640, h=85)
    draw_arrow((CX, N_ASSIGN["y1"]), (CX, N_ZOD["y0"]))
    curr_y += 130

    # 11. Bloqueo Pesimista ACID
    N_ACID = draw_process("Transaccin Pesimista ACID (PostgreSQL)", [
        "1. sequelize.transaction() -> Inicio de transaccin atmica",
        "2. SELECT * FROM NapPorts WHERE id = :id FOR UPDATE (Bloqueo de fila)",
        "Garantiza exclusin mutua frente a concurrencia simultnea en campo"
    ], CX, curr_y, w=720, h=115)
    draw_arrow((CX, N_ZOD["y1"]), (CX, N_ACID["y0"]))
    curr_y += 155

    # 12. Decisión Disponibilidad
    N_DISP_DEC = draw_decision(" Puerto Sigue Libre?", "Evaluacin de estado bajo bloqueo exclusivo", CX, curr_y, rw=280, rh=65)
    draw_arrow((CX, N_ACID["y1"]), (CX, N_DISP_DEC["y0"]))

    # Conflict / Rollback (to the left)
    N_ROLLBACK = draw_process("Conflicto de Concurrencia (HTTP 409)", [
        "El puerto fue asignado concurrentemente por otro tcnico",
        "Ejecutar ROLLBACK de transaccin y alertar en pantalla"
    ], CX - 650, curr_y, w=520, h=95)
    draw_arrow((N_DISP_DEC["x0"], curr_y), (N_ROLLBACK["x1"], curr_y), label="NO (Conflicto)", label_side="top")

    curr_y += 150
    # 13. Commit
    N_COMMIT = draw_process("Persistencia Atmica y COMMIT", [
        "1. UPDATE NapPorts SET estado = 'Ocupado'",
        "2. INSERT INTO Clients con MAC, ONT y datos del abonado",
        "3. COMMIT definitivo de la transaccin en PostgreSQL"
    ], CX, curr_y, w=680, h=105)
    draw_arrow((CX, N_DISP_DEC["y1"]), (CX, N_COMMIT["y0"]), label="S (Disponible)", label_side="right")
    curr_y += 140

    # 14. Merge & Notificación
    N_NOTIF = draw_io("Notificacin y Actualizacin en Tiempo Real", [
        "Actualizar vista en React PWA, regenerar semforo NAP y emitir ticket"
    ], CX, curr_y, w=680, h=85)
    draw_arrow((CX, N_COMMIT["y1"]), (CX, N_NOTIF["y0"]))
    draw.line([(N_ROLLBACK["cx"], N_ROLLBACK["y1"]), (N_ROLLBACK["cx"], N_NOTIF["cy"]), (N_NOTIF["x0"], N_NOTIF["cy"])], fill=C_BORDER, width=2)
    curr_y += 135

    # 15. FIN
    N_END = draw_terminator("FIN", CX, curr_y)
    draw_arrow((CX, N_NOTIF["y1"]), (CX, N_END["y0"]))

    # Legend at bottom
    ly = curr_y + 100
    lx = CX - 480
    draw.rectangle([(lx, ly), (lx + 960, ly + 220)], fill=C_FILL, outline=C_BORDER, width=2)
    draw.text((CX, ly + 25), "SIMBOLOGA ESTNDAR DE DIAGRAMA DE FLUJO (ANSI/ISO)", font=font_leg_title, fill=C_TEXT, anchor="mm")
    
    # 1. Terminator
    draw.rounded_rectangle([(lx + 30, ly + 60), (lx + 130, ly + 95)], radius=15, fill=C_SHADE, outline=C_BORDER, width=2)
    draw.text((lx + 150, ly + 77), "Terminal (Inicio / Fin del proceso)", font=font_leg_text, fill=C_TEXT, anchor="lm")

    # 2. Process
    draw.rectangle([(lx + 520, ly + 60), (lx + 620, ly + 95)], fill=C_FILL, outline=C_BORDER, width=2)
    draw.text((lx + 640, ly + 77), "Proceso (Operacin de transformacin interna)", font=font_leg_text, fill=C_TEXT, anchor="lm")

    # 3. Decision
    d_pts = [(lx + 80, ly + 115), (lx + 130, ly + 135), (lx + 80, ly + 155), (lx + 30, ly + 135)]
    draw.polygon(d_pts, fill=C_SHADE, outline=C_BORDER)
    draw.line(d_pts + [d_pts[0]], fill=C_BORDER, width=2)
    draw.text((lx + 150, ly + 135), "Decisin (Bifurcacin condicional con rutas alternativas)", font=font_leg_text, fill=C_TEXT, anchor="lm")

    # 4. I/O
    io_pts = [(lx + 540, ly + 115), (lx + 620, ly + 115), (lx + 600, ly + 155), (lx + 520, ly + 155)]
    draw.polygon(io_pts, fill=C_FILL, outline=C_BORDER)
    draw.line(io_pts + [io_pts[0]], fill=C_BORDER, width=2)
    draw.text((lx + 640, ly + 135), "Entrada / Salida (Interaccin de usuario o perifrico)", font=font_leg_text, fill=C_TEXT, anchor="lm")

    # 5. Flow line
    draw.line([(lx + 30, ly + 185), (lx + 130, ly + 185)], fill=C_BORDER, width=2)
    draw.polygon([(lx + 130, ly + 185), (lx + 115, ly + 178), (lx + 115, ly + 192)], fill=C_BORDER)
    draw.text((lx + 150, ly + 185), "Lnea de Flujo (Direccin secuencial de control)", font=font_leg_text, fill=C_TEXT, anchor="lm")

    os.makedirs("docs", exist_ok=True)
    os.makedirs("scratch", exist_ok=True)
    img.save("docs/diagrama_flujo_global_proyecto.png", quality=95)
    img.save("scratch/diagrama_flujo_global_proyecto.png", quality=95)
    print("Flowchart (B&W, no title) saved successfully!")

if __name__ == "__main__":
    create_flowchart_bw()
