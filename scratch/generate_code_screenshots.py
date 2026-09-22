import os
from PIL import Image, ImageDraw, ImageFont
from pygments.lexers import TypeScriptLexer
from pygments.token import Token

def render_code_to_image(code_text, filename_title, output_path, start_line_num=1, max_lines=45):
    # Remove emojis and unprintable glyphs
    for emoji_char in ['✔', '🚀', '📡', '❌', '💡']:
        code_text = code_text.replace(emoji_char, '')
    # Split into lines
    raw_lines = code_text.splitlines()[:max_lines]
    
    # Setup fonts
    font_size = 20
    font_code = ImageFont.truetype("C:/Windows/Fonts/consola.ttf", font_size)
    font_code_bold = ImageFont.truetype("C:/Windows/Fonts/consolab.ttf", font_size)
    font_tab = ImageFont.truetype("C:/Windows/Fonts/segoeui.ttf", 18)
    font_gutter = ImageFont.truetype("C:/Windows/Fonts/consola.ttf", 18)

    # Line height & gutter width
    line_h = 30
    gutter_w = 75
    padding_x = 25
    header_h = 45

    # Measure max line length
    max_w = 0
    for line in raw_lines:
        bbox = font_code.getbbox(line)
        w = bbox[2] - bbox[0]
        if w > max_w:
            max_w = w

    img_w = max(1100, max_w + gutter_w + padding_x * 2 + 50)
    img_h = header_h + len(raw_lines) * line_h + 35

    # Create base image (VS Code Dark Theme: #1E1E1E)
    img = Image.new('RGB', (img_w, img_h), (30, 30, 30))
    draw = ImageDraw.Draw(img)

    # Window Header (#252526)
    draw.rectangle([(0, 0), (img_w, header_h)], fill=(37, 37, 38))
    # Window border
    draw.rectangle([(0, 0), (img_w - 1, img_h - 1)], outline=(60, 60, 60), width=1)

    # Mac-style 3 dots
    draw.ellipse([(16, 16), (28, 28)], fill=(255, 95, 86))   # Red
    draw.ellipse([(36, 16), (48, 28)], fill=(255, 189, 46))  # Yellow
    draw.ellipse([(56, 16), (68, 28)], fill=(39, 201, 63))   # Green

    # Active Tab (#1E1E1E)
    tab_w = font_tab.getbbox(filename_title)[2] + 65
    draw.rectangle([(90, 8), (90 + tab_w, header_h)], fill=(30, 30, 30))
    # Blue line on top of active tab
    draw.line([(90, 8), (90 + tab_w, 8)], fill=(0, 122, 204), width=3)
    # TS icon badge
    draw.rectangle([(102, 16), (122, 34)], fill=(49, 120, 198))
    draw.text((105, 16), "TS", font=ImageFont.truetype("C:/Windows/Fonts/arialbd.ttf", 13), fill=(255, 255, 255))
    # Tab filename
    draw.text((132, 14), filename_title, font=font_tab, fill=(230, 230, 230))

    # Gutter separator line (#333333)
    draw.line([(gutter_w, header_h), (gutter_w, img_h)], fill=(51, 51, 51), width=1)

    # Lexer setup
    lexer = TypeScriptLexer()

    # Token Color Palette (VS Code Dark Modern)
    COLOR_MAP = {
        Token.Keyword: (86, 156, 214),             # #569CD6 Keyword Blue
        Token.Keyword.Constant: (86, 156, 214),
        Token.Keyword.Declaration: (86, 156, 214),
        Token.Keyword.Reserved: (197, 134, 192),    # #C586C0 Control Flow Purple (import, export, from, return)
        Token.Keyword.Type: (78, 201, 176),         # #4EC9B0 Type Teal
        Token.Name.Class: (78, 201, 176),
        Token.Name.Function: (220, 220, 170),       # #DCDCAA Function Yellow
        Token.Name.Builtin: (78, 201, 176),
        Token.Name.Other: (156, 220, 254),          # #9CDCFE Variable Light Blue
        Token.Literal.String: (206, 145, 120),      # #CE9178 String Orange
        Token.Literal.String.Single: (206, 145, 120),
        Token.Literal.String.Double: (206, 145, 120),
        Token.Literal.Number: (181, 206, 168),      # #B5CEA8 Number Light Green
        Token.Literal.Number.Integer: (181, 206, 168),
        Token.Comment: (106, 153, 85),              # #6A9955 Comment Green
        Token.Comment.Single: (106, 153, 85),
        Token.Comment.Multiline: (106, 153, 85),
        Token.Operator: (212, 212, 212),            # #D4D4D4 Gray
        Token.Punctuation: (212, 212, 212),
        Token.Text: (212, 212, 212),
    }

    # Render line by line
    for idx, line in enumerate(raw_lines):
        line_num = start_line_num + idx
        y_pos = header_h + 12 + idx * line_h

        # Line number in gutter
        draw.text((gutter_w - 18, y_pos), str(line_num), font=font_gutter, fill=(133, 133, 133), anchor="rt")

        # Tokens in line
        tokens = list(lexer.get_tokens(line))
        x_pos = gutter_w + padding_x

        for tok_type, tok_val in tokens:
            # Clean up newline token at end
            tok_val = tok_val.replace("\r", "").replace("\n", "")
            if not tok_val:
                continue

            # Pick color by searching token hierarchy
            col = (212, 212, 212)
            cur = tok_type
            while cur:
                if cur in COLOR_MAP:
                    col = COLOR_MAP[cur]
                    break
                cur = cur.parent

            # Refinements for specific TypeScript keywords
            if tok_val in ['import', 'export', 'from', 'return', 'async', 'await', 'if', 'else', 'try', 'catch', 'throw']:
                col = (197, 134, 192) # Purple
            elif tok_val in ['const', 'let', 'var', 'function', 'class', 'interface', 'type', 'new']:
                col = (86, 156, 214)  # Blue
            elif tok_val in ['true', 'false', 'null', 'undefined']:
                col = (86, 156, 214)  # Blue
            elif tok_val in ['Request', 'Response', 'Transaction', 'Router', 'NextFunction', 'NapPort', 'Client', 'NapBox', 'OdfPanel', 'Table', 'Dexie']:
                col = (78, 201, 176)  # Teal Type

            draw.text((x_pos, y_pos), tok_val, font=font_code, fill=col)
            # Advance x_pos
            bbox = font_code.getbbox(tok_val)
            w = bbox[2] - bbox[0]
            x_pos += w

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    img.save(output_path, quality=95)
    print(f"Rendered code screenshot saved to: {output_path} ({img_w}x{img_h})")

def generate_all_screenshots():
    # 1. portController.ts
    with open('backend/src/controllers/portController.ts', 'r', encoding='utf-8') as f:
        port_lines = f.readlines()
    # Lines 1 to 52 (Zod schema + ACID Lock transaction)
    code_port = "".join(port_lines[:52])
    render_code_to_image(code_port, "portController.ts - Concurrencia ACID y Bloqueo Pesimista", "docs/code_portController.png", start_line_num=1, max_lines=52)

    # 2. api.ts (Routes)
    with open('backend/src/routes/api.ts', 'r', encoding='utf-8') as f:
        api_lines = f.readlines()
    # Lines 1 to 60 (Rutas, authenticateToken, requireRoles)
    code_api = "".join(api_lines[:60])
    render_code_to_image(code_api, "api.ts - Rutas REST con Middlewares JWT y Roles RBAC", "docs/code_api_routes.png", start_line_num=1, max_lines=60)

    # 3. index.ts (Server Bootstrap)
    with open('backend/src/index.ts', 'r', encoding='utf-8') as f:
        index_lines = f.readlines()
    # Lines 1 to 56
    code_index = "".join(index_lines[:56])
    render_code_to_image(code_index, "index.ts - Inicialización del Servidor Express y Conexión PostgreSQL", "docs/code_index_server.png", start_line_num=1, max_lines=56)

    # 4. offlineDb.ts (Dexie.js Offline DB)
    with open('frontend/src/db/offlineDb.ts', 'r', encoding='utf-8') as f:
        offline_code = f.read()
    render_code_to_image(offline_code, "offlineDb.ts - Esquema de Base de Datos Local IndexedDB con Dexie.js", "docs/code_offline_db.png", start_line_num=1, max_lines=30)

    # 5. client.ts (Frontend Axios Interceptor)
    with open('frontend/src/api/client.ts', 'r', encoding='utf-8') as f:
        client_code = f.read()
    render_code_to_image(client_code, "client.ts - Cliente Axios e Inyección Automática de Bearer Token", "docs/code_frontend_client.png", start_line_num=1, max_lines=42)

if __name__ == "__main__":
    generate_all_screenshots()
