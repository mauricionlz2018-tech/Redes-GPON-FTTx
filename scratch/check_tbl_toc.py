import docx

doc = docx.Document('docs/Documentacion_Residencias_avance.docx')
body = doc._body._element

print("--- ÍNDICE DE TABLAS ACTUAL ---")
for i, p in enumerate(doc.paragraphs[:165]):
    if p.text.strip().startswith('Tabla ') or 'Índice de tablas' in p.text:
        print(f"P{i} [{p.style.name}]: {p.text}")

print("\n--- ELEMENTOS ALREDEDOR DE TABLA 1 (Body idx 220..226) ---")
for idx in range(220, 227):
    el = body[idx]
    tag = el.tag.split('}')[-1]
    if tag == 'p':
        p = docx.text.paragraph.Paragraph(el, doc)
        print(f"Idx {idx} [P, style={p.style.name}]: {p.text}")
    elif tag == 'tbl':
        print(f"Idx {idx} [TBL]")

print("\n--- ELEMENTOS ALREDEDOR DE TABLA 14 (Body idx 972..978) ---")
for idx in range(972, 979):
    el = body[idx]
    tag = el.tag.split('}')[-1]
    if tag == 'p':
        p = docx.text.paragraph.Paragraph(el, doc)
        print(f"Idx {idx} [P, style={p.style.name}]: {p.text[:80]}")
    elif tag == 'tbl':
        print(f"Idx {idx} [TBL]")

