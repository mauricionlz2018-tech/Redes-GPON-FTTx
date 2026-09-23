import docx, sys

sys.stdout.reconfigure(encoding='utf-8')
doc = docx.Document('docs/Documentacion_Residencias_avance.docx')

print("=== CHECKING ÍNDICE DE FIGURAS ===")
for i, p in enumerate(doc.paragraphs[:120]):
    text = p.text.strip()
    if 'figura' in text.lower() or 'índice de figuras' in text.lower() or 'indice de figuras' in text.lower():
        print(f"P[{i}]: {text}")

