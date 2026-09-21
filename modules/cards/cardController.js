// modules/cards/cardController.js
const cardService = require('./cardService');

const createCardController = (pool) => async (req, res, next) => {
  try {
    const newCard = await cardService.createCard(pool, req.body);
    return res.status(201).json({
      success: true,
      message: 'Tarjeta creada correctamente.',
      data: newCard,
    });
  } catch (error) {
    // Si el error tiene statusCode personalizado lo usa, sino delega al middleware global (500)
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

const getPublicCardController = (pool) => async (req, res, next) => {
  try {
    const { slug } = req.params;
    const card = await cardService.getPublicCard(pool, slug);
    return res.status(200).json({
      success: true,
      data: card,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

const downloadVCardController = (pool) => async (req, res, next) => {
  try {
    const { slug } = req.params;
    const { vCardString } = await cardService.generateVCardContent(pool, slug);

    res.setHeader('Content-Type', 'text/vcard; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${slug}.vcf"`);
    return res.status(200).send(vCardString);
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};
module.exports = {
  createCardController,
    getPublicCardController,
    downloadVCardController
};