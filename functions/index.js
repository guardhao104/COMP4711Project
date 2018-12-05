const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser')

// Automatically allow cross-origin requests
app.use(cors({ origin: true }));

// bodyParser API
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
// Body: {"id":" ", "ver": " "}
exports.getScore = functions.https.onRequest((req, res) => {
    const userId = req.body.id;
    const quizVersion = req.body.ver;
    const getToken = req.headers.token;
    if (getToken === token) {
        if (!(userId && quizVersion)) {
            return res.json({
                message: "Missing id or ver in request body"
            });
        }
        return admin.database().ref('/records/' + quizVersion + '/' + userId.replace('.', '')).once('value').then((snapshot) => {
            var email = (snapshot.val() && snapshot.val().email) || 'Anonymous';
            var score = (snapshot.val() && snapshot.val().score) || 'No record';
            return res.json({
                id: userId,
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
        if (!quizVersion) {
            return res.json({
                message: "Missing ver in request body"
            });
        }
        var total = 0;
        return admin.database().ref('/records/' + quizVersion + '/').once('value').then((snapshot) => {
            snapshot.forEach(e => {
                ++total;
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
// Body: {"id":" ", "ver": " "}
exports.getRank = functions.https.onRequest((req, res) => {
    const userId = req.body.id;
    const quizVersion = req.body.ver;
    const getToken = req.headers.token;
    if (getToken === token) {
        if (!(userId && quizVersion)) {
            return res.json({
                message: "Missing id or ver in request body"
            });
        }
        return admin.database().ref('/records/' + quizVersion + '/' + userId.replace('.', '')).once('value').then((snapshot) => {
            if (snapshot.val()) {
                var rank = 1;
                var score = snapshot.val().score;
                return admin.database().ref('/records/' + quizVersion + '/').orderByChild('score').startAt(score + 1).once('value').then((snapshot) => {
                    snapshot.forEach(e => {
                        ++rank;
                    });
                    return res.json({
                        id: userId,
                        ver: quizVersion,
                        score: score,
                        rank: rank
                    });
                });
            } else {
                return res.json({
                    message: "No record for this user"
                });
            }
        });
    } else {
        return res.json({
            message: "Missing Authentication Token"
        });
    }
});

// Usage: https://us-central1-a1-f09ef.cloudfunctions.net/getRankPercent
// Headers: {"token": "xKIaIjXkm4I2f4XQtM7a"}
// Body: {"id":" ", "ver": " "}
exports.getRankPercent = functions.https.onRequest((req, res) => {
    const userId = req.body.id;
    const quizVersion = req.body.ver;
    const getToken = req.headers.token;
    if (getToken === token) {
        if (!(userId && quizVersion)) {
            return res.json({
                message: "Missing id or ver in request body"
            });
        }
        return admin.database().ref('/records/' + quizVersion + '/' + userId.replace('.', '')).once('value').then((snapshot) => {
            if (snapshot.val()) {
                var rank = 0;
                var score = snapshot.val().score;
                var total = 0;
                return admin.database().ref('/records/' + quizVersion + '/').once('value').then((snapshot) => {
                    snapshot.forEach(e => {
                        ++total;
                    });
                    return admin.database().ref('/records/' + quizVersion + '/').orderByChild('score').startAt(score).once('value').then((snapshot) => {
                        snapshot.forEach(e => {
                            ++rank;
                        });
                        var percent = rank / total * 100;
                        var percentShow = percent - percent % 1 + (percent % 1 >= 0.5 ? 1 : 0);
                        return res.json({
                            id: userId,
                            ver: quizVersion,
                            score: score,
                            rankPercent: percent,
                            rankString: percentShow.toString() + '%'
                        });
                    });
                });
            } else {
                return res.json({
                    message: "No record for this user"
                });
            }
        });
    } else {
        return res.json({
            message: "Missing Authentication Token"
        });
    }
});

// Create a custom token for a permission user.
// Usage: https://us-central1-a1-f09ef.cloudfunctions.net/permission?uid=UID
exports.permission = functions.https.onRequest((req, res) => {
    const uid = req.query.uid;
    if (!uid) return;
    admin.auth().createCustomToken(uid).then((customToken) => {
        return res.json({
            customToken: customToken
        });
    })
    .catch((error) => {
        console.log("Error creating custom token:", error);
        return res.json({
            error: error
        })
    });
});
  