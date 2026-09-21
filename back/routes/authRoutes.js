const express = require('express');
const authController = require('../modules/sigdc/authController');
const authMiddleware = require('../middlewares/authMiddleware');
const checkPermission = require('../middlewares/checkPermission');

module.exports = (pool) => {
    const router = express.Router(); 
    router.post('/login', authController.login(pool));
    router.post('/logout', authController.logout());
    router.get('/me',authMiddleware, authController.getMe(pool));
    router.get('/permisos',authMiddleware, authController.getPermissions(pool));
    return router; 
};