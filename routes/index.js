var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Post = mongoose.model('Post');
var Comment = mongoose.model('Comment');

var passport = require('passport');
var User = mongoose.model('User');
var jwt = require('express-jwt');
var ObjectId = require('mongoose').Types.ObjectId; 


/* middleware for authenticating jwt tokens */
var auth = jwt({secret: 'SECRET', userProperty: 'payload'});

/* GET home page. */
router.get('/', function(req, res) {
	res.render('index');
});

router.post('/register', function(req, res, next){
	if(!req.body.username || !req.body.password){
		return res.status(400).json({message: 'Please fill out all fields'});
	}

	var user = new User();

	user.username = req.body.username;

	user.setPassword(req.body.password)

	user.save(function (err){
		if(err){ return next(err); }

		return res.json({token: user.generateJWT()})
	});
});

router.post('/login', function(req, res, next){
	if(req.body.idToken){

		User.findOne({ username: req.body.username }, function (err, user) {
			if (err) { return done(err); }
			if (!user) {
				user = new User();
				user.username = req.body.username;
				user.idToken = req.body.idToken;
				user.setPassword(req.body.username);
				user.save(function (err){
					if(err){ return next(err); }

					return res.json({token: user.generateJWT()})
				});

			}else{
				return res.json({token: user.generateJWT()});
			}

		});

	} else {

		if(!req.body.username || !req.body.password){
			return res.status(400).json({message: 'Please fill out all fields'});
		}

		passport.authenticate('local', function(err, user, info){
			if(err){ return next(err); }

			if(user){
				return res.json({token: user.generateJWT()});
			} else {
				return res.status(401).json(info);
			}
		})(req, res, next);

	}
});

/*preload a comment  by id */
router.param('comment', function(req, res, next, id) {
	var query = Comment.findById(id);

	query.exec(function (err, comment){
		if (err) { return next(err); }
		if (!comment) { return next(new Error('can\'t find comment')); }

		req.comment = comment;
		return next();
	});
});

/*preload a post by id */
router.param('post', function(req, res, next, id) {
	var query = Post.findById(id);

	query.exec(function (err, post){
		if (err) { return next(err); }
		if (!post) { return next(new Error('can\'t find post')); }

		req.post = post;
		return next();
	});
});

/*GET posts */
router.get('/posts', function(req, res, next) {
	Post.find(function(err, posts){
		if(err){ return next(err); }

		res.json(posts);
	});
});

/*POST post*/
router.post('/posts', auth, function(req, res, next) {
	var post = new Post(req.body);
	post.author = req.payload.username;
	post.date = new Date();
	post.save(function(err, post){
		if(err){ return next(err); }

		//comments root
		var comment = new Comment();
		comment.post = post;
		comment.save(function(err,comment){
			if(err){ return next(err); }
			res.json(post);
		});
	});
});

/*GET a post */
router.get('/posts/:post', function(req, res) {

	var post = req.post;
	Comment.findOne({post:post},function(err,doc){
		if (err) { return next(err); }
		doc.getArrayTree(function(err,tree){
			if (err) { return next(err); }
			post.comments = tree;
			res.json(post);
		});
	});

});

/*PUT upvote a post*/
router.put('/posts/:post/upvote', auth, function(req, res, next) {
	req.post.upvote(function(err, post){
		if (err) { return next(err); }

		res.json(post);
	},req.payload);
});

/*PUT downvote a post*/
router.put('/posts/:post/downvote', auth, function(req, res, next) {
	req.post.downvote(function(err, post){
		if (err) { return next(err); }

		res.json(post);
	}, req.payload);
});

/*POST post's comment*/
router.post('/posts/:post/comments', auth, function(req, res, next) {
	var comment = new Comment(req.body);
	comment.author = req.payload.username;
	comment.date = new Date();
	Comment.findOne({post:req.post}).exec(function(err,rootComment){
		if(err){ return next(err); }
		comment.parentId = rootComment._id;
		comment.save(function(err,doc){
			if(err){ return next(err); }
			req.post.incrementComments(function(err, p){
				if(err){ return next(err); }
				res.json(doc);
			});
		});
	});
});


/*POST comments's replies*/
router.post('/posts/:post/comments/:comment/replies', auth, function(req, res, next) {
	var comment = new Comment(req.body);
	comment.date = new Date();
	comment.author = req.payload.username;

	Comment.AppendChild(req.comment._id, comment, function(err, doc){
		if(err){ return next(err); }

		req.post.incrementComments(function(err, p){
			if(err){ return next(err); }
			res.json(doc);
		});
	});

});

/*PUT upvote a comment*/
router.put('/posts/:post/comments/:comment/upvote', auth, function(req, res, next) {
	req.comment.upvote(function(err, comment){
		if (err) { return next(err); }

		res.json(comment);
	},req.payload);
});

/*PUT downvote a comment*/
router.put('/posts/:post/comments/:comment/downvote', auth, function(req, res, next) {
	req.comment.downvote(function(err, comment){
		if (err) { return next(err); }

		res.json(comment);
	},req.payload);
});


module.exports = router;

