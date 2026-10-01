import os
from PIL import Image

diagrams = [
    'scratch/diag_cu_mod1_seguridad.png',
    'scratch/diag_cu_mod2_gis_naps.png',
    'scratch/diag_cu_mod3_puertos_clientes.png',
    'scratch/diag_cu_mod4_offline_reportes.png',
    'scratch/diag_actividades_asignacion_gpon.png',
    'scratch/diag_clases_dominio_gpon.png',
    'scratch/diag_navegacion_sistema.png',
    'scratch/diag_arquitectura_informacion.png',
    'scratch/diag_estados_puerto.png',
    'scratch/diag_paquetes_componentes.png',
    'scratch/diag_robustez_asignacion.png',
    'scratch/diag_secuencia_offline.png',
    'scratch/diag_secuencia_select_for_update.png',
    'scratch/diag_topologia_gpon.png',
    'scratch/diagrama_er_chen_gpon.png',
    'scratch/diagrama_flujo_global_proyecto.png'
]

print("=== CHECKING ALL GENERATED DIAGRAMS ===")
for d in diagrams:
    if not os.path.exists(d):
        print(f"MISSING: {d}")
        continue
    im = Image.open(d)
    # Check monochrome
    if im.mode == 'RGB':
        # check if all channels match
        rgb = im.split()
        diff1 = Image.eval(rgb[0], lambda x: x)
        # sample check
        colors = im.getcolors(maxcolors=256)
        is_mono = True
        for count, col in colors or []:
            if isinstance(col, tuple) and (col[0] != col[1] or col[1] != col[2]):
                is_mono = False
                break
    else:
        is_mono = True # Mode 'L'
    print(f"OK: {d} | Size: {im.size} | Mode: {im.mode} | Mono: {is_mono}")

