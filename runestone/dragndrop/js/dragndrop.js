/*==========================================
=======     Master dragndrop.js     ========
============================================
===     This file contains the JS for    ===
=== the Runestone Drag n drop component. ===
============================================
===              Created by              ===
===           Isaiah Mayerchak           ===
===                7/6/15                ===
==========================================*/

function RunestoneBase () {   // Basic parent stuff

}
RunestoneBase.prototype.logBookEvent = function (info) {
    console.log("logging event " + this.divid);
};
RunestoneBase.prototype.logRunEvent = function (info) {
    console.log("running " + this.divid);
};

var ddList = {};    // Dictionary that contains all instances of dragndrop objects


function DragNDrop (opts) {
    if (opts) {
        this.init(opts);
    }
}

DragNDrop.prototype = new RunestoneBase();

/*========================================
== Initialize basic DragNDrop attributes ==
========================================*/
DragNDrop.prototype.init = function (opts) {
    RunestoneBase.apply(this, arguments);
    var orig = opts.orig;    // entire <ul> element that will be replaced by new HTML
    this.origElem = orig;
    this.divid = orig.id;

    this.random = false;
    if ($(this.origElem).is("[data-random]")) {
        this.random = true;
    }

    this.dragPairArray = [];
    this.populateArray();

    this.question = null;
    this.getQuestion();

    this.createNewElements();
};

DragNDrop.prototype.populateArray = function () {
    for (var i = 0; i < this.origElem.childNodes.length; i++) {
        if ($(this.origElem.childNodes[i]).data("component") === "dropzone") {

            var tmp = document.getElementById($(this.origElem.childNodes[i]).attr("for"));
            var replaceSpan = document.createElement("span");
            replaceSpan.innerHTML = tmp.innerHTML;
            replaceSpan.id = tmp.id;
            $(replaceSpan).attr("draggable","true");
            $(replaceSpan).addClass("draggable-drag");

            var otherReplaceSpan = document.createElement("span");

            otherReplaceSpan.innerHTML = this.origElem.childNodes[i].innerHTML;
            otherReplaceSpan.id = this.origElem.childNodes[i].id;
            $(otherReplaceSpan).addClass("draggable-drop");

            this.setEventListeners(replaceSpan, otherReplaceSpan);
            var tmpArr = [];
            tmpArr.push(replaceSpan);
            tmpArr.push(otherReplaceSpan);
            this.dragPairArray.push(tmpArr);
        }
    }
};

DragNDrop.prototype.getQuestion = function () {
    for (var i = 0; i < this.origElem.childNodes.length; i++) {
        if ($(this.origElem.childNodes[i]).data("component") === "question") {
            this.question = this.origElem.childNodes[i].innerHTML;
        }
    }
};

DragNDrop.prototype.createNewElements = function () {
    this.containerDiv = document.createElement("div");
    $(this.containerDiv).addClass("sortable-code-container");

    this.draggableDiv = document.createElement("div");
    //CSS style it to left
    $(this.draggableDiv).addClass("draggable dragzone");

    this.dropZoneDiv = document.createElement("div");
    //CSS style it to right
    $(this.dropZoneDiv).addClass("draggable");
    this.containerDiv.appendChild(this.draggableDiv);
    this.containerDiv.appendChild(this.dropZoneDiv);

    this.createButton();
    this.setReplacementSpans();
    this.renderFeedbackDiv();

    $(this.origElem).replaceWith(this.containerDiv);
};

DragNDrop.prototype.createButton = function () {
    this.submitButton = document.createElement("button");    // Check me button
    this.submitButton.textContent = "Check Me";
    $(this.submitButton).attr({
        "class": "btn btn-success drag-button",
        "name": "do answer",
    });

    this.submitButton.onclick = function () {
        this.dragEval();
    }.bind(this);

    this.containerDiv.appendChild(this.submitButton);
};

DragNDrop.prototype.setReplacementSpans = function () {
    this.createIndexArray();
    this.randomizeIndexArray();
    for (var i = 0; i < this.dragPairArray.length; i++) {
        this.draggableDiv.appendChild(this.dragPairArray[this.indexArray[i]][0]);
    }
    this.randomizeIndexArray();
    for (var i = 0; i < this.dragPairArray.length; i++) {
        this.dropZoneDiv.appendChild(this.dragPairArray[this.indexArray[i]][1]);
    }
};

DragNDrop.prototype.setEventListeners = function (dgSpan, dpSpan) {
    dgSpan.addEventListener("dragstart", function (ev) {
        ev.dataTransfer.setData("draggableID", ev.target.id);
    });
    dgSpan.addEventListener("dragover", function (ev) {
        ev.preventDefault();
    });
    dgSpan.addEventListener("drop", function (ev) {
        ev.preventDefault();
        var data = ev.dataTransfer.getData("draggableID");
        var draggedSpan = document.getElementById(data);
        if (!$(this.draggableDiv).has(draggedSpan).length && draggedSpan != ev.target) {  // Make sure element isn't already there--prevents erros w/appending child
            this.draggableDiv.appendChild(draggedSpan);
        }
    }.bind(this));

    dpSpan.addEventListener("dragover", function (ev) {
        ev.preventDefault();
    });
    dpSpan.addEventListener("drop", function (ev) {
        ev.preventDefault();
        var data = ev.dataTransfer.getData("draggableID");
        var draggedSpan = document.getElementById(data);
        if (!$(ev.target).has(draggedSpan).length && $(ev.target).hasClass("draggable-drop")) {  // Make sure element isn't already there--prevents erros w/appending child
            ev.target.appendChild(draggedSpan);
        }
    });
};

DragNDrop.prototype.createIndexArray = function () {
    this.indexArray = [];
    for (var i = 0; i < this.dragPairArray.length; i++) {
        this.indexArray.push(i);
    }
};

DragNDrop.prototype.randomizeIndexArray = function () {
    var currentIndex = this.indexArray.length, temporaryValue, randomIndex;
    // While there remain elements to shuffle...
    while (currentIndex !== 0) {
        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
        // And swap it with the current element.
        temporaryValue = this.indexArray[currentIndex];
        this.indexArray[currentIndex] = this.indexArray[randomIndex];
        this.indexArray[randomIndex] = temporaryValue;
    }
};

DragNDrop.prototype.renderFeedbackDiv = function () {
    this.feedBackDiv = document.createElement("div");
    this.feedBackDiv.id = this.divid + "_feedback";
    this.containerDiv.appendChild(document.createElement("br"));
    this.containerDiv.appendChild(this.feedBackDiv);
};

DragNDrop.prototype.dragEval = function () {
    this.correct = true;
    for (var i = 0; i < this.dragPairArray.length; i++) {
        if (!$(this.dragPairArray[i][1]).has(this.dragPairArray[i][0]).length) {
            this.correct = false;
        }
    }
    this.renderFeedback();
};

DragNDrop.prototype.renderFeedback = function () {
    this.feedback = null;
    if (this.correct) {
        $(this.feedBackDiv).html("You are correct!");
        $(this.feedBackDiv).attr("class", "alert alert-success draggable-feedback");
    } else {
        if (this.feedback == null) {
            this.feedback = "You suck";
        }
        $(this.feedBackDiv).html("Incorrect.    " + this.feedback);
        $(this.feedBackDiv).attr("class", "alert alert-danger draggable-feedback");
    }
};
/*=================================
== Find the custom HTML tags and ==
==   execute our code on them    ==
=================================*/
$(document).ready(function () {
    $("[data-component=dragndrop]").each(function (index) {
        ddList[this.id] = new DragNDrop({"orig": this});
    });

});
