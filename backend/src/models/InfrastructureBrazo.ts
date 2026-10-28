import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface GpsCoordinates {
  lat: number;
  lng: number;
}

export interface InfrastructureBrazoAttributes {
  id_brazo: string;
  codigo: string;
  nombre: string;
  longitud_metros: number;
  tipo: string;
  material?: string;
  id_nap_asociada?: string;
  id_poste_asociado?: string;
  coordenadas_gps: GpsCoordinates;
  estado?: string;
  descripcion?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface InfrastructureBrazoCreationAttributes extends Optional<InfrastructureBrazoAttributes, 'id_brazo'> {}

export class InfrastructureBrazo extends Model<InfrastructureBrazoAttributes, InfrastructureBrazoCreationAttributes> implements InfrastructureBrazoAttributes {
  public declare id_brazo: string;
  public declare codigo: string;
  public declare nombre: string;
  public declare longitud_metros: number;
  public declare tipo: string;
  public declare material: string;
  public declare id_nap_asociada: string;
  public declare id_poste_asociado: string;
  public declare coordenadas_gps: GpsCoordinates;
  public declare estado: string;
  public declare descripcion: string;

  public declare readonly createdAt: Date;
  public declare readonly updatedAt: Date;
}

InfrastructureBrazo.init(
  {
    id_brazo: {
      type: DataTypes.STRING(100),
      primaryKey: true
    },
    codigo: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    nombre: {
      type: DataTypes.STRING(150),
      allowNull: false
    },
    longitud_metros: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 1.2
    },
    tipo: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: 'brazo_extension_nap'
    },
    material: {
      type: DataTypes.STRING(100),
      allowNull: true,
      defaultValue: 'Acero Galvanizado por Inmersión'
    },
    id_nap_asociada: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    id_poste_asociado: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    coordenadas_gps: {
      type: DataTypes.JSONB,
      allowNull: false
    },
    estado: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'instalado'
    },
    descripcion: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  },
  {
    sequelize,
    tableName: 'infrastructure_brazos',
    timestamps: true
  }
);
