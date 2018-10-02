'use strict'

const express = require('express')
const Challenge = require('../models/challenges')

const router = express.Router()

router.get('/', (req, res) => {
  Challenge
    .find()
    .then(challenge => {
      res.json({
        challenge: challenge.map(
          (challenge) => challenge.serialize())
      })
    })
    .catch(
      err => {
        console.error(err);
        res.status(500).json({message: 'Internal server error'});
    })
  })

router.post('/', function (req, res) {
  const requiredFields = ['title']
  const missingField = requiredFields.find(field => !(field in req.body))

  if (missingField) {
    console.log('hello from if statement')
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: 'Missing field',
      location: missingField
    })
  }
  const stringFields = ['title']
  const nonStringField = stringFields.find(
    field => field in req.body && typeof req.body[field] !== 'string'
  )
  if (nonStringField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidatioNError',
      message: 'Incorrect field type: expected string',
      location: nonStringField
    })
  }

  console.log('>>>>>>' + req.user)
  let { title = '' } = req.body
  let { creator } = req.user

  return Challenge.create({
      title, creator // add thumbnail when photo is added
    })
    .then(challenge => {
      return res.status(201).json(challenge.serialize())
    })
})

router.put('/:id', (req, res) => {
  if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
    res.status(400).json({
      error: 'Request path id and request body id values must match'
    })
  }

  const updated = {}
  const updateableFields = ['title']
  updateableFields.forEach(field => {
    if (field in req.body) {
      updated[field] = req.body[field]
    }
  })

  Challenge
    .findOne({
      title: updated.title
    })
  Challenge
    .findByIdAndUpdate(req.params.id, {
      $set: updated
    }, {
      new: true
    })
    .then(updatedChallenge => {
      res.status(200).json({
        id: updatedChallenge.id,
        title: updatedChallenge.title,
      })
    })
    .catch(err => res.status(500).json({
      message: err
    }))
})

router.delete('/:id', (req, res) => {
  Challenge
    .remove({
      Challenge: req.params.id
    })
    .then(() => {
      Challenge
        .findByIdAndRemove(req.params.id)
        .then(() => {
          res.status(204).json({
            message: 'success'
          })
        })
    })
    .catch(err => {
      console.error(err)
      res.status(500).json({
        err: 'Internal server error'
      })
    })
})

module.exports = router