import docx

doc = docx.Document('docs/Documentacion_Residencias_avance.docx')
for i in range(111, 145):
    p = doc.paragraphs[i]
    has_sp = bool(p._element.xpath('./w:pPr/w:sectPr'))
    outline = p._element.xpath('./w:pPr/w:outlineLvl/@w:val')
    print(f"P{i} [sectPr={has_sp}, outline={outline}]: {p.text[:90]}")

