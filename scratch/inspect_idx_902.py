import docx

doc = docx.Document('docs/Documentacion_Residencias_avance.docx')
body = doc._body._element

for idx in range(898, 905):
    el = body[idx]
    tag = el.tag.split('}')[-1]
    if tag == 'p':
        p = docx.text.paragraph.Paragraph(el, doc)
        r_info = [(r.text, r.font.name, r.font.size.pt if r.font.size else None, r.bold, r.italic) for r in p.runs]
        print(f"Idx {idx} [P, style='{p.style.name}', align={p.alignment}]: {r_info}")
    elif tag == 'tbl':
        t = docx.table.Table(el, doc)
        print(f"Idx {idx} [TBL, style='{t.style.name}', rows={len(t.rows)}, cols={len(t.columns)}]")

