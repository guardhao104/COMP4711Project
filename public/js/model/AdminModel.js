var AdminModel = function () {
	this.number = 1;
	this.questions = [];
	this.addQuestionEvent = new Event(this);
	this.removeQuestionEvent = new Event(this);
	this.submitEvent = new Event(this);
	this.database = firebase.database();
};

AdminModel.prototype = {

	addQuestion: function () {
		this.number++;
		this.addQuestionEvent.notify();
	},
	
	removeQuestion: function () {
		if (this.number >= 2) {
			this.number--;
			this.removeQuestionEvent.notify();
		}
	},
	
	submit: function () {
		this.writeQuiz(this.questions);
		this.submitEvent.notify();
	},
	
	setQuestions: function (quizes) {
		this.questions = quizes;
	},
	
	getNumber: function () {
		return this.number;
	},
	
	writeQuiz: function(qst) {
		this.database.ref('quiz/').set({
			quiz: qst
		});
	},

};