import docx, re

doc = docx.Document('docs/Documentacion_Residencias_avance.docx')
for i, p in enumerate(doc.paragraphs[105:], start=105):
    txt = p.text.strip()
    if re.match(r'^Figura\s+\d+\.', txt):
        bms = p._p.xpath('.//w:bookmarkStart')
        bm_names = [bm.attrib.get('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}name') for bm in bms]
        print(f'P[{i}]: {txt[:50]} | bookmarks: {bm_names}')

