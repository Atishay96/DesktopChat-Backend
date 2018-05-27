const __ = require('../helper/Response');
const multer = require('multer');
const util = require('util');
const Window = require('../models/Window');
const Messages = require('../models/Messages');
const UserController  = require('../controllers/UserController');
const WindowController  = require('../controllers/WindowController');
const socket = require('../helper/sockets');

class MessageController{
	constructor(){
		const FileShared = multer.diskStorage({
            destination: function (req, file, cb) {
                cb(null, './public/files/shared')
            },
            filename: function (req, file, cb) {
                let datetimestamp = Date.now();
                cb(null, file.fieldname + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length - 1]);
            }
        })
        this.fileShared = multer({ storage: FileShared }).single('profilePicture');        
	}
	async sendMessage(req, res){
		try{
			const upload = util.promisify(this.fileShared);
			await upload(req, res);
			console.log(req.body);
			if(!req.body.senderId || !req.body.type || !(req.body.message || (!req.file && !req.file.path)) ){
				return __.badValues(res);
			}
			let check = await UserController.checkId(req.body.senderId);
			if(!check){
				return __.message(res, 404, 'Wrong sender\'s id');
			}
			let users = [req.user._id, req.body.senderId];
			// let window = await Window.findOne({ type: req.body.type, users: { $in: users } });
			let window = await Window.findOne({ type: req.body.type }).where('users').all( users );
			if(window){
				req.body.windowId = window._id;
			}
			if(!req.body.windowId){
				return this.createWindow(req, res);
			}
			// if(!window){
			// 	return __.message(res, 400, "Wrong Window Id");
			// }
			let obj = {};
			obj.windowId = req.body.windowId;
			obj.sender = req.user._id;
			if(req.body.message){
				obj.message = req.body.message;
			}
			if(req.file && req.file.path){
				obj.filePath = req.file.path;
				obj.fileType = req.body.fileType;
			}
			obj.readBy = [req.user._id];
			obj.deletedFor = [];
			obj.deliveredTo = [req.user._id];
			let online = await UserController.isOnline(req.body);
			if(online){
				obj2.deliveredTo.push(req.body.senderId);
			}
			let message = new Messages(obj);
			if(!window.messages){
				window.messages = [];
			}
			window.messages.push(message._id);
			let mes = await message.save();
			await window.save();
			let wind = await Window.findOne({ type: req.body.type, users: { $in: users } }).populate([{path:'users', match:{_id: {$ne: req.user._id }}, select:'lastSeen name userName profilePicture phoneNumber countryCode'}, {path:'messages'}]);
			let socketio = req.app.get('socketio');
			if(socketio){
				console.log('newMessage_'+ req.body.senderId);
				socketio.emit('newMessage_'+ req.body.senderId, {message: mes});
			}
			// io.emit('newMessage_'+ req.body.senderId, {message: mes});
			//socket emit
			return __.success(res, {message:mes}, 'message sent');
		}catch(err){
			return __.errorInternal(err, res);
		}
	}
	async createWindow(req, res){
		try{
			let obj = {};
			obj.users = [];
			obj.users.push(req.user._id);
			obj.users.push(req.body.senderId);
			obj.messages = [];
			let window = await Window.create(obj);			
			let obj2 = {}
			obj2.message = req.body.message;
			obj2.adminComment = false;
			obj2.window = window._id;
			obj2.readBy = [req.user._id];
			obj2.sender = req.user._id;
			obj2.deletedFor = [];
			obj2.deliveredTo = [req.user._id];
			let online = await UserController.isOnline(req.body);
			if(online){
				obj2.deliveredTo.push(req.body.senderId);
			}
			let message = await Messages.create(obj2);
			window.messages.push(message._id);
			let mes = await message.save();
			mes = mes.toObject();
			let wind = await window.save();
			let socketio = req.app.get('socketio');
			let window1 = await WindowController.getWindow(wind._id, req.body.senderId);
			let window2 = await WindowController.getWindow(wind._id, req.user._id);
			console.log(socketio);
			if(socketio){
				console.log('newWindow_'+ req.body.senderId);
				socketio.emit('newWindow_'+ req.body.senderId, {window: window1});
				// socketio.emit('newWindow_'+ req.user._id.toString(), {window: window1});
				// socketio.emit('newWindow_'+ req.user._id, {window: window1});
			}
			return __.success(res, {message:mes, window:window2}, 'message sent');
		}catch(err){
			__.errorInternal(err, res);
		}
	}
}

MessageController = new MessageController();
module.exports = MessageController;