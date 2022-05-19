const cardsRouter = require('express').Router();
const {
  getCards,
  createCard,
  deleteCard,
  likeCard,
  dislikeCard,
} = require('../controllers/cards');
const {
  validateCard,
  validateCardId,
} = require('../middlewares/validations');

cardsRouter.get('/cards', getCards);
cardsRouter.post('/cards', validateCard, createCard);
cardsRouter.delete('/cards/:cardId', validateCardId, deleteCard);
cardsRouter.put('/cards/:cardId/likes', validateCardId, likeCard);
cardsRouter.delete('/cards/:cardId/likes', validateCardId, dislikeCard);

module.exports = cardsRouter;
