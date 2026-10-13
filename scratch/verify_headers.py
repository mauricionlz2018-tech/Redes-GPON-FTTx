import docx

doc = docx.Document('docs/Documentacion_Residencias_avance.docx')

print(f"Total secciones: {len(doc.sections)}")
for i, sec in enumerate(doc.sections):
    sp = sec._sectPr
    hdrs = [(h.get('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}type'), h.get('{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id')) for h in sp.findall('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}headerReference')]
    ftrs = [(f.get('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}type'), f.get('{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id')) for f in sp.findall('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}footerReference')]
    titlePg = len(sp.findall('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}titlePg'))
    h_draw = len(sec.header._element.xpath('.//w:drawing'))
    print(f"Sec {i}: titlePg={titlePg} | header_drawings={h_draw}")
