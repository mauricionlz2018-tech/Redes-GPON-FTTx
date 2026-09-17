import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as patches

def generate_cloud_topology():
    fig, ax = plt.subplots(figsize=(10, 6.2), dpi=300)
    ax.set_facecolor('#ffffff')
    fig.patch.set_facecolor('#ffffff')
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 6.2)
    ax.axis('off')

    ax.text(5, 5.8, 'Topologia de Despliegue en la Nube y Red Perimetral de Produccion', 
            ha='center', va='center', fontsize=14, weight='bold', color='#0f172a')
    ax.text(5, 5.45, 'Integracion continua entre Vercel Edge Network, Backend Node.js y Neon Serverless Postgres', 
            ha='center', va='center', fontsize=9.5, color='#475569')

    # Left: Field Devices / Cuadrillas
    dev_box = patches.FancyBboxPatch((0.5, 1.2), 2.4, 3.6, boxstyle="round,pad=0.08,rounding_size=0.15",
                                     edgecolor='#0284c7', facecolor='#f0f9ff', lw=1.5)
    ax.add_patch(dev_box)
    ax.text(1.7, 4.4, 'CLIENTES / CAMPO', ha='center', va='center', fontsize=9.5, weight='bold', color='#0369a1')
    ax.text(1.7, 4.1, 'San Jose del Rincon', ha='center', va='center', fontsize=8, color='#0284c7')

    dev_items = [
        ('Cuadrilla Tecnico 1\n(Smartphone PWA)', '#0284c7', 3.3),
        ('Ingeniero de Soporte\n(Laptop / Chrome)', '#0284c7', 2.3),
        ('Director / Admin\n(Estacion Central)', '#0284c7', 1.3)
    ]
    for lbl, col, iy in dev_items:
        ibox = patches.FancyBboxPatch((0.7, iy - 0.35), 2.0, 0.7, boxstyle="round,pad=0.04,rounding_size=0.08",
                                     edgecolor=col, facecolor='#ffffff')
        ax.add_patch(ibox)
        ax.text(1.7, iy, lbl, ha='center', va='center', fontsize=7.2, color='#1e293b')

    # Arrow 1
    ax.annotate('', xy=(3.5, 3.0), xytext=(2.9, 3.0),
                arrowprops=dict(arrowstyle="-|>", color="#334155", lw=2, mutation_scale=15))
    ax.text(3.2, 3.2, 'HTTPS / SSL\nDNS Global', ha='center', va='center', fontsize=7, color='#475569')

    # Middle Left: Vercel Edge Network
    ver_box = patches.FancyBboxPatch((3.7, 1.2), 2.7, 3.6, boxstyle="round,pad=0.08,rounding_size=0.15",
                                     edgecolor='#000000', facecolor='#f8fafc', lw=1.5)
    ax.add_patch(ver_box)
    ax.text(5.05, 4.4, 'VERCEL EDGE CDN', ha='center', va='center', fontsize=9.5, weight='bold', color='#000000')
    ax.text(5.05, 4.1, 'Despliegue Frontend SPA', ha='center', va='center', fontsize=8, color='#475569')
    ax.text(5.05, 3.5, 'Dominio de Produccion:\nredes-gpon-ft-txs.vercel.app', ha='center', va='center', fontsize=7.2, weight='bold', color='#0284c7')
    ax.text(5.05, 2.7, 'Distribucion Anycast:\n- Servidor de activos estaticos\n- Cache de rutas y Service Worker\n- Compilacion automatica Vite', 
            ha='center', va='center', fontsize=7.2, color='#334155')
    ax.text(5.05, 1.6, 'Proxy Seguro / Backend API\nRedireccion de trafico /api/*', ha='center', va='center', fontsize=7.2, weight='bold', color='#15803d')

    # Arrow 2
    ax.annotate('', xy=(6.9, 3.0), xytext=(6.4, 3.0),
                arrowprops=dict(arrowstyle="-|>", color="#334155", lw=2, mutation_scale=15))
    ax.text(6.65, 3.2, 'TLS v1.3\nPort 5432', ha='center', va='center', fontsize=7, color='#475569')

    # Right: Neon Database Serverless
    neon_box = patches.FancyBboxPatch((7.1, 1.2), 2.5, 3.6, boxstyle="round,pad=0.08,rounding_size=0.15",
                                      edgecolor='#10b981', facecolor='#f0fdf4', lw=1.5)
    ax.add_patch(neon_box)
    ax.text(8.35, 4.4, 'NEON DATABASE', ha='center', va='center', fontsize=9.5, weight='bold', color='#047857')
    ax.text(8.35, 4.1, 'Serverless PostgreSQL 16', ha='center', va='center', fontsize=8, color='#10b981')
    ax.text(8.35, 3.5, 'Clustering Serverless:\n- Pooler de conexiones TCP\n- Cero administracion fisica\n- Computo Efimero Postgres', 
            ha='center', va='center', fontsize=7.2, color='#065f46')
    ax.text(8.35, 2.5, 'Capa de Almacenamiento:\n- Multi-AZ redundante en la nube\n- Copias de seguridad continuas\n- Instantaneas point-in-time', 
            ha='center', va='center', fontsize=7.2, color='#065f46')
    ax.text(8.35, 1.5, 'Alta Disponibilidad:\nSLA 99.95% de tiempo activo', ha='center', va='center', fontsize=7.2, weight='bold', color='#047857')

    # Footnote
    ax.text(5.0, 0.5, 'Protocolo de Seguridad: Comunicacion extremo a extremo encriptada bajo TLS 1.3 con certificados SSL Let\'s Encrypt y claves JWT.',
            ha='center', va='center', fontsize=8, style='italic', color='#475569')

    plt.tight_layout()
    plt.savefig('scratch/teoria_despliegue_cloud_neon_vercel.png', dpi=300, bbox_inches='tight')
    plt.close()
    print("Generated: scratch/teoria_despliegue_cloud_neon_vercel.png")

if __name__ == '__main__':
    generate_cloud_topology()
