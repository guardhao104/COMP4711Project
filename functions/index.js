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

// Usage: https://us-central1-a1-f09ef.cloudfunctions.net/getScore?id=$USER_ID&ver=$QUIZ_VERSION
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

// Usage: https://us-central1-a1-f09ef.cloudfunctions.net/getTotalTaken?ver=$QUIZ_VERSION
exports.getTotalTaken = functions.https.onRequest((req, res) => {
    const quizVersion = req.query.ver;
    var total = 0;

    return admin.database().ref('/users/').once('value').then(function(snapshot) {
        snapshot.forEach(e => {
            if (e.key.indexOf('--' + quizVersion + '--') !== -1) {
                ++total;
            }
        });
        return res.json({
            total: total
        });
    });
});

// Usage: https://us-central1-a1-f09ef.cloudfunctions.net/getRank?id=$USER_ID&ver=$QUIZ_VERSION
exports.getRank = functions.https.onRequest((req, res) => {
    const userId = req.query.id;
    const quizVersion = req.query.ver;
    var rank = 1;
    var score = 0;

    return admin.database().ref('/users/').orderByChild('score').once('value').then(function(snapshot) {
        return snapshot.forEach(e => {
            if (e.key === userId + '--' + quizVersion + '--') {
                score = e.val().score;
                snapshot.forEach(e => {
                    if (e.key.indexOf('--' + quizVersion + '--') !== -1) {
                        if (e.val().score > score) {
                            ++rank;
                        }
                    }
                });
                return res.json({
                    rank: rank
                });
            }
        });
    });
});