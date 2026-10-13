import docx

doc = docx.Document('docs/Documentacion_Residencias_avance.docx')

print("Buscando secciones de requerimientos en párrafos...")
for i, p in enumerate(doc.paragraphs):
    t = p.text.strip()
    if any(k in t.lower() for k in ['requerimiento', 'requisitos', 'funcionales', 'no funcionales']):
        if len(t) < 120:
            print(f"P{i} [style={p.style.name}]: {t}")

