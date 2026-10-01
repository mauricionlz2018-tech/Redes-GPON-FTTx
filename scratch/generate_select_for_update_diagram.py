import os
import math
from PIL import Image, ImageDraw, ImageFont

FONT_HDR = ImageFont.truetype("C:/Windows/Fonts/arialbd.ttf", 22)
FONT_TEXT = ImageFont.truetype("C:/Windows/Fonts/arial.ttf", 18)
FONT_TEXT_BD = ImageFont.truetype("C:/Windows/Fonts/arialbd.ttf", 18)
FONT_SUB = ImageFont.truetype("C:/Windows/Fonts/ariali.ttf", 16)
FONT_CODE = ImageFont.truetype("C:/Windows/Fonts/consola.ttf", 17)

C_WHITE = 255
C_BLACK = 0
C_SHADE = 245

def draw_arrow(draw, x0, y0, x1, y1, dashed=False, label=None, label_above=True, width=2):
    if dashed:
        dx = x1 - x0
        dy = y1 - y0
        dist = math.hypot(dx, dy)
        if dist > 0:
            ux = dx / dist
            uy = dy / dist
            curr = 0
            while curr < dist - 14:
                draw.line([(x0 + ux*curr, y0 + uy*curr), (x0 + ux*min(curr+8, dist-14), y0 + uy*min(curr+8, dist-14))], fill=C_BLACK, width=width)
                curr += 14
    else:
        draw.line([(x0, y0), (x1, y1)], fill=C_BLACK, width=width)
        
    dx = x1 - x0
    dy = y1 - y0
    dist = math.hypot(dx, dy)
    if dist > 0:
        angle = math.atan2(dy, dx)
        ah_len = 14
        ah_angle = math.pi / 6
        p1 = (x1 - ah_len * math.cos(angle - ah_angle), y1 - ah_len * math.sin(angle - ah_angle))
        p2 = (x1 - ah_len * math.cos(angle + ah_angle), y1 - ah_len * math.sin(angle + ah_angle))
        if dashed:
            draw.line([(p1[0], p1[1]), (x1, y1)], fill=C_BLACK, width=width)
            draw.line([(p2[0], p2[1]), (x1, y1)], fill=C_BLACK, width=width)
        else:
            draw.polygon([(x1, y1), p1, p2], fill=C_BLACK)
            
    if label:
        mx = (x0 + x1) / 2
        my = (y0 + y1) / 2 + (-14 if label_above else 14)
        draw.text((mx, my), label, font=FONT_TEXT, fill=C_BLACK, anchor="mm")

def gen_secuencia_select_for_update(out_path):
    W, H = 2600, 1600
    img = Image.new("L", (W, H), C_WHITE)
    draw = ImageDraw.Draw(img)
    
    # 4 Lifelines
    col_x = [340, 940, 1580, 2220]
    col_labels = [
        "TCNICO A (NOC / Admin)\n[Cliente HTTP / React]",
        "TCNICO B (Campo / Mvil)\n[Cliente PWA / React]",
        "API REST EXPRESS\n[Controlador portController.ts]",
        "BASE DE DATOS POSTGRESQL\n[Motor Transaccional ACID]"
    ]
    
    hdr_h = 75
    for i in range(4):
        cx = col_x[i]
        draw.rectangle([cx - 190, 60, cx + 190, 60 + hdr_h], outline=C_BLACK, width=2, fill=C_SHADE)
        draw.text((cx, 60 + hdr_h // 2), col_labels[i], font=FONT_HDR, fill=C_BLACK, anchor="mm", align="center")
        # Lifeline dashed
        curr_y = 60 + hdr_h
        while curr_y < H - 120:
            draw.line([(cx, curr_y), (cx, curr_y + 12)], fill=C_BLACK, width=2)
            curr_y += 20
            
    # Activation bars
    # Tx A in API & DB
    draw.rectangle([col_x[2] - 12, 220, col_x[2] + 12, 920], outline=C_BLACK, width=2, fill=C_WHITE)
    draw.rectangle([col_x[3] - 12, 290, col_x[3] + 12, 860], outline=C_BLACK, width=2, fill=C_WHITE)
    
    # Tx B in API & DB
    draw.rectangle([col_x[2] - 12, 420, col_x[2] + 12, 1380], outline=C_BLACK, width=2, fill=C_WHITE)
    # Blocked bar in DB
    draw.rectangle([col_x[3] - 12, 500, col_x[3] + 12, 860], outline=C_BLACK, width=2, fill=C_SHADE) # waiting
    draw.rectangle([col_x[3] - 12, 860, col_x[3] + 12, 1260], outline=C_BLACK, width=2, fill=C_WHITE) # active
    
    # Message 1: Tecnico A requests assignment
    draw_arrow(draw, col_x[0], 220, col_x[2] - 12, 220, label="1: HTTP POST /api/ports/3/assign (Cliente: Juan Prez, Domicilio: Calle 1)")
    
    # Message 2: API starts Tx 1
    draw_arrow(draw, col_x[2] + 12, 290, col_x[3] - 12, 290, label="2: BEGIN; SELECT * FROM \"NapPorts\" WHERE id = 3 FOR UPDATE;")
    
    # Shaded Lock note
    draw.rectangle([col_x[3] - 280, 330, col_x[3] + 280, 380], outline=C_BLACK, width=2, fill=C_SHADE)
    draw.text((col_x[3], 355), "POSTGRESQL ADQUIERE BLOQUEO PESIMISTA: ExclusiveLock (Fila id=3)", font=FONT_CODE, fill=C_BLACK, anchor="mm")
    
    # Message 3: DB returns row to API (Tx 1)
    draw_arrow(draw, col_x[3] - 12, 410, col_x[2] + 12, 410, dashed=True, label="3: Retorna fila bloqueada: { id: 3, status: 'Libre', client_id: null }")
    
    # Message 4: Tecnico B concurrently requests same port!
    draw_arrow(draw, col_x[1], 460, col_x[2] - 12, 460, label="4: HTTP POST /api/ports/3/assign (Cliente: Mara Lpez, Domicilio: Av. 2)")
    
    # Message 5: API starts Tx 2
    draw_arrow(draw, col_x[2] + 12, 530, col_x[3] - 12, 530, label="5: BEGIN; SELECT * FROM \"NapPorts\" WHERE id = 3 FOR UPDATE;")
    
    # Blocker box
    draw.rectangle([col_x[3] - 290, 580, col_x[3] + 290, 680], outline=C_BLACK, width=3, fill=C_SHADE)
    draw.text((col_x[3], 610), "POSTGRESQL DETIENE PETICIN 2 (WAITING FOR LOCK)", font=FONT_HDR, fill=C_BLACK, anchor="mm")
    draw.text((col_x[3], 645), "Transaccin 2 queda encolada en el Administrador de Bloqueos de PostgreSQL", font=FONT_TEXT, fill=C_BLACK, anchor="mm")
    
    # Message 6: Tx 1 performs update
    draw_arrow(draw, col_x[2] + 12, 730, col_x[3] - 12, 730, label="6: UPDATE \"NapPorts\" SET status = 'Ocupado', client_id = 101 WHERE id = 3;")
    
    # Message 7: Tx 1 commits
    draw_arrow(draw, col_x[2] + 12, 810, col_x[3] - 12, 810, label="7: COMMIT; (Transaccin 1 finalizada con xito)")
    
    # Lock release box
    draw.rectangle([col_x[3] - 280, 850, col_x[3] + 280, 890], outline=C_BLACK, width=2, fill=C_SHADE)
    draw.text((col_x[3], 870), "SE LIBERA EL CANDADO PESIMISTA SOBRE LA FILA id=3", font=FONT_CODE, fill=C_BLACK, anchor="mm")
    
    # Message 8: API responds 200 OK to Tecnico A
    draw_arrow(draw, col_x[2] - 12, 920, col_x[0], 920, dashed=True, label="8: HTTP 200 OK (Asignacin Confirmada: { status: 'Ocupado', port: 3 })")
    
    # Message 9: PostgreSQL unblocks Tx 2 and returns row!
    draw_arrow(draw, col_x[3] - 12, 980, col_x[2] + 12, 980, dashed=True, label="9: Se descongela Tx 2 y retorna fila: { id: 3, status: 'Ocupado', client_id: 101 }")
    
    # Verification box in API
    draw.rectangle([col_x[2] - 260, 1030, col_x[2] + 260, 1090], outline=C_BLACK, width=2, fill=C_SHADE)
    draw.text((col_x[2], 1050), "EVALUACIN DE INTEGRIDAD EN CONTROLADOR:", font=FONT_HDR, fill=C_BLACK, anchor="mm")
    draw.text((col_x[2], 1075), "if (port.status !== 'Libre') -> Se detecta colisin concurrente!", font=FONT_CODE, fill=C_BLACK, anchor="mm")
    
    # Message 10: API executes Rollback for Tx 2
    draw_arrow(draw, col_x[2] + 12, 1160, col_x[3] - 12, 1160, label="10: ROLLBACK; (Se revierte la transaccin 2 sin alterar ningn dato)")
    
    # Message 11: DB acknowledges Rollback
    draw_arrow(draw, col_x[3] - 12, 1230, col_x[2] + 12, 1230, dashed=True, label="11: Transaccin 2 abortada (Cero corrupcin de datos)")
    
    # Message 12: API returns 409 Conflict to Tecnico B
    draw_arrow(draw, col_x[2] - 12, 1340, col_x[1], 1340, dashed=True, label="12: HTTP 409 Conflict ('El puerto 3 fue asignado concurrentemente por otro tcnico')")
    
    # Legend at bottom
    draw.rectangle([col_x[0] - 190, H - 110, col_x[3] + 190, H - 30], outline=C_BLACK, width=2, fill=C_SHADE)
    draw.text((col_x[0] - 150, H - 70), "CONVENCIN DE FLUJO UML:", font=FONT_HDR, fill=C_BLACK, anchor="lm")
    draw_arrow(draw, col_x[0] + 160, H - 70, col_x[0] + 300, H - 70)
    draw.text((col_x[0] + 320, H - 70), "Llamada Sncrona (Request)", font=FONT_TEXT, fill=C_BLACK, anchor="lm")
    draw_arrow(draw, col_x[1] + 320, H - 70, col_x[1] + 460, H - 70, dashed=True)
    draw.text((col_x[1] + 480, H - 70), "Retorno / Respuesta Asncrona", font=FONT_TEXT, fill=C_BLACK, anchor="lm")
    draw.rectangle([col_x[2] + 420, H - 85, col_x[2] + 460, H - 55], outline=C_BLACK, width=2, fill=C_SHADE)
    draw.text((col_x[2] + 480, H - 70), "Espera por Bloqueo Pesimista (Lock Wait)", font=FONT_TEXT, fill=C_BLACK, anchor="lm")
    
    img.save(out_path, dpi=(300, 300))
    print(f"Generated: {out_path}")

if __name__ == "__main__":
    os.makedirs("scratch", exist_ok=True)
    gen_secuencia_select_for_update("scratch/diag_secuencia_select_for_update.png")

