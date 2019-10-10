const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
	fname: String,
	lname: String,
	email: String,
	username: String,
	password: String,
	cashTotal: Number,
	positions: [{
		stock: String,
		shares: Number
	}],
	history: [{
		stock: String,
		order: String,
		shares: Number,
		pricePer: Number,
		priceTotal: Number,
		date: Date,
		time: String
	}]
});

const User = mongoose.model('user', UserSchema);

module.exports = User;
