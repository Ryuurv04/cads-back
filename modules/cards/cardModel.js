// modules/cards/cardModel.js

const findBySlug = async (pool, slug) => {
  const [rows] = await pool.query(
    'SELECT * FROM cards_profiles WHERE slug = :slug LIMIT 1',
    { slug }
  );
  return rows[0] || null;
};

const findPublicBySlug = async (pool, slug) => {
  const [rows] = await pool.query(
    `SELECT 
      slug, nombre, segundo_nombre, apellido, segundo_apellido,
      empresa, titulo_puesto, telefono, direccion, correo, pagina_web,
      color_primario, color_secundario, is_activo
     FROM cards_profiles 
     WHERE slug = :slug LIMIT 1`,
    { slug }
  );
  return rows[0] || null;
};
const insertCard = async (pool, cardData) => {
  const sql = `
    INSERT INTO cards_profiles (
      slug,
      nombre,
      segundo_nombre,
      apellido,
      segundo_apellido,
      empresa,
      titulo_puesto,
      telefono,
      direccion,
      correo,
      pagina_web,
      color_primario,
      color_secundario
    ) VALUES (
      :slug,
      :nombre,
      :segundo_nombre,
      :apellido,
      :segundo_apellido,
      :empresa,
      :titulo_puesto,
      :telefono,
      :direccion,
      :correo,
      :pagina_web,
      :color_primario,
      :color_secundario
    )
  `;

  const [result] = await pool.query(sql, cardData);
  return result.insertId;
};

module.exports = {
  findBySlug,
  findPublicBySlug,
  insertCard,
};