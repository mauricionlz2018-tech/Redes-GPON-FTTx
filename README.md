# Sistema de Inventario y Mapeo Lógico GPON / FTTx
### GPON TELECOM S.A. de C.V.

Sistema integral de gestión de infraestructura de fibra óptica pasiva (ODF Central, puertos PON, hilos de fibra, cajas NAP y puertos de abonados) con mapeo cartográfico interactivo en OpenStreetMap, transacciones ACID con bloqueo de concurrencia y arquitectura Offline-First con soporte móvil para técnicos en campo.

---

## ⚡ Inicio Rápido en 3 Pasos

```bash
# 1. Levantar la base de datos PostgreSQL en Docker
docker compose -f docker/docker-compose.yml up -d

# 2. Poblar la base de datos con la topología inicial de San José del Rincón
pnpm --filter backend run seed

# 3. Arrancar backend y frontend en desarrollo
pnpm --filter backend dev    # API en http://localhost:4000
pnpm --filter frontend dev   # App en http://localhost:3000
```

---

## 🚀 Perfiles de Acceso Rápido (Demo RBAC)

La aplicación incluye un conmutador de roles en 1 clic para evaluar el control de acceso:

- **Administrador**: `admin@gpon.com` (pass: `admin123`) - Acceso total.
- **Soporte Técnico**: `soporte@gpon.com` (pass: `admin123`) - Infraestructura y corrección de puertos.
- **Técnico de Campo**: `tecnico@gpon.com` (pass: `admin123`) - Lectura y asignación inicial (Edición/borrado restringidos con 403 Forbidden).

---

## 📖 Documentación Completa de Despliegue

Consulta la guía exhaustiva en [`docs/DEPLOYMENT.md`](./docs/DEPLOYMENT.md) para:
- Despliegue en producción con Docker Compose y Nginx (`docker/docker-compose.prod.yml`).
- Despliegue en la nube (Supabase, Render, Railway, Vercel).
- Configuración en VPS con certificados SSL (Let's Encrypt / HTTPS).
- Instalación PWA en teléfonos móviles para cuadrillas en campo y modo sin conexión (Offline-First).

