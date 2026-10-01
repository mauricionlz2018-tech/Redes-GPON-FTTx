import re

with open('scratch/generate_all_design_diagrams.py', 'r', encoding='utf-8') as f:
    code = f.read()

# Replace the top title lines
patterns = [
    # Navegacion
    (r'draw\.text\(\(W // 2, 52\), "DIAGRAMA DE NAVEGACIÓN.*?\n\s*draw\.text\(\(W // 2, 82\), "Flujo interactivo.*?\n', '# Title removed per user instruction\n'),
    # Arquitectura info
    (r'draw\.text\(\(W // 2, 52\), "DIAGRAMA DE ARQUITECTURA DE INFORMACIÓN.*?\n\s*draw\.text\(\(W // 2, 82\), "Jerarquía de módulos.*?\n', '# Title removed per user instruction\n'),
    # Estados puerto
    (r'draw\.text\(\(W // 2, 52\), "DIAGRAMA DE MÁQUINA DE ESTADOS FINITOS.*?\n\s*draw\.text\(\(W // 2, 82\), "Ciclo de vida transaccional.*?\n', '# Title removed per user instruction\n'),
    # Paquetes componentes
    (r'draw\.text\(\(W // 2, 52\), "DIAGRAMA DE PAQUETES Y COMPONENTES.*?\n\s*draw\.text\(\(W // 2, 82\), "Arquitectura multicapa.*?\n', '# Title removed per user instruction\n'),
    # Robustez
    (r'draw\.text\(\(W // 2, 52\), "DIAGRAMA DE ROBUSTEZ V-O-C.*?\n\s*draw\.text\(\(W // 2, 82\), "Análisis semántico.*?\n', '# Title removed per user instruction\n'),
    # Secuencia offline
    (r'draw\.text\(\(W // 2, 52\), "DIAGRAMA DE SECUENCIA UML.*?\n\s*draw\.text\(\(W // 2, 82\), "Flujo temporal.*?\n', '# Title removed per user instruction\n'),
    # Topologia GPON
    (r'draw\.text\(\(W // 2, 52\), "DIAGRAMA DE TOPOLOGÍA LÓGICA Y FÍSICA.*?\n\s*draw\.text\(\(W // 2, 82\), "Jerarquía de distribución.*?\n', '# Title removed per user instruction\n'),
]

for pat, repl in patterns:
    code = re.sub(pat, repl, code)

with open('scratch/generate_all_design_diagrams.py', 'w', encoding='utf-8') as f:
    f.write(code)

print("Updated scratch/generate_all_design_diagrams.py successfully!")

