const express = require('express');
const router = express.Router();
const app = express();
const bodyParser = require('body-parser');
const cors = require('permissive-cors');
const process = require('process');
const GracefulShutdownManager = require('@moebius/http-graceful-shutdown').GracefulShutdownManager;

const mongo = require('./mongo.js');
console.log('Start migrations');
mongo.mongoMigration();

app.use(cors());
app.use(bodyParser.json());

app.use('/posts/', router);
router.get('/mongo/', mongo.getPosts);
router.get('/mongo/:id', mongo.getPostById);
router.post('/mongo/', mongo.postPost);
router.put('/mongo/:id', mongo.updatePost);
router.delete('/mongo/:id', mongo.deletePost);

const server = app.listen(3000, function() {
  console.log('Posts backend running!');
});

const shutdownManager = new GracefulShutdownManager(server);
process.on('SIGINT', function onSigint() {
  app.shutdown();
});

process.on('SIGTERM', function onSigterm() {
  app.shutdown();
});

app.shutdown = function() {
  shutdownManager.terminate(() => {
    console.log('Server is gracefully terminated.');
  });
};
