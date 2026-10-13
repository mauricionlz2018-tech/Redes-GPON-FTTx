import docx

doc_dev = docx.Document('docs/Documentacion_Desarrollo_Codificacion_y_Pruebas.docx')
for i in range(170, 185):
    p = doc_dev.paragraphs[i]
    print(f"P{i} [{p.style.name}]: '{p.text[:80]}'")

