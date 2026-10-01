import docx
import re

for doc_path in ["docs/Documentacion_Residencias_avance.docx", "docs/Documentacion_Residencias (4).docx"]:
    print(f"\n{'='*70}\nAUDIT: {doc_path}\n{'='*70}")
    doc = docx.Document(doc_path)
    
    # 1. Check 4.1 subsections
    print("--- Subsections in 4.1 ---")
    for i, p in enumerate(doc.paragraphs):
        txt = p.text.strip()
        if txt.startswith("4.1."):
            print(f"  P{i} [{p.style.name}]: {txt}")

    # 2. Check figures around insertion
    print("\n--- Figures 58 to 66 in Body ---")
    figs = []
    for i, p in enumerate(doc.paragraphs):
        if p.style.name == "Figuras":
            m = re.match(r"^Figura\s+(\d+)\.\s*(.*)", p.text.strip())
            if m:
                figs.append((i, int(m.group(1)), p.text.strip()))

    print(f"Total figures in body: {len(figs)}")
    for p_idx, num, text in figs:
        if 57 <= num <= 67 or num >= 87:
            print(f"  Fig {num} (P{p_idx}): {text[:70]}...")

    # 3. Check TOC figures
    toc_figs = []
    for p in doc.paragraphs:
        if p.style.name == "toc 1" and p.text.strip().startswith("Figura "):
            m = re.match(r"^Figura\s+(\d+)\.\s*(.*)", p.text.strip())
            if m:
                toc_figs.append((int(m.group(1)), p.text.strip()))

    print(f"\nTotal TOC figures: {len(toc_figs)}")
    for num, text in toc_figs:
        if 57 <= num <= 67 or num >= 87:
            print(f"  TOC Fig {num}: {text[:70]}...")

    # 4. Check typography of 4.1.1
    print("\n--- Checking typography of 4.1.1 paragraphs ---")
    h3_idx = None
    for i, p in enumerate(doc.paragraphs):
        if "4.1.1 Configuración Inicial" in p.text:
            h3_idx = i
            break
            
    if h3_idx is not None:
        for k in range(h3_idx, h3_idx + 10):
            pk = doc.paragraphs[k]
            fonts = set(r.font.name for r in pk.runs if r.text.strip())
            sizes = set(r.font.size.pt for r in pk.runs if r.font.size and r.text.strip())
            ls = pk.paragraph_format.line_spacing
            sa = pk.paragraph_format.space_after.pt if pk.paragraph_format.space_after else None
            align = pk.alignment
            print(f"  P{k} [{pk.style.name}]: Fonts={fonts}, Sizes={sizes}, LS={ls}, SA={sa}, Align={align} | '{pk.text[:40]}'")

    # 5. Check chapters geometry
    print("\n--- Chapter Headings Geometry ---")
    for pat in [r'^CAP[ÍI]TULO\s+I\b', r'^CAP[ÍI]TULO\s+II\b', r'^CAP[ÍI]TULO\s+III\b', r'^CAP[ÍI]TULO\s+IV\b', r'^CAP[ÍI]TULO\s+V\b']:
        for idx, p in enumerate(doc.paragraphs):
            if re.search(pat, p.text.strip(), re.IGNORECASE):
                first_spacer_pb = doc.paragraphs[idx-6].paragraph_format.page_break_before
                spacer_sizes = [doc.paragraphs[k].runs[0].font.size.pt for k in range(idx-6, idx)]
                title_sz = [r.font.size.pt for r in p.runs]
                title_bold = [r.font.bold for r in p.runs]
                print(f"  {p.text}: PB={first_spacer_pb}, Spacers={len(spacer_sizes)}, Sizes={set(spacer_sizes)}, Title={set(title_sz)}, Bold={set(title_bold)}")
                break
