import docx

doc = docx.Document('docs/PORTADA_INSTITUCIONAL (3)_PRE_RESTRUCTURE.docx')
for i in range(150, 156):
    p = doc.paragraphs[i]
    print(f"P[{i}]: style='{p.style.name}' text='{p.text}' xml={p._p.xml[:120]}")

