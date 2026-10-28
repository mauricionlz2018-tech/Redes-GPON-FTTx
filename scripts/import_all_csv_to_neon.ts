import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Cargar variables de entorno del backend
const envPath = path.resolve(__dirname, '../backend/.env');
dotenv.config({ path: envPath });

import {
  sequelize,
  User,
  OdfPanel,
  PonPort,
  FiberThread,
  NapBox,
  NapPort,
  Client,
  InfrastructurePoste,
  InfrastructureMufa,
  InfrastructureGasa,
  InfrastructureRoute,
  MileageLog
} from '../backend/src/models';

/**
 * Parser de CSV compatible con RFC 4180:
 * Soporta saltos de línea dentro de comillas, comillas dobles escapadas (""), etc.
 */
function parseCsv(content: string): Array<Record<string, string>> {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentVal = '';
  let inQuotes = false;

  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    const nextChar = content[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentVal += '"';
        i++; // saltar la comilla escapada
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      currentRow.push(currentVal);
      currentVal = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      currentRow.push(currentVal);
      currentVal = '';
      if (currentRow.length > 0 && currentRow.some(c => c.trim().length > 0)) {
        rows.push(currentRow);
      }
      currentRow = [];
    } else {
      currentVal += char;
    }
  }

  if (currentVal.length > 0 || currentRow.length > 0) {
    currentRow.push(currentVal);
    if (currentRow.some(c => c.trim().length > 0)) {
      rows.push(currentRow);
    }
  }

  if (rows.length < 2) return [];

  const headers = rows[0].map(h => h.trim());
  return rows.slice(1).map(row => {
    const record: Record<string, string> = {};
    headers.forEach((header, index) => {
      record[header] = row[index] !== undefined ? row[index].trim() : '';
    });
    return record;
  });
}

function parseJsonField(val: string): any {
  if (!val || val.trim() === '') return null;
  try {
    return JSON.parse(val);
  } catch (err) {
    return val;
  }
}

async function runMigration() {
  console.log('================================================================');
  console.log('🔄 MIGRACIÓN INTEGRAL A NUEVA BASE DE DATOS NEON GPON_TELECOM');
  console.log('================================================================');
  console.log('Conectando a:', process.env.DATABASE_URL?.split('@')[1] || 'URL configurada');

  try {
    await sequelize.authenticate();
    console.log('✔ Conexión autenticada exitosamente con la nueva base de datos.');

    console.log('\n📐 [1/13] Creando tablas y esquemas en PostgreSQL (force: true)...');
    await sequelize.sync({ force: true });
    console.log('✔ Todas las tablas fueron creadas con sus tipos, llaves y restricciones.');

    const baseDir = path.resolve(__dirname, '../docs/BASEDATOS');

    // 1. Usuarios
    console.log('\n👤 [2/13] Migrando usuarios...');
    const usersCsv = fs.readFileSync(path.join(baseDir, 'usuarios.csv'), 'utf8');
    const usersData = parseCsv(usersCsv).map(r => ({
      id_usuario: r.id_usuario,
      nombre_completo: r.nombre_completo,
      credencial_acceso: r.credencial_acceso,
      password_hash: r.password_hash,
      rol: r.rol as any,
      createdAt: r.createdAt ? new Date(r.createdAt) : new Date(),
      updatedAt: r.updatedAt ? new Date(r.updatedAt) : new Date()
    }));
    await User.bulkCreate(usersData);
    console.log(`✔ Usuarios migrados: ${usersData.length}`);

    // 2. ODF Panels
    console.log('\n🎛 [3/13] Migrando odf_panels...');
    const odfCsv = fs.readFileSync(path.join(baseDir, 'odf_panels.csv'), 'utf8');
    const odfData = parseCsv(odfCsv).map(r => ({
      id_odf: r.id_odf,
      nombre: r.nombre,
      ubicacion_central: r.ubicacion_central,
      coordenadas_gps: parseJsonField(r.coordenadas_gps),
      capacidad_hilos: parseInt(r.capacidad_hilos, 10) || 48,
      createdAt: r.createdAt ? new Date(r.createdAt) : new Date(),
      updatedAt: r.updatedAt ? new Date(r.updatedAt) : new Date()
    }));
    await OdfPanel.bulkCreate(odfData);
    console.log(`✔ ODF Panels migrados: ${odfData.length}`);

    // 3. PON Ports
    console.log('\n🔌 [4/13] Migrando pon_ports...');
    const ponCsv = fs.readFileSync(path.join(baseDir, 'pon_ports.csv'), 'utf8');
    const ponData = parseCsv(ponCsv).map(r => ({
      id_puerto_pon: r.id_puerto_pon,
      id_odf: r.id_odf,
      numero_slot: parseInt(r.numero_slot, 10) || 1,
      numero_puerto: parseInt(r.numero_puerto, 10) || 1,
      capacidad_maxima: parseInt(r.capacidad_maxima, 10) || 64,
      potencia_tx_dbm: parseFloat(r.potencia_tx_dbm) || 5.0,
      createdAt: r.createdAt ? new Date(r.createdAt) : new Date(),
      updatedAt: r.updatedAt ? new Date(r.updatedAt) : new Date()
    }));
    await PonPort.bulkCreate(ponData);
    console.log(`✔ PON Ports migrados: ${ponData.length}`);

    // 4. Fiber Threads
    console.log('\n🧵 [5/13] Migrando fiber_threads...');
    const fiberCsv = fs.readFileSync(path.join(baseDir, 'fiber_threads.csv'), 'utf8');
    const fiberData = parseCsv(fiberCsv).map(r => ({
      id_hilo: r.id_hilo,
      numero_hilo: parseInt(r.numero_hilo, 10) || 1,
      estado: r.estado as any,
      id_odf_origen: r.id_odf_origen,
      createdAt: r.createdAt ? new Date(r.createdAt) : new Date(),
      updatedAt: r.updatedAt ? new Date(r.updatedAt) : new Date()
    }));
    await FiberThread.bulkCreate(fiberData);
    console.log(`✔ Hilos de fibra migrados: ${fiberData.length}`);

    // 5. NAP Boxes
    console.log('\n📦 [6/13] Migrando nap_boxes...');
    const napCsv = fs.readFileSync(path.join(baseDir, 'nap_boxes.csv'), 'utf8');
    const napData = parseCsv(napCsv).map(r => ({
      id_nap: r.id_nap,
      identificador: r.identificador,
      zona: r.zona,
      id_puerto_pon: r.id_puerto_pon,
      total_puertos: parseInt(r.total_puertos, 10) || 16,
      direccion_texto: r.direccion_texto,
      coordenadas_gps: parseJsonField(r.coordenadas_gps),
      createdAt: r.createdAt ? new Date(r.createdAt) : new Date(),
      updatedAt: r.updatedAt ? new Date(r.updatedAt) : new Date()
    }));
    await NapBox.bulkCreate(napData);
    console.log(`✔ Cajas NAP migradas: ${napData.length}`);

    // 6. NAP Ports
    console.log('\n🎯 [7/13] Migrando nap_ports...');
    const napPortsCsv = fs.readFileSync(path.join(baseDir, 'nap_ports.csv'), 'utf8');
    const napPortsData = parseCsv(napPortsCsv).map(r => ({
      id_puerto: r.id_puerto,
      id_nap: r.id_nap,
      indice_puerto: parseInt(r.indice_puerto, 10) || 1,
      estado: r.estado as any,
      createdAt: r.createdAt ? new Date(r.createdAt) : new Date(),
      updatedAt: r.updatedAt ? new Date(r.updatedAt) : new Date()
    }));
    await NapPort.bulkCreate(napPortsData);
    console.log(`✔ Puertos NAP migrados: ${napPortsData.length}`);

    // 7. Clients
    console.log('\n👥 [8/13] Migrando clients...');
    const clientsCsv = fs.readFileSync(path.join(baseDir, 'clients.csv'), 'utf8');
    const clientsData = parseCsv(clientsCsv).map(r => ({
      id_cliente: r.id_cliente,
      numero_cliente: r.numero_cliente,
      nombre_completo: r.nombre_completo,
      id_puerto_nap: r.id_puerto_nap || null,
      marca_ont: r.marca_ont,
      direccion: r.direccion,
      ont_mac: r.ont_mac,
      potencia_rx_estimada: parseFloat(r.potencia_rx_estimada) || -20.0,
      createdAt: r.createdAt ? new Date(r.createdAt) : new Date(),
      updatedAt: r.updatedAt ? new Date(r.updatedAt) : new Date()
    }));
    await Client.bulkCreate(clientsData);
    console.log(`✔ Clientes migrados: ${clientsData.length}`);

    // 8. Infrastructure Postes
    console.log('\n🗼 [9/13] Migrando infrastructure_postes...');
    const postesCsv = fs.readFileSync(path.join(baseDir, 'infrastructure_postes.csv'), 'utf8');
    const postesData = parseCsv(postesCsv).map(r => ({
      id_poste: r.id_poste,
      nombre: r.nombre,
      codigo: r.codigo,
      tipo: r.tipo as any,
      coordenadas_gps: parseJsonField(r.coordenadas_gps),
      material: r.material,
      createdAt: r.createdAt ? new Date(r.createdAt) : new Date(),
      updatedAt: r.updatedAt ? new Date(r.updatedAt) : new Date()
    }));
    // Bulk create en lotes si es grande
    await InfrastructurePoste.bulkCreate(postesData);
    console.log(`✔ Postes de infraestructura migrados: ${postesData.length}`);

    // 9. Infrastructure Mufas
    console.log('\n🧰 [10/13] Migrando infrastructure_mufas...');
    const mufasCsv = fs.readFileSync(path.join(baseDir, 'infrastructure_mufas.csv'), 'utf8');
    const mufasData = parseCsv(mufasCsv).map(r => ({
      id_empalme: r.id_empalme,
      nombre: r.nombre,
      tipo_cierre: r.tipo_cierre,
      capacidad_hilos: parseInt(r.capacidad_hilos, 10) || 48,
      estado: r.estado,
      coordenadas_gps: parseJsonField(r.coordenadas_gps),
      createdAt: r.createdAt ? new Date(r.createdAt) : new Date(),
      updatedAt: r.updatedAt ? new Date(r.updatedAt) : new Date()
    }));
    await InfrastructureMufa.bulkCreate(mufasData);
    console.log(`✔ Mufas / Cierres migrados: ${mufasData.length}`);

    // 10. Infrastructure Gasas
    console.log('\n⭕ [11/13] Migrando infrastructure_gasas...');
    const gasasCsv = fs.readFileSync(path.join(baseDir, 'infrastructure_gasas.csv'), 'utf8');
    const gasasData = parseCsv(gasasCsv).map(r => ({
      id_gasa: r.id_gasa,
      nombre: r.nombre,
      metros_reserva: parseFloat(r.metros_reserva) || 30,
      longitud_metros: parseFloat(r.longitud_metros) || 30,
      tipo_cable: r.tipo_cable,
      coordenadas_gps: parseJsonField(r.coordenadas_gps),
      createdAt: r.createdAt ? new Date(r.createdAt) : new Date(),
      updatedAt: r.updatedAt ? new Date(r.updatedAt) : new Date()
    }));
    await InfrastructureGasa.bulkCreate(gasasData);
    console.log(`✔ Gasas de reserva migradas: ${gasasData.length}`);

    // 11. Infrastructure Routes
    console.log('\n🗺 [12/13] Migrando infrastructure_routes...');
    const routesCsv = fs.readFileSync(path.join(baseDir, 'infrastructure_routes.csv'), 'utf8');
    const routesData = parseCsv(routesCsv).map(r => ({
      id_ruta: r.id_ruta,
      nombre: r.nombre,
      tipo: r.tipo as any,
      hilos: parseInt(r.hilos, 10) || 24,
      subtipo: r.subtipo,
      color: r.color,
      grosor: parseFloat(r.grosor) || 2.5,
      distancia_metros: parseFloat(r.distancia_metros) || 0,
      distancia_km: parseFloat(r.distancia_km) || 0,
      vertices: parseInt(r.vertices, 10) || 0,
      coordenadas: parseJsonField(r.coordenadas),
      estado: r.estado,
      createdAt: r.createdAt ? new Date(r.createdAt) : new Date(),
      updatedAt: r.updatedAt ? new Date(r.updatedAt) : new Date()
    }));
    await InfrastructureRoute.bulkCreate(routesData);
    console.log(`✔ Rutas de infraestructura migradas: ${routesData.length}`);

    // 12. Mileage Logs
    console.log('\n🚗 [13/13] Migrando mileage_logs...');
    const mileageCsv = fs.readFileSync(path.join(baseDir, 'mileage_logs.csv'), 'utf8');
    const mileageData = parseCsv(mileageCsv).map(r => ({
      id: r.id,
      tecnico_nombre: r.tecnico_nombre,
      id_nap: r.id_nap && r.id_nap.trim().length > 0 ? r.id_nap : undefined,
      nap_identificador: r.nap_identificador || undefined,
      nap_zona: r.nap_zona || undefined,
      vehiculo_unidad: r.vehiculo_unidad,
      motivo_traslado: r.motivo_traslado,
      tipo_calculo: r.tipo_calculo as any,
      km_inicial: r.km_inicial ? parseFloat(r.km_inicial) : undefined,
      km_final: r.km_final ? parseFloat(r.km_final) : undefined,
      km_recorridos: parseFloat(r.km_recorridos) || 0,
      distancia_estimada_ruta_km: r.distancia_estimada_ruta_km ? parseFloat(r.distancia_estimada_ruta_km) : undefined,
      origen_nombre: r.origen_nombre || undefined,
      destino_nombre: r.destino_nombre,
      notas: r.notas || undefined,
      fecha_hora: r.fecha_hora ? new Date(r.fecha_hora) : new Date(),
      createdAt: r.createdAt ? new Date(r.createdAt) : new Date(),
      updatedAt: r.updatedAt ? new Date(r.updatedAt) : new Date()
    }));
    await MileageLog.bulkCreate(mileageData);
    console.log(`✔ Bitácoras de kilometraje migradas: ${mileageData.length}`);

    console.log('\n================================================================');
    console.log('🎉 ¡MIGRACIÓN COMPLETADA EXITOSAMENTE AL 100% EN NEON!');
    console.log('================================================================');

    await sequelize.close();
    process.exit(0);
  } catch (error: any) {
    console.error('\n❌ ERROR DURANTE LA MIGRACIÓN:', error);
    if (error.errors) {
      console.error('Detalles Sequelize:', error.errors);
    }
    process.exit(1);
  }
}

runMigration();

