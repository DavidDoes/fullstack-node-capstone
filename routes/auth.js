'use strict'

const express = require('express')
const jwt = require('jsonwebtoken')

const localAuth = require('../middleware/local-auth')
const jwtAuth = require('../middleware/jwt-auth')

const { JWT_SECRET, JWT_EXPIRY } = require('../config')

const router = express.Router()

// create new JWT
const createAuthToken = function (user) {
  return new Promise(function (resolve, reject) {
    jwt.sign({ user }, JWT_SECRET, { expiresIn: JWT_EXPIRY }, function (err, token) {
      if (err) {
        return reject(err)
      }
      resolve(token)
    })
  })
}

// user login, create new JWT, handle errors
router.post('/login', localAuth, (req, res, next) => {
  const user = req.user

  createAuthToken(user)
    .then((authToken) => {
      res.json({ authToken })
    })
		.catch(err => {
			if (err.code === 401) {
				err = new Error(
					'The username or password is incorrect. Please try again.'
				);
				err.status = 401;
      }
      next(err);
    });
})

// refresh JWT 
router.post('/refresh', jwtAuth, (req, res, next) => {
  createAuthToken(req.user)
    .then(authToken => {
      res.json({ authToken })
    })
    .catch(err => {
      next(err)
    })
})

module.exports = router