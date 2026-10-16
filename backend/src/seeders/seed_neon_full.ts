import bcrypt from 'bcryptjs';
import { sequelize } from '../config/database';
import {
  User,
  OdfPanel,
  NapBox,
  InfrastructurePoste,
  InfrastructureMufa,
  InfrastructureRoute,
  MileageLog
} from '../models';

import {
  troncalIxtJocRoutes,
  troncalMufas,
  troncalPostesPropuestos,
  troncalPostesCfe
} from '../../../frontend/src/data/troncalIxtJocData';

import {
  realFiberRoutes,
  realEmpalmes,
  realOdf
} from '../../../frontend/src/data/realGponKmzData';

export async function populateNeonDatabase() {
  console.log('🚀 Iniciando población completa de base de datos Neon PostgreSQL...');

  // Asegurar que las tablas existan
  await sequelize.sync({ alter: true });
  console.log('✔ Esquemas y tablas sincronizados en Neon DB.');

  // 1. POBLAR USUARIOS (5 usuarios para cubrir Admin, Soporte y Técnicos)
  console.log('\n--- 1. Sincronizando Usuarios en Neon DB ---');
  const passwordHash = await bcrypt.hash('admin123', 10);

  const targetUsers = [
    {
      nombre_completo: 'Ing. Carlos Mendoza (Admin NOC)',
      credencial_acceso: 'admin@gpon.com',
      password_hash: passwordHash,
      rol: 'Admin' as const
    },
    {
      nombre_completo: 'Ing. Sofía Ramírez (Soporte Técnico)',
      credencial_acceso: 'soporte@gpon.com',
      password_hash: passwordHash,
      rol: 'Soporte' as const
    },
    {
      nombre_completo: 'Juan Pérez (Técnico Cuadrilla 1)',
      credencial_acceso: 'tecnico@gpon.com',
      password_hash: passwordHash,
      rol: 'Tecnico' as const
    },
    {
      nombre_completo: 'Mauricio Nolazco (Técnico Cuadrilla 2)',
      credencial_acceso: 'mauricio.tecnico@gpon.com',
      password_hash: passwordHash,
      rol: 'Tecnico' as const
    },
    {
      nombre_completo: 'Ing. Daniel Benítez (Monitoreo NOC)',
      credencial_acceso: 'daniel.soporte@gpon.com',
      password_hash: passwordHash,
      rol: 'Soporte' as const
    }
  ];

  for (const u of targetUsers) {
    const existing = await User.findOne({ where: { credencial_acceso: u.credencial_acceso } });
    if (!existing) {
      await User.create(u);
    } else {
      await existing.update({
        nombre_completo: u.nombre_completo,
        rol: u.rol,
        password_hash: passwordHash
      });
    }
  }
  const userCount = await User.count();
  console.log(`✔ Usuarios en Neon DB: ${userCount} usuarios activos.`);

  // 2. POBLAR RUTAS TRONCALES Y RAMALES (KMZ)
  console.log('\n--- 2. Sincronizando Líneas Troncales y Ramales ---');
  const allRoutes = [
    ...troncalIxtJocRoutes.map((r) => ({
      id_ruta: r.id_ruta,
      nombre: r.nombre,
      tipo: r.tipo || 'troncal',
      hilos: r.hilos || 48,
      subtipo: r.subtipo || '48_troncal',
      color: r.color || '#8d5b4c',
      grosor: r.grosor || 3.5,
      distancia_metros: r.distancia_metros || 0,
      distancia_km: r.distancia_km || 0,
      vertices: r.vertices || (r.coordenadas ? r.coordenadas.length : 0),
      coordenadas: r.coordenadas || [],
      estado: 'activa'
    })),
    ...realFiberRoutes.map((r) => ({
      id_ruta: r.id_ruta,
      nombre: r.nombre,
      tipo: r.tipo || 'ramal',
      hilos: r.hilos || 24,
      subtipo: r.subtipo || 'distribucion',
      color: r.color || '#0284c7',
      grosor: r.grosor || 3,
      distancia_metros: r.distancia_metros || 0,
      distancia_km: r.distancia_km || 0,
      vertices: r.vertices || (r.coordenadas ? r.coordenadas.length : 0),
      coordenadas: r.coordenadas || [],
      estado: 'activa'
    }))
  ];

  for (const routeData of allRoutes) {
    await InfrastructureRoute.upsert(routeData);
  }
  const routeCount = await InfrastructureRoute.count();
  console.log(`✔ Líneas Troncales / Ramales en Neon DB: ${routeCount} registradas.`);

  // 3. POBLAR MUFAS TORPEDO (KMZ)
  console.log('\n--- 3. Sincronizando Mufas / Cierres de Empalme ---');
  const allMufas = [
    ...troncalMufas.map((m) => ({
      id_empalme: m.id_empalme,
      nombre: m.nombre,
      tipo_cierre: m.tipo_cierre || 'Cierre de Empalme Torpedo Domo (IP68)',
      capacidad_hilos: m.capacidad_hilos || 48,
      estado: 'operativa',
      coordenadas_gps: m.coordenadas_gps
    })),
    ...realEmpalmes.map((m) => ({
      id_empalme: m.id_empalme,
      nombre: m.nombre,
      tipo_cierre: m.tipo_cierre || 'Cierre de Empalme Horizontal Hermético (Muffa)',
      capacidad_hilos: 48,
      estado: 'operativa',
      coordenadas_gps: m.coordenadas_gps
    }))
  ];

  for (const mufaData of allMufas) {
    await InfrastructureMufa.upsert(mufaData);
  }
  const mufaCount = await InfrastructureMufa.count();
  console.log(`✔ Mufas Torpedo en Neon DB: ${mufaCount} registradas.`);

  // 4. POBLAR POSTES (Postes CFE + Postes Propuestos)
  console.log('\n--- 4. Sincronizando Postes de Infraestructura (CFE + Propuestos) ---');
  const allPostes = [
    ...troncalPostesPropuestos.map((p) => ({
      id_poste: p.id_poste,
      nombre: p.nombre || `Poste ${p.id_poste}`,
      codigo: p.codigo || p.id_poste || 'POSTE-PROP',
      tipo: 'poste_propuesto',
      material: p.material || 'Concreto 9m',
      coordenadas_gps: p.coordenadas_gps
    })),
    ...troncalPostesCfe.map((p) => ({
      id_poste: p.id_poste,
      nombre: p.nombre || `Poste CFE ${p.id_poste}`,
      codigo: p.codigo || p.id_poste || 'POSTE-CFE',
      tipo: 'poste_cfe',
      material: p.material || 'Concreto CFE',
      coordenadas_gps: p.coordenadas_gps
    }))
  ];

  console.log(`Subiendo ${allPostes.length} postes en lotes de 150 a Neon DB...`);
  const chunkSize = 150;
  for (let i = 0; i < allPostes.length; i += chunkSize) {
    const chunk = allPostes.slice(i, i + chunkSize);
    await InfrastructurePoste.bulkCreate(chunk, {
      updateOnDuplicate: ['nombre', 'codigo', 'tipo', 'material', 'coordenadas_gps']
    });
    process.stdout.write(`\r✔ Postes procesados: ${Math.min(i + chunkSize, allPostes.length)} / ${allPostes.length}`);
  }
  const posteCount = await InfrastructurePoste.count();
  console.log(`\n✔ Postes totales en Neon DB: ${posteCount} postes registrados.`);

  // 5. POBLAR BITÁCORAS DE KILOMETRAJE (mileage_logs)
  console.log('\n--- 5. Sincronizando Bitácora de Desplazamientos y Kilometraje ---');
  const sampleMileage = [
    {
      tecnico_nombre: 'Juan Pérez (Técnico Cuadrilla 1)',
      vehiculo_unidad: 'Hilux Cuadrilla 01 (Edomex JJ-45-890)',
      motivo_traslado: 'Mantenimiento Preventivo y Limpieza de Cajas NAP',
      tipo_calculo: 'odometro' as const,
      km_inicial: 45210,
      km_final: 45238,
      km_recorridos: 28,
      distancia_estimada_ruta_km: 26.5,
      origen_nombre: 'ODF Central San José del Rincón',
      destino_nombre: 'Sector La Presa - Manzana (NAP-SJR-03)',
      nap_identificador: 'NAP-SJR-03',
      nap_zona: 'La Presa - Manzana',
      notas: 'Inspección de potencias ópticas y calibración de latiguillos SC/APC.',
      fecha_hora: new Date('2026-10-14T09:30:00.000Z')
    },
    {
      tecnico_nombre: 'Mauricio Nolazco (Técnico Cuadrilla 2)',
      vehiculo_unidad: 'NP300 Cuadrilla 02 (Edomex NX-12-340)',
      motivo_traslado: 'Instalación de Drop y Alta de Clientes FTTx',
      tipo_calculo: 'distancia_directa' as const,
      km_inicial: 32100,
      km_final: 32119,
      km_recorridos: 19,
      distancia_estimada_ruta_km: 18.2,
      origen_nombre: 'ODF Central San José del Rincón',
      destino_nombre: 'San José del Rincón - Sur (NAP-SJR-01)',
      nap_identificador: 'NAP-SJR-01',
      nap_zona: 'San José del Rincón - Sur',
      notas: 'Tendido de drop para 2 abonados residenciales, atenuación promedio -19.4 dBm.',
      fecha_hora: new Date('2026-10-15T11:00:00.000Z')
    },
    {
      tecnico_nombre: 'Juan Pérez (Técnico Cuadrilla 1)',
      vehiculo_unidad: 'Hilux Cuadrilla 01 (Edomex JJ-45-890)',
      motivo_traslado: 'Supervisión de Mufas y Tensado de Cable Óptico',
      tipo_calculo: 'odometro' as const,
      km_inicial: 45238,
      km_final: 45272,
      km_recorridos: 34,
      distancia_estimada_ruta_km: 32.8,
      origen_nombre: 'Base de Operaciones SJR',
      destino_nombre: 'Cierre de Empalme NOC Cedro de la Manzana',
      nap_identificador: 'NAP-SJR-02',
      nap_zona: 'San José del Rincón - Sur',
      notas: 'Revisión de herrajes en postes y acomodo de gasa de reserva.',
      fecha_hora: new Date('2026-10-16T08:15:00.000Z')
    }
  ];

  for (const log of sampleMileage) {
    const existing = await MileageLog.findOne({
      where: {
        tecnico_nombre: log.tecnico_nombre,
        destino_nombre: log.destino_nombre,
        km_recorridos: log.km_recorridos
      }
    });
    if (!existing) {
      await MileageLog.create(log);
    }
  }
  const mileageCount = await MileageLog.count();
  console.log(`✔ Bitácoras de Kilometraje en Neon DB: ${mileageCount} registros.`);

  console.log('\n========================================');
  console.log('🎉 ¡POBLACIÓN COMPLETA DE NEON DB FINALIZADA CON ÉXITO!');
  console.log(`- Usuarios: ${userCount}`);
  console.log(`- Líneas Troncales / Ramales: ${routeCount}`);
  console.log(`- Mufas Torpedo: ${mufaCount}`);
  console.log(`- Postes CFE y Propuestos: ${posteCount}`);
  console.log(`- Registros de Kilometraje: ${mileageCount}`);
  console.log('========================================\n');
}

if (require.main === module) {
  populateNeonDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('❌ Error poblando Neon DB:', err);
      process.exit(1);
    });
}
