import docx
import shutil
import sys

def perform_split():
    src_path = 'docs/Documentacion_Residencias_avance.docx'
    dev_path = 'docs/Documentacion_Desarrollo_Codificacion_y_Pruebas.docx'
    
    print("==================================================")
    print("1. GENERANDO DOCUMENTO DE CODIFICACIÓN Y PRUEBAS")
    print("==================================================")
    # Copiar archivo base para preservar relaciones, imágenes y estilos
    shutil.copyfile(src_path, dev_path)
    
    doc_dev = docx.Document(dev_path)
    body_dev = doc_dev._body._element
    
    # Identificar indices exactos en doc_dev
    cap4_p_elem = None
    cap4_idx = None
    conc_idx = None
    
    for i, elem in enumerate(body_dev):
        if elem.tag.split('}')[-1] == 'p':
            txt = docx.text.paragraph.Paragraph(elem, doc_dev).text.strip()
            if ('CAPÍTULO IV' in txt or 'CAP\xcdTULO IV' in txt) and cap4_idx is None:
                cap4_idx = i
                cap4_p_elem = elem
            elif txt == 'Conclusiones' and conc_idx is None:
                conc_idx = i
                
    print(f"Indices detectados en doc_dev: Cap IV={cap4_idx}, Conclusiones={conc_idx}")
    
    # En doc_dev:
    # A) Modificar la portada (Tabla 0) para reflejar que es el documento de desarrollo y codificación
    t0 = doc_dev.tables[0]
    # Modificar fila 2 y 3
    if len(t0.rows) >= 4:
        c_proj = t0.rows[1].cells[0]
        c_proj.paragraphs[0].text = '«SISTEMA DE INVENTARIO Y MAPEO LÓGICO DE REDES GPON / FTTx»\nDOCUMENTACIÓN TÉCNICA DE DESARROLLO (CODIFICACIÓN) Y PRUEBAS\nCAPÍTULO IV Y CAPÍTULO V'
        c_proj.paragraphs[0].runs[0].font.name = 'Arial'
        c_proj.paragraphs[0].runs[0].font.bold = True
        
        c_info = t0.rows[2].cells[2]
        c_info.paragraphs[0].text = 'Proyecto de Residencia Profesional\nCarrera: Ingeniería en Sistemas Computacionales\nPresenta: Mauricio Nolazco Lonjino\nAsesor Interno: I.S.C. Leonardo Becerril Sánchez\nAsesor Externo: Ing. Carlos Mendoza Ruiz'
        c_info.paragraphs[0].runs[0].font.name = 'Arial'
        
        c_date = t0.rows[3].cells[2]
        c_date.paragraphs[0].text = 'Octubre de 2026.'
        c_date.paragraphs[0].runs[0].font.name = 'Arial'
    print("  -> Portada de doc_dev actualizada.")

    # B) Eliminar elementos desde Conclusiones (conc_idx) hasta el final (excluyendo el sectPr final del body si existe)
    # Los elementos a eliminar después de Cap V:
    elems_after_cap5 = []
    for i in range(conc_idx, len(body_dev)):
        elem = body_dev[i]
        if elem.tag.split('}')[-1] != 'sectPr':
            elems_after_cap5.append(elem)
            
    for elem in elems_after_cap5:
        body_dev.remove(elem)
    print(f"  -> Eliminados {len(elems_after_cap5)} elementos posteriores a Cap V (Conclusiones, Glosario, Anexos).")

    # C) Eliminar elementos entre la portada (después de la portada, index 5) y justo antes de Cap IV (1189)
    # Queremos que después de la portada empiece directamente el Capítulo IV
    # Los elementos de preliminares, indices y Caps I, II, III están entre index 5 y 1188.
    elems_before_cap4 = []
    # Recalcular índice de Cap IV tras eliminación posterior
    for i, elem in enumerate(body_dev):
        if elem.tag.split('}')[-1] == 'p':
            txt = docx.text.paragraph.Paragraph(elem, doc_dev).text.strip()
            if 'CAPÍTULO IV' in txt or 'CAP\xcdTULO IV' in txt:
                cap4_idx = i
                break
                
    # Los elementos de 5 a cap4_idx - 6 (dejando los párrafos vacíos y salto de página que centran Cap IV)
    # Dejamos 1189 a 1194 que son los párrafos que centran Cap IV
    # Para ser exactos, buscamos desde index 5 hasta 6 párrafos antes de Cap IV
    start_del = 5
    end_del = max(start_del, cap4_idx - 6)
    for i in range(start_del, end_del):
        elems_before_cap4.append(body_dev[i])
        
    for elem in elems_before_cap4:
        body_dev.remove(elem)
    print(f"  -> Eliminados {len(elems_before_cap4)} elementos previos a Cap IV (Caps I, II, III e Índices).")

    # Guardar doc_dev
    doc_dev.save(dev_path)
    print(f"  -> {dev_path} guardado exitosamente.")

    print("\n==================================================")
    print("2. ACTUALIZANDO DOCUMENTO PRINCIPAL (VACIANDO CAP IV Y V)")
    print("==================================================")
    doc_main = docx.Document(src_path)
    body_main = doc_main._body._element
    
    # Localizar indices en doc_main
    m_cap4_idx = None
    m_cap5_idx = None
    
    for i, elem in enumerate(body_main):
        if elem.tag.split('}')[-1] == 'p':
            txt = docx.text.paragraph.Paragraph(elem, doc_main).text.strip()
            if ('CAPÍTULO IV' in txt or 'CAP\xcdTULO IV' in txt) and m_cap4_idx is None:
                m_cap4_idx = i
            elif ('CAPÍTULO V' in txt or 'CAP\xcdTULO V' in txt) and m_cap5_idx is None:
                m_cap5_idx = i
                
    print(f"Indices en doc_main: Cap IV={m_cap4_idx}, Cap V={m_cap5_idx}")
    
    # 2.1 En Capítulo IV:
    # Elemento m_cap4_idx es el título 'CAPÍTULO IV. DESARROLLO (CODIFICACIÓN)'
    # Elementos a eliminar: desde m_cap4_idx + 1 hasta m_cap5_idx - 7
    # (Los 6 párrafos antes de Cap V son los párrafos vacíos y salto de página que centran Cap V)
    elems_to_remove_ch4 = []
    end_ch4_del = m_cap5_idx - 6 # deja los párrafos de centrado de Cap V
    for i in range(m_cap4_idx + 1, end_ch4_del):
        elems_to_remove_ch4.append(body_main[i])
        
    for elem in elems_to_remove_ch4:
        body_main.remove(elem)
    print(f"  -> Eliminados {len(elems_to_remove_ch4)} elementos de información de Capítulo IV.")

    # 2.2 En Capítulo V:
    # Buscar el párrafo introductorio de Capítulo V ('En el presente capítulo se estructuran...')
    # y eliminarlo, dejando solo el título y la página capitulada
    for elem in body_main:
        if elem.tag.split('}')[-1] == 'p':
            p = docx.text.paragraph.Paragraph(elem, doc_main)
            if p.text.startswith('En el presente capítulo se estructuran las actividades de verificación'):
                body_main.remove(elem)
                print("  -> Eliminado párrafo de texto de Capítulo V.")
                break

    # 2.3 Actualizar Índice de Figuras y Tablas en doc_main:
    # Quitar las figuras 66 a 96 del índice preliminar
    # Quitar la tabla 28 del índice preliminar
    paras_to_remove_idx = []
    for p in doc_main.paragraphs[:150]:
        txt = p.text.strip()
        # Figuras de Ch4
        for f_num in range(66, 97):
            if txt.startswith(f'Figura {f_num}.'):
                paras_to_remove_idx.append(p._element)
                break
        if txt.startswith('Tabla 28.'):
            paras_to_remove_idx.append(p._element)

    for p_elem in paras_to_remove_idx:
        try:
            body_main.remove(p_elem)
        except Exception:
            pass
    print(f"  -> Limpiadas {len(paras_to_remove_idx)} entradas de figuras/tablas de Ch4 en índices preliminares.")

    # Guardar doc_main
    doc_main.save(src_path)
    print(f"  -> {src_path} guardado exitosamente.")

    # 2.4 Sincronizar Documentacion_Residencias (4).docx
    alt_path = 'docs/Documentacion_Residencias (4).docx'
    shutil.copyfile(src_path, alt_path)
    print(f"  -> Sincronizado {alt_path} exitosamente.")

    print("\n¡PROCESO COMPLETADO EXITOSAMENTE!")

if __name__ == '__main__':
    perform_split()

