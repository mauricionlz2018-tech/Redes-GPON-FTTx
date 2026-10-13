import docx

doc = docx.Document('docs/Documentacion_Residencias_avance.docx')
body = doc._body._element

for idx, child in enumerate(body):
    tag = child.tag.split('}')[-1]
    if tag == 'tbl':
        # check previous 2 and next 2 siblings
        prev_el = child.getprevious()
        next_el = child.getnext()
        next2_el = next_el.getnext() if next_el is not None else None
        p_txt = "".join(prev_el.itertext()).strip()[:60] if prev_el is not None else ""
        n_txt = "".join(next_el.itertext()).strip()[:60] if next_el is not None else ""
        n2_txt = "".join(next2_el.itertext()).strip()[:60] if next2_el is not None else ""
        print(f"Body idx {idx} [TABLE]: prev='{p_txt}' | next='{n_txt}' | next2='{n2_txt}'")

