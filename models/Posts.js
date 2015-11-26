var mongoose = require('mongoose');

var PostSchema = new mongoose.Schema({
	  title: String,
		date:Date,
		body:String,
		author:String,
		link: String,
		upvotes: {type: Number, default: 0},
		users:[{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
		comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }]
});

PostSchema.methods.upvote = function(cb, user) {
	  
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

PostSchema.methods.downvote = function(cb, user) {

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

mongoose.model('Post', PostSchema);
