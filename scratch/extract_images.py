import docx
import os

doc = docx.Document('docs/PORTADA_INSTITUCIONAL (3)_FINAL.docx')
os.makedirs('scratch/extracted_images', exist_ok=True)

count = 0
for rel in doc.part.rels.values():
    if "image" in rel.target_ref:
        img_part = rel.target_part
        ext = os.path.splitext(rel.target_ref)[1]
        filename = f"image_{count:02d}{ext}"
        filepath = os.path.join('scratch/extracted_images', filename)
        with open(filepath, 'wb') as f:
            f.write(img_part.blob)
        print(f"Extracted {rel.target_ref} -> {filepath} ({len(img_part.blob)} bytes)")
        count += 1

print(f"Total extracted images: {count}")

