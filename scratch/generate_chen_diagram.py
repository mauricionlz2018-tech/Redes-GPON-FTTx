import os
import math
from PIL import Image, ImageDraw, ImageFont

def create_chen_er_diagram_bw():
    W, H = 3400, 2100
    img = Image.new('L', (W, H), 255)
    draw = ImageDraw.Draw(img)

    # Outer border (no title banner at top!)
    draw.rectangle([(20, 20), (W - 20, H - 20)], outline=0, width=4)

    # Fonts
    font_entity = ImageFont.truetype("C:/Windows/Fonts/arialbd.ttf", 28)
    font_rel = ImageFont.truetype("C:/Windows/Fonts/arialbd.ttf", 24)
    font_attr = ImageFont.truetype("C:/Windows/Fonts/arial.ttf", 20)
    font_attr_pk = ImageFont.truetype("C:/Windows/Fonts/arialbd.ttf", 20)
    font_type = ImageFont.truetype("C:/Windows/Fonts/arialbd.ttf", 24)
    font_sub = ImageFont.truetype("C:/Windows/Fonts/arial.ttf", 24)

    C_FILL = 255
    C_SHADE = 245
    C_BORDER = 0
    C_TEXT = 0

    # Entities (Rectangles)
    def draw_entity(name, cx, cy, w=240, h=76):
        x0, y0 = cx - w // 2, cy - h // 2
        x1, y1 = cx + w // 2, cy + h // 2
        draw.rectangle([(x0, y0), (x1, y1)], fill=C_SHADE, outline=C_BORDER, width=3)
        draw.text((cx, cy), name, font=font_entity, fill=C_TEXT, anchor="mm")
        return {"cx": cx, "cy": cy, "w": w, "h": h, "x0": x0, "y0": y0, "x1": x1, "y1": y1}

    # Relationships (Diamonds)
    def draw_diamond(name, card_top, cx, cy, rw=95, rh=55):
        pts = [(cx, cy - rh), (cx + rw, cy), (cx, cy + rh), (cx - rw, cy)]
        draw.polygon(pts, fill=C_FILL, outline=C_BORDER)
        draw.line(pts + [pts[0]], fill=C_BORDER, width=3)
        draw.text((cx, cy), name, font=font_rel, fill=C_TEXT, anchor="mm")
        if card_top:
            draw.text((cx, cy - rh - 18), card_top, font=font_type, fill=C_TEXT, anchor="mm")
        return {"cx": cx, "cy": cy, "rw": rw, "rh": rh}

    # Attributes (Ovals / Ellipses)
    def draw_attr(name, cx, cy, is_pk=False, ew=160, eh=46):
        x0, y0 = cx - ew // 2, cy - eh // 2
        x1, y1 = cx + ew // 2, cy + eh // 2
        draw.ellipse([(x0, y0), (x1, y1)], fill=C_FILL, outline=C_BORDER, width=2)
        f = font_attr_pk if is_pk else font_attr
        draw.text((cx, cy), name, font=f, fill=C_TEXT, anchor="mm")
        if is_pk:
            bbox = draw.textbbox((cx, cy), name, font=f, anchor="mm")
            draw.line([(bbox[0], bbox[3] + 2), (bbox[2], bbox[3] + 2)], fill=C_TEXT, width=2)
        return {"cx": cx, "cy": cy, "ew": ew, "eh": eh, "x0": x0, "y0": y0, "x1": x1, "y1": y1}

    def connect_attr(attr, ent):
        ax, ay = attr["cx"], attr["cy"]
        ex, ey = ent["cx"], ent["cy"]
        dx, dy = ex - ax, ey - ay
        dist = math.hypot(dx, dy)
        if dist == 0:
            return
        ux, uy = dx / dist, dy / dist
        a_rad_x = attr["ew"] / 2.0
        a_rad_y = attr["eh"] / 2.0
        theta = math.atan2(dy, dx)
        p_start_x = ax + a_rad_x * math.cos(theta)
        p_start_y = ay + a_rad_y * math.sin(theta)
        if abs(dx) * ent["h"] > abs(dy) * ent["w"]:
            p_end_x = ent["x0"] if dx > 0 else ent["x1"]
            p_end_y = ey + (p_end_x - ex) * (dy / dx) if dx != 0 else ey
        else:
            p_end_y = ent["y0"] if dy > 0 else ent["y1"]
            p_end_x = ex + (p_end_y - ey) * (dx / dy) if dy != 0 else ex
        draw.line([(p_start_x, p_start_y), (p_end_x, p_end_y)], fill=C_BORDER, width=2)

    # 1. ENTITIES (y = 380, shifted up since no top header)
    E_ODF = draw_entity("ODF_PANEL", 500, 380, w=240, h=76)
    E_PON = draw_entity("PUERTO_PON", 1700, 380, w=240, h=76)
    E_NAP = draw_entity("CAJA_NAP", 2850, 380, w=240, h=76)

    # Bottom Row Entities (y = 1200)
    E_PORT = draw_entity("PUERTO_NAP", 1700, 1200, w=240, h=76)
    E_CLIENT = draw_entity("CLIENTE", 2850, 1200, w=240, h=76)
    E_USER = draw_entity("USUARIO", 500, 1200, w=240, h=76)

    # 2. RELATIONSHIPS
    R_ODF_PON = draw_diamond("CONTIENE", "1 : N", 1100, 380)
    R_PON_NAP = draw_diamond("ALIMENTA", "1 : N", 2275, 380)
    R_NAP_PORT = draw_diamond("POSEE", "1 : 16", 2275, 790, rw=100, rh=60)
    R_PORT_CLI = draw_diamond("CONECTA", "1 : 1", 2275, 1200)
    R_USR_CLI = draw_diamond("GESTIONA", "1 : N", 1100, 1200)

    # Relationship connection lines
    draw.line([(E_ODF["x1"], E_ODF["cy"]), (R_ODF_PON["cx"] - R_ODF_PON["rw"], R_ODF_PON["cy"])], fill=C_BORDER, width=3)
    draw.line([(R_ODF_PON["cx"] + R_ODF_PON["rw"], R_ODF_PON["cy"]), (E_PON["x0"], E_PON["cy"])], fill=C_BORDER, width=3)

    draw.line([(E_PON["x1"], E_PON["cy"]), (R_PON_NAP["cx"] - R_PON_NAP["rw"], R_PON_NAP["cy"])], fill=C_BORDER, width=3)
    draw.line([(R_PON_NAP["cx"] + R_PON_NAP["rw"], R_PON_NAP["cy"]), (E_NAP["x0"], E_NAP["cy"])], fill=C_BORDER, width=3)

    draw.line([(E_NAP["cx"], E_NAP["y1"]), (E_NAP["cx"], 790), (R_NAP_PORT["cx"] + R_NAP_PORT["rw"], 790)], fill=C_BORDER, width=3)
    draw.line([(R_NAP_PORT["cx"] - R_NAP_PORT["rw"], 790), (E_PORT["cx"], 790), (E_PORT["cx"], E_PORT["y0"])], fill=C_BORDER, width=3)

    draw.line([(E_PORT["x1"], E_PORT["cy"]), (R_PORT_CLI["cx"] - R_PORT_CLI["rw"], R_PORT_CLI["cy"])], fill=C_BORDER, width=3)
    draw.line([(R_PORT_CLI["cx"] + R_PORT_CLI["rw"], R_PORT_CLI["cy"]), (E_CLIENT["x0"], E_CLIENT["cy"])], fill=C_BORDER, width=3)

    draw.line([(E_USER["x1"], E_USER["cy"]), (R_USR_CLI["cx"] - R_USR_CLI["rw"], R_USR_CLI["cy"])], fill=C_BORDER, width=3)
    draw.line([(R_USR_CLI["cx"] + R_USR_CLI["rw"], R_USR_CLI["cy"]), (E_CLIENT["x0"], E_CLIENT["cy"])], fill=C_BORDER, width=3)

    # 3. ATTRIBUTES
    # ODF
    A_ODF_ID = draw_attr("id_odf", 340, 230, is_pk=True)
    A_ODF_NOM = draw_attr("nombre", 500, 180)
    A_ODF_RACK = draw_attr("ubicacion_rack", 670, 230)
    A_ODF_CAP = draw_attr("capacidad_puertos", 350, 520)
    for a in [A_ODF_ID, A_ODF_NOM, A_ODF_RACK, A_ODF_CAP]:
        connect_attr(a, E_ODF)

    # PON
    A_PON_ID = draw_attr("id_puerto_pon", 1520, 230, is_pk=True)
    A_PON_NUM = draw_attr("numero_puerto", 1700, 180)
    A_PON_WL = draw_attr("longitud_onda", 1880, 230)
    A_PON_POT = draw_attr("potencia_tx_dbm", 1520, 530)
    for a in [A_PON_ID, A_PON_NUM, A_PON_WL, A_PON_POT]:
        connect_attr(a, E_PON)

    # NAP
    A_NAP_ID = draw_attr("id_caja_nap", 2670, 230, is_pk=True)
    A_NAP_COD = draw_attr("codigo_nap", 2850, 180)
    A_NAP_LAT = draw_attr("latitud", 3030, 230)
    A_NAP_LNG = draw_attr("longitud", 3080, 380)
    A_NAP_CAP = draw_attr("capacidad_total", 3030, 530)
    A_NAP_DIR = draw_attr("direccion_fisica", 2850, 570)
    for a in [A_NAP_ID, A_NAP_COD, A_NAP_LAT, A_NAP_LNG, A_NAP_CAP, A_NAP_DIR]:
        connect_attr(a, E_NAP)

    # PORT
    A_PRT_ID = draw_attr("id_puerto_nap", 1500, 1050, is_pk=True)
    A_PRT_NUM = draw_attr("numero_puerto", 1700, 1010)
    A_PRT_EST = draw_attr("estado_puerto", 1900, 1050)
    A_PRT_CON = draw_attr("tipo_conector", 1700, 1370)
    for a in [A_PRT_ID, A_PRT_NUM, A_PRT_EST, A_PRT_CON]:
        connect_attr(a, E_PORT)

    # CLIENT
    A_CLI_ID = draw_attr("id_cliente", 2670, 1050, is_pk=True)
    A_CLI_CON = draw_attr("num_contrato", 2850, 1010)
    A_CLI_NOM = draw_attr("nombre_completo", 3030, 1050)
    A_CLI_MAC = draw_attr("mac_ont", 3080, 1200)
    A_CLI_POT = draw_attr("potencia_rx_dbm", 3030, 1350)
    A_CLI_TEL = draw_attr("telefono", 2850, 1390)
    A_CLI_DOM = draw_attr("direccion_servicio", 2670, 1350)
    for a in [A_CLI_ID, A_CLI_CON, A_CLI_NOM, A_CLI_MAC, A_CLI_POT, A_CLI_TEL, A_CLI_DOM]:
        connect_attr(a, E_CLIENT)

    # USER
    A_USR_ID = draw_attr("id_usuario", 340, 1050, is_pk=True)
    A_USR_NOM = draw_attr("username", 500, 1010)
    A_USR_ROL = draw_attr("rol_rbac", 670, 1050)
    A_USR_PWD = draw_attr("password_hash", 340, 1350)
    A_USR_ACT = draw_attr("activo", 500, 1390)
    for a in [A_USR_ID, A_USR_NOM, A_USR_ROL, A_USR_PWD, A_USR_ACT]:
        connect_attr(a, E_USER)

    # Legend at bottom
    lx, ly = 1290, 1680
    draw.rectangle([(lx, ly), (lx + 820, ly + 260)], fill=C_FILL, outline=C_BORDER, width=2)
    draw.text((lx + 410, ly + 25), "SIMBOLOGA DE NOTACIN DE CHEN", font=font_rel, fill=C_TEXT, anchor="mm")
    draw.rectangle([(lx + 40, ly + 65), (lx + 130, ly + 105)], fill=C_SHADE, outline=C_BORDER, width=2)
    draw.text((lx + 150, ly + 85), "Entidad (Conjunto de objetos del dominio)", font=font_sub, fill=C_TEXT, anchor="lm")
    r_pts = [(lx + 85, ly + 125), (lx + 130, ly + 150), (lx + 85, ly + 175), (lx + 40, ly + 150)]
    draw.polygon(r_pts, fill=C_FILL, outline=C_BORDER)
    draw.line(r_pts + [r_pts[0]], fill=C_BORDER, width=2)
    draw.text((lx + 150, ly + 150), "Relacin (Asociacin semntica y cardinalidad)", font=font_sub, fill=C_TEXT, anchor="lm")
    draw.ellipse([(lx + 45, ly + 195), (lx + 125, ly + 235)], fill=C_FILL, outline=C_BORDER, width=2)
    draw.text((lx + 85, ly + 215), "PK", font=font_attr_pk, fill=C_TEXT, anchor="mm")
    draw.text((lx + 150, ly + 215), "Atributo (Propiedad o caracterstica, PK subrayada)", font=font_sub, fill=C_TEXT, anchor="lm")

    os.makedirs("docs", exist_ok=True)
    os.makedirs("scratch", exist_ok=True)
    img.save("docs/diagrama_er_chen_gpon.png", quality=95)
    img.save("scratch/diagrama_er_chen_gpon.png", quality=95)
    print("Chen ER Diagram (B&W, no title) saved successfully!")

if __name__ == "__main__":
    create_chen_er_diagram_bw()
