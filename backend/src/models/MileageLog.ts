import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface MileageLogAttributes {
  id: string;
  tecnico_nombre: string;
  id_nap?: string;
  nap_identificador?: string;
  nap_zona?: string;
  vehiculo_unidad: string;
  motivo_traslado: string;
  tipo_calculo: 'odometro' | 'distancia_directa';
  km_inicial?: number;
  km_final?: number;
  km_recorridos: number;
  distancia_estimada_ruta_km?: number;
  origen_nombre?: string;
  destino_nombre: string;
  notas?: string;
  fecha_hora: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface MileageLogCreationAttributes extends Optional<MileageLogAttributes, 'id' | 'fecha_hora'> {}

export class MileageLog extends Model<MileageLogAttributes, MileageLogCreationAttributes> implements MileageLogAttributes {
  public declare id: string;
  public declare tecnico_nombre: string;
  public declare id_nap: string;
  public declare nap_identificador: string;
  public declare nap_zona: string;
  public declare vehiculo_unidad: string;
  public declare motivo_traslado: string;
  public declare tipo_calculo: 'odometro' | 'distancia_directa';
  public declare km_inicial: number;
  public declare km_final: number;
  public declare km_recorridos: number;
  public declare distancia_estimada_ruta_km: number;
  public declare origen_nombre: string;
  public declare destino_nombre: string;
  public declare notas: string;
  public declare fecha_hora: Date;

  public declare readonly createdAt: Date;
  public declare readonly updatedAt: Date;
}

MileageLog.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    tecnico_nombre: {
      type: DataTypes.STRING(150),
      allowNull: false
    },
    id_nap: {
      type: DataTypes.UUID,
      allowNull: true
    },
    nap_identificador: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    nap_zona: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    vehiculo_unidad: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: 'Unidad Móvil 01'
    },
    motivo_traslado: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'Instalacion'
    },
    tipo_calculo: {
      type: DataTypes.STRING(30),
      allowNull: false,
      defaultValue: 'odometro'
    },
    km_inicial: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    km_final: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    km_recorridos: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    distancia_estimada_ruta_km: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    origen_nombre: {
      type: DataTypes.STRING(150),
      allowNull: true,
      defaultValue: 'Central ODF San José'
    },
    destino_nombre: {
      type: DataTypes.STRING(150),
      allowNull: false
    },
    notas: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    fecha_hora: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  },
  {
    sequelize,
    tableName: 'mileage_logs',
    timestamps: true
  }
);

