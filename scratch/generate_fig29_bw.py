from PIL import Image, ImageDraw, ImageFont

W, H = 2500, 1150
img = Image.new('RGB', (W, H), (255, 255, 255))
draw = ImageDraw.Draw(img)

font_head = ImageFont.truetype('C:/Windows/Fonts/arialbd.ttf', 20)
font_text = ImageFont.truetype('C:/Windows/Fonts/arial.ttf', 16)
font_lbl = ImageFont.truetype('C:/Windows/Fonts/arialbd.ttf', 15)

bw, bh = 390, 480
y_top = 60
gap = 210
c_xs = [60 + i * (bw + gap) for i in range(4)]

box5_x = c_xs[3]
box5_y = 600
box5_h = 460

boxes_data = [
    ('1. Cabecera Central (NOC)', [
        '• OLT Huawei MA5608T',
        '• 8 puertos PON, SFP Clase B+ (G.984.2)',
        '• TX: 1490 nm, +4.5 dBm (rango +1.5 a +5.0 dBm)',
        '• RX: 1310 nm, sensibilidad -28 dBm',
        '• ODF central 48 puertos (rack 19 pulg)'
    ]),
    ('2. Red Troncal Primaria', [
        '• Cable ADSS 24 hilos monomodo',
        '• Norma ITU-T G.652.D',
        '• Cubierta HDPE (protección UV y descargas',
        '  atmosféricas)',
        '• Tendido aéreo en postería de concreto CFE'
    ]),
    ('3. División Primaria (Splitter 1:4)', [
        '• Mufa hermética tipo domo (en poste)',
        '• Divisor óptico PLC balanceado 1:4',
        '• Pérdida de inserción teórica: 6.02 dB',
        '• Pérdida real (con conectores): 7.25 dB'
    ]),
    ('4. Caja NAP (Splitter 1:16)', [
        '• Instalada en centro de carga del cuadrante',
        '• Divisor secundario PLC 1:16',
        '• 16 salidas SC-APC en chasis frontal',
        '• División total acumulada: 1:64 (4 x 16)'
    ]),
    ('5. Acometida (Fibra Drop) + ONT', [
        '• Cable Drop monomodo ITU-T G.657.A2',
        '• Radio de curvatura admisible: hasta 7.5 mm',
        '• Conectores SC-APC pre-pulidos de fábrica',
        '• Pérdida de retorno: > 60 dB',
        '• Terminación: ONT en la vivienda del suscriptor'
    ])
]

# Draw first 4 boxes
for i in range(4):
    x0 = c_xs[i]
    y0 = y_top
    x1 = x0 + bw
    y1 = y0 + bh
    draw.rectangle([(x0, y0), (x1, y1)], fill=(255, 255, 255), outline=(0, 0, 0), width=3)
    # Header bar
    h_bar_h = 55
    draw.rectangle([(x0, y0), (x1, y0 + h_bar_h)], fill=(245, 245, 245), outline=(0, 0, 0), width=2)
    draw.text(((x0 + x1)//2, y0 + h_bar_h//2), boxes_data[i][0], font=font_head, fill=(0, 0, 0), anchor='mm')
    # Bullets
    ty = y0 + h_bar_h + 25
    for ln in boxes_data[i][1]:
        draw.text((x0 + 20, ty), ln, font=font_text, fill=(0, 0, 0))
        ty += 28

# Draw Box 5
x0_5 = box5_x
y0_5 = box5_y
x1_5 = x0_5 + bw
y1_5 = y0_5 + box5_h
draw.rectangle([(x0_5, y0_5), (x1_5, y1_5)], fill=(255, 255, 255), outline=(0, 0, 0), width=3)
draw.rectangle([(x0_5, y0_5), (x1_5, y0_5 + 55)], fill=(245, 245, 245), outline=(0, 0, 0), width=2)
draw.text(((x0_5 + x1_5)//2, y0_5 + 27), boxes_data[4][0], font=font_head, fill=(0, 0, 0), anchor='mm')
ty5 = y0_5 + 55 + 25
for ln in boxes_data[4][1]:
    draw.text((x0_5 + 20, ty5), ln, font=font_text, fill=(0, 0, 0))
    ty5 += 28

# Arrows
arrow_labels = [
    'Latiguillos\nSC-APC / ODF',
    'Cable ADSS\nG.652.D',
    'Fusión en\nMufa'
]

for i in range(3):
    x_from = c_xs[i] + bw
    x_to = c_xs[i+1]
    y_arrow = y_top + 140
    draw.line([(x_from, y_arrow), (x_to, y_arrow)], fill=(0, 0, 0), width=3)
    draw.polygon([(x_to, y_arrow), (x_to - 14, y_arrow - 7), (x_to - 14, y_arrow + 7)], fill=(0, 0, 0))
    draw.text(((x_from + x_to)//2, y_arrow - 28), arrow_labels[i], font=font_lbl, fill=(0, 0, 0), anchor='mm')

# 4 -> 5 (Vertical Arrow)
mid_x_45 = c_xs[3] + bw // 2
draw.line([(mid_x_45, y_top + bh), (mid_x_45, box5_y)], fill=(0, 0, 0), width=3)
draw.polygon([(mid_x_45, box5_y), (mid_x_45 - 7, box5_y - 14), (mid_x_45 + 7, box5_y - 14)], fill=(0, 0, 0))
draw.text((mid_x_45 - 20, (y_top + bh + box5_y)//2), 'Drop\nG.657.A2', font=font_lbl, fill=(0, 0, 0), anchor='rm')

img.save('scratch/fig_29_bw_vector.png', quality=95)
print('Generated scratch/fig_29_bw_vector.png')

