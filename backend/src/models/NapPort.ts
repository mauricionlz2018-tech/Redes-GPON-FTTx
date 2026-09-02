import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export type NapPortStatus = 'Libre' | 'Ocupado' | 'Dañado' | 'Reservado' | 'En Mantenimiento';

export interface NapPortAttributes {
  id_puerto: string;
  id_nap: string;
  indice_puerto: number;
  estado: NapPortStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface NapPortCreationAttributes extends Optional<NapPortAttributes, 'id_puerto'> {}

export class NapPort extends Model<NapPortAttributes, NapPortCreationAttributes> implements NapPortAttributes {
  public declare id_puerto: string;
  public declare id_nap: string;
  public declare indice_puerto: number;
  public declare estado: NapPortStatus;
  public declare cliente?: any;
  public declare caja_nap?: any;

  public declare readonly createdAt: Date;
  public declare readonly updatedAt: Date;
}

NapPort.init(
  {
    id_puerto: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    id_nap: {
      type: DataTypes.UUID,
      allowNull: false
    },
    indice_puerto: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    estado: {
      type: DataTypes.ENUM('Libre', 'Ocupado', 'Dañado', 'Reservado', 'En Mantenimiento'),
      allowNull: false,
      defaultValue: 'Libre'
    }
  },
  {
    sequelize,
    tableName: 'nap_ports',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['id_nap', 'indice_puerto']
      }
    ]
  }
);
