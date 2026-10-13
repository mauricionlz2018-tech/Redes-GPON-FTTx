import docx
import re

doc = docx.Document('docs/Documentacion_Residencias_avance.docx')

for i, p in enumerate(doc.paragraphs):
    if i < 160:
        continue # skip TOC
    matches = re.findall(r'Tabla\s+\d+', p.text, flags=re.IGNORECASE)
    if matches:
        print(f"P{i} [{p.style.name}]: {matches} -> '{p.text[:90]}'")

