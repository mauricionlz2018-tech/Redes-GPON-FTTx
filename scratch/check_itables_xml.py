import docx

doc = docx.Document('docs/Documentacion_Residencias_avance.docx')
for i in [74, 76, 77, 104]:
    print(f"=== P{i} ===")
    print(doc.paragraphs[i]._element.xml[:600])

