import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface PonPortAttributes {
  id_puerto_pon: string;
  id_odf: string;
  numero_slot: number;
  numero_puerto: number;
  capacidad_maxima: number;
  potencia_tx_dbm: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PonPortCreationAttributes extends Optional<PonPortAttributes, 'id_puerto_pon'> {}

export class PonPort extends Model<PonPortAttributes, PonPortCreationAttributes> implements PonPortAttributes {
  public declare id_puerto_pon: string;
  public declare id_odf: string;
  public declare numero_slot: number;
  public declare numero_puerto: number;
  public declare capacidad_maxima: number;
  public declare potencia_tx_dbm: number;

  public declare readonly createdAt: Date;
  public declare readonly updatedAt: Date;
}

PonPort.init(
  {
    id_puerto_pon: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    id_odf: {
      type: DataTypes.UUID,
      allowNull: false
    },
    numero_slot: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    numero_puerto: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    capacidad_maxima: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 64
    },
    potencia_tx_dbm: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 4.5
    }
  },
  {
    sequelize,
    tableName: 'pon_ports',
    timestamps: true
  }
);
