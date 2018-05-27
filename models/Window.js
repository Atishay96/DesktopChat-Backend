const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Window = mongoose.Schema({
	users:[{
		type: Schema.Types.ObjectId,
		ref: 'User'
	}],
	messages:[{
		type: Schema.Types.ObjectId,
		ref: 'Messages'
	}],
	type:{
		type: String,
		enum:['group', 'oneToOne'],
		default: 'oneToOne',
		required: true
	},
	groupAdmin:{
		type: Schema.Types.ObjectId,
		ref: 'User'
	}
},{
	timestamps:true
});


const WindowModel = mongoose.model('Window', Window);


module.exports = WindowModel;