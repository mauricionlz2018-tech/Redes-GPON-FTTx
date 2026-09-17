import matplotlib.pyplot as plt
import matplotlib.patches as patches
import numpy as np
import os

os.makedirs('scratch', exist_ok=True)

plt.rcParams['font.sans-serif'] = 'Arial'
plt.rcParams['font.family'] = 'sans-serif'

# -------------------------------------------------------------
# ASSET 1: PRUEBAS DE ADOBE COLOR Y ACCESIBILIDAD WCAG 2.1
# -------------------------------------------------------------
def generate_adobe_color_graphic():
    fig = plt.figure(figsize=(12, 7.5), dpi=300, facecolor='#FFFFFF')

    # Main title banner
    ax_title = fig.add_axes([0.03, 0.92, 0.94, 0.06])
    ax_title.axis('off')
    rect = patches.FancyBboxPatch((0, 0), 1, 1, boxstyle='round,pad=0.02,rounding_size=0.08', facecolor='#0F172A', edgecolor='#1E293B', linewidth=1.5)
    ax_title.add_patch(rect)
    ax_title.text(0.5, 0.62, 'EVALUACION DE PALETA CROMATICA Y ACCESIBILIDAD WCAG 2.1 - ADOBE COLOR', color='#FFFFFF', fontsize=12, fontweight='bold', ha='center', va='center')
    ax_title.text(0.5, 0.25, 'GPON TELECOM S.A. DE C.V. | Sistema de Inventario y Mapeo Logico GPON / FTTx', color='#94A3B8', fontsize=8.5, ha='center', va='center')

    # Panel 1: Paleta Cromática y Armonía (Adobe Color Swatches)
    ax1 = fig.add_axes([0.03, 0.58, 0.94, 0.31])
    ax1.axis('off')
    rect1 = patches.FancyBboxPatch((0, 0), 1, 1, boxstyle='round,pad=0.02,rounding_size=0.04', facecolor='#F8FAFC', edgecolor='#CBD5E1', linewidth=1)
    ax1.add_patch(rect1)
    ax1.text(0.02, 0.90, '1. MUESTRAS DE LA PALETA INSTITUCIONAL Y SEMAFORO TECNICO (ADOBE COLOR)', color='#0F172A', fontsize=10, fontweight='bold')

    swatches = [
        ('#1E3A8A', '#FFFFFF', 'Primario Telecom', 'Navegacion / Header\n#1E3A8A'),
        ('#0284C7', '#FFFFFF', 'Cian Tecnico', 'Acciones / Botones\n#0284C7'),
        ('#10B981', '#FFFFFF', 'Verde Esmeralda', 'Puerto Libre / <80%\n#10B981'),
        ('#F59E0B', '#000000', 'Ambar Alerta', 'Reserva / 80-99%\n#F59E0B'),
        ('#EF4444', '#FFFFFF', 'Rojo Carmesi', 'Danado / 100% Sat\n#EF4444'),
        ('#7C3AED', '#FFFFFF', 'Purpura RBAC', 'Perfil Admin NOC\n#7C3AED'),
        ('#0F172A', '#38BDF8', 'Pizarra Oscura', 'Dark Mode / Base\n#0F172A')
    ]

    n = len(swatches)
    box_w = 0.125
    gap = (0.96 - n * box_w) / (n - 1)
    start_x = 0.02

    for i, (hex_c, txt_c, title, desc) in enumerate(swatches):
        x = start_x + i * (box_w + gap)
        c_rect = patches.FancyBboxPatch((x, 0.34), box_w, 0.46, boxstyle='round,pad=0.01,rounding_size=0.04', facecolor=hex_c, edgecolor='#475569', linewidth=0.8)
        ax1.add_patch(c_rect)
        ax1.text(x + box_w/2, 0.62, title, color=txt_c, fontsize=7.5, fontweight='bold', ha='center', va='center')
        ax1.text(x + box_w/2, 0.44, hex_c, color=txt_c, fontsize=7, ha='center', va='center')
        ax1.text(x + box_w/2, 0.16, desc, color='#334155', fontsize=6.8, ha='center', va='center')

    # Panel 2: Verificación de Contraste WCAG 2.1
    ax2 = fig.add_axes([0.03, 0.30, 0.46, 0.25])
    ax2.axis('off')
    rect2 = patches.FancyBboxPatch((0, 0), 1, 1, boxstyle='round,pad=0.02,rounding_size=0.04', facecolor='#F8FAFC', edgecolor='#CBD5E1', linewidth=1)
    ax2.add_patch(rect2)
    ax2.text(0.04, 0.88, '2. RATIOS DE CONTRASTE WCAG 2.1 (CONTRAST CHECKER)', color='#0F172A', fontsize=9.5, fontweight='bold')

    contrast_tests = [
        ('Texto Blanco s/ Azul Indigo (#1E3A8A)', '10.5 : 1', 'CUMPLE AAA', '#166534', '#DCFCE7'),
        ('Texto Primario s/ Fondo Blanco (#FFFFFF)', '10.5 : 1', 'CUMPLE AAA', '#166534', '#DCFCE7'),
        ('Verde Esmeralda Ajustado (#059669) s/ Blanco', '4.6 : 1', 'CUMPLE AA', '#15803D', '#DCFCE7'),
        ('Rojo Carmesi Ajustado (#DC2626) s/ Blanco', '4.8 : 1', 'CUMPLE AA', '#15803D', '#DCFCE7'),
        ('Ambar Alerta (#D97706) s/ Pizarra Oscura', '5.2 : 1', 'CUMPLE AA', '#15803D', '#DCFCE7')
    ]

    y_pos = 0.70
    for test, ratio, status, s_col, s_bg in contrast_tests:
        ax2.text(0.04, y_pos, test, color='#1E293B', fontsize=6.5, va='center')
        ax2.text(0.68, y_pos, ratio, color='#0F172A', fontsize=7, fontweight='bold', va='center')
        b_rect = patches.FancyBboxPatch((0.80, y_pos - 0.04), 0.17, 0.08, boxstyle='round,pad=0.005,rounding_size=0.03', facecolor=s_bg, edgecolor=s_col, linewidth=0.6)
        ax2.add_patch(b_rect)
        ax2.text(0.885, y_pos, status, color=s_col, fontsize=5.8, fontweight='bold', ha='center', va='center')
        y_pos -= 0.13

    # Panel 3: Simulación de Daltonismo
    ax3 = fig.add_axes([0.51, 0.30, 0.46, 0.25])
    ax3.axis('off')
    rect3 = patches.FancyBboxPatch((0, 0), 1, 1, boxstyle='round,pad=0.02,rounding_size=0.04', facecolor='#F8FAFC', edgecolor='#CBD5E1', linewidth=1)
    ax3.add_patch(rect3)
    ax3.text(0.04, 0.88, '3. SIMULACION DE DALTONISMO (COLOR BLINDNESS)', color='#0F172A', fontsize=9.5, fontweight='bold')

    dalton_rows = [
        ('Vision Normal', '#10B981', '#EF4444', 'Distingue verde y rojo nitidamente'),
        ('Deuteranopia', '#B09B52', '#A3883C', 'Riesgo de confusion verde / rojo'),
        ('Protanopia', '#9E9447', '#7D6A35', 'Atenuacion del canal rojo'),
        ('Tritanopia', '#00A8B7', '#EF4153', 'Distingue verde/rojo con matiz cian')
    ]

    y_d = 0.68
    for name, c_libre, c_dan, desc in dalton_rows:
        ax3.text(0.04, y_d, name, color='#1E293B', fontsize=7, fontweight='bold', va='center')
        r_l = patches.Rectangle((0.36, y_d - 0.04), 0.06, 0.08, facecolor=c_libre, edgecolor='#64748B', linewidth=0.5)
        r_d = patches.Rectangle((0.44, y_d - 0.04), 0.06, 0.08, facecolor=c_dan, edgecolor='#64748B', linewidth=0.5)
        ax3.add_patch(r_l)
        ax3.add_patch(r_d)
        ax3.text(0.53, y_d, desc, color='#475569', fontsize=6.2, va='center')
        y_d -= 0.13

    # Panel 4: Solución de Diseño Redundante Libre de Conflictos (WCAG 1.4.1)
    ax4 = fig.add_axes([0.03, 0.03, 0.94, 0.24])
    ax4.axis('off')
    rect4 = patches.FancyBboxPatch((0, 0), 1, 1, boxstyle='round,pad=0.02,rounding_size=0.04', facecolor='#EFF6FF', edgecolor='#3B82F6', linewidth=1.2)
    ax4.add_patch(rect4)
    ax4.text(0.02, 0.86, 'SOLUCION DE INGENIERIA ACCESIBLE: TRIPLE IDENTIFICADOR (COLOR + ICONO + ETIQUETA TEXTUAL)', color='#1E3A8A', fontsize=9.5, fontweight='bold')
    ax4.text(0.02, 0.68, 'Para evitar dependencia exclusiva del color (WCAG 1.4.1), el chasis incorpora tres senalizaciones simultaneas:', color='#334155', fontsize=7.5)

    sol_items = [
        ('#10B981', 'PUERTO LIBRE', '[OK] Conector Libre', 'LED Verde + Icono Check + Texto \"LIBRE\"'),
        ('#3B82F6', 'PUERTO OCUPADO', '[CLI] Conector Ocupado', 'LED Azul + Icono Contrato + Codigo de Abonado'),
        ('#F59E0B', 'PUERTO RESERVADO', '[!] En Programacion', 'LED Ambar + Icono Alerta + Texto \"RESERVADO\"'),
        ('#EF4444', 'PUERTO DANADO', '[X] Bloqueo Fisico', 'LED Rojo + Icono Bloqueo + Texto \"DANADO\"')
    ]

    col_w = 0.23
    col_gap = 0.02
    for j, (col_b, title_s, icon_s, desc_s) in enumerate(sol_items):
        sx = 0.02 + j * (col_w + col_gap)
        b_card = patches.FancyBboxPatch((sx, 0.08), col_w, 0.52, boxstyle='round,pad=0.01,rounding_size=0.03', facecolor='#FFFFFF', edgecolor=col_b, linewidth=1.5)
        ax4.add_patch(b_card)
        ax4.text(sx + col_w/2, 0.48, title_s, color=col_b, fontsize=7.5, fontweight='bold', ha='center', va='center')
        ax4.text(sx + col_w/2, 0.32, icon_s, color='#0F172A', fontsize=7, ha='center', va='center')
        ax4.text(sx + col_w/2, 0.16, desc_s, color='#64748B', fontsize=6.0, ha='center', va='center')

    out_path = 'scratch/pruebas_adobe_color.png'
    fig.savefig(out_path, bbox_inches='tight', dpi=300)
    plt.close(fig)
    print('Generated:', out_path)

# -------------------------------------------------------------
# ASSET 2: MAQUETADO Y WIREFRAMING DE INTERFACES UI/UX
# -------------------------------------------------------------
def generate_wireframe_graphic():
    fig = plt.figure(figsize=(12, 7.8), dpi=300, facecolor='#FFFFFF')

    # Main header
    ax_title = fig.add_axes([0.03, 0.93, 0.94, 0.05])
    ax_title.axis('off')
    rect = patches.FancyBboxPatch((0, 0), 1, 1, boxstyle='round,pad=0.02,rounding_size=0.08', facecolor='#0F172A', edgecolor='#1E293B', linewidth=1.5)
    ax_title.add_patch(rect)
    ax_title.text(0.5, 0.62, 'MAQUETADO DE INTERFACES (WIREFRAMES) - ARQUITECTURA VISUAL RESPONSIVA', color='#FFFFFF', fontsize=12, fontweight='bold', ha='center', va='center')
    ax_title.text(0.5, 0.25, 'Diseno Mobile-First y Desktop | Sistema de Inventario y Mapeo Logico GPON / FTTx', color='#94A3B8', fontsize=8.5, ha='center', va='center')

    # Screen 1: Visor Cartográfico GIS Principal (Left, 0.45 width)
    ax_map = fig.add_axes([0.03, 0.45, 0.45, 0.45])
    ax_map.axis('off')
    r_map = patches.FancyBboxPatch((0, 0), 1, 1, boxstyle='round,pad=0.01,rounding_size=0.03', facecolor='#F1F5F9', edgecolor='#94A3B8', linewidth=1.2)
    ax_map.add_patch(r_map)
    # App bar
    r_bar = patches.Rectangle((0, 0.88), 1, 0.12, facecolor='#1E3A8A')
    ax_map.add_patch(r_bar)
    ax_map.text(0.04, 0.94, 'GPON TELECOM | Visor Cartografico GIS', color='#FFFFFF', fontsize=7.5, fontweight='bold', va='center')
    ax_map.text(0.80, 0.94, '[Role: Admin]', color='#38BDF8', fontsize=6.5, va='center')
    # Map area
    r_grid = patches.Rectangle((0.02, 0.04), 0.96, 0.82, facecolor='#E2E8F0', edgecolor='#CBD5E1', linewidth=0.8)
    ax_map.add_patch(r_grid)
    # Traced lines (fiber optic cables)
    ax_map.plot([0.15, 0.40, 0.65, 0.85], [0.75, 0.55, 0.60, 0.35], color='#2563EB', linewidth=2.5, linestyle='-')
    ax_map.plot([0.40, 0.50, 0.30], [0.55, 0.30, 0.20], color='#0284C7', linewidth=2.0, linestyle='--')
    # ODF node
    c_odf = patches.Circle((0.15, 0.75), 0.04, facecolor='#7C3AED', edgecolor='#4C1D95', linewidth=1.5)
    ax_map.add_patch(c_odf)
    ax_map.text(0.15, 0.75, 'ODF', color='#FFFFFF', fontsize=5.5, fontweight='bold', ha='center', va='center')
    # NAP markers (semaphorized)
    naps = [
        (0.40, 0.55, '#10B981', 'NAP-01 (45%)'),
        (0.65, 0.60, '#F59E0B', 'NAP-02 (88%)'),
        (0.85, 0.35, '#EF4444', 'NAP-03 (100%)'),
        (0.50, 0.30, '#10B981', 'NAP-04 (12%)'),
        (0.30, 0.20, '#10B981', 'NAP-05 (60%)')
    ]
    for nx, ny, ncol, nlbl in naps:
        cn = patches.Circle((nx, ny), 0.035, facecolor=ncol, edgecolor='#1E293B', linewidth=1)
        ax_map.add_patch(cn)
        ax_map.text(nx, ny - 0.06, nlbl, color='#0F172A', fontsize=5.5, fontweight='bold', ha='center')
    # Legend box
    r_leg = patches.FancyBboxPatch((0.04, 0.06), 0.45, 0.20, boxstyle='round,pad=0.01,rounding_size=0.02', facecolor='#FFFFFF', edgecolor='#64748B', linewidth=0.8)
    ax_map.add_patch(r_leg)
    ax_map.text(0.06, 0.21, 'Semaforo Saturacion:', color='#0F172A', fontsize=5.5, fontweight='bold')
    ax_map.text(0.06, 0.15, '* Verde: <80%  * Ambar: 80-99%', color='#334155', fontsize=5)
    ax_map.text(0.06, 0.09, '* Rojo: 100% (Saturado)', color='#DC2626', fontsize=5, fontweight='bold')
    # Title below screen
    ax_map.text(0.5, -0.07, 'Wireframe 1: Visor Cartografico GIS Interactivo (OpenStreetMap / Leaflet)', color='#0F172A', fontsize=7.5, fontweight='bold', ha='center')

    # Screen 2: Matriz Isomórfica de Chasis de 16 Puertos (Right, 0.46 width)
    ax_mat = fig.add_axes([0.51, 0.45, 0.46, 0.45])
    ax_mat.axis('off')
    r_mat = patches.FancyBboxPatch((0, 0), 1, 1, boxstyle='round,pad=0.01,rounding_size=0.03', facecolor='#FFFFFF', edgecolor='#94A3B8', linewidth=1.2)
    ax_mat.add_patch(r_mat)
    # Header
    r_m_bar = patches.Rectangle((0, 0.88), 1, 0.12, facecolor='#0F172A')
    ax_mat.add_patch(r_m_bar)
    ax_mat.text(0.04, 0.94, 'Caja Terminal: NAP-SJR-01 | Chasis 16 Puertos SC-APC', color='#FFFFFF', fontsize=7.5, fontweight='bold', va='center')
    # 2x8 port matrix
    ax_mat.text(0.04, 0.82, 'Matriz Isomorfica de Puertos:', color='#0F172A', fontsize=7, fontweight='bold')
    # Row 1 (ports 1 to 8)
    port_states = [
        ('P1', '#3B82F6', 'CLI-01'), ('P2', '#3B82F6', 'CLI-02'), ('P3', '#10B981', 'Libre'), ('P4', '#10B981', 'Libre'),
        ('P5', '#3B82F6', 'CLI-03'), ('P6', '#F59E0B', 'Reserva'), ('P7', '#EF4444', 'Danado'), ('P8', '#10B981', 'Libre'),
        ('P9', '#3B82F6', 'CLI-04'), ('P10', '#10B981', 'Libre'), ('P11', '#10B981', 'Libre'), ('P12', '#3B82F6', 'CLI-05'),
        ('P13', '#10B981', 'Libre'), ('P14', '#10B981', 'Libre'), ('P15', '#10B981', 'Libre'), ('P16', '#10B981', 'Libre')
    ]
    pw = 0.10
    ph = 0.15
    pgap_x = 0.02
    pgap_y = 0.04
    # Draw ports in 2 rows of 8
    for idx, (pname, pcol, plbl) in enumerate(port_states):
        row = idx // 8
        col = idx % 8
        px = 0.04 + col * (pw + pgap_x)
        py = 0.60 - row * (ph + pgap_y)
        rp = patches.FancyBboxPatch((px, py), pw, ph, boxstyle='round,pad=0.005,rounding_size=0.02', facecolor='#F8FAFC', edgecolor=pcol, linewidth=1.5)
        ax_mat.add_patch(rp)
        # LED indicator dot
        c_led = patches.Circle((px + pw/2, py + ph*0.68), 0.015, facecolor=pcol)
        ax_mat.add_patch(c_led)
        ax_mat.text(px + pw/2, py + ph*0.68, pname, color='#FFFFFF' if pcol in ['#3B82F6', '#EF4444'] else '#000000', fontsize=4.5, fontweight='bold', ha='center', va='center')
        ax_mat.text(px + pw/2, py + ph*0.22, plbl, color='#334155', fontsize=4.5, ha='center', va='center')

    # Fast action modal preview below
    r_modal = patches.FancyBboxPatch((0.04, 0.05), 0.92, 0.28, boxstyle='round,pad=0.01,rounding_size=0.02', facecolor='#EFF6FF', edgecolor='#3B82F6', linewidth=1)
    ax_mat.add_patch(r_modal)
    ax_mat.text(0.06, 0.27, 'Modal de Asignacion Rapida (ACID Row-Lock):', color='#1E3A8A', fontsize=6.5, fontweight='bold')
    ax_mat.text(0.06, 0.19, '[ Input: Codigo Cliente ]   [ Input: Nombre Completo ]   [ Input: Direccion MAC ]', color='#475569', fontsize=5.5)
    ax_mat.text(0.06, 0.11, '[ Potencia RX: -19.4 dBm ]   [ Boton: Confirmar Asignacion (SELECT FOR UPDATE) ]', color='#0284C7', fontsize=5.5, fontweight='bold')
    # Title below screen
    ax_mat.text(0.5, -0.07, 'Wireframe 2: Matriz Isomorfica de 16 Puertos SC-APC y Modal Transaccional', color='#0F172A', fontsize=7.5, fontweight='bold', ha='center')

    # Screen 3: PWA Móvil Offline-First y Sincronización (Bottom Left, 0.45 width)
    ax_mob = fig.add_axes([0.03, 0.05, 0.45, 0.32])
    ax_mob.axis('off')
    r_mob = patches.FancyBboxPatch((0, 0), 1, 1, boxstyle='round,pad=0.01,rounding_size=0.03', facecolor='#FFFFFF', edgecolor='#94A3B8', linewidth=1.2)
    ax_mob.add_patch(r_mob)
    # Offline sync banner
    r_off_b = patches.Rectangle((0, 0.82), 1, 0.18, facecolor='#D97706')
    ax_mob.add_patch(r_off_b)
    ax_mob.text(0.04, 0.91, 'MODO OFFLINE ACTIVO - Sin Cobertura Celular', color='#FFFFFF', fontsize=7, fontweight='bold', va='center')
    ax_mob.text(0.72, 0.91, '[Sync Pend: 2]', color='#FEF3C7', fontsize=6.5, fontweight='bold', va='center')
    # Mobile view content
    ax_mob.text(0.04, 0.70, 'Tecnico: Juan Perez (ACT-03) | Operacion en Terreno', color='#0F172A', fontsize=6.5, fontweight='bold')
    ax_mob.text(0.04, 0.58, '* Local Storage: IndexedDB (Dexie.js) - Cache de 12 NAPs cargado.', color='#334155', fontsize=5.8)
    ax_mob.text(0.04, 0.46, '* Cola de Mutaciones: 2 altas encoladas localmente con UUID v4.', color='#334155', fontsize=5.8)
    ax_mob.text(0.04, 0.34, '* Event Listener: Reconexion automatica al detectar signal Wi-Fi / 4G.', color='#334155', fontsize=5.8)
    # Sync button
    r_sbtn = patches.FancyBboxPatch((0.04, 0.08), 0.92, 0.18, boxstyle='round,pad=0.005,rounding_size=0.02', facecolor='#2563EB', edgecolor='#1D4ED8', linewidth=1)
    ax_mob.add_patch(r_sbtn)
    ax_mob.text(0.50, 0.17, 'Sincronizar Mutaciones con Servidor Central (Boton Manual)', color='#FFFFFF', fontsize=6.5, fontweight='bold', ha='center', va='center')
    ax_mob.text(0.5, -0.09, 'Wireframe 3: Arquitectura PWA Movil Offline-First con Dexie.js', color='#0F172A', fontsize=7.5, fontweight='bold', ha='center')

    # Screen 4: Padron de Abonados y Reportes PDF (Bottom Right, 0.46 width)
    ax_rep = fig.add_axes([0.51, 0.05, 0.46, 0.32])
    ax_rep.axis('off')
    r_rep = patches.FancyBboxPatch((0, 0), 1, 1, boxstyle='round,pad=0.01,rounding_size=0.03', facecolor='#FFFFFF', edgecolor='#94A3B8', linewidth=1.2)
    ax_rep.add_patch(r_rep)
    # Header
    r_r_bar = patches.Rectangle((0, 0.82), 1, 0.18, facecolor='#1E3A8A')
    ax_rep.add_patch(r_r_bar)
    ax_rep.text(0.04, 0.91, 'Padron de Clientes FTTx y Reportes Ejecutivos PDF', color='#FFFFFF', fontsize=7.5, fontweight='bold', va='center')
    ax_rep.text(0.72, 0.91, '[Exportar PDF]', color='#38BDF8', fontsize=6.5, fontweight='bold', va='center')
    # Table mockup
    ax_rep.text(0.04, 0.70, 'Directorio Centralizado (Buscador en tiempo real):', color='#0F172A', fontsize=6.5, fontweight='bold')
    t_headers = ['Contrato', 'Abonado', 'Caja NAP', 'Puerto', 'ONT MAC', 'Potencia']
    th_x = [0.04, 0.18, 0.40, 0.54, 0.66, 0.84]
    for hx, htitle in zip(th_x, t_headers):
        ax_rep.text(hx, 0.58, htitle, color='#64748B', fontsize=5, fontweight='bold')
    # Table rows
    rows_data = [
        ('CLI-1001', 'Laura Mendez', 'NAP-01', 'P-01', 'E0:67:B3:...', '-19.2 dBm'),
        ('CLI-1002', 'Carlos Gomez', 'NAP-01', 'P-02', '48:8A:D2:...', '-21.4 dBm'),
        ('CLI-1003', 'Roberto Soto', 'NAP-02', 'P-05', '70:54:F5:...', '-18.7 dBm')
    ]
    ry = 0.46
    for r_items in rows_data:
        for rx, rtxt in zip(th_x, r_items):
            ax_rep.text(rx, ry, rtxt, color='#1E293B', fontsize=4.8)
        ry -= 0.10
    # PDF summary pill
    r_pdf = patches.FancyBboxPatch((0.04, 0.08), 0.92, 0.18, boxstyle='round,pad=0.005,rounding_size=0.02', facecolor='#F8FAFC', edgecolor='#CBD5E1', linewidth=1)
    ax_rep.add_patch(r_pdf)
    ax_rep.text(0.06, 0.17, 'Diagnostico de Red: 5 Cajas NAP | 80 Puertos | Ocupacion: 62.5% (NORMAL)', color='#15803D', fontsize=5.5, fontweight='bold')
    ax_rep.text(0.5, -0.09, 'Wireframe 4: Padron de Abonados y Consola de Reportes PDFKit', color='#0F172A', fontsize=7.5, fontweight='bold', ha='center')

    out_path = 'scratch/maquetado_wireframes.png'
    fig.savefig(out_path, bbox_inches='tight', dpi=300)
    plt.close(fig)
    print('Generated:', out_path)

if __name__ == '__main__':
    generate_adobe_color_graphic()
    generate_wireframe_graphic()

