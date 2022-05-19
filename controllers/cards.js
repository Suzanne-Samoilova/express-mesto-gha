const Card = require('../models/card');
const BadReqError = require("../errors/BadReqError");
const NotFoundError = require("../errors/NotFoundError");
const ForbiddenError = require("../errors/ForbiddenError");

// -----------------------------------------------------------------------------
// Получить все карточки
// -----------------------------------------------------------------------------
module.exports.getCards = (req, res, next) => {
  Card.find({})
    .then((cards) => {
      res.status(200).send(cards);
    })
    .catch(next);
};

// -----------------------------------------------------------------------------
// Создать новую карточку
// -----------------------------------------------------------------------------
module.exports.createCard = (req, res, next) => {
  const { name, link } = req.body;
  const owner = req.user._id;
  Card.create({ name, link, owner })
    .then((card) => {
      res.status(200).send(card);
    })
    .catch((err) => {
      if (err.name === 'CastError' || err.name === 'ValidationError') {
        // res.status(400).send({ message: 'Переданы некорректные данные' });
        next(new BadReqError('Переданы некорректные данные'));
        // return;
      } else {
        next(err);
      }
    });
};

// -----------------------------------------------------------------------------
// Удалить карточку
// -----------------------------------------------------------------------------
module.exports.deleteCard = (req, res, next) => {
  const id = req.user._id;
  Card.findById(req.params.cardId)
    .orFail(() => new NotFoundError('Карточка не найдена'))
    .then((card) => {
      if (!card.owner.equals(id)) {
        return next(new ForbiddenError('Нельзя удалять чужие карточки'));
      }
      return card.remove()
        .then(() => res.send({ message: 'Карточка удалена' }));
    })
    .catch(next);
};

// -----------------------------------------------------------------------------
// Поставить лайк
// -----------------------------------------------------------------------------
module.exports.likeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
    .orFail(() => new NotFoundError('Пользователь не найден'))
    .then((card) => res.status(200).send({ data: card }))
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadReqError('Переданы некорректные данные'));
      } else if (err.message === 'NotFound') {
        next(new NotFoundError('Карточка или пользователь не найдены'));
      } else {
        next(err);
      }
    });
};

// -----------------------------------------------------------------------------
// Удалить лайк
// -----------------------------------------------------------------------------
module.exports.dislikeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } },
    { new: true },
  )
    .orFail(() => new NotFoundError('Карточка не найдена'))
    .then((card) =>
      res.status(200).send({ data: card }))
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadReqError('Переданы некорректные данные'));
      } else if (err.message === 'NotFound') {
        next(new NotFoundError('Пользователь или карточка не найдены'));
      } else {
        next(err);
      }
    });
};
