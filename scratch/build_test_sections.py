import docx
from docx.shared import Pt
from docx.oxml import parse_xml
from docx.oxml.ns import nsdecls, qn
import shutil

src_path = 'docs/Documentacion_Residencias_avance.docx'
test_path = 'scratch/test_sections_setup.docx'
shutil.copyfile(src_path, test_path)

doc = docx.Document(test_path)

# Helper to remove pageBreakBefore from a paragraph
def remove_page_break_before(p):
    pPr = p._element.find(qn('w:pPr'))
    if pPr is not None:
        pbb = pPr.find(qn('w:pageBreakBefore'))
        if pbb is not None:
            pPr.remove(pbb)

# 1. Quitar sectPr de P159 (antiguo corte entre Indices e Introduccion)
p159 = doc.paragraphs[159]
p159_sects = p159._element.xpath('./w:pPr/w:sectPr')
if p159_sects:
    p159._element.pPr.remove(p159_sects[0])
    print("Quitado sectPr de P159.")

# Definir los puntos de corte de las nuevas secciones:
# (parrafo_final_de_seccion_previa, parrafo_inicial_de_nueva_seccion, tipo)
# P186 termina Preliminares (Romanos). P187 inicia Cap I.
# P242 termina Cap I. P243 inicia Cap II.
# P752 termina Cap II. P753 inicia Cap III.
# P1191 termina Cap III. P1192 inicia Cap IV.
# P1198 termina Cap IV. P1199 inicia Cap V.
# P1209 termina Cap V. P1210 inicia Conclusiones.

splits = [
    (186, 187, 'Capitulo I'),
    (242, 243, 'Capitulo II'),
    (752, 753, 'Capitulo III'),
    (1191, 1192, 'Capitulo IV'),
    (1198, 1199, 'Capitulo V'),
]

for end_idx, start_idx, name in splits:
    p_end = doc.paragraphs[end_idx]
    p_start = doc.paragraphs[start_idx]
    
    # Quitar pageBreakBefore de p_start para evitar pagina en blanco extra
    remove_page_break_before(p_start)
    
    # Agregar sectPr en p_end
    pPr = p_end._element.get_or_add_pPr()
    # Limpiar cualquier sectPr previo
    for sp in pPr.xpath('./w:sectPr'):
        pPr.remove(sp)
        
    # Crear sectPr con NextPage
    new_sp = parse_xml(f'''
    <w:sectPr {nsdecls("w")}>
        <w:type w:val="nextPage"/>
    </w:sectPr>
    ''')
    pPr.append(new_sp)
    print(f"Agregado corte de seccion en P{end_idx} antes de {name} (P{start_idx}).")

# Quitar pageBreakBefore de P1210 (Conclusiones) ya que P1209 ya tiene sectPr
remove_page_break_before(doc.paragraphs[1210])

# Guardar documento
doc.save(test_path)
print("Documento guardado con todas las secciones estructurales.")
print("Total de secciones ahora reconocidas por python-docx:", len(doc.sections))

