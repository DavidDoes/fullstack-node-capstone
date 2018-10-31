'use strict';

const express = require('express');
const mongoose = require('mongoose');
const Challenge = require('../models/challenges');
const Submission = require('../models/submissions');
const jwtAuth = require('../middleware/jwt-auth');

const router = express.Router();

const ObjectId = require('mongodb').ObjectID;

const cloudinary = require('cloudinary');
const CLOUDINARY_BASE_URL = process.env.CLOUDINARY_BASE_URL;

const multer = require('multer');

const storage = multer.diskStorage({
	cloudinary: cloudinary,
	allowedFormats: ['jpg', 'jpeg', 'png']
});
const parser = multer({ storage: storage });

cloudinary.config({
	cloud_name: 'challenge-photos',
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET
});

router.get('/', (req, res) => {
	Challenge.find()
		.then(challenge => {
			res.json(challenge.map(challenge => challenge.serialize()));
		})
		.catch(err => {
			console.error(err);
			res.status(500).json({ message: 'Internal server error' });
		});
});

router.get('/:id', (req, res) => {
	Challenge.findById(req.params.id)
		.then(id => {
      id = req.params.id
      Submission.find({ challenge: id })
        .then(submissions => {
          res.json(submissions)
			});
		});
});

router.post('/', jwtAuth, parser.single('image'), (req, res) => {
  console.log('>>> req.body: ', req.body);
	const requiredFields = ['title'];
	const missingField = requiredFields.find(field => !(field in req.body));

	if (missingField) {
		return res.status(422).json({
			code: 422,
			reason: 'ValidationError',
			message: 'Missing field',
			location: missingField
		});
	}
	const stringFields = ['title'];
	const nonStringField = stringFields.find(
		field => field in req.body && typeof req.body[field] !== 'string'
	);
	if (nonStringField) {
		return res.status(422).json({
			code: 422,
			reason: 'ValidationError',
			message: 'Incorrect field type: expected string',
			location: nonStringField
		});
	}

	let public_id;

	cloudinary.uploader.upload(req.file.path, result => {
		req.body.image = result.secure_url;
		public_id = result.public_id;

		Challenge.create({
			creator: req.user.id,
			title: req.body.title,
			cloudinary_id: public_id,
			image: CLOUDINARY_BASE_URL + 'image/upload/' + public_id
		})
			.then(challenge => {
				res.status(201).send(challenge.serialize());
			})
			.catch(err => {
				console.error(err);
				res.status(500).json({ error: 'Internal server error' });
			});
	});
});

router.put('/:id', jwtAuth, (req, res, next) => {
	const { id } = req.params;
	const { newTitle } = req.body;

	if (!req.user.id === req.body.creator) {
		const err = new Error(
			'You do not have permission to modify this Challenge.'
		);
		error.status = 400;
		return next(err);
	}

	if (!mongoose.Types.ObjectId.isValid(id)) {
		const err = new Error('The provided `id` is invalid.');
		err.status = 400;
		return next(err);
	}

	Challenge.findByIdAndUpdate(id, { title: newTitle, new: true })
		.then(result => {
			if (result) {
				res.json(result);
			} else {
				next();
			}
		})
		.catch(err => {
			next(err);
		});
});
// FOR DEVELOPMENT ONLY - REMOVE DELETE
router.delete('/:id', (req, res) => {
	Challenge.remove({
		Challenge: req.params.id
	})
		.then(() => {
			Challenge.findByIdAndRemove(req.params.id).then(() => {
				res.status(204).json({
					message: 'success'
				});
			});
		})
		.catch(err => {
			console.error(err);
			res.status(500).json({
				err: 'Internal server error'
			});
		});
});

// New Submission for this Challenge
router.post('/:id/submissions', parser.single('image'), jwtAuth, (req, res) => {
  console.log('>>> req.body: ', req.body);

	let public_id;

	cloudinary.uploader.upload(req.file.path, result => {
		req.body.image = result.secure_url;
		public_id = result.public_id;

		Submission.create({
			creator: req.user.id,
			challenge: ObjectId(req.params.id),
			cloudinary_id: public_id,
			image: CLOUDINARY_BASE_URL + 'image/upload/' + public_id
		})
			.then(submission => {
				res.status(201).send(submission.serialize());
			})
			.catch(err => {
				console.error(err);
				res.status(err).json();
			});
	});
});

module.exports = router;