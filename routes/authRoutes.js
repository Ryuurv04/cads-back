const express = require('express');
const authController = require('../modules/auth/authController');

module.exports = (pool) => {
    const router = express.Router(); 
    router.post('/login', authController.login(pool));
    router.post('/logout', authController.logout());
    router.get('/me', authController.getMe(pool));
    router.get('/permisos', authController.getPermissions(pool));
    return router; 
};