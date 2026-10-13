import docx
from docx.oxml.ns import qn

doc = docx.Document('docs/Documentacion_Residencias_avance_BACKUP_08OCT_FINAL_PAG.docx')

def check_breaks(start, end):
    for i in range(start, end + 1):
        p = doc.paragraphs[i]
        pPr = p._element.find(qn('w:pPr'))
        has_pbb = False
        if pPr is not None and pPr.find(qn('w:pageBreakBefore')) is not None:
            has_pbb = True
        has_br = bool(p._element.xpath('.//w:br[@w:type="page"]'))
        has_sp = bool(p._element.xpath('./w:pPr/w:sectPr'))
        if has_pbb or has_br or has_sp or p.text.strip():
            print(f"P{i}: pbb={has_pbb}, br={has_br}, sectPr={has_sp}, text='{p.text.strip()[:40]}'")

print("--- P185 to P196 ---")
check_breaks(185, 196)
print("--- P241 to P251 ---")
check_breaks(241, 251)
print("--- P751 to P761 ---")
check_breaks(751, 761)
print("--- P1190 to P1206 ---")
check_breaks(1190, 1206)

