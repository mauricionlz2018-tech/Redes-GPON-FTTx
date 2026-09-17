import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as patches
import os

os.makedirs('scratch', exist_ok=True)

plt.rcParams['font.family'] = 'sans-serif'
plt.rcParams['font.sans-serif'] = ['DejaVu Sans', 'Arial', 'Helvetica']

# 1. Node.js Event Loop
def generate_event_loop():
    fig, ax = plt.subplots(figsize=(10, 6.5), dpi=300)
    ax.set_facecolor('#ffffff')
    fig.patch.set_facecolor('#ffffff')
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 7)
    ax.axis('off')

    # Title Banner
    ax.text(5, 6.5, 'Arquitectura del Bucle de Eventos (Event Loop) en Node.js', 
            ha='center', va='center', fontsize=14, weight='bold', color='#0f172a')
    ax.text(5, 6.15, 'Fases de ejecucion secuencial no bloqueante y gestion de colas asincronas', 
            ha='center', va='center', fontsize=9.5, color='#475569')

    # Phases boxes
    phases = [
        ('1. TIMERS', 'Ejecuta callbacks programados por\nsetTimeout() y setInterval()', '#0284c7', 1.8, 4.7),
        ('2. PENDING CALLBACKS', 'Procesa callbacks de I/O diferidos\n(errores de red, operaciones TCP)', '#0d9488', 8.2, 4.7),
        ('3. IDLE, PREPARE', 'Uso interno exclusivo del subsistema\nde Node.js y libuv', '#64748b', 8.2, 2.7),
        ('4. POLL (SONDEO)', 'Recupera nuevos eventos de I/O y\nejecuta sus callbacks asociados', '#16a34a', 5.0, 1.2),
        ('5. CHECK (VERIFICACION)', 'Ejecuta callbacks especificos\nregistrados con setImmediate()', '#d97706', 1.8, 2.7),
        ('6. CLOSE CALLBACKS', 'Gestiona el cierre de sockets\ny recursos (ej. socket.on("close"))', '#dc2626', 5.0, 3.8),
    ]

    # Draw arrows connecting phases in loop
    coords = [(1.8, 4.7), (8.2, 4.7), (8.2, 2.7), (5.0, 1.2), (1.8, 2.7), (5.0, 3.8)]
    # Loop arrows
    loop_arrows = [
        ((3.3, 4.7), (6.7, 4.7)),
        ((8.2, 4.1), (8.2, 3.3)),
        ((7.3, 2.3), (5.9, 1.6)),
        ((4.1, 1.6), (2.7, 2.3)),
        ((1.8, 3.3), (1.8, 4.1)),
        ((3.2, 4.2), (4.1, 3.8)),
        ((5.9, 3.8), (7.0, 4.3))
    ]
    for start, end in [((3.3, 4.7), (6.7, 4.7)), ((8.2, 4.15), (8.2, 3.25)), ((7.3, 2.3), (6.0, 1.6)), ((4.0, 1.6), (2.7, 2.3)), ((1.8, 3.25), (1.8, 4.15))]:
        ax.annotate('', xy=end, xytext=start,
                    arrowprops=dict(arrowstyle="-|>", color="#334155", lw=2, mutation_scale=15))

    for title, desc, color, x, y in phases:
        rect = patches.FancyBboxPatch((x - 1.4, y - 0.55), 2.8, 1.1,
                                     boxstyle="round,pad=0.08,rounding_size=0.15",
                                     linewidth=1.5, edgecolor=color, facecolor='#f8fafc')
        ax.add_patch(rect)
        header_rect = patches.FancyBboxPatch((x - 1.4, y + 0.15), 2.8, 0.4,
                                            boxstyle="round,pad=0.08,rounding_size=0.15",
                                            linewidth=1, edgecolor=color, facecolor=color)
        ax.add_patch(header_rect)
        ax.text(x, y + 0.35, title, ha='center', va='center', fontsize=8.5, weight='bold', color='#ffffff')
        ax.text(x, y - 0.2, desc, ha='center', va='center', fontsize=7.5, color='#1e293b')

    # Central Microtask Queue box
    micro_rect = patches.FancyBboxPatch((3.5, 2.1), 3.0, 1.0,
                                       boxstyle="round,pad=0.08,rounding_size=0.15",
                                       linewidth=1.5, edgecolor="#7c3aed", facecolor="#f5f3ff", linestyle="--")
    ax.add_patch(micro_rect)
    ax.text(5.0, 2.75, 'Cola de Microtareas (Prioridad Maxima)', ha='center', va='center', fontsize=8.2, weight='bold', color="#6d28d9")
    ax.text(5.0, 2.4, 'process.nextTick() y Promises (then/catch)\nSe evaluan inmediatamente despues de cada fase', 
            ha='center', va='center', fontsize=7.2, color="#4c1d95")

    plt.tight_layout()
    plt.savefig('scratch/teoria_event_loop_nodejs.png', dpi=300, bbox_inches='tight')
    plt.close()
    print("Generated: scratch/teoria_event_loop_nodejs.png")

# 2. React Virtual DOM
def generate_react_virtual_dom():
    fig, ax = plt.subplots(figsize=(10, 6.2), dpi=300)
    ax.set_facecolor('#ffffff')
    fig.patch.set_facecolor('#ffffff')
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 6.2)
    ax.axis('off')

    ax.text(5, 5.8, 'Mecanismo de Reconciliacion y Virtual DOM en React.js', 
            ha='center', va='center', fontsize=14, weight='bold', color='#0f172a')
    ax.text(5, 5.45, 'Comparacion estructural (Diffing Algorithm) y actualizacion quirurgica en el DOM Real', 
            ha='center', va='center', fontsize=9.5, color='#475569')

    # Column 1: State Change & Virtual DOM
    box1 = patches.FancyBboxPatch((0.5, 1.0), 2.6, 3.8, boxstyle="round,pad=0.1,rounding_size=0.15",
                                 edgecolor='#0284c7', facecolor='#f0f9ff', lw=1.5)
    ax.add_patch(box1)
    ax.text(1.8, 4.5, '1. Nuevo Virtual DOM', ha='center', va='center', fontsize=10, weight='bold', color='#0369a1')
    ax.text(1.8, 4.15, 'Arbol en memoria JavaScript', ha='center', va='center', fontsize=8, color='#0284c7')

    # Tree nodes Virtual
    for nx, ny, lbl, col in [(1.8, 3.5, '<App />', '#0284c7'), (1.2, 2.6, '<Navbar />', '#0284c7'), (2.4, 2.6, '<GponMap />', '#0284c7'), (2.4, 1.6, '<NapMarker /> (Modificado)', '#e11d48')]:
        n_rect = patches.FancyBboxPatch((nx-0.55, ny-0.25), 1.1, 0.5, boxstyle="round,pad=0.05,rounding_size=0.1",
                                       facecolor=col, edgecolor='none')
        ax.add_patch(n_rect)
        ax.text(nx, ny, lbl, ha='center', va='center', fontsize=6.8, weight='bold', color='#ffffff')
    # Lines
    ax.plot([1.8, 1.2], [3.25, 2.85], color='#0284c7', lw=1.2)
    ax.plot([1.8, 2.4], [3.25, 2.85], color='#0284c7', lw=1.2)
    ax.plot([2.4, 2.4], [2.35, 1.85], color='#0284c7', lw=1.2)

    # Middle: Reconciliation / Diffing
    box2 = patches.FancyBboxPatch((3.7, 1.6), 2.6, 2.8, boxstyle="round,pad=0.1,rounding_size=0.15",
                                 edgecolor='#7c3aed', facecolor='#faf5ff', lw=1.5)
    ax.add_patch(box2)
    ax.text(5.0, 4.1, '2. Algoritmo Diffing', ha='center', va='center', fontsize=10, weight='bold', color='#6d28d9')
    ax.text(5.0, 3.8, 'Motor Fiber Reconciler', ha='center', va='center', fontsize=8, color='#7c3aed')
    ax.text(5.0, 3.1, 'Compara el arbol previo\ncon el arbol nuevo nodo\npor nodo con complejidad O(n).\n\nDetecta unicamente el nodo\n<NapMarker /> alterado.', 
            ha='center', va='center', fontsize=7.8, color='#4c1d95')

    # Arrows
    ax.annotate('', xy=(3.6, 3.0), xytext=(3.2, 3.0),
                arrowprops=dict(arrowstyle="-|>", color="#475569", lw=2, mutation_scale=15))
    ax.annotate('', xy=(6.8, 3.0), xytext=(6.4, 3.0),
                arrowprops=dict(arrowstyle="-|>", color="#475569", lw=2, mutation_scale=15))

    # Column 3: Real DOM
    box3 = patches.FancyBboxPatch((6.9, 1.0), 2.6, 3.8, boxstyle="round,pad=0.1,rounding_size=0.15",
                                 edgecolor='#16a34a', facecolor='#f0fdf4', lw=1.5)
    ax.add_patch(box3)
    ax.text(8.2, 4.5, '3. DOM Real (Browser)', ha='center', va='center', fontsize=10, weight='bold', color='#15803d')
    ax.text(8.2, 4.15, 'Actualizacion Quirurgica', ha='center', va='center', fontsize=8, color='#16a34a')

    for nx, ny, lbl, col in [(8.2, 3.5, '<div> HTML', '#16a34a'), (7.6, 2.6, '<header>', '#16a34a'), (8.8, 2.6, '<main map>', '#16a34a'), (8.8, 1.6, '<div> Marcador Actualizado', '#16a34a')]:
        n_rect = patches.FancyBboxPatch((nx-0.55, ny-0.25), 1.1, 0.5, boxstyle="round,pad=0.05,rounding_size=0.1",
                                       facecolor=col, edgecolor='none')
        ax.add_patch(n_rect)
        ax.text(nx, ny, lbl, ha='center', va='center', fontsize=6.8, weight='bold', color='#ffffff')
    ax.plot([8.2, 7.6], [3.25, 2.85], color='#16a34a', lw=1.2)
    ax.plot([8.2, 8.8], [3.25, 2.85], color='#16a34a', lw=1.2)
    ax.plot([8.8, 8.8], [2.35, 1.85], color='#16a34a', lw=1.2)

    # Benefit footnote
    ax.text(5.0, 0.4, 'Resultado: Se evita el repintado completo (Reflow/Repaint) de la pagina web, garantizando 60 FPS en el visor cartografico.',
            ha='center', va='center', fontsize=8.2, style='italic', color='#334155')

    plt.tight_layout()
    plt.savefig('scratch/teoria_react_virtual_dom.png', dpi=300, bbox_inches='tight')
    plt.close()
    print("Generated: scratch/teoria_react_virtual_dom.png")

# 3. PWA Service Worker Lifecycle
def generate_service_worker():
    fig, ax = plt.subplots(figsize=(10, 5.8), dpi=300)
    ax.set_facecolor('#ffffff')
    fig.patch.set_facecolor('#ffffff')
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 6)
    ax.axis('off')

    ax.text(5, 5.5, 'Ciclo de Vida y Operacion del Service Worker en una PWA', 
            ha='center', va='center', fontsize=14, weight='bold', color='#0f172a')
    ax.text(5, 5.15, 'Mecanismos de instalacion, activacion e intercepcion transparente de red (Fetch)', 
            ha='center', va='center', fontsize=9.5, color='#475569')

    stages = [
        ('1. REGISTRO', 'navigator.serviceWorker\n.register("/sw.js")', '#0284c7', 1.2),
        ('2. INSTALACION', 'Evento "install":\nDescarga y cacheo de\nactivos estaticos (Shell)', '#0d9488', 3.7),
        ('3. ACTIVACION', 'Evento "activate":\nDepuracion de versiones\nantiguas de cache', '#16a34a', 6.3),
        ('4. OPERATIVO', 'Evento "fetch":\nIntercepta solicitudes\ny sirve offline', '#7c3aed', 8.8)
    ]

    for title, desc, col, cx in stages:
        rect = patches.FancyBboxPatch((cx - 1.05, 2.6), 2.1, 1.8,
                                     boxstyle="round,pad=0.08,rounding_size=0.15",
                                     linewidth=1.5, edgecolor=col, facecolor='#f8fafc')
        ax.add_patch(rect)
        hdr = patches.FancyBboxPatch((cx - 1.05, 3.9), 2.1, 0.5,
                                    boxstyle="round,pad=0.08,rounding_size=0.15",
                                    linewidth=1, edgecolor=col, facecolor=col)
        ax.add_patch(hdr)
        ax.text(cx, 4.15, title, ha='center', va='center', fontsize=8.5, weight='bold', color='#ffffff')
        ax.text(cx, 3.25, desc, ha='center', va='center', fontsize=7.5, color='#1e293b')

    # Arrows between stages
    for start_x, end_x in [(2.35, 2.55), (4.85, 5.15), (7.45, 7.65)]:
        ax.annotate('', xy=(end_x, 3.5), xytext=(start_x, 3.5),
                    arrowprops=dict(arrowstyle="-|>", color="#334155", lw=2, mutation_scale=15))

    # Bottom Interception Box
    bot = patches.FancyBboxPatch((1.5, 0.8), 7.0, 1.3, boxstyle="round,pad=0.08,rounding_size=0.15",
                                edgecolor='#f59e0b', facecolor='#fffbeb', lw=1.5)
    ax.add_patch(bot)
    ax.text(5.0, 1.7, 'Intercepcion de Peticiones HTTP en Campo (Offline-First)', ha='center', va='center', fontsize=8.8, weight='bold', color='#b45309')
    ax.text(5.0, 1.25, '1. Solicitud de red de la aplicacion web -> 2. Service Worker intercepta ->\n3. Si hay conexion celular: Recupera de Internet y refresca cache ->\n4. Si NO hay conexion: Sirve datos de Cache Storage e IndexedDB sin fallos de interfaz.',
            ha='center', va='center', fontsize=7.5, color='#78350f')

    plt.tight_layout()
    plt.savefig('scratch/teoria_service_worker_lifecycle.png', dpi=300, bbox_inches='tight')
    plt.close()
    print("Generated: scratch/teoria_service_worker_lifecycle.png")

# 4. JWT Structure & RFC 7519
def generate_jwt_diagram():
    fig, ax = plt.subplots(figsize=(10, 6.0), dpi=300)
    ax.set_facecolor('#ffffff')
    fig.patch.set_facecolor('#ffffff')
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 6)
    ax.axis('off')

    ax.text(5, 5.6, 'Estructura Criptografica y Protocolo de JSON Web Tokens (JWT)', 
            ha='center', va='center', fontsize=14, weight='bold', color='#0f172a')
    ax.text(5, 5.25, 'Estandar IETF RFC 7519: Segmentacion Base64Url y flujo de autorizacion Bearer', 
            ha='center', va='center', fontsize=9.5, color='#475569')

    # 3 parts of token
    parts = [
        ('HEADER (Cabecera)', 'Algoritmo y tipo de token:\n{\n  "alg": "HS256",\n  "typ": "JWT"\n}', '#ef4444', 1.8),
        ('PAYLOAD (Carga Util)', 'Declaraciones (Claims) y rol:\n{\n  "id": "usr-841",\n  "rol": "Tecnico",\n  "exp": 1726617600\n}', '#8b5cf6', 5.0),
        ('SIGNATURE (Firma)', 'Firma HMAC-SHA256:\nHMACSHA256(\n  base64Url(header) + "." +\n  base64Url(payload), secret\n)', '#10b981', 8.2)
    ]

    for title, content, col, cx in parts:
        rect = patches.FancyBboxPatch((cx - 1.45, 2.7), 2.9, 2.1,
                                     boxstyle="round,pad=0.08,rounding_size=0.15",
                                     linewidth=1.5, edgecolor=col, facecolor='#f8fafc')
        ax.add_patch(rect)
        hdr = patches.FancyBboxPatch((cx - 1.45, 4.35), 2.9, 0.45,
                                    boxstyle="round,pad=0.08,rounding_size=0.15",
                                    linewidth=1, edgecolor=col, facecolor=col)
        ax.add_patch(hdr)
        ax.text(cx, 4.57, title, ha='center', va='center', fontsize=8.2, weight='bold', color='#ffffff')
        ax.text(cx, 3.45, content, ha='center', va='center', fontsize=7.2, family='monospace', color='#1e293b')

    # Dots separating parts
    ax.text(3.37, 3.75, '.', fontsize=30, weight='bold', color='#64748b', ha='center', va='center')
    ax.text(6.62, 3.75, '.', fontsize=30, weight='bold', color='#64748b', ha='center', va='center')

    # Bottom Protocol Box
    bot = patches.FancyBboxPatch((0.8, 0.8), 8.4, 1.4, boxstyle="round,pad=0.08,rounding_size=0.15",
                                edgecolor='#0284c7', facecolor='#f0f9ff', lw=1.5)
    ax.add_patch(bot)
    ax.text(5.0, 1.85, 'Flujo de Transmision en Cabeceras HTTP (Stateless Authentication)', ha='center', va='center', fontsize=8.8, weight='bold', color='#0369a1')
    ax.text(5.0, 1.3, '1. Cliente envia credenciales a /api/auth/login -> 2. Servidor verifica password con bcrypt y firma JWT ->\n3. Cliente almacena token en memoria/localStorage -> 4. Cada peticion incluye cabecera:\nAuthorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI... -> 5. Servidor valida firma sin consultar base de datos.',
            ha='center', va='center', fontsize=7.4, color='#0c4a6e')

    plt.tight_layout()
    plt.savefig('scratch/teoria_jwt_structure_flow.png', dpi=300, bbox_inches='tight')
    plt.close()
    print("Generated: scratch/teoria_jwt_structure_flow.png")

# 5. RBAC Model (NIST Standard)
def generate_rbac_diagram():
    fig, ax = plt.subplots(figsize=(10, 6.0), dpi=300)
    ax.set_facecolor('#ffffff')
    fig.patch.set_facecolor('#ffffff')
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 6)
    ax.axis('off')

    ax.text(5, 5.6, 'Modelo Jerarquico de Control de Acceso Basado en Roles (NIST RBAC)', 
            ha='center', va='center', fontsize=14, weight='bold', color='#0f172a')
    ax.text(5, 5.25, 'Mapeo de identidades a privilegios de operacion y proteccion de endpoints HTTP', 
            ha='center', va='center', fontsize=9.5, color='#475569')

    # Columns: Users -> Roles -> Permissions -> Resources
    cols = [
        ('USUARIOS', ['Mauricio Nolazco\n(Admin)', 'Ing. de Soporte\n(Soporte)', 'Tecnico de Campo\n(Tecnico)'], '#0284c7', 1.2),
        ('ROLES (RBAC)', ['ADMINISTRADOR\n(Acceso total)', 'SOPORTE TECNICO\n(Gestion y reportes)', 'TECNICO CAMPO\n(Asignacion y GPS)'], '#7c3aed', 3.7),
        ('PERMISOS', ['Crear/Eliminar NAP\n(Permiso Total)', 'Liberar Puertos\n(Reasignacion)', 'Asignar Puerto\n(Atencion Orden)'], '#d97706', 6.3),
        ('ENDPOINTS API', ['DELETE /api/naps/:id\nPOST /api/naps', 'PATCH /api/puertos/:id\nGET /api/reportes/pdf', 'POST /api/puertos/asignar\nPATCH /api/naps/:id/gps'], '#16a34a', 8.8)
    ]

    for title, items, col, cx in cols:
        rect = patches.FancyBboxPatch((cx - 1.05, 1.0), 2.1, 3.8,
                                     boxstyle="round,pad=0.08,rounding_size=0.15",
                                     linewidth=1.5, edgecolor=col, facecolor='#f8fafc')
        ax.add_patch(rect)
        hdr = patches.FancyBboxPatch((cx - 1.05, 4.3), 2.1, 0.5,
                                    boxstyle="round,pad=0.08,rounding_size=0.15",
                                    linewidth=1, edgecolor=col, facecolor=col)
        ax.add_patch(hdr)
        ax.text(cx, 4.55, title, ha='center', va='center', fontsize=8.2, weight='bold', color='#ffffff')
        
        for idx, itm in enumerate(items):
            iy = 3.6 - idx * 1.15
            i_rect = patches.FancyBboxPatch((cx - 0.9, iy - 0.35), 1.8, 0.7,
                                           boxstyle="round,pad=0.04,rounding_size=0.08",
                                           edgecolor=col, facecolor='#ffffff')
            ax.add_patch(i_rect)
            ax.text(cx, iy, itm, ha='center', va='center', fontsize=6.8, color='#1e293b')

    # Arrows
    for start_x, end_x in [(2.35, 2.55), (4.85, 5.15), (7.45, 7.65)]:
        ax.annotate('', xy=(end_x, 2.8), xytext=(start_x, 2.8),
                    arrowprops=dict(arrowstyle="-|>", color="#334155", lw=2, mutation_scale=15))

    # Rejection Box
    rej = patches.FancyBboxPatch((2.5, 0.3), 5.0, 0.55, boxstyle="round,pad=0.05,rounding_size=0.1",
                                edgecolor='#dc2626', facecolor='#fef2f2', lw=1.2)
    ax.add_patch(rej)
    ax.text(5.0, 0.57, 'Regla de rechazo: Si el rol no posee el permiso requerido -> HTTP 403 Forbidden', 
            ha='center', va='center', fontsize=7.5, weight='bold', color='#b91c1c')

    plt.tight_layout()
    plt.savefig('scratch/teoria_rbac_model.png', dpi=300, bbox_inches='tight')
    plt.close()
    print("Generated: scratch/teoria_rbac_model.png")

# 6. Neon Serverless Architecture
def generate_neon_diagram():
    fig, ax = plt.subplots(figsize=(10, 6.2), dpi=300)
    ax.set_facecolor('#ffffff')
    fig.patch.set_facecolor('#ffffff')
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 6.2)
    ax.axis('off')

    ax.text(5, 5.8, 'Arquitectura de Base de Datos Serverless en Neon Database', 
            ha='center', va='center', fontsize=14, weight='bold', color='#0f172a')
    ax.text(5, 5.45, 'Desacoplamiento total entre Capa de Computo (Postgres) y Almacenamiento Distribuido', 
            ha='center', va='center', fontsize=9.5, color='#475569')

    # Top: Application / Backend
    app_rect = patches.FancyBboxPatch((3.2, 4.4), 3.6, 0.7, boxstyle="round,pad=0.08,rounding_size=0.12",
                                     edgecolor='#0284c7', facecolor='#f0f9ff', lw=1.5)
    ax.add_patch(app_rect)
    ax.text(5.0, 4.75, 'Servidor Backend Node.js / Express (Pool de Conexiones)', ha='center', va='center', fontsize=8.5, weight='bold', color='#0369a1')

    # Middle: Compute Layer
    ax.annotate('', xy=(5.0, 3.8), xytext=(5.0, 4.4),
                arrowprops=dict(arrowstyle="<|-|>", color="#0284c7", lw=2, mutation_scale=15))
    ax.text(5.1, 4.1, 'Conexion TCP / SSL (pgpool)', fontsize=7.2, color='#0284c7')

    comp_rect = patches.FancyBboxPatch((1.5, 2.7), 7.0, 1.1, boxstyle="round,pad=0.08,rounding_size=0.15",
                                      edgecolor='#10b981', facecolor='#f0fdf4', lw=1.5)
    ax.add_patch(comp_rect)
    ax.text(5.0, 3.55, 'CAPA DE COMPUTO: Instancia Postgres Efimera (Stateless)', ha='center', va='center', fontsize=9.0, weight='bold', color='#047857')
    ax.text(5.0, 3.1, 'Ejecuta el motor PostgreSQL 16, planifica y resuelve consultas SQL.\nEscala a cero automaticamente tras periodos de inactividad para optimizar costos.', 
            ha='center', va='center', fontsize=7.5, color='#065f46')

    # Bottom: Storage Layer
    ax.annotate('', xy=(5.0, 2.0), xytext=(5.0, 2.7),
                arrowprops=dict(arrowstyle="<|-|>", color="#10b981", lw=2, mutation_scale=15))
    ax.text(5.1, 2.35, 'Protocolo de Paginas y WAL', fontsize=7.2, color='#047857')

    stor_rect = patches.FancyBboxPatch((1.0, 0.6), 8.0, 1.4, boxstyle="round,pad=0.08,rounding_size=0.15",
                                      edgecolor='#7c3aed', facecolor='#faf5ff', lw=1.5)
    ax.add_patch(stor_rect)
    ax.text(5.0, 1.7, 'CAPA DE ALMACENAMIENTO DISTRIBUIDO (Neon Custom Storage)', ha='center', va='center', fontsize=9.0, weight='bold', color='#6d28d9')
    
    # Submodules
    sub_modules = [
        ('Safekeepers (Paxos)', 'Consenso de WAL duradero', '#6d28d9', 2.3),
        ('Pageserver (Memoria)', 'Cache de bloques en NVMe', '#6d28d9', 5.0),
        ('Cloud Storage (S3)', 'Persistencia fria e historica', '#6d28d9', 7.7)
    ]
    for m_title, m_desc, col, mx in sub_modules:
        m_box = patches.FancyBboxPatch((mx - 1.15, 0.8), 2.3, 0.65, boxstyle="round,pad=0.04,rounding_size=0.08",
                                      edgecolor=col, facecolor='#ffffff')
        ax.add_patch(m_box)
        ax.text(mx, 1.25, m_title, ha='center', va='center', fontsize=7.5, weight='bold', color=col)
        ax.text(mx, 0.98, m_desc, ha='center', va='center', fontsize=6.8, color='#334155')

    plt.tight_layout()
    plt.savefig('scratch/teoria_neon_serverless_architecture.png', dpi=300, bbox_inches='tight')
    plt.close()
    print("Generated: scratch/teoria_neon_serverless_architecture.png")

# 7. Docker vs VM
def generate_docker_vs_vm():
    fig, ax = plt.subplots(figsize=(10, 6.0), dpi=300)
    ax.set_facecolor('#ffffff')
    fig.patch.set_facecolor('#ffffff')
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 6)
    ax.axis('off')

    ax.text(5, 5.6, 'Comparativa Arquitectonica: Maquinas Virtuales vs. Contenedores Docker', 
            ha='center', va='center', fontsize=14, weight='bold', color='#0f172a')
    ax.text(5, 5.25, 'Eficiencia en uso de memoria, aislamiento a nivel de kernel y portabilidad de software', 
            ha='center', va='center', fontsize=9.5, color='#475569')

    # Left: VM
    vm_box = patches.FancyBboxPatch((0.6, 0.6), 4.1, 4.4, boxstyle="round,pad=0.08,rounding_size=0.15",
                                   edgecolor='#d97706', facecolor='#fffbeb', lw=1.5)
    ax.add_patch(vm_box)
    ax.text(2.65, 4.75, 'MAQUINA VIRTUAL (Hipervisor)', ha='center', va='center', fontsize=9.5, weight='bold', color='#b45309')

    layers_vm = [
        ('Aplicacion A', 'Libs / Bin', 'SO Invitado (Guest OS)', 1.7),
        ('Aplicacion B', 'Libs / Bin', 'SO Invitado (Guest OS)', 3.6),
    ]
    # Draw VM 1
    ax.add_patch(patches.Rectangle((0.9, 2.5), 1.6, 1.9, facecolor='#fef3c7', edgecolor='#d97706', lw=1))
    ax.text(1.7, 4.1, 'App GPON 1', ha='center', va='center', fontsize=7.2, weight='bold', color='#92400e')
    ax.text(1.7, 3.5, 'Bins / Libs', ha='center', va='center', fontsize=7.0, color='#92400e')
    ax.text(1.7, 2.8, 'SO Invitado\n(Linux/Win)\n[Sobrecosto]', ha='center', va='center', fontsize=6.8, weight='bold', color='#b91c1c')

    # Draw VM 2
    ax.add_patch(patches.Rectangle((2.8, 2.5), 1.6, 1.9, facecolor='#fef3c7', edgecolor='#d97706', lw=1))
    ax.text(3.6, 4.1, 'Base Datos', ha='center', va='center', fontsize=7.2, weight='bold', color='#92400e')
    ax.text(3.6, 3.5, 'Bins / Libs', ha='center', va='center', fontsize=7.0, color='#92400e')
    ax.text(3.6, 2.8, 'SO Invitado\n(Linux/Win)\n[Sobrecosto]', ha='center', va='center', fontsize=6.8, weight='bold', color='#b91c1c')

    # Hypervisor & Host
    ax.add_patch(patches.Rectangle((0.9, 1.75), 3.5, 0.6, facecolor='#fde68a', edgecolor='#d97706', lw=1))
    ax.text(2.65, 2.05, 'Hipervisor (Type 1 o Type 2)', ha='center', va='center', fontsize=7.5, weight='bold', color='#92400e')

    ax.add_patch(patches.Rectangle((0.9, 1.2), 3.5, 0.45, facecolor='#e2e8f0', edgecolor='#64748b', lw=1))
    ax.text(2.65, 1.42, 'Sistema Operativo Anfitrion (Host OS)', ha='center', va='center', fontsize=7.2, color='#334155')

    ax.add_patch(patches.Rectangle((0.9, 0.75), 3.5, 0.35, facecolor='#cbd5e1', edgecolor='#64748b', lw=1))
    ax.text(2.65, 0.92, 'Infraestructura Fisica (Hardware / CPU / RAM)', ha='center', va='center', fontsize=7.0, color='#1e293b')

    # Right: Docker
    dk_box = patches.FancyBboxPatch((5.3, 0.6), 4.1, 4.4, boxstyle="round,pad=0.08,rounding_size=0.15",
                                   edgecolor='#0284c7', facecolor='#f0f9ff', lw=1.5)
    ax.add_patch(dk_box)
    ax.text(7.35, 4.75, 'CONTENEDOR DOCKER (Aislamiento)', ha='center', va='center', fontsize=9.5, weight='bold', color='#0369a1')

    # Cont 1
    ax.add_patch(patches.Rectangle((5.6, 3.1), 1.6, 1.3, facecolor='#e0f2fe', edgecolor='#0284c7', lw=1))
    ax.text(6.4, 4.1, 'App GPON (Node)', ha='center', va='center', fontsize=7.2, weight='bold', color='#0369a1')
    ax.text(6.4, 3.5, 'Bins / Libs (Alpine)\n[Ligero ~50MB]', ha='center', va='center', fontsize=6.8, color='#0369a1')

    # Cont 2
    ax.add_patch(patches.Rectangle((7.5, 3.1), 1.6, 1.3, facecolor='#e0f2fe', edgecolor='#0284c7', lw=1))
    ax.text(8.3, 4.1, 'Postgres DB', ha='center', va='center', fontsize=7.2, weight='bold', color='#0369a1')
    ax.text(8.3, 3.5, 'Bins / Libs (Alpine)\n[Ligero ~80MB]', ha='center', va='center', fontsize=6.8, color='#0369a1')

    # Docker Daemon
    ax.add_patch(patches.Rectangle((5.6, 2.35), 3.5, 0.6, facecolor='#bae6fd', edgecolor='#0284c7', lw=1))
    ax.text(7.35, 2.65, 'Motor Docker (Namespaces + Cgroups)', ha='center', va='center', fontsize=7.5, weight='bold', color='#0369a1')

    ax.add_patch(patches.Rectangle((5.6, 1.55), 3.5, 0.7, facecolor='#e2e8f0', edgecolor='#64748b', lw=1))
    ax.text(7.35, 1.9, 'Kernel Compartido del SO Anfitrion\n(Sin duplicar sistemas operativos)', ha='center', va='center', fontsize=7.2, color='#334155')

    ax.add_patch(patches.Rectangle((5.6, 0.75), 3.5, 0.7, facecolor='#cbd5e1', edgecolor='#64748b', lw=1))
    ax.text(7.35, 1.1, 'Infraestructura Fisica (Hardware / Servidor)', ha='center', va='center', fontsize=7.0, color='#1e293b')

    plt.tight_layout()
    plt.savefig('scratch/teoria_docker_vs_vm.png', dpi=300, bbox_inches='tight')
    plt.close()
    print("Generated: scratch/teoria_docker_vs_vm.png")

if __name__ == '__main__':
    generate_event_loop()
    generate_react_virtual_dom()
    generate_service_worker()
    generate_jwt_diagram()
    generate_rbac_diagram()
    generate_neon_diagram()
    generate_docker_vs_vm()
    print("All 7 technical diagrams generated successfully!")
