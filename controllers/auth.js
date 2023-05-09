const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const keys = require('../config/keys')
const errorHandler = require('../utils/errorHandler')


module.exports.login = async function(req, res) {
  const candidate = await User.findOne({email: req.body.email})

  if (candidate) {
    // Перевірка паролю, користувач існує
    const passwordResult = bcrypt.compareSync(req.body.password, candidate.password)
    if (passwordResult) {
      // Генерація токену, паролі збігаються
      const token = jwt.sign({
        email: candidate.email,
        userId: candidate._id
      }, keys.jwt, {expiresIn: 60 * 60})

      res.status(200).json({
        token: `Bearer ${token}`
      })
    } else {
      // Паролі не збегаються
      res.status(401).json({
        message: 'Паролі не співпадають. Спробуйте знову.'
      })
    }
  } else {
    // Користувача немає, помилка.
    res.status(404).json({
      message: 'Користувач з даним email не існує.'
    })
  }
}


module.exports.register = async function(req, res) {
  // email password
  const candidate = await User.findOne({email: req.body.email})

  if (candidate) {
    // Користувач існує, потрібно відправити помилку.
    res.status(409).json({
      message: 'Даний email вже існує. Спробуйте інший'
    })
  } else {
    // Потрібно створити користувача.
    const salt = bcrypt.genSaltSync(10)
    const password = req.body.password
    const user = new User({
      email: req.body.email,
      password: bcrypt.hashSync(password, salt)
    })

    try {
      await user.save()
      res.status(201).json(user)
    } catch(e) {
      errorHandler(res, e)
    }

  }
}