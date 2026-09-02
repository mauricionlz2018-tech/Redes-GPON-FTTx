export type UserRole = 'Admin' | 'Soporte' | 'Tecnico';

export interface User {
  id_usuario: string;
  nombre_completo: string;
  credencial_acceso: string;
  rol: UserRole;
}

export interface GpsCoordinates {
  lat: number;
  lng: number;
}

export interface OdfPanel {
  id_odf: string;
  nombre: string;
  ubicacion_central: string;
  coordenadas_gps: GpsCoordinates;
  capacidad_hilos: number;
}

export type NapPortStatus = 'Libre' | 'Ocupado' | 'Dañado' | 'Reservado' | 'En Mantenimiento';

export interface Client {
  id_cliente: string;
  numero_cliente: string;
  nombre_completo: string;
  id_puerto_nap: string;
  marca_ont: 'ZTE' | 'V-SOL' | 'TP-Link' | 'Huawei';
  direccion: string;
  ont_mac: string;
  potencia_rx_estimada: number;
  puerto_nap?: NapPort;
}

export interface NapPort {
  id_puerto: string;
  id_nap: string;
  indice_puerto: number;
  estado: NapPortStatus;
  cliente?: Client | null;
  caja_nap?: NapBox;
}

export interface NapMetricas {
  total: number;
  libres: number;
  ocupados: number;
  danados: number;
  reservados?: number;
  porcentajeSaturacion: number;
  estadoSaturacion?: 'disponible' | 'alerta' | 'saturada';
}

export interface NapBox {
  id_nap: string;
  identificador: string;
  zona: string;
  id_puerto_pon: string;
  total_puertos: number;
  direccion_texto: string;
  coordenadas_gps: GpsCoordinates;
  metricas?: NapMetricas;
  puertos?: NapPort[];
  puerto_pon?: {
    id_puerto_pon: string;
    numero_slot: number;
    numero_puerto: number;
    potencia_tx_dbm: number;
    odf?: OdfPanel;
  };
}

export interface PendingMutation {
  id?: number;
  tipo: 'ASIGNAR_PUERTO' | 'ACTUALIZAR_GPS';
  id_puerto?: string;
  id_nap?: string;
  payload: any;
  fechaCreacion: string;
  intentos: number;
}
