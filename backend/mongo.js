var mongoose = require('mongoose');
var PostSchema = mongoose.Schema({
  tag: String,
  body: String,
  date: {
    type: Date,
    default: Date.now
  },
  isEdited: false
});
var Post = mongoose.model('Post', PostSchema);

var connectWithRetry = function() {
  return mongoose.connect('mongodb://mongo/posts', function(err) {
    if (err) {
      console.error('Failed to connect to mongo on startup - retrying in 5 sec', err);
      setTimeout(connectWithRetry, 5000);
    }
  });
};

exports.mongoMigration = function() {
  connectWithRetry();
  console.log('Mongo connection succesful');
  mongoose.connection.on('open', function() {
  mongoose.connection.db.dropDatabase();
  Post.create({
    "tag": "Test",
    "body": "Test post",
  }, function(err) {
    if (err) console.error('Failed to create start post', err);
  });
  Post.create({
    "tag": "Test2",
    "body": "Test post 2",
  }, function(err) {
    if (err) console.error('Failed to create start post', err);
  });
});
};

exports.getPosts = async (req, res, next) => {
  await Post.find(function(err, products) {
    if (err) return next(err);
    res.json(products);
  });
};

exports.getPostById = async (req, res, next) => {
  await Post.findById(req.params.id, function(err, post) {
    if (err) return next(err);
    res.json(post);
  });
};

exports.postPost = async (req, res, next) => {
  await Post.create(req.body, function(err, post) {
    if (err) return next(err);
    res.json(post);
  });
}

exports.updatePost = async (req, res, next) => {
  Post.findByIdAndUpdate(req.params.id, req.body, function(err, post) {
    if (err) return next(err);
    res.json(post);
  });
};

exports.deletePost = async (req, res, next) => {
  Post.findByIdAndRemove(req.params.id, req.body, function(err, post) {
    if (err) return next(err);
    res.json(post);
  });
}
