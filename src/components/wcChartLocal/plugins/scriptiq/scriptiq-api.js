//-------------------------------------------------------------------------------------------
// Copyright 2012-2018 by ChartIQ, Inc.
// All rights reserved
//-------------------------------------------------------------------------------------------
// @jscrambler DEFINE

(function(_exports) {
	var CIQ = _exports.CIQ;

	/**
	 * Namespace for functionality related to study scripting.
	 * 
	 * **Only available if subscribing to the scriptIQ module.**
	 * 
	 * @namespace CIQ.Scripting
	 */
	CIQ.Scripting={};

	/**
	 * Object for storing user generated script studies.
	 * @type {object}
	 * @namespace CIQ.Scripting.Scripts
	 */
	CIQ.Scripting.Scripts={};

	/**
	 * Set of functions designed to process Tags used in the user script to create the necessary [study descriptor]{@link CIQ.Studies.StudyDescriptor} elements. 
	 *
	 * @type {object}
	 * @namespace CIQ.Scripting.Descriptors
	 */
	CIQ.Scripting.Descriptors={};

	/**
	 * Parses a tag for the name of the study.
	 * 
	 * User Tag syntax:
	 * `study("Study Name here")`
	 * @memberof CIQ.Scripting.Descriptors
	 * @alias study	 
	 */
	CIQ.Scripting.Descriptors.study=function(sd, args){
		if(args.length<1) return;
		if(args[0].type!=="Literal") return;
		sd.name=args[0].value;
	};

	/**
	 * Parses a tag for an input. 
	 * 
	 * Each input will be translated into an entry of the [study descriptor's]{@link CIQ.Studies.StudyDescriptor} inputs field
	 * 
	 * User Tag syntax:
	 * `variableName = input("Input Name here", Input Value here)`
	 * @memberof CIQ.Scripting.Descriptors
	 * @alias input	 
	 */
	CIQ.Scripting.Descriptors.input=function(sd, args){
		if(!sd.inputs) sd.inputs={};
		if(args.length<2) return;
		if(args[1].type==="Literal"){
			sd.inputs[args[0].value]=args[1].value;
		}else if(args[1].type==="ArrayExpression"){
			var arr=[];
			var elements=args[1].elements;
			elements.forEach(function(argument){
				arr.push(argument.value);
			});
			sd.inputs[args[0].value]=arr;
		}
	};

	/**
	 * Parses a tag for plot (rendering) commands. 
	 * 
	 * Currently renders a line.
	 * 
	 * Each plot will be translated into an output and added to the [study descriptor's]{@link CIQ.Studies.StudyDescriptor} outputs field
	 * 
	 * User Tag syntax:
	 * `plot(variableName, color: "Color here", display:"Name here")`
	 * @memberof CIQ.Scripting.Descriptors
	 * @alias plot	 
	 */
	CIQ.Scripting.Descriptors.plot=function(sd, args){
		if(args.length<1) return;
		var color="auto";
		var name=args[0].name;
		if(args.length>=2){
			var params=args[1];
			// Retrieve optional color and display parameters
			if(params.type==="ObjectExpression"){
				params.properties.forEach(function(param){
					// hardcoded color
					if(param.key.name==="color"){
						color=param.value.value;
					}
					if(param.key.name==="display"){
						name=param.value.value;
					}
				});
			}
		}
		if(!sd.outputs) sd.outputs={};
		sd.outputs[name]=color;
	};

	/**
	 * Set of functions containing the builtin scripting operators, such as moving average calculations.
	 * @namespace CIQ.Scripting.Builtins
	 */
	CIQ.Scripting.Builtins={};

	CIQ.Scripting.Builtins.input=function(state, field) {
		var inputs = state.context.sd.inputs;
		var input = inputs[field];

		// our menus do not cast number types
		return Number.isNaN(Number(input)) ? input : Number(input);
	};

	CIQ.Scripting.Builtins.series=function(state, field){

	};

	/**
	 * dataset: pull quote values out of the (scrubbed) symbol values
	 *
	 * @example <caption>close from the current quote</caption>
	 * close = dataset('Close')
	 *
	 * @example <caption>close from the previous quote</caption>
	 * close = dataset('Close', -1)
	 *
	 * @example <caption>implement a simple moving average</caption>
	 * study("Simple MA")
	 * field = input("Field", "field")
	 * period = input("Period", 20)
	 * sum = (length) ->
	 * 	total = 0
	 * 	while length
	 * 		value = dataset(field, -(--length))
	 * 		return null if not value?
	 * 		total += value
	 * 	total
	 * total = sum period
	 * if total?
	 * 	average = total / period
	 * 	plot average
	 * @memberof CIQ.Scripting.Builtins
	 * @alias dataset	 	 
	 */
	CIQ.Scripting.Builtins.dataset=function(state, field, lookback) {
		if (!field || field === 'field') field = 'Close';
		// default to current quote
		if (!lookback) lookback = 0;

		var context = state.context;
		var index = context.index + lookback;
		var scrubbed = context.sd.chart.scrubbed;
		var quote = scrubbed[index];

		return 0 <= index && index < scrubbed.length && quote && typeof quote[field] === 'number' ? quote[field] : null;
	};

	/**
	 * ma: compute a simple moving average calculation
	 *
	 * @memberof CIQ.Scripting.Builtins
	 * @alias ma	 	 
	 */
	CIQ.Scripting.Builtins.ma=function(state, field, lookback){
		var acc = state.acc || 0;
		var values = state.values || [];
		var value = state.getValue(field);

		if (value === null) {
			return null;
		}

		acc += value;
		values.push(value);

		if (values.length > lookback) {
			acc -= values.shift();
		}

		state.acc = acc;
		state.values = values;

		return values.length === lookback ? acc / lookback : null;
	};

	/**
	 * ema: compute exponential moving average calculation
	 *
	 * @memberof CIQ.Scripting.Builtins
	 * @alias ema	 	 
	 */
	CIQ.Scripting.Builtins.ema=function(state, field, lookback){
		var acc = state.acc || 0;
		var values = state.values || [];
		var value = state.getValue(field);

		if (value === null) {
			return null;
		}

		acc += value;
		values.push(value);

		var multiplier = state.smma === true ? 1 / lookback : 2 / (lookback + 1);
		var emaPreviousDay = state.emaPreviousDay;
		var result = values.length > lookback ? ((value - emaPreviousDay) * multiplier) + emaPreviousDay :
					values.length === lookback ? acc / lookback : null;

		if (values.length > lookback) {
			acc -= values.shift();
		}

		state.acc = acc;
		state.values = values;
		state.emaPreviousDay = result || acc / lookback;

		return result;
	};

	/**
	 * tma: compute triangular moving average calculation
	 *
	 * @memberof CIQ.Scripting.Builtins
	 * @alias tma	 	 
	 */	
	CIQ.Scripting.Builtins.tma=function(state, field, lookback) {
		var calculate = CIQ.Scripting.Builtins.ma;
		var days = Math.ceil(lookback / 2);
		var value = calculate(state, field, days);

		return calculate(state.spawn('ma'), value, days + 1 - days % 2);
	};

	/**
	 * wma: compute weighted moving average calculation
	 *
	 * @memberof CIQ.Scripting.Builtins
	 * @alias wma	 	 
	 */	
	CIQ.Scripting.Builtins.wma=function(state, field, lookback) {
		var value = state.getValue(field);
		var accAdd = state.accAdd || 0;
		var accSub = state.accSub || 0;
		var values = state.values || [];
		var divisor = lookback * (lookback + 1) / 2;

		if (value === null) {
			return null;
		}

		values.push(value);

		if (values.length > lookback) {
			accAdd -= accSub;
			accSub -= values.shift();
		}

		accAdd += values.length * value;
		accSub += value;

		state.accAdd = accAdd;
		state.accSub = accSub;
		state.values = values;

		return values.length === lookback ? accAdd / divisor : null;
	};

	/**
	 * tsma: compute time-series moving average calculation
	 *
	 * @memberof CIQ.Scripting.Builtins
	 * @alias tsma	 	 
	 */	
	CIQ.Scripting.Builtins.tsma=function(state, field, lookback) {
		// calculateLinearRegressionIndicator, `b` is "Slope", `a` is the "Intercept", and the result is "Forecast"
		var value = state.getValue(field);
		var values = state.values || [];
		var sumCloses = state.sumCloses || 0;
		var sumClosesSquared = state.sumClosesSquared || 0;
		var sumWeightedCloses = state.sumWeightedCloses || 0;

		if (value === null) {
			return null;
		}

		values.push(value);

		sumWeightedCloses += lookback * value - sumCloses;
		sumCloses += value;
		sumClosesSquared += Math.pow(value, 2);

		if (values.length > lookback) {
			var shifted = values.shift();

			sumCloses -= shifted;
			sumClosesSquared -= Math.pow(shifted, 2);
		}

		state.values = values;
		state.sumCloses = sumCloses;
		state.sumClosesSquared = sumClosesSquared;
		state.sumWeightedCloses = sumWeightedCloses;

		var sumWeights = lookback * (lookback + 1) / 2;
		var squaredSumWeights = Math.pow(sumWeights, 2);
		var sumWeightsSquared = sumWeights * (2 * lookback + 1) / 3;
		var b = (lookback * state.sumWeightedCloses - sumWeights * state.sumCloses) / (lookback * sumWeightsSquared - squaredSumWeights);
		var a = (state.sumCloses - b * sumWeights) / lookback;

		return values.length === lookback ? a + b * lookback : null;
	};

	/**
	 * vma: compute variable moving average calculation
	 *
	 * @memberof CIQ.Scripting.Builtins
	 * @alias vma	 	 
	 */		
	CIQ.Scripting.Builtins.vma=function(state, field, lookback) {
		var value = state.getValue(field);
		var cmo = CIQ.Scripting.Builtins.cmo(state.spawn('cmo'), null, 9);

		if (value === null || cmo === null) {
			return null;
		}

		var vmaPreviousDay = state.vmaPreviousDay || 0;
		var alpha = 2 / (lookback + 1);
		var vi = Math.abs(cmo) / 100;
		var vma = (alpha * vi * value) + ((1 - (alpha * vi)) * vmaPreviousDay);

		state.vmaPreviousDay = vma;

		return state.context.index >= lookback ? vma : null;
	};

	/**
	 * vdma: compute vidya (based on variable) moving average calculation
	 *
	 * @memberof CIQ.Scripting.Builtins
	 * @alias vdma	 	 
	 */			
	CIQ.Scripting.Builtins.vdma=function(state, field, lookback) {
		var value = state.getValue(field);
		var stddev = CIQ.Scripting.Builtins.stddev(state.spawn('stddev'), value, 5);
		var ma = CIQ.Scripting.Builtins.ma(state.spawn('ma'), stddev, 20);

		if (value === null || stddev === null || ma === null) {
			return null;
		}

		var vmaPreviousDay = state.vmaPreviousDay || 0;
		var alpha = 2 / (lookback + 1);
		var vi = stddev / ma;
		var vma = (alpha * vi * value) + ((1 - (alpha * vi)) * vmaPreviousDay);

		state.vmaPreviousDay = vma;

		return state.context.index >= lookback ? vma : null;
	};

	/**
	 * sma: compute simple moving average calculation
	 *
	 * @memberof CIQ.Scripting.Builtins
	 * @alias sma	 	 
	 */			
	CIQ.Scripting.Builtins.sma=CIQ.Scripting.Builtins.ma;

	/**
	 * smma: compute welles-wilder moving average calculation
	 *
	 * @memberof CIQ.Scripting.Builtins
	 * @alias smma	 	 
	 */			
	CIQ.Scripting.Builtins.smma=function(state, field, lookback) {
		state.smma = true;
		return CIQ.Scripting.Builtins.ema(state, field, lookback);
	};

	/**
	 * stddev: Standard Deviation calculation.
	 *
	 * @param {*} state
	 * @param {string|number} field
	 * @param {number} lookback
	 * @param {Object} [options]
	 * @param {function|string} [options.ma]
	 * @param {number} [options.mult]
	 * @memberof CIQ.Scripting.Builtins
	 * @alias stddev	 	 
	 */
	CIQ.Scripting.Builtins.stddev=function(state, field, lookback, options) {
		var calculate;

		if (options && typeof options.ma === 'function') {
			calculate = options.ma; // might want to wrap this in a try/catch ?
		} else if (options && typeof options.ma === 'string' && options.ma in CIQ.Scripting.Builtins) {
			// should this be forced to be a MA calculation? Is it ok for the user to be silly and choose "cmo" here?
			calculate = CIQ.Scripting.Builtins[options.ma];
		} else {
			calculate = CIQ.Scripting.Builtins.ma;
		}

		var ma = calculate(state.spawn('ma'), field, lookback);
		var acc1 = state.acc1 || 0;
		var acc2 = state.acc2 || 0;
		var value = state.getValue(field);
		var values = state.values || [];
		var mult = Number.isFinite(options && options.mult) ? options.mult : 2;

		if (value === null) {
			return null;
		}

		acc1 += Math.pow(value, 2);
		acc2 += value;
		values.push(value);

		if (values.length > lookback) {
			value = values.shift();
			acc1 -= Math.pow(value, 2);
			acc2 -= value;
		}

		state.acc1 = acc1;
		state.acc2 = acc2;
		state.values = values;

		return values.length === lookback && ma !== null ?
			Math.sqrt((acc1 + lookback * Math.pow(ma, 2) - 2 * ma * acc2) / lookback) * mult :
			null;
	};

	/**
	 * cmo: compute a Chande Momentum calculation
	 *
	 * @memberof CIQ.Scripting.Builtins
	 * @alias cmo	 	 
	 */		
	CIQ.Scripting.Builtins.cmo=function(state, field, lookback) {
		var value = state.getValue('Close');
		var values = state.values || [];
		var sum = state.sum || 0;
		var abs = state.abs || 0;

		values.push(value);

		var length = values.length;

		if (length < 2) {
			state.values = values;
			return null;
		}

		var diff = value - values[length - 2];
		var momentum = null;

		sum += diff;
		abs += Math.abs(diff);

		if (length - 1 === lookback) {
			momentum = 100 * sum / abs;

			diff = values[1] - values[0];
			sum -= diff;
			abs -= Math.abs(diff);
			values.shift();
		}

		state.sum = sum;
		state.abs = abs;
		state.values = values;

		return momentum;
	};


	CIQ.Scripting.Builtins.plot=function(state, field, params){
		params=params?params:{};
		var context=state.context;
		var sd=context.sd;
		var quote=context.sd.chart.scrubbed[context.index];
		var val=(typeof(field)==="string")?quote[field]:field;
		/*if(!state.output){
			if(!sd.outputs) sd.outputs={};
			state.output=params.name?params.name:CIQ.uniqueID();
			sd.outputs[state.output]=params.color; // TODO, renderers

			state.outputField=state.output + " " + sd.name;
			sd.outputMap[state.outputField]=state.output;
		}
		quote[state.outputField]=val;
		*/
		var outputField=params.display + " " + sd.name;
		quote[outputField]=val;
	};

	/**
	 * If the user hasn't provided an explicit "display" value then it will
	 * be set to the actual variable name passed
	 * @param {object} node AST for the plot node
	 * @memberof CIQ.Scripting
	 * @alias setDefaultPlotOutput	 	
	 * @private 
	 */
	CIQ.Scripting.setDefaultPlotOutput=function(node){
		if(node.arguments.length<3){
			node.arguments.push({
				type:"ObjectExpression",
				properties:[]
			});
		}
		var params=node.arguments[2];
		if(params.type==="ObjectExpression"){
			var foundDisplay=false;
			params.properties.forEach(function(param){
				if(param.key.name==="display") foundDisplay=true;
			});
			if(!foundDisplay){
				params.properties.push({
					computed: false,
					key: {
						name:"display",
						type: "Identifier"
					},
					kind: "init",
					method: false,
					shorthand: false,
					type: "Property",
					value: {
						type: "Literal",
						value: node.arguments[1].name,
						raw: node.arguments[1].name
					}
				});
			}
		}
	};

	/**
	 * State class for convenience methods and getters
	 * @memberof CIQ.Scripting
	 * @alias State	 
	 * @private	 
	 */
	CIQ.Scripting.State = function(context) {
		this.context = context;
		this.children = {};
		this.parent = null;
	};

	Object.defineProperties(CIQ.Scripting.State.prototype, {
		/**
		 * Helper to get the passed value, the quote's value, or null.
		 * Never returns undefined to avoid NaN in calculations.
		 */
		'getValue': {
			value: function(field) {
				if (typeof field === 'number' || field === null) {
					return field;
				}
				if (typeof field !== 'string' || field === 'field') {
					return this.quote.Close;
				}

				return this.quote[field] || null;
			}
		},
		'quote': {
			get: function() {
				return this.context.sd.chart.scrubbed[this.context.index];
			}
		},
		/**
		 * Spawn a child state when it does not exist.
		 *
		 * @param {string} name
		 * @returns {CIQ.Scripting.State}
		 * @private
		 */
		'spawn': {
			value: function(name) {
				var child = this.children[name];

				if (!(name in this.children)) {
					child = this.children[name] = new CIQ.Scripting.State(this.context);
					child.parent = this;
				}

				return child;
			}
		}
	});

	/**
	 * Contains the current state arrays for script studies
	 * @type {Object}
	 * @memberof CIQ.Scripting
	 * @private
	 */
	CIQ.Scripting.states={};

	/**
	 * Creates an array of states for a given study **instance**. The array is stored globally.
	 * If the state array already exists for the instance then it is retrieved instead of created.
	 * If context.index===0 then a new state instance is always created
	 *
	 * @param  {object} context          A context object from a study script
	 * @param  {number} length 			 Number of state objects to create
	 * @return {array}                   An array of state objects
	 * @memberof CIQ.Scripting
	 * @private
	 */
	CIQ.Scripting.createStates=function(context, length){
		var arr=CIQ.Scripting.states[context.sd.id];
		if(!arr || context.index===0){
			arr=CIQ.Scripting.states[context.sd.id]=new Array(length);
			for(var i=0;i<arr.length;i++){
				arr[i] = new CIQ.Scripting.State(context);
			}
		}
		return arr;
	};

	/**
	 * Adds a **processed** script to the [studyLibrary]{@link CIQ.Studies.studyLibrary}. 
	 * The study can then be created like any other one on the chart by simply calling {@link CIQ.Studies.addStudy}.
	 * @param {string} script       Source code for the script ** in javaScript**, as returned by {@link CIQ.Scripting.processCoffee}
	 * @param {studyDescriptor} sd The study descriptor generated by {@link CIQ.Scripting.processCoffee}. This will replace any existing studies in the library with the same name.
	 * @memberof CIQ.Scripting
	 */
	CIQ.Scripting.addStudyToLibrary=function(script, sd){
		/*jslint evil: true */ /*jshint -W061 */ /*eslint-disable no-eval */
		eval(script);
		/*jslint evil: false */ /*jshint +W061 */ /*eslint-enable no-eval */

		function scriptingCalculateProxy(stx, sd){
			if(!sd.chart.scrubbed) return;
			CIQ.Scripting.Scripts[sd.type].call(this, sd);
		}

		sd.calculateFN=scriptingCalculateProxy;

		CIQ.Studies.studyLibrary[sd.name]=sd;
		if(sd.siqList) CIQ.Studies.studyScriptLibrary[sd.name]=sd;
	};

	/**
	 * Processes javaScript source to create a custom [study descriptor]{@link CIQ.Studies.StudyDescriptor} 
	 * 
	 * ** This method is internal to {@link CIQ.Scripting.processCoffee} and should not be called directly. 
	 * 
	 * @param  {string} source JavaScript source code for the study.
	 * @return {object} Returns a script descriptor which can be stored or passed to {@link CIQ.Scripting.addStudyToLibrary}
	 * ast: an ast object (JSON format),
	 * studyScript: the transformed study,
	 * sd: a [study descriptor]{@link CIQ.Studies.StudyDescriptor} which can be used to add this study to the [studyLibrary]{@link CIQ.Studies.studyLibrary}
	 * error will be set if an error occurs.
	 * @memberof CIQ.Scripting
	 * @jscrambler ENABLE
	 */
	CIQ.Scripting.processJavaScript=function(source){
		// This will be used to replace builtins such as "ema" with "CIQ.Scripting.ema"
		var ciqScriptingCallee={
			"type":"MemberExpression",
			"computed":false,
			"object":{
				"type":"MemberExpression",
				"computed":false,
				"object":{
					"type":"MemberExpression",
					"computed":false,
					"object":{
						"type":"Identifier",
						"name":"CIQ"
					},
					"property":{
						"type":"Identifier",
						"name":"Scripting"
					}
				},
				"property":{
					"type":"Identifier",
					"name":"Builtins"
				}
			},
			"property":{
				"type":"Identifier",
				"name":"replaceme"
			}
		};

		// This will be used to add state[x] variables to builtins
		var stateArgument={
			"type": "MemberExpression",
			"computed": true,
			"object": {
				"type": "Identifier",
				"name": "state"
			},
			"property": {
				"type": "Literal",
				"value": 1,
				"raw": "1"
			}
		};

		// This will be used to add a variable containing the number of builtins
		var numberOfBuiltins={
			"type": "VariableDeclarator",
			"id": {
				"type":"Identifier",
				"name":"numberOfBuiltins"
			},
			"init": {
				"type":"Literal",
				"value": 5,
				"raw": "5"
			}
		};

		var sd={};
		var error=null, ast, studyScript, studyName;
		try{
			ast = esprima.parse(source);
			var builtInCount=0;
			// Add the state arguments to builtin calls.
			// We traverse the AST looking for any call to a function that is listed in our builtins object.
			// When we find a call to a builtin (a match) then we modify the arguments by prepending from the "stateArgument" template
			// We keep count of how many calls we've found. We'll need that count later in order to instantiate the state objects.
			estraverse.traverse(ast, {
				enter: function(node){
					if (node.type === 'CallExpression'){
						// Add state[x] to the arguments
						var args=node.arguments;
						var name=node.callee.name;
						if(CIQ.Scripting.Builtins[name]){
							// Replace ema with CIQ.Scripting.ema
							delete node.callee.name;
							CIQ.extend(node.callee, ciqScriptingCallee);
							node.callee.property.name=name;

							var newStateArgument=CIQ.clone(stateArgument);
							newStateArgument.property.value=builtInCount;
							newStateArgument.property.raw="" + builtInCount;
							builtInCount++;
							node.arguments=[newStateArgument].concat(args);
							if(name==="plot"){
								CIQ.Scripting.setDefaultPlotOutput(node);
							}
						}
						if(CIQ.Scripting.Descriptors[name]){
							CIQ.Scripting.Descriptors[name].call(this, sd, args);
						}
					}
				}
			});

			if(!sd.name) sd.name=CIQ.uniqueID();
			studyName=sd.name;

			// Update our "numberOfBuiltins" template. We'll use this later to actually instantiate the state objects.
			numberOfBuiltins.init.value=builtInCount;
			numberOfBuiltins.init.raw="" + builtInCount;

			// Next remove the variable declarations from the top of the program (the script entered by the user)
			// This assumes they are in one line (from generated coffeescript). If a user enters raw JS then they
			// count be scattered about and we'll need to collect them into a single array
			var variableDeclarations;
			estraverse.replace(ast, {
				leave: function(node, parent){
					if (node.type === 'VariableDeclaration' && parent.type==="Program"){
						variableDeclarations=node;
						return this.remove();
					}
					// While we're at it, remove any descriptors that aren't also builtins.
					// These are essentially no-op functions
					if(node.type === "ExpressionStatement" && node.expression.callee){
						var name=node.expression.callee.name;
						if(CIQ.Scripting.Descriptors[name] && !CIQ.Scripting.Builtins[name]){
							return this.remove();
						}
					}
				}
			});
			// This is the template for nested function. We inject our script into this nested function.
			// This nested function will run inside of a safe wrapper.
			var body=ast.body;
			var inner={
				"type":"FunctionDeclaration",
				"id":{
					"type":"Identifier",
					"name":"inner"
				},
				"params":[],
				"body": {
					"type": "BlockStatement",
					"body": body
				},
				"generator": false,
				"expression": false,
				"async": false
			};

			// Next create the wrapper function. We start from this template. ES6 literals (backticks)
			var wrapper=`CIQ.Scripting.Scripts["replaceme"]=function(sd){
			   var context={
			      sd: sd,
			      index:0
			   };
			   var state=CIQ.Scripting.createStates(context, numberOfBuiltins);
			   function inner(){
			   }
			   for(var i=sd.startFrom;i<sd.chart.scrubbed.length;i++){
			      context.index=i;
			      inner();
			   }
			};
			`;

			// Parse our JavaScript literal template into an AST tree so that we can manipulate it
			var wrapperAST = esprima.parse(wrapper);
			// Comment these lines out to see AST results of manual editing
			//$('#editor #editorAST').empty();
			//$('#editor #editorAST').jsonView(wrapperAST);

			// Add our script's dynamic variables into the wrapper (including numberOfBuiltins with its calculated literal value)
			variableDeclarations.declarations.unshift(numberOfBuiltins);
			wrapperAST.body[0].expression.right.body.body.unshift(variableDeclarations);

			// Now traverse our wrapper and modify it as needed.
			estraverse.replace(wrapperAST, {
				leave: function(node, parent){
					// inject our script's logic into the placeholder position for the nested function
					if (node.type === 'FunctionDeclaration' && node.id.name === "inner"){
						return inner;
					}
					// give the wrapped function our generated unique name
					if (node.type === 'Literal' && node.value === "replaceme"){
						node.value=studyName;
						node.raw="\"" + studyName + "\"";
					}
				}
			});

			studyScript=escodegen.generate(wrapperAST);
		}catch(e){
			error=e.message;
		}
		return {ast:ast, studyScript: studyScript, error:error, sd: sd};
	};

	/**
	 * Processes a coffee script for custom scripting. 
	 * The coffee script is converted to javaScript and then {@link CIQ.Scripting.processJavaScript} is
	 * called to create the study.
	 * 
	 * You can then use {@link CIQ.Scripting.addStudyToLibrary} with the returned SD and script to finalize the process.
	 * 
	 * @param  {string} source Coffee script source code
	 * @return {object}        An object containing \{ast, javaScript, studyScript, sd\} or error. See {@link CIQ.Scripting.processJavaScript}
	 * @memberof CIQ.Scripting
	 */
	CIQ.Scripting.processCoffee=function(source){
		var error=null, javaScript;
		try{
			javaScript=CoffeeScript.compile(source, { bare: true });
			var result=CIQ.Scripting.processJavaScript(javaScript);
			result.javaScript=javaScript;
			return result;
		}catch(e){
			error=e.message;
		}
		return {error:error};
	};

	return _exports;
})/* removeIf(umd) */(typeof window !== 'undefined' ? window : global)/* endRemoveIf(umd) */;
