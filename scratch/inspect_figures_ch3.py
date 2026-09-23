import docx, sys

sys.stdout.reconfigure(encoding='utf-8')
doc = docx.Document('docs/Documentacion_Residencias_avance.docx')

print("=== FIGURES IN CHAPTER III AND BEYOND ===")
for i, p in enumerate(doc.paragraphs):
    if i < 700:
        continue
    text = p.text.strip()
    has_img = any('drawing' in r._element.xml for r in p.runs)
    if 'figura' in text.lower() or has_img:
        print(f"P[{i}]: imgs={1 if has_img else 0} | {text}")

