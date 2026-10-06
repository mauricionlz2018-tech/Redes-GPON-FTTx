import docx
import shutil
import os

def test_split():
    src_path = 'docs/Documentacion_Residencias_avance.docx'
    dev_doc_path = 'docs/Documentacion_Desarrollo_Codificacion_y_Pruebas.docx'
    
    print("1. Creando copia completa para Documentacion_Desarrollo_Codificacion_y_Pruebas.docx...")
    shutil.copyfile(src_path, dev_doc_path)
    
    # Abrir el documento de desarrollo
    doc_dev = docx.Document(dev_doc_path)
    body_dev = doc_dev._body._element
    
    # Encontrar indices de Cap IV, Cap V y Conclusiones en doc_dev
    cap4_idx = None
    conc_idx = None
    for i, elem in enumerate(body_dev):
        if elem.tag.split('}')[-1] == 'p':
            txt = docx.text.paragraph.Paragraph(elem, doc_dev).text.strip()
            if ('CAPÍTULO IV' in txt or 'CAP\xcdTULO IV' in txt) and cap4_idx is None:
                cap4_idx = i
            elif txt == 'Conclusiones':
                conc_idx = i
                break
                
    print(f"doc_dev: cap4_idx={cap4_idx}, conc_idx={conc_idx}")
    
    # En doc_dev queremos conservar desde cap4_idx (o su portada) hasta conc_idx - 1
    # Vamos a eliminar desde conc_idx hasta el final
    # Y eliminar desde el elemento 7 (despues de la portada) hasta cap4_idx - 1
    print("Prueba completada.")

if __name__ == '__main__':
    test_split()

