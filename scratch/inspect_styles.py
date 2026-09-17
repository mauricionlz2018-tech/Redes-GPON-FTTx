import docx

doc = docx.Document('docs/PORTADA_INSTITUCIONAL (3)_FINAL.docx')
for p_idx in [178, 181, 182, 183, 438, 443, 444, 445]:
    p = doc.paragraphs[p_idx]
    font_name = p.style.font.name if p.style and p.style.font else 'None'
    font_size = p.style.font.size.pt if p.style and p.style.font and p.style.font.size else 'None'
    runs_info = [(r.text[:20], r.font.name, r.font.size.pt if r.font.size else None, r.bold, r.italic) for r in p.runs[:3]]
    print(f"P[{p_idx}] Style={p.style.name} (font={font_name}, size={font_size}): text='{p.text[:40]}' runs={runs_info}")

