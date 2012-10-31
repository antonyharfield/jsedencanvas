var root;
var eden;
var inputBox;
var selected_observable = null;
var selected_function = null;

$(document).ready(function(){

	initialiseEden();
	
    // Set height
	resizeContent();
	$(window).resize(function(){ resizeContent(); });
	
	// Set CodeMirror
	inputBox = CodeMirror($('#inputbox').get(0), {
	  value: "myCirc is Circle(canvas_width/2, canvas_height/2, canvas_height/3, \"red\", \"clear\");\ncanvas is [myCirc];",
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
	
	initialiseCanvas();
 });



function resizeContent() {
	var fullHeight = $(window).height() - $('#header').height();
    $('#sidebar').css({'height':(fullHeight)+'px'});

	var canvasHeight = fullHeight - $('#input').height()-3*$('#verticalhandler').height();
	$('#canvas').css({'height':(canvasHeight)+'px'});	
	
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
		if (create) {
			printObservables($("#observable-search").val());
			return;
		}
		
		var me = $("#sbobs_"+sym.name.substr(1));
		if (me === undefined) { return; }
		
		var namehtml;
		if (sym.definition !== undefined) {
			namehtml = "<span class=\"hasdef_text\">"+sym.name.substr(1)+"</span>";
		} else {
			namehtml = sym.name.substr(1);
		}

		var val = sym.value();
		var valhtml;
		if (typeof val == "boolean") { valhtml = "<span class='special_text'>"+val+"</span>"; }
		else if (typeof val == "undefined") { valhtml = "<span class='error_text'>undefined</span>"; }
		else if (typeof val == "string") { valhtml = "<span class='string_text'>\""+val+"\"</span>"; }
		else if (typeof val == "number") { valhtml = "<span class='numeric_text'>"+val+"</span>"; }
		else { valhtml = val; }

		me.html("<li class=\"type-observable\">" + namehtml + "<span class='result_value'> = " + valhtml + "</span></li>");
		
	});
	
	printObservables('');
	
	// Add error win
	$('<pre id="error-window" style="font-family:monospace;"></pre>').appendTo($('body'));
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



function initialiseCanvas() {
	$('#canvas').mousemove(function(e) {
			root.lookup('mouseX').assign(e.pageX-parseInt($('#content').css('margin-left')));
			root.lookup('mouseY').assign(e.pageY-parseInt($('#content').css('margin-top'))-parseInt($('#header').css('height')));
	});
	$('#canvas').click(function(e) {
			root.lookup('mouseClickX').assign(e.pageX-parseInt($('#content').css('margin-left')));
			root.lookup('mouseClickY').assign(e.pageY-parseInt($('#content').css('margin-top'))-parseInt($('#header').css('height')));
	});
}