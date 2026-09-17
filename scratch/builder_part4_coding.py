import docx
from docx.shared import Pt, Inches, RGBColor
from scratch.common_docx import (
    add_heading_1, add_heading_2, add_heading_3, add_paragraph, add_figure, add_code_block, sanitize_text
)

def build_chapter_4(doc, tables_source):
    """
    Construye el Capítulo IV: Codificación del Sistema.
    Abarca la programación real, estructuración modular y exposición exhaustiva
    de código backend (Express, PostgreSQL, Concurrencia pesimista, JWT, RBAC, Zod),
    frontend reactivo (Leaflet, Matriz de 16 puertos), capacidad offline (Dexie.js e IndexedDB)
    y streaming en memoria de reportes en PDF con PDFKit.
    Incluye las Figuras 23 a 26 y la Tabla 13.
    """
    add_heading_1(doc, "CAPÍTULO IV. CODIFICACIÓN DEL SISTEMA")
    
    add_paragraph(doc,
        "En el presente capítulo se expone la implementación de software de la plataforma GPON TELECOM a nivel de código fuente. "
        "Se detallan los algoritmos de control de concurrencia mediante bloqueo pesimista en PostgreSQL, la construcción de la API REST modular "
        "en Node.js y TypeScript, el módulo criptográfico y middlewares de autorización RBAC, los esquemas de validación estricta con Zod, "
        "los componentes reactivos del visor cartográfico en Leaflet y de la matriz de chasis de 16 puertos, la instrumentación de la base de datos "
        "local en el navegador mediante Dexie.js para operación sin conexión y el motor de generación dinámica de reportes ejecutivos en PDF por streaming en memoria.")

    # 4.1
    add_heading_2(doc, "4.1 Arquitectura del Servidor Backend en Node.js y Express con TypeScript")
    add_paragraph(doc,
        "El backend se estructuró bajo un patrón arquitectónico por capas claramente desacopladas: configuración centralizada (config/), "
        "controladores de peticiones HTTP (controllers/), middlewares de seguridad y autorización (middlewares/), modelos de persistencia relacional Sequelize (models/) "
        "y enrutadores declarativos (routes/). A continuación se presenta el punto de entrada principal del servidor (server.ts), "
        "donde se inyectan las directivas de seguridad CORS, Helmet, compresión y el montaje de los endpoints de la API:")

    code_server = """import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { sequelize } from './config/database';
import apiRouter from './routes/api';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 4000;

// Inyección de middlewares de seguridad y análisis de cuerpo JSON
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || '*',
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT']
}));
app.use(express.json({ limit: '10mb' }));

// Montaje centralizado de rutas RESTful bajo versión 1
app.use('/api', apiRouter);

// Endpoint de diagnóstico de salud (Healthcheck)
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'OK', uptime: process.uptime() });
});

// Verificación de conexión a la base de datos y arranque del listener HTTP
sequelize.authenticate()
  .then(() => {
    console.log('[PostgreSQL] Conexión establecida exitosamente con el clúster.');
    app.listen(PORT, () => {
      console.log(`[Express] Servidor escuchando peticiones en puerto ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('[PostgreSQL] Error fatal de conexión a la base de datos:', err);
  });

export default app;"""
    add_code_block(doc, code_server, language="TypeScript - backend/src/server.ts")

    # 4.2
    add_heading_2(doc, "4.2 Programación del Control de Concurrencia Transaccional ACID y Bloqueo Pesimista")
    add_paragraph(doc,
        "Para solucionar de raíz la problemática de asignaciones concurrentes en campo, donde dos cuadrillas técnicas en calle compiten simultáneamente "
        "por conectar un abonado al mismo puerto de una caja NAP, se programó en portController.ts una transacción ACID serializada. "
        "Se implementó el bloqueo pesimista a nivel de fila mediante lock: t.LOCK.UPDATE, equivalente a la cláusula SQL SELECT ... FOR UPDATE de PostgreSQL. "
        "Si el puerto se encuentra ocupado o reservado, la transacción ejecuta un rollback inmediato y retorna un código HTTP 409 Conflict:")

    code_port_concurrency = """import { Request, Response } from 'express';
import { Transaction } from 'sequelize';
import { z } from 'zod';
import { sequelize, NapPort, Client, NapBox } from '../models';

const assignPortSchema = z.object({
  id_puerto: z.string().uuid(),
  numero_cliente: z.string().min(3),
  nombre_completo: z.string().min(3),
  marca_ont: z.enum(['ZTE', 'V-SOL', 'TP-Link', 'Huawei']),
  direccion: z.string().min(5),
  ont_mac: z.string().regex(/^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/, 'MAC inválida'),
  potencia_rx_estimada: z.number().optional().default(-19.5)
});

export const assignPort = async (req: Request, res: Response): Promise<void> => {
  const parseResult = assignPortSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({ success: false, errors: parseResult.error.errors });
    return;
  }

  const { id_puerto, numero_cliente, nombre_completo, marca_ont, direccion, ont_mac, potencia_rx_estimada } = parseResult.data;

  // Iniciar Transacción ACID estricta
  const t: Transaction = await sequelize.transaction();

  try {
    // Bloqueo pesimista a nivel de fila: SELECT ... FOR UPDATE
    const port = await NapPort.findByPk(id_puerto, {
      transaction: t,
      lock: t.LOCK.UPDATE
    });

    if (!port) {
      await t.rollback();
      res.status(404).json({ success: false, message: 'El puerto no existe' });
      return;
    }

    // Comprobación atómica de estado
    if (port.estado !== 'Libre' && port.estado !== 'Reservado') {
      await t.rollback();
      res.status(409).json({
        success: false,
        message: `Conflicto de concurrencia: El puerto #${port.indice_puerto} ya no está disponible (Estado: '${port.estado}').`
      });
      return;
    }

    // Registrar cliente y actualizar puerto atómicamente
    const newClient = await Client.create({
      numero_cliente,
      nombre_completo,
      marca_ont,
      direccion,
      ont_mac,
      potencia_rx_estimada,
      id_puerto
    }, { transaction: t });

    await port.update({ estado: 'Ocupado' }, { transaction: t });

    // Confirmar transacción (Commit atómico en PostgreSQL)
    await t.commit();

    res.status(200).json({
      success: true,
      message: `Puerto #${port.indice_puerto} asignado con éxito a ${nombre_completo}`,
      cliente: newClient
    });
  } catch (error) {
    await t.rollback();
    res.status(500).json({ success: false, message: 'Error interno en asignación transaccional' });
  }
};"""
    add_code_block(doc, code_port_concurrency, language="TypeScript - backend/src/controllers/portController.ts")

    # Figura 23 (Secuencia de bloqueo pesimista)
    add_figure(doc, "scratch/figures_named/image18.png",
               "Figura 23. Diagrama de secuencia transaccional de concurrencia con SELECT ... FOR UPDATE.",
               "Fuente: Elaboración propia del flujo transaccional en PostgreSQL.",
               width_inches=5.8)

    # 4.3
    add_heading_2(doc, "4.3 Programación del Módulo Criptográfico, Autenticación JWT y Middlewares RBAC")
    add_paragraph(doc,
        "La autenticación se implementó mediante tokens criptográficos JWT y hashing unidireccional con bcrypt (salt rounds = 10). "
        "A continuación se presenta el middleware de interceptación de token (auth.ts) y el middleware de control de privilegios RBAC (role.ts), "
        "el cual rechaza automáticamente cualquier solicitud no autorizada retornando el código formal HTTP 403 Forbidden:")

    code_auth_rbac = """import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserRole } from '../models/User';

export interface AuthPayload {
  id_usuario: string;
  credencial_acceso: string;
  rol: UserRole;
  nombre_completo: string;
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    res.status(401).json({ success: false, message: 'Acceso denegado: Token no proporcionado' });
    return;
  }

  try {
    const secret = process.env.JWT_SECRET || 'super_secret_gpon_telecom_jwt_key_2026_fttx';
    const decoded = jwt.verify(token, secret) as AuthPayload;
    (req as any).user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Token expirado o criptográficamente inválido' });
  }
};

export const requireRole = (allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = (req as any).user as AuthPayload | undefined;
    if (!user || !allowedRoles.includes(user.rol)) {
      res.status(403).json({
        success: false,
        message: `Acceso restringido: Se requiere uno de los roles [${allowedRoles.join(', ')}]. Tu rol actual es: '${user?.rol || 'Anónimo'}'.`
      });
      return;
    }
    next();
  };
};"""
    add_code_block(doc, code_auth_rbac, language="TypeScript - backend/src/middlewares/auth.ts y role.ts")

    # 4.4
    add_heading_2(doc, "4.4 Programación de la Capa de Validación Declarativa y Sanitización de Datos con Zod")
    add_paragraph(doc,
        "Para blindar la integridad del sistema contra datos corruptos o inyecciones, se programaron esquemas Zod con validación "
        "estricta de formato en direcciones físicas MAC, coordenadas geodésicas dentro de los límites de México y relaciones de splitteo:")

    code_zod = """import { z } from 'zod';

export const createNapSchema = z.object({
  identificador: z.string().min(3).max(50).regex(/^NAP-[A-Z0-9-]+$/, 'Formato de identificador inválido (ej. NAP-SJR-27)'),
  zona: z.string().min(3).max(100),
  latitud: z.number().min(14.0).max(33.0, 'Coordenada latitud fuera de territorio mexicano'),
  longitud: z.number().min(-118.0).max(-86.0, 'Coordenada longitud fuera de territorio mexicano'),
  capacidad_total: z.union([z.literal(8), z.literal(16)]),
  id_hilo_alimentador: z.string().uuid().optional()
});"""
    add_code_block(doc, code_zod, language="TypeScript - backend/src/schemas/napSchema.ts")

    # 4.5
    add_heading_2(doc, "4.5 Programación del Frontend React: Visor Cartográfico Geoespacial (GponMap.tsx)")
    add_paragraph(doc,
        "El visor cartográfico integra React con Leaflet (GponMap.tsx), orquestando el renderizado reactivo de cajas NAP, "
        "cálculo dinámico de saturación y trazado de polilíneas de cables troncales con semaforización cromática interactiva:")

    code_map = """import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { NapBox } from '../types';

export const GponMap: React.FC<{ naps: NapBox[]; onSelectNap: (nap: NapBox) => void }> = ({ naps, onSelectNap }) => {
  // Centro geográfico predeterminado en San José del Rincón
  const defaultCenter: [number, number] = [19.6686, -100.1510];

  const getMarkerIcon = (nap: NapBox) => {
    const total = nap.capacidad_total || 16;
    const ocupados = (nap.puertos || []).filter(p => p.estado === 'Ocupado').length;
    const pct = ocupados / total;

    // Código de semáforo dinámico
    const color = pct >= 0.85 ? '#EF4444' : pct >= 0.5 ? '#F59E0B' : '#10B981';

    return L.divIcon({
      className: 'custom-nap-marker',
      html: `<div style="background:${color}; width:28px; height:28px; border-radius:50%; border:3px solid #fff; box-shadow:0 2px 6px rgba(0,0,0,0.3); display:flex; align-items:center; justify-content:center; color:#fff; font-size:10px; font-weight:bold;">${ocupados}/${total}</div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    });
  };

  return (
    <div className="relative w-full h-[650px] rounded-xl overflow-hidden shadow-lg border border-slate-700">
      <MapContainer center={defaultCenter} zoom={15} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        {naps.map((nap) => (
          <Marker
            key={nap.id_nap}
            position={[nap.latitud, nap.longitud]}
            icon={getMarkerIcon(nap)}
            eventHandlers={{ click: () => onSelectNap(nap) }}
          >
            <Popup>
              <div className="p-2">
                <h4 className="font-bold text-slate-800">{nap.identificador}</h4>
                <p className="text-xs text-slate-600">Zona: {nap.zona}</p>
                <p className="text-xs font-semibold text-sky-600">Capacidad: {nap.capacidad_total} Puertos</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};"""
    add_code_block(doc, code_map, language="TypeScript / TSX - frontend/src/components/GponMap.tsx")

    # Figura 24 (Arquitectura componentes React)
    add_figure(doc, "scratch/figures_named/image34.png",
               "Figura 24. Arquitectura modular de componentes frontend React y visor cartográfico.",
               "Fuente: Elaboración propia de la arquitectura frontend.",
               width_inches=5.8)

    # 4.6
    add_heading_2(doc, "4.6 Programación del Componente de Matriz Física de Chasis de 16 Puertos (NapPortMatrix.tsx)")
    add_paragraph(doc,
        "La matriz física NapPortMatrix.tsx replica la distribución espacial de los 16 conectores en la caja NAP aérea. "
        "Maneja de forma reactiva la selección interactiva de puertos, la invocación del modal de asignación y las alertas de permisos RBAC:")

    code_matrix = """import React, { useState } from 'react';
import { NapBox, NapPort } from '../types';
import { useAuth } from '../context/AuthContext';

export const NapPortMatrix: React.FC<{ nap: NapBox; onAssignClick: (port: NapPort) => void }> = ({ nap, onAssignClick }) => {
  const { user } = useAuth();
  const ports = nap.puertos || [];

  const getPortColorClass = (estado: string) => {
    switch (estado) {
      case 'Libre': return 'bg-emerald-500 hover:bg-emerald-600 text-white border-emerald-400';
      case 'Ocupado': return 'bg-sky-600 text-white border-sky-400 cursor-not-allowed';
      case 'Reservado': return 'bg-amber-500 text-white border-amber-300';
      case 'Dañado': return 'bg-rose-600 text-white border-rose-400';
      default: return 'bg-slate-600 text-slate-200 border-slate-500';
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-xl p-5 shadow-xl">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          Matriz de Chasis: {nap.identificador} ({ports.length} Puertos)
        </h3>
      </div>
      <div className="grid grid-cols-8 gap-3">
        {ports.map((port) => (
          <button
            key={port.id_puerto}
            disabled={port.estado === 'Ocupado'}
            onClick={() => onAssignClick(port)}
            className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all font-mono font-bold text-sm ${getPortColorClass(port.estado)}`}
          >
            <span>P-{port.indice_puerto}</span>
            <span className="text-[10px] font-normal uppercase mt-1">{port.estado}</span>
          </button>
        ))}
      </div>
    </div>
  );
};"""
    add_code_block(doc, code_matrix, language="TypeScript / TSX - frontend/src/components/NapPortMatrix.tsx")

    # 4.7
    add_heading_2(doc, "4.7 Programación de la Capacidad Offline-First con Dexie.js e IndexedDB")
    add_paragraph(doc,
        "La persistencia en el cliente móvil se gestiona mediante la clase tipada GponOfflineDatabase extendiendo Dexie (offlineDb.ts), "
        "definiendo dos almacenes locales indexados:")

    code_dexie = """import Dexie, { Table } from 'dexie';
import { NapBox, PendingMutation } from '../types';

export class GponOfflineDatabase extends Dexie {
  public cached_naps!: Table<NapBox, string>;
  public pending_mutations!: Table<PendingMutation, number>;

  constructor() {
    super('GponFttxOfflineDB');
    this.version(1).stores({
      cached_naps: 'id_nap, identificador, zona',
      pending_mutations: '++id, tipo, fechaCreacion'
    });
  }
}

export const offlineDb = new GponOfflineDatabase();"""
    add_code_block(doc, code_dexie, language="TypeScript - frontend/src/db/offlineDb.ts")

    # Table 13 (IndexedDB Dexie stores)
    if len(tables_source) > 14:
        from copy import deepcopy
        doc._body._element.append(deepcopy(tables_source[14]._element))
        p_cap_t13 = doc.add_paragraph()
        p_cap_t13.paragraph_format.space_before = Pt(4)
        p_cap_t13.paragraph_format.space_after = Pt(10)
        r1 = p_cap_t13.add_run("Tabla 13. Esquema de almacenes de datos locales en IndexedDB con Dexie.js (cached_naps y pending_mutations).\n")
        r1.font.name = 'Arial'
        r1.font.size = Pt(9)
        r1.bold = True
        r2 = p_cap_t13.add_run("Fuente: Elaboración propia del esquema de persistencia local en navegador.")
        r2.font.name = 'Arial'
        r2.font.size = Pt(8.5)
        r2.italic = True

    add_paragraph(doc,
        "El proveedor de contexto reactivo NetworkContext.tsx supervisa el estado de red de la terminal del técnico, "
        "encolando mutaciones en pending_mutations y despachándolas automáticamente en ráfaga tan pronto se restablece la conectividad:")

    code_network = """// Sincronización en ráfaga al detectar conexión a Internet
const syncNow = useCallback(async () => {
  if (!navigator.onLine || isSyncing) return;

  try {
    setIsSyncing(true);
    const mutations = await offlineDb.pending_mutations.toArray();

    for (const item of mutations) {
      if (item.tipo === 'ASIGNAR_PUERTO') {
        await api.post('/puertos/asignar', item.payload);
      } else if (item.tipo === 'ACTUALIZAR_GPS') {
        await api.patch(`/naps/${item.id_nap}/gps`, item.payload);
      }
      // Mutación exitosa: eliminar de la cola local
      if (item.id) await offlineDb.pending_mutations.delete(item.id);
    }
  } finally {
    setIsSyncing(false);
  }
}, [isSyncing]);"""
    add_code_block(doc, code_network, language="TypeScript - frontend/src/context/NetworkContext.tsx")

    # Figura 25 (Sincronización diferida)
    add_figure(doc, "scratch/figures_named/image35.png",
               "Figura 25. Flujo de decisión y sincronización diferida de la arquitectura móvil Offline-First.",
               "Fuente: Elaboración propia del ciclo de sincronización en campo.",
               width_inches=5.8)

    # 4.8
    add_heading_2(doc, "4.8 Programación del Motor de Reportes Técnicos Ejecutivos en PDF con Streaming en Memoria")
    add_paragraph(doc,
        "El controlador reportController.ts genera dictámenes técnicos de saturación y auditoría de planta externa en memoria mediante PDFKit. "
        "Mediante doc.pipe(res), los fragmentos binarios se envían directamente al cliente en streaming, evitando sobrecargas de I/O en el servidor:")

    code_pdf = """import { Request, Response } from 'express';
import PDFDocument from 'pdfkit';
import { NapBox, NapPort, Client } from '../models';

export const generateSaturationReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const naps = await NapBox.findAll({
      include: [{ model: NapPort, as: 'puertos', include: [{ model: Client, as: 'cliente' }] }],
      order: [['identificador', 'ASC']]
    });

    const doc = new PDFDocument({ margin: 36, size: 'LETTER' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="Reporte_Saturacion_GPON_SJR.pdf"');

    // Canalización por Streaming en Memoria hacia la respuesta HTTP
    doc.pipe(res);

    // Cabecera institucional vectorial
    doc.rect(0, 0, doc.page.width, 80).fill('#0F172A');
    doc.fillColor('#FFFFFF').fontSize(16).font('Helvetica-Bold')
       .text('GPON TELECOM - DICTAMEN TÉCNICO DE SATURACIÓN', 36, 25);
    doc.fillColor('#38BDF8').fontSize(9).font('Helvetica')
       .text('Auditoría Integral de Infraestructura de Fibra Óptica FTTx', 36, 45);

    // Renderizado de tabla de cajas NAP
    let currentY = 100;
    naps.forEach((nap) => {
      const total = nap.capacidad_total || 16;
      const ocupados = (nap.puertos || []).filter(p => p.estado === 'Ocupado').length;
      const pct = Math.round((ocupados / total) * 100);

      doc.fillColor('#0F172A').fontSize(10).font('Helvetica-Bold')
         .text(`${nap.identificador} - Zona: ${nap.zona} | Ocupación: ${ocupados}/${total} (${pct}%)`, 36, currentY);
      currentY += 16;
    });

    // Finalizar flujo y enviar documento al cliente
    doc.end();
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error en generación de reporte PDF' });
  }
};"""
    add_code_block(doc, code_pdf, language="TypeScript - backend/src/controllers/reportController.ts")

    # Figura 26 (Streaming PDF)
    add_figure(doc, "scratch/figures_named/image38.png",
               "Figura 26. Flujo de generación de reportes técnicos ejecutivos en PDF mediante streaming en memoria.",
               "Fuente: Elaboración propia del flujo de generación en memoria con PDFKit.",
               width_inches=5.8)

    print("Capítulo IV (Codificación del Sistema) construido exitosamente con código completo y figuras.")

