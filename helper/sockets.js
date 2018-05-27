const windowController = require('../controllers/WindowController');
const auth = require('../config/authMiddleWare');
let sockets = {};

sockets.init = (io, socket)=>{
    console.log('connected')        
    socket.on('getChats', async (data) =>{
    	if(!data){
    		return;
    	}
    	let user = await auth.authMiddleWareSocket(data.token, io);
    	if(!user){
    		return io.emit('logout_' + user._id, { message: 'No User Found' });
    	}
    	let users = await windowController.getChats(user);
    	if(!users){
    		return io.emit('error-login_' + user._id, {message:"Please try again later"});
    	}
        console.log('user'+ user._id);
        console.log('allChats__'+ user._id);
        io.emit('allChats_' + user._id.toString(), users);
    });
}

module.exports = sockets;