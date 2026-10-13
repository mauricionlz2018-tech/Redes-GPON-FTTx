import docx

doc = docx.Document('docs/Documentacion_Residencias_avance.docx')

print("=== PRIMEROS 160 PÁRRAFOS DEL DOCUMENTO ACTUAL ===")
for i in range(min(165, len(doc.paragraphs))):
    p = doc.paragraphs[i]
    has_sp = bool(p._element.xpath('./w:pPr/w:sectPr'))
    print(f"P{i} [{p.style.name}, sectPr={has_sp}]: {p.text[:90]}")

