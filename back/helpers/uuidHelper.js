const { v4: uuidv4 } = require('uuid');

/**
 * Genera un UUID v4 único para usar como identificador público de un registro
 * @returns {string} UUID v4 en formato string (ej. '550e8400-e29b-41d4-a716-446655440000')
 */
const generarUUID = () => uuidv4();

module.exports = { generarUUID };
