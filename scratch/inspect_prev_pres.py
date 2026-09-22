import os, sys, pptx

sys.stdout.reconfigure(encoding='utf-8')
prs = pptx.Presentation(r'docs/PRESENTACION_AVANCE_RESIDENCIA_GPON.pptx')
print('Slides in previous presentation:', len(prs.slides))
for idx, s in enumerate(prs.slides):
    print(f'=== SLIDE {idx+1} ===')
    for shp in s.shapes:
        if shp.has_text_frame:
            txt = shp.text_frame.text.strip().replace('\n', ' ')
            if txt:
                print(f'  {txt[:80]}')
