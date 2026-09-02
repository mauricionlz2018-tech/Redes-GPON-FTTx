import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export type UserRole = 'Admin' | 'Soporte' | 'Tecnico';

export interface UserAttributes {
  id_usuario: string;
  nombre_completo: string;
  credencial_acceso: string;
  password_hash: string;
  rol: UserRole;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserCreationAttributes extends Optional<UserAttributes, 'id_usuario'> {}

export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public declare id_usuario: string;
  public declare nombre_completo: string;
  public declare credencial_acceso: string;
  public declare password_hash: string;
  public declare rol: UserRole;

  public declare readonly createdAt: Date;
  public declare readonly updatedAt: Date;
}

User.init(
  {
    id_usuario: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    nombre_completo: {
      type: DataTypes.STRING(150),
      allowNull: false
    },
    credencial_acceso: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true
    },
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    rol: {
      type: DataTypes.ENUM('Admin', 'Soporte', 'Tecnico'),
      allowNull: false,
      defaultValue: 'Tecnico'
    }
  },
  {
    sequelize,
    tableName: 'usuarios',
    timestamps: true
  }
);
