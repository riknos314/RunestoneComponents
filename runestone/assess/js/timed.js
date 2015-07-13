/*===================================
=====================================
==== Begin Timed Assessment Code ====
=====================================
===================================*/

var TimedList = {};    // Timed dictionary

// Timed constructor
function Timed (opts) {
    if (opts) {
        this.init(opts);
    }
}


/*====================================
=== Setting Timed Assess Variables ===
====================================*/

Timed.prototype.init = function (opts) {
    var orig = opts.orig;
    this.origElem = orig; // the entire element of this timed assessment and all it"s children
    this.divid = orig.id;
    this.children = this.origElem.childNodes;

    this.timeLimit = 0;
    this.limitedTime = false;
    if (!isNaN($(this.origElem).data("time"))) {
        this.timeLimit = parseInt($(this.origElem).data("time"), 10) * 60; // time in seconds to complete the exam
        this.startingTime = this.timeLimit;
        this.limitedTime = true;
    }
    this.showFeedback = true;
    if ($(this.origElem).is("[data-no-feedback]")) {
        this.showFeedback = false;
    }
    this.showResults = true;
    if ($(this.origElem).is("[data-no-result]")) {
        this.showResults = false;
    }

    this.running = 0;
    this.paused = 0;
    this.done = 0;
    this.taken = 0;
    this.score = 0;
    this.incorrect = 0;
    this.skipped = 0;

    this.renderedQuestionArray = []; // list of all problems

    this.getNewChildren();
    this.renderTimedAssess();
};

Timed.prototype.getNewChildren = function () {
    this.newChildren = [];
    for (var i = 0; i < this.origElem.childNodes.length; i++) {
        this.newChildren.push(this.origElem.childNodes[i]);
    }
};

/*===============================
=== Generating new Timed HTML ===
===============================*/

Timed.prototype.renderTimedAssess = function () {
    this.renderContainer();
    this.renderTimer();
    this.renderControlButtons();
    this.assessDiv.appendChild(this.timedDiv);    // This can"t be appended in renderContainer because then it renders above the timer and control buttons.
    this.createRenderedQuestionArray();
    this.renderSubmitButton();
    this.renderFeedbackContainer();

    // Replace intermediate HTML with rendered HTML
    $(this.origElem).replaceWith(this.assessDiv);
};

Timed.prototype.renderContainer = function () {
    this.assessDiv = document.createElement("div"); // container for the entire Timed Component
    this.assessDiv.id = this.divid;
    this.timedDiv = document.createElement("div"); // div that will hold the questions for the timed assessment
    var elementHtml = $(this.origElem).html(); // take all of the tags that will generate the questions
    //$(this.timedDiv).html(elementHtml); // place those tags in the div
    for (var i = 0; i < this.newChildren.length; i++) {
        this.timedDiv.appendChild(this.newChildren[i]);
    }
    $(this.timedDiv).attr({ // set the id, and style the div to be hidden
        "id": "timed_Test",
        "style": "display:none"
    });
    console.log(this.timedDiv.childNodes);
    //this.newChildren = this.timedDiv.childNodes;    // These are the...
    // ...components that need to be rendered inside of the timed test
};

Timed.prototype.renderTimer = function () {
    this.wrapperDiv = document.createElement("div");
    this.timerContainer = document.createElement("P");
    this.wrapperDiv.id = "startWrapper";
    this.timerContainer.id = "output";
    this.wrapperDiv.appendChild(this.timerContainer);
};

Timed.prototype.renderControlButtons = function () {
    var _this = this;
    this.controlDiv = document.createElement("div");
    $(this.controlDiv).attr({
        "id": "controls",
        "style": "text-align: center"
    });
    this.startBtn = document.createElement("btn");
    this.pauseBtn = document.createElement("btn");
    $(this.startBtn).attr({
        "class": "btn btn-default",
        "id": "start"
    });
    this.startBtn.textContent = "Start";
    this.startBtn.addEventListener("click", function () {
        _this.startAssessment();
    }, false);
    $(this.pauseBtn).attr({
        "class": "btn btn-default",
        "id": "pause",
        "disabled":"true"
    });
    this.pauseBtn.textContent = "Pause";
    this.pauseBtn.addEventListener("click", function () {
        _this.pauseAssessment();
    }, false);
    this.controlDiv.appendChild(this.startBtn);
    this.controlDiv.appendChild(this.pauseBtn);
    this.assessDiv.appendChild(this.wrapperDiv);
    this.assessDiv.appendChild(this.controlDiv);
};
Timed.prototype.renderSubmitButton = function () {
    var _this = this;
    this.buttonContainer = document.createElement("div");
    $(this.buttonContainer).attr({"style": "text-align:center"});
    this.finishButton = document.createElement("button");
    $(this.finishButton).attr({
        "id": "finish",
        "class": "btn btn-inverse"
    });
    this.finishButton.textContent = "Submit answers";
    this.finishButton.addEventListener("click", function () {
        _this.finishAssessment();
    }, false);
    this.buttonContainer.appendChild(this.finishButton);
    this.timedDiv.appendChild(this.buttonContainer);
};

Timed.prototype.renderFeedbackContainer = function () {
    this.scoreDiv = document.createElement("P");
    this.scoreDiv.id = this.divid + "results";
    this.scoreDiv.style.display = "none";
    this.timedDiv.appendChild(this.scoreDiv);
};

Timed.prototype.createRenderedQuestionArray = function () {
    // this finds all the MCMF questions in this timed assessment and calls their constructor method
    // Also adds them to MCMFList
    var _this = this;
    for (var i = 0; i < this.newChildren.length; i++) {
        var tmpChild = this.newChildren[i];
        if ($(tmpChild).is("[data-component=multiplechoice]")) {
            _this.renderedQuestionArray.push(new TimedMC({"orig": tmpChild}));
        } else if ($(tmpChild).is("[data-component=fillintheblank]")) {
            var newFITB = new TimedFITB({"orig": tmpChild});
            _this.renderedQuestionArray.push(newFITB);
        }
    }
};


/*=================================
=== Timer and control Functions ===
=================================*/

Timed.prototype.startAssessment = function () {
    var _this = this;
    this.tookTimedExam();
    if (!_this.taken) {
        $(this.startBtn).attr("disabled", true);
        $(this.pauseBtn).attr("disabled", false);
        if (_this.running === 0 && _this.paused === 0) {
            _this.running = 1;
            $(this.timedDiv).show();
            _this.increment();
            logBookEvent({"event": "timedExam", "act": "start", "div_id": this.divid});
            localStorage.setItem(eBookConfig.email + ":" + this.divid, "started");
        }
    } else {
        $(this.startBtn).attr("disabled", true);
        $(this.pauseBtn).attr("disabled", true);
        $(this.finishButton).attr("disabled", true);
        _this.running = 0;
        _this.done = 1;
        $(this.timedDiv).show();
        $(this.time).text("Already completed");
        _this.submitTimedProblems();
    }
};

Timed.prototype.pauseAssessment = function () {
    if (this.done === 0) {
        if (this.running === 1) {
            this.running = 0;
            this.paused = 1;
            this.pauseBtn.innerHTML = "Resume";
            $(this.timedDiv).hide();
        } else {
            this.running = 1;
            this.paused = 0;
            this.increment();
            this.pauseBtn.innerHTML = "Pause";
            $(this.timedDiv).show();
        }
    }
};

Timed.prototype.showTime = function () { // displays the timer value
    var mins = Math.floor(this.timeLimit / 60);
    var secs = Math.floor(this.timeLimit) % 60;
    var minsString = mins;
    var secsString = secs;

    if (mins < 10) {
        minsString = "0" + mins;
    }
    if (secs < 10) {
        secsString = "0" + secs;
    }
    var begining = "Time Remaining    ";
    if (!this.limitedTime) {
        begining = "Time Taken    ";
    }
    var timeString =  begining + minsString + ":" + secsString;

    if (mins <= 0 && secs <= 0) {
        timeString = "Finished";
    }

    this.timerContainer.innerHTML = timeString;
    var timeTips = document.getElementsByClassName("timeTip");
    for (var i = 0; i <= timeTips.length - 1; i++) {
        timeTips[i].title = timeString;
    }
};

Timed.prototype.increment = function () { // increments the timer
    // if running (not paused) and not taken
    if (this.running === 1 && !this.taken) {
        var _this = this;
        setTimeout(function () {
            if (_this.limitedTime) {  // If there's a time limit, count down to 0
                _this.timeLimit--;
            } else {
                _this.timeLimit++; // Else count up to keep track of how long it took to complete
            }
            _this.showTime(_this.timeLimit);
            if (_this.timeLimit > 0) {
                _this.increment();
                // ran out of time
            } else {
                $(this.startBtn).attr({"disabled": "true"});
                $(this.finishButton).attr({"disabled": "true"});
                _this.running = 0;
                _this.done = 1;
                if (_this.taken === 0) {
                    _this.taken = 1;
                    _this.finishAssessment();
                }
            }
        }, 1000);
    }
};

Timed.prototype.checkIfFinished = function () {
    if (this.tookTimedExam()) {
        $(this.startBtn).attr("disabled", true);
        $(this.pauseBtn).attr("disabled", true);
        $(this.finishButton).attr("disabled", true);
        this.resetTimedMCMFStorage();
        //$(this.timedDiv).show();
    }
};

Timed.prototype.tookTimedExam = function () {
    // Checks if this exam has been taken before

    $("#output").css({
        "width": "50%",
        "margin": "0 auto",
        "background-color": "#DFF0D8",
        "text-align": "center",
        "border": "2px solid #DFF0D8",
        "border-radius": "25px"
    });

    $(this.scoreDiv).css({
        "width": "50%",
        "margin": "0 auto",
        "background-color": "#DFF0D8",
        "text-align": "center",
        "border": "2px solid #DFF0D8",
        "border-radius": "25px"
    });

    $(".tooltipTime").css({
        "margin": "0",
        "padding": "0",
        "background-color": "black",
        "color": "white"
    });

    var len = localStorage.length;
    var _this = this;
    if (len > 0) {
        if (localStorage.getItem(eBookConfig.email + ":" + this.divid) !== null) {
            _this.taken = 1;

        }else {
            _this.taken = 0;
        }
    }else {
        _this.taken = 0;
    }
};

Timed.prototype.finishAssessment = function () {
    this.findTimeTaken();
    this.timeLimit = 0;
    this.running = 0;
    this.done = 1;
    this.taken = 1;
    this.submitTimedProblems();
    this.checkScore();
    this.displayScore();
    this.storeScore();
    this.logScore();
    $(this.pauseBtn).attr("disabled", true);
    this.finishButton.disabled = true;
};

Timed.prototype.submitTimedProblems = function () {
    var _this = this;
    for (var i = 0; i < this.renderedQuestionArray.length; i++) {
        _this.renderedQuestionArray[i].processTimedSubmission();
    }
    if (!this.showFeedback) {
        this.hideTimedFeedback();
    }
};

Timed.prototype.hideTimedFeedback = function () {
    $(".eachFeedback").css("display", "none");
    for (var i = 0; i < this.FITBArray.length; i++) {
        var blanks = this.FITBArray[i].blankArray;
        for (var j = 0; j < blanks.length; j++) {
            (blanks[j]).removeClass("input-validation-error");
        }
        this.FITBArray[i].feedBackDiv.style.display = "none";
    }
};

Timed.prototype.checkScore = function () {
    // Gets the score of each MCMA problem
    for (var i = 0; i < this.renderedQuestionArray.length; i++) {
        var correct = this.renderedQuestionArray[i].checkCorrectTimed();
        if (correct) {
            this.score++;
        } else if (correct === null) {
            this.skipped++;
        } else {
            this.incorrect++;
        }
    }
};

Timed.prototype.findTimeTaken = function () {
    if (this.limitedTime) {
        this.timeTaken = this.startingTime - this.timeLimit;
    } else {
        this.timeTaken = this.timeLimit;
    }
};

Timed.prototype.storeScore = function () {
    var storage_arr = [];
    storage_arr.push(this.score, this.incorrect, this.skipped, this.timeTaken);
    localStorage.setItem(eBookConfig.email + ":" + this.divid, storage_arr.join(";"));
};

Timed.prototype.logScore = function () {
    logBookEvent({"event": "timedExam", "act": "finish", "div_id": this.divid, "correct": this.score, "incorrect": this.incorrect, "skipped": this.skipped, "time": this.timeTaken});
};

Timed.prototype.displayScore = function () {
    if (this.showResults) {
        var scoreString = "Num Correct: " + this.score + " Num Wrong: " + this.incorrect + " Num Skipped: " + this.skipped;
        var numQuestions = this.renderedQuestionArray.length;
        var percentCorrect = (this.score / numQuestions) * 100;
        scoreString += "    Percent Correct: " + percentCorrect + "%";
        $(this.scoreDiv).text(scoreString);
        this.scoreDiv.style.display = "block";
    }
};

/*=======================================================
=== Function that calls the constructors on page load ===
=======================================================*/

$(document).ready(function () {
    $("[data-component=timedAssessment]").each(function (index) {
        TimedList[this.id] = new Timed({"orig": this});
    });
    for (var key in TimedList) {
        if (TimedList.hasOwnProperty(key)) {
            var TimedChildren = TimedList[key].origElem.childNodes;
        }
    }

    $("[data-component=fillintheblank]").each(function (index) {    // FITB
        if ($.inArray(this.id, TimedChildren) < 0) { // If the fillintheblank element exists within a timed component, don"t render it here
            FITBList[this.id] = new FITB({"orig": this});
        }
    });

    $("[data-component=multiplechoice]").each(function (index) {    // MC
        if ($.inArray(this.id, TimedChildren) < 0) { // If the MC element exists within a timed component, don"t render it here
            mcList[this.id] = new MultipleChoice({"orig": this});
        }
    });

});
