// /backend/middleware/auth.js

const jwt = require('jsonwebtoken');
require('dotenv').config(); // Asegúrate de cargar las variables de entorno
const { obtenerOpcionesCookieToken, SESION_DURACION_SEGUNDOS } = require('../helpers/authCookieHelper');
const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Middleware para verificar el JWT y adjuntar los datos del usuario (Tenant ID y Rol) al request.
 * @param {object} req - Objeto de solicitud de Express
 * @param {object} res - Objeto de respuesta de Express
 * @param {function} next - Función para pasar el control al siguiente middleware/controlador
 */
const authMiddleware = (req, res, next) => {
  const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Acceso no autorizado. Token requerido.' });
  }

  try {
    const { iat, exp, ...payload } = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = payload; // el payload del token queda disponible en req.usuario

    // Sesión deslizante: cada petición autenticada renueva el plazo, así la
    // sesión no expira mientras el usuario sigue activo — solo si se queda
    // inactivo más de SESION_DURACION_SEGUNDOS.
    const tokenRenovado = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: SESION_DURACION_SEGUNDOS });
    res.cookie('token', tokenRenovado, obtenerOpcionesCookieToken());

    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido o expirado.' });
  }
};

module.exports = authMiddleware;