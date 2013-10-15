function add_procedure(symbol, name) {
	var proc = $('<div class="result-element type-procedure"></div>');
	proc.html("<li>" + name + "</li>").appendTo($('#observable-results'));

	proc.get(0).symbol = symbol;

	proc.hover(
		function() {
			$(this).animate({backgroundColor: "#eaeaea"}, 100);
		}, function() {
			$(this).animate({backgroundColor: "white"}, 100);
		}	
		).click(function() {
		
		this.dialog = procedure_dialog(this.symbol, this.dialog);
	});
};

function add_function(symbol, name) {
	var funchtml = "<li>" + name;
	var details;
	if ((!(typeof edenfunctions === "undefined")) && edenfunctions.functions != undefined && edenfunctions.functions[name] !== undefined) {
		details = edenfunctions.functions[name];
		funchtml = funchtml + "<span class='result_value'> ( ";
		if (edenfunctions.functions[name].parameters !== undefined) {
			for (x in edenfunctions.functions[name].parameters) {
				funchtml = funchtml + x + ", ";
			}
			funchtml = funchtml.substr(0,funchtml.length-2) + " )</span>";
		} else {
			funchtml = funchtml + " )</span>";
		}
	}
	funchtml = funchtml + "</li>";

	var resel = $('<div class="result-element type-function"></div>');
	resel.html(funchtml).appendTo($('#observable-results'));
	resel.get(0).details = details;
	resel.get(0).symbol = symbol;

	resel.hover(
		function() {
			if (this != selected_function) {
				$(this).animate({backgroundColor: "#eaeaea"}, 100);
			}
		}, function() {
			$('#observable-info').hide();
			if (this != selected_function) {
				$(this).animate({backgroundColor: "white"}, 100);
			}
		}	
		).click(function() {
		if (selected_function != null) {
			$(selected_function).animate({backgroundColor: "white"}, 100);
		}
		selected_function = this;
		$(this).animate({backgroundColor: "#ffebc9"}, 100);

		this.dialog = function_dialog(this.symbol, this.dialog);
	});
};

function add_observable(symbol, name) {
	var val = symbol.value();
	var valhtml;
	if (typeof val == "boolean") { valhtml = "<span class='result_value special_text'>"+eden.getSymbolValue(symbol)+"</span>"; }
	else if (typeof val == "undefined") { valhtml = "<span class='result_value error_text'>undefined</span>"; }
	else if (typeof val == "string") { valhtml = "<span class='result_value string_text'>"+eden.getSymbolValue(symbol)+"</span>"; }
	else if (typeof val == "number") { valhtml = "<span class='result_value numeric_text'>"+eden.getSymbolValue(symbol)+"</span>"; }
	else if (isArray(val)) { valhtml = "<span class='result_value list_text'>"+eden.getSymbolValue(symbol)+"</span>"; }
	else if (typeof val == "object") { valhtml = "<span class='result_value object_text'>"+eden.getSymbolValue(symbol)+"</span>"; }
	else { valhtml = eden.getSymbolValue(symbol); }

	var ele = $('<div id="sbobs_' + name + '" class="result-element type-observable' + (symbol.eden_definition ? ' type-dependency' : '') + '"><span class="result-delete"></span> <span class="result-id">' + name + '</span> = <span class="result-value">' + valhtml + '</span></div>');
	ele.appendTo($('#observable-results'));
	ele.get(0).symbol = symbol;

	ele.hover(
		function() {
			if (this != selected_observable) {
				$(this).animate({backgroundColor: "#eaeaea"}, 100);
			}
		}, function() {
			$('#observable-info').hide();
			if (this != selected_observable) {
				$(this).animate({backgroundColor: "white"}, 100);
			}
		}	
	).click(function() {
		var $codeObservable = eden.getDefinition(name);
		inputBox.setValue($codeObservable);
	});
};

function isArray(obj) {
    return Object.prototype.toString.call(obj) === '[object Array]';
}