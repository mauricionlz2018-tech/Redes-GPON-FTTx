import docx

doc = docx.Document('docs/Documentacion_Residencias_avance_BACKUP_08OCT_FINAL_PAG.docx')
print("--- RELS EN DOCUMENT.XML.RELS ---")
for rel_id, rel in doc.part.rels.items():
    if 'header' in rel.target_ref or 'footer' in rel.target_ref:
        print(f"{rel_id}: {rel.target_ref}")

print("\n--- SECTIONS CURRENTLY DETECTED BY PYTHON-DOCX ---")
for i, s in enumerate(doc.sections):
    print(f"Sec {i}: start_type={s.start_type}, different_first_page_header_footer={s.different_first_page_header_footer}")

