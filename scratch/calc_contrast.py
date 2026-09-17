def srgb_to_linear(c):
    c = c / 255.0
    return c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4

def relative_luminance(hex_str):
    hex_str = hex_str.lstrip('#')
    r = int(hex_str[0:2], 16)
    g = int(hex_str[2:4], 16)
    b = int(hex_str[4:6], 16)
    return 0.2126 * srgb_to_linear(r) + 0.7152 * srgb_to_linear(g) + 0.0722 * srgb_to_linear(b)

def contrast_ratio(hex1, hex2):
    l1 = relative_luminance(hex1)
    l2 = relative_luminance(hex2)
    lighter = max(l1, l2)
    darker = min(l1, l2)
    return (lighter + 0.05) / (darker + 0.05)

colors = [
    ('Primario Institucional', 'Azul Indigo Telecom', '#1E3A8A'),
    ('Acento Interactivo', 'Cian Tecnico', '#0284C7'),
    ('Estado Optimo / Libre', 'Verde Esmeralda', '#10B981'),
    ('Estado Preventivo / Alerta', 'Ambar Alerta', '#F59E0B'),
    ('Estado Critico / Danado', 'Rojo Carmesi', '#EF4444'),
    ('Perfil Administrador', 'Purpura RBAC', '#7C3AED'),
    ('Superficie Dark Mode', 'Pizarra Oscura', '#0F172A'),
]

white = '#FFFFFF'
dark = '#0F172A'

for rol, nom, hx in colors:
    cr_w = contrast_ratio(hx, white)
    cr_d = contrast_ratio(hx, dark)
    w_eval = 'Pasa AAA' if cr_w >= 7.0 else ('Pasa AA' if cr_w >= 4.5 else ('Pasa UI 3:1' if cr_w >= 3.0 else 'Falla texto'))
    d_eval = 'Pasa AAA' if cr_d >= 7.0 else ('Pasa AA' if cr_d >= 4.5 else ('Pasa UI 3:1' if cr_d >= 3.0 else 'Falla texto'))
    print(f"{rol:30} | {nom:20} | {hx:8} | vs Blanco: {cr_w:5.2f}:1 ({w_eval:12}) | vs Dark: {cr_d:5.2f}:1 ({d_eval:12})")

