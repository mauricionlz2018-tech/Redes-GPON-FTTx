from PIL import Image, ImageDraw

def enhance_git_clone():
    img = Image.open("docs/Captura de pantalla 2026-09-02 123530.png")
    w = max(img.width + 40, 900)
    h = img.height + 60
    
    canvas = Image.new("RGBA", (w, h), (18, 18, 20, 255))
    draw = ImageDraw.Draw(canvas)
    
    # Terminal top bar
    draw.rectangle([0, 0, w, 35], fill=(35, 35, 40, 255))
    draw.ellipse([15, 12, 27, 24], fill=(255, 95, 87, 255))
    draw.ellipse([35, 12, 47, 24], fill=(254, 188, 46, 255))
    draw.ellipse([55, 12, 67, 24], fill=(40, 200, 64, 255))
    
    canvas.paste(img, (20, 45), img if img.mode == 'RGBA' else None)
    out_path = "docs/desarrollo_setup/setup_02_git_clone.png"
    canvas.save(out_path, dpi=(300, 300))
    print(f"Created {out_path} ({canvas.size})")

def enhance_dir_structure():
    img_root = Image.open("C:/Users/karen/.gemini/antigravity/brain/a33b5b22-c89b-4ff3-a6cc-733a0c69ceac/.user_uploaded/media_1790787574703.png")
    img_backend = Image.open("C:/Users/karen/.gemini/antigravity/brain/a33b5b22-c89b-4ff3-a6cc-733a0c69ceac/.user_uploaded/media_1790788319938.png")
    
    w, h = 950, 260
    canvas = Image.new("RGBA", (w, h), (255, 255, 255, 255))
    draw = ImageDraw.Draw(canvas)
    
    # Outer card
    draw.rounded_rectangle([5, 5, w - 5, h - 5], radius=10, fill=(248, 250, 252, 255), outline=(226, 232, 240, 255), width=2)
    # Header bar
    draw.rounded_rectangle([5, 5, w - 5, 40], radius=10, fill=(241, 245, 249, 255))
    draw.rectangle([5, 25, w - 5, 40], fill=(241, 245, 249, 255))
    draw.line([(5, 40), (w - 5, 40)], fill=(226, 232, 240, 255), width=1)
    
    # Dots
    draw.ellipse([20, 15, 30, 25], fill=(255, 95, 87, 255))
    draw.ellipse([38, 15, 48, 25], fill=(254, 188, 46, 255))
    draw.ellipse([56, 15, 66, 25], fill=(40, 200, 64, 255))
    
    # Explorer title simulation
    # Place root folder on left
    canvas.paste(img_root, (70, 65), img_root if img_root.mode == 'RGBA' else None)
    
    # Hierarchy connection line
    draw.line([(280, 145), (460, 145)], fill=(100, 116, 139, 255), width=3)
    draw.polygon([(460, 137), (475, 145), (460, 153)], fill=(100, 116, 139, 255))
    
    # Scale backend folder icon
    scale = 2.2
    bw = int(img_backend.width * scale)
    bh = int(img_backend.height * scale)
    img_b_scaled = img_backend.resize((bw, bh), Image.Resampling.LANCZOS)
    canvas.paste(img_b_scaled, (510, 110), img_b_scaled if img_b_scaled.mode == 'RGBA' else None)
    
    out_path = "docs/desarrollo_setup/setup_03_directorios_proyecto.png"
    canvas.save(out_path, dpi=(300, 300))
    print(f"Created {out_path} ({canvas.size})")

enhance_git_clone()
enhance_dir_structure()

