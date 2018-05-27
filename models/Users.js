const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt-nodejs');
const Users = mongoose.Schema({
	name:{
		type: String,
		default: '',
		required: true
	},
	userName:{
		type: String
	},
	email:{
		type: String,
		unique: true
	},
	otp:{
		type: String,
		default: ''
	},
	password:{
		type: String,
		default: '',
		required: true
	},
	profilePicture:{
		type: String,
		required: true
	},
	phoneNumber:{
		type: String,
		default: '',
		required: true,
		unique: true
	},
	countryCode:{
		type: String,
		required: true
	},
	isPhoneNumberVerified:{
		type: Boolean,
		default: false
	},
	isEmailVerified:{
		type: Boolean,
		default: false
	},
	lastLoggedIn:{
		type: Date
	},
	isOnline:{
		type: Boolean,
		default: false
	},
	lastSeen:{
		type: Date
	}
},{
	timestamps:true
});

Users.methods.generateHash = (password)=>{
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

//method to verify password can't use arrow functions
Users.methods.verifyPassword = function(password){
  let user = this;
  return bcrypt.compareSync(password, user.password);
};

const UserModel = mongoose.model('User', Users);


module.exports = UserModel;