const express = require('express');
const cardController = require('../modules/cards/cardController');

module.exports = (pool) => {
    const router = express.Router(); 

    router.post('/', cardController.createCardController(pool));
    router.get('/public/:slug', cardController.getPublicCardController(pool));
  router.get('/public/:slug/vcard', cardController.downloadVCardController(pool));return router; 
};