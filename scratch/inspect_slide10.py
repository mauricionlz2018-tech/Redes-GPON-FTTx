import os, sys, pptx

for f in os.listdir('docs'):
    if 'plantilla' in f.lower() and f.endswith('.pptx'):
        target_path = os.path.join('docs', f)
        break

sys.stdout.reconfigure(encoding='utf-8')
prs = pptx.Presentation(target_path)
s10 = prs.slides[9]
for s in s10.shapes:
    print(s.shape_id, s.name, s.shape_type, s.left, s.top, s.width, s.height)
    if s.has_text_frame:
        print('  TEXT:', s.text_frame.text)
