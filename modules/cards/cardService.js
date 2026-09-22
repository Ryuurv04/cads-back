// modules/cards/cardService.js
const cardModel = require('./cardModel');

const createCard = async (pool, rawData) => {
  const {
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
  } = rawData;

  // 1. Validaciones básicas
  if (!slug || !nombre || !apellido || !telefono) {
    const error = new Error('Slug, nombre, apellido y teléfono son obligatorios.');
    error.statusCode = 400;
    throw error;
  }

  // 2. Normalización de slug
  const cleanSlug = slug
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');

  if (!cleanSlug) {
    const error = new Error('El slug proporcionado no es válido.');
    error.statusCode = 400;
    throw error;
  }

  // 3. Comprobar disponibilidad
  const existingCard = await cardModel.findBySlug(pool, cleanSlug);
  if (existingCard) {
    const error = new Error(`El slug "${cleanSlug}" ya está registrado.`);
    error.statusCode = 409;
    throw error;
  }

  // 4. Validar tamaño del Base64 (máx 3MB)
  if (logo_url && logo_url.startsWith('data:image')) {
    if (logo_url.length > 4.5 * 1024 * 1024) {
      const error = new Error('La imagen excede el límite máximo permitido de 3 MB.');
      error.statusCode = 400;
      throw error;
    }
  }

  // 5. Preparar objeto
  const cardData = {
    slug: cleanSlug,
    nombre: nombre.trim(),
    segundo_nombre: segundo_nombre?.trim() || null,
    apellido: apellido.trim(),
    segundo_apellido: segundo_apellido?.trim() || null,
    empresa: empresa?.trim() || null,
    titulo_puesto: titulo_puesto?.trim() || null,
    telefono: telefono.trim(),
    direccion: direccion?.trim() || null,
    correo: correo?.trim() || null,
    pagina_web: pagina_web?.trim() || null,
    color_primario: color_primario?.trim() || '#1E293B',
    color_secundario: color_secundario?.trim() || '#0284C7',
    logo_url: logo_url || null,
    instagram: instagram?.trim() || null,
    linkedin: linkedin?.trim() || null,
    tiktok: tiktok?.trim() || null,
    facebook: facebook?.trim() || null,
    twitter: twitter?.trim() || null,
  };

  const insertId = await cardModel.insertCard(pool, cardData);
  const cardDomain = process.env.CARD_DOMAIN || 'card.web-innova.site';

  return {
    id: insertId,
    slug: cleanSlug,
    url: `${cardDomain}/${cleanSlug}`,
  };
};

const getPublicCard = async (pool, slug) => {
  if (!slug) {
    const error = new Error('Slug no proporcionado.');
    error.statusCode = 400;
    throw error;
  }

  const card = await cardModel.findPublicBySlug(pool, slug.trim());
  if (!card || !card.is_activo) {
    const error = new Error('La tarjeta no existe o está inactiva.');
    error.statusCode = 404;
    throw error;
  }

  return card;
};

const generateVCardContent = async (pool, slug) => {
  const card = await getPublicCard(pool, slug);

  const nombreCompleto = [card.nombre, card.segundo_nombre, card.apellido, card.segundo_apellido]
    .filter(Boolean)
    .join(' ');

  const vCardLines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN;CHARSET=UTF-8:${nombreCompleto}`,
    `N;CHARSET=UTF-8:${card.apellido || ''};${card.nombre || ''};${card.segundo_nombre || ''};;`,
    card.empresa ? `ORG;CHARSET=UTF-8:${card.empresa}` : '',
    card.titulo_puesto ? `TITLE;CHARSET=UTF-8:${card.titulo_puesto}` : '',
    card.telefono ? `TEL;TYPE=CELL,VOICE:${card.telefono}` : '',
    card.correo ? `EMAIL;TYPE=WORK,INTERNET:${card.correo}` : '',
    card.pagina_web ? `URL:${card.pagina_web}` : '',
    card.direccion ? `ADR;TYPE=WORK;CHARSET=UTF-8:;;${card.direccion};;;;` : '',
    card.linkedin ? `X-SOCIALPROFILE;type=linkedin:${card.linkedin}` : '',
    card.instagram ? `X-SOCIALPROFILE;type=instagram:${card.instagram}` : '',
    card.twitter ? `X-SOCIALPROFILE;type=twitter:${card.twitter}` : '',
    'END:VCARD'
  ].filter(Boolean).join('\r\n');

  return {
    slug: card.slug,
    vCardString: vCardLines,
  };
};

module.exports = {
  createCard,
  getPublicCard,
  generateVCardContent,
};