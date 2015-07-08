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
    this.feedback = "";
    this.dragPairArray = [];
    this.question = "";

    this.checkLocalStorage();
    this.populate();   // Populates this.dragPairArray, this.feedback and this.question

    this.createNewElements();
};

DragNDrop.prototype.populate = function () {

    if (this.hasStoredDropZones) {
        for (var i = 0; i < this.storedDropZones.length; i++) {

        }
    } else {
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
                $(otherReplaceSpan).addClass("draggable-drop");

                this.setEventListeners(replaceSpan, otherReplaceSpan);
                var tmpArr = [];
                tmpArr.push(replaceSpan);
                tmpArr.push(otherReplaceSpan);
                this.dragPairArray.push(tmpArr);
            } else if ($(this.origElem.childNodes[i]).data("component") === "question") {
                this.question = this.origElem.childNodes[i].innerHTML;
            } else if ($(this.origElem.childNodes[i]).data("component") === "feedback") {
                this.feedback = this.origElem.childNodes[i].innerHTML;
            }
        }
    }

};

DragNDrop.prototype.createNewElements = function () {
    this.containerDiv = document.createElement("div");
    $(this.containerDiv).addClass("alert alert-warning draggable-container");
    $(this.containerDiv).text(this.question);
    this.containerDiv.appendChild(document.createElement("br"));

    this.draggableDiv = document.createElement("div");
    $(this.draggableDiv).addClass("draggable dragzone");
    this.draggableDiv.addEventListener("dragover", function (ev) {  // Can't set these during this.setEventListeners because this.draggableDiv wasn't created yet
        ev.preventDefault();
    });
    this.draggableDiv.addEventListener("drop", function (ev) {
        ev.preventDefault();
        var data = ev.dataTransfer.getData("draggableID");
        var draggedSpan = document.getElementById(data);
        if (!$(this.draggableDiv).has(draggedSpan).length) {  // Make sure element isn't already there--prevents erros w/appending child
            this.draggableDiv.appendChild(draggedSpan);
        }
    }.bind(this));

    this.dropZoneDiv = document.createElement("div");
    $(this.dropZoneDiv).addClass("draggable");
    this.containerDiv.appendChild(this.draggableDiv);
    this.containerDiv.appendChild(this.dropZoneDiv);

    this.createButtons();
    this.appendReplacementSpans();
    this.renderFeedbackDiv();

    $(this.origElem).replaceWith(this.containerDiv);
    if (!this.hasStoredDropZones) {
        this.minheight = $(this.draggableDiv).height();
    }
    this.draggableDiv.style.minHeight = this.minheight.toString() + "px";
};

DragNDrop.prototype.createButtons = function () {
    this.buttonDiv = document.createElement("div");
    this.submitButton = document.createElement("button");    // Check me button
    this.submitButton.textContent = "Check Me";
    $(this.submitButton).attr({
        "class": "btn btn-success drag-button",
        "name": "do answer",
    });

    this.submitButton.onclick = function () {
        this.dragEval();
    }.bind(this);

    this.resetButton = document.createElement("button");    // Check me button
    this.resetButton.textContent = "Reset";
    $(this.resetButton).attr({
        "class": "btn btn-default drag-button drag-reset",
        "name": "do answer",
    });

    this.resetButton.onclick = function () {
        this.resetDraggables();
    }.bind(this);

    this.buttonDiv.appendChild(this.submitButton);
    this.buttonDiv.appendChild(this.resetButton);
    this.containerDiv.appendChild(this.buttonDiv);
};

DragNDrop.prototype.appendReplacementSpans = function () {
    this.createIndexArray();
    this.randomizeIndexArray();
    if (this.hasStoredDropZones) {

    } else {
        for (var i = 0; i < this.dragPairArray.length; i++) {
            this.draggableDiv.appendChild(this.dragPairArray[this.indexArray[i]][0]);
        }
        this.randomizeIndexArray();
        for (var i = 0; i < this.dragPairArray.length; i++) {
            this.dropZoneDiv.appendChild(this.dragPairArray[this.indexArray[i]][1]);
        }
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
        if (this.hasNoDragChild(ev.target) && draggedSpan != ev.target) {  // Make sure element isn't already there--prevents erros w/appending child
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
        if ($(ev.target).hasClass("draggable-drop") && this.hasNoDragChild(ev.target)) {  // Make sure element isn't already there--prevents erros w/appending child
            ev.target.appendChild(draggedSpan);
        }
    }.bind(this));
};

DragNDrop.prototype.hasNoDragChild = function (parent) {  // Ensures that each dropZoneDiv can have only one draggable child
    var counter = 0;
    for (var i = 0; i < parent.childNodes.length; i++) {
        if ($(parent.childNodes[i]).attr("draggable") === "true") {
            counter++;
        }
    }
    if (counter >= 1) {
        return false;
    } else {
        return true;
    }
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

DragNDrop.prototype.resetDraggables = function () {
    for (var i = 0; i < this.dragPairArray.length; i++) {
        for (var j = 0; j < this.dragPairArray[i][1].childNodes.length; j++) {
            if ($(this.dragPairArray[i][1].childNodes[j]).attr("draggable") === "true") {
                this.draggableDiv.appendChild(this.dragPairArray[i][1].childNodes[j]);
            }
        }
    }
    this.feedBackDiv.style.display = "none";
};

DragNDrop.prototype.renderFeedbackDiv = function () {
    this.feedBackDiv = document.createElement("div");
    this.feedBackDiv.id = this.divid + "_feedback";
    this.containerDiv.appendChild(document.createElement("br"));
    this.containerDiv.appendChild(this.feedBackDiv);
};

DragNDrop.prototype.dragEval = function () {
    this.correct = true;
    this.unansweredNum = 0;
    this.incorrectNum = 0;
    this.dragNum = this.dragPairArray.length;
    for (var i = 0; i < this.dragPairArray.length; i++) {
        if (!$(this.dragPairArray[i][1]).has(this.dragPairArray[i][0]).length) {
            this.correct = false;
            this.incorrectNum++;
        }
        if (this.hasNoDragChild(this.dragPairArray[i][1])) {
            this.unansweredNum++;
            this.incorrectNum -= 1;
        }
    }
    this.correctNum = this.dragNum - this.incorrectNum - this.unansweredNum;
    this.setLocalStorage();
    this.renderFeedback();
};

DragNDrop.prototype.setLocalStorage = function () {
    localStorage.setItem(eBookConfig.email + ":" + this.divid + "masterarray", this.dragPairArray.join(";"));
    localStorage.setItem(eBookConfig.email + ":" + this.divid + "-minheight", this.minHeight.toString());
};

DragNDrop.prototype.checkLocalStorage = function () {
    this.hasStoredDropZones = false;
    var len = localStorage.length;
    if (len > 0) {
        var tmpOne = localStorage.getItem(eBookConfig.email + ":" + this.divid + "-masterarray");
        var tmpTwo = localStorage.getItem(eBookConfig.email + ":" + this.divid + "-minheight");
        if (tmpOne !== null && tmpTwo !== null && tmpThree !== null) {
            this.hasStoredDropzones = true;
            this.masterArray = tmpOne.split(";");

            this.storageDropZonesArray = [];
            this.storageDraggablesArray = [];
            for (var i = 0; i < this.masterArray.length; i++) {
                this.storageDropZonesArray.push(this.masterArray[i][1]);
                this.storageDraggablesArray.push(this.masterArray[i][0]);
            }

            this.minHeight = tmpTwo;
        }
    }
};

DragNDrop.prototype.renderFeedback = function () {
    this.feedBackDiv.style.display = "block";
    if (this.correct) {
        $(this.feedBackDiv).html("You are correct!");
        $(this.feedBackDiv).attr("class", "alert alert-success draggable-feedback");
    } else {
        $(this.feedBackDiv).html("Incorrect. " + "You got " + this.correctNum + " correct and " + this.incorrectNum + " incorrect out of " + this.dragNum + ". You left " + this.unansweredNum + " blank. " + this.feedback);
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
