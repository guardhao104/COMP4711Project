const express = require('express');
const app = express();

// bodyParser API
var bodyParser = require('body-parser')
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

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

// API token
const token = "xKIaIjXkm4I2f4XQtM7a";

// Usage: https://us-central1-a1-f09ef.cloudfunctions.net/getScore
// Headers: {"token": "xKIaIjXkm4I2f4XQtM7a"}
// Body: {"uid":" ", "ver": " "}
exports.getScore = functions.https.onRequest((req, res) => {
    const userId = req.body.id;
    const quizVersion = req.body.ver;
    const getToken = req.headers.token;
    if (getToken === token) {
        return admin.database().ref('/users/' + userId + '--' + quizVersion + '--').once('value').then(function(snapshot) {
            var email = (snapshot.val() && snapshot.val().email) || 'Anonymous';
            var score = (snapshot.val() && snapshot.val().score) || 'No record';
            return res.json({
                uid: userId,
                ver: quizVersion,
                email: email,
                score: score
            });
        });
    } else {
        return res.json({
            message: "Missing Authentication Token"
        }); 
    }
});

// Usage: https://us-central1-a1-f09ef.cloudfunctions.net/getTotalTaken
// Headers: {"token": "xKIaIjXkm4I2f4XQtM7a"}
// Body: {"ver": " "}
exports.getTotalTaken = functions.https.onRequest((req, res) => {
    const quizVersion = req.body.ver;
    const getToken = req.headers.token;
    if (getToken === token) {
        var total = 0;
        return admin.database().ref('/users/').once('value').then(function(snapshot) {
            snapshot.forEach(e => {
                if (e.key.indexOf('--' + quizVersion + '--') !== -1) {
                    ++total;
                }
            });
            return res.json({
                ver: quizVersion,
                total: total
            });
        });
    } else {
        return res.json({
            message: "Missing Authentication Token"
        });
    }
});

// Usage: https://us-central1-a1-f09ef.cloudfunctions.net/getRank
// Headers: {"token": "xKIaIjXkm4I2f4XQtM7a"}
// Body: {"uid":" ", "ver": " "}
exports.getRank = functions.https.onRequest((req, res) => {
    const userId = req.body.id;
    const quizVersion = req.body.ver;
    const getToken = req.headers.token;
    if (getToken === token) {
        var rank = -1;
        var score = 0;
        return admin.database().ref('/users/').orderByChild('score').once('value').then(function(snapshot) {
            snapshot.forEach(e => {
                if (e.key === userId + '--' + quizVersion + '--') {
                    score = e.val().score;
                    rank = 1;
                    snapshot.forEach(e => {
                        if (e.key.indexOf('--' + quizVersion + '--') !== -1) {
                            if (e.val().score > score) {
                                ++rank;
                            }
                        }
                    });
                    return res.json({
                        uid: userId,
                        ver: quizVersion,
                        score: score,
                        rank: rank
                    });
                } 
            });
            return res.json({
                message: "No such user's record"
            });
        });
    } else {
        return res.json({
            message: "Missing Authentication Token"
        });
    }
});