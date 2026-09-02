import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface NapBoxAttributes {
  id_nap: string;
  identificador: string;
  zona: string;
  id_puerto_pon: string;
  total_puertos: number;
  direccion_texto: string;
  coordenadas_gps: {
    lat: number;
    lng: number;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

export interface NapBoxCreationAttributes extends Optional<NapBoxAttributes, 'id_nap'> {}

export class NapBox extends Model<NapBoxAttributes, NapBoxCreationAttributes> implements NapBoxAttributes {
  public declare id_nap: string;
  public declare identificador: string;
  public declare zona: string;
  public declare id_puerto_pon: string;
  public declare total_puertos: number;
  public declare direccion_texto: string;
  public declare coordenadas_gps: {
    lat: number;
    lng: number;
  };
  public declare puertos?: any[];
  public declare puerto_pon?: any;

  public declare readonly createdAt: Date;
  public declare readonly updatedAt: Date;
}

NapBox.init(
  {
    id_nap: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    identificador: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    },
    zona: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    id_puerto_pon: {
      type: DataTypes.UUID,
      allowNull: false
    },
    total_puertos: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 16
    },
    direccion_texto: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    coordenadas_gps: {
      type: DataTypes.JSONB,
      allowNull: false
    }
  },
  {
    sequelize,
    tableName: 'nap_boxes',
    timestamps: true
  }
);
