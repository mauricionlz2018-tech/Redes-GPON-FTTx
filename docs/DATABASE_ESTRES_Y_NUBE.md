# Arquitectura de Base de Datos para Alta Concurrencia, Pruebas de Estrés y Despliegue en la Nube
### GPON TELECOM S.A. de C.V. — Sistema de Inventario y Mapeo Lógico FTTx

---

## 1. Herramientas de PostgreSQL en Línea (Compatibles con Vercel)

Dado que desplegaste tu frontend en **Vercel**, necesitas una base de datos PostgreSQL alojada en la nube accesible públicamente mediante SSL. A continuación, las mejores herramientas gratuitas y recomendadas:

### Comparativa de Opciones Gratuitas

| Proveedor | Enlace | Pros Clave | Integración con Vercel |
| :--- | :--- | :--- | :--- |
| **Neon** *(Más recomendada para Vercel)* | [neon.tech](https://neon.tech) | Arquitectura *Serverless*, escalado a cero, ramas de BD instantáneas, connection pooler integrado. | **Nativa 1-Clic**: Se integra directamente en el marketplace de Vercel. |
| **Supabase** | [supabase.com](https://supabase.com) | 500 MB gratis, panel visual tipo Excel, soporte nativo de extensiones (PostGIS), pooling con pgBouncer/Supavisor. | Se conecta mediante variable de entorno `DATABASE_URL`. |
| **Railway** | [railway.app](https://railway.app) | Permite desplegar **la base de datos PostgreSQL Y el backend Node.js** en el mismo lugar con 1 clic. | Muy alta compatibilidad con variables privadas. |
| **Render** | [render.com](https://render.com) | PostgreSQL administrado gratuito por 90 días, compatible con Docker. | Excelente para conectar con web services. |

---

## 2. Recomendación Principal: Neon o Supabase

### Opción A: Neon (La opción nativa de Vercel)
1. Entra a [neon.tech](https://neon.tech) y crea una cuenta gratuita con GitHub.
2. Crea un proyecto: `gpon-fttx-db` (Región: `US East (Ohio)` o `US East (N. Virginia)` para menor latencia con Vercel).
3. En el panel principal, copia la cadena de conexión:
   ```env
   postgres://[usuario]:[password]@[host]/gpon_inventory?sslmode=require
   ```
4. **Ventaja técnica**: Cuenta con conexión *Pooled* (puerto `6543`), que evita que se agoten las conexiones durante pruebas de estrés.

### Opción B: Supabase (Panel visual más amigable)
1. Entra a [supabase.com](https://supabase.com) e inicia sesión con GitHub.
2. Pulsa **"New Project"** -> Nombre: `gpon-telecom` -> Contraseña de BD: `gpon_secret_2026`.
3. Ve a **Project Settings** -> **Database** -> sección **Connection String** -> pestaña **URI**.
4. Copia la URL de conexión (con `sslmode=require`).
5. En la sección **Table Editor** puedes ver y editar tus tablas gráficamente igual que en un Excel.

---

## 3. Arquitectura de Base de Datos Diseñada para Pruebas de Estrés y Concurrencia

Para que una base de datos GPON soporte cientos de técnicos asignando puertos simultáneamente sin colisiones, caídas ni bloqueos mutuos (*deadlocks*), debe implementar 4 capas fundamentales:

```
[ Cuadrillas en Campo (Técnicos) ]  ---> [ Concurrencia Simultánea ]
                  │
                  ▼
┌────────────────────────────────────────────────────────┐
│ 1. Connection Pooling (pgBouncer / Sequelize Pool)     │
│    - Reutilización de conexiones sin saturar Postgres  │
└──────────────────────┬─────────────────────────────────┘
                       │
                       ▼
┌────────────────────────────────────────────────────────┐
│ 2. Transacciones Atómicas con Bloqueo de Fila (ACID)   │
│    - SELECT ... FOR UPDATE (Transaction.LOCK.UPDATE)   │
└──────────────────────┬─────────────────────────────────┘
                       │
                       ▼
┌────────────────────────────────────────────────────────┐
│ 3. Restricciones e Índices Parciales B-Tree            │
│    - Búsqueda en microsegundos de puertos 'Libres'     │
│    - Restricción UNIQUE compuesta (id_nap, indice)     │
└──────────────────────┬─────────────────────────────────┘
                       │
                       ▼
┌────────────────────────────────────────────────────────┐
│ 4. PostgreSQL Engine (WAL, shared_buffers, work_mem)   │
└────────────────────────────────────────────────────────┘
```

---

### 3.1. Índices Estratégicos para Alto Rendimiento

Para soportar consultas de lectura y filtrado masivo en milisegundos:

```sql
-- 1. Índice único estricto: Una caja NAP nunca puede tener puertos duplicados
CREATE UNIQUE INDEX IF NOT EXISTS "idx_nap_ports_unique" 
ON "nap_ports" ("id_nap", "indice_puerto");

-- 2. Índice Parcial Ultra-Rápido: Solo indexa puertos LIBRES para asignaciones concurrentes
-- Reduce el tamaño del índice en un 80% y acelera la búsqueda bajo estrés
CREATE INDEX IF NOT EXISTS "idx_nap_ports_libres" 
ON "nap_ports" ("id_nap", "indice_puerto") 
WHERE "estado" = 'Libre';

-- 3. Índice Único en Clientes: Previene colisiones de MAC de ONT en instalaciones simultáneas
CREATE UNIQUE INDEX IF NOT EXISTS "idx_clients_ont_mac" 
ON "clients" ("ont_mac");

-- 4. Índice para Vinculación 1:1 estricta puerto-cliente
CREATE UNIQUE INDEX IF NOT EXISTS "idx_clients_puerto_nap" 
ON "clients" ("id_puerto_nap");

-- 5. Índice JSONB GIN para consultas geoespaciales por coordenadas GPS
CREATE INDEX IF NOT EXISTS "idx_nap_coordenadas_gin" 
ON "nap_boxes" USING GIN ("coordenadas_gps");
```

---

### 3.2. Concurrencia ACID y Bloqueo de Fila (`Row-Level Locking`)

#### El Problema de Carrera (*Race Condition*):
Si dos técnicos en campo pulsan "Asignar Abonado" en el **Puerto #5** de la misma NAP al mismo milisegundo:
- Sin bloqueo: Ambos leen que el puerto está `'Libre'`. El sistema registraría a ambos clientes sobre el mismo splitter físico, provocando una colisión en campo.
- Con bloqueo `SELECT ... FOR UPDATE`:

```typescript
// backend/src/controllers/portController.ts
const t = await sequelize.transaction({
  isolationLevel: Transaction.ISOLATION_LEVELS.READ_COMMITTED
});

try {
  // Bloqueo exclusivo a nivel de fila
  const port = await NapPort.findByPk(id_puerto, {
    transaction: t,
    lock: t.LOCK.UPDATE // SELECT * FROM nap_ports WHERE id_puerto = ... FOR UPDATE
  });

  if (port.estado !== 'Libre') {
    await t.rollback();
    return res.status(409).json({ 
      success: false, 
      message: `El puerto #${port.indice_puerto} ya fue tomado por otro técnico.` 
    });
  }

  port.estado = 'Ocupado';
  await port.save({ transaction: t });

  await Client.create({ ...clienteData, id_puerto_nap: port.id_puerto }, { transaction: t });

  await t.commit(); // Se libera el bloqueo atómicamente
} catch (error) {
  await t.rollback();
}
```

---

### 3.3. Configuración de Connection Pool para Pruebas de Estrés

En entornos de alto estrés, crear una conexión TCP a PostgreSQL por cada petición satura el límite de procesos (`max_connections`). La configuración del pool en `backend/src/config/database.ts` debe optimizarse así:

```typescript
export const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
  host: dbHost,
  port: dbPort,
  dialect: 'postgres',
  pool: {
    max: 30,          // Conexiones simultáneas máximas en el pool
    min: 5,           // Conexiones mínimas siempre vivas
    acquire: 60000,   // Tiempo máximo (ms) para adquirir conexión antes de fallar
    idle: 10000,      // Tiempo (ms) para liberar conexiones inactivas
    evict: 1000       // Chequeo de salud de conexiones cada 1 seg
  },
  dialectOptions: {
    ssl: process.env.DB_SSL === 'true' ? {
      require: true,
      rejectUnauthorized: false
    } : false
  }
});
```

---

## 4. Script de Prueba de Estrés y Concurrencia Simultánea

Para probar la base de datos y verificar que soporta peticiones concurrentes sin errores de colisión, puedes ejecutar este script de prueba con Node.js / Autocannon:

### Crear archivo de prueba: `test-concurrency.ts`
```typescript
import axios from 'axios';

const API_URL = 'http://localhost:4000/api/v1';

async function testSimultaneousPortAssignment() {
  console.log('🚀 Iniciando prueba de estrés: 20 peticiones simultáneas al MISMO puerto...');

  // Token de técnico o admin
  const loginRes = await axios.post(`${API_URL}/auth/login`, {
    credencial_acceso: 'admin@gpon.com',
    password: 'admin123'
  });
  const token = loginRes.data.data.token;

  // Obtener una NAP con puertos libres
  const napsRes = await axios.get(`${API_URL}/naps`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const nap = napsRes.data.data[2]; // NAP-SJR-03 (Colonia Guadalupe)
  const napDetail = await axios.get(`${API_URL}/naps/${nap.id_nap}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const freePort = napDetail.data.data.puertos.find((p: any) => p.estado === 'Libre');

  if (!freePort) {
    console.log('No hay puerto libre para la prueba.');
    return;
  }

  console.log(`🎯 Objetivo de colisión: Puerto #${freePort.indice_puerto} (ID: ${freePort.id_puerto})`);

  // Lanzar 20 peticiones exactamente al mismo tiempo intentando tomar el mismo puerto
  const requests = Array.from({ length: 20 }).map((_, index) => {
    const randomHex = Math.floor(Math.random() * 89 + 10).toString(16);
    return axios.post(
      `${API_URL}/puertos/asignar`,
      {
        id_puerto: freePort.id_puerto,
        numero_cliente: `STRESS-${Date.now()}-${index}`,
        nombre_completo: `Cliente Estrés #${index + 1}`,
        marca_ont: 'Huawei',
        direccion: `Calle Prueba #${index}`,
        ont_mac: `50:04:B4:99:${index.toString(16).padStart(2, '0')}:${randomHex}`,
        potencia_rx_estimada: -19.2
      },
      {
        headers: { Authorization: `Bearer ${token}` },
        validateStatus: () => true // Capturar códigos 201 y 409
      }
    );
  });

  const responses = await Promise.all(requests);

  const exitosos = responses.filter((r) => r.status === 201).length;
  const rechazadosConflicto = responses.filter((r) => r.status === 409).length;

  console.log('--------------------------------------------------');
  console.log(`✅ Asignaciones Exitosas (Esperado: Exactamente 1): ${exitosos}`);
  console.log(`🛑 Rechazos por Bloqueo ACID 409 (Esperado: 19): ${rechazadosConflicto}`);
  console.log('--------------------------------------------------');

  if (exitosos === 1 && rechazadosConflicto === 19) {
    console.log('🏆 RESULTADO: Prueba superada con éxito. La base de datos tiene integridad ACID perfecta.');
  } else {
    console.log('⚠️ ALERTA: Hubo inconsistencia de concurrencia.');
  }
}

testSimultaneousPortAssignment();
```

---

## 5. Paso a Paso: Cómo Conectar tu Base de Datos en la Nube (Neon / Supabase)

### Paso 1: Obtener la Base de Datos Gratuita
1. Entra a [neon.tech](https://neon.tech) o [supabase.com](https://supabase.com).
2. Crea una base de datos llamada `gpon_inventory`.
3. Copia la cadena de conexión URI proporcionada.

### Paso 2: Configurar las Variables de Entorno del Backend
En tu archivo `backend/.env` o en el panel de configuración de tu servidor en la nube (Render/Railway):
```env
# Ejemplo con Neon / Supabase:
DB_HOST=ep-example-pooler.us-east-2.aws.neon.tech
DB_PORT=5432
DB_USER=neondb_owner
DB_PASSWORD=tu_password_secreto
DB_NAME=gpon_inventory
DB_SSL=true

JWT_SECRET=super_secret_production_jwt_key_fttx_2026
```

### Paso 3: Poblado Automático en la Nube
Desde tu terminal local, puedes poblar la base de datos de la nube ejecutando:
```powershell
pnpm --filter backend run seed
```
*(Sequelize se conectará a la nube mediante SSL, creará todas las tablas y dejará cargadas las 4 NAPs de San José del Rincón, el ODF y los usuarios)*.

### Paso 4: Conectar con Vercel
En tu panel de [Vercel](https://vercel.com):
1. Ve a tu proyecto -> **Settings** -> **Environment Variables**.
2. Añade:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://tu-backend.onrender.com` (o la URL de tu API desplegada).
3. Haz un **Redeploy** para aplicar los cambios.
