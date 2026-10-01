import os
from PIL import Image, ImageDraw, ImageFont

FONT_URL = ImageFont.truetype("C:/Windows/Fonts/arial.ttf", 20)
FONT_TAB = ImageFont.truetype("C:/Windows/Fonts/arialbd.ttf", 18)

MOCKUPS_DEF = [
    {
        'src': r'C:/Users/karen/.gemini/antigravity/brain/a33b5b22-c89b-4ff3-a6cc-733a0c69ceac/.user_uploaded/media_1790354677355.png',
        'out': 'scratch/mockup_vista_mapa_gis_puertos.png',
        'url': 'https://app.gpontelecom.com/mapa-red',
        'tab': 'GPON TELECOM \u2014 Visor Cartogr\u00e1fico GIS & Chasis NAP'
    },
    {
        'src': r'C:/Users/karen/.gemini/antigravity/brain/a33b5b22-c89b-4ff3-a6cc-733a0c69ceac/.user_uploaded/media_1790354657335.png',
        'out': 'scratch/mockup_vista_padron_abonados.png',
        'url': 'https://app.gpontelecom.com/abonados',
        'tab': 'GPON TELECOM \u2014 Padr\u00f3n de Suscriptores FTTx'
    },
    {
        'src': r'C:/Users/karen/.gemini/antigravity/brain/a33b5b22-c89b-4ff3-a6cc-733a0c69ceac/.user_uploaded/media_1790354641118.png',
        'out': 'scratch/mockup_vista_reportes_saturacion.png',
        'url': 'https://app.gpontelecom.com/reportes',
        'tab': 'GPON TELECOM \u2014 Reportes e Indicadores de Saturaci\u00f3n'
    },
    {
        'src': r'C:/Users/karen/.gemini/antigravity/brain/a33b5b22-c89b-4ff3-a6cc-733a0c69ceac/.user_uploaded/media_1790354629790.png',
        'out': 'scratch/mockup_vista_gestion_personal.png',
        'url': 'https://app.gpontelecom.com/personal',
        'tab': 'GPON TELECOM \u2014 Gesti\u00f3n de Personal & Cuadrillas RBAC'
    }
]

def make_browser_mockup(src_path, out_path, url_text, tab_title):
    raw_img = Image.open(src_path).convert("RGBA")
    
    # Target frame width
    TARGET_W = 2400
    HDR_H = 80
    
    # Calculate scaled height
    aspect = raw_img.height / raw_img.width
    CONTENT_W = TARGET_W - 4
    CONTENT_H = int(CONTENT_W * aspect)
    scaled_content = raw_img.resize((CONTENT_W, CONTENT_H), Image.Resampling.LANCZOS)
    
    TOTAL_W = TARGET_W
    TOTAL_H = HDR_H + CONTENT_H + 2
    
    # Create canvas
    canvas = Image.new("RGBA", (TOTAL_W, TOTAL_H), (255, 255, 255, 255))
    draw = ImageDraw.Draw(canvas)
    
    # Header bar background
    draw.rectangle([(0, 0), (TOTAL_W, HDR_H)], fill=(240, 243, 246, 255))
    
    # 3 window dots
    dot_y = HDR_H // 2
    draw.ellipse([(40, dot_y - 9), (58, dot_y + 9)], fill=(235, 87, 87, 255), outline=(200, 50, 50, 255))
    draw.ellipse([(70, dot_y - 9), (88, dot_y + 9)], fill=(242, 201, 76, 255), outline=(210, 170, 40, 255))
    draw.ellipse([(100, dot_y - 9), (118, dot_y + 9)], fill=(39, 174, 96, 255), outline=(30, 140, 70, 255))
    
    # Tab title
    draw.rounded_rectangle([(150, 14), (550, HDR_H - 1)], radius=8, fill=(255, 255, 255, 255), outline=(209, 213, 219, 255))
    draw.text((170, 26), tab_title[:45], font=FONT_TAB, fill=(55, 65, 81, 255))
    
    # Address bar
    draw.rounded_rectangle([(580, 18), (TOTAL_W - 50, HDR_H - 18)], radius=12, fill=(255, 255, 255, 255), outline=(209, 213, 219, 255))
    draw.text((610, 28), f"https:// {url_text.replace('https://', '')}", font=FONT_URL, fill=(107, 114, 128, 255))
    
    # Divider line
    draw.line([(0, HDR_H), (TOTAL_W, HDR_H)], fill=(209, 213, 219, 255), width=2)
    
    # Paste content
    canvas.paste(scaled_content, (2, HDR_H + 1), scaled_content)
    
    # Outer border
    draw.rectangle([(0, 0), (TOTAL_W - 1, TOTAL_H - 1)], outline=(180, 185, 192, 255), width=2)
    
    # Convert to RGB
    final_img = canvas.convert("RGB")
    final_img.save(out_path, dpi=(300, 300), quality=95)
    print(f"Generated mockup: {out_path} ({final_img.size})")

os.makedirs("scratch", exist_ok=True)
for m in MOCKUPS_DEF:
    make_browser_mockup(m['src'], m['out'], m['url'], m['tab'])

