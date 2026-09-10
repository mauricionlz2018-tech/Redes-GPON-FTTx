import bcrypt from 'bcryptjs';
import { sequelize, User, OdfPanel, PonPort, FiberThread, NapBox, NapPort, Client } from '../models';

export async function runSeed() {
  console.log('Iniciando proceso de seed en base de datos...');

  // 1. Sincronizar esquemas (recrear tablas limpias)
  await sequelize.sync({ force: true });
  console.log('✔ Tablas y esquemas sincronizados correctamente.');
  console.log('[OK] Tablas y esquemas sincronizados correctamente.');

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
  console.log('[OK] Usuarios iniciales creados (admin@gpon.com, soporte@gpon.com, tecnico@gpon.com / pass: admin123).');

  // 3. Crear ODF Central (San José del Rincón)
  const odf = await OdfPanel.create({
    nombre: 'ODF Central San José del Rincón',
    ubicacion_central: 'Calle Hidalgo #10, Centro, San José del Rincón, Edo. Méx.',
    coordenadas_gps: { lat: 19.6642, lng: -100.1472 },
    capacidad_hilos: 48
  });
  console.log('✔ ODF Central creado:', odf.nombre);
  console.log('[OK] ODF Central creado:', odf.nombre);

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

  // 6. Crear 25 Cajas NAP Reales con sus 16 puertos cada una (KMZ SJR)
  const napsData = [
    {
      identificador: 'NAP-SJR-01',
      zona: 'San José del Rincón - Sur',
      id_puerto_pon: pon1.id_puerto_pon,
      total_puertos: 16,
      direccion_texto: 'Carretera Principal SJR #15',
      coordenadas_gps: { lat: 19.69812321305894, lng: -100.1159390724763 },
      occupiedCount: 14,
      hasDamaged: true
    },
    {
      identificador: 'NAP-SJR-02',
      zona: 'San José del Rincón - Sur',
      id_puerto_pon: pon2.id_puerto_pon,
      total_puertos: 16,
      direccion_texto: 'Carretera Principal SJR #16',
      coordenadas_gps: { lat: 19.69812673661189, lng: -100.1171563548064 },
      occupiedCount: 16,
      hasDamaged: false
    },
    {
      identificador: 'NAP-SJR-03',
      zona: 'La Presa - Manzana',
      id_puerto_pon: pon1.id_puerto_pon,
      total_puertos: 16,
      direccion_texto: 'Camino a la Presa, Poste CFE #22',
      coordenadas_gps: { lat: 19.70086393818054, lng: -100.1171010702103 },
      occupiedCount: 12,
      hasDamaged: false
    },
    {
      identificador: 'NAP-SJR-04',
      zona: 'La Presa - Manzana',
      id_puerto_pon: pon2.id_puerto_pon,
      total_puertos: 16,
      direccion_texto: 'Camino a la Presa, Poste CFE #23',
      coordenadas_gps: { lat: 19.70218887882606, lng: -100.1142261628823 },
      occupiedCount: 15,
      hasDamaged: false
    },
    {
      identificador: 'NAP-SJR-05',
      zona: 'La Presa - Manzana',
      id_puerto_pon: pon1.id_puerto_pon,
      total_puertos: 16,
      direccion_texto: 'Camino a la Presa, Poste CFE #24',
      coordenadas_gps: { lat: 19.70155257680219, lng: -100.1156247558254 },
      occupiedCount: 8,
      hasDamaged: false
    },
    {
      identificador: 'NAP-SJR-06',
      zona: 'La Presa - Manzana',
      id_puerto_pon: pon2.id_puerto_pon,
      total_puertos: 16,
      direccion_texto: 'Camino a la Presa, Poste CFE #25',
      coordenadas_gps: { lat: 19.70183374145083, lng: -100.1150477139243 },
      occupiedCount: 16,
      hasDamaged: false
    },
    {
      identificador: 'NAP-SJR-07',
      zona: 'San Francisco de la Loma - Centro',
      id_puerto_pon: pon1.id_puerto_pon,
      total_puertos: 16,
      direccion_texto: 'Calle Los Encinos esq. Jacarandas #17',
      coordenadas_gps: { lat: 19.70434508510973, lng: -100.1116251363456 },
      occupiedCount: 5,
      hasDamaged: true
    },
    {
      identificador: 'NAP-SJR-08',
      zona: 'San Francisco de la Loma - Centro',
      id_puerto_pon: pon2.id_puerto_pon,
      total_puertos: 16,
      direccion_texto: 'Calle Los Encinos esq. Jacarandas #19',
      coordenadas_gps: { lat: 19.70519383777912, lng: -100.1098194504984 },
      occupiedCount: 4,
      hasDamaged: false
    },
    {
      identificador: 'NAP-SJR-09',
      zona: 'San Francisco de la Loma - Centro',
      id_puerto_pon: pon1.id_puerto_pon,
      total_puertos: 16,
      direccion_texto: 'Calle Los Encinos esq. Jacarandas #21',
      coordenadas_gps: { lat: 19.70581860242822, lng: -100.108477272282 },
      occupiedCount: 13,
      hasDamaged: false
    },
    {
      identificador: 'NAP-SJR-10',
      zona: 'San Francisco de la Loma - Centro',
      id_puerto_pon: pon2.id_puerto_pon,
      total_puertos: 16,
      direccion_texto: 'Calle Los Encinos esq. Jacarandas #23',
      coordenadas_gps: { lat: 19.70410754991645, lng: -100.1017088428748 },
      occupiedCount: 11,
      hasDamaged: false
    },
    {
      identificador: 'NAP-SJR-11',
      zona: 'San Francisco de la Loma - Centro',
      id_puerto_pon: pon1.id_puerto_pon,
      total_puertos: 16,
      direccion_texto: 'Calle Los Encinos esq. Jacarandas #25',
      coordenadas_gps: { lat: 19.70403664574141, lng: -100.1010671479049 },
      occupiedCount: 7,
      hasDamaged: false
    },
    {
      identificador: 'NAP-SJR-12',
      zona: 'San Francisco de la Loma - Centro',
      id_puerto_pon: pon2.id_puerto_pon,
      total_puertos: 16,
      direccion_texto: 'Calle Los Encinos esq. Jacarandas #27',
      coordenadas_gps: { lat: 19.70385056302065, lng: -100.1006683067842 },
      occupiedCount: 14,
      hasDamaged: false
    },
    {
      identificador: 'NAP-SJR-13',
      zona: 'San Francisco de la Loma - Centro',
      id_puerto_pon: pon1.id_puerto_pon,
      total_puertos: 16,
      direccion_texto: 'Calle Los Encinos esq. Jacarandas #29',
      coordenadas_gps: { lat: 19.70333943951259, lng: -100.0998755829779 },
      occupiedCount: 16,
      hasDamaged: false
    },
    {
      identificador: 'NAP-SJR-14',
      zona: 'La Presa - Manzana',
      id_puerto_pon: pon2.id_puerto_pon,
      total_puertos: 16,
      direccion_texto: 'Camino a la Presa, Poste CFE #33',
      coordenadas_gps: { lat: 19.70271268592046, lng: -100.098387535694 },
      occupiedCount: 9,
      hasDamaged: false
    },
    {
      identificador: 'NAP-SJR-15',
      zona: 'San Francisco de la Loma - Centro',
      id_puerto_pon: pon1.id_puerto_pon,
      total_puertos: 16,
      direccion_texto: 'Calle Los Encinos esq. Jacarandas #33',
      coordenadas_gps: { lat: 19.70555547606913, lng: -100.1001937086599 },
      occupiedCount: 3,
      hasDamaged: false
    },
    {
      identificador: 'NAP-SJR-16',
      zona: 'San Francisco de la Loma - Centro',
      id_puerto_pon: pon2.id_puerto_pon,
      total_puertos: 16,
      direccion_texto: 'Calle Los Encinos esq. Jacarandas #35',
      coordenadas_gps: { lat: 19.70565243124017, lng: -100.0990648318555 },
      occupiedCount: 6,
      hasDamaged: false
    },
    {
      identificador: 'NAP-SJR-17',
      zona: 'San Francisco de la Loma - Centro',
      id_puerto_pon: pon1.id_puerto_pon,
      total_puertos: 16,
      direccion_texto: 'Calle Los Encinos esq. Jacarandas #37',
      coordenadas_gps: { lat: 19.70765867300566, lng: -100.0995686767321 },
      occupiedCount: 15,
      hasDamaged: false
    },
    {
      identificador: 'NAP-SJR-18',
      zona: 'San Francisco de la Loma - Centro',
      id_puerto_pon: pon2.id_puerto_pon,
      total_puertos: 16,
      direccion_texto: 'Calle Los Encinos esq. Jacarandas #39',
      coordenadas_gps: { lat: 19.70741888016319, lng: -100.1008666862248 },
      occupiedCount: 12,
      hasDamaged: false
    },
    {
      identificador: 'NAP-SJR-19',
      zona: 'San Francisco de la Loma - Norte',
      id_puerto_pon: pon1.id_puerto_pon,
      total_puertos: 16,
      direccion_texto: 'Av. Principal San Francisco Norte #64',
      coordenadas_gps: { lat: 19.71068484498344, lng: -100.1017234989169 },
      occupiedCount: 10,
      hasDamaged: true
    },
    {
      identificador: 'NAP-SJR-20',
      zona: 'San Francisco de la Loma - Norte',
      id_puerto_pon: pon2.id_puerto_pon,
      total_puertos: 16,
      direccion_texto: 'Av. Principal San Francisco Norte #67',
      coordenadas_gps: { lat: 19.71162227901236, lng: -100.1016716447679 },
      occupiedCount: 4,
      hasDamaged: false
    },
    {
      identificador: 'NAP-SJR-21',
      zona: 'San Francisco de la Loma - Norte',
      id_puerto_pon: pon1.id_puerto_pon,
      total_puertos: 16,
      direccion_texto: 'Av. Principal San Francisco Norte #70',
      coordenadas_gps: { lat: 19.70852506306401, lng: -100.1011607973532 },
      occupiedCount: 13,
      hasDamaged: false
    },
    {
      identificador: 'NAP-SJR-22',
      zona: 'San Francisco de la Loma - Centro',
      id_puerto_pon: pon2.id_puerto_pon,
      total_puertos: 16,
      direccion_texto: 'Calle Los Encinos esq. Jacarandas #47',
      coordenadas_gps: { lat: 19.70743218950118, lng: -100.1028417721292 },
      occupiedCount: 16,
      hasDamaged: false
    },
    {
      identificador: 'NAP-SJR-23',
      zona: 'San Francisco de la Loma - Norte',
      id_puerto_pon: pon1.id_puerto_pon,
      total_puertos: 16,
      direccion_texto: 'Av. Principal San Francisco Norte #76',
      coordenadas_gps: { lat: 19.70928631295908, lng: -100.104295482757 },
      occupiedCount: 8,
      hasDamaged: false
    },
    {
      identificador: 'NAP-SJR-24',
      zona: 'San José del Rincón - Sur',
      id_puerto_pon: pon2.id_puerto_pon,
      total_puertos: 16,
      direccion_texto: 'Carretera Principal SJR #38',
      coordenadas_gps: { lat: 19.69675486793837, lng: -100.1150025923476 },
      occupiedCount: 5,
      hasDamaged: false
    },
    {
      identificador: 'NAP-SJR-25',
      zona: 'San José del Rincón - Sur',
      id_puerto_pon: pon1.id_puerto_pon,
      total_puertos: 16,
      direccion_texto: 'Carretera Principal SJR #39',
      coordenadas_gps: { lat: 19.69573472205645, lng: -100.1146596220177 },
      occupiedCount: 2,
      hasDamaged: true
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
    console.log(`[OK] Caja ${nap.identificador} creada con 16 puertos (${nData.occupiedCount} ocupados).`);
  }

  console.log('====================================================');
  console.log('🎉 Seed completado exitosamente con topología GPON.');
  console.log('Seed completado exitosamente con topología GPON.');
  console.log('====================================================');
}

// Permitir ejecución directa por CLI con `pnpm run seed`
if (require.main === module) {
  runSeed()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('❌ Error ejecutando seed:', err);
      console.error('[ERROR] Error ejecutando seed:', err);
      process.exit(1);
    });
}
