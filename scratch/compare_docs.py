import docx

def inspect(path):
    print(f"=== {path} ===")
    doc = docx.Document(path)
    for i, s in enumerate(doc.sections):
        sp = s._sectPr
        hdrs = [(h.get('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}type'), h.get('{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id')) for h in sp.findall('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}headerReference')]
        ftrs = [(f.get('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}type'), f.get('{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id')) for f in sp.findall('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}footerReference')]
        print(f"Sec {i}: hdrs={hdrs}, ftrs={ftrs}")

inspect('docs/Documentacion_Residencias_avance.docx')
inspect('docs/Documentacion_Residencias_avance_BACKUP_08OCT_FINAL_PAG.docx')

