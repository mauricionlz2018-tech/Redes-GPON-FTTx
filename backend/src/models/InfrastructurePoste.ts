import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface GpsCoordinates {
  lat: number;
  lng: number;
}

export interface InfrastructurePosteAttributes {
  id_poste: string;
  nombre: string;
  codigo: string;
  tipo: 'poste_propuesto' | 'poste_cfe' | string;
  coordenadas_gps: GpsCoordinates;
  material?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface InfrastructurePosteCreationAttributes extends Optional<InfrastructurePosteAttributes, 'id_poste'> {}

export class InfrastructurePoste extends Model<InfrastructurePosteAttributes, InfrastructurePosteCreationAttributes> implements InfrastructurePosteAttributes {
  public declare id_poste: string;
  public declare nombre: string;
  public declare codigo: string;
  public declare tipo: string;
  public declare coordenadas_gps: GpsCoordinates;
  public declare material: string;

  public declare readonly createdAt: Date;
  public declare readonly updatedAt: Date;
}

InfrastructurePoste.init(
  {
    id_poste: {
      type: DataTypes.STRING(100),
      primaryKey: true
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    codigo: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    tipo: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'poste_propuesto'
    },
    coordenadas_gps: {
      type: DataTypes.JSONB,
      allowNull: false
    },
    material: {
      type: DataTypes.STRING(100),
      allowNull: true
    }
  },
  {
    sequelize,
    tableName: 'infrastructure_postes',
    timestamps: true
  }
);
