import docx

doc = docx.Document('docs/Documentacion_Residencias_avance.docx')

for start, end in [(190, 208), (245, 255), (755, 765), (1195, 1210)]:
    print(f'=== Range {start} to {end} ===')
    for i in range(start, end):
        p = doc.paragraphs[i]
        txt = repr(p.text[:30])
        xml_flags = []
        if 'w:br' in p._element.xml: xml_flags.append('page_br')
        if 'pageBreakBefore' in p._element.xml: xml_flags.append('pb_before')
        if p._element.xpath('./w:pPr/w:sectPr'): xml_flags.append('sectPr')
        print(f'  P{i}: {txt} flags={xml_flags} style={p.style.name}')

