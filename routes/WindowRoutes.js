const express = require('express');
const app = express.Router();
const WindowController = require('../controllers/WindowController');
const auth = require('../config/authMiddleWare');

// app.post('/getChats', auth.authMiddleWare, (req, res) => {
// 	WindowController.getChats(req, res);
// })

module.exports = app;