const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Messages = mongoose.Schema({
	type:{
		type: String,
		enum: ['file', 'text'],
		default: 'text',
		required: true
	},
	message:{
		type: String,
		default: ''
	},
	filePath:{
		type: String,
		default: ''
	},
	fileType:{
		type: String,
		default: ''
	},
	windowId:{
		type: Schema.Types.ObjectId,
		ref: 'User'
	},
	sender:{
		type: Schema.Types.ObjectId,
		ref: 'User'
	},
	adminComment:{
		type: Boolean,
		default: false
	},
	window:{
		type: Schema.Types.ObjectId,
		ref:'Window'
	},
	readBy:[{
		type: Schema.Types.ObjectId,
		ref: 'User'
	}],
	deletedFor:[{
		type: Schema.Types.ObjectId,
		ref: 'User'
	}],
	deliveredTo:[{
		type: Schema.Types.ObjectId,
		ref: 'User'
	}]
},{
	timestamps:true
});


const MessagesModel = mongoose.model('Messages', Messages);


module.exports = MessagesModel;