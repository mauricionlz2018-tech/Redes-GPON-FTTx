import docx

doc_dev = docx.Document('docs/Documentacion_Desarrollo_Codificacion_y_Pruebas.docx')
body_dev = doc_dev._body._element

for i, el in enumerate(body_dev):
    tag = el.tag.split('}')[-1]
    if tag == 'tbl':
        prev1 = body_dev[i-1]
        prev2 = body_dev[i-2]
        next1 = body_dev[i+1]
        print(f"TBL at index {i}:")
        print(f"  prev2: '{''.join(prev2.itertext()).strip()}'")
        print(f"  prev1: '{''.join(prev1.itertext()).strip()}'")
        print(f"  next1: '{''.join(next1.itertext()).strip()}'")

