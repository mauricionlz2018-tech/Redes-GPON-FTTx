import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const dbHost = process.env.DB_HOST || 'localhost';
const dbPort = parseInt(process.env.DB_PORT || '5432', 10);
const dbUser = process.env.DB_USER || 'gpon_admin';
const dbPassword = process.env.DB_PASSWORD || 'gpon_secret';
const dbName = process.env.DB_NAME || 'gpon_inventory';

export const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
  host: dbHost,
  port: dbPort,
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'development' ? (msg) => console.log(`[SQL] ${msg}`) : false,
  pool: {
    max: 20,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  dialectOptions: {
    // Si se despliega en cloud (RDS/Supabase/Render) con SSL
    ...(process.env.DB_SSL === 'true' ? {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    } : {})
  }
});

