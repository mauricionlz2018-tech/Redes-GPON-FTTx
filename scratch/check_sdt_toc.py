import docx

for path in ['docs/Documentacion_Residencias_avance_BACKUP_08OCT_PAGINACION.docx', 'docs/Documentacion_Residencias_avance.docx']:
    doc = docx.Document(path)
    sdts = doc._body._element.xpath('./w:sdt')
    print(f"=== {path} (sdts={len(sdts)}) ===")
    for sdt in sdts:
        ps = sdt.findall('.//{http://schemas.openxmlformats.org/wordprocessingml/2006/main}p')
        for p in ps[:20]:
            txt = "".join(p.itertext()).strip()
            if txt:
                print(f"  SDT P: {txt}")

