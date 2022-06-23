const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const { errors } = require('celebrate');
require('dotenv').config();
const cors = require('cors');

const usersRoutes = require('./routes/users');
const cardsRoutes = require('./routes/cards');
const NotFoundError = require('./errors/NotFoundError');
const InternalServerError = require('./errors/InternalServerError');
const auth = require('./middlewares/auth');
const { login, createUser } = require('./controllers/users');
const { validateUser, validateLogin } = require('./middlewares/validations');
const { requestLogger, errorLogger } = require('./middlewares/logger');

const { PORT = 3000 } = process.env;
const app = express();


app.use(cookieParser());
app.use(express.json());

mongoose.connect('mongodb://localhost:27017/mestodb', {
  useNewUrlParser: true,
});

app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(requestLogger); // подкл логгер запросов

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

app.use(errorLogger); // логирование ошибок winston
app.use(errors()); // обработчик ошибок celebrate
app.use(InternalServerError); // централизованный обработчик

app.listen(PORT, () => {});

// обновить сертификат 1 раз в 3 месяца (ближ 20.09.2022)
// sudo certbot renew --pre-hook "service nginx stop" --post-hook "service nginx start"
