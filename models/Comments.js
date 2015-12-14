var mongoose = require('mongoose');
var materializedPlugin = require('mongoose-materialized');

var CommentSchema = new mongoose.Schema({
		body: String,
		date:Date,
		author: String,
		upvotes: {type: Number, default: 0},
		users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
		post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
		parentId: String
});

CommentSchema.methods.upvote = function(cb,user) {
	if(this.users.length === 0)
		this.users = [];
	else if(this.users.indexOf(user._id) != -1){
		cb(new Error('you have already voted'));
		return;
	}
	this.users.push(user);
	this.upvotes += 1;
	this.save(cb);
};

CommentSchema.methods.downvote = function(cb,user) {
	if(this.users.length === 0)
		this.users = [];
	else if(this.users.indexOf(user._id) != -1){
		cb(new Error('you have already voted'));
		return;
	}
	this.users.push(user);
	this.upvotes -= 1;
	this.save(cb);
};


CommentSchema.plugin(materializedPlugin);
mongoose.model('Comment', CommentSchema);
