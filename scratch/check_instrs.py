import docx

doc = docx.Document('docs/Documentacion_Residencias_avance.docx')
for i in range(160):
    p = doc.paragraphs[i]
    instrs = [el.text for el in p._element.xpath('.//w:instrText') if el.text]
    if instrs:
        print(f"P{i}: {instrs}")

