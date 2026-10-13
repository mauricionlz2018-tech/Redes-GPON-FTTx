import docx

doc_dev = docx.Document('docs/Documentacion_Desarrollo_Codificacion_y_Pruebas.docx')
for i, p in enumerate(doc_dev.paragraphs):
    draws = len(p._element.xpath('.//w:drawing'))
    t = p.text.strip()
    if draws > 0 or t.startswith('Figura ') or p.style.name == 'Figuras':
        print(f"P{i} [style={p.style.name}, drawings={draws}]: {t[:80]}")

