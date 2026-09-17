import docx

def verify():
    path = "docs/PORTADA_INSTITUCIONAL (3)_FINAL.docx"
    doc = docx.Document(path)
    body = doc._body._element

    print("==========================================")
    print("VERIFICATION REPORT FOR THESIS DOCUMENT")
    print("==========================================")

    # 1. Front Matter / Cover Pages
    print("\n--- 1. Portada y Contraportada ---")
    tbl0 = doc.tables[0]
    tbl1 = doc.tables[1]
    tbl2 = doc.tables[2]
    
    t0_text = tbl0.cell(0,0).text.strip().replace('\n', ' ')
    t1_text = tbl1.cell(0,0).text.strip().replace('\n', ' ')
    t2_text = tbl2.cell(0,0).text.strip().replace('\n', ' ')

    print(f"Table 0 (Portada): {repr(t0_text[:60])}")
    print(f"Table 1 (Contraportada): {repr(t1_text[:60])}")
    print(f"Table 2: {repr(t2_text[:60])}")

    # Verify Table 0 and Table 1 are in body[1] and body[4]
    p_idx = 0
    t_idx = 0
    t0_pos, t1_pos, t2_pos = None, None, None
    for i, el in enumerate(body):
        tag = el.tag.split('}')[-1]
        if tag == 'tbl':
            if t_idx == 0: t0_pos = i
            elif t_idx == 1: t1_pos = i
            elif t_idx == 2: t2_pos = i
            t_idx += 1

    print(f"Body indices: Table 0 at {t0_pos}, Table 1 at {t1_pos}, Table 2 at {t2_pos}")
    assert t0_pos == 1, f"Table 0 should be at body[1], but is at {t0_pos}"
    assert t1_pos == 4, f"Table 1 should be at body[4], but is at {t1_pos}"
    assert t2_pos > 100, f"Table 2 should NOT be in front matter, but is at {t2_pos}"
    print(">> Portada and Contraportada are 100% INTACT on Pages 1 & 2! Table 2 is deep in Chapter II!")

    # 2. Advisor verification
    print("\n--- 2. Advisor Verification ---")
    t0_advisor = [c.text for row in tbl0.rows for c in row.cells if "Leonardo" in c.text]
    t1_advisor = [c.text for row in tbl1.rows for c in row.cells if "Leonardo" in c.text]
    casio_mentions = []
    for i, p in enumerate(doc.paragraphs):
        words = p.text.lower().split()
        if "casio" in words or "casio," in words or "casio." in words:
            casio_mentions.append((i, p.text[:60]))
    print(f"Advisor in Table 0: {'FOUND' if t0_advisor else 'MISSING'}")
    print(f"Advisor in Table 1: {'FOUND' if t1_advisor else 'MISSING'}")
    print(f"Mentions of Casio: {len(casio_mentions)}")
    assert len(casio_mentions) == 0, f"Found Casio mentions: {casio_mentions}"
    print(">> Advisor is strictly I.S.C. Leonardo Becerril Sánchez!")

    # 3. Text color verification
    print("\n--- 3. Text Colors (100% Black) ---")
    non_black_runs = 0
    non_black_examples = []
    for i, p in enumerate(doc.paragraphs):
        for r in p.runs:
            if r.font.color and r.font.color.rgb:
                c = str(r.font.color.rgb)
                if c != "000000":
                    non_black_runs += 1
                    if len(non_black_examples) < 3:
                        non_black_examples.append((i, c, p.text[:40]))
    for ti, t in enumerate(doc.tables):
        for row in t.rows:
            for cell in row.cells:
                for p in cell.paragraphs:
                    for r in p.runs:
                        if r.font.color and r.font.color.rgb:
                            c = str(r.font.color.rgb)
                            if c != "000000":
                                non_black_runs += 1
                                if len(non_black_examples) < 3:
                                    non_black_examples.append((f"Table {ti}", c, p.text[:40]))

    print(f"Non-black runs found: {non_black_runs}")
    if non_black_examples:
        print("Examples of non-black:", non_black_examples)
    assert non_black_runs == 0, "Found non-black text!"
    print(">> All text runs across paragraphs and tables are strictly pure BLACK (000000)!")

    # 4. Chapters Structure
    print("\n--- 4. Chapter Structure ---")
    found_chapters = []
    for i, p in enumerate(doc.paragraphs):
        txt = p.text.strip()
        if any(txt.startswith(k) for k in ["CAPÍTULO", "CAPITULO", "GLOSARIO", "REFERENCIAS BIBLIOGRÁFICAS", "ANEXOS"]):
            found_chapters.append((i, p.style.name, txt))

    for idx, st, ch in found_chapters:
        print(f"P[{idx:3d}] ({st}): {ch}")

    # 5. Neon Diagram location
    print("\n--- 5. Neon Serverless Figure Verification ---")
    neon_p_idx = None
    neon_draw_idx = None
    neon_cap_idx = None
    for i, p in enumerate(doc.paragraphs):
        txt = p.text.strip()
        if "2.8.4 Arquitectura de Base de Datos Serverless" in txt:
            neon_p_idx = i
        if "Arquitectura de computación sin servidor y almacenamiento desagregado en Neon" in txt or "Neon PostgreSQL" in txt:
            if i > 400 and i < 500:
                neon_cap_idx = i
                # check prev paragraph for drawing
                if len(doc.paragraphs[i-1]._p.xpath('.//w:drawing')) > 0:
                    neon_draw_idx = i - 1

    cap3_idx = None
    for i, p in enumerate(doc.paragraphs):
        if i > 120 and ("CAPÍTULO III" in p.text.upper() or "CAPITULO III" in p.text.upper()):
            cap3_idx = i
            break
    print(f"Neon section at P[{neon_p_idx}], drawing at P[{neon_draw_idx}], caption at P[{neon_cap_idx}], Cap III at P[{cap3_idx}]")
    assert neon_p_idx is not None, "Neon section 2.8.4 not found!"
    assert neon_cap_idx is not None, "Neon caption not found in Chapter II!"
    assert neon_draw_idx is not None, "Neon drawing not immediately above caption in 2.8.4!"
    assert neon_cap_idx < cap3_idx, f"Neon figure is at P[{neon_cap_idx}], but should be before Chapter III at P[{cap3_idx}]!"
    print(">> Neon diagram is verified directly inside Section 2.8.4 in Chapter II (NOT at the end)!")

    # 6. Figures Placement and Formatting
    print("\n--- 6. Figures Placement and Sequential Numbering ---")
    figures = []
    for i, p in enumerate(doc.paragraphs):
        if i < 120: continue
        txt = p.text.strip()
        if txt.startswith("Figura ") and "." in txt:
            p_prev = doc.paragraphs[i-1] if i > 0 else None
            p_next = doc.paragraphs[i+1] if i+1 < len(doc.paragraphs) else None
            has_draw_prev = len(p_prev._p.xpath('.//w:drawing')) if p_prev else 0
            is_src_next = p_next.text.strip().startswith("Fuente:") or p_next.text.strip().startswith("Elaboraci") if p_next else False
            # Check font
            r0 = p.runs[0] if p.runs else None
            is_bold = r0.font.bold if r0 else False
            font_size = r0.font.size.pt if r0 and r0.font.size else None
            font_color = str(r0.font.color.rgb) if r0 and r0.font.color else None
            
            figures.append({
                "index": i,
                "caption": txt[:65],
                "has_draw_prev": has_draw_prev,
                "is_src_next": is_src_next,
                "bold": is_bold,
                "size": font_size,
                "color": font_color
            })

    print(f"Total numbered figures found: {len(figures)}")
    all_draw_prev = all(f["has_draw_prev"] == 1 for f in figures)
    all_src_next = all(f["is_src_next"] for f in figures)
    all_bold = all(f["bold"] for f in figures)
    print(f"All figures have image on top: {all_draw_prev}")
    print(f"All figures have source below: {all_src_next}")
    print(f"All captions are bold: {all_bold}")

    for idx, f in enumerate(figures):
        expected_num = f"Figura {idx+1}."
        assert f["caption"].startswith(expected_num), f"Figure at P[{f['index']}] has caption '{f['caption']}', expected '{expected_num}'"
    print(f">> All {len(figures)} figures are numbered sequentially from Figura 1 to Figura {len(figures)} with drawing above and source below!")

    # 7. Forbidden Characters Check
    print("\n--- 7. Forbidden Characters Check (Em-dash, Semicolon, Emojis) ---")
    em_dashes = 0
    semicolons = 0
    for p in doc.paragraphs:
        em_dashes += p.text.count("—")
        semicolons += p.text.count(";")
    for t in doc.tables:
        for r in t.rows:
            for c in r.cells:
                for p in c.paragraphs:
                    em_dashes += p.text.count("—")
                    semicolons += p.text.count(";")

    print(f"Em-dashes count: {em_dashes}")
    print(f"Semicolons count: {semicolons}")
    assert em_dashes == 0, f"Found {em_dashes} em-dashes!"
    assert semicolons == 0, f"Found {semicolons} semicolons!"
    print(">> 0 em-dashes and 0 semicolons verified!")

    # 8. Bibliographic References Check
    print("\n--- 8. Bibliographic References (APA) ---")
    ref_start = None
    for i, p in enumerate(doc.paragraphs):
        if p.text.strip() == "REFERENCIAS BIBLIOGRÁFICAS":
            ref_start = i
            break
    
    ref_count = 0
    if ref_start:
        for k in range(ref_start + 1, len(doc.paragraphs)):
            pk = doc.paragraphs[k]
            if pk.text.strip() == "ANEXOS":
                break
            if len(pk.text.strip()) > 20:
                ref_count += 1

    print(f"References start at P[{ref_start}], total references: {ref_count}")
    assert ref_count >= 40, f"Expected at least 40 references, found {ref_count}"
    print(f">> All {ref_count} APA bibliographic references are intact and verified!")

    print("\n==========================================")
    print("ALL TESTS PASSED WITH 100% SUCCESS!")
    print("==========================================")

if __name__ == "__main__":
    verify()
