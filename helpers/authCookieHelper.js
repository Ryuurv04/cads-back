const esProduccion = process.env.NODE_ENV === 'production';

// Duración de la sesión. Es "deslizante": authMiddleware renueva el token
// en cada petición autenticada, así que esto es en realidad el tiempo de
// INACTIVIDAD máximo permitido, no un límite fijo desde el login.
const SESION_DURACION_SEGUNDOS = 15 * 60;

/**
 * Opciones de la cookie httpOnly que transporta el JWT de sesión. En
 * producción usa SameSite=None + Secure porque frontend y backend viven en
 * dominios distintos (petición cross-site); en desarrollo usa SameSite=Lax
 * porque localhost no lo necesita.
 * @returns {Object} Opciones para res.cookie() / res.clearCookie()
 */
const obtenerOpcionesCookieToken = () => ({
  httpOnly: true,
  secure: esProduccion,
  sameSite: esProduccion ? 'none' : 'lax',
  maxAge: SESION_DURACION_SEGUNDOS * 1000,
});

module.exports = { obtenerOpcionesCookieToken, SESION_DURACION_SEGUNDOS };
