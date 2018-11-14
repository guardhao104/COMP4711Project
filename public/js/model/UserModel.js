var UserModel = function () {
	this.number = 0;
	this.score = 0;
	this.quizNum = 0;
	this.diffecult = 0;
	this.questions = [];
	this.answers = [];
	this.easyEvent = new Event(this);
	this.hardEvent = new Event(this);
	this.submitEvent = new Event(this);
	this.database = firebase.database();
	
	this.init();
};

UserModel.prototype = {
	init: function () {
		this.readQuiz();
	},
	
	readQuiz: function() {
	return this.database.ref('/quiz/').once('value').then(function(snapshot) {
		var quiz = (snapshot.val() && snapshot.val().quiz) || 'UNKNOWN';
		this.initQuiz(quiz);
	}.bind(this));
	},

	initQuiz: function(quiz) {
		this.questions = quiz;
		this.number = this.questions.length;
		for (let i=0; i<this.number; i++) {
				this.answers.push(this.questions[i].correct);
		}
	},
		
	chkData: function() {
		if (this.number == 0) {
			return 0;
		}
		if (this.diffecult === 1) {
			for (let i=0;i<this.number;i++) {
				if (this.questions[i].tag == "easy") {
					return 1;
				}
			}
		}
		if (this.diffecult === 2) {
			for (let i=0;i<this.number;i++) {
				if (this.questions[i].tag == "hard") {
					return 1;
				}
			}
		}
		return 0;
	},
	
	getQuestions: function () {
		return this.questions;
	},
	
	easy: function () {
		this.easyEvent.notify();
	},
	
	hard: function () {
		this.hardEvent.notify();
	},
	
	submit: function () {
		this.submitEvent.notify();
	},
	
	getNumber: function () {
		return this.number;
	},
	
	setScore:function (num) {
		this.score = num;
	},
	
	getScore: function () {
		return this.score;
	},
	
	setQuizNum: function (num) {
		this.quizNum = num;
	},
	
	getQuizNum: function () {
		return this.quizNum;
	},
	
	setDiffecult: function (num) {
		this.diffecult = num;
	},
	
	getDiffecult: function () {
		return this.diffecult;
	},
	
	getAnswers: function() {
		return this.answers;
	},

};