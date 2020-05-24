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
    const user_id = 'TEST_USER';  // HARDCODE, todo: extract `user_id` from access token
    const { socket_id, channel_name } = req.body;
    
    if (channel_name.match(/^presence\-control\-/)) {
      pusher.get(
        { path: `/channels/${channel_name}/users`, params: {} },
        function(error, request, response) {
          if (error) console.error(error)
          if(response.statusCode === 200) {
            var result = JSON.parse(response.body);
            var users = result.users;
            const me = users.find(x => x.id === user_id);
            if (me) {
              const message = 'Only one simultaneous control connection allowed.';
              res.status(403).json({ message });
            } else {
              var presenceData = { user_id };
              var auth = pusher.authenticate(socket_id, channel_name, presenceData);
              res.send(auth);
            }
          }
        }
      );
    } else {
      var presenceData = { user_id };
      var auth = pusher.authenticate(socket_id, channel_name, presenceData);
      res.send(auth);
    }
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
