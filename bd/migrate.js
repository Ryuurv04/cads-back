const path = require('path');
const mysql = require('mysql2/promise');
const Postgrator = require('postgrator').default;

/**
 * Aplica las migraciones pendientes de bd/migrations/ contra la base de datos
 * configurada en las variables de entorno. Usa una conexión propia y separada
 * del pool principal de la app porque necesita 'multipleStatements: true'
 * (los archivos .sql traen varios CREATE TABLE / INSERT en un solo script) —
 * ese flag no se activa en el pool general para no ampliar la superficie de
 * inyección SQL en el resto de la aplicación.
 * @returns {Promise<Array>} Lista de migraciones aplicadas (vacía si ya estaba al día)
 */
const migrate = async () => {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    port: process.env.DB_PORT,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    multipleStatements: true,
  });

  try {
    const postgrator = new Postgrator({
      // El glob interno solo entiende '/', por eso se normaliza el path de
      // Windows (que usa '\') antes de pasarlo — si no, no encuentra archivos.
      migrationPattern: path.join(__dirname, 'migrations', '*').split(path.sep).join('/'),
      driver: 'mysql',
      database: process.env.DB_NAME,
      schemaTable: 'schemaversion',
      execQuery: async (query) => {
        const [rows] = await connection.query(query);
        return { rows };
      },
      execSqlScript: async (sqlScript) => {
        await connection.query(sqlScript);
      },
    });

    const appliedMigrations = await postgrator.migrate();

    if (appliedMigrations.length === 0) {
      console.log('BD ya está en la última versión de esquema.');
    } else {
      console.log(
        `Migraciones aplicadas: ${appliedMigrations.map((m) => m.filename).join(', ')}`
      );
    }

    return appliedMigrations;
  } finally {
    await connection.end();
  }
};

module.exports = { migrate };