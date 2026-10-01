import os
from PIL import Image, ImageDraw, ImageFont

src_path = r'C:/Users/karen/.gemini/antigravity/brain/a33b5b22-c89b-4ff3-a6cc-733a0c69ceac/.user_uploaded/media_1790552327288.png'
out_path = 'scratch/mockup_vista_mapa_satelital_rutas.png'
url_text = 'https://app.gpontelecom.com/mapa-red/satelite'
tab_title = 'GPON TELECOM — Visor Satelital GIS & Telemetría'

FONT_URL = ImageFont.truetype('C:/Windows/Fonts/arial.ttf', 20)
FONT_TAB = ImageFont.truetype('C:/Windows/Fonts/arialbd.ttf', 18)

raw_img = Image.open(src_path).convert('RGBA')
TARGET_W = 2400
HDR_H = 80

aspect = raw_img.height / raw_img.width
CONTENT_W = TARGET_W - 4
CONTENT_H = int(CONTENT_W * aspect)
scaled_content = raw_img.resize((CONTENT_W, CONTENT_H), Image.Resampling.LANCZOS)

TOTAL_W = TARGET_W
TOTAL_H = HDR_H + CONTENT_H + 2

canvas = Image.new('RGBA', (TOTAL_W, TOTAL_H), (255, 255, 255, 255))
draw = ImageDraw.Draw(canvas)

# Header background
draw.rectangle([(0, 0), (TOTAL_W, HDR_H)], fill=(240, 243, 246, 255))
dot_y = HDR_H // 2
draw.ellipse([(40, dot_y - 9), (58, dot_y + 9)], fill=(235, 87, 87, 255), outline=(200, 50, 50, 255))
draw.ellipse([(70, dot_y - 9), (88, dot_y + 9)], fill=(242, 201, 76, 255), outline=(210, 170, 40, 255))
draw.ellipse([(100, dot_y - 9), (118, dot_y + 9)], fill=(39, 174, 96, 255), outline=(30, 140, 70, 255))

# Tab
draw.rounded_rectangle([(150, 14), (600, HDR_H - 1)], radius=8, fill=(255, 255, 255, 255), outline=(209, 213, 219, 255))
draw.text((170, 26), tab_title[:45], font=FONT_TAB, fill=(55, 65, 81, 255))

# URL bar
clean_url = url_text.replace('https://', '')
draw.rounded_rectangle([(630, 18), (TOTAL_W - 50, HDR_H - 18)], radius=12, fill=(255, 255, 255, 255), outline=(209, 213, 219, 255))
draw.text((660, 28), f'https:// {clean_url}', font=FONT_URL, fill=(107, 114, 128, 255))

# Divider
draw.line([(0, HDR_H), (TOTAL_W, HDR_H)], fill=(209, 213, 219, 255), width=2)
# Content
canvas.paste(scaled_content, (2, HDR_H + 1), scaled_content)
# Border
draw.rectangle([(0, 0), (TOTAL_W - 1, TOTAL_H - 1)], outline=(180, 185, 192, 255), width=2)

final_img = canvas.convert('RGB')
final_img.save(out_path, dpi=(300, 300), quality=95)
print(f'Generated satellite mockup: {out_path} ({final_img.size})')

