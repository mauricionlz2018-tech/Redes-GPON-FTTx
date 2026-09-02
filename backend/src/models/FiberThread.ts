import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export type FiberThreadStatus = 'Activo' | 'Muerto' | 'Reserva';

export interface FiberThreadAttributes {
  id_hilo: string;
  numero_hilo: number;
  estado: FiberThreadStatus;
  id_odf_origen: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface FiberThreadCreationAttributes extends Optional<FiberThreadAttributes, 'id_hilo'> {}

export class FiberThread extends Model<FiberThreadAttributes, FiberThreadCreationAttributes> implements FiberThreadAttributes {
  public declare id_hilo: string;
  public declare numero_hilo: number;
  public declare estado: FiberThreadStatus;
  public declare id_odf_origen: string;

  public declare readonly createdAt: Date;
  public declare readonly updatedAt: Date;
}

FiberThread.init(
  {
    id_hilo: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    numero_hilo: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    estado: {
      type: DataTypes.ENUM('Activo', 'Muerto', 'Reserva'),
      allowNull: false,
      defaultValue: 'Reserva'
    },
    id_odf_origen: {
      type: DataTypes.UUID,
      allowNull: false
    }
  },
  {
    sequelize,
    tableName: 'fiber_threads',
    timestamps: true
  }
);
