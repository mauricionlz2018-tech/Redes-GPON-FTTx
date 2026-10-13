import zipfile

for path in ['docs/Documentacion_Residencias_avance.docx', 'docs/Documentacion_Desarrollo_Codificacion_y_Pruebas.docx']:
    with zipfile.ZipFile(path) as z:
        media = [n for n in z.namelist() if n.startswith('word/media/')]
        print(f"{path}: total media files = {len(media)}")

