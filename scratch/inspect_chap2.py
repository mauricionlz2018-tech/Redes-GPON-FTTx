import docx

doc = docx.Document('docs/PORTADA_INSTITUCIONAL (3)_FINAL.docx')
for i in range(180, 440):
    p = doc.paragraphs[i]
    t = p.text.strip()
    xml = p._p.xml
    is_drawing = ('<w:drawing' in xml or '<w:pict' in xml)
    if is_drawing or t.startswith('Figura') or t.startswith('Tabla') or p.style.name.startswith('Heading'):
        print(f"[{i}] ({p.style.name}) [DRAWING={is_drawing}]: {t[:100]}")

