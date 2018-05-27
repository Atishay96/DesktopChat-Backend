//models
const __ = require('../helper/Response');
const User = require('../models/Users');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const util = require('util');
const WindowController = require('./WindowController');
const _ = require('lodash');

require('dotenv').config();

class UserController{
	constructor(){
		const ProfilePicture = multer.diskStorage({
            destination: function (req, file, cb) {
                cb(null, './public/files/profilePicture')
            },
            filename: function (req, file, cb) {
                let datetimestamp = Date.now();
                cb(null, file.fieldname + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length - 1]);
            }
        })
        this.uploaddp = multer({ storage: ProfilePicture }).single('profilePicture');
	}
	async verifyPhoneNumber(req,res){
		try{
			console.log(req.body);
			if(!req.body.phoneNumber) return __.badValues(res);
			let user = await User.findOne({phoneNumber: req.body.phoneNumber}).count();
			
			// if user is not found sign him up
			if(!user) return __.message(res, 202, 'Please sign up');
			// if user is found in the database
			return __.message(res, 200, "Please enter your password");
		}catch(err){
			return __.errorInternal(err, res);
		}
	}
	async login(req, res){
		try{
			if(!req.body.phoneNumber || !req.body.password) return __.badValues(res);

			let user = await User.findOne({phoneNumber: req.body.phoneNumber});

			if(!user) return __.message(res, 202, 'Please sign up');
			let check = user.verifyPassword(req.body.password);

			if(!check){
				return __.notAuthorized(res, 'Wrong password');
			}
			user.lastLoggedIn = new Date();
			let temp = {
                _id: user._id,
                lastLoggedIn: user.lastLoggedIn,
                name: user.name
            }
            //check the status
            if(!user.isPhoneNumberVerified){
            	return __.notAuthorized(res, 'Your phone number is not verified. Please verify it.');
            }
            let token = jwt.sign(temp, process.env.randomKey);
			await user.save();
			user = user.toObject();
			user.authToken = token;
			delete user['password'];
			return __.success(res, user);
		}catch(err){
			return __.errorInternal(err, res);
		}
	}
	async signup(req, res){
		try{
			const upload = util.promisify(this.uploaddp);
            await upload(req, res);
			if(!req.body.phoneNumber || !req.body.password || !req.body.name || !req.body.email || !req.body.countryCode) return __.badValues(res);

			if (req.file && req.file.path) {
                req.file.path = req.file.path.split('/');
                req.file.path.splice(0, 1);
                req.file.path = req.file.path.join('/');
                req.body.profilePicture = req.file.path;
            }

			let user = await User.findOne({$or:[{phoneNumber: req.body.phoneNumber}, {email: req.body.email}]}).count();

			if(user) return __.message(res, 400, 'email or phoneNumber already exists in the database');

			let temp = {phoneNumber: req.body.phoneNumber, email: req.body.email, name:req.body.name, countryCode: req.body.countryCode, profilePicture: req.body.profilePicture};
			//for testing
			temp.isPhoneNumberVerified = true;
			//for now
			temp.userName = temp.name;
			let userData = new User(temp);
			userData.password = await userData.generateHash(req.body.password);
			let userNew = await userData.save();
			let tempNew = {
                _id: userNew._id,
                lastLoggedIn: userNew.lastLoggedIn,
                name: userNew.name
            }
            let token = jwt.sign(tempNew, process.env.randomKey);
			userNew = userNew.toObject();
			userNew.authToken = token;
			delete userNew['password'];
			return __.success(res, userNew, "Successfully Signed up");
		}catch(err){
			return __.errorInternal(err, res);
		}
	}
	async search(req, res){
		try{
			let users = await User.find( { $or: [ {email:{$regex:'/'+req.body.text+'/', $options:'i'} }, { phoneNumber:{$regex:'/'+req.body.text+'/', $options:'i'} } ] , isPhoneNumberVerified:true }).select('name userName profilePicture').lean();
			return __.success(res, users);
		}catch(err){
			return  __.errorInternal(err, res);
		}
	}
	async isLoggedIn(req, res){
		try{
			if(!req.body.token){
				return __.message(res, 401, "Please Log in to continue");
			}
			let temp = jwt.verify(req.body.token, process.env.randomKey);
			let user = await User.findOne({_id:temp._id, lastLoggedIn: temp.lastLoggedIn});
			if(!user){
				return __.sessionExpired(res);
			}
			return __.message(res, 200, 'Success');
		}catch(err){
			return __.errorInternal(err, res);
		}
	}
	async isOnline(userId){
		try{
			if(!userId){
				return false;
			}
			let online = await User.find({_id: userId, isOnline:true}).count();
			if(online){
				return true;
			}
			return false;
		}catch(err){
			return false;
		}
	}
	async checkId(userId){
		try{
			if(!userId){
				return false;
			}
			let online = await User.find({_id: userId}).count();
			if(online){
				return true;
			}
			return false;
		}catch(err){
			return false;
		}
	}
	async me(req, res){
		try{
			let obj = {};
			obj.name = req.user.name;
			obj.profilePicture = req.user.profilePicture;			
			return __.success(res, obj);
		}catch(err){
			__.errorInternal(err, res);
		}
	}
	async searchUsers(req, res){
		try{
			if(!req.body.text){
				return __.badValues(res);
			}
			let users = await User.find({ _id:{ $ne: req.user._id} ,$or:[ { email: req.body.text }, { phoneNumber: req.body.text }, { name: { $regex: '/'+req.body.text+'/i' } } ]}).select('name profilePicture userName').limit(5).lean();
			let final = [];
			let temp = users.map( (v,i) => {
				let window = WindowController.getUsersChat(req.user._id, v);
				if(!window){
					return;
				}
				return window;
			})
			Promise.all(temp).then((final)=>{
				console.log(final);
				return __.success(res, final);
			})
		}catch(err){
			__.errorInternal(err, res);
		}
	}
}

UserController = new UserController()
module.exports = UserController;
