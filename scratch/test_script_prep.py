import os
import sys
import docx
from docx.shared import Pt, Inches, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

def create_element(name):
    return OxmlElement(name)

def set_cell_border(cell, **kwargs):
    """
    Set cell borders: top, bottom, left, right.
    kwargs: top={"sz": 4, "val": "single", "color": "D3D3D3"}
    """
    tcPr = cell._tc.get_or_add_tcPr()
    tcBorders = parse_xml(
        f'<w:tcBorders {nsdecls("w")}>\n'
        f'  <w:top w:val="single" w:sz="4" w:space="0" w:color="D3D3D3"/>\n'
        f'  <w:left w:val="single" w:sz="4" w:space="0" w:color="D3D3D3"/>\n'
        f'  <w:bottom w:val="single" w:sz="4" w:space="0" w:color="D3D3D3"/>\n'
        f'  <w:right w:val="single" w:sz="4" w:space="0" w:color="D3D3D3"/>\n'
        f'</w:tcBorders>'
    )
    tcPr.append(tcBorders)

def set_cell_background(cell, fill_hex):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
    tcPr.append(shd)

def create_paragraph_after(target_elem, text="", bold_prefix="", font_name="Arial", font_size_pt=11, line_spacing=1.5, space_after_pt=6, style_name="Normal"):
    """
    Creates a new paragraph element and inserts it right after target_elem.
    """
    new_p = parse_xml(f'<w:p {nsdecls("w")}/>')
    target_elem.addnext(new_p)
    p = docx.text.paragraph.Paragraph(new_p, target_elem)
    if style_name:
        try:
            p.style = style_name
        except Exception:
            pass
    p.paragraph_format.line_spacing = line_spacing
    p.paragraph_format.space_after = Pt(space_after_pt)
    
    if bold_prefix:
        r_bold = p.add_run(bold_prefix)
        r_bold.font.name = font_name
        r_bold.font.size = Pt(font_size_pt)
        r_bold.font.bold = True
    
    if text:
        r_text = p.add_run(text)
        r_text.font.name = font_name
        r_text.font.size = Pt(font_size_pt)
        
    return p

print("Helper script ready.")

