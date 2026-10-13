import docx
from docx.opc.constants import RELATIONSHIP_TYPE
from docx.oxml import parse_xml
from docx.oxml.ns import nsdecls, qn
from copy import deepcopy
import zipfile
import io
import shutil
import re

main_path = 'docs/Documentacion_Residencias_avance.docx'
dev_path = 'docs/Documentacion_Desarrollo_Codificacion_y_Pruebas.docx'
backup_path = 'docs/Documentacion_Residencias_avance_BACKUP_13OCT_PRE_CAP4.docx'
mirror_path = 'docs/Documentacion_Residencias (4).docx'

print("1. Creando backup...")
shutil.copyfile(main_path, backup_path)
print(f"   Backup creado en {backup_path}")

doc_main = docx.Document(main_path)
doc_dev = docx.Document(dev_path)

body_main = doc_main._body._element
body_dev = doc_dev._body._element

# 2. Localizar límites en doc_dev
cap4_dev_start = None
cap5_dev_start = None
for i, el in enumerate(body_dev):
    tag = el.tag.split('}')[-1]
    if tag == 'p':
        txt = "".join(el.itertext()).strip()
        if 'CAPÍTULO IV' in txt and cap4_dev_start is None:
            cap4_dev_start = i
        elif 'CAPÍTULO V' in txt and cap5_dev_start is None:
            cap5_dev_start = i

print(f"doc_dev: Cap IV en {cap4_dev_start}, Cap V en {cap5_dev_start}")

# 3. Extraer imágenes de doc_dev y registrarlas en doc_main
print("2. Procesando y transfiriendo imágenes de Capítulo IV...")
dev_rels = doc_dev.part.rels
rid_map = {}

with zipfile.ZipFile(dev_path) as z_dev:
    # Recorrer todos los elementos entre cap4_dev_start + 1 y cap5_dev_start - 6 (hasta antes de los párrafos de centrado de Cap V)
    # En doc_dev vimos que P225 es 'Elaboración propia' (fig 96) y P226..P231 son los vacíos de Cap V.
    # Así que el rango es desde cap4_dev_start + 1 hasta el elemento previo a los vacíos de Cap V.
    # Busquemos el elemento que contiene 'Elaboración propia' de la Figura 96:
    end_elem_idx = None
    for k in range(cap5_dev_start - 1, cap4_dev_start, -1):
        el = body_dev[k]
        txt = "".join(el.itertext()).strip()
        if txt.startswith('Elaboración propia'):
            end_elem_idx = k
            break
            
    print(f"Rango a transferir de doc_dev: {cap4_dev_start + 1} hasta {end_elem_idx} (total {end_elem_idx - cap4_dev_start} elementos)")
    
    # Identificar todos los blips
    for k in range(cap4_dev_start + 1, end_elem_idx + 1):
        el = body_dev[k]
        for blip in el.xpath('.//a:blip'):
            old_rid = blip.get('{http://schemas.openxmlformats.org/officeDocument/2006/relationships}embed')
            if old_rid and old_rid not in rid_map:
                if old_rid in dev_rels:
                    rel = dev_rels[old_rid]
                    target = 'word/' + rel.target_ref if not rel.target_ref.startswith('word/') else rel.target_ref
                    img_bytes = z_dev.read(target)
                    image_stream = io.BytesIO(img_bytes)
                    image_part = doc_main.part.package.get_or_add_image_part(image_stream)
                    new_rid = doc_main.part.relate_to(image_part, RELATIONSHIP_TYPE.IMAGE)
                    rid_map[old_rid] = new_rid
                    print(f"   Imagen {target} mapeada: {old_rid} -> {new_rid}")

print(f"Total imágenes mapeadas: {len(rid_map)}")

# 4. Clonar elementos y remapear rIds
print("3. Clonando elementos y actualizando referencias...")
cloned_elements = []
for k in range(cap4_dev_start + 1, end_elem_idx + 1):
    el_copy = deepcopy(body_dev[k])
    
    # Actualizar blips
    for blip in el_copy.xpath('.//a:blip'):
        old_rid = blip.get('{http://schemas.openxmlformats.org/officeDocument/2006/relationships}embed')
        if old_rid in rid_map:
            blip.set('{http://schemas.openxmlformats.org/officeDocument/2006/relationships}embed', rid_map[old_rid])
            
    # Si es el título de la Tabla 28, actualizar a Tabla 37
    txt = "".join(el_copy.itertext()).strip()
    if 'Tabla 28.' in txt:
        for t_node in el_copy.xpath('.//w:t'):
            if 'Tabla 28.' in t_node.text:
                t_node.text = t_node.text.replace('Tabla 28.', 'Tabla 37.')
                print(f"   Renumerada en contenido: {t_node.text}")
                
    # Quitar cualquier sectPr accidental dentro de los párrafos clonados
    for sp in el_copy.xpath('./w:pPr/w:sectPr'):
        sp.getparent().remove(sp)
        
    cloned_elements.append(el_copy)

# 5. Localizar punto de inserción en doc_main
print("4. Insertando contenido en Capítulo IV de doc_main...")
cap4_main_idx = None
for i, el in enumerate(body_main):
    tag = el.tag.split('}')[-1]
    if tag == 'p':
        txt = "".join(el.itertext()).strip()
        if 'CAPÍTULO IV' in txt and cap4_main_idx is None:
            cap4_main_idx = i
            break

cap4_title_el = body_main[cap4_main_idx]
print(f"Punto de anclaje: elemento [{cap4_main_idx}] '{''.join(cap4_title_el.itertext()).strip()}'")

# Quitar sectPr del título de Capítulo IV
sp_list = cap4_title_el.xpath('./w:pPr/w:sectPr')
chapter_sectPr = None
if sp_list:
    chapter_sectPr = deepcopy(sp_list[0])
    for sp in sp_list:
        sp.getparent().remove(sp)
else:
    chapter_sectPr = parse_xml(f'''
    <w:sectPr {nsdecls("w", "r")}>
        <w:headerReference w:type="default" r:id="rId13"/>
        <w:headerReference w:type="first" r:id="rId13"/>
        <w:footerReference w:type="default" r:id="rId92"/>
        <w:footerReference w:type="first" r:id="rId10"/>
        <w:pgSz w:w="12242" w:h="15842" w:code="1"/>
        <w:pgMar w:top="1417" w:right="1701" w:bottom="1417" w:left="1701" w:header="708" w:footer="708" w:gutter="0"/>
        <w:pgNumType w:fmt="decimal"/>
        <w:cols w:space="708"/>
        <w:type w:val="nextPage"/>
        <w:titlePg/>
        <w:docGrid w:linePitch="360"/>
    </w:sectPr>
    ''')

# Insertar todos los elementos clonados sucesivamente tras cap4_title_el
curr_el = cap4_title_el
last_inserted = None
for el_to_insert in cloned_elements:
    curr_el.addnext(el_to_insert)
    curr_el = el_to_insert
    last_inserted = el_to_insert

print(f"Insertados exitosamente {len(cloned_elements)} elementos.")

# Asignar chapter_sectPr al último elemento insertado (cierra Capítulo IV y da paso a Capítulo V)
pPr_last = last_inserted.find('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}pPr')
if pPr_last is None:
    pPr_last = parse_xml(f'<w:pPr {nsdecls("w")}/>')
    last_inserted.insert(0, pPr_last)
pPr_last.append(chapter_sectPr)
print("Sección de Capítulo IV configurada: portadilla no numerada, páginas siguientes arábigas continuas, encabezados limpios sin logos.")

# 6. Guardar doc_main y sincronizar espejo
doc_main.save(main_path)
shutil.copyfile(main_path, mirror_path)
print(f"Documento guardado y sincronizado en {main_path} y {mirror_path}.")
