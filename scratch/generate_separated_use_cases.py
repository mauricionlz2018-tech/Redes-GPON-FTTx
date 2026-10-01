import os
from PIL import Image, ImageDraw, ImageFont

# Fonts
FONT_ACTOR = ImageFont.truetype("C:/Windows/Fonts/arialbd.ttf", 26)
FONT_UC = ImageFont.truetype("C:/Windows/Fonts/arialbd.ttf", 22)
FONT_UC_SUB = ImageFont.truetype("C:/Windows/Fonts/arial.ttf", 18)
FONT_REL = ImageFont.truetype("C:/Windows/Fonts/ariali.ttf", 18)
FONT_BOX_TAG = ImageFont.truetype("C:/Windows/Fonts/arialbd.ttf", 24)

C_WHITE = 255
C_BLACK = 0
C_SHADE = 245
C_GRAY_LINE = 160

def draw_actor(draw, cx, cy, name, role_desc=None):
    """Draws a standard UML stick figure centered horizontally at cx, head at cy."""
    r = 26
    # Head
    draw.ellipse([cx - r, cy, cx + r, cy + 2 * r], outline=C_BLACK, width=3, fill=C_WHITE)
    # Body
    neck_y = cy + 2 * r
    waist_y = neck_y + 55
    draw.line([(cx, neck_y), (cx, waist_y)], fill=C_BLACK, width=3)
    # Arms
    arms_y = neck_y + 20
    draw.line([(cx - 36, arms_y), (cx + 36, arms_y)], fill=C_BLACK, width=3)
    # Legs
    leg_len = 50
    draw.line([(cx, waist_y), (cx - 30, waist_y + leg_len)], fill=C_BLACK, width=3)
    draw.line([(cx, waist_y), (cx + 30, waist_y + leg_len)], fill=C_BLACK, width=3)
    # Label
    text_y = waist_y + leg_len + 12
    draw.text((cx, text_y), name, font=FONT_ACTOR, fill=C_BLACK, anchor="mt")
    if role_desc:
        draw.text((cx, text_y + 30), role_desc, font=FONT_REL, fill=C_BLACK, anchor="mt")

def draw_use_case(draw, cx, cy, rx, ry, title_lines, is_included=False):
    """Draws an ellipse for a UML use case."""
    fill_col = C_SHADE if is_included else C_WHITE
    draw.ellipse([cx - rx, cy - ry, cx + rx, cy + ry], outline=C_BLACK, width=3, fill=fill_col)
    
    total_h = len(title_lines) * 26
    start_y = cy - (total_h // 2) + 4
    for i, line in enumerate(title_lines):
        f = FONT_UC_SUB if is_included else FONT_UC
        draw.text((cx, start_y + i * 26), line, font=f, fill=C_BLACK, anchor="mm")

def draw_dashed_arrow(draw, x0, y0, x1, y1, label="<<include>>"):
    """Draws a dashed arrow from (x0, y0) to (x1, y1) with UML open arrowhead."""
    import math
    dx = x1 - x0
    dy = y1 - y0
    dist = math.hypot(dx, dy)
    if dist == 0:
        return
    ux = dx / dist
    uy = dy / dist
    
    # Draw dashed line
    dash_len = 10
    gap_len = 8
    curr = 0
    while curr < dist - 18:
        x_start = x0 + ux * curr
        y_start = y0 + uy * curr
        x_end = x0 + ux * min(curr + dash_len, dist - 18)
        y_end = y0 + uy * min(curr + dash_len, dist - 18)
        draw.line([(x_start, y_start), (x_end, y_end)], fill=C_BLACK, width=2)
        curr += dash_len + gap_len
        
    # Arrow head (open V)
    ah_len = 16
    ah_angle = math.pi / 6 # 30 deg
    angle = math.atan2(dy, dx)
    
    ax1 = x1 - ah_len * math.cos(angle - ah_angle)
    ay1 = y1 - ah_len * math.sin(angle - ah_angle)
    ax2 = x1 - ah_len * math.cos(angle + ah_angle)
    ay2 = y1 - ah_len * math.sin(angle + ah_angle)
    
    draw.line([(ax1, ay1), (x1, y1)], fill=C_BLACK, width=2)
    draw.line([(ax2, ay2), (x1, y1)], fill=C_BLACK, width=2)
    
    # Label
    mx = (x0 + x1) / 2
    my = (y0 + y1) / 2 - 14
    draw.text((mx, my), label, font=FONT_REL, fill=C_BLACK, anchor="mm")

def draw_solid_line(draw, x0, y0, x1, y1):
    draw.line([(x0, y0), (x1, y1)], fill=C_BLACK, width=2)

# ==============================================================================
# MODULO 1: Seguridad, Autenticación y RBAC
# ==============================================================================
def gen_cu_mod1(out_path):
    W, H = 2600, 1500
    img = Image.new("L", (W, H), C_WHITE)
    draw = ImageDraw.Draw(img)
    
    # System boundary (no top title banner!)
    bx0, by0, bx1, by1 = 520, 60, 2480, 1420
    draw.rectangle([bx0, by0, bx1, by1], outline=C_BLACK, width=3, fill=C_WHITE)
    # Boundary tab/tag
    draw.rectangle([bx0, by0, bx0 + 640, by0 + 45], outline=C_BLACK, width=3, fill=C_SHADE)
    draw.text((bx0 + 20, by0 + 22), "Frontera del Sistema: Mdulo 1 - Seguridad y RBAC", font=FONT_BOX_TAG, fill=C_BLACK, anchor="lm")
    
    # Actors on the left
    draw_actor(draw, 240, 180, "Administrador NOC", "(Privilegios Totales)")
    draw_actor(draw, 240, 640, "Soporte Tcnico", "(Gestin de Red)")
    draw_actor(draw, 240, 1100, "Tcnico de Campo", "(Perfil Mvil)")
    
    # Use cases column 1 (Core)
    uc1_c = (1080, 320)
    uc2_c = (1080, 740)
    uc3_c = (1080, 1160)
    
    draw_use_case(draw, uc1_c[0], uc1_c[1], 240, 65, ["CU-01: Iniciar Sesin", "y Autenticacin JWT"])
    draw_use_case(draw, uc2_c[0], uc2_c[1], 240, 65, ["CU-02: Conmutar Perfil", "de Evaluacin (Switcher)"])
    draw_use_case(draw, uc3_c[0], uc3_c[1], 240, 65, ["CU-03: Administrar", "Directorio de Usuarios"])
    
    # Included use cases column 2
    inc1_c = (1950, 200)
    inc2_c = (1950, 420)
    inc3_c = (1950, 1160)
    
    draw_use_case(draw, inc1_c[0], inc1_c[1], 260, 60, ["Verificar Hash Bcrypt", "(saltRounds = 10)"], is_included=True)
    draw_use_case(draw, inc2_c[0], inc2_c[1], 260, 60, ["Emitir Token Bearer JWT", "(Firma HMAC-SHA256)"], is_included=True)
    draw_use_case(draw, inc3_c[0], inc3_c[1], 260, 60, ["Validar Permisos RBAC", "(Middleware requireRoles)"], is_included=True)
    
    # Actor associations (solid lines)
    # Admin connects to CU-01, CU-02, CU-03
    draw_solid_line(draw, 340, 260, uc1_c[0] - 240, uc1_c[1])
    draw_solid_line(draw, 340, 280, uc2_c[0] - 240, uc2_c[1])
    draw_solid_line(draw, 340, 300, uc3_c[0] - 240, uc3_c[1])
    
    # Soporte connects to CU-01, CU-02
    draw_solid_line(draw, 340, 700, uc1_c[0] - 240, uc1_c[1] + 15)
    draw_solid_line(draw, 340, 720, uc2_c[0] - 240, uc2_c[1])
    
    # Tecnico connects to CU-01, CU-02
    draw_solid_line(draw, 340, 1140, uc1_c[0] - 240, uc1_c[1] + 30)
    draw_solid_line(draw, 340, 1160, uc2_c[0] - 240, uc2_c[1] + 15)
    
    # Include dependencies (dashed arrows)
    draw_dashed_arrow(draw, uc1_c[0] + 230, uc1_c[1] - 25, inc1_c[0] - 250, inc1_c[1] + 10)
    draw_dashed_arrow(draw, uc1_c[0] + 230, uc1_c[1] + 25, inc2_c[0] - 250, inc2_c[1] - 10)
    draw_dashed_arrow(draw, uc3_c[0] + 240, uc3_c[1], inc3_c[0] - 260, inc3_c[1])
    
    # Legend box at bottom
    draw.rectangle([bx0 + 40, by1 - 120, bx0 + 820, by1 - 30], outline=C_BLACK, width=2, fill=C_SHADE)
    draw.text((bx0 + 60, by1 - 100), "NOTACIN UML ESTNDAR:", font=FONT_ACTOR, fill=C_BLACK)
    draw.line([(bx0 + 60, by1 - 55), (bx0 + 160, by1 - 55)], fill=C_BLACK, width=2)
    draw.text((bx0 + 175, by1 - 65), "Asociacin de Actor", font=FONT_UC_SUB, fill=C_BLACK)
    draw_dashed_arrow(draw, bx0 + 440, by1 - 55, bx0 + 560, by1 - 55, label="<<include>>")
    draw.text((bx0 + 580, by1 - 65), "Inclusin Obligatoria", font=FONT_UC_SUB, fill=C_BLACK)
    
    img.save(out_path, dpi=(300, 300))
    print(f"Generated: {out_path}")

# ==============================================================================
# MODULO 2: Cartografía GIS, Trazado Troncal y Cajas NAP
# ==============================================================================
def gen_cu_mod2(out_path):
    W, H = 2600, 1500
    img = Image.new("L", (W, H), C_WHITE)
    draw = ImageDraw.Draw(img)
    
    bx0, by0, bx1, by1 = 520, 60, 2180, 1420
    draw.rectangle([bx0, by0, bx1, by1], outline=C_BLACK, width=3, fill=C_WHITE)
    draw.rectangle([bx0, by0, bx0 + 720, by0 + 45], outline=C_BLACK, width=3, fill=C_SHADE)
    draw.text((bx0 + 20, by0 + 22), "Frontera del Sistema: Mdulo 2 - Cartografa GIS y Cajas NAP", font=FONT_BOX_TAG, fill=C_BLACK, anchor="lm")
    
    # Actors on the left
    draw_actor(draw, 240, 220, "Administrador NOC", "(Acceso Completo)")
    draw_actor(draw, 240, 680, "Soporte Tcnico", "(Supervisin Red)")
    draw_actor(draw, 240, 1140, "Tcnico de Campo", "(Calibracin GPS)")
    
    # External Actor on the right
    draw_actor(draw, 2400, 680, "API Geoespacial", "(Leaflet / OSM / GPS)")
    
    # Primary Use Cases
    uc4_c = (1000, 300)
    uc5_c = (1000, 740)
    uc6_c = (1000, 1180)
    
    draw_use_case(draw, uc4_c[0], uc4_c[1], 240, 65, ["CU-04: Consultar Mapa GIS,", "Rutas y Semforo NAP"])
    draw_use_case(draw, uc5_c[0], uc5_c[1], 240, 65, ["CU-05: Calibrar Coordenadas", "GPS de NAP en Sitio"])
    draw_use_case(draw, uc6_c[0], uc6_c[1], 240, 65, ["CU-06: Registrar Nueva", "Caja NAP en Inventario"])
    
    # Included Use Cases
    inc1_c = (1680, 300)
    inc2_c = (1680, 740)
    inc3_c = (1680, 1180)
    
    draw_use_case(draw, inc1_c[0], inc1_c[1], 250, 60, ["Renderizar Capas Vectoriales", "(Polilneas y Mosaicos OSM)"], is_included=True)
    draw_use_case(draw, inc2_c[0], inc2_c[1], 250, 60, ["Fijar Posicin Geodsica", "Formato EPSG:4326 (WGS-84)"], is_included=True)
    draw_use_case(draw, inc3_c[0], inc3_c[1], 250, 60, ["Aprovisionar Automticamente", "Matriz de 16 Puertos SC-APC"], is_included=True)
    
    # Associations Actors -> Use Cases
    # Admin -> all
    draw_solid_line(draw, 340, 300, uc4_c[0] - 240, uc4_c[1])
    draw_solid_line(draw, 340, 320, uc5_c[0] - 240, uc5_c[1] - 15)
    draw_solid_line(draw, 340, 340, uc6_c[0] - 240, uc6_c[1] - 20)
    
    # Soporte -> all
    draw_solid_line(draw, 340, 740, uc4_c[0] - 240, uc4_c[1] + 15)
    draw_solid_line(draw, 340, 760, uc5_c[0] - 240, uc5_c[1])
    draw_solid_line(draw, 340, 780, uc6_c[0] - 240, uc6_c[1])
    
    # Tecnico -> CU-04, CU-05 (Not CU-06 create box)
    draw_solid_line(draw, 340, 1180, uc4_c[0] - 240, uc4_c[1] + 30)
    draw_solid_line(draw, 340, 1200, uc5_c[0] - 240, uc5_c[1] + 15)
    
    # Includes
    draw_dashed_arrow(draw, uc4_c[0] + 240, uc4_c[1], inc1_c[0] - 250, inc1_c[1])
    draw_dashed_arrow(draw, uc5_c[0] + 240, uc5_c[1], inc2_c[0] - 250, inc2_c[1])
    draw_dashed_arrow(draw, uc6_c[0] + 240, uc6_c[1], inc3_c[0] - 250, inc3_c[1])
    
    # External Actor associations
    draw_solid_line(draw, 2300, 720, inc1_c[0] + 250, inc1_c[1])
    draw_solid_line(draw, 2300, 750, inc2_c[0] + 250, inc2_c[1])
    
    img.save(out_path, dpi=(300, 300))
    print(f"Generated: {out_path}")

# ==============================================================================
# MODULO 3: Operación de Puertos Físicos, Concurrencia ACID y Padrón de Abonados
# ==============================================================================
def gen_cu_mod3(out_path):
    W, H = 2600, 1600
    img = Image.new("L", (W, H), C_WHITE)
    draw = ImageDraw.Draw(img)
    
    bx0, by0, bx1, by1 = 520, 60, 2480, 1520
    draw.rectangle([bx0, by0, bx1, by1], outline=C_BLACK, width=3, fill=C_WHITE)
    draw.rectangle([bx0, by0, bx0 + 780, by0 + 45], outline=C_BLACK, width=3, fill=C_SHADE)
    draw.text((bx0 + 20, by0 + 22), "Frontera del Sistema: Mdulo 3 - Puertos pticos, Concurrencia ACID y Abonados", font=FONT_BOX_TAG, fill=C_BLACK, anchor="lm")
    
    # Actors
    draw_actor(draw, 240, 260, "Administrador NOC", "(Control Total)")
    draw_actor(draw, 240, 780, "Soporte Tcnico", "(Gestin de Puertos)")
    draw_actor(draw, 240, 1280, "Tcnico de Campo", "(Altas en Campo)")
    
    # Primary Use Cases
    uc7_c = (980, 220)
    uc8_c = (980, 480)
    uc9_c = (980, 740)
    uc10_c = (980, 1000)
    uc11_c = (980, 1240)
    uc12_c = (980, 1420)
    
    draw_use_case(draw, uc7_c[0], uc7_c[1], 230, 52, ["CU-07: Visualizar Matriz", "Chasis 16 Puertos SC-APC"])
    draw_use_case(draw, uc8_c[0], uc8_c[1], 230, 52, ["CU-08: Asignar Abonado a", "Puerto Libre de Fibra"])
    draw_use_case(draw, uc9_c[0], uc9_c[1], 230, 52, ["CU-09: Liberar Puerto y", "Desvincular Abonado"])
    draw_use_case(draw, uc10_c[0], uc10_c[1], 230, 52, ["CU-10: Cambiar Estado a", "Daado / Mantenimiento"])
    draw_use_case(draw, uc11_c[0], uc11_c[1], 230, 50, ["CU-11: Consultar y Filtrar", "Directorio de Clientes"])
    draw_use_case(draw, uc12_c[0], uc12_c[1], 230, 50, ["CU-12: Actualizar Expediente", "Tcnico de Abonado"])
    
    # Included Use Cases for CU-08
    inc1_c = (1950, 400)
    inc2_c = (1950, 560)
    
    draw_use_case(draw, inc1_c[0], inc1_c[1], 270, 52, ["Ejecutar Bloqueo Pesimista", "(SELECT ... FOR UPDATE)"], is_included=True)
    draw_use_case(draw, inc2_c[0], inc2_c[1], 270, 52, ["Validar Telemetra ONT / MAC", "y Nivel Potencia RX (dBm)"], is_included=True)
    
    # Admin -> all
    draw_solid_line(draw, 340, 320, uc7_c[0] - 230, uc7_c[1])
    draw_solid_line(draw, 340, 330, uc8_c[0] - 230, uc8_c[1])
    draw_solid_line(draw, 340, 340, uc9_c[0] - 230, uc9_c[1])
    draw_solid_line(draw, 340, 350, uc10_c[0] - 230, uc10_c[1])
    draw_solid_line(draw, 340, 360, uc11_c[0] - 230, uc11_c[1])
    draw_solid_line(draw, 340, 370, uc12_c[0] - 230, uc12_c[1])
    
    # Soporte -> all
    draw_solid_line(draw, 340, 820, uc7_c[0] - 230, uc7_c[1] + 15)
    draw_solid_line(draw, 340, 830, uc8_c[0] - 230, uc8_c[1] + 15)
    draw_solid_line(draw, 340, 840, uc9_c[0] - 230, uc9_c[1] + 10)
    draw_solid_line(draw, 340, 850, uc10_c[0] - 230, uc10_c[1])
    draw_solid_line(draw, 340, 860, uc11_c[0] - 230, uc11_c[1])
    draw_solid_line(draw, 340, 870, uc12_c[0] - 230, uc12_c[1])
    
    # Tecnico -> only CU-07, CU-08, CU-11 (Denied CU-09, CU-10 by 403 Forbidden)
    draw_solid_line(draw, 340, 1320, uc7_c[0] - 230, uc7_c[1] + 30)
    draw_solid_line(draw, 340, 1340, uc8_c[0] - 230, uc8_c[1] + 30)
    draw_solid_line(draw, 340, 1360, uc11_c[0] - 230, uc11_c[1] + 20)
    
    # Dependencies
    draw_dashed_arrow(draw, uc8_c[0] + 230, uc8_c[1] - 15, inc1_c[0] - 270, inc1_c[1])
    draw_dashed_arrow(draw, uc8_c[0] + 230, uc8_c[1] + 15, inc2_c[0] - 270, inc2_c[1])
    
    img.save(out_path, dpi=(300, 300))
    print(f"Generated: {out_path}")

# ==============================================================================
# MODULO 4: Operación Móvil Offline-First y Reportes Ejecutivos PDF
# ==============================================================================
def gen_cu_mod4(out_path):
    W, H = 2600, 1500
    img = Image.new("L", (W, H), C_WHITE)
    draw = ImageDraw.Draw(img)
    
    bx0, by0, bx1, by1 = 520, 60, 2480, 1420
    draw.rectangle([bx0, by0, bx1, by1], outline=C_BLACK, width=3, fill=C_WHITE)
    draw.rectangle([bx0, by0, bx0 + 780, by0 + 45], outline=C_BLACK, width=3, fill=C_SHADE)
    draw.text((bx0 + 20, by0 + 22), "Frontera del Sistema: Mdulo 4 - Operacin Offline-First y Auditora PDF", font=FONT_BOX_TAG, fill=C_BLACK, anchor="lm")
    
    # Actors
    draw_actor(draw, 240, 260, "Administrador NOC", "(Auditora Global)")
    draw_actor(draw, 240, 760, "Soporte Tcnico", "(Monitoreo de Red)")
    draw_actor(draw, 240, 1200, "Tcnico de Campo", "(Operacin Sin Red)")
    
    # Primary Use Cases
    uc13_c = (1000, 260)
    uc14_c = (1000, 560)
    uc15_c = (1000, 880)
    uc16_c = (1000, 1220)
    
    draw_use_case(draw, uc13_c[0], uc13_c[1], 240, 58, ["CU-13: Operar en Modo Offline", "(Cach Local Dexie.js / PWA)"])
    draw_use_case(draw, uc14_c[0], uc14_c[1], 240, 58, ["CU-14: Encolar Asignaciones", "en Zonas Sin Cobertura"])
    draw_use_case(draw, uc15_c[0], uc15_c[1], 240, 58, ["CU-15: Sincronizar Cola al", "Recuperar Conectividad"])
    draw_use_case(draw, uc16_c[0], uc16_c[1], 240, 58, ["CU-16: Generar y Descargar", "Reporte Ejecutivo PDF"])
    
    # Included Use Cases
    inc1_c = (1950, 880)
    inc2_c = (1950, 1140)
    inc3_c = (1950, 1300)
    
    draw_use_case(draw, inc1_c[0], inc1_c[1], 270, 55, ["Reconciliar Mutaciones con", "Reintentos Exponenciales"], is_included=True)
    draw_use_case(draw, inc2_c[0], inc2_c[1], 270, 52, ["Calcular Semforo de Capacidad", "y Umbral Preventivo 80%"], is_included=True)
    draw_use_case(draw, inc3_c[0], inc3_c[1], 270, 52, ["Canalizar Streaming en Memoria", "Binario con Motor PDFKit"], is_included=True)
    
    # Associations
    # Tecnico -> CU-13, CU-14, CU-15
    draw_solid_line(draw, 340, 1260, uc13_c[0] - 240, uc13_c[1] + 25)
    draw_solid_line(draw, 340, 1280, uc14_c[0] - 240, uc14_c[1] + 15)
    draw_solid_line(draw, 340, 1300, uc15_c[0] - 240, uc15_c[1])
    
    # Soporte -> CU-13, CU-15, CU-16
    draw_solid_line(draw, 340, 800, uc13_c[0] - 240, uc13_c[1] + 10)
    draw_solid_line(draw, 340, 820, uc15_c[0] - 240, uc15_c[1] - 15)
    draw_solid_line(draw, 340, 840, uc16_c[0] - 240, uc16_c[1] - 15)
    
    # Admin -> CU-13, CU-15, CU-16
    draw_solid_line(draw, 340, 320, uc13_c[0] - 240, uc13_c[1])
    draw_solid_line(draw, 340, 340, uc15_c[0] - 240, uc15_c[1] - 30)
    draw_solid_line(draw, 340, 360, uc16_c[0] - 240, uc16_c[1] - 30)
    
    # Includes
    draw_dashed_arrow(draw, uc15_c[0] + 240, uc15_c[1], inc1_c[0] - 270, inc1_c[1])
    draw_dashed_arrow(draw, uc16_c[0] + 240, uc16_c[1] - 20, inc2_c[0] - 270, inc2_c[1])
    draw_dashed_arrow(draw, uc16_c[0] + 240, uc16_c[1] + 20, inc3_c[0] - 270, inc3_c[1])
    
    img.save(out_path, dpi=(300, 300))
    print(f"Generated: {out_path}")

if __name__ == "__main__":
    os.makedirs("scratch", exist_ok=True)
    gen_cu_mod1("scratch/diag_cu_mod1_seguridad.png")
    gen_cu_mod2("scratch/diag_cu_mod2_gis_naps.png")
    gen_cu_mod3("scratch/diag_cu_mod3_puertos_clientes.png")
    gen_cu_mod4("scratch/diag_cu_mod4_offline_reportes.png")

