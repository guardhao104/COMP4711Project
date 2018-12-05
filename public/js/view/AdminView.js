var AdminView = function (model) {
    this.model = model;
		this.addQuestionEvent = new Event(this);
		this.removeQuestionEvent = new Event(this);
		this.submitEvent = new Event(this);

    this.init();
};

AdminView.prototype = {

    init: function () {
        this.createChildren()
            .setupHandlers()
						.enable();
				firebase.auth().onAuthStateChanged(function(user) {
					if (user) {

					} else {
						window.location.href="login.html";
					}
				}.bind(this));
    },

    createChildren: function () {
        // cache the document object
        this.$container = $('.js-container');
		
		this.$add = $("#btn-add");
		this.$remove = $("#btn-remove");
		this.$submit = $("#btn-submit");

        return this;
    },

    setupHandlers: function () {
	
		this.addQuestionButtonHandler = this.addQuestionButton.bind(this);
		this.removeQuestionButtonHandler = this.removeQuestionButton.bind(this);
		this.submitButtonHandler = this.submitButton.bind(this);

        /**
        Handlers from Event Dispatcher
        */
		
		this.addQuestionHandler = this.addQuestion.bind(this);
		this.removeQuestionHandler = this.removeQuestion.bind(this);
		this.submitHandler = this.submit.bind(this);

        return this;
    },

    enable: function () {

		this.$add.click(this.addQuestionButtonHandler);
		this.$remove.click(this.removeQuestionButtonHandler);
		this.$submit.click(this.submitButtonHandler);

        /**
         * Event Dispatcher
         */
		this.model.addQuestionEvent.attach(this.addQuestionHandler);
		this.model.removeQuestionEvent.attach(this.removeQuestionHandler);
		this.model.submitEvent.attach(this.submitHandler);

        return this;
    },

	addQuestionButton: function () {
		this.addQuestionEvent.notify();
	},
	
	removeQuestionButton: function () {
		this.removeQuestionEvent.notify();
	},
	
	submitButton: function () {
		this.submitEvent.notify();
	},

	buildQuestion: function () {
		var num = this.model.getNumber();
        $( "#text-container" ).append(" \
			<div class='question-block'  id='block"+num+"'>\
			<div class='btn-group btn-group-toggle'>\
			<p class='font-weight-bold'>Question Text &lowast;</p>\
			<div class='tagbtn'>\
			  <label class='btn btn-warning'>\
				<input type='radio' name='difficult"+num+"' id='easy"+num+"' autocomplete='off' checked> EASY\
			  </label>\
			  <label class='btn btn-danger'>\
				<input type='radio' name='difficult"+num+"' id='hard"+num+"' autocomplete='off'> HARD\
			  </label>\
			</div>\
			</div>\
			<div class='input-group'>\
			  <textarea class='form-control question' id='q"+num+"text'></textarea>\
			</div>\
			<p class='font-weight-bold'>Answers &lowast;</p>\
			<div class='input-group'>\
			  <div class='input-group-prepend'>\
				<div class='input-group-text'>\
				  <input type='radio' name='q"+num+"' id='q"+num+"1'>\
				</div>\
			  </div>\
			  <input type='text' class='form-control option' id='q"+num+"a_text'>\
			</div>\
			<div class='input-group'>\
			  <div class='input-group-prepend'>\
				<div class='input-group-text'>\
				  <input type='radio' name='q"+num+"' id='q"+num+"2'>\
				</div>\
			  </div>\
			  <input type='text' class='form-control option' id='q"+num+"b_text'>\
			</div>\
			<div class='input-group'>\
			  <div class='input-group-prepend'>\
				<div class='input-group-text'>\
				  <input type='radio' name='q"+num+"' id='q"+num+"3'>\
				</div>\
			  </div>\
			  <input type='text' class='form-control option' id='q"+num+"c_text'>\
			</div>\
			<div class='input-group'>\
			  <div class='input-group-prepend'>\
				<div class='input-group-text'>\
				  <input type='radio' name='q"+num+"' id='q"+num+"4'>\
				</div>\
			  </div>\
			  <input type='text' class='form-control option' id='q"+num+"d_text'>\
			</div>\
		  </div>\
		");

    },
	
	chkInput: function (id) {
		var text = $(id).val();
		if (text == 0) {
			return 0;
		} else {
			return text;
		}
	},
	
	chkRadio: function (name) {
		var radio = $("input[type='radio'][name='"+name+"']");
		var index = radio.index(radio.filter(':checked'));
		return index;
	},
	
	getInputQuizes: function () {
		var quizes = [];
		for (let i=1; i<=this.model.getNumber(); i++) {
			let question_id = "#q" + i + "text";
			let opt_a_id = "#q" + i + "a_text";
			let opt_b_id = "#q" + i + "b_text";
			let opt_c_id = "#q" + i + "c_text";
			let opt_d_id = "#q" + i + "d_text";
			let radio_name = "q" + i;
			
			let ids = [question_id, opt_a_id, opt_b_id, opt_c_id, opt_d_id];
			let values = [];
			for (let j=0; j<ids.length; j++) {
				let text = this.chkInput(ids[j]);
				if (!text) {
					return 0;
				} else {
					values.push(text);
				}
			}
			let index = this.chkRadio(radio_name);
			let radio = $("input[type='radio'][name='difficult"+i+"']");
			let difficult = (radio.index(radio.filter(':checked'))===0) ? 1 : 2;
			if (index == -1) {
				return 0;
			} else {
				quizes.push({
				 questionText: values[0],
				 answerA: values[1],
				 answerB: values[2],
				 answerC: values[3],
				 answerD: values[4],
				 correct: index,
				 tag: difficult
				});
			}
		}
		return quizes;
	},
	
	alertSubmitSuccess: function () {
		$("#alert-fail-message").remove();
		if($("#alert-message").length == 0){
			$( "body" ).prepend(" \
			<div id='alert-message' class='container alert alert-success' role='alert'>\
			  <h4 class='alert-heading'>Successfully submitted!</h4>\
			  <p>Aww yeah, you successfully submitted all questions into local storage. If you open the user web page, there will be a quiz composed by these questions.</p>\
			  <hr>\
			  <p class='mb-0'>You can go to <a href='./login.html'>login page</a> now.</p>\
			</div>\
		");
		}
		window.scrollTo(0,0);
	},
	
	showSubmitFail: function () {
		if($("#alert-fail-message").length == 0){
			$( "body" ).prepend(" \
			<div id='alert-fail-message' class='container alert alert-success' role='alert'>\
			  <h4 class='alert-heading'>Refused to submit.</h4>\
			  <p>Sorry, you maight miss some information. Please check all area and try to submit again.</p>\
			  <hr>\
			  <p class='mb-0'>You should fill up all blocks and select one correct option for each question.</p>\
			</div>\
		");
		}
		window.scrollTo(0,0);
	},
		

    /* -------------------- Handlers From Event Dispatcher ----------------- */

	addQuestion: function () {
		this.buildQuestion();
	},
	
	removeQuestion: function () {
		var num = this.model.getNumber() + 1;
		if (num >= 2) {
			$( "#block" + num ).remove();
		}
	},
	
	submit: function () {
		this.alertSubmitSuccess();
	},

    /* -------------------- End Handlers From Event Dispatcher ----------------- */


};