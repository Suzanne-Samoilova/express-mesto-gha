const User = require('../models/user');

// -----------------------------------------------------------------------------
// Получить всех пользователей
// -----------------------------------------------------------------------------
const getUsers = (req, res, next) => {
  User.find ({})
    .then((users) => {
      if (users.length === 0) {
        res.status(404).send({ message: "Пользователи не найдены" });
        return;
      }
      res.status(200).send(users);
    })
    .catch((err) => {
      res.status(500).send({ message: `Внутренняя ошибка сервера: ${err}` });
      next(err);
    })
    .catch(next);
};

// -----------------------------------------------------------------------------
// Получить конкретного пользователя
// -----------------------------------------------------------------------------
const getUserById = (req, res, next) => {
  User.findById (req.params.userId)
    .then((user) => {
      if (!user) {
        res.status(404).send({ message: `Пользователь не найден` });
        return;
      }
      res.status(200).send(user);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        res.status(400).send({ message: `Переданы некорректные данные` });
        return;
      }
      res.status(500).send({ message: `Внутренняя ошибка сервера: ${err}` });
      next(err);
    })
    .catch(next);
};

// -----------------------------------------------------------------------------
// Создать нового пользователя
// -----------------------------------------------------------------------------
const createUser = (req, res, next) => {
  const { name, about, avatar } = req.body;
  User.create ({ name, about, avatar })
    .then((user) => {
      res.status(200).send(user);
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

// -----------------------------------------------------------------------------
// Обновить профиль
// -----------------------------------------------------------------------------
const updateProfile = (req, res, next) => {
  const { name, about } = req.body;
  User.findByIdAndUpdate (
    req.user._id,
    { name, about },
    { new: true, runValidators: true }
  )
    .then((user) => {
      if (user) {
        res.status(200).send(user);
      } else {
        res.status(404).send({ message: `Пользователь не найден` });
      }
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

// -----------------------------------------------------------------------------
// Обновить аватар
// -----------------------------------------------------------------------------
const updateAvatar = (req, res, next) => {
  const { avatar } = req.body;
  User.findByIdAndUpdate (
    req.user._id,
    { avatar },
    { new: true },
  )
    .then((user) => {
      res.status(200).send(user);
    })
    .catch((err) => {
      if (err.name === 'CastError' || err.name === 'ValidationError') {
        res.status(400).send({ message: `Переданы некорректные данные` });
      }
      next(err);
    })
    .catch(next);
};


module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateProfile,
  updateAvatar,
};
