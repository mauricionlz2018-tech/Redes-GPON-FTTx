from PIL import Image, ImageDraw, ImageFont
import os

os.makedirs("docs/desarrollo_setup", exist_ok=True)

# 1. Composite for Directory Structure (media_1790787574703 + media_1790788319938)
def create_dir_composite():
    img_root = Image.open("C:/Users/karen/.gemini/antigravity/brain/a33b5b22-c89b-4ff3-a6cc-733a0c69ceac/.user_uploaded/media_1790787574703.png")
    img_backend = Image.open("C:/Users/karen/.gemini/antigravity/brain/a33b5b22-c89b-4ff3-a6cc-733a0c69ceac/.user_uploaded/media_1790788319938.png")
    
    # We will build a clean canvas representing the project directory tree
    # Background: modern dark/light card or explorer window
    w, h = 1000, 320
    canvas = Image.new("RGBA", (w, h), (245, 247, 250, 255))
    draw = ImageDraw.Draw(canvas)
    
    # Border
    draw.rounded_rectangle([10, 10, w - 10, h - 10], radius=12, fill=(255, 255, 255, 255), outline=(218, 225, 233, 255), width=2)
    # Header bar
    draw.rounded_rectangle([10, 10, w - 10, 50], radius=12, fill=(240, 244, 248, 255))
    draw.rectangle([10, 35, w - 10, 50], fill=(240, 244, 248, 255))
    draw.line([(10, 50), (w - 10, 50)], fill=(218, 225, 233, 255), width=1)
    
    # Three window dots
    draw.ellipse([25, 24, 37, 36], fill=(255, 95, 87, 255))
    draw.ellipse([45, 24, 57, 36], fill=(254, 188, 46, 255))
    draw.ellipse([65, 24, 77, 36], fill=(40, 200, 64, 255))
    
    # Paste Root folder on the left
    # Resize root slightly if needed or paste directly
    canvas.paste(img_root, (60, 90), img_root if img_root.mode == 'RGBA' else None)
    
    # Arrow or tree branch
    draw.line([(260, 170), (450, 170)], fill=(120, 140, 160, 255), width=3)
    draw.polygon([(450, 163), (465, 170), (450, 177)], fill=(120, 140, 160, 255))
    
    # Paste Backend folder on the right
    # Scale backend folder for visibility
    scale_factor = 2.0
    bw = int(img_backend.width * scale_factor)
    bh = int(img_backend.height * scale_factor)
    img_backend_scaled = img_backend.resize((bw, bh), Image.Resampling.LANCZOS)
    canvas.paste(img_backend_scaled, (500, 140), img_backend_scaled if img_backend_scaled.mode == 'RGBA' else None)
    
    out_path = "docs/desarrollo_setup/setup_03_directorios_proyecto.png"
    canvas.save(out_path, dpi=(300, 300))
    print(f"Created: {out_path} ({canvas.size})")

# 2. Composite for pnpm init + package.json (media_1790787698995 + Captura 123557)
def create_pnpm_init_composite():
    img_cmd = Image.open("C:/Users/karen/.gemini/antigravity/brain/a33b5b22-c89b-4ff3-a6cc-733a0c69ceac/.user_uploaded/media_1790787698995.png")
    img_pkg = Image.open("docs/Captura de pantalla 2026-09-02 123557.png")
    
    # Terminal width
    term_w = 900
    # Command bar height ~70, pkg height ~pkg.height + 40
    term_h = img_cmd.height + img_pkg.height + 100
    
    canvas = Image.new("RGBA", (term_w, term_h), (18, 18, 20, 255))
    draw = ImageDraw.Draw(canvas)
    
    # Terminal top bar
    draw.rectangle([0, 0, term_w, 40], fill=(35, 35, 40, 255))
    draw.ellipse([15, 14, 27, 26], fill=(255, 95, 87, 255))
    draw.ellipse([35, 14, 47, 26], fill=(254, 188, 46, 255))
    draw.ellipse([55, 14, 67, 26], fill=(40, 200, 64, 255))
    
    # Paste command
    canvas.paste(img_cmd, (30, 55), img_cmd if img_cmd.mode == 'RGBA' else None)
    
    # Divider line
    draw.line([(30, 55 + img_cmd.height + 10), (term_w - 30, 55 + img_cmd.height + 10)], fill=(50, 50, 55, 255), width=1)
    
    # Paste package.json below
    canvas.paste(img_pkg, (30, 55 + img_cmd.height + 25), img_pkg if img_pkg.mode == 'RGBA' else None)
    
    out_path = "docs/desarrollo_setup/setup_04_pnpm_init_package_json.png"
    canvas.save(out_path, dpi=(300, 300))
    print(f"Created: {out_path} ({canvas.size})")

# 3. Composite for Production Dependencies (media_1790787639367 + Captura 123632)
def create_prod_deps_composite():
    img_cmd = Image.open("C:/Users/karen/.gemini/antigravity/brain/a33b5b22-c89b-4ff3-a6cc-733a0c69ceac/.user_uploaded/media_1790787639367.png")
    img_out = Image.open("docs/Captura de pantalla 2026-09-02 123632.png")
    
    # Output width is 1347. Let's make canvas width 1347 + 40
    term_w = max(img_cmd.width + 80, img_out.width + 40)
    term_h = img_cmd.height + img_out.height + 80
    
    canvas = Image.new("RGBA", (term_w, term_h), (18, 18, 20, 255))
    draw = ImageDraw.Draw(canvas)
    
    # Terminal top bar
    draw.rectangle([0, 0, term_w, 40], fill=(35, 35, 40, 255))
    draw.ellipse([15, 14, 27, 26], fill=(255, 95, 87, 255))
    draw.ellipse([35, 14, 47, 26], fill=(254, 188, 46, 255))
    draw.ellipse([55, 14, 67, 26], fill=(40, 200, 64, 255))
    
    # Paste command at top
    canvas.paste(img_cmd, (20, 50), img_cmd if img_cmd.mode == 'RGBA' else None)
    
    # Paste output directly below
    canvas.paste(img_out, (20, 50 + img_cmd.height + 10), img_out if img_out.mode == 'RGBA' else None)
    
    out_path = "docs/desarrollo_setup/setup_05_dependencias_produccion.png"
    canvas.save(out_path, dpi=(300, 300))
    print(f"Created: {out_path} ({canvas.size})")

# 4. Composite for Dev Dependencies (media_1790787973663 + Captura 123741)
def create_dev_deps_composite():
    img_cmd = Image.open("C:/Users/karen/.gemini/antigravity/brain/a33b5b22-c89b-4ff3-a6cc-733a0c69ceac/.user_uploaded/media_1790787973663.png")
    img_out = Image.open("docs/Captura de pantalla 2026-09-02 123741.png")
    
    term_w = max(img_cmd.width + 80, img_out.width + 40)
    term_h = img_cmd.height + img_out.height + 80
    
    canvas = Image.new("RGBA", (term_w, term_h), (18, 18, 20, 255))
    draw = ImageDraw.Draw(canvas)
    
    # Terminal top bar
    draw.rectangle([0, 0, term_w, 40], fill=(35, 35, 40, 255))
    draw.ellipse([15, 14, 27, 26], fill=(255, 95, 87, 255))
    draw.ellipse([35, 14, 47, 26], fill=(254, 188, 46, 255))
    draw.ellipse([55, 14, 67, 26], fill=(40, 200, 64, 255))
    
    # Paste command at top
    canvas.paste(img_cmd, (20, 50), img_cmd if img_cmd.mode == 'RGBA' else None)
    
    # Paste output directly below
    canvas.paste(img_out, (20, 50 + img_cmd.height + 10), img_out if img_out.mode == 'RGBA' else None)
    
    out_path = "docs/desarrollo_setup/setup_06_dependencias_desarrollo.png"
    canvas.save(out_path, dpi=(300, 300))
    print(f"Created: {out_path} ({canvas.size})")

if __name__ == "__main__":
    create_dir_composite()
    create_pnpm_init_composite()
    create_prod_deps_composite()
    create_dev_deps_composite()
    print("All composites generated successfully!")

