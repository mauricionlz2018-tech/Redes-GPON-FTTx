import re

# Update chen diagram
with open('scratch/generate_chen_diagram.py', 'r', encoding='utf-8') as f:
    chen = f.read()

chen = re.sub(r'draw\.text\(\(W // 2, 70\), "DIAGRAMA ENTIDAD.*?\n\s*draw\.text\(\(W // 2, 120\), "Sistema de Inventario.*?\n', '# Title stripped\n', chen)

with open('scratch/generate_chen_diagram.py', 'w', encoding='utf-8') as f:
    f.write(chen)

# Update flowchart
with open('scratch/generate_flowchart.py', 'r', encoding='utf-8') as f:
    flow = f.read()

flow = re.sub(r'draw\.text\(\(W // 2, 75\), "DIAGRAMA DE FLUJO.*?\n\s*draw\.text\(\(W // 2, 125\), "Plataforma de Inventario.*?\n', '# Title stripped\n', flow)

with open('scratch/generate_flowchart.py', 'w', encoding='utf-8') as f:
    f.write(flow)

print("Updated both scripts successfully!")

