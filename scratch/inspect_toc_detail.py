import docx

doc = docx.Document('docs/Documentacion_Residencias_avance.docx')
for i in range(9, 25):
    p = doc.paragraphs[i]
    hl = p._p.xpath('.//w:hyperlink')
    if hl:
        anchor = hl[0].attrib.get('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}anchor')
        t_nodes = [t.text for t in p._p.xpath('.//w:t') if t.text]
        print(f'P[{i}]: anchor={anchor}, text={t_nodes}')

