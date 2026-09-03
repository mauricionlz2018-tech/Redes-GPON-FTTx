import { NapBox, OdfPanel, Client } from '../types';

export const mockOdf: OdfPanel = {
  id_odf: 'odf-sjr-01',
  nombre: 'ODF Central San José del Rincón',
  ubicacion_central: 'Calle Hidalgo #10, Centro, San José del Rincón, Edo. Méx.',
  coordenadas_gps: { lat: 19.6642, lng: -100.1472 },
  capacidad_hilos: 48
};

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
  'Ing. Fernando Castillo Peña'
];

const marcasOnt: Array<'ZTE' | 'V-SOL' | 'TP-Link' | 'Huawei'> = ['ZTE', 'Huawei', 'V-SOL', 'TP-Link'];

function createMockPorts(napId: string, napIdentificador: string, occupiedCount: number, hasDamaged = false) {
  const ports = [];
  for (let i = 1; i <= 16; i++) {
    let estado: any = 'Libre';
    let cliente: Client | null = null;

    if (i <= occupiedCount) {
      estado = 'Ocupado';
      cliente = {
        id_cliente: `cli-${napIdentificador}-${i}`,
        numero_cliente: `CLI-00${100 + i}`,
        nombre_completo: nombresAbonados[(i - 1) % nombresAbonados.length],
        id_puerto_nap: `port-${napId}-${i}`,
        marca_ont: marcasOnt[i % marcasOnt.length],
        direccion: `Calle Principal #${10 + i}, San José del Rincón`,
        ont_mac: `48:2C:EA:11:${i.toString(16).padStart(2, '0').toUpperCase()}:A${i}`,
        potencia_rx_estimada: -18.5 - Number((i * 0.3).toFixed(1))
      };
    } else if (hasDamaged && i === 5) {
      estado = 'Dañado';
    }

    ports.push({
      id_puerto: `port-${napId}-${i}`,
      id_nap: napId,
      indice_puerto: i,
      estado,
      cliente
    });
  }
  return ports;
}

export const mockNaps: NapBox[] = [
  {
    id_nap: 'nap-sjr-01',
    identificador: 'NAP-SJR-01',
    zona: 'Centro / Plaza Principal',
    id_puerto_pon: 'pon-1',
    total_puertos: 16,
    direccion_texto: 'Av. Benito Juárez esq. Morelos, Poste CFE #45',
    coordenadas_gps: { lat: 19.6655, lng: -100.1465 },
    metricas: {
      total: 16,
      libres: 3,
      ocupados: 13,
      danados: 0,
      porcentajeSaturacion: 81,
      estadoSaturacion: 'alerta' // Amarillo (>= 80%)
    },
    puertos: createMockPorts('nap-sjr-01', 'NAP-SJR-01', 13)
  },
  {
    id_nap: 'nap-sjr-02',
    identificador: 'NAP-SJR-02',
    zona: 'Barrio San Pedro',
    id_puerto_pon: 'pon-1',
    total_puertos: 16,
    direccion_texto: 'Calle Libertad #24 frente a Capilla',
    coordenadas_gps: { lat: 19.6680, lng: -100.1420 },
    metricas: {
      total: 16,
      libres: 0,
      ocupados: 16,
      danados: 0,
      porcentajeSaturacion: 100,
      estadoSaturacion: 'saturada' // Rojo (100%)
    },
    puertos: createMockPorts('nap-sjr-02', 'NAP-SJR-02', 16)
  },
  {
    id_nap: 'nap-sjr-03',
    identificador: 'NAP-SJR-03',
    zona: 'Colonia Guadalupe',
    id_puerto_pon: 'pon-2',
    total_puertos: 16,
    direccion_texto: 'Calle 16 de Septiembre esq. Jacarandas #102',
    coordenadas_gps: { lat: 19.6610, lng: -100.1510 },
    metricas: {
      total: 16,
      libres: 11,
      ocupados: 4,
      danados: 1,
      porcentajeSaturacion: 25,
      estadoSaturacion: 'disponible' // Verde (< 80%)
    },
    puertos: createMockPorts('nap-sjr-03', 'NAP-SJR-03', 4, true)
  },
  {
    id_nap: 'nap-sjr-04',
    identificador: 'NAP-SJR-04',
    zona: 'Las Rosas / Carretera Norte',
    id_puerto_pon: 'pon-2',
    total_puertos: 16,
    direccion_texto: 'Km 2.5 Carretera San José - Providencia, Poste #12',
    coordenadas_gps: { lat: 19.6710, lng: -100.1540 },
    metricas: {
      total: 16,
      libres: 14,
      ocupados: 2,
      danados: 0,
      porcentajeSaturacion: 13,
      estadoSaturacion: 'disponible' // Verde (< 80%)
    },
    puertos: createMockPorts('nap-sjr-04', 'NAP-SJR-04', 2)
  }
];

