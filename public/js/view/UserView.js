var UserView = function (model) {
    this.model = model;
	this.easyEvent = new Event(this);
	this.hardEvent = new Event(this);
	this.submitEvent = new Event(this);
	this.diffecult = 0;
	this.user;
	this.database = firebase.database();
	this.email = [];
	this.score = [];

    this.init();
};

UserView.prototype = {

    init: function () {
        this.createChildren()
            .setupHandlers()
            .enable();
		//this.buildQuestion();
		$("#btn-container").hide();
		firebase.auth().onAuthStateChanged(function(user) {
			if (user) {
			this.user = user;
			  var displayName = user.displayName;
			  var email = user.email;
			  var emailVerified = user.emailVerified;
			  var photoURL = user.photoURL;
			  var isAnonymous = user.isAnonymous;
			  var uid = user.uid;
			  var providerData = user.providerData;
			  $("#user-welcome").html("Welcome! " + email);
			} else {
				window.location.href="index.html";
			}
		}.bind(this));
    },

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
			if (this.email.length >= 3) {
				this.reorderRank();
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
		this.database.ref('users/' + userID + '--' + this.model.getDiffecult() + '--').set({
			email: email,
			score: score
		});
	},

	readRankData: function() {
		this.database.ref('/users/').orderByChild('score').once('value').then(function(snapshot) {
			snapshot.forEach(e => {
				console.log(e);
				console.log(e.val());
				console.log(e.key);
				if (e.key.indexOf('--' + this.model.getDiffecult() + '--') != -1) {
					this.email.push(e.val().email);
					this.score.push(e.val().score);
				}
			});
		}.bind(this));
	},

	reorderRank: function() {
		var length = this.email.length;
		for (let i=0; i<length/2; ++i) {
			let buffer1 = this.email[i];
			this.email[i] = this.email[length - i - 1];
			this.email[length - i - 1] = buffer1;
			let buffer2 = this.score[i];
			this.score[i] = this.score[length - i - 1];
			this.score[length - i - 1] = buffer2;
		}
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
					<td>"+ this.email[0] +"</td>\
					<td>"+ this.score[0] +"</td>\
					</tr>\
					<tr>\
					<th scope='row'>2</th>\
					<td>"+ this.email[1] + "</td>\
					<td>"+ this.score[1] +"</td>\
					</tr>\
					<tr>\
					<th scope='row'>3</th>\
					<td>"+ this.email[2] +"</td>\
					<td>"+ this.score[2] +"</td>\
					</tr>\
				</tbody>\
				</table>\
				<button type='button' class='btn btn-danger btn-lg' id='btn-leave'>Log Off</button>\
			</div>\
		");
		$("#btn-leave").click(function(){
			window.location.href="index.html";
			firebase.auth().signOut();
		}.bind(this));

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
		$("#btn-leave").click(function(){
			window.location.href="index.html";
			firebase.auth().signOut();
		}.bind(this));

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
		this.writeRankData(this.user.uid, this.user.email, this.model.getScore());
		this.readRankData();
	},

    /* -------------------- End Handlers From Event Dispatcher ----------------- */


};