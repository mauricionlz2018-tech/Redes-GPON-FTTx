import docx

doc_dev = docx.Document('docs/Documentacion_Desarrollo_Codificacion_y_Pruebas.docx')
body_dev = doc_dev._body._element

for k in range(220, len(body_dev)):
    el = body_dev[k]
    tag = el.tag.split('}')[-1]
    txt = "".join(el.itertext()).strip()
    print(f"[{k}] tag={tag}: '{txt[:50]}'")

