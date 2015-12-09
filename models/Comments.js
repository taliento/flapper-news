var mongoose = require('mongoose');

var CommentSchema = new mongoose.Schema({
	body: String,
		date:Date,
		author: String,
		upvotes: {type: Number, default: 0},
		users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
		post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
		path: String,
		comments:[],
		parent: String
});

CommentSchema.set('toJSON', { getters: true });

CommentSchema.virtual('level').get(function() {
	if(!this.path)
	 return 1;
	return this.path.split(',').length - 1;
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


mongoose.model('Comment', CommentSchema);
