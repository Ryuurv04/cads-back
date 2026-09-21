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
  } = rawData;

  // 1. Validaciones básicas obligatorias
  if (!slug || !nombre || !apellido || !telefono) {
    const error = new Error('Slug, nombre, apellido y teléfono son requeridos.');
    error.statusCode = 400;
    throw error;
  }

  // 2. Normalización del slug (minúsculas, sin espacios ni caracteres especiales)
  const cleanSlug = slug
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');

  if (!cleanSlug) {
    const error = new Error('El slug proporcionado no es válido.');
    error.statusCode = 400;
    throw error;
  }

  // 3. Validar disponibilidad de slug único
  const existingCard = await cardModel.findBySlug(pool, cleanSlug);
  if (existingCard) {
    const error = new Error(`El slug "${cleanSlug}" ya está en uso.`);
    error.statusCode = 409;
    throw error;
  }

  // 4. Preparar payload con fallbacks para valores opcionales
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
  };

  const insertId = await cardModel.insertCard(pool, cardData);

  return {
    id: insertId,
    slug: cleanSlug,
    url: `card.dominio.com/${cleanSlug}`,
  };
};

const getPublicCard = async (pool, slug) => {
  if (!slug) {
    const error = new Error('Slug no proporcionado.');
    error.statusCode = 400;
    throw error;
  }

  const card = await cardModel.findPublicBySlug(pool, slug);
  if (!card || !card.is_activo) {
    const error = new Error('Tarjeta no encontrada o inactiva.');
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