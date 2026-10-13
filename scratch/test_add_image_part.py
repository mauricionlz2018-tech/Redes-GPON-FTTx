import docx
from docx.opc.constants import RELATIONSHIP_TYPE
import zipfile
import io

doc_main = docx.Document('docs/Documentacion_Residencias_avance.docx')

with zipfile.ZipFile('docs/Documentacion_Desarrollo_Codificacion_y_Pruebas.docx') as z:
    img_bytes = z.read('word/media/image69.png')
    image_stream = io.BytesIO(img_bytes)
    
# Test adding to doc_main
image_part = doc_main.part.package.get_or_add_image_part(image_stream)
rId = doc_main.part.relate_to(image_part, RELATIONSHIP_TYPE.IMAGE)
print(f"Successfully added image69.png with new rId: {rId}")
print(f"Target ref of new rId: {doc_main.part.rels[rId].target_ref}")

