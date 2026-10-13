import docx

doc_main = docx.Document('docs/Documentacion_Residencias_avance.docx')
body_main = doc_main._body._element

cap4_idx = None
cap5_idx = None
for i, el in enumerate(body_main):
    tag = el.tag.split('}')[-1]
    if tag == 'p':
        txt = "".join(el.itertext()).strip()
        if 'CAPÍTULO IV' in txt and cap4_idx is None:
            cap4_idx = i
        elif 'CAPÍTULO V' in txt and cap5_idx is None:
            cap5_idx = i

print(f"body_main: cap4_idx={cap4_idx}, cap5_idx={cap5_idx}")
print(f"Total elements between cap4 and cap5: {cap5_idx - cap4_idx - 1}")
for k in range(cap4_idx, cap5_idx + 1):
    el = body_main[k]
    tag = el.tag.split('}')[-1]
    p_sp = bool(el.xpath('./w:pPr/w:sectPr'))
    txt = "".join(el.itertext()).strip()[:60]
    print(f"  [{k}] tag={tag}, sectPr={p_sp}: '{txt}'")

