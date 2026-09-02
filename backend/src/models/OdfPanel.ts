import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface GpsCoordinates {
  lat: number;
  lng: number;
}

export interface OdfPanelAttributes {
  id_odf: string;
  nombre: string;
  ubicacion_central: string;
  coordenadas_gps: GpsCoordinates;
  capacidad_hilos: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface OdfPanelCreationAttributes extends Optional<OdfPanelAttributes, 'id_odf'> {}

export class OdfPanel extends Model<OdfPanelAttributes, OdfPanelCreationAttributes> implements OdfPanelAttributes {
  public declare id_odf: string;
  public declare nombre: string;
  public declare ubicacion_central: string;
  public declare coordenadas_gps: GpsCoordinates;
  public declare capacidad_hilos: number;

  public declare readonly createdAt: Date;
  public declare readonly updatedAt: Date;
}

OdfPanel.init(
  {
    id_odf: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    ubicacion_central: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    coordenadas_gps: {
      type: DataTypes.JSONB,
      allowNull: false
    },
    capacidad_hilos: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 48
    }
  },
  {
    sequelize,
    tableName: 'odf_panels',
    timestamps: true
  }
);
