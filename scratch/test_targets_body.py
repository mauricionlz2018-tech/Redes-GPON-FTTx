import docx

doc = docx.Document('docs/Documentacion_Residencias_avance.docx')

body_paragraphs = doc.paragraphs[105:]

p1 = None
for p in body_paragraphs:
    if '4.- API Geoespacial GPS / Leaflet' in p.text:
        p1 = p
        break

p2 = None
for i, p in enumerate(body_paragraphs):
    if 'Figura 29. Cadena de distribuci' in p.text:
        p2 = body_paragraphs[i+1] # The Elaboración propia
        break

p3 = None
for i, p in enumerate(body_paragraphs):
    if 'Figura 31. Diagrama de secuencia transaccional' in p.text:
        p3 = body_paragraphs[i+1] # The Elaboración propia
        break

p4 = None
for p in body_paragraphs:
    if '4.- Wireframe 4: Padr' in p.text:
        p4 = p
        break

print(f"Target 1: {p1.text[:60] if p1 else 'NOT FOUND'}")
print(f"Target 2: {p2.text[:60] if p2 else 'NOT FOUND'}")
print(f"Target 3: {p3.text[:60] if p3 else 'NOT FOUND'}")
print(f"Target 4: {p4.text[:60] if p4 else 'NOT FOUND'}")

