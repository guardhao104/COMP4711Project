// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require('firebase-functions');

// The Firebase Admin SDK to access the Firebase Realtime Database.
const admin = require('firebase-admin');

// Fetch the service account key JSON file contents
var serviceAccount = require("./a1-f09ef-firebase-adminsdk-fzg9l-da2606e857.json");

// Initialize the app with a service account, granting admin privileges
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://a1-f09ef.firebaseio.com"
  });

// Usage: https://us-central1-a1-f09ef.cloudfunctions.net/getScore?id=USER_ID&ver=QUIZ_VERSION
exports.getScore = functions.https.onRequest((req, res) => {
    const userId = req.query.id;
    const quizVersion = req.query.ver;
    return admin.database().ref('/users/' + userId + '--' + quizVersion + '--').once('value').then(function(snapshot) {
        var email = (snapshot.val() && snapshot.val().email) || 'Anonymous';
        var score = (snapshot.val() && snapshot.val().score) || 'No record';
        return res.json({
            email: email,
            score: score
        });
    });
});
