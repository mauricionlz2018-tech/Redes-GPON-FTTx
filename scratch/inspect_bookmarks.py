import docx

doc = docx.Document('docs/Documentacion_Residencias_avance.docx')
bms = doc._body._element.xpath('.//w:bookmarkStart')
print(f'Total bookmarks: {len(bms)}')
max_id = 0
toc_names = []
for bm in bms:
    bid = int(bm.attrib.get('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}id', 0))
    bname = bm.attrib.get('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}name', '')
    if bid > max_id:
        max_id = bid
    if bname.startswith('_Toc'):
        toc_names.append((bid, bname))

print(f'Max bookmark ID: {max_id}')
print(f'TOC bookmarks count: {len(toc_names)}')
print('First 5:', toc_names[:5])
print('Last 5:', toc_names[-5:])

