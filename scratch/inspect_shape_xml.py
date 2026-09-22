import os, sys, pptx

for f in os.listdir('docs'):
    if 'plantilla' in f.lower() and f.endswith('.pptx'):
        target_path = os.path.join('docs', f)
        break

sys.stdout.reconfigure(encoding='utf-8')
prs = pptx.Presentation(target_path)
s4 = prs.slides[3] # slide 4
for s in s4.shapes:
    print(s.shape_id, s.name, s.shape_type)
    if s.shape_type == 14: # placeholder
        print('Placeholder XML snippet:', s._element.xml[:300])
    if s.shape_type == 13: # picture
        print('Picture XML snippet:', s._element.xml[:300])
