import docx

doc = docx.Document('docs/PORTADA_INSTITUCIONAL (3)_FINAL.docx')
headings = []
for i, p in enumerate(doc.paragraphs):
    t = p.text.strip()
    if p.style.name.startswith("Heading 1") or p.style.name.startswith("Heading 2") or p.style.name.startswith("Heading 3"):
        headings.append((i, p.style.name, t))
    elif any(k in t.upper() for k in ["CAPÍTULO", "CAPITULO", "CONCLUSIONES", "REFERENCIAS"]):
        headings.append((i, p.style.name, t))

for idx, style, h in headings:
    if idx >= 430:
        print(f"P[{idx:3d}] ({style}): '{h[:70]}'")

