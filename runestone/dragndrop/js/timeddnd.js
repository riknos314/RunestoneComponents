function TimedDragNDrop (opts) {
    if (opts) {
        this.timedInit(opts);
    }
}
TimedDragNDrop.prototype = new DragNDrop();

TimedDragNDrop.prototype.timedInit = function (opts) {
    this.init(opts);
    this.renderTimedIcon(this.containerDiv);
    this.hideButtons();
};


TimedDragNDrop.prototype.hideButtons = function () {
    $(this.submitButton).hide();
};

TimedDragNDrop.prototype.renderTimedIcon = function (component) {
    // renders the clock icon on timed components.    The component parameter
    // is the element that the icon should be appended to.
    var timeIconDiv = document.createElement("div");
    var timeIcon = document.createElement("img");
    $(timeIcon).attr({
        "src": "../_static/clock.png",
        "style": "width:15px;height:15px"
    });
    timeIconDiv.className = "timeTip";
    timeIconDiv.title = "";
    timeIconDiv.appendChild(timeIcon);
    $(component).prepend(timeIconDiv);
};

TimedDragNDrop.prototype.checkCorrectTimed = function () {
    // Returns if the question was correct.    Used for timed assessment grading.
    return this.correct;
};

TimedDragNDrop.prototype.hideFeedback = function () {
    $(this.feedBackDiv).hide();
};

TimedDragNDrop.prototype.processTimedSubmission = function () {
    $(this.resetButton).hide();
    for (var i = 0; i < this.dragPairArray.length; i++) {   // No more dragging
        if ($(this.dragPairArray[i][0]).attr("draggable") === "true") {
            $(this.dragPairArray[i][0]).attr("draggable", "false");
            $(this.dragPairArray[i][0]).css("cursor", "initial")
        }
    }
    console.log(this.dragPairArray);
    this.dragEval();
};
