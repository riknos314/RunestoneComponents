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

    this.draggableArray = [];
    this.dropZoneArray = [];
    this.populateArrays();

    this.question = null;
    this.getQuestion();

    this.createNewElements();
};

DragNDrop.prototype.populateArrays = function () {
    for (var i = 0; i < this.origElem.childNodes.length; i++) {
        if ($(this.origElem.childNodes[i]).data("component") === "draggable") {
            this.draggableArray.push(this.origElem.childNodes[i]);
        } else if ($(this.origElem.childNodes[i]).data("component") === "dropzone") {
            this.dropZoneArray.push(this.origElem.childNodes[i]);
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

    this.setReplacementSpans();

    $(this.origElem).replaceWith(this.containerDiv);
};

DragNDrop.prototype.setReplacementSpans = function () {
    for (var i = 0; i < this.draggableArray.length; i++) {
        var replaceSpan = document.createElement("span");
        replaceSpan.innerHTML = this.draggableArray[i].innerHTML;
        replaceSpan.id = this.draggableArray[i].id;
        $(replaceSpan).attr("draggable","true");

        var otherReplaceSpan = document.createElement("span");

        otherReplaceSpan.innerHTML = this.dropZoneArray[i].innerHTML;
        $(otherReplaceSpan).addClass("dropzone");
        otherReplaceSpan.id = this.dropZoneArray[i].id;

        this.setEventListeners(replaceSpan, otherReplaceSpan);

        this.draggableDiv.appendChild(replaceSpan);
        this.dropZoneDiv.appendChild(otherReplaceSpan);
        //this.dropZoneDiv.appendChild(document.createElement("br"));
    }
};

DragNDrop.prototype.setEventListeners = function (dgSpan, dpSpan) {
    dgSpan.addEventListener("dragstart", function (ev) {
        ev.dataTransfer.setData("asdf", ev.target.id);
    });
    dgSpan.addEventListener("dragover", function (ev) {
        ev.preventDefault();
    });
    dgSpan.addEventListener("drop", function (ev) {
        ev.preventDefault();
        var data = ev.dataTransfer.getData("asdf");
        var draggedSpan = document.getElementById(data);
        if ($(this.draggableDiv).has(draggedSpan).context != draggedSpan) {  // Make sure element isn't already there--prevents erros w/appending child
            this.draggableDiv.appendChild(draggedSpan);
        }
    }.bind(this));

    dpSpan.addEventListener("dragover", function (ev) {
        ev.preventDefault();
    });
    dpSpan.addEventListener("drop", function (ev) {
        ev.preventDefault();
        var data = ev.dataTransfer.getData("asdf");
        var draggedSpan = document.getElementById(data);
        if ($(ev.target).has(draggedSpan).context != draggedSpan && $(ev.target).hasClass("dropzone")) {  // Make sure element isn't already there--prevents erros w/appending child
            ev.target.appendChild(draggedSpan);
        }
    });
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
