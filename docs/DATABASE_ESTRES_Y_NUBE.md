# Arquitectura de Base de Datos para Alta Concurrencia, Pruebas de Estrés y Despliegue en la Nube
## Sistema de Inventario y Mapeo Lógico GPON / FTTx
**GPON TELECOM S.A. de C.V.**

---

## 1. Introducción

En una red óptica pasiva (GPON / FTTx) de escala metropolitana, múltiples cuadrillas de técnicos en campo realizan instalaciones y asignaciones de acometidas en postes simultáneamente. Si dos o más cuadrillas intentan conectar a sus abonados sobre el mismo puerto físico libre al mismo milisegundo, un sistema ordinario sufriría **condiciones de carrera** (*race conditions*), asignando a dos suscriptores al mismo conector óptico y corrompiendo el inventario.

Este documento detalla la arquitectura de alta concurrencia diseñada para PostgreSQL, los mecanismos de bloqueo transaccional pesimista (**ACID**), la ejecución de pruebas de estrés y la guía paso a paso para desplegar la base de datos en servicios cloud de alta disponibilidad (Neon / Supabase) con integración directa a Vercel y Render.

---

## 2. Diagramas de Flujo y Secuencia de Concurrencia

### 2.1. Diagrama de Secuencia: Bloqueo Pesimista ACID (`SELECT ... FOR UPDATE`)

El siguiente diagrama ilustra cómo PostgreSQL resuelve el conflicto cuando dos técnicos intentan tomar el mismo puerto (#5) exactamente en el mismo instante:

```mermaid
sequenceDiagram
    autonumber
    actor T1 as Técnico A (En Terreno)
    actor T2 as Técnico B (En Terreno)
    participant API as Backend REST API (Express)
    participant DB as PostgreSQL Engine (Transaccional)

    Note over T1,T2: Ambos técnicos ven el Puerto #5 en estado "Libre"
    
    par Solicitudes Simultáneas al Puerto #5
        T1->>API: POST /puertos/asignar (Puerto #5, Cliente A)
    and
        T2->>API: POST /puertos/asignar (Puerto #5, Cliente B)
    end

    critical Transacción 1 (Técnico A llega primero por 1 ms)
        API->>DB: BEGIN TRANSACTION (Read Committed)
        API->>DB: SELECT * FROM nap_ports WHERE id_puerto = 'P5' FOR UPDATE;
        Note over DB: PostgreSQL aplica bloqueo exclusivo de fila en P5
        DB-->>API: Puerto P5 retornado (Estado: 'Libre')
    end

    critical Transacción 2 (Técnico B)
        API->>DB: BEGIN TRANSACTION
        API->>DB: SELECT * FROM nap_ports WHERE id_puerto = 'P5' FOR UPDATE;
        Note over DB: Transacción 2 queda en ESPERA (Bloqueada por T1)
    end

    Note over API,DB: Transacción 1 procesa la asignación
    API->>DB: UPDATE nap_ports SET estado = 'Ocupado' WHERE id_puerto = 'P5';
    API->>DB: INSERT INTO clients (id_puerto_nap, ...) VALUES ('P5', ...);
    API->>DB: COMMIT TRANSACTION;
    Note over DB: Se confirma T1 y se LIBERA el bloqueo de fila en P5
    API-->>T1: 201 Created: "Abonado asignado con éxito"

    Note over DB: Transacción 2 despierta y lee el estado ACTUALIZADO
    DB-->>API: Puerto P5 retornado (Estado: 'Ocupado')
    
    critical Verificación de Transacción 2
        Note over API: port.estado !== 'Libre' -> DETECCIÓN DE CONFLICTO
        API->>DB: ROLLBACK TRANSACTION;
        API-->>T2: 409 Conflict: "El puerto #5 ya no está disponible"
    end
```

---

### 2.2. Diagrama de Arquitectura Multicapa para Concurrencia

```mermaid
flowchart TD
    subgraph Clientes["Cuadrillas en Terreno y Oficinas"]
        C1["Técnico 1 (Móvil PWA)"]
        C2["Técnico 2 (Móvil PWA)"]
        C3["Técnico N (Móvil PWA)"]
        ADMIN["Soporte / Administrador (NOC)"]
    end

    subgraph BackendLayer["Capa de Aplicación y Balanceo"]
        API["Node.js / Express API (TypeScript)"]
        ZOD["Validación Estricta de Esquemas (Zod)"]
        POOL["Connection Pooler (Sequelize / pgBouncer)"]
    end

    subgraph PostgresLayer["Capa de Base de Datos PostgreSQL"]
        WAL["Write-Ahead Logging (WAL)"]
        LOCK["Manejador de Bloqueos (Row-Level Locking)"]
        INDEX["Índices B-Tree e Índices Parciales"]
        STORAGE[(Almacenamiento ACID)]
    end

    C1 -->|Petición HTTP/TLS| API
    C2 -->|Petición HTTP/TLS| API
    C3 -->|Petición HTTP/TLS| API
    ADMIN -->|Petición HTTP/TLS| API

    API --> ZOD
    ZOD --> POOL
    POOL -->|Reutilización de Conexiones| LOCK
    LOCK --> WAL
    LOCK --> INDEX
    INDEX --> STORAGE

    classDef tech fill:#0f172a,stroke:#38bdf8,stroke-width:2px,color:#f8fafc;
    classDef app fill:#1e293b,stroke:#818cf8,stroke-width:2px,color:#f8fafc;
    classDef db fill:#022c22,stroke:#34d399,stroke-width:2px,color:#f8fafc;

    class C1,C2,C3,ADMIN tech;
    class API,ZOD,POOL app;
    class WAL,LOCK,INDEX,STORAGE db;
```

---

## 3. Optimización de Base de Datos para Pruebas de Estrés

Para garantizar que PostgreSQL soporte ráfagas masivas de solicitudes sin agotar los descriptores de archivos ni colapsar la memoria, se implementan tres optimizaciones críticas:

### 3.1. Índices Estratégicos y Parciales en PostgreSQL

```sql
-- 1. Índice único estricto: Una caja NAP jamás puede duplicar números de puerto
CREATE UNIQUE INDEX IF NOT EXISTS "idx_nap_ports_unique" 
ON "nap_ports" ("id_nap", "indice_puerto");

-- 2. Índice Parcial Ultra-Rápido: Solo indexa puertos LIBRES para asignaciones concurrentes
-- Reduce el tamaño del índice en un 80% y acelera las consultas bajo ráfagas de estrés
CREATE INDEX IF NOT EXISTS "idx_nap_ports_libres" 
ON "nap_ports" ("id_nap", "indice_puerto") 
WHERE "estado" = 'Libre';

-- 3. Índice Único en Clientes: Previene colisiones de MAC de ONT en altas simultáneas
CREATE UNIQUE INDEX IF NOT EXISTS "idx_clients_ont_mac" 
ON "clients" ("ont_mac");

-- 4. Índice para Vinculación 1:1 estricta puerto-cliente
CREATE UNIQUE INDEX IF NOT EXISTS "idx_clients_puerto_nap" 
ON "clients" ("id_puerto_nap");

-- 5. Índice JSONB GIN para consultas geoespaciales por coordenadas GPS en Leaflet
CREATE INDEX IF NOT EXISTS "idx_nap_coordenadas_gin" 
ON "nap_boxes" USING GIN ("coordenadas_gps");
```

---

### 3.2. Configuración del Pool de Conexiones (*Connection Pooling*)

En pruebas de carga o entornos de producción, abrir y cerrar conexiones TCP a la base de datos por cada petición agota la memoria del servidor. La configuración del *pool* en `backend/src/config/database.ts` optimiza la reutilización de conexiones:

```typescript
export const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
  host: dbHost,
  port: dbPort,
  dialect: 'postgres',
  pool: {
    max: 30,          // Máximo de conexiones abiertas simultáneas
    min: 5,           // Conexiones mínimas siempre activas listas para responder
    acquire: 60000,   // Tiempo máximo (ms) para adquirir conexión antes de generar timeout
    idle: 10000,      // Tiempo (ms) para liberar una conexión inactiva
    evict: 1000       // Chequeo de salud del pool cada 1 segundo
  },
  dialectOptions: {
    ssl: process.env.DB_SSL === 'true' ? {
      require: true,
      rejectUnauthorized: false
    } : false
  },
  logging: false // Deshabilitar logs en consola durante pruebas de estrés para no degradar I/O
});
```

---

## 4. Script Automatizado de Prueba de Estrés y Concurrencia

Este script simula **20 peticiones HTTP exactamente concurrentes** dirigidas al mismo puerto físico libre. 

El resultado esperado es:
- **Exactamente 1 petición exitosa (HTTP 201 Created)**.
- **Exactamente 19 peticiones rechazadas limpiamente por bloqueo ACID (HTTP 409 Conflict)**.
- **Cero bloqueos mutuos (*deadlocks*) y cero corrupciones en la base de datos**.

```typescript
/**
 * test-concurrency.ts
 * Script para verificar la integridad ACID y el bloqueo pesimista a nivel de fila.
 * Ejecución: pnpm tsx test-concurrency.ts
 */
import axios from 'axios';

const API_URL = 'http://localhost:4000/api/v1';

async function testSimultaneousPortAssignment() {
  console.log('🚀 ========================================================');
  console.log('🚀 INICIANDO PRUEBA DE ESTRÉS: 20 PETICIONES SIMULTÁNEAS');
  console.log('🚀 ========================================================');

  try {
    // 1. Obtener Token JWT de autenticación
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      credencial_acceso: 'admin@gpon.com',
      password: 'admin123'
    });
    const token = loginRes.data.data.token;

    // 2. Buscar una NAP con puertos libres
    const napsRes = await axios.get(`${API_URL}/naps`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    // Tomar NAP-SJR-03 (Colonia Guadalupe)
    const nap = napsRes.data.data.find((n: any) => n.metricas.libres > 0) || napsRes.data.data[0];
    const napDetail = await axios.get(`${API_URL}/naps/${nap.id_nap}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const freePort = napDetail.data.data.puertos.find((p: any) => p.estado === 'Libre');
    if (!freePort) {
      console.error('❌ No se encontró ningún puerto en estado Libre para la prueba.');
      return;
    }

    console.log(`🎯 Caja Objetivo: ${nap.identificador}`);
    console.log(`🎯 Puerto Objetivo: #${freePort.indice_puerto} (UUID: ${freePort.id_puerto})`);
    console.log('⚡ Disparando 20 peticiones concurrentes mediante Promise.all()...\n');

    const startTime = Date.now();

    // 3. Crear 20 peticiones con datos de clientes distintos dirigidos al MISMO puerto
    const requests = Array.from({ length: 20 }).map((_, index) => {
      const hex = Math.floor(Math.random() * 89 + 10).toString(16);
      return axios.post(
        `${API_URL}/puertos/asignar`,
        {
          id_puerto: freePort.id_puerto,
          numero_cliente: `STRESS-${Date.now()}-${index + 1}`,
          nombre_completo: `Abonado Concurrente #${index + 1}`,
          marca_ont: 'Huawei',
          direccion: `Av. Concurrencia #${index + 1}`,
          ont_mac: `50:04:B4:99:${index.toString(16).padStart(2, '0')}:${hex}`,
          potencia_rx_estimada: -19.4
        },
        {
          headers: { Authorization: `Bearer ${token}` },
          validateStatus: () => true // Capturar códigos 201 y 409 sin disparar excepción
        }
      );
    });

    const responses = await Promise.all(requests);
    const duration = Date.now() - startTime;

    // 4. Analizar los resultados
    const exitosos = responses.filter((r) => r.status === 201).length;
    const rechazadosConflicto = responses.filter((r) => r.status === 409).length;
    const otrosErrores = responses.filter((r) => r.status !== 201 && r.status !== 409).length;

    console.log('📊 RESULTADOS DE LA PRUEBA DE ESTRÉS:');
    console.log('--------------------------------------------------');
    console.log(`⏱ Tiempo total de resolución: ${duration} ms`);
    console.log(`✅ Asignaciones Exitosas (Esperado: 1): ${exitosos}`);
    console.log(`🛑 Rechazos por Bloqueo ACID 409 Conflict (Esperado: 19): ${rechazadosConflicto}`);
    console.log(`⚠️ Errores inesperados: ${otrosErrores}`);
    console.log('--------------------------------------------------');

    if (exitosos === 1 && rechazadosConflicto === 19) {
      console.log('🏆 DICTAMEN: PRUEBA SUPERADA EXITOSAMENTE.');
      console.log('✔ La base de datos tiene integridad ACID absoluta y aislamiento de concurrencia.');
    } else {
      console.error('❌ DICTAMEN: FALLA EN PRUEBA DE CONCURRENCIA.');
    }
  } catch (error: any) {
    console.error('Error durante la prueba de estrés:', error.message);
  }
}

testSimultaneousPortAssignment();
```

---

## 5. Conexión de la Base de Datos en la Nube (Neon / Supabase / Render)

Para operar el sistema en producción con el frontend desplegado en **Vercel**, la base de datos debe residir en un servicio cloud accesible con SSL.

### 5.1. Comparativa de Plataformas Cloud Compatibles

| Servicio | Nivel Gratuito | Connection Pooling Nativo | Ideal para |
| :--- | :---: | :---: | :--- |
| **Neon** *(neon.tech)* | 0.5 GB de almacenamiento, escalado a cero | **Sí (Puerto 6543)** | Despliegues con Vercel por su bajísima latencia. |
| **Supabase** *(supabase.com)* | 500 MB de almacenamiento, 2 proyectos | **Sí (Supavisor)** | Visualización amigable de datos en tabla tipo Excel. |
| **Railway** *(railway.app)* | \$5 USD de crédito mensual | **Sí** | Desplegar Backend Node.js y Postgres en el mismo servidor. |
| **Render** *(render.com)* | PostgreSQL gratis por 90 días | **No directo** | Despliegue de API Express mediante Docker. |

---

### 5.2. Paso a Paso: Configurar Neon PostgreSQL

1. **Creación del Proyecto:**
   - Ingresa a [neon.tech](https://neon.tech) e inicia sesión con tu cuenta de GitHub.
   - Pulsa en **"New Project"**.
   - Nombre: `gpon-telecom-db`.
   - Región: `US East (Ohio)` o `US East (N. Virginia)` (la misma región que utiliza Vercel para minimizar latencia).
   - Versión de PostgreSQL: **16**.

2. **Obtención de la Cadena de Conexión:**
   - En el Dashboard de Neon, selecciona la pestaña **Connection Details**.
   - Marca la casilla **"Pooled connection"** (utiliza el puerto `6543` optimizado para ráfagas concurrentes).
   - Copia la cadena generada con el formato:
     ```
     postgres://neondb_owner:TU_PASSWORD@ep-cool-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require
     ```

3. **Configuración en el Backend (`backend/.env`):**
   ```env
   PORT=4000
   NODE_ENV=production

   # Conexión a Neon PostgreSQL
   DB_HOST=ep-cool-pooler.us-east-2.aws.neon.tech
   DB_PORT=5432
   DB_USER=neondb_owner
   DB_PASSWORD=tu_password_de_neon
   DB_NAME=neondb
   DB_SSL=true

   JWT_SECRET=clave_maestra_de_seguridad_jwt_gpon_2026
   FRONTEND_URL=https://tu-proyecto.vercel.app
   ```

4. **Poblado Automático del Esquema y Topología en la Nube:**
   Desde la raíz de tu proyecto local, ejecuta:
   ```powershell
   pnpm --filter backend run seed
   ```
   Sequelize se conectará a Neon a través de TLS, creará automáticamente las 7 tablas del diccionario, los índices y cargará los usuarios de prueba, la central ODF de San José del Rincón y las 4 cajas NAP con sus 64 puertos.

---

### 5.3. Conexión del Frontend en Vercel

1. Ingresa a tu panel en [Vercel](https://vercel.com).
2. Selecciona tu proyecto del frontend.
3. Dirígete a **Settings** -> **Environment Variables**.
4. Agrega la variable:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://tu-backend.onrender.com/api/v1` (la URL pública de tu API desplegada).
5. Pulsa **Save** y realiza un **Redeploy** para que la aplicación en producción consuma la base de datos en la nube.

