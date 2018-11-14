var UserController = function (model, view) {
    this.model = model;
    this.view = view;

    this.init();
};

UserController.prototype = {

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
		this.easyHandler = this.easy.bind(this);
		this.hardHandler = this.hard.bind(this);
		this.submitHandler = this.submit.bind(this);

        return this;
    },

    enable: function () {
		this.view.easyEvent.attach(this.easyHandler);
		this.view.hardEvent.attach(this.hardHandler);
		this.view.submitEvent.attach(this.submitHandler);

        return this;
    },
	
	easy: function () {
		this.model.easy();
	},
	
	hard: function () {
		this.model.hard();
	},
	
	submit: function () {
		this.model.submit();
	},


};