const Windows = require('../models/Window');
class windowC{
	async getChats(user){
		try{
			let users = await Windows.find({ users:user._id }).populate([{path:'users', match:{_id: {$ne:user._id}}, select:'lastSeen name userName profilePicture phoneNumber countryCode'}, {path:'messages'}]);
			return users;
		}catch(err){
			console.log(err);
			return false;
		}
	}
	async getWindow(id, userId){
		try{
			let users = await Windows.findOne({ _id: id }).populate([{path:'users', match:{_id: {$ne: userId }}, select:'lastSeen name userName profilePicture phoneNumber countryCode'}, {path:'messages'}]);
			return users;
		}catch(err){
			console.log(err);
			return false;
		}
	}
	async getUsersChat(user1, user2){
		try{
			return new Promise(async (resolve, reject)=>{
				if(!user1 || !user2){
					return resolve();
				}
				let chats = await Windows.findOne({ users: user1, users: user2._id }).populate({path:'messages'}).select('messages type');
				user2.messages = chats.messages;
				return resolve(user2);
			})			
		}catch(err){
			console.error(err);
			return false;
		}
	}
}

windowC = new windowC();
module.exports = windowC;