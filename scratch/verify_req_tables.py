import docx

doc = docx.Document('docs/Documentacion_Residencias_avance.docx')

print("=== ÍNDICE DE TABLAS ACTUALIZADO ===")
for i, p in enumerate(doc.paragraphs[:180]):
    if p.text.strip().startswith('Tabla ') and '\t' in p.text:
        print(f"  {p.text.strip()}")

print("\n=== VERIFICACIÓN DE ENCABEZADOS DE SECCIONES ===")
for i, sec in enumerate(doc.sections):
    h_draw = len(sec.header._element.xpath('.//w:drawing'))
    print(f"  Sec {i}: header_drawings={h_draw}")

