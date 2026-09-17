import docx

doc = docx.Document('docs/PORTADA_INSTITUCIONAL (3)_FINAL.docx')
print(f"Total paragraphs: {len(doc.paragraphs)}")
print(f"Total tables: {len(doc.tables)}")

figures = []
for i, p in enumerate(doc.paragraphs):
    xml = p._p.xml
    if '<w:drawing' in xml or '<w:pict' in xml:
        caption = ""
        # Check next 3 paragraphs for caption
        for offset in range(1, 4):
            if i + offset < len(doc.paragraphs):
                t = doc.paragraphs[i + offset].text.strip()
                if t.startswith("Figura") or t.startswith("figura"):
                    caption = t
                    break
        prev_text = doc.paragraphs[i - 1].text.strip() if i > 0 else ""
        figures.append((i, prev_text[:50], caption))

for p_idx, prev, cap in figures:
    print(f"P[{p_idx}]: cap='{cap}' | prev='{prev}'")

