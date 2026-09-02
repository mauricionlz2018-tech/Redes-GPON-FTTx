import bcrypt from 'bcryptjs';
import { sequelize, User, OdfPanel, PonPort, FiberThread, NapBox, NapPort, Client } from '../models';

export async function runSeed() {
  console.log('Iniciando proceso de seed en base de datos...');

  // 1. Sincronizar esquemas (recrear tablas limpias)
  await sequelize.sync({ force: true });
  console.log('✔ Tablas y esquemas sincronizados correctamente.');

  // 2. Crear Usuarios (Admin, Soporte, Tecnico)
  const passwordHash = await bcrypt.hash('admin123', 10);

  await User.bulkCreate([
    {
      nombre_completo: 'Ing. Carlos Mendoza (Admin NOC)',
      credencial_acceso: 'admin@gpon.com',
      password_hash: passwordHash,
      rol: 'Admin'
    },
    {
      nombre_completo: 'Ing. Sofía Ramírez (Soporte Técnico)',
      credencial_acceso: 'soporte@gpon.com',
      password_hash: passwordHash,
      rol: 'Soporte'
    },
    {
      nombre_completo: 'Juan Pérez (Técnico Cuadrilla 1)',
      credencial_acceso: 'tecnico@gpon.com',
      password_hash: passwordHash,
      rol: 'Tecnico'
    }
  ]);
  console.log('✔ Usuarios iniciales creados (admin@gpon.com, soporte@gpon.com, tecnico@gpon.com / pass: admin123).');

  // 3. Crear ODF Central (San José del Rincón)
  const odf = await OdfPanel.create({
    nombre: 'ODF Central San José del Rincón',
    ubicacion_central: 'Calle Hidalgo #10, Centro, San José del Rincón, Edo. Méx.',
    coordenadas_gps: { lat: 19.6642, lng: -100.1472 },
    capacidad_hilos: 48
  });
  console.log('✔ ODF Central creado:', odf.nombre);

  // 4. Crear Hilos de Fibra
  for (let i = 1; i <= 24; i++) {
    await FiberThread.create({
      numero_hilo: i,
      estado: i <= 8 ? 'Activo' : i <= 16 ? 'Reserva' : 'Muerto',
      id_odf_origen: odf.id_odf
    });
  }

  // 5. Crear Puertos PON
  const pon1 = await PonPort.create({
    id_odf: odf.id_odf,
    numero_slot: 1,
    numero_puerto: 1,
    capacidad_maxima: 64,
    potencia_tx_dbm: 5.2
  });

  const pon2 = await PonPort.create({
    id_odf: odf.id_odf,
    numero_slot: 1,
    numero_puerto: 2,
    capacidad_maxima: 64,
    potencia_tx_dbm: 4.8
  });

  // 6. Crear Cajas NAP con sus 16 puertos cada una
  const napsData = [
    {
      identificador: 'NAP-SJR-01',
      zona: 'Centro / Plaza Principal',
      id_puerto_pon: pon1.id_puerto_pon,
      total_puertos: 16,
      direccion_texto: 'Av. Benito Juárez esq. Morelos, Poste CFE #45',
      coordenadas_gps: { lat: 19.6655, lng: -100.1465 },
      occupiedCount: 13 // >= 80% (13/16 = 81.2%) -> Estado Alerta Amarillo
    },
    {
      identificador: 'NAP-SJR-02',
      zona: 'Barrio San Pedro',
      id_puerto_pon: pon1.id_puerto_pon,
      total_puertos: 16,
      direccion_texto: 'Calle Libertad #24 frente a Capilla',
      coordenadas_gps: { lat: 19.6680, lng: -100.1420 },
      occupiedCount: 16 // 100% -> Estado Saturada Rojo
    },
    {
      identificador: 'NAP-SJR-03',
      zona: 'Colonia Guadalupe',
      id_puerto_pon: pon2.id_puerto_pon,
      total_puertos: 16,
      direccion_texto: 'Calle 16 de Septiembre esq. Jacarandas #102',
      coordenadas_gps: { lat: 19.6610, lng: -100.1510 },
      occupiedCount: 4, // 25% -> Estado Disponible Verde
      hasDamaged: true
    },
    {
      identificador: 'NAP-SJR-04',
      zona: 'Las Rosas / Carretera Norte',
      id_puerto_pon: pon2.id_puerto_pon,
      total_puertos: 16,
      direccion_texto: 'Km 2.5 Carretera San José - Providencia, Poste #12',
      coordenadas_gps: { lat: 19.6710, lng: -100.1540 },
      occupiedCount: 2 // 12.5% -> Estado Disponible Verde
    }
  ];

  const marcasOnt: Array<'ZTE' | 'V-SOL' | 'TP-Link' | 'Huawei'> = ['ZTE', 'Huawei', 'V-SOL', 'TP-Link'];
  const nombresAbonados = [
    'María Elena González Flores',
    'Roberto Hernández Sánchez',
    'Abarrotes La Providencia',
    'Ferretería El Tornillo San José',
    'Dr. Alejandro Villa Morales',
    'Farmacia San José Sucursal Centro',
    'Lic. Patricia Ruiz Domínguez',
    'Ciber San Pedro FTTx',
    'Guadalupe Martínez Romero',
    'Taller Mecánico Hermanos López',
    'Panadería La Esperanza',
    'Hotel & Restaurant Campestre',
    'Escuela Primaria Miguel Hidalgo',
    'Super Carnes San José',
    'Dra. Laura Morales Solís',
    'Ing. Fernando Castillo Peña',
    'Veterinaria San Pedro',
    'Purificadora Agua Clara',
    'Zapatería El Trébol',
    'Estética Unisex Claudia'
  ];

  let clientCounter = 100;

  for (const nData of napsData) {
    const nap = await NapBox.create({
      identificador: nData.identificador,
      zona: nData.zona,
      id_puerto_pon: nData.id_puerto_pon,
      total_puertos: nData.total_puertos,
      direccion_texto: nData.direccion_texto,
      coordenadas_gps: nData.coordenadas_gps
    });

    for (let pIdx = 1; pIdx <= 16; pIdx++) {
      let estado: any = 'Libre';
      if (pIdx <= nData.occupiedCount) {
        estado = 'Ocupado';
      } else if (nData.hasDamaged && pIdx === 5) {
        estado = 'Dañado';
      }

      const port = await NapPort.create({
        id_nap: nap.id_nap,
        indice_puerto: pIdx,
        estado
      });

      // Si el puerto está ocupado, creamos el abonado vinculado 1:1
      if (estado === 'Ocupado') {
        clientCounter++;
        const abonadoNombre = nombresAbonados[clientCounter % nombresAbonados.length];
        const marca = marcasOnt[pIdx % marcasOnt.length];
        const hexMac = pIdx.toString(16).padStart(2, '0').toUpperCase();
        const randMac = clientCounter.toString(16).padStart(2, '0').toUpperCase();

        await Client.create({
          numero_cliente: `CLI-00${clientCounter}`,
          nombre_completo: `${abonadoNombre} (${nData.identificador}-P${pIdx})`,
          id_puerto_nap: port.id_puerto,
          marca_ont: marca,
          direccion: `${nData.zona}, Calle Real #${10 + pIdx}`,
          ont_mac: `48:2C:EA:11:${hexMac}:${randMac}`,
          potencia_rx_estimada: -17.5 - Number((Math.random() * 5).toFixed(1))
        });
      }
    }
    console.log(`✔ Caja ${nap.identificador} creada con 16 puertos (${nData.occupiedCount} ocupados).`);
  }

  console.log('====================================================');
  console.log('🎉 Seed completado exitosamente con topología GPON.');
  console.log('====================================================');
}

// Permitir ejecución directa por CLI con `pnpm run seed`
if (require.main === module) {
  runSeed()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('❌ Error ejecutando seed:', err);
      process.exit(1);
    });
}
