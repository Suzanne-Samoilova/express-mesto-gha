const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const { errors } = require('celebrate');

const usersRoutes = require('./routes/users');
const cardsRoutes = require('./routes/cards');
const NotFoundError = require('./errors/NotFoundError');
const InternalServerError = require('./errors/InternalServerError');
const { login, createUser } = require('./controllers/users');
const auth = require('./middlewares/auth');
const { validateUser, validateLogin } = require('./middlewares/validations');

const { PORT = 3000 } = process.env;
const app = express();
app.use(cookieParser());
app.use(express.json());

mongoose.connect('mongodb://localhost:27017/mestodb', {
  useNewUrlParser: true,
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/crash-test', () => {
  setTimeout(() => {
    throw new Error('Сервер сейчас упадёт');
  }, 0);
});

// роуты, не требующие авторизации
app.post('/signin', validateLogin, login);
app.post('/signup', validateUser, createUser);

// все роуты ниже этой строки будут защищены
app.use(auth);

app.use('/', usersRoutes);
app.use('/', cardsRoutes);
app.all('*', () => {
  throw new NotFoundError('Запрашиваемая страница не найдена');
});

app.use(errors());
app.use(InternalServerError);

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
