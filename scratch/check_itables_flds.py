import docx

doc = docx.Document('docs/Documentacion_Residencias_avance.docx')
for i in range(74, 106):
    p = doc.paragraphs[i]
    flds = p._element.xpath('.//w:fldChar | .//w:instrText | .//w:fldSimple')
    print(f"P{i} [{p.style.name}, flds={len(flds)}]: {p.text}")

