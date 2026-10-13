import docx

doc = docx.Document('docs/Documentacion_Residencias_avance.docx')

print("=== PARRAFOS PRINCIPALES Y SU INDICE EN PYTHON ===")
for i, p in enumerate(doc.paragraphs):
    t = p.text.strip()
    if t in [
        "Introducción",
        "Planteamiento del problema",
        "Justificación",
        "Objetivos",
        "Objetivo general",
        "CAPÍTULO I. ANTECEDENTES",
        "1.1 Contexto de la organización",
        "CAPÍTULO II. MARCO TEÓRICO",
        "CAPÍTULO III. DISEÑO Y MAQUETADO",
        "CAPÍTULO IV. DESARROLLO (CODIFICACIÓN)",
        "CAPÍTULO V. PRUEBAS Y RESULTADOS",
        "Conclusiones",
        "Glosario",
        "REFERENCIAS",
        "Anexos"
    ]:
        print(f"P{i}: {t} (style={p.style.name})")

