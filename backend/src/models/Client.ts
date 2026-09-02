import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export type OntBrand = 'ZTE' | 'V-SOL' | 'TP-Link' | 'Huawei';

export interface ClientAttributes {
  id_cliente: string;
  numero_cliente: string;
  nombre_completo: string;
  id_puerto_nap: string;
  marca_ont: OntBrand;
  direccion: string;
  ont_mac: string;
  potencia_rx_estimada: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ClientCreationAttributes extends Optional<ClientAttributes, 'id_cliente'> {}

export class Client extends Model<ClientAttributes, ClientCreationAttributes> implements ClientAttributes {
  public declare id_cliente: string;
  public declare numero_cliente: string;
  public declare nombre_completo: string;
  public declare id_puerto_nap: string;
  public declare marca_ont: OntBrand;
  public declare direccion: string;
  public declare ont_mac: string;
  public declare potencia_rx_estimada: number;

  public declare readonly createdAt: Date;
  public declare readonly updatedAt: Date;
}

Client.init(
  {
    id_cliente: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    numero_cliente: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    },
    nombre_completo: {
      type: DataTypes.STRING(150),
      allowNull: false
    },
    id_puerto_nap: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true // Relación 1:1 estricta con el puerto NAP
    },
    marca_ont: {
      type: DataTypes.ENUM('ZTE', 'V-SOL', 'TP-Link', 'Huawei'),
      allowNull: false,
      defaultValue: 'ZTE'
    },
    direccion: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    ont_mac: {
      type: DataTypes.STRING(17),
      allowNull: false
    },
    potencia_rx_estimada: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: -19.5
    }
  },
  {
    sequelize,
    tableName: 'clients',
    timestamps: true
  }
);
