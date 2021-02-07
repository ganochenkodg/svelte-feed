var mongoose = require('mongoose');
var PostSchema = mongoose.Schema({
  tag: String,
  body: String,
  date: {
    type: Date,
    default: Date.now
  },
  isEdited: {
    type: Boolean,
    default: false
  }
});
var Post = mongoose.model('Post', PostSchema);

var connectWithRetry = function() {
  return mongoose.connect('mongodb://localhost/posts', function(err) {
    if (err) {
      console.error('Failed to connect to mongo on startup - retrying in 5 sec', err);
      setTimeout(connectWithRetry, 5000);
    }
  });
};

exports.mongoMigration = function() {
  connectWithRetry();
  console.log('Mongo connection succesful');
};

exports.getPosts = async (req, res, next) => {
  await Post.find(function(err, products) {
    if (err) return next(err);
    res.json(products);
  }).sort({date: 'descending'});
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
