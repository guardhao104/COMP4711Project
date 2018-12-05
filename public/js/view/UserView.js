var UserView = function (model) {
    this.model = model;
	this.easyEvent = new Event(this);
	this.hardEvent = new Event(this);
	this.submitEvent = new Event(this);
	this.diffecult = 0;
	this.user;
	this.userID;
	this.userShownName;
	this.database = firebase.database();
	this.email = [];
	this.score = [];

    this.init();
};

UserView.prototype = {

    init: function() {
        this.createChildren()
            .setupHandlers()
            .enable();
		$("#btn-container").hide();
		if (this.getRequest()) {
			$("#user-welcome").html("Welcome! " + this.userShownName);
			$("#btn-leave").click(function() {
				window.location.href="login.html";
			}.bind(this));
		} else {
			$("#btn-leave").click(function() {
				firebase.auth().signOut();
			}.bind(this));
			firebase.auth().onAuthStateChanged(function(user) {
				if (user) {
					const displayName = user.displayName;
					const email = user.email;
					const emailVerified = user.emailVerified;
					const photoURL = user.photoURL;
					const isAnonymous = user.isAnonymous;
					const uid = user.uid;
					const providerData = user.providerData;
					this.user = user;
					this.userID = uid;
					this.userShownName = email;
					$("#user-welcome").html("Welcome! " + this.userShownName);
				} else {
					window.location.href="login.html";
				}
			}.bind(this));
		}
	},
	
	getRequest: function() {
		var url = location.search;
		if (url.indexOf("?") != -1) {
			var str = url.substr(1);
			var strs = str.split("=");
			const userInfo = JSON.parse(unescape(strs[1]));
			const uid = userInfo.Username;
			if (uid == undefined) { return false; }
			const access = userInfo.AccessToken;
			const refresh = userInfo.RefreshToken;
			const time = userInfo.Expiration;
			const sub = userInfo.sub;
			const verified = userInfo.email_verified;
			const given_name = userInfo.given_name;
			const family_name = userInfo.family_name;
			const email = userInfo.email;
			this.user = userInfo;
			this.userID = uid;
			this.userShownName = email;
			return true;				  
		} else {
			return false;
		}
	},
	 
	// signInCustomUser: function(uid) {
	// 	$.get( "https://us-central1-a1-f09ef.cloudfunctions.net/permission?uid=" + uid, (data) => {
	// 				const token = data.customToken;
	// 				console.log(token);
	// 				// TODO: post a request to verify this user information and permission.
	// 				// $.post("test.php", { "func": "getNameAndTime" }, (data) => {
	// 				// 		alert(data.name); // John
	// 				// 		console.log(data.time); //  2pm
	// 				// 	}, "json");
	// 				firebase.auth().signInWithCustomToken(token).catch((error) => {
	// 					// Handle Errors here.
	// 					var errorCode = error.code;
	// 					var errorMessage = error.message;
	// 					// ...
	// 				});
	// 			});	
	// },

    createChildren: function () {
        // cache the document object
		this.$easy = $("#btn-easy");
		this.$hard = $("#btn-hard");
		this.$submit = $("#btn-submit");

        return this;
    },

    setupHandlers: function () {
	
		this.easyButtonHandler = this.easyButton.bind(this);
		this.hardButtonHandler = this.hardButton.bind(this);
		this.submitButtonHandler = this.submitButton.bind(this);

        /**
        Handlers from Event Dispatcher
        */

		this.easyHandler = this.easy.bind(this);
		this.hardHandler = this.hard.bind(this);
		this.submitHandler = this.submit.bind(this);

        return this;
    },

    enable: function () {

		this.$easy.click(this.easyButtonHandler);
		this.$hard.click(this.hardButtonHandler);
		this.$submit.click(this.submitButtonHandler);

        /**
         * Event Dispatcher
         */

		this.model.easyEvent.attach(this.easyHandler);
		this.model.hardEvent.attach(this.hardHandler);
		this.model.submitEvent.attach(this.submitHandler);

        return this;
    },
	
	easyButton: function () {
		this.easyEvent.notify();
	},
	
	hardButton: function () {
		this.hardEvent.notify();
	},
	
	submitButton: function () {
		this.submitEvent.notify();
	},

	hideInitContainer: function() {
		$("#init-container").hide();
	},
	
	showBtnContainer: function() {
		$("#btn-container").show();
	},
	
	buildQuestion: function (diffecult) {
		$("#alert-message").remove();
		if (diffecult === 1) {
			var tag = "easy";
		} else if (diffecult === 2) {
			var tag = "hard";
		} else {
			return -1;
		}
		var num = this.model.getNumber();
		var quiz = this.model.getQuestions();
		for (let i=0; i<num; i++) {
			if (quiz[i].tag === tag) {
				$( "#text-container" ).append(" \
				<div class='question-block' id='block"+i+"'>\
				  <hr>\
					<p class='lead' id='q"+i+"-text'>"+quiz[i].questionText+"</p>\
					<input type='radio' name='q"+i+"' id='q"+i+"a'>\
					<label id='q"+i+"0'>"+quiz[i].answerA+"</label><br>\
					<input type='radio' name='q"+i+"' id='q"+i+"b'>\
					<label id='q"+i+"1'>"+quiz[i].answerB+"</label><br>\
					<input type='radio' name='q"+i+"' id='q"+i+"c'>\
					<label id='q"+i+"2'>"+quiz[i].answerC+"</label><br>\
					<input type='radio' name='q"+i+"' id='q"+i+"d'>\
					<label id='q"+i+"3'>"+quiz[i].answerD+"</label>\
				</div>\
			");
			}
		}

    },
	
	markQuestions: function (diffecult) {
		if (diffecult === 1) {
			var tag = "easy";
		} else if (diffecult === 2) {
			var tag = "hard";
		} else {
			return -1;
		}
		var num = this.model.getNumber();
		var quiz = this.model.getQuestions(); 
		var answer = this.model.getAnswers();
		var correct = 0;
		var quiznum = 0;
		for (let i=0; i<num; i++) {		
			if (quiz[i].tag === tag) {
				quiznum++;
				let radio = $("input[type='radio'][name='q"+i+"']");
				let index = radio.index(radio.filter(':checked'));
				if (index != answer[i]) {
					$("#block"+i).addClass("alert alert-danger");
					$("#q"+i+index).css('color', 'red');
					$("#q"+i+answer[i]).css('color', 'blue');
				} else {
					correct++;
					$("#block"+i).removeClass("alert alert-danger");
					for (let j=0; j<4; j++) {
						$("#q"+i+j).css('color', 'black');
					}
				}
			}
		}
		this.model.setScore(correct);
		this.model.setQuizNum(quiznum);
	},
	
	showResult: function () {
		$("#alert-message").remove();
		$("#alert-message-div").prepend(" \
			<div id='alert-message' class='container alert alert-success' role='alert'>\
			  <h4 class='alert-heading'>Successfully submitted!</h4>\
			  <p>Your final score is "+this.model.getScore()+" / "+this.model.getQuizNum()+"!</p>\
			  <button type='button' class='btn btn-primary btn-lg' id='btn-rank'>Ranking</button>\
			</div>\
		");
		$("#btn-rank").click(function(){
			if (this.email.length == 3) {
				this.showRank();
			} else {
				this.showRankAlert();
			}
		}.bind(this));

		window.scrollTo(0,0);
	},
	
	showWarning: function () {
		$("#alert-message").remove();
		$("#alert-message-div").prepend(" \
			<div id='alert-message' class='container alert alert-danger' role='alert'>\
			  <h4 class='alert-heading'>Failed to read data!</h4>\
			  <p>There is no data in this selection or in our back-end database! Please check the storage and then refresh.</p>\
			</div>\
		");
	},

	writeRankData: function(userID, email, score) {
		this.database.ref('/records/' + this.model.getDiffecult() + '/' + userID).once('value').then(function(snapshot) {
			if (snapshot.val()) {
				console.log("Already have record!");
				return;
			} else {
				this.database.ref('records/' + this.model.getDiffecult() + '/' + userID).set({
					email: email,
					score: score
				});
			}
		}.bind(this));
	},

	readRankData: function() {
		this.database.ref('/records/' + this.model.getDiffecult() + '/').orderByChild('score').limitToLast(3).once('value').then(function(snapshot) {
			snapshot.forEach(e => {
				this.email.push(e.val().email);
				this.score.push(e.val().score);
			});
		}.bind(this));
	},

	showRank: function() {
		$("#alert-message").remove();
		$("#alert-message-div").prepend(" \
			<div id='alert-message' class='container alert alert-danger' role='alert'>\
			  <h4 class='alert-heading'>TOP RANKING</h4>\
			  <table class='table'>\
				<thead>\
					<tr>\
					<th scope='col'>#</th>\
					<th scope='col'>User</th>\
					<th scope='col'>Score</th>\
					</tr>\
				</thead>\
				<tbody>\
					<tr>\
					<th scope='row'>1</th>\
					<td>"+ this.email[2] +"</td>\
					<td>"+ this.score[2] +"</td>\
					</tr>\
					<tr>\
					<th scope='row'>2</th>\
					<td>"+ this.email[1] + "</td>\
					<td>"+ this.score[1] +"</td>\
					</tr>\
					<tr>\
					<th scope='row'>3</th>\
					<td>"+ this.email[0] +"</td>\
					<td>"+ this.score[0] +"</td>\
					</tr>\
				</tbody>\
				</table>\
			</div>\
		");
	},

	showRankAlert: function() {
		$("#alert-message").remove();
		$("#alert-message-div").prepend(" \
			<div id='alert-message' class='container alert alert-danger' role='alert'>\
			  <h4 class='alert-heading'>Failed to read ranking data!</h4>\
			  <p>There seems no enough data in ranking. Please wait a while.</p>\
			  <button type='button' class='btn btn-danger btn-lg' id='btn-leave'>Log Off</button>\
			</div>\
		");

	},

    /* -------------------- Handlers From Event Dispatcher ----------------- */
	
	easy: function () {
		this.model.setDiffecult(1);
		if (this.model.chkData() == 1) {
			this.hideInitContainer();
			this.showBtnContainer();
			this.buildQuestion(this.model.getDiffecult());
		} else {
			this.showWarning();
		}
	},
	
	hard: function () {
		this.model.setDiffecult(2);
		if (this.model.chkData() == 1) {
			this.hideInitContainer();
			this.showBtnContainer();
			this.buildQuestion(this.model.getDiffecult());
		} else {
			this.showWarning();
		}
	},
	
	submit: function () {
		this.markQuestions(this.model.getDiffecult());
		this.showResult();
		this.writeRankData(this.userID, this.userShownName, this.model.getScore());
		this.readRankData();
	},

    /* -------------------- End Handlers From Event Dispatcher ----------------- */


};