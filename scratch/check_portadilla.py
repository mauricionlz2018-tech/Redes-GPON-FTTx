import docx

doc = docx.Document('docs/Documentacion_Residencias_avance_BACKUP_08OCT_FINAL_PAG.docx')

for i in range(195, 207):
    p = doc.paragraphs[i]
    brs = p._element.xpath('.//w:br')
    print(f"P{i}: len_runs={len(p.runs)}, brs={len(brs)}, text='{p.text}'")

