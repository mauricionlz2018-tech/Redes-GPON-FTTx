import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface InfrastructureRouteAttributes {
  id_ruta: string;
  nombre: string;
  tipo: string;
  hilos: number;
  subtipo?: string;
  color: string;
  grosor: number;
  distancia_metros?: number;
  distancia_km?: number;
  vertices?: number;
  coordenadas: [number, number][];
  estado?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface InfrastructureRouteCreationAttributes extends Optional<InfrastructureRouteAttributes, 'id_ruta'> {}

export class InfrastructureRoute extends Model<InfrastructureRouteAttributes, InfrastructureRouteCreationAttributes> implements InfrastructureRouteAttributes {
  public declare id_ruta: string;
  public declare nombre: string;
  public declare tipo: string;
  public declare hilos: number;
  public declare subtipo: string;
  public declare color: string;
  public declare grosor: number;
  public declare distancia_metros: number;
  public declare distancia_km: number;
  public declare vertices: number;
  public declare coordenadas: [number, number][];
  public declare estado: string;

  public declare readonly createdAt: Date;
  public declare readonly updatedAt: Date;
}

InfrastructureRoute.init(
  {
    id_ruta: {
      type: DataTypes.STRING(100),
      primaryKey: true
    },
    nombre: {
      type: DataTypes.STRING(150),
      allowNull: false
    },
    tipo: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'troncal'
    },
    hilos: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 48
    },
    subtipo: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    color: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: '#8d5b4c'
    },
    grosor: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 4
    },
    distancia_metros: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    distancia_km: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    vertices: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    coordenadas: {
      type: DataTypes.JSONB,
      allowNull: false
    },
    estado: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: 'operativa'
    }
  },
  {
    sequelize,
    tableName: 'infrastructure_routes',
    timestamps: true
  }
);
