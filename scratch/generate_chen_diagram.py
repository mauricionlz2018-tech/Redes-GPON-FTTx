import os
import math
from PIL import Image, ImageDraw, ImageFont

def create_chen_er_diagram():
def create_chen_er_diagram_bw():
    # Dimensions
    W, H = 3400, 2200
    img = Image.new('RGB', (W, H), (255, 255, 255))
    draw = ImageDraw.Draw(img)

    # Outer border matching reference image style
    draw.rectangle([(20, 20), (W - 20, H - 20)], outline=(0, 188, 212), width=10)
    # Outer black border
    draw.rectangle([(20, 20), (W - 20, H - 20)], outline=(0, 0, 0), width=6)

    # Fonts
    font_title = ImageFont.truetype("C:/Windows/Fonts/arialbd.ttf", 44)
    font_sub = ImageFont.truetype("C:/Windows/Fonts/arial.ttf", 26)
    font_entity = ImageFont.truetype("C:/Windows/Fonts/arialbd.ttf", 28)
    font_rel = ImageFont.truetype("C:/Windows/Fonts/arialbd.ttf", 24)
    font_attr = ImageFont.truetype("C:/Windows/Fonts/arial.ttf", 20)
    font_attr_pk = ImageFont.truetype("C:/Windows/Fonts/arialbd.ttf", 20)
    font_card = ImageFont.truetype("C:/Windows/Fonts/arialbd.ttf", 22)
    font_type = ImageFont.truetype("C:/Windows/Fonts/arialbd.ttf", 24)

    # Header
    draw.text((W // 2, 70), "DIAGRAMA ENTIDAD - RELACIÓN (MODELO CONCEPTUAL DE CHEN)", font=font_title, fill=(30, 30, 30), anchor="mm")
    draw.text((W // 2, 120), "Sistema de Inventario y Mapeo Lógico GPON / FTTx | GPON TELECOM S.A. de C.V.", font=font_sub, fill=(100, 100, 100), anchor="mm")
    # Header in solid black
    draw.text((W // 2, 70), "DIAGRAMA ENTIDAD - RELACIÓN (MODELO CONCEPTUAL DE CHEN)", font=font_title, fill=(0, 0, 0), anchor="mm")
    draw.text((W // 2, 120), "Sistema de Inventario y Mapeo Lógico GPON / FTTx | GPON TELECOM S.A. de C.V.", font=font_sub, fill=(0, 0, 0), anchor="mm")

    # Colors
    C_ENT_FILL = (245, 178, 37)      # Gold / Orange
    C_ENT_BORDER = (210, 140, 10)
    C_ENT_TEXT = (20, 20, 20)
    # Black and White Colors
    C_ENT_FILL = (255, 255, 255)      # Pure White
    C_ENT_BORDER = (0, 0, 0)          # Solid Black
    C_ENT_TEXT = (0, 0, 0)            # Solid Black

    C_REL_FILL = (224, 247, 250)      # Pale Cyan
    C_REL_BORDER = (0, 172, 193)      # Cyan border
    C_REL_TEXT = (0, 96, 100)
    C_REL_FILL = (255, 255, 255)      # Pure White
    C_REL_BORDER = (0, 0, 0)          # Solid Black
    C_REL_TEXT = (0, 0, 0)            # Solid Black

    C_ATTR_FILL = (255, 255, 255)     # White oval
    C_ATTR_BORDER = (70, 70, 70)      # Dark gray border
    C_ATTR_TEXT = (30, 30, 30)
    C_ATTR_FILL = (255, 255, 255)     # Pure White
    C_ATTR_BORDER = (0, 0, 0)         # Solid Black
    C_ATTR_TEXT = (0, 0, 0)           # Solid Black

    C_LINE = (70, 70, 70)
    C_CARD = (10, 80, 150)
    C_LINE = (0, 0, 0)                # Solid Black
    C_CARD = (0, 0, 0)                # Solid Black

    # Entities
    def draw_entity(name, cx, cy, w=230, h=76):
    # Entities (Rectangles)
    def draw_entity(name, cx, cy, w=240, h=76):
        x0, y0 = cx - w // 2, cy - h // 2
        x1, y1 = cx + w // 2, cy + h // 2
        draw.rectangle([(x0, y0), (x1, y1)], fill=C_ENT_FILL, outline=C_ENT_BORDER, width=4)
        draw.rectangle([(x0, y0), (x1, y1)], fill=C_ENT_FILL, outline=C_ENT_BORDER, width=3)
        draw.text((cx, cy), name, font=font_entity, fill=C_ENT_TEXT, anchor="mm")
        return {"cx": cx, "cy": cy, "w": w, "h": h, "x0": x0, "y0": y0, "x1": x1, "y1": y1}

    # Relationships
    # Relationships (Diamonds)
    def draw_diamond(name, card_top, cx, cy, rw=95, rh=55):
        pts = [
            (cx, cy - rh),
            (cx + rw, cy),
            (cx, cy + rh),
            (cx - rw, cy)
        ]
        draw.polygon(pts, fill=C_REL_FILL, outline=C_REL_BORDER)
        draw.line(pts + [pts[0]], fill=C_REL_BORDER, width=4)
        draw.line(pts + [pts[0]], fill=C_REL_BORDER, width=3)
        draw.text((cx, cy), name, font=font_rel, fill=C_REL_TEXT, anchor="mm")
        if card_top:
            draw.text((cx, cy - rh - 18), card_top, font=font_type, fill=C_CARD, anchor="mm")
        return {"cx": cx, "cy": cy, "rw": rw, "rh": rh}

    # Attributes
    # Attributes (Ovals / Ellipses)
    def draw_attr(name, cx, cy, is_pk=False, ew=160, eh=46):
        x0, y0 = cx - ew // 2, cy - eh // 2
        x1, y1 = cx + ew // 2, cy + eh // 2
        draw.ellipse([(x0, y0), (x1, y1)], fill=C_ATTR_FILL, outline=C_ATTR_BORDER, width=2)
        f = font_attr_pk if is_pk else font_attr
        draw.text((cx, cy), name, font=f, fill=C_ATTR_TEXT, anchor="mm")
        if is_pk:
            bbox = draw.textbbox((cx, cy), name, font=f, anchor="mm")
            draw.line([(bbox[0], bbox[3] + 2), (bbox[2], bbox[3] + 2)], fill=C_ATTR_TEXT, width=2)
        return {"cx": cx, "cy": cy, "ew": ew, "eh": eh, "x0": x0, "y0": y0, "x1": x1, "y1": y1}

    # Clean connection between ellipse perimeter and rectangle perimeter
    def connect_attr(attr, ent):
        ax, ay = attr["cx"], attr["cy"]
        ex, ey = ent["cx"], ent["cy"]
        dx, dy = ex - ax, ey - ay
        dist = math.hypot(dx, dy)
        if dist == 0:
            return
        ux, uy = dx / dist, dy / dist

        # Point on ellipse perimeter (approximate)
        a_rad_x = attr["ew"] / 2.0
        a_rad_y = attr["eh"] / 2.0
        # Angle from center of ellipse to entity
        theta = math.atan2(dy, dx)
        p_start_x = ax + a_rad_x * math.cos(theta)
        p_start_y = ay + a_rad_y * math.sin(theta)

        # Point on entity rectangle perimeter
        # Determine which edge it hits
        if abs(dx) * ent["h"] > abs(dy) * ent["w"]:
            # Hits left or right edge
            p_end_x = ent["x0"] if dx > 0 else ent["x1"]
            p_end_y = ey + (p_end_x - ex) * (dy / dx) if dx != 0 else ey
        else:
            # Hits top or bottom edge
            p_end_y = ent["y0"] if dy > 0 else ent["y1"]
            p_end_x = ex + (p_end_y - ey) * (dx / dy) if dy != 0 else ex

        draw.line([(p_start_x, p_start_y), (p_end_x, p_end_y)], fill=C_LINE, width=2)

    # -------------------------------------------------------------
    # ENTITIES
    # -------------------------------------------------------------
    E_ODF = draw_entity("ODF_PANEL", 500, 440, w=240, h=76)
    E_PON = draw_entity("PUERTO_PON", 1700, 440, w=240, h=76)
    E_NAP = draw_entity("CAJA_NAP", 2850, 440, w=240, h=76)

    E_HILO = draw_entity("HILO_FIBRA", 500, 1150, w=240, h=76)
    E_PNAP = draw_entity("PUERTO_NAP", 1700, 1150, w=240, h=76)
    E_CLI = draw_entity("CLIENTE", 2850, 1150, w=240, h=76)

    E_USR = draw_entity("USUARIO", 500, 1850, w=240, h=76)
    E_BIT = draw_entity("BITACORA_KM", 1700, 1850, w=250, h=76)

    # -------------------------------------------------------------
    # RELATIONSHIPS
    # RELATIONSHIPS (Diamonds) & CONNECTIONS
    # -------------------------------------------------------------
    # 1. ODF_PANEL --- Posee --- PUERTO_PON
    R_POS = draw_diamond("Posee", "1:N", 1100, 440, rw=95, rh=55)
    draw.line([(E_ODF["x1"], 440), (R_POS["cx"] - R_POS["rw"], 440)], fill=C_LINE, width=3)
    draw.line([(R_POS["cx"] + R_POS["rw"], 440), (E_PON["x0"], 440)], fill=C_LINE, width=3)
    draw.line([(E_ODF["x1"], 440), (R_POS["cx"] - R_POS["rw"], 440)], fill=C_LINE, width=2)
    draw.line([(R_POS["cx"] + R_POS["rw"], 440), (E_PON["x0"], 440)], fill=C_LINE, width=2)
    draw.text((E_ODF["x1"] + 35, 415), "(1, 1)", font=font_card, fill=C_CARD, anchor="mm")
    draw.text((E_PON["x0"] - 40, 415), "(1, n)", font=font_card, fill=C_CARD, anchor="mm")

    # 2. ODF_PANEL --- Origina --- HILO_FIBRA
    R_ORI = draw_diamond("Origina", "1:N", 500, 795, rw=95, rh=55)
    draw.line([(500, E_ODF["y1"]), (500, R_ORI["cy"] - R_ORI["rh"])], fill=C_LINE, width=3)
    draw.line([(500, R_ORI["cy"] + R_ORI["rh"]), (500, E_HILO["y0"])], fill=C_LINE, width=3)
    draw.line([(500, E_ODF["y1"]), (500, R_ORI["cy"] - R_ORI["rh"])], fill=C_LINE, width=2)
    draw.line([(500, R_ORI["cy"] + R_ORI["rh"]), (500, E_HILO["y0"])], fill=C_LINE, width=2)
    draw.text((545, E_ODF["y1"] + 35), "(1, 1)", font=font_card, fill=C_CARD, anchor="mm")
    draw.text((545, E_HILO["y0"] - 35), "(1, n)", font=font_card, fill=C_CARD, anchor="mm")

    # 3. PUERTO_PON --- Alimenta --- CAJA_NAP
    R_ALI = draw_diamond("Alimenta", "1:N", 2275, 440, rw=95, rh=55)
    draw.line([(E_PON["x1"], 440), (R_ALI["cx"] - R_ALI["rw"], 440)], fill=C_LINE, width=3)
    draw.line([(R_ALI["cx"] + R_ALI["rw"], 440), (E_NAP["x0"], 440)], fill=C_LINE, width=3)
    draw.line([(E_PON["x1"], 440), (R_ALI["cx"] - R_ALI["rw"], 440)], fill=C_LINE, width=2)
    draw.line([(R_ALI["cx"] + R_ALI["rw"], 440), (E_NAP["x0"], 440)], fill=C_LINE, width=2)
    draw.text((E_PON["x1"] + 40, 415), "(1, 1)", font=font_card, fill=C_CARD, anchor="mm")
    draw.text((E_NAP["x0"] - 40, 415), "(1, n)", font=font_card, fill=C_CARD, anchor="mm")

    # 4. CAJA_NAP --- Contiene --- PUERTO_NAP
    R_CON = draw_diamond("Contiene", "1:N", 2275, 795, rw=95, rh=55)
    draw.line([(2850, E_NAP["y1"]), (2850, 795), (R_CON["cx"] + R_CON["rw"], 795)], fill=C_LINE, width=3)
    draw.line([(R_CON["cx"] - R_CON["rw"], 795), (1700, 795), (1700, E_PNAP["y0"])], fill=C_LINE, width=3)
    draw.line([(2850, E_NAP["y1"]), (2850, 795), (R_CON["cx"] + R_CON["rw"], 795)], fill=C_LINE, width=2)
    draw.line([(R_CON["cx"] - R_CON["rw"], 795), (1700, 795), (1700, E_PNAP["y0"])], fill=C_LINE, width=2)
    draw.text((2895, E_NAP["y1"] + 35), "(1, 1)", font=font_card, fill=C_CARD, anchor="mm")
    draw.text((1745, E_PNAP["y0"] - 35), "(1, n)", font=font_card, fill=C_CARD, anchor="mm")

    # 5. PUERTO_NAP --- Conecta --- CLIENTE
    R_CNC = draw_diamond("Conecta", "1:1", 2275, 1150, rw=95, rh=55)
    draw.line([(E_PNAP["x1"], 1150), (R_CNC["cx"] - R_CNC["rw"], 1150)], fill=C_LINE, width=3)
    draw.line([(R_CNC["cx"] + R_CNC["rw"], 1150), (E_CLI["x0"], 1150)], fill=C_LINE, width=3)
    draw.line([(E_PNAP["x1"], 1150), (R_CNC["cx"] - R_CNC["rw"], 1150)], fill=C_LINE, width=2)
    draw.line([(R_CNC["cx"] + R_CNC["rw"], 1150), (E_CLI["x0"], 1150)], fill=C_LINE, width=2)
    draw.text((E_PNAP["x1"] + 40, 1125), "(1, 1)", font=font_card, fill=C_CARD, anchor="mm")
    draw.text((E_CLI["x0"] - 40, 1125), "(0, 1)", font=font_card, fill=C_CARD, anchor="mm")

    # 6. USUARIO --- Registra --- BITACORA_KM
    R_REG = draw_diamond("Registra", "1:N", 1100, 1850, rw=95, rh=55)
    draw.line([(E_USR["x1"], 1850), (R_REG["cx"] - R_REG["rw"], 1850)], fill=C_LINE, width=3)
    draw.line([(R_REG["cx"] + R_REG["rw"], 1850), (E_BIT["x0"], 1850)], fill=C_LINE, width=3)
    draw.line([(E_USR["x1"], 1850), (R_REG["cx"] - R_REG["rw"], 1850)], fill=C_LINE, width=2)
    draw.line([(R_REG["cx"] + R_REG["rw"], 1850), (E_BIT["x0"], 1850)], fill=C_LINE, width=2)
    draw.text((E_USR["x1"] + 40, 1825), "(1, 1)", font=font_card, fill=C_CARD, anchor="mm")
    draw.text((E_BIT["x0"] - 40, 1825), "(0, n)", font=font_card, fill=C_CARD, anchor="mm")

    # 7. CAJA_NAP --- Asocia --- BITACORA_KM
    R_ASO = draw_diamond("Asocia", "1:N", 2275, 1500, rw=95, rh=55)
    draw.line([(E_BIT["x1"], 1850), (2050, 1850), (2050, 1500), (R_ASO["cx"] - R_ASO["rw"], 1500)], fill=C_LINE, width=3)
    draw.line([(R_ASO["cx"] + R_ASO["rw"], 1500), (2650, 1500), (2650, 520), (E_NAP["x0"] + 30, 520), (E_NAP["x0"] + 30, E_NAP["y1"])], fill=C_LINE, width=3)
    draw.line([(E_BIT["x1"], 1850), (2050, 1850), (2050, 1500), (R_ASO["cx"] - R_ASO["rw"], 1500)], fill=C_LINE, width=2)
    draw.line([(R_ASO["cx"] + R_ASO["rw"], 1500), (2650, 1500), (2650, 520), (E_NAP["x0"] + 30, 520), (E_NAP["x0"] + 30, E_NAP["y1"])], fill=C_LINE, width=2)
    draw.text((2090, 1530), "(0, n)", font=font_card, fill=C_CARD, anchor="mm")
    draw.text((2695, 545), "(1, 1)", font=font_card, fill=C_CARD, anchor="mm")

    # -------------------------------------------------------------
    # ATTRIBUTES
    # -------------------------------------------------------------
    # ODF_PANEL
    A_ODF_1 = draw_attr("id_odf", 160, 310, is_pk=True, ew=170)
    A_ODF_2 = draw_attr("nombre", 160, 380, ew=170)
    A_ODF_3 = draw_attr("ubicacion_central", 160, 450, ew=190)
    A_ODF_4 = draw_attr("coordenadas_gps", 160, 520, ew=190)
    A_ODF_5 = draw_attr("capacidad_hilos", 500, 270, ew=180)
    for a in [A_ODF_1, A_ODF_2, A_ODF_3, A_ODF_4, A_ODF_5]:
        connect_attr(a, E_ODF)

    # PUERTO_PON
    A_PON_1 = draw_attr("id_puerto_pon", 1460, 260, is_pk=True, ew=180)
    A_PON_2 = draw_attr("numero_slot", 1700, 230, ew=170)
    A_PON_3 = draw_attr("numero_puerto", 1940, 260, ew=170)
    A_PON_4 = draw_attr("potencia_tx_dbm", 1520, 330, ew=190)
    A_PON_5 = draw_attr("capacidad_max", 1880, 330, ew=180)
    for a in [A_PON_1, A_PON_2, A_PON_3, A_PON_4, A_PON_5]:
        connect_attr(a, E_PON)

    # CAJA_NAP
    A_NAP_1 = draw_attr("id_nap", 2850, 260, is_pk=True, ew=160)
    A_NAP_2 = draw_attr("identificador", 3180, 320, ew=170)
    A_NAP_3 = draw_attr("zona", 3180, 390, ew=160)
    A_NAP_4 = draw_attr("total_puertos", 3180, 460, ew=170)
    A_NAP_5 = draw_attr("direccion_texto", 3180, 530, ew=190)
    A_NAP_6 = draw_attr("coordenadas_gps", 3180, 600, ew=190)
    for a in [A_NAP_1, A_NAP_2, A_NAP_3, A_NAP_4, A_NAP_5, A_NAP_6]:
        connect_attr(a, E_NAP)

    # HILO_FIBRA
    A_HIL_1 = draw_attr("id_hilo", 160, 1070, is_pk=True, ew=160)
    A_HIL_2 = draw_attr("numero_hilo", 160, 1140, ew=170)
    A_HIL_3 = draw_attr("estado_hilo", 160, 1210, ew=170)
    A_HIL_4 = draw_attr("longitud_metros", 380, 1310, ew=180)
    A_HIL_5 = draw_attr("atenuacion_db", 620, 1310, ew=180)
    for a in [A_HIL_1, A_HIL_2, A_HIL_3, A_HIL_4, A_HIL_5]:
        connect_attr(a, E_HILO)

    # PUERTO_NAP
    A_PNP_1 = draw_attr("id_puerto", 1460, 1010, is_pk=True, ew=160)
    A_PNP_2 = draw_attr("indice_puerto", 1460, 1270, ew=170)
    A_PNP_3 = draw_attr("estado_puerto", 1700, 1290, ew=170)
    A_PNP_4 = draw_attr("potencia_rx_dbm", 1940, 1270, ew=190)
    for a in [A_PNP_1, A_PNP_2, A_PNP_3, A_PNP_4]:
        connect_attr(a, E_PNAP)

    # CLIENTE
    A_CLI_1 = draw_attr("id_cliente", 3190, 990, is_pk=True, ew=160)
    A_CLI_2 = draw_attr("numero_cliente", 3190, 1060, ew=180)
    A_CLI_3 = draw_attr("nombre_completo", 3190, 1130, ew=190)
    A_CLI_4 = draw_attr("direccion", 3190, 1200, ew=160)
    A_CLI_5 = draw_attr("marca_ont", 3190, 1270, ew=160)
    A_CLI_6 = draw_attr("ont_mac", 2730, 1290, ew=160)
    A_CLI_7 = draw_attr("potencia_rx_estimada", 2970, 1290, ew=210)
    for a in [A_CLI_1, A_CLI_2, A_CLI_3, A_CLI_4, A_CLI_5, A_CLI_6, A_CLI_7]:
        connect_attr(a, E_CLI)

    # USUARIO
    A_USR_1 = draw_attr("id_usuario", 190, 1780, is_pk=True, ew=170)
    A_USR_2 = draw_attr("nombre_completo", 190, 1850, ew=190)
    A_USR_3 = draw_attr("credencial_acceso", 190, 1920, ew=190)
    A_USR_4 = draw_attr("password_hash", 380, 1990, ew=180)
    A_USR_5 = draw_attr("rol_usuario", 620, 1990, ew=170)
    for a in [A_USR_1, A_USR_2, A_USR_3, A_USR_4, A_USR_5]:
        connect_attr(a, E_USR)

    # BITACORA_KM
    A_BIT_1 = draw_attr("id_bitacora", 1440, 1990, is_pk=True, ew=170)
    A_BIT_2 = draw_attr("tecnico_nombre", 1680, 2010, ew=180)
    A_BIT_3 = draw_attr("vehiculo_unidad", 1920, 2010, ew=180)
    A_BIT_4 = draw_attr("km_inicial", 1460, 1710, ew=160)
    A_BIT_5 = draw_attr("km_final", 1700, 1690, ew=160)
    A_BIT_6 = draw_attr("distancia_km", 1940, 1710, ew=170)
    for a in [A_BIT_1, A_BIT_2, A_BIT_3, A_BIT_4, A_BIT_5, A_BIT_6]:
        connect_attr(a, E_BIT)

    # -------------------------------------------------------------
    # LEGEND BOX
    # LEGEND BOX (Black and White)
    # -------------------------------------------------------------
    lx, ly = 2300, 1760
    draw.rectangle([(lx, ly), (lx + 820, ly + 260)], fill=(250, 250, 250), outline=(180, 180, 180), width=2)
    draw.text((lx + 410, ly + 25), "SIMBOLOGÍA DE NOTACIÓN DE CHEN", font=font_rel, fill=(50, 50, 50), anchor="mm")
    draw.rectangle([(lx, ly), (lx + 820, ly + 260)], fill=(255, 255, 255), outline=(0, 0, 0), width=2)
    draw.text((lx + 410, ly + 25), "SIMBOLOGÍA DE NOTACIÓN DE CHEN", font=font_rel, fill=(0, 0, 0), anchor="mm")

    # 1. Entity
    draw.rectangle([(lx + 40, ly + 65), (lx + 130, ly + 105)], fill=C_ENT_FILL, outline=C_ENT_BORDER, width=2)
    draw.text((lx + 150, ly + 85), "Entidad (Conjunto de objetos del dominio)", font=font_sub, fill=(40, 40, 40), anchor="lm")
    draw.text((lx + 150, ly + 85), "Entidad (Conjunto de objetos del dominio)", font=font_sub, fill=(0, 0, 0), anchor="lm")

    # 2. Relationship
    r_pts = [(lx + 85, ly + 125), (lx + 130, ly + 150), (lx + 85, ly + 175), (lx + 40, ly + 150)]
    draw.polygon(r_pts, fill=C_REL_FILL, outline=C_REL_BORDER)
    draw.line(r_pts + [r_pts[0]], fill=C_REL_BORDER, width=2)
    draw.text((lx + 150, ly + 150), "Relación (Asociación semántica y cardinalidad)", font=font_sub, fill=(40, 40, 40), anchor="lm")
    draw.text((lx + 150, ly + 150), "Relación (Asociación semántica y cardinalidad)", font=font_sub, fill=(0, 0, 0), anchor="lm")

    # 3. Attribute
    draw.ellipse([(lx + 45, ly + 195), (lx + 125, ly + 235)], fill=C_ATTR_FILL, outline=C_ATTR_BORDER, width=2)
    draw.text((lx + 85, ly + 215), "PK", font=font_attr_pk, fill=C_ATTR_TEXT, anchor="mm")
    draw.text((lx + 150, ly + 215), "Atributo (Propiedad o característica, PK subrayada)", font=font_sub, fill=(40, 40, 40), anchor="lm")
    draw.text((lx + 150, ly + 215), "Atributo (Propiedad o característica, PK subrayada)", font=font_sub, fill=(0, 0, 0), anchor="lm")

    out_path = "docs/diagrama_er_chen_gpon.png"
    img.save(out_path, quality=95)
    print(f"Refined Chen ER Diagram created at: {out_path}")
    print(f"Black & White Chen ER Diagram created at: {out_path}")

if __name__ == "__main__":
    create_chen_er_diagram()

    create_chen_er_diagram_bw()
