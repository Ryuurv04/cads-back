// modules/cards/cardModel.js

/**
 * Busca por slug para validar unicidad
 */
const findBySlug = async (pool, slug) => {
  const [rows] = await pool.query(
    'SELECT cod_profile, slug, is_activo FROM cards_profiles WHERE slug = :slug LIMIT 1',
    { slug }
  );
  return rows[0] || null;
};

/**
 * Obtiene todos los datos para la vista pública y el archivo vCard
 */
const findPublicBySlug = async (pool, slug) => {
  const sql = `
    SELECT 
      cod_profile,
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
      color_secundario,
      logo_url,
      instagram,
      linkedin,
      tiktok,
      facebook,
      twitter,
      is_activo
    FROM cards_profiles 
    WHERE slug = :slug 
    LIMIT 1
  `;
  const [rows] = await pool.query(sql, { slug });
  return rows[0] || null;
};

/**
 * Inserta la tarjeta con redes sociales y la imagen en Base64
 */
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
      color_secundario,
      logo_url,
      instagram,
      linkedin,
      tiktok,
      facebook,
      twitter
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
      :color_secundario,
      :logo_url,
      :instagram,
      :linkedin,
      :tiktok,
      :facebook,
      :twitter
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