const express = require('express');
const https = require('https');
const path = require('path');
const fs = require('fs');

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');

const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');

//импорт модели user для обращения к бд через mongoose
const User = require('./models/user');

// require('./app/index');

const { port, dbURL, dbOptions, secretKey } = require('./config/config');

mongoose.connect(dbURL,dbOptions);
const db = mongoose.connection;
db.on('error', error => console.warn(error));
db.once('open', () => {
  console.log('Connection Succeeded')
});

const app = express();

// настраиваем модуль
app.use(morgan('combined'));
// отключение политики CORS
app.use(cors());
// обрабатываем POST запросы специальный middleware — bodyParser.
app.use(bodyParser.json());

app.use(passport.initialize());
require('./middleware/passport')(passport);

//
// const sslServer = https.createServer({
//   key: fs.readFileSync(path.join(__dirname, 'cert', 'key.pem')),
//   cert: fs.readFileSync(path.join(__dirname, 'cert', 'cert.pem')),
// }, app);
//
//
// sslServer.listen(port, function (err) {
//   if (err) {
//     return console.log('something bad happened', err)
//   }
//
//   console.log('node express work on ' + port);
// });

app.listen(port, function (err) {
  if (err) {
    return console.log('something bad happened', err)
  }

  console.log('node express work on ' + port);
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const candidate = await User.findOne({email});
  const sendError = () => {
    return res
      .status(401)
      .send({
        message: 'Неверный логин/пароль'
      })
  };
  if(candidate) {
    const passResult = bcrypt.compareSync(password, candidate.password);
    if(passResult) {
      const token = jwt.sign({
          email: candidate.email,
          userId: candidate._id,
          admin: candidate.admin,
        },
        secretKey,
        {expiresIn: 60 * 60 });

      res.status(200).send({
        token: `Bearer ${token}`,
        success: true,
        message: 'Авторизация прошла успешно',
      })
    } else {
      sendError();
    }
  } else {
    sendError();
  }
});

app.post('/register', async (req, res) => {
  const { email, password, name, surname, phone } = req.body;
  console.log(email, password, name, surname, phone);
  const candidate = await User.findOne({email});
  if(candidate) {
    res.
    // status(409).
    send({
      success: false,
      message: 'Пользователь с данным email уже существует',
    })
  } else {
    const salt = bcrypt.genSaltSync(10);
    const pass = bcrypt.hashSync(password, salt);
    console.log('pass: ',pass);
    console.log('salt: ',salt);
    const user = new User({
      email,
      password: pass,
      name,
      surname,
      phone
    });
    try {
      await user.save();
      res.
      status(201).
      send({
        success: true,
        message: 'User saved successfully',
      })
    } catch(e) {
      console.log(e);
//обработать ошибку
    }
  }
});

app.get('/user_data',
  (req, res, next) => {
    return passport.authenticate('jwt-userData', {session: false}, async (err, user, info) => {
      if(err) {

        return next(err);
      }

      console.log('136 info', info);
      if(!user) {
        return res.send({
          success: false,
          userData: null
        })
      } else {

        return res.send({
          success: true,
          userData: user
        })
      }
    })(req, res, next);
  });
