import os, sys, pptx

for f in os.listdir('docs'):
    if 'plantilla' in f.lower() and f.endswith('.pptx'):
        target_path = os.path.join('docs', f)
        break

sys.stdout.reconfigure(encoding='utf-8')
prs = pptx.Presentation(target_path)
for idx, slide in enumerate(prs.slides):
    print(f'=== SLIDE {idx+1} ===')
    for s in slide.shapes:
        if s.has_text_frame:
            full_txt = s.text_frame.text.strip().replace('\n', ' ')
            first_p = s.text_frame.paragraphs[0] if s.text_frame.paragraphs else None
            fn, sz, b, col = None, None, None, None
            if first_p and first_p.runs:
                r = first_p.runs[0]
                fn, sz, b = r.font.name, r.font.size, r.font.bold
                col = r.font.color.rgb if r.font.color and r.font.color.type == 1 else 'None'
            print(f'  Shape {s.shape_id} [{s.name}] (L={s.left}, T={s.top}, W={s.width}, H={s.height}): {full_txt[:80]} | font={fn}, sz={sz}, b={b}, col={col}')
