var root;
var eden;
var inputBox;
var selected_observable = null;
var selected_function = null;

$(document).ready(function(){

	initialiseEden();
	
	// Add error win
	$('<pre id="error-window" style="font-family:monospace;"></pre>').appendTo($('body'));
	
    // Set height/width
	resizeContent();
	$(window).resize(function(){ resizeContent(); });

	// Set CodeMirror
	inputBox = CodeMirror($('#inputbox').get(0), {
	  value: "",
	  mode:  "eden"
	});
	
	// Set up buttons
	$('#execute').click(function() {
		var inputText = inputBox.getValue();
		try {
			eval(Eden.translateToJavaScript(inputText));

			eden.addHistory(inputText);
		
			inputBox.setValue("");
		}
		catch (e) {
			Eden.reportError(e);
		}
	});
	$('#previous').click(function() {
		loadHistoryPrevious();
	});
	$('#next').click(function() {
		loadHistoryNext();
	});
	
	// Set up search
	$("#observable-search").keyup(function() {
		printObservables(this.value);
	});

	// Set up buttons
	$('#layoutButton').click(toggleSlides);
	$('#resetButton').click(function() {
		initialiseEden();
		resizeContent();
		eval(Eden.translateToJavaScript("canvas is []; slides is [];"));
	});
	
	// Load existing model
	eden.loadLocalModelState();
	
	// Save model state every 10 seconds
	setInterval(function() { eden.saveLocalModelState(); }, 10000);

});



function resizeContent() {
	var fullHeight = $(window).height() - $('#header').height();
    $('#sidebar').css({'height':(fullHeight)+'px'});

	var canvasHeight = fullHeight - $('#input').height()-3*$('#verticalhandler').height()-4;
	$('#canvas').css({'height':(canvasHeight)+'px'});	
	$('#slides').css({'height':(canvasHeight)+'px'});	
	
	var canvasWidth = $('#canvas').get(0).clientWidth;
	$('#d1canvas').get(0).height = canvasHeight;
	$('#d1canvas').get(0).width = canvasWidth;
	
	if (root !== undefined) {
		root.lookup('canvas_width').assign(canvasWidth);
		root.lookup('canvas_height').assign(canvasHeight);
	}
}




function initialiseEden() {
	root = new Folder();
	eden = new Eden(root);
	
	Eden.executeFile("library/eden.jse");
	
	// Global update (anything changes)
	root.addGlobal(function (sym, create) {
		printObservables($("#observable-search").val());
	});
}

function loadHistoryPrevious() {
	inputBox.setValue(eden.previousHistory());
}

function loadHistoryNext() {
	inputBox.setValue(eden.nextHistory());
}


function printObservables(pattern) {
	$('#observable-results').html('');
	var reg = new RegExp("^"+pattern+".*");
	$.each(root.symbols, function(name,symbol) { 
		if (name.search(reg) == -1) { return; }
		if (symbol.definition !== undefined) {
			if (symbol.eden_definition !== undefined) {
				var subs = symbol.eden_definition.substring(0,4);
				if (subs == "proc") {
					add_procedure(symbol, name);
				} else if (subs == "func") {
					add_function(symbol, name);
				} else {
					add_observable(symbol,name);
				}
			} else {
				add_observable(symbol,name);
			}
		} else {
			add_observable(symbol, name);
		}
	});
}


function toggleSlides() {
	$('#slides, #canvas').toggleClass('half');
	$(this).toggleClass('selected');
	resizeContent();
}

function showSlides() {
	$('#slides, #canvas').addClass('half');
	$('#layoutButton').addClass('selected');
	resizeContent();	
}
