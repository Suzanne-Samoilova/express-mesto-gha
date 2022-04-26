const notFountRouter = require('express').Router();

notFountRouter.all('*', (req, res) => {
  res.status(404).send({ message: `Страница по адресу ${req.baseUrl} не найдена` });
});

module.exports = notFountRouter;
