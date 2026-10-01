from PIL import Image
import os

images = [
    ("docs/Captura de pantalla 2026-09-02 120826.png", "GitHub Repository"),
    ("docs/Captura de pantalla 2026-09-02 123530.png", "Git Clone"),
    ("C:/Users/karen/.gemini/antigravity/brain/a33b5b22-c89b-4ff3-a6cc-733a0c69ceac/.user_uploaded/media_1790787574703.png", "Folder Redes-Mapeo"),
    ("C:/Users/karen/.gemini/antigravity/brain/a33b5b22-c89b-4ff3-a6cc-733a0c69ceac/.user_uploaded/media_1790788319938.png", "Folder backend"),
    ("C:/Users/karen/.gemini/antigravity/brain/a33b5b22-c89b-4ff3-a6cc-733a0c69ceac/.user_uploaded/media_1790787698995.png", "pnpm init command"),
    ("docs/Captura de pantalla 2026-09-02 123557.png", "package.json"),
    ("C:/Users/karen/.gemini/antigravity/brain/a33b5b22-c89b-4ff3-a6cc-733a0c69ceac/.user_uploaded/media_1790787639367.png", "pnpm add command"),
    ("docs/Captura de pantalla 2026-09-02 123632.png", "pnpm add output"),
    ("C:/Users/karen/.gemini/antigravity/brain/a33b5b22-c89b-4ff3-a6cc-733a0c69ceac/.user_uploaded/media_1790787973663.png", "pnpm add -D command"),
    ("docs/Captura de pantalla 2026-09-02 123741.png", "pnpm add -D output"),
]

for p, desc in images:
    if os.path.exists(p):
        im = Image.open(p)
        print(f"{desc:25} | Size: {im.size} | Mode: {im.mode} | Path: {p}")
    else:
        print(f"NOT FOUND: {p}")

