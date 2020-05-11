const functions = require('firebase-functions');
const cors = require('cors')({ origin: true });
const Pusher = require('pusher');

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });


const config = functions.config().env;  // env vars from here
const { appId, key, secret, cluster } = config.pusher;
const pusher = new Pusher({
  appId,
  key,
  secret,
  cluster,
  useTLS: true
});


exports.pusherAuth = functions.https.onRequest((req, res) => {
  cors(req, res, () => {
    //console.log(req.headers.authorization);
    var socketId = req.body.socket_id;
    var channel = req.body.channel_name;
    var presenceData = {
      user_id: 'TEST_USER',
    };
    var auth = pusher.authenticate(socketId, channel, presenceData);
    res.send(auth);
  });
});


exports.pusherAuthMachine = functions.https.onRequest((req, res) => {
  cors(req, res, () => {
    const { machineId } = req.body;
    var socketId = req.body.socket_id;
    var channel = req.body.channel_name;
    var presenceData = {
      user_id: machineId,
    };
    var auth = pusher.authenticate(socketId, channel, presenceData);
    res.send(auth);
  });
});
