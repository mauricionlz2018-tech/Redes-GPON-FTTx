import path from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: path.resolve(__dirname, '../backend/.env') });

import { Sequelize } from 'sequelize';

const databaseUrl = process.env.DATABASE_URL;
console.log('DATABASE_URL present:', !!databaseUrl);

if (!databaseUrl) {
  console.error('DATABASE_URL not found in backend/.env');
  process.exit(1);
}

const sequelize = new Sequelize(databaseUrl, {
  dialect: 'postgres',
  logging: (msg) => console.log(`[SQL] ${msg}`),
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  }
});

async function main() {
  console.log('Testing connection to Neon PostgreSQL...');
  await sequelize.authenticate();
  console.log('Connected to Neon successfully!');

  // Crear tabla infrastructure_brazos si no existe
  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS infrastructure_brazos (
      id_brazo VARCHAR(100) PRIMARY KEY,
      codigo VARCHAR(50) NOT NULL,
      nombre VARCHAR(150) NOT NULL,
      longitud_metros FLOAT NOT NULL DEFAULT 1.2,
      tipo VARCHAR(100) NOT NULL DEFAULT 'brazo_extension_nap',
      material VARCHAR(100) DEFAULT 'Acero Galvanizado por Inmersión',
      id_nap_asociada VARCHAR(100),
      id_poste_asociado VARCHAR(100),
      coordenadas_gps JSONB NOT NULL,
      estado VARCHAR(50) NOT NULL DEFAULT 'instalado',
      descripcion VARCHAR(255),
      "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `);
  console.log('Table infrastructure_brazos verified in Neon!');

  // Consultar cajas NAP en Neon
  const [naps]: any = await sequelize.query(`SELECT id_nap, identificador, coordenadas_gps FROM nap_boxes ORDER BY identificador ASC;`);
  console.log(`Found ${naps.length} NAPs in Neon.`);

  const [existingBrazos]: any = await sequelize.query(`SELECT COUNT(*) as count FROM infrastructure_brazos;`);
  console.log('Existing brazos count:', existingBrazos[0].count);

  if (parseInt(existingBrazos[0].count, 10) === 0 && naps.length > 0) {
    console.log('Seeding brazos de extensión in Neon for NAP boxes...');
    for (let i = 0; i < naps.length; i++) {
      const nap = naps[i];
      let coords = nap.coordenadas_gps;
      if (typeof coords === 'string') {
        try { coords = JSON.parse(coords); } catch {}
      }
      if (!coords || !coords.lat) coords = { lat: 19.704, lng: -100.100 };

      const id_brazo = `brazo-${nap.identificador.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
      const codigo = `BR-${String(i + 1).padStart(2, '0')}`;
      const nombre = `Brazo de Extensión ${nap.identificador}`;
      const longitud = i % 2 === 0 ? 1.2 : 1.5;
      const material = 'Acero Galvanizado en Caliente (Norma CFE)';
      const desc = `Brazo de extensión y herraje para sujeción y despeje de caja ${nap.identificador}`;

      await sequelize.query(`
        INSERT INTO infrastructure_brazos (id_brazo, codigo, nombre, longitud_metros, tipo, material, id_nap_asociada, id_poste_asociado, coordenadas_gps, estado, descripcion, "createdAt", "updatedAt")
        VALUES (:id_brazo, :codigo, :nombre, :longitud, 'brazo_extension_nap', :material, :id_nap, :id_poste, :coords, 'instalado', :desc, NOW(), NOW())
        ON CONFLICT (id_brazo) DO NOTHING;
      `, {
        replacements: {
          id_brazo,
          codigo,
          nombre,
          longitud,
          material,
          id_nap: nap.id_nap,
          id_poste: `POSTE-${nap.identificador}`,
          coords: JSON.stringify(coords),
          desc
        }
      });
    }
    console.log('Seeded all brazos successfully in Neon!');
  }

  const [afterCount]: any = await sequelize.query(`SELECT COUNT(*) as count FROM infrastructure_brazos;`);
  console.log('Final count in Neon:', afterCount[0].count);

  await sequelize.close();
}

main().catch(err => {
  console.error('Migration error:', err);
  process.exit(1);
});
