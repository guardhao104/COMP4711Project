var AdminController = function (model, view) {
    this.model = model;
    this.view = view;

    this.init();
};

AdminController.prototype = {

    init: function () {
        this.createChildren()
            .setupHandlers()
            .enable();
    },

    createChildren: function () {
        // no need to create children inside the controller
        // this is a job for the view
        // you could all as well leave this function out
        return this;
    },

    setupHandlers: function () {
		this.addQuestionHandler = this.addQuestion.bind(this);
		this.removeQuestionHandler = this.removeQuestion.bind(this);
		this.submitHandler = this.submit.bind(this);

        return this;
    },

    enable: function () {

        this.view.addQuestionEvent.attach(this.addQuestionHandler);
		this.view.removeQuestionEvent.attach(this.removeQuestionHandler);
		this.view.submitEvent.attach(this.submitHandler);

        return this;
    },

	addQuestion: function () {
		this.model.addQuestion();
	},
	
	removeQuestion: function () {
		if (this.model.getNumber() >= 2) {
			this.model.removeQuestion();
		}
	},
	
	submit: function () {
		var quizes = this.view.getInputQuizes();
		if (quizes == 0) {
			this.view.showSubmitFail();
		} else {
			this.model.setQuestions(quizes);
			this.model.submit();
		}
	},


};