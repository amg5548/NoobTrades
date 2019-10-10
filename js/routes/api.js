const express = require('express');
//eslint-disable-next-line new-cap
const router = express.Router();
const User = require('../models/user');

//Get all users from the database
router.get('/users', function(req, res) {
	User.find({}).then(function(users) {
		res.send(users);
	});
});

//Add a new user to the database
router.post('/users', function(req, res) {
	User.create(req.body).then(function(user) {
		res.send(user);
	});
});

//Get information of user by username
router.get('/username/:username', function(req, res) {
	User.find({ username: req.params.username }).then(function(users) {
		res.send(users);
	});
});

//Get information of user by id
router.get('/id/:id', function(req, res) {
	User.find({ _id: req.params.id }).then(function(users) {
		res.send(users);
	});
});

//Update information by id
router.put('/id/:id', function(req, res) {
	User.findOneAndUpdate({ _id: req.params.id }, req.body).then(function() {
		User.findOne({ _id: req.params.id }).then(function(users) {
			res.send(users);
		});
	});
});

module.exports = router;
