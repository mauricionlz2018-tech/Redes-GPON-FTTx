import os
import shutil
import docx

os.makedirs('scratch/figures_named', exist_ok=True)
doc = docx.Document('docs/PORTADA_INSTITUCIONAL (3)_FINAL.docx')

# Build mapping from media/imageX.png to file on disk
media_to_path = {}
for rel in doc.part.rels.values():
    if "image" in rel.target_ref:
        img_part = rel.target_part
        target = rel.target_ref # e.g. media/image5.png
        # write directly to figures_named
        base = os.path.basename(target)
        out_path = os.path.join('scratch/figures_named', base)
        with open(out_path, 'wb') as f:
            f.write(img_part.blob)
        media_to_path[target] = out_path

print("Saved all extracted images to scratch/figures_named/")
print(f"Total: {len(media_to_path)}")

