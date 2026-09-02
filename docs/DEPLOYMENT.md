# Guía Maestra de Despliegue y Operación
## Sistema de Inventario y Mapeo Lógico GPON / FTTx
**GPON TELECOM S.A. de C.V.**

---

## 1. Resumen de la Arquitectura

El sistema está diseñado en una arquitectura desacoplada y modular:

| Componente | Tecnología | Puerto por Defecto | Propósito |
| :--- | :--- | :--- | :--- |
| **Base de Datos** | PostgreSQL 16 (JSONB nativo) | `5433` (Local) / `5432` (Docker interno) | Almacén relacional con tipos ENUM y coordenadas GPS |
| **Backend API** | Node.js, Express, TypeScript, Sequelize, PDFKit | `4000` | API REST v1, autenticación JWT, transacciones ACID con bloqueo de fila |
| **Frontend SPA** | React 18, Vite, Tailwind CSS, Leaflet, Dexie.js | `3000` (Dev) / `80` (Prod Nginx) | Interfaz cartográfica interactiva, panel de 16 puertos y modo Offline-First |
| **pgAdmin 4** (Opcional) | pgAdmin Web | `5050` | Interfaz gráfica web para administrar la base de datos PostgreSQL |

---

## 2. Despliegue Local Rápido (3 Pasos Llave en Mano)

Este método es el más recomendado para desarrollo, pruebas y demostración inmediata.

### Requisitos Previos
- **Docker Desktop** (en ejecución).
- **Node.js** v18 o superior (`node -v`).
- **pnpm** (`npm install -g pnpm`).

---

### Paso 1: Levantar la Base de Datos con Docker
Desde la raíz del proyecto, ejecuta:
```bash
docker compose -f docker/docker-compose.yml up -d
```
> **Nota técnica**: El contenedor expone el puerto `5433:5432` en el host para evitar cualquier posible conflicto con instalaciones locales de PostgreSQL en tu máquina.

Verifica que el contenedor esté saludable:
```bash
docker ps
```
*(Deberás ver `gpon_postgres` con estado `healthy`).*

---

### Paso 2: Ejecutar el Seed Automático de Datos
El sistema incluye un script automático que crea las tablas, relaciones, la central ODF de San José del Rincón, 4 cajas NAP con 64 puertos y abonados iniciales:

```bash
pnpm --filter backend run seed
```

Al terminar, verás el mensaje:
```
✔ Tablas y esquemas sincronizados correctamente.
✔ Usuarios iniciales creados (admin@gpon.com, soporte@gpon.com, tecnico@gpon.com / pass: admin123).
✔ ODF Central creado: ODF Central San José del Rincón
✔ Caja NAP-SJR-01 creada con 16 puertos (13 ocupados).
✔ Caja NAP-SJR-02 creada con 16 puertos (16 ocupados).
✔ Caja NAP-SJR-03 creada con 16 puertos (4 ocupados).
✔ Caja NAP-SJR-04 creada con 16 puertos (2 ocupados).
🎉 Seed completado exitosamente con topología GPON.
```

---

### Paso 3: Iniciar Backend y Frontend

Abre dos terminales (o usa los scripts desde la raíz):

**Terminal 1 (Backend en http://localhost:4000):**
```bash
pnpm --filter backend dev
```

**Terminal 2 (Frontend en http://localhost:3000):**
```bash
pnpm --filter frontend dev
```

¡Listo! Abre tu navegador en **`http://localhost:3000`**.

---

### Credenciales de Prueba Precargadas

| Perfil | Correo de Acceso | Contraseña | Permisos |
| :--- | :--- | :--- | :--- |
| **Administrador** | `admin@gpon.com` | `admin123` | Control total del sistema, NAPs, clientes, reportes y usuarios. |
| **Soporte Técnico** | `soporte@gpon.com` | `admin123` | Gestión de infraestructura, clientes y corrección/liberación de puertos. |
| **Técnico de Campo** | `tecnico@gpon.com` | `admin123` | Lectura de mapa/NAPs y asignación inicial (`POST`). Edición/borrado bloqueados (403). |

> **Tip de Evaluación**: La pantalla de inicio de sesión y la barra superior cuentan con botones de **Acceso Rápido con 1 Clic** para alternar entre los roles sin tener que escribir contraseñas.

---

## 3. Despliegue en Producción con Docker Compose

Para poner todo el sistema en producción en un servidor local o empresarial con Nginx y contenedores optimizados:

### Comando de Producción:
```bash
docker compose -f docker/docker-compose.prod.yml up -d --build
```

Esto compilará:
1. `gpon_prod_db`: PostgreSQL 16 optimizado.
2. `gpon_prod_backend`: Imagen multi-stage en Node.js Alpine ejecutando el código TypeScript compilado a JavaScript puro.
3. `gpon_prod_frontend`: Imagen multi-stage con servidor web **Nginx**, sirviendo la SPA de React con compresión Gzip y proxy inverso hacia el backend en el puerto `80`.

Para ejecutar el seed en el contenedor de producción por primera vez:
```bash
docker exec -it gpon_prod_backend pnpm run seed
```

---

## 4. Despliegue en la Nube (Cloud PaaS / Gratis o Económico)

Si deseas publicar el sistema en internet sin administrar servidores:

### Opción A: Base de Datos en Supabase (Gratuito)
1. Crea un proyecto en [Supabase](https://supabase.com).
2. Obtén la cadena de conexión URI de PostgreSQL (`postgres://postgres:[PASSWORD]@[HOST]:5432/postgres`).
3. En las variables de entorno del backend configura:
   ```env
   DB_HOST=db.xxx.supabase.co
   DB_PORT=5432
   DB_USER=postgres
   DB_PASSWORD=tu_password
   DB_NAME=postgres
   DB_SSL=true
   ```

### Opción B: Backend en Render o Railway
1. Conecta tu repositorio de GitHub a [Render](https://render.com) o [Railway](https://railway.app).
2. Selecciona la carpeta raíz `backend/`.
3. Comando de Build: `pnpm install && pnpm run build`.
4. Comando de Inicio: `node dist/index.js`.
5. Agrega las variables de entorno (`JWT_SECRET`, `DB_HOST`, etc.).

### Opción C: Frontend en Vercel o Netlify
1. Conecta el repositorio en [Vercel](https://vercel.com).
2. Directorio raíz: `frontend`.
3. Framework Preset: `Vite`.
4. Comando de Build: `pnpm run build`.
5. Directorio de salida: `dist`.

---

## 5. Despliegue en Servidor VPS (Ubuntu 22.04 / 24.04 con SSL)

Para operación en campo es **altamente recomendable tener HTTPS activo**, ya que los navegadores móviles requieren conexión segura para habilitar el sensor GPS (`navigator.geolocation`) y la instalación como PWA.

### Pasos en el VPS:
1. **Instalar Docker y Docker Compose:**
   ```bash
   sudo apt update && sudo apt install -y docker.io docker-compose-v2
   ```
2. **Clonar el proyecto:**
   ```bash
   git clone <URL_REPOSITORIO> /opt/gpon-fttx
   cd /opt/gpon-fttx
   ```
3. **Levantar el stack de producción:**
   ```bash
   docker compose -f docker/docker-compose.prod.yml up -d --build
   docker exec -it gpon_prod_backend pnpm run seed
   ```
4. **Instalar Certbot para certificado SSL gratuito:**
   ```bash
   sudo apt install -y certbot python3-certbot-nginx
   sudo certbot --nginx -d gpon.tuempresa.com
   ```

---

## 6. Operación en Campo para Técnicos (PWA Móvil y Offline-First)

### Instalación como Aplicación Móvil (PWA):
1. Desde el navegador del teléfono (Chrome en Android o Safari en iOS), ingresa a la dirección del sistema.
2. Pulsa en el menú del navegador: **"Instalar aplicación"** o **"Agregar a la pantalla principal"**.
3. La aplicación se abrirá a pantalla completa como una app nativa, con ícono corporativo.

### Operación en Zonas sin Cobertura Celular ("Zonas Muertas"):
- El sistema utiliza **Dexie.js (IndexedDB)** para almacenar en la memoria del teléfono el mapa y las cajas NAP.
- Si el técnico realiza una asignación de abonado sin señal:
  1. La UI mostrará el distintivo **"Modo Offline"**.
  2. La petición se guarda de inmediato en la cola local de IndexedDB.
  3. El puerto se marca visualmente como ocupado para evitar dobles asignaciones.
  4. En cuanto el teléfono detecta señal celular o Wi-Fi, el sistema dispara automáticamente la sincronización vaciando la cola hacia el backend.
  5. También se dispone del botón manual **"Sync (X)"** en la barra superior.

### Captura de Coordenadas GPS en Sitio:
- Al estar frente al poste o acometida de la caja NAP, el técnico presiona **"Capturar GPS de Campo"**.
- El modal consulta el sensor de precisión del smartphone.
- Con un clic en **"Guardar Coordenadas"**, la posición geográfica de la NAP se actualiza en el mapa cartográfico.

---

## 7. Verificación de Seguridad y Reglas de Negocio (RBAC)

1. **Prueba de Error 403 Forbidden para Técnicos:**
   - Selecciona el rol **Técnico** en la barra superior.
   - En el panel de 16 puertos, haz clic sobre cualquier puerto en estado `Ocupado`.
   - Haz clic en **"Liberar Puerto"**.
   - **Resultado:** El sistema bloquea la acción inmediatamente mostrando la alerta:
     > `⛔ Permiso denegado (HTTP 403 Forbidden): El rol 'Tecnico' tiene acceso de solo lectura y registro inicial. La corrección o liberación de puertos ocupados es exclusiva de Soporte y Administrador.`

2. **Prueba de Liberación para Soporte/Admin:**
   - Cambia al rol **Soporte** o **Admin**.
   - Haz clic en **"Liberar Puerto"**.
   - **Resultado:** La base de datos libera el puerto atómicamente, lo cambia a verde (`Libre`), desvincula al abonado y actualiza el porcentaje de saturación en tiempo real.

3. **Prueba de Concurrencia ACID (Bloqueo de Fila):**
   - El endpoint `/api/v1/puertos/asignar` utiliza `Transaction.LOCK.UPDATE`.
   - Si dos técnicos envían una petición simultánea al mismo puerto libre, la transacción del primero adquiere el bloqueo exclusivo en PostgreSQL; la segunda transacción detecta que el estado ya no es `Libre` y realiza un `rollback` limpio devolviendo código `409 Conflict`.

4. **Prueba de Generación de Reporte PDF:**
   - Ve a la pestaña **Reportes PDF**.
   - Haz clic en **"Descargar Reporte PDF Ejecutivo"**.
   - El backend con **PDFKit** generará y descargará al vuelo el documento membretado con las tablas de saturación, diagnósticos de alerta y padrón de clientes.

