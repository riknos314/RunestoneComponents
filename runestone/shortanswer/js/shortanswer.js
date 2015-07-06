/*==========================================
=======    Master shortanswer.js    ========
============================================
===     This file contains the JS for    ===
=== the Runestone shortanswer component. ===
============================================
===              Created by              ===
===           Isaiah Mayerchak           ===
===                7/2/15                ===
==========================================*/

function RunestoneBase () {   // Basic parent stuff

}
RunestoneBase.prototype.logBookEvent = function (info) {
    console.log("logging event " + this.divid);
};
RunestoneBase.prototype.logRunEvent = function (info) {
    console.log("running " + this.divid);
};

var saList = {};    // Dictionary that contains all instances of shortanswer objects


function ShortAnswer (opts) {
    if (opts) {
        this.init(opts);
    }
}

ShortAnswer.prototype = new RunestoneBase();

/*========================================
== Initialize basic ShortAnswer attributes ==
========================================*/
ShortAnswer.prototype.init = function (opts) {
    RunestoneBase.apply(this, arguments);
    var orig = opts.orig;    // entire <p> element that will be replaced by new HTML
    this.origElem = orig;
    this.divid = orig.id;

    this.optional = false;
    if ($(this.origElem).is("[data-optional]")) {
        this.optional = true;
    }

    this.renderHTML();
};

ShortAnswer.prototype.renderHTML = function() {
    this.containerDiv = document.createElement("div");
    this.containerDiv.id = this.divid;
    if (this.optional) {
        $(this.containerDiv).addClass("journal alert alert-success");
    } else {
        $(this.containerDiv).addClass("journal alert alert-warning");
    }

    this.newForm = document.createElement("form");
    this.newForm.id = this.divid + "_journal";
    this.newForm.name = this.newForm.id;
    this.newForm.action = "";
    this.containerDiv.appendChild(this.newForm);

    this.fieldSet = document.createElement("fieldset");

    this.legend = document.createElement("legend");
    this.legend.innerHTML = "Short Answer";

    this.firstLegendDiv = document.createElement("div");

};

/*

<div id='%(divid)s' class='journal alert alert-%(optional)s'>
    <form id='%(divid)s_journal' name='%(divid)s_journal' action="">
        <fieldset>
            <legend>Short Answer</legend>
            <div class='journal-question'>%(qnum)s: %(content)s</div>
            <div id='%(divid)s_journal_input'>
                <div class='journal-options'>
                    <label class='radio-inline'>
                        <textarea id='%(divid)s_solution' class="form-control" style="display:inline; width: 530px;"
                                  rows='4' cols='50'></textarea>
                    </label>
                </div><br />
                <div><button class="btn btn-default" onclick="submitJournal('%(divid)s');">Save</button></div>
                Instructor's Feedback:
                <div class='journal-options' style='padding-left:20px'>
                    <div class='bg-info form-control' style='width:530px; background-color: #eee; font-style:italic'
                         id='%(divid)s_feedback'>
                        There is no feedback yet.
                    </div>
                </div><br />
            </div>
        </fieldset>
    </form>
    <div id='%(divid)s_results'></div>
    <script type='text/javascript'>
        // check if the user has already answered this journal
        $(function() {
            loadJournal('%(divid)s');
        });
    </script>
</div>



*/







/*=================================
== Find the custom HTML tags and ==
==   execute our code on them    ==
=================================*/
$(document).ready(function () {
    $("[data-component=shortanswer]").each(function (index) {
        saList[this.id] = new ShortAnswer({"orig": this});
    });

});
