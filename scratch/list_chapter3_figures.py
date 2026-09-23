import docx, sys

sys.stdout.reconfigure(encoding='utf-8')
doc = docx.Document('docs/Documentacion_Residencias_avance.docx')

print("=== FIGURES IN CHAPTER III ===")
for i, p in enumerate(doc.paragraphs):
    if 720 <= i <= 1000:
        text = p.text.strip()
        if text.startswith('Figura'):
            print(f"P[{i}]: {text}")

