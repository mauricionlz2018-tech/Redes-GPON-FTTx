import docx
from docx.oxml.text.paragraph import CT_P
from docx.oxml.table import CT_Tbl

doc = docx.Document('docs/PORTADA_INSTITUCIONAL (3)_FINAL.docx')
elements = doc._body._element

p_count = 0
tbl_count = 0
for child in elements:
    if isinstance(child, CT_P):
        p_count += 1
    elif isinstance(child, CT_Tbl):
        tbl_count += 1

print(f"Body elements: {len(elements)} total | {p_count} paragraphs, {tbl_count} tables")
