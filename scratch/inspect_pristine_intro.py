import docx

doc = docx.Document('docs/Documentacion_Residencias_avance_BACKUP_08OCT_FINAL_PAG.docx')
for i in range(160, 187):
    p = doc.paragraphs[i]
    outline = p._element.xpath('./w:pPr/w:outlineLvl/@w:val')
    pbb = bool(p._element.xpath('./w:pPr/w:pageBreakBefore'))
    print(f"P{i} [style={p.style.name}, outline={outline}, pbb={pbb}]: {p.text}")

