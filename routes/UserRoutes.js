const express = require('express');
const app = express.Router();
const UserController = require('../controllers/UserController');
const MessageController = require('../controllers/MessageController');
const authMiddleWare = require('../config/authMiddleWare');
const jwt = require('jsonwebtoken');

// check whether phone number exists in the database or not
app.post('/verifyPhoneNumber',(req, res)=>{
	UserController.verifyPhoneNumber(req, res)
});

//log the user in
app.post('/login',(req, res)=>{
	UserController.login(req, res);
});

// register the user
app.post('/register',(req, res)=>{
	UserController.signup(req, res);
});

app.post('/sendMessage', (req, res, next)=>{
	authMiddleWare.authMiddleWare(req, res, next);
},(req, res)=>{
	MessageController.sendMessage(req, res);
})

app.post('/search', (req, res)=>{
	UserController.search(req, res);
})

app.post('/isLoggedIn',(req, res)=>{
	UserController.isLoggedIn(req, res);
})

app.get('/me', (req, res, next)=>{
	authMiddleWare.authMiddleWare(req, res, next);
}, (req, res)=>{
	UserController.me(req, res);
})

app.post('/searchUsers', authMiddleWare.authMiddleWare, (req, res)=>{
	UserController.searchUsers(req, res);
})
// app.use(passport.authenticate('jwt', {
//     session: false
// }),(req, res, next)=>{
// 	console.log('User');
//     console.log(req.user.name);
//     console.log(req.user.email);
//     next();
// });


module.exports = app;