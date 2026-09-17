import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface GpsCoordinates {
  lat: number;
  lng: number;
}

export interface InfrastructureMufaAttributes {
  id_empalme: string;
  nombre: string;
  tipo_cierre: string;
  capacidad_hilos: number;
  estado: string;
  coordenadas_gps: GpsCoordinates;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface InfrastructureMufaCreationAttributes extends Optional<InfrastructureMufaAttributes, 'id_empalme'> {}

export class InfrastructureMufa extends Model<InfrastructureMufaAttributes, InfrastructureMufaCreationAttributes> implements InfrastructureMufaAttributes {
  public declare id_empalme: string;
  public declare nombre: string;
  public declare tipo_cierre: string;
  public declare capacidad_hilos: number;
  public declare estado: string;
  public declare coordenadas_gps: GpsCoordinates;

  public declare readonly createdAt: Date;
  public declare readonly updatedAt: Date;
}

InfrastructureMufa.init(
  {
    id_empalme: {
      type: DataTypes.STRING(100),
      primaryKey: true
    },
    nombre: {
      type: DataTypes.STRING(150),
      allowNull: false
    },
    tipo_cierre: {
      type: DataTypes.STRING(150),
      allowNull: false,
      defaultValue: 'Cierre de Empalme Torpedo Domo (IP68)'
    },
    capacidad_hilos: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 48
    },
    estado: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'operativa'
    },
    coordenadas_gps: {
      type: DataTypes.JSONB,
      allowNull: false
    }
  },
  {
    sequelize,
    tableName: 'infrastructure_mufas',
    timestamps: true
  }
);
