import os, sys, pptx

for f in os.listdir('docs'):
    if 'plantilla' in f.lower() and f.endswith('.pptx'):
        target_path = os.path.join('docs', f)
        break

sys.stdout.reconfigure(encoding='utf-8')
prs = pptx.Presentation(target_path)

for s_idx in [2, 3, 9, 10, 11]: # slides 3, 4, 10, 11, 12
    slide = prs.slides[s_idx]
    print(f'=== SLIDE {s_idx+1} ===')
    for s in slide.shapes:
        print(f'  ID={s.shape_id}, name={s.name}, type={s.shape_type}, left={s.left}, top={s.top}, w={s.width}, h={s.height}')
        if s.has_text_frame:
            for p in s.text_frame.paragraphs:
                if p.text.strip():
                    print('    P:', p.text.strip())
