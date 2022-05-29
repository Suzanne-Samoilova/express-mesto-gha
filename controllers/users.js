const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user');
const NotFoundError = require('../errors/NotFoundError');
const BadReqError = require('../errors/BadReqError');
const ConflictError = require('../errors/ConflictError');
const AuthorizationError = require('../errors/AuthorizationError');

// -----------------------------------------------------------------------------
// Получить всех пользователей
// -----------------------------------------------------------------------------
module.exports.getUsers = (req, res, next) => {
  User.find({})
    .then((users) => {
      res.status(200).send({ users });
    })
    .catch(next);
};

// -----------------------------------------------------------------------------
// Получить конкретного пользователя
// -----------------------------------------------------------------------------
module.exports.getUserById = (req, res, next) => {
  User.findById(req.params.userId)
    .orFail(() => new NotFoundError('Пользователь не найден'))
    .then((user) => {
      res.status(200).send({ user });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadReqError('Переданы некорректные данные'));
      } else {
        next(err);
      }
    });
};

// -----------------------------------------------------------------------------
// Создать нового пользователя
// -----------------------------------------------------------------------------
module.exports.createUser = (req, res, next) => {
  // хешируем пароль
  bcrypt.hash(req.body.password, 10)
    .then((hash) => User.create({
      email: req.body.email,
      password: hash, // записываем хеш в базу
      name: req.body.name,
      about: req.body.about,
      avatar: req.body.avatar,
    }))
    .then((user) => {
      res.status(200).send({
        email: user.email,
        name: user.name,
        about: user.about,
        avatar: user.avatar,
      });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadReqError('Переданы некорректные данные'));
      } else if (err.code === 11000) {
        next(new ConflictError(`Пользователь с таким email ${req.body.email} уже существует`));
      } else {
        next(err);
      }
    });
};

// -----------------------------------------------------------------------------
// Получить текущего пользователя
// -----------------------------------------------------------------------------
module.exports.getCurrentUser = (req, res, next) => {
  User.findById(req.user._id)
    .orFail(() => new NotFoundError('Пользователь не найден'))
    .then((user) => {
      res.status(200).send({ user });
    })
    .catch((err) => {
      if (err.message === 'NotFound') {
        next(new NotFoundError('Пользователь или карточка не найдены'));
      } else {
        next(err);
      }
    });
};

// -----------------------------------------------------------------------------
// Обновить профиль
// -----------------------------------------------------------------------------
module.exports.updateProfile = (req, res, next) => {
  const { name, about } = req.body;
  User.findByIdAndUpdate(
    req.user._id,
    { name, about },
    { new: true, runValidators: true, upsert: false },
  )
    .then((user) => {
      if (user) {
        res.status(200).send({ user });
        return;
      }
      next(new NotFoundError('Пользователь не найден'));
    })
    .catch((err) => {
      if (err.name === 'CastError' || err.name === 'ValidationError') {
        next(new BadReqError('Переданы некорректные данные'));
      }
    });
};

// -----------------------------------------------------------------------------
// Обновить аватар
// -----------------------------------------------------------------------------
module.exports.updateAvatar = (req, res, next) => {
  const { avatar } = req.body;
  User.findByIdAndUpdate(
    req.user._id,
    { avatar },
    { new: true, runValidators: true },
  )
    .then((user) => {
      res.status(200).send(user);
    })
    .catch((err) => {
      if (err.name === 'CastError' || err.name === 'ValidationError') {
        next(new BadReqError('Переданы некорректные данные'));
      } else {
        next(err);
      }
    });
};

// -----------------------------------------------------------------------------
// Аутентификация
// -----------------------------------------------------------------------------
module.exports.login = (req, res, next) => {
  const { email, password } = req.body;

  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign(
        { _id: user._id },
        'some-secret-key',
        { expiresIn: '7d' },
      );
      // токен
      res
        .cookie('jwt', token, {
          maxAge: 604800,
          httpOnly: true,
          sameSite: true,
        })
        .send({ message: 'Авторизация прошла успешно' });
    })
    .catch(() => {
      next(new AuthorizationError('Неверные почта или пароль'));
    });
};
