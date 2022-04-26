const Card = require('../models/card');

// ---------------------------------------------------------------------------------------------------------
// Получить все карточки
// ---------------------------------------------------------------------------------------------------------
const getCards = (req, res, next) => {
  Card.find ({})
    .then((cards) => {
      if (cards.length === 0) {
        res.status(404).send({ message: "Нет карточек" });
        return;
      }
      res.status(200).send(cards);
    })
    .catch((err) => {
      res.status(500).send({ message: `Внутренняя ошибка сервера: ${err}` });
      next(err);
    })
    .catch(next);
};

// ---------------------------------------------------------------------------------------------------------
// Создать новую карточку
// ---------------------------------------------------------------------------------------------------------
const createCard = (req, res, next) => {
  console.log(req.user._id);
  const { name, link } = req.body;
  const owner = req.user._id;
  Card.create ({ name, link, owner })
    .then((card) => {
        res.status(200).send(card);
      })
    .catch((err) => {
      if (err.name === 'CastError' || err.name === 'ValidationError') {
        res.status(400).send({ message: `Переданы некорректные данные` });
      }
      res.status(500).send({ message: `Внутренняя ошибка сервера: ${err}` });
      next(err);
    })
    .catch(next);
};

// ---------------------------------------------------------------------------------------------------------
// Удалить карточку
// ---------------------------------------------------------------------------------------------------------
const deleteCard = (req, res, next) => {
  const id = req.params.cardId;
  Card.findByIdAndRemove (id)


    .then((card) => {
      if (!card) {
        res.status(404).send({ message: "Карточка не найдена" });
        return;
      }
        Card.findByIdAndDelete(req.params.cardId)
          .then((deletedCard) => {
            res.status(200).send(deletedCard);
          })
          .catch(next);
    })
    .catch(next);
};

// ---------------------------------------------------------------------------------------------------------
// Поставить лайк
// ---------------------------------------------------------------------------------------------------------
const likeCard = (req, res, next) => {
  Card.findByIdAndUpdate (
    req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
    .then((card) => {
      if (!card) {
        res.status(404).send({ message: `Карточка не найдена` });
        return;
      }
      res.status(200).send(card);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        res.status(400).send({ message: `Переданы некорректные данные` });
      }
      next(err);
    })
    .catch(next);
};

// ---------------------------------------------------------------------------------------------------------
// Удалить лайк
// ---------------------------------------------------------------------------------------------------------
const dislikeCard = (req, res, next) => {
  Card.findByIdAndUpdate (
    req.params.cardId,
    { $pull: { likes: req.user._id } },
    { new: true },
  )
    .then((card) => {
      if (!card) {
        res.status(404).send({ message: `Карточка не найдена` });
        return;
      }
      res.status(200).send(card);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        res.status(400).send({ message: `Переданы некорректные данные` });
      }
      next(err);
    })
    .catch(next);
};


module.exports = {
  getCards,
  createCard,
  deleteCard,
  likeCard,
  dislikeCard,
};
