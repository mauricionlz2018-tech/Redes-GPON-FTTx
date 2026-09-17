import matplotlib.pyplot as plt
import matplotlib.patches as patches
import numpy as np
from PIL import Image
import os

os.makedirs('scratch', exist_ok=True)
plt.rcParams['font.sans-serif'] = 'Arial'
plt.rcParams['font.family'] = 'sans-serif'

# ==============================================================================
# 1. PROCESS CLEAN USE CASE DIAGRAM (from user's upload media_1789662166327.png)
# ==============================================================================
def process_use_case_diagram():
    src = r'C:\Users\karen\.gemini\antigravity\brain\a33b5b22-c89b-4ff3-a6cc-733a0c69ceac\.user_uploaded\media_1789662166327.png'
    dst = 'scratch/diagrama_casos_de_uso_clean.png'
    im = Image.open(src)
    # Convert to RGB with white background
    rgb = Image.new('RGB', im.size, (255, 255, 255))
    if im.mode in ('RGBA', 'LA'):
        rgb.paste(im, mask=im.split()[3])
    else:
        rgb.paste(im)
    rgb.save(dst, 'PNG', quality=95)
    print("Use case diagram saved to", dst)

# ==============================================================================
# 2. MOCKUP 1: VISOR CARTOGRAFICO GIS (NO TOP TITLE BAR)
# ==============================================================================
def generate_mockup_gis():
    fig = plt.figure(figsize=(10, 6.2), dpi=300, facecolor='#FFFFFF')
    ax = fig.add_axes([0, 0, 1, 1])
    ax.axis('off')
    
    # Outer browser window frame
    r_frame = patches.Rectangle((0.02, 0.02), 0.96, 0.96, facecolor='#F8FAFC', edgecolor='#CBD5E1', linewidth=1.2)
    ax.add_patch(r_frame)
    
    # Browser / App top bar
    r_bar = patches.Rectangle((0.02, 0.90), 0.96, 0.08, facecolor='#1E3A8A')
    ax.add_patch(r_bar)
    ax.text(0.05, 0.94, 'GPON TELECOM  |  Sistema de Inventario y Mapeo Lógico GPON / FTTx', color='#FFFFFF', fontsize=9.5, fontweight='bold', va='center')
    ax.text(0.72, 0.94, 'Rol: Administrador NOC', color='#93C5FD', fontsize=8, va='center')
    ax.text(0.89, 0.94, '● En línea', color='#34D399', fontsize=8, fontweight='bold', va='center')
    
    # Map area (simulating Leaflet canvas)
    r_map = patches.Rectangle((0.04, 0.05), 0.92, 0.83, facecolor='#E2E8F0', edgecolor='#94A3B8', linewidth=1)
    ax.add_patch(r_map)
    
    # Grid lines simulating street grid of San José del Rincón
    for y in np.linspace(0.12, 0.82, 7):
        ax.plot([0.04, 0.96], [y, y], color='#CBD5E1', linewidth=0.8, linestyle=':')
    for x in np.linspace(0.08, 0.92, 8):
        ax.plot([x, x], [0.05, 0.88], color='#CBD5E1', linewidth=0.8, linestyle=':')
        
    # Roads
    ax.plot([0.05, 0.35, 0.60, 0.92], [0.80, 0.65, 0.45, 0.20], color='#FFFFFF', linewidth=4.5)
    ax.plot([0.05, 0.35, 0.60, 0.92], [0.80, 0.65, 0.45, 0.20], color='#94A3B8', linewidth=1.5)
    ax.plot([0.35, 0.45, 0.55], [0.65, 0.30, 0.10], color='#FFFFFF', linewidth=4.5)
    ax.plot([0.35, 0.45, 0.55], [0.65, 0.30, 0.10], color='#94A3B8', linewidth=1.5)

    # Fiber optic trunk line (poly-line)
    ax.plot([0.15, 0.38, 0.62, 0.82], [0.72, 0.52, 0.58, 0.30], color='#2563EB', linewidth=3.0, linestyle='-', label='Troncal Principal')
    ax.plot([0.38, 0.48, 0.28], [0.52, 0.28, 0.18], color='#0284C7', linewidth=2.2, linestyle='--', label='Ramal de Distribución')

    # ODF Central marker
    c_odf = patches.Circle((0.15, 0.72), 0.038, facecolor='#7C3AED', edgecolor='#4C1D95', linewidth=2)
    ax.add_patch(c_odf)
    ax.text(0.15, 0.72, 'ODF', color='#FFFFFF', fontsize=7, fontweight='bold', ha='center', va='center')
    ax.text(0.15, 0.78, 'Central NOC (ODF-01)', color='#1E1B4B', fontsize=7.5, fontweight='bold', ha='center')

    # NAP Markers with real coordinates and status
    nap_markers = [
        (0.38, 0.52, '#10B981', 'NAP-SJR-01\n(45% - 7/16 libres)', 'Normal'),
        (0.62, 0.58, '#F59E0B', 'NAP-SJR-02\n(88% - 2/16 libres)', 'Preventivo'),
        (0.82, 0.30, '#EF4444', 'NAP-SJR-03\n(100% - Saturada)', 'Crítico'),
        (0.48, 0.28, '#10B981', 'NAP-SJR-04\n(25% - 12/16 libres)', 'Normal'),
        (0.28, 0.18, '#10B981', 'NAP-SJR-05\n(62% - 6/16 libres)', 'Normal')
    ]
    for nx, ny, ncol, nlbl, nstatus in nap_markers:
        cn = patches.Circle((nx, ny), 0.032, facecolor=ncol, edgecolor='#1E293B', linewidth=1.5)
        ax.add_patch(cn)
        ax.text(nx, ny - 0.055, nlbl, color='#0F172A', fontsize=6.2, fontweight='bold', ha='center')

    # Floating zoom and layer controls
    r_ctrl = patches.FancyBboxPatch((0.06, 0.70), 0.04, 0.12, boxstyle='round,pad=0.005,rounding_size=0.01', facecolor='#FFFFFF', edgecolor='#CBD5E1', linewidth=1)
    ax.add_patch(r_ctrl)
    ax.text(0.08, 0.78, '+', fontsize=12, fontweight='bold', ha='center', va='center')
    ax.plot([0.065, 0.095], [0.76, 0.76], color='#CBD5E1', linewidth=1)
    ax.text(0.08, 0.73, '−', fontsize=12, fontweight='bold', ha='center', va='center')

    # Floating Legend Card
    r_leg = patches.FancyBboxPatch((0.06, 0.08), 0.36, 0.22, boxstyle='round,pad=0.01,rounding_size=0.02', facecolor='#FFFFFF', edgecolor='#64748B', linewidth=1)
    ax.add_patch(r_leg)
    ax.text(0.08, 0.26, 'Semáforo de Saturación NAP:', color='#0F172A', fontsize=7.5, fontweight='bold')
    # Legend dots
    ax.add_patch(patches.Circle((0.09, 0.21), 0.012, facecolor='#10B981'))
    ax.text(0.12, 0.21, 'Disponible (< 80% ocupación)', color='#334155', fontsize=6.8, va='center')
    ax.add_patch(patches.Circle((0.09, 0.16), 0.012, facecolor='#F59E0B'))
    ax.text(0.12, 0.16, 'Preventivo (80% - 99% ocupación)', color='#334155', fontsize=6.8, va='center')
    ax.add_patch(patches.Circle((0.09, 0.11), 0.012, facecolor='#EF4444'))
    ax.text(0.12, 0.11, 'Crítico (100% saturada / 0 libres)', color='#DC2626', fontsize=6.8, fontweight='bold', va='center')

    # Selected NAP Details Popup
    r_pop = patches.FancyBboxPatch((0.55, 0.65), 0.38, 0.20, boxstyle='round,pad=0.01,rounding_size=0.02', facecolor='#FFFFFF', edgecolor='#0284C7', linewidth=1.5)
    ax.add_patch(r_pop)
    ax.text(0.57, 0.81, 'Caja Seleccionada: NAP-SJR-01', color='#0284C7', fontsize=8, fontweight='bold')
    ax.text(0.57, 0.76, 'Ubicación: Av. Hidalgo esq. Morelos, San José del Rincón', color='#475569', fontsize=6.5)
    ax.text(0.57, 0.71, 'Coordenadas GPS: 19.664210, -100.158420', color='#475569', fontsize=6.5)
    ax.text(0.57, 0.67, 'Capacidad: 16 Puertos SC-APC  |  9 Ocupados  |  7 Libres', color='#166534', fontsize=6.8, fontweight='bold')

    dst = 'scratch/mockup_gis_map.png'
    fig.savefig(dst, bbox_inches='tight', dpi=300)
    plt.close(fig)
    print("Saved", dst)

# ==============================================================================
# 3. MOCKUP 2: MATRIZ DE 16 PUERTOS SC-APC (NO TOP TITLE BAR)
# ==============================================================================
def generate_mockup_chassis():
    fig = plt.figure(figsize=(10, 6.2), dpi=300, facecolor='#FFFFFF')
    ax = fig.add_axes([0, 0, 1, 1])
    ax.axis('off')
    
    # Outer frame
    r_frame = patches.Rectangle((0.02, 0.02), 0.96, 0.96, facecolor='#F8FAFC', edgecolor='#CBD5E1', linewidth=1.2)
    ax.add_patch(r_frame)
    
    # Sub-header
    r_head = patches.Rectangle((0.02, 0.90), 0.96, 0.08, facecolor='#0F172A')
    ax.add_patch(r_head)
    ax.text(0.05, 0.94, 'Detalle de Caja Terminal: NAP-SJR-01  |  Matriz de Chasis Físico (16 Puertos)', color='#FFFFFF', fontsize=9.5, fontweight='bold', va='center')
    ax.text(0.82, 0.94, 'Atenuación Media: -19.8 dBm', color='#38BDF8', fontsize=7.5, va='center')

    # Chassis physical box container (dark metallic surface)
    r_chas = patches.FancyBboxPatch((0.05, 0.48), 0.90, 0.38, boxstyle='round,pad=0.015,rounding_size=0.03', facecolor='#1E293B', edgecolor='#475569', linewidth=2)
    ax.add_patch(r_chas)
    ax.text(0.08, 0.82, 'PANEL DE CONECTORES SC-APC (DIVISOR PLC 1:16)', color='#94A3B8', fontsize=7.5, fontweight='bold')

    # Ports data (2 rows of 8)
    ports = [
        # Row 1 (1 to 8)
        ('P-01', '#3B82F6', 'CLI-1001', 'Ocupado'),
        ('P-02', '#3B82F6', 'CLI-1002', 'Ocupado'),
        ('P-03', '#10B981', 'Libre', 'Libre'),
        ('P-04', '#10B981', 'Libre', 'Libre'),
        ('P-05', '#3B82F6', 'CLI-1003', 'Ocupado'),
        ('P-06', '#F59E0B', 'Reserva', 'Reservado'),
        ('P-07', '#EF4444', 'Dañado', 'Dañado'),
        ('P-08', '#10B981', 'Libre', 'Libre'),
        # Row 2 (9 to 16)
        ('P-09', '#3B82F6', 'CLI-1004', 'Ocupado'),
        ('P-10', '#10B981', 'Libre', 'Libre'),
        ('P-11', '#10B981', 'Libre', 'Libre'),
        ('P-12', '#3B82F6', 'CLI-1005', 'Ocupado'),
        ('P-13', '#10B981', 'Libre', 'Libre'),
        ('P-14', '#10B981', 'Libre', 'Libre'),
        ('P-15', '#3B82F6', 'CLI-1006', 'Ocupado'),
        ('P-16', '#10B981', 'Libre', 'Libre')
    ]

    pw, ph = 0.095, 0.12
    gap_x, gap_y = 0.015, 0.025
    
    for idx, (pname, pcol, plbl, pstatus) in enumerate(ports):
        row = idx // 8
        col = idx % 8
        px = 0.08 + col * (pw + gap_x)
        py = 0.66 - row * (ph + gap_y)
        
        # Outer connector body
        r_p = patches.FancyBboxPatch((px, py), pw, ph, boxstyle='round,pad=0.005,rounding_size=0.015', facecolor='#0F172A', edgecolor=pcol, linewidth=1.8)
        ax.add_patch(r_p)
        
        # Optical ferrule circle
        c_fer = patches.Circle((px + pw/2, py + ph*0.65), 0.018, facecolor='#334155', edgecolor=pcol, linewidth=1)
        ax.add_patch(c_fer)
        # LED dot inside
        c_led = patches.Circle((px + pw/2, py + ph*0.65), 0.009, facecolor=pcol)
        ax.add_patch(c_led)
        
        ax.text(px + pw/2, py + ph*0.35, pname, color='#FFFFFF', fontsize=6.5, fontweight='bold', ha='center', va='center')
        ax.text(px + pw/2, py + ph*0.14, plbl, color=pcol if pcol != '#10B981' else '#34D399', fontsize=5.8, fontweight='bold', ha='center', va='center')

    # Transactional Assignment Modal (Bottom section)
    r_modal = patches.FancyBboxPatch((0.05, 0.05), 0.90, 0.38, boxstyle='round,pad=0.015,rounding_size=0.02', facecolor='#FFFFFF', edgecolor='#0284C7', linewidth=1.5)
    ax.add_patch(r_modal)
    
    # Modal Header
    ax.text(0.08, 0.38, 'ORDEN DE ASIGNACIÓN ATÓMICA DE PUERTO ÓPTICO (CONCURRENCIA ACID)', color='#1E3A8A', fontsize=8.5, fontweight='bold')
    ax.text(0.72, 0.38, 'Bloqueo: SELECT ... FOR UPDATE', color='#DC2626', fontsize=7.5, fontweight='bold')
    
    # Input fields simulated
    inputs = [
        (0.08, 0.25, 0.25, 0.07, 'Número de Contrato:', 'CLI-1025-SJR'),
        (0.36, 0.25, 0.32, 0.07, 'Nombre Completo del Abonado:', 'María Elena Mendoza Soto'),
        (0.71, 0.25, 0.21, 0.07, 'Marca de Equipo ONT:', 'Huawei EchoLife EG8145V5'),
        (0.08, 0.12, 0.28, 0.07, 'Dirección MAC (Regex):', '48:8A:D2:C1:94:E5'),
        (0.39, 0.12, 0.25, 0.07, 'Potencia RX Estimada:', '-19.45 dBm (Óptima)'),
    ]
    for ix, iy, iw, ih, ilbl, ival in inputs:
        ax.text(ix, iy + ih + 0.015, ilbl, color='#475569', fontsize=6.5, fontweight='bold')
        r_inp = patches.FancyBboxPatch((ix, iy), iw, ih, boxstyle='round,pad=0.005,rounding_size=0.01', facecolor='#F8FAFC', edgecolor='#CBD5E1', linewidth=1)
        ax.add_patch(r_inp)
        ax.text(ix + 0.015, iy + ih/2, ival, color='#0F172A', fontsize=6.8, va='center')

    # Action buttons
    r_btn = patches.FancyBboxPatch((0.68, 0.10), 0.24, 0.09, boxstyle='round,pad=0.005,rounding_size=0.01', facecolor='#2563EB', edgecolor='#1D4ED8', linewidth=1)
    ax.add_patch(r_btn)
    ax.text(0.80, 0.145, 'Confirmar Asignación Transaccional', color='#FFFFFF', fontsize=7, fontweight='bold', ha='center', va='center')

    dst = 'scratch/mockup_chassis_matrix.png'
    fig.savefig(dst, bbox_inches='tight', dpi=300)
    plt.close(fig)
    print("Saved", dst)

# ==============================================================================
# 4. MOCKUP 3: MODULO MOVIL OFFLINE-FIRST PWA (NO TOP TITLE BAR)
# ==============================================================================
def generate_mockup_mobile():
    fig = plt.figure(figsize=(10, 6.2), dpi=300, facecolor='#FFFFFF')
    ax = fig.add_axes([0, 0, 1, 1])
    ax.axis('off')
    
    # Outer frame
    r_frame = patches.Rectangle((0.02, 0.02), 0.96, 0.96, facecolor='#F8FAFC', edgecolor='#CBD5E1', linewidth=1.2)
    ax.add_patch(r_frame)
    
    # Mobile device mockup centered (smartphone form factor)
    r_phone = patches.FancyBboxPatch((0.28, 0.05), 0.44, 0.90, boxstyle='round,pad=0.015,rounding_size=0.04', facecolor='#0F172A', edgecolor='#334155', linewidth=3)
    ax.add_patch(r_phone)
    
    # Phone screen area
    r_screen = patches.FancyBboxPatch((0.30, 0.08), 0.40, 0.83, boxstyle='round,pad=0.005,rounding_size=0.02', facecolor='#FFFFFF', edgecolor='#0F172A', linewidth=1)
    ax.add_patch(r_screen)
    
    # Phone speaker notch
    ax.add_patch(patches.FancyBboxPatch((0.45, 0.88), 0.10, 0.015, boxstyle='round,pad=0.002,rounding_size=0.005', facecolor='#334155'))

    # PWA App Header
    r_pwa_h = patches.Rectangle((0.30, 0.81), 0.40, 0.07, facecolor='#1E3A8A')
    ax.add_patch(r_pwa_h)
    ax.text(0.32, 0.845, 'GPON PWA Móvil', color='#FFFFFF', fontsize=8.5, fontweight='bold', va='center')
    ax.text(0.67, 0.845, 'Técnico: ACT-03', color='#93C5FD', fontsize=6.8, va='center')

    # Offline Warning Banner (Amber)
    r_off = patches.Rectangle((0.30, 0.74), 0.40, 0.07, facecolor='#D97706')
    ax.add_patch(r_off)
    ax.text(0.32, 0.78, 'MODO SIN CONEXIÓN ACTIVO', color='#FFFFFF', fontsize=7.5, fontweight='bold', va='center')
    ax.text(0.32, 0.755, 'Zona rural sin cobertura celular. Mutaciones encoladas.', color='#FEF3C7', fontsize=5.8, va='center')

    # Queue counter card
    r_qcard = patches.FancyBboxPatch((0.32, 0.58), 0.36, 0.14, boxstyle='round,pad=0.01,rounding_size=0.015', facecolor='#EFF6FF', edgecolor='#3B82F6', linewidth=1)
    ax.add_patch(r_qcard)
    ax.text(0.34, 0.68, 'Cola de Mutaciones Locales (IndexedDB / Dexie.js):', color='#1E3A8A', fontsize=6.8, fontweight='bold')
    ax.text(0.34, 0.63, '• Asignación P-03 en NAP-SJR-01 (Contrato CLI-1025)', color='#1E293B', fontsize=6)
    ax.text(0.34, 0.595, '• Calibración GPS NAP-SJR-04: (19.6631, -100.1572)', color='#1E293B', fontsize=6)

    # Local Cache Status
    r_stat = patches.FancyBboxPatch((0.32, 0.38), 0.36, 0.17, boxstyle='round,pad=0.01,rounding_size=0.015', facecolor='#F8FAFC', edgecolor='#CBD5E1', linewidth=1)
    ax.add_patch(r_stat)
    ax.text(0.34, 0.51, 'Estado de Memoria Caché Local:', color='#0F172A', fontsize=6.8, fontweight='bold')
    ax.text(0.34, 0.46, '• 12 Cajas NAP precargadas con coordenadas', color='#166534', fontsize=6)
    ax.text(0.34, 0.42, '• Mosaico cartográfico WGS-84 disponible offline', color='#166534', fontsize=6)
    ax.text(0.34, 0.385, '• Service Worker activo (estrategia Network-First)', color='#166534', fontsize=6)

    # Big Sync Button
    r_sbtn = patches.FancyBboxPatch((0.32, 0.22), 0.36, 0.12, boxstyle='round,pad=0.01,rounding_size=0.02', facecolor='#2563EB', edgecolor='#1D4ED8', linewidth=1.5)
    ax.add_patch(r_sbtn)
    ax.text(0.50, 0.29, 'SINCRONIZAR MUTACIONES (2)', color='#FFFFFF', fontsize=8, fontweight='bold', ha='center', va='center')
    ax.text(0.50, 0.25, 'Enviar cambios pendientes a Neon PostgreSQL', color='#BFDBFE', fontsize=5.8, ha='center', va='center')

    # GPS Calibration shortcut button
    r_gps = patches.FancyBboxPatch((0.32, 0.10), 0.36, 0.09, boxstyle='round,pad=0.01,rounding_size=0.015', facecolor='#F1F5F9', edgecolor='#64748B', linewidth=1)
    ax.add_patch(r_gps)
    ax.text(0.50, 0.145, 'Calibrar Coordenadas GPS en Sitio', color='#334155', fontsize=7, fontweight='bold', ha='center', va='center')

    # Side callout boxes explaining architecture
    # Left callout
    r_c1 = patches.FancyBboxPatch((0.05, 0.52), 0.20, 0.24, boxstyle='round,pad=0.01,rounding_size=0.02', facecolor='#FFFFFF', edgecolor='#D97706', linewidth=1)
    ax.add_patch(r_c1)
    ax.text(0.06, 0.71, 'Patrón Offline-First:', color='#D97706', fontsize=7.5, fontweight='bold')
    ax.text(0.06, 0.65, 'Si el técnico pierde señal\nen campo, las mutaciones se\nguardan en IndexedDB con\nUUIDs únicos v4.', color='#475569', fontsize=6.2)
    ax.text(0.06, 0.55, 'Cero pérdida de datos.', color='#15803D', fontsize=6.5, fontweight='bold')

    # Right callout
    r_c2 = patches.FancyBboxPatch((0.75, 0.52), 0.20, 0.24, boxstyle='round,pad=0.01,rounding_size=0.02', facecolor='#FFFFFF', edgecolor='#2563EB', linewidth=1)
    ax.add_patch(r_c2)
    ax.text(0.76, 0.71, 'Sincronización en Ráfaga:', color='#2563EB', fontsize=7.5, fontweight='bold')
    ax.text(0.76, 0.65, 'Al detectar señal Wi-Fi o 4G\n(evento window.online),\nse despacha la cola de forma\nsecuencial y determinista.', color='#475569', fontsize=6.2)
    ax.text(0.76, 0.55, 'Resolución ACID en Neon.', color='#1E3A8A', fontsize=6.5, fontweight='bold')

    dst = 'scratch/mockup_mobile_offline.png'
    fig.savefig(dst, bbox_inches='tight', dpi=300)
    plt.close(fig)
    print("Saved", dst)

# ==============================================================================
# 5. MOCKUP 4: PADRON DE CLIENTES Y REPORTES PDF (NO TOP TITLE BAR)
# ==============================================================================
def generate_mockup_clients_reports():
    fig = plt.figure(figsize=(10, 6.2), dpi=300, facecolor='#FFFFFF')
    ax = fig.add_axes([0, 0, 1, 1])
    ax.axis('off')
    
    # Outer frame
    r_frame = patches.Rectangle((0.02, 0.02), 0.96, 0.96, facecolor='#F8FAFC', edgecolor='#CBD5E1', linewidth=1.2)
    ax.add_patch(r_frame)
    
    # Header bar
    r_bar = patches.Rectangle((0.02, 0.90), 0.96, 0.08, facecolor='#1E3A8A')
    ax.add_patch(r_bar)
    ax.text(0.05, 0.94, 'Directorio General de Abonados FTTx  |  Auditoría Técnica y Exportación PDF', color='#FFFFFF', fontsize=9.5, fontweight='bold', va='center')
    
    # Export button in header
    r_exp = patches.FancyBboxPatch((0.80, 0.915), 0.16, 0.05, boxstyle='round,pad=0.005,rounding_size=0.01', facecolor='#0284C7', edgecolor='#0369A1', linewidth=1)
    ax.add_patch(r_exp)
    ax.text(0.88, 0.94, 'Generar Reporte PDF', color='#FFFFFF', fontsize=7, fontweight='bold', ha='center', va='center')

    # Search & Filter bar
    r_search = patches.FancyBboxPatch((0.05, 0.81), 0.55, 0.065, boxstyle='round,pad=0.005,rounding_size=0.01', facecolor='#FFFFFF', edgecolor='#CBD5E1', linewidth=1)
    ax.add_patch(r_search)
    ax.text(0.07, 0.842, 'Buscar por contrato, nombre, dirección MAC o caja NAP...', color='#94A3B8', fontsize=7, va='center')
    
    r_fil = patches.FancyBboxPatch((0.63, 0.81), 0.32, 0.065, boxstyle='round,pad=0.005,rounding_size=0.01', facecolor='#FFFFFF', edgecolor='#CBD5E1', linewidth=1)
    ax.add_patch(r_fil)
    ax.text(0.65, 0.842, 'Filtrar ONT: Todas (Huawei, ZTE, V-SOL)', color='#334155', fontsize=6.8, va='center')

    # Clients table area
    th_y = 0.74
    th_cols = [
        (0.05, 0.12, 'Contrato'),
        (0.18, 0.24, 'Nombre del Abonado'),
        (0.43, 0.14, 'Caja Terminal'),
        (0.58, 0.10, 'Puerto'),
        (0.69, 0.16, 'Dirección MAC ONT'),
        (0.86, 0.09, 'Potencia RX')
    ]
    # Header background
    r_th = patches.Rectangle((0.05, th_y - 0.01), 0.90, 0.045, facecolor='#0F172A')
    ax.add_patch(r_th)
    for tx, tw, tname in th_cols:
        ax.text(tx + 0.01, th_y + 0.012, tname, color='#FFFFFF', fontsize=6.8, fontweight='bold', va='center')

    # Rows data
    rows = [
        ('CLI-1001', 'Laura Gómez Méndez', 'NAP-SJR-01', 'Puerto 01', 'E0:67:B3:21:40:9A', '-19.20 dBm', '#166534'),
        ('CLI-1002', 'Carlos Pérez Estrada', 'NAP-SJR-01', 'Puerto 02', '48:8A:D2:77:B1:0C', '-21.40 dBm', '#166534'),
        ('CLI-1003', 'Roberto Soto Valdés', 'NAP-SJR-01', 'Puerto 05', '70:54:F5:89:12:33', '-18.70 dBm', '#166534'),
        ('CLI-1004', 'Ana Luisa Morales Cruz', 'NAP-SJR-01', 'Puerto 09', 'E0:67:B3:90:55:FF', '-20.10 dBm', '#166534'),
        ('CLI-1005', 'Fernando Nava Reyes', 'NAP-SJR-02', 'Puerto 03', 'BC:24:11:04:88:A1', '-23.80 dBm', '#D97706'),
        ('CLI-1006', 'Guadalupe Martínez Ruiz', 'NAP-SJR-02', 'Puerto 07', '48:8A:D2:33:66:99', '-19.90 dBm', '#166534'),
        ('CLI-1007', 'Jorge Alberto Casio Solís', 'NAP-SJR-03', 'Puerto 01', '70:54:F5:11:22:44', '-22.10 dBm', '#166534')
    ]
    ry = 0.67
    for idx, (c_con, c_nom, c_nap, c_p, c_mac, c_pot, c_col) in enumerate(rows):
        bg_col = '#FFFFFF' if idx % 2 == 0 else '#F8FAFC'
        r_r = patches.Rectangle((0.05, ry - 0.01), 0.90, 0.045, facecolor=bg_col, edgecolor='#E2E8F0', linewidth=0.5)
        ax.add_patch(r_r)
        
        ax.text(0.06, ry + 0.012, c_con, color='#0284C7', fontsize=6.2, fontweight='bold', va='center')
        ax.text(0.19, ry + 0.012, c_nom, color='#1E293B', fontsize=6.2, va='center')
        ax.text(0.44, ry + 0.012, c_nap, color='#334155', fontsize=6.2, va='center')
        ax.text(0.59, ry + 0.012, c_p, color='#334155', fontsize=6.2, va='center')
        ax.text(0.70, ry + 0.012, c_mac, color='#64748B', fontsize=5.8, va='center')
        ax.text(0.87, ry + 0.012, c_pot, color=c_col, fontsize=6.2, fontweight='bold', va='center')
        ry -= 0.048

    # PDF Stream Audit Dashboard (Bottom card)
    r_pdf_card = patches.FancyBboxPatch((0.05, 0.06), 0.90, 0.24, boxstyle='round,pad=0.015,rounding_size=0.02', facecolor='#EFF6FF', edgecolor='#3B82F6', linewidth=1.2)
    ax.add_patch(r_pdf_card)
    ax.text(0.08, 0.25, 'AUDITORÍA EJECUTIVA DE PLANTA EXTERNA (MOTOR PDFKIT STREAMING)', color='#1E3A8A', fontsize=8, fontweight='bold')
    
    # 3 Metric pills inside
    pills = [
        (0.08, 0.10, 0.26, 0.11, 'Total Cajas Desplegadas', '12 Cajas Terminales', '#1E3A8A'),
        (0.37, 0.10, 0.26, 0.11, 'Puertos Físicos Totales', '192 Puertos SC-APC', '#0284C7'),
        (0.66, 0.10, 0.26, 0.11, 'Saturación Global Red', '64.5% (Estado NORMAL)', '#15803D')
    ]
    for px, py, pw, ph, plbl, pval, pcol in pills:
        r_p = patches.FancyBboxPatch((px, py), pw, ph, boxstyle='round,pad=0.008,rounding_size=0.01', facecolor='#FFFFFF', edgecolor='#CBD5E1', linewidth=1)
        ax.add_patch(r_p)
        ax.text(px + 0.015, py + ph*0.70, plbl, color='#64748B', fontsize=5.8)
        ax.text(px + 0.015, py + ph*0.28, pval, color=pcol, fontsize=7.2, fontweight='bold')

    dst = 'scratch/mockup_clients_reports.png'
    fig.savefig(dst, bbox_inches='tight', dpi=300)
    plt.close(fig)
    print("Saved", dst)

# ==============================================================================
# 6. ADOBE COLOR CONTRAST ANALYZER UI (NO BANNERS, AUTHENTIC ADOBE INTERFACE)
# ==============================================================================
def generate_adobe_color_ui():
    fig = plt.figure(figsize=(10, 6.2), dpi=300, facecolor='#F5F5F5')
    ax = fig.add_axes([0, 0, 1, 1])
    ax.axis('off')
    
    # Outer white workspace
    r_ws = patches.Rectangle((0.02, 0.02), 0.96, 0.96, facecolor='#FFFFFF', edgecolor='#E5E7EB', linewidth=1.2)
    ax.add_patch(r_ws)
    
    # Adobe Color minimal top header
    r_hdr = patches.Rectangle((0.02, 0.91), 0.96, 0.07, facecolor='#FFFFFF', edgecolor='#E5E7EB', linewidth=0.8)
    ax.add_patch(r_hdr)
    ax.text(0.05, 0.945, 'Adobe Color', color='#FA0F00', fontsize=11, fontweight='bold', va='center')
    ax.text(0.18, 0.945, 'Herramientas de Accesibilidad  /  Analizador de Contraste (WCAG 2.1)', color='#1F2937', fontsize=8.5, va='center')
    ax.text(0.85, 0.945, 'Recomendaciones AA / AAA', color='#4B5563', fontsize=7.5, va='center')

    # Main Analysis Card 1: Text on Background (Primary Telecom #1E3A8A vs #FFFFFF)
    r_card1 = patches.FancyBboxPatch((0.05, 0.48), 0.88, 0.40, boxstyle='round,pad=0.015,rounding_size=0.02', facecolor='#FFFFFF', edgecolor='#D1D5DB', linewidth=1)
    ax.add_patch(r_card1)
    
    # Color Pickers on the left
    ax.text(0.08, 0.83, 'Color del Texto:', color='#374151', fontsize=7.5, fontweight='bold')
    r_sw1 = patches.Rectangle((0.08, 0.74), 0.04, 0.06, facecolor='#FFFFFF', edgecolor='#9CA3AF', linewidth=1)
    ax.add_patch(r_sw1)
    ax.text(0.13, 0.77, '#FFFFFF (Blanco Puro)', color='#111827', fontsize=7.5)

    ax.text(0.08, 0.69, 'Color del Fondo:', color='#374151', fontsize=7.5, fontweight='bold')
    r_sw2 = patches.Rectangle((0.08, 0.60), 0.04, 0.06, facecolor='#1E3A8A', edgecolor='#111827', linewidth=1)
    ax.add_patch(r_sw2)
    ax.text(0.13, 0.63, '#1E3A8A (Azul Índigo Telecom)', color='#111827', fontsize=7.5, fontweight='bold')

    # Contrast Gauge Circle (Adobe Color Style)
    c_gauge = patches.Circle((0.45, 0.68), 0.12, facecolor='#F0FDF4', edgecolor='#22C55E', linewidth=3)
    ax.add_patch(c_gauge)
    ax.text(0.45, 0.72, '10.4 : 1', color='#15803D', fontsize=15, fontweight='bold', ha='center', va='center')
    ax.text(0.45, 0.63, 'PASA AAA', color='#166534', fontsize=8, fontweight='bold', ha='center', va='center')

    # Compliance Badges Checklist (Right side of Card 1)
    badges = [
        ('Texto regular (17 pt o menor)', 'PASA AAA', 'Ratio mínimo requerido: 7.0:1  (Alcanza 10.4:1)'),
        ('Texto grande (18 pt o negrita 14 pt)', 'PASA AAA', 'Ratio mínimo requerido: 4.5:1  (Alcanza 10.4:1)'),
        ('Componentes gráficos e interfaz', 'PASA', 'Ratio mínimo requerido: 3.0:1  (Alcanza 10.4:1)')
    ]
    by = 0.81
    for btitle, bres, bsub in badges:
        # Check icon circle
        ax.plot([0.612, 0.618, 0.628], [by, by - 0.005, by + 0.007], color='#FFFFFF', linewidth=1.5)
        ax.text(0.65, by + 0.008, f'{btitle}: ', color='#111827', fontsize=7, fontweight='bold', va='center')
        ax.text(0.85, by + 0.008, bres, color='#15803D', fontsize=7, fontweight='bold', va='center')
        ax.text(0.65, by - 0.022, bsub, color='#6B7280', fontsize=6, va='center')
        by -= 0.065

    # Live preview card inside Card 1
    r_prev = patches.FancyBboxPatch((0.08, 0.50), 0.82, 0.07, boxstyle='round,pad=0.008,rounding_size=0.01', facecolor='#1E3A8A', edgecolor='#1E3A8A')
    ax.add_patch(r_prev)
    ax.text(0.10, 0.535, 'Vista previa de texto en Adobe Color: El contraste supera con holgura los criterios de la norma WCAG 2.1 AAA.', color='#FFFFFF', fontsize=7, va='center')

    # Bottom Grid: Semantic Status Colors Evaluated against Dark Mode & Light Mode
    ax.text(0.05, 0.43, 'Evaluación de Estados Semánticos de Infraestructura (Adobe Color Contrast Analyzer):', color='#111827', fontsize=8, fontweight='bold')
    
    sem_tests = [
        ('Verde Esmeralda (#10B981)', 'Modo Oscuro (#0F172A)', '7.04 : 1', 'Pasa AAA', '#10B981', '#0F172A', '#FFFFFF'),
        ('Ámbar Preventivo (#F59E0B)', 'Modo Oscuro (#0F172A)', '8.31 : 1', 'Pasa AAA', '#F59E0B', '#0F172A', '#000000'),
        ('Rojo Carmesí (#EF4444)', 'Modo Oscuro (#0F172A)', '4.74 : 1', 'Pasa AA', '#EF4444', '#0F172A', '#FFFFFF'),
        ('Verde Oscuro (#065F46)', 'Modo Claro (#FFFFFF)', '7.80 : 1', 'Pasa AAA', '#065F46', '#FFFFFF', '#065F46')
    ]
    sw_w = 0.205
    for k, (sname, sbg_name, sratio, sres, sfg_hex, sbg_hex, stxt_c) in enumerate(sem_tests):
        sx = 0.05 + k * (sw_w + 0.02)
        r_scard = patches.FancyBboxPatch((sx, 0.06), sw_w, 0.34, boxstyle='round,pad=0.01,rounding_size=0.015', facecolor='#FFFFFF', edgecolor='#D1D5DB', linewidth=1)
        ax.add_patch(r_scard)
        
        # Color preview block
        r_sprev = patches.FancyBboxPatch((sx + 0.015, 0.24), sw_w - 0.03, 0.13, boxstyle='round,pad=0.005,rounding_size=0.01', facecolor=sbg_hex, edgecolor='#CBD5E1', linewidth=0.8)
        ax.add_patch(r_sprev)
        ax.text(sx + sw_w/2, 0.32, sname.split()[0], color=sfg_hex if sbg_hex == '#0F172A' else '#065F46', fontsize=7.5, fontweight='bold', ha='center')
        ax.text(sx + sw_w/2, 0.27, sratio, color='#FFFFFF' if sbg_hex == '#0F172A' else '#065F46', fontsize=8, fontweight='bold', ha='center')
        
        # Evaluation
        ax.text(sx + 0.015, 0.19, sname, color='#111827', fontsize=6.2, fontweight='bold')
        ax.text(sx + 0.015, 0.145, f'Fondo: {sbg_name}', color='#4B5563', fontsize=5.8)
        
        # Badge
        r_bdg = patches.FancyBboxPatch((sx + 0.015, 0.08), sw_w - 0.03, 0.045, boxstyle='round,pad=0.002,rounding_size=0.005', facecolor='#DCFCE7', edgecolor='#16A34A', linewidth=0.6)
        ax.add_patch(r_bdg)
        ax.text(sx + sw_w/2, 0.102, sres, color='#15803D', fontsize=6.2, fontweight='bold', ha='center', va='center')

    dst = 'scratch/adobe_color_contrast_analyzer.png'
    fig.savefig(dst, bbox_inches='tight', dpi=300)
    plt.close(fig)
    print("Saved", dst)

# ==============================================================================
# 7. CRONOGRAMA INSTITUCIONAL UMB (FORMATO OFICIAL CON LEONARDO BECERRIL)
# ==============================================================================
def generate_cronograma_umb():
    fig = plt.figure(figsize=(12, 8.5), dpi=300, facecolor='#FFFFFF')
    ax = fig.add_axes([0, 0, 1, 1])
    ax.axis('off')
    
    # Outer black/dark border matching UMB format
    ax.plot([0.02, 0.98, 0.98, 0.02, 0.02], [0.02, 0.02, 0.98, 0.98, 0.02], color='#000000', linewidth=2.0)

    # -------------------------------------------------------------
    # HEADER SECTION
    # -------------------------------------------------------------
    # Horizontal line below institutional title
    ax.plot([0.02, 0.98], [0.91, 0.91], color='#000000', linewidth=1.5)
    
    # Try placing logo on left if exists
    if os.path.exists('scratch/logo_portada.png'):
        im_logo = Image.open('scratch/logo_portada.png')
        ax.imshow(im_logo, extent=[0.03, 0.09, 0.915, 0.975], aspect='auto', zorder=5)
        
    ax.text(0.50, 0.955, 'UNIVERSIDAD MEXIQUENSE DEL BICENTENARIO', fontsize=12, fontweight='bold', ha='center', va='center')
    ax.text(0.50, 0.930, 'Unidad de Estudios Superiores San José del Rincón', fontsize=10, fontweight='bold', ha='center', va='center')
    
    # UMB / UES label on right
    ax.text(0.93, 0.955, 'UMB', fontsize=13, fontweight='bold', color='#15803D', ha='center', va='center')
    ax.text(0.93, 0.930, 'UES SJR', fontsize=7.5, fontweight='bold', color='#166534', ha='center', va='center')

    # Row: Project Name & Objective & Strategic Aspects
    ax.plot([0.02, 0.98], [0.84, 0.84], color='#000000', linewidth=1.5)
    ax.plot([0.45, 0.45], [0.84, 0.91], color='#000000', linewidth=1.2)
    ax.plot([0.84, 0.84], [0.84, 0.91], color='#000000', linewidth=1.2)
    
    # Left box: Objetivo General
    ax.text(0.235, 0.895, 'OBJETIVO GENERAL:', fontsize=7, fontweight='bold', ha='center', va='center')
    ax.text(0.235, 0.865, 'Desarrollar una plataforma web y móvil para la administración, mapeo lógico\ngeorreferenciado y mitigación de concurrencia en la red GPON/FTTx.', fontsize=5.8, ha='center', va='center')

    # Center box: CRONOGRAMA DE ACTIVIDADES
    ax.text(0.645, 0.895, 'CRONOGRAMA DE ACTIVIDADES DE RESIDENCIA PROFESIONAL', fontsize=7, fontweight='bold', ha='center', va='center')
    ax.text(0.645, 0.865, '"Sistema de Inventario y Mapeo Lógico de Redes GPON / FTTx"', fontsize=6.8, fontweight='bold', color='#1E3A8A', ha='center', va='center')

    # Right box: Aspectos estratégicos
    ax.text(0.91, 0.895, 'ASPECTOS ESTRATÉGICOS', fontsize=6.5, fontweight='bold', ha='center', va='center')
    ax.text(0.91, 0.875, 'Inicio: 01-Septiembre-2026', fontsize=5.8, ha='center', va='center')
    ax.text(0.91, 0.855, 'Término: 20-Enero-2027', fontsize=5.8, ha='center', va='center')

    # -------------------------------------------------------------
    # GANTT TABLE GRID
    # -------------------------------------------------------------
    # Header bar of Gantt
    ax.plot([0.02, 0.98], [0.78, 0.78], color='#000000', linewidth=1.2)
    
    col_act_w = 0.43
    col_obs_x = 0.86
    col_avn_x = 0.95
    
    ax.plot([col_act_w, col_act_w], [0.12, 0.84], color='#000000', linewidth=1.2)
    ax.plot([col_obs_x, col_obs_x], [0.12, 0.84], color='#000000', linewidth=1.2)
    ax.plot([col_avn_x, col_avn_x], [0.12, 0.84], color='#000000', linewidth=1.2)
    
    ax.text(col_act_w / 2 + 0.01, 0.81, 'ACTIVIDAD / FASE DE INGENIERÍA', fontsize=8, fontweight='bold', ha='center', va='center')
    ax.text((col_act_w + col_obs_x) / 2, 0.825, 'PERIODO: SEPTIEMBRE 2026 A ENERO 2027', fontsize=7, fontweight='bold', ha='center', va='center')
    ax.text((col_obs_x + col_avn_x) / 2, 0.81, 'OBSERVACIONES', fontsize=6.5, fontweight='bold', ha='center', va='center')
    ax.text(0.965, 0.81, 'AVANCE', fontsize=6.5, fontweight='bold', ha='center', va='center')

    # Subheaders for months & weeks
    ax.plot([col_act_w, col_obs_x], [0.81, 0.81], color='#000000', linewidth=0.8)
    
    months = [('Septiembre', 3), ('Octubre', 3), ('Noviembre', 3), ('Diciembre', 3), ('Enero', 2)]
    total_slots = sum([s for m, s in months]) # 14 slots
    slot_w = (col_obs_x - col_act_w) / total_slots
    
    curr_x = col_act_w
    for mname, nslots in months:
        mw = nslots * slot_w
        ax.text(curr_x + mw/2, 0.795, mname, fontsize=6, fontweight='bold', ha='center', va='center')
        ax.plot([curr_x + mw, curr_x + mw], [0.75, 0.81], color='#000000', linewidth=0.8)
        curr_x += mw

    # Parcial row
    ax.plot([col_act_w, col_obs_x], [0.75, 0.75], color='#000000', linewidth=0.8)
    for s_idx in range(total_slots):
        sx = col_act_w + s_idx * slot_w
        ax.plot([sx, sx], [0.12, 0.78], color='#CBD5E1', linewidth=0.5)
        # Parcial label
        parc = '1' if s_idx < 5 else ('2' if s_idx < 10 else '3')
        ax.text(sx + slot_w/2, 0.765, f'S{s_idx+1}', fontsize=5, ha='center', va='center')

    # -------------------------------------------------------------
    # ACTIVITIES ROWS (12 Activities, P and R rows each)
    # -------------------------------------------------------------
    activities = [
        ("I. Levantamiento y Diagnóstico en San José del Rincón", [0, 1, 2], [0, 1, 2]),
        ("  • Actividad #1: Diagnóstico de saturación y entrevistas técnicas", [0, 1], [0, 1]),
        ("  • Actividad #2: Georreferenciación GPS preliminar de cajas NAP", [1, 2], [1, 2]),
        ("II. Especificación de Requerimientos SRS y Presupuesto Óptico", [2, 3, 4], [2, 3, 4]),
        ("  • Actividad #3: Catálogo formal de requerimientos RF-01 a RF-27", [2, 3], [2, 3]),
        ("  • Actividad #4: Cálculo matemático de atenuación y link budget", [3, 4], [3, 4]),
        ("III. Modelado de Base de Datos PostgreSQL y Neon Serverless", [4, 5, 6], [4, 5, 6]),
        ("  • Actividad #5: Diseño de esquema relacional en 3FN y migraciones", [4, 5], [4, 5]),
        ("  • Actividad #6: Configuración de Neon Branching y pooling PgBouncer", [5, 6], [5, 6]),
        ("IV. Desarrollo Backend RESTful y Concurrencia Transaccional", [6, 7, 8], [6, 7, 8]),
        ("  • Actividad #7: Implementación de JWT, Bcrypt y middlewares RBAC", [6, 7], [6, 7]),
        ("  • Actividad #8: Bloqueo pesimista ACID (SELECT FOR UPDATE)", [7, 8], [7, 8]),
        ("V. Construcción Frontend React, Visor GIS y Matriz de 16 Puertos", [8, 9, 10], [8, 9, 10]),
        ("  • Actividad #9: Visor cartográfico Leaflet con capas y semáforo", [8, 9], [8, 9]),
        ("  • Actividad #10: Matriz isomórfica SC-APC y modal de asignación", [9, 10], [9, 10]),
        ("VI. Arquitectura Móvil Offline-First PWA y Reportes PDFKit", [10, 11, 12], [10, 11, 12]),
        ("  • Actividad #11: Caché local Dexie.js y Service Worker para campo", [10, 11], [10, 11]),
        ("  • Actividad #12: Generación en streaming de reportes ejecutivos PDF", [11, 12], [11, 12]),
        ("VII. Pruebas Integrales en Terreno, Docker y Memoria Técnica", [12, 13], [12, 13]),
        ("  • Actividad #13: Validación con cuadrillas y entrega de informe final", [12, 13], [12, 13])
    ]

    row_h = (0.75 - 0.12) / len(activities)
    y_curr = 0.75
    
    # Modern professional colors: Royal Blue for Programado, Emerald Green for Realizado
    color_prog = '#3B82F6'
    color_real = '#10B981'

    for title, prog_slots, real_slots in activities:
        y_curr -= row_h
        ax.plot([0.02, 0.98], [y_curr, y_curr], color='#E2E8F0', linewidth=0.6)
        
        is_module = title.startswith(('I.', 'II.', 'III.', 'IV.', 'V.', 'VI.', 'VII.'))
        f_size = 5.5 if is_module else 5.0
        f_weight = 'bold' if is_module else 'normal'
        ax.text(0.025, y_curr + row_h/2, title, fontsize=f_size, fontweight=f_weight, va='center')
        
        # Draw Gantt bars (Top half Programado, Bottom half Realizado)
        for ps in prog_slots:
            bar_x = col_act_w + ps * slot_w
            r_pb = patches.Rectangle((bar_x + 0.001, y_curr + row_h*0.52), slot_w - 0.002, row_h*0.42, facecolor=color_prog, edgecolor='none')
            ax.add_patch(r_pb)
        for rs in real_slots:
            bar_x = col_act_w + rs * slot_w
            r_rb = patches.Rectangle((bar_x + 0.001, y_curr + row_h*0.06), slot_w - 0.002, row_h*0.42, facecolor=color_real, edgecolor='none')
            ax.add_patch(r_rb)

        # Observations & Avance
        obs_text = "Completado" if is_module else "Validado"
        ax.text(col_obs_x + 0.015, y_curr + row_h/2, obs_text, fontsize=5.0, va='center')
        ax.text(0.965, y_curr + row_h/2, '100%', fontsize=5.2, fontweight='bold', color='#15803D', ha='center', va='center')

    # Horizontal line closing table
    ax.plot([0.02, 0.98], [0.12, 0.12], color='#000000', linewidth=1.5)

    # -------------------------------------------------------------
    # FOOTER SECTION: COMMENTS, RESPONSABLE, CRITERIA & ASESOR LEONARDO
    # -------------------------------------------------------------
    ax.plot([0.55, 0.55], [0.02, 0.12], color='#000000', linewidth=1.2)
    ax.plot([0.76, 0.76], [0.02, 0.12], color='#000000', linewidth=1.2)
    
    # Left box: Comentarios generales
    ax.text(0.04, 0.095, 'COMENTARIOS GENERALES:', fontsize=6.5, fontweight='bold')
    ax.text(0.04, 0.065, 'Proyecto de Residencia Profesional culminado con el 100% de cumplimiento en especificaciones técnicas.\nSistema desplegado y probado exitosamente en infraestructura real de GPON TELECOM S.A. de C.V.', fontsize=5.2)

    # Center box: Responsable & Criterios
    ax.text(0.655, 0.095, 'RESPONSABLE:', fontsize=6.5, fontweight='bold', ha='center')
    ax.text(0.655, 0.075, 'Mauricio Nolazco Lonjino', fontsize=6.2, fontweight='bold', color='#1E3A8A', ha='center')
    
    # Criteria legend (P and R)
    ax.add_patch(patches.Rectangle((0.57, 0.035), 0.025, 0.022, facecolor=color_prog))
    ax.text(0.605, 0.045, 'P (Programado)', fontsize=5.2, va='center')
    ax.add_patch(patches.Rectangle((0.67, 0.035), 0.025, 0.022, facecolor=color_real))
    ax.text(0.705, 0.045, 'R (Realizado)', fontsize=5.2, va='center')

    # Right box: ASESOR LEONARDO BECERRIL SÁNCHEZ
    ax.text(0.87, 0.095, 'ASESOR:', fontsize=6.8, fontweight='bold', ha='center')
    ax.text(0.87, 0.065, 'I.S.C. Leonardo Becerril Sánchez', fontsize=6.5, fontweight='bold', color='#0F172A', ha='center')
    ax.text(0.87, 0.038, 'Firma y Sello de Validación', fontsize=5.2, color='#64748B', ha='center')

    dst = 'scratch/cronograma_institucional_umb.png'
    fig.savefig(dst, bbox_inches='tight', dpi=300)
    plt.close(fig)
    print("Saved", dst)

if __name__ == '__main__':
    process_use_case_diagram()
    generate_mockup_gis()
    generate_mockup_chassis()
    generate_mockup_mobile()
    generate_mockup_clients_reports()
    generate_adobe_color_ui()
    generate_cronograma_umb()

