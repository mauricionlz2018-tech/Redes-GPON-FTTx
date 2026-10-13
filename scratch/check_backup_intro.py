import docx

doc = docx.Document('docs/Documentacion_Residencias_avance_BACKUP_11OCT_PRE_REQ_TABLES.docx')
print("=== P0 A P30 EN BACKUP_11OCT_PRE_REQ_TABLES ===")
for i in range(30):
    p = doc.paragraphs[i]
    print(f"P{i} [{p.style.name}]: {p.text[:90]}")

print("\n=== P155 A P196 EN BACKUP_11OCT_PRE_REQ_TABLES ===")
for i in range(155, 196):
    p = doc.paragraphs[i]
    has_sp = bool(p._element.xpath('./w:pPr/w:sectPr'))
    print(f"P{i} [{p.style.name}, sectPr={has_sp}]: {p.text}")

