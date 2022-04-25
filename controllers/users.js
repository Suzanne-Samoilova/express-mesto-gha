const User = require('../models/user');

// ---------------------------------------------------------------------------------------------------------
// Получить всех пользователей
// ---------------------------------------------------------------------------------------------------------
const getUsers = (req, res) => {
  User.find({})
    .then((users) => {
      if (users.length === 0) {
        res.status(404)
          .send({ message: "Пользователи не найдены" });
        return;
      }
      res.status(200)
        .send(users);
    })
    .catch((err) => {
      res.status(500)
        .send({ message: `Внутренняя ошибка сервера: ${err}` });
    })
};

// ---------------------------------------------------------------------------------------------------------
// Получить конкретного пользователя
// ---------------------------------------------------------------------------------------------------------
const getUserById = (req, res) => {
  User.findById(req.params.userId)
    .then((user) => {
      if (!user) {
        res.status(404)
          .send({ message: `Нет пользователя с таким id` });
        return;
      }
      res.status(200)
        .send(user);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        res.status(400)
          .send({ message: `Передан некорректный id: ${err}` });
        return;
      }
      res.status(500)
        .send({ message: `Внутренняя ошибка сервера: ${err}` });
    })
};

// ---------------------------------------------------------------------------------------------------------
// Создать нового пользователя
// ---------------------------------------------------------------------------------------------------------
const createUser = (req, res) => {
  const { name, about, avatar } = req.body;
  User.create({ name, about, avatar })
    .then((user) => {
      res.status(200)
        .send(user);
    })
    .catch((err) => {
      res.status(500)
        .send({ message: `Внутренняя ошибка сервера: ${err}` });
    });
};

module.exports = {
  getUsers,
  getUserById,
  createUser
};
