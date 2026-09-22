import os, sys, pptx
import xml.etree.ElementTree as ET

for f in os.listdir('docs'):
    if 'plantilla' in f.lower() and f.endswith('.pptx'):
        target_path = os.path.join('docs', f)
        break

sys.stdout.reconfigure(encoding='utf-8')
prs = pptx.Presentation(target_path)
for idx, slide in enumerate(prs.slides):
    root = ET.fromstring(slide._element.xml)
    blips = root.findall('.//{http://schemas.openxmlformats.org/drawingml/2006/main}blip')
    print(f'Slide {idx+1}: {len(blips)} images')
    for b in blips:
        rid = b.attrib.get('{http://schemas.openxmlformats.org/officeDocument/2006/relationships}embed')
        try:
            part = slide.part.related_part(rid)
            pname = part.partname if part else None
        except Exception as e:
            pname = str(e)
        print(f'   rId={rid}, part={pname}')
