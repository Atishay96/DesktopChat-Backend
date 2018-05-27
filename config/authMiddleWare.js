const __ = require('../helper/Response');
const User = require('../models/Users');
const jwt = require('jsonwebtoken');

require('dotenv').config();

class auth{
	async authMiddleWare(req, res, next){
		try{
			let token = req.headers['authtoken'];
			if(!token){
				return __.message(res, 401, "Please Log in to continue");
			}
			let temp = jwt.verify(token, process.env.randomKey);
			console.log(temp);
			let user = await User.findOne({_id:temp._id, lastLoggedIn: temp.lastLoggedIn});
			if(!user){
				return __.sessionExpired(res);
			}
			req.user = user;
			next();
		}
		catch(err){
			return __.errorInternal(err, res);
		}
	}
	async authMiddleWareSocket(token, io){
		try{
			if(!token){
				// io.emit('error-login_' + user._id, {});
				// __.message(res, 401, "Please Log in to continue");
				return false;
			}
			let temp = jwt.verify(token, process.env.randomKey);
			console.log(temp.lastLoggedIn);
			let user = await User.findOne({_id: temp._id, lastLoggedIn: temp.lastLoggedIn});
			if(!user){
				// io.emit('error-login_' + user._id, {});
				// __.sessionExpired(res);
				return false;
			}
			// req.user = user;
			return (user);
		}
		catch(err){
			console.error(err);
				io.emit('error-login_' + user._id, {error:err});
			// return __.errorInternal(err, res);
		}
	}
}

auth = new auth();
module.exports = auth;