import docx

doc_dev = docx.Document('docs/Documentacion_Desarrollo_Codificacion_y_Pruebas.docx')
body_dev = doc_dev._body._element

cap4_idx = None
cap5_idx = None
for i, el in enumerate(body_dev):
    tag = el.tag.split('}')[-1]
    if tag == 'p':
        txt = "".join(el.itertext()).strip()
        if 'CAPÍTULO IV' in txt and cap4_idx is None:
            cap4_idx = i
        elif 'CAPÍTULO V' in txt and cap5_idx is None:
            cap5_idx = i

print(f"body_dev: cap4_idx={cap4_idx}, cap5_idx={cap5_idx}")
print(f"Total elements between cap4 and cap5: {cap5_idx - cap4_idx - 1}")

tags_found = {}
for i in range(cap4_idx + 1, cap5_idx):
    el = body_dev[i]
    tag = el.tag.split('}')[-1]
    tags_found[tag] = tags_found.get(tag, 0) + 1

print(f"Tags found: {tags_found}")

