import docx
import re

doc = docx.Document('docs/Documentacion_Residencias_avance.docx')

last_fig = None
for p in doc.paragraphs:
    if p.text.strip().startswith('CAPÍTULO IV'):
        break
    m = re.match(r'^Figura\s+(\d+)\.', p.text.strip())
    if m:
        last_fig = (int(m.group(1)), p.text.strip())

print(f"Última figura antes de Cap IV: {last_fig}")

