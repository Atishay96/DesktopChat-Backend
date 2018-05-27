const express = require('express');
const app = express.Router();
const websiteController = require('../controllers/website/websiteController');
const authMiddleWare = require('../config/authMiddleWare');
const jwt = require('jsonwebtoken');

// check whether phone number exists in the database or not
app.get('/index',(req, res)=>{
	websiteController.index(req, res);
});

// login
app.get('/login',(req, res)=>{
	websiteController.login(req, res);
});

// signup
app.get('/signup',(req, res)=>{
	websiteController.signup(req, res);
});


module.exports = app;