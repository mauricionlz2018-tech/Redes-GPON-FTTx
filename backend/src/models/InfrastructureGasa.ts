import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface GpsCoordinates {
  lat: number;
  lng: number;
}

export interface InfrastructureGasaAttributes {
  id_gasa: string;
  nombre: string;
  metros_reserva: number;
  longitud_metros?: number;
  tipo_cable?: string;
  coordenadas_gps: GpsCoordinates;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface InfrastructureGasaCreationAttributes extends Optional<InfrastructureGasaAttributes, 'id_gasa'> {}

export class InfrastructureGasa extends Model<InfrastructureGasaAttributes, InfrastructureGasaCreationAttributes> implements InfrastructureGasaAttributes {
  public declare id_gasa: string;
  public declare nombre: string;
  public declare metros_reserva: number;
  public declare longitud_metros: number;
  public declare tipo_cable: string;
  public declare coordenadas_gps: GpsCoordinates;

  public declare readonly createdAt: Date;
  public declare readonly updatedAt: Date;
}

InfrastructureGasa.init(
  {
    id_gasa: {
      type: DataTypes.STRING(100),
      primaryKey: true
    },
    nombre: {
      type: DataTypes.STRING(150),
      allowNull: false
    },
    metros_reserva: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 30
    },
    longitud_metros: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 30
    },
    tipo_cable: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: 'Cable Troncal 48H'
    },
    coordenadas_gps: {
      type: DataTypes.JSONB,
      allowNull: false
    }
  },
  {
    sequelize,
    tableName: 'infrastructure_gasas',
    timestamps: true
  }
);

