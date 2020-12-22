//-------------------------------------------------------------------------------------------
// Copyright 2012-2016 by ChartIQ, Inc.
// All rights reserved
//-------------------------------------------------------------------------------------------

(function (definition) {
	"use strict";

	if (typeof exports === "object" && typeof module === "object") {
		module.exports = definition( require('../core/master') );
	} else if (typeof define === "function" && define.amd) {
		define(["core/master"], definition);
	} else if (typeof window !== "undefined" || typeof self !== "undefined") {
		var global = typeof window !== "undefined" ? window : self;
		definition(global);
	} else {
		throw new Error("Only CommonJS, RequireJS, and <script> tags supported for equations.js.");
	}
})(function(_exports){
	console.log("equations.js",_exports);
	var CIQ=_exports.CIQ;

	//JavaScript Expression Evaluator: https://silentmatt.com/javascript-expression-evaluator/
	/*!
	 Based on ndef.parser, by Raphael Graf(r@undefined.ch)
	 http://www.undefined.ch/mparser/index.html
	 Ported to JavaScript and modified by Matthew Crumley (email@matthewcrumley.com, http://silentmatt.com/)
	 You are free to use and modify this code in anyway you find useful. Please leave this comment in the code
	 to acknowledge its original source. If you feel like it, I enjoy hearing about projects that use my code,
	 but don't feel like you have to let me know or ask permission.
	*/

	var Parser = function(){
		function object(o) {
			function F() {}
			F.prototype = o;
			return new F();
		}

		var TNUMBER = 0;
		var TOP1 = 1;
		var TOP2 = 2;
		var TVAR = 3;
		var TFUNCALL = 4;

		function Token(type_, index_, prio_, number_) {
			this.type_ = type_;
			this.index_ = index_ || 0;
			this.prio_ = prio_ || 0;
			this.number_ = (number_ !== undefined && number_ !== null) ? number_ : 0;
			this.toString = function () {
				switch (this.type_) {
				case TNUMBER:
					return this.number_;
				case TOP1:
				case TOP2:
				case TVAR:
					return this.index_;
				case TFUNCALL:
					return "CALL";
				default:
					return "Invalid Token";
				}
			};
		}

		function Expression(tokens, ops1, ops2, functions) {
			this.tokens = tokens;
			this.ops1 = ops1;
			this.ops2 = ops2;
			this.functions = functions;
		}

		// Based on http://www.json.org/json2.js
	    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
	        escapable = /[\\\'\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
	        meta = {    // table of character substitutions
	            '\b': '\\b',
	            '\t': '\\t',
	            '\n': '\\n',
	            '\f': '\\f',
	            '\r': '\\r',
	            "'" : "\\'",
	            '\\': '\\\\'
	        };

		function escapeValue(v) {
			if (typeof v === "string") {
				escapable.lastIndex = 0;
		        return escapable.test(v) ?
		            "'" + v.replace(escapable, function (a) {
		                var c = meta[a];
		                return typeof c === 'string' ? c :
		                    '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
		            }) + "'" :
		            "'" + v + "'";
			}
			return v;
		}

		Expression.prototype = {
			simplify: function (values) {
				values = values || {};
				var nstack = [];
				var newexpression = [];
				var n1;
				var n2;
				var f;
				var L = this.tokens.length;
				var item;
				var i = 0;
				for (i = 0; i < L; i++) {
					item = this.tokens[i];
					var type_ = item.type_;
					if (type_ === TNUMBER) {
						nstack.push(item);
					}
					else if (type_ === TVAR && (item.index_ in values)) {
						item = new Token(TNUMBER, 0, 0, values[item.index_]);
						nstack.push(item);
					}
					else if (type_ === TOP2 && nstack.length > 1) {
						n2 = nstack.pop();
						n1 = nstack.pop();
						f = this.ops2[item.index_];
						item = new Token(TNUMBER, 0, 0, f(n1.number_, n2.number_));
						nstack.push(item);
					}
					else if (type_ === TOP1 && nstack.length > 0) {
						n1 = nstack.pop();
						f = this.ops1[item.index_];
						item = new Token(TNUMBER, 0, 0, f(n1.number_));
						nstack.push(item);
					}
					else {
						while (nstack.length > 0) {
							newexpression.push(nstack.shift());
						}
						newexpression.push(item);
					}
				}
				while (nstack.length > 0) {
					newexpression.push(nstack.shift());
				}

				return new Expression(newexpression, object(this.ops1), object(this.ops2), object(this.functions));
			},

			substitute: function (variable, expr) {
				if (!(expr instanceof Expression)) {
					expr = new Parser().parse(String(expr));
				}
				var newexpression = [];
				var L = this.tokens.length;
				var item;
				var i = 0;
				for (i = 0; i < L; i++) {
					item = this.tokens[i];
					var type_ = item.type_;
					if (type_ === TVAR && item.index_ === variable) {
						for (var j = 0; j < expr.tokens.length; j++) {
							var expritem = expr.tokens[j];
							var replitem = new Token(expritem.type_, expritem.index_, expritem.prio_, expritem.number_);
							newexpression.push(replitem);
						}
					}
					else {
						newexpression.push(item);
					}
				}

				var ret = new Expression(newexpression, object(this.ops1), object(this.ops2), object(this.functions));
				return ret;
			},

			evaluate: function (values) {
				values = values || {};
				var nstack = [];
				var n1;
				var n2;
				var f;
				var L = this.tokens.length;
				var item;
				var i = 0;
				for (i = 0; i < L; i++) {
					item = this.tokens[i];
					var type_ = item.type_;
					if (type_ === TNUMBER) {
						nstack.push(item.number_);
					}
					else if (type_ === TOP2) {
						n2 = nstack.pop();
						n1 = nstack.pop();
						f = this.ops2[item.index_];
						nstack.push(f(n1, n2));
					}
					else if (type_ === TVAR) {
						if (item.index_ in values) {
							nstack.push(values[item.index_]);
						}
						else if (item.index_ in this.functions) {
							nstack.push(this.functions[item.index_]);
						}
						else {
							throw new Error("undefined variable: " + item.index_);
						}
					}
					else if (type_ === TOP1) {
						n1 = nstack.pop();
						f = this.ops1[item.index_];
						nstack.push(f(n1));
					}
					else if (type_ === TFUNCALL) {
						n1 = nstack.pop();
						f = nstack.pop();
						if (f.apply && f.call) {
							if (Object.prototype.toString.call(n1) == "[object Array]") {
								nstack.push(f.apply(undefined, n1));
							}
							else {
								nstack.push(f.call(undefined, n1));
							}
						}
						else {
							throw new Error(f + " is not a function");
						}
					}
					else {
						throw new Error("invalid Expression");
					}
				}
				if (nstack.length > 1) {
					throw new Error("invalid Expression (parity)");
				}
				return nstack[0];
			},

			toString: function (toJS) {
				var nstack = [];
				var n1;
				var n2;
				var f;
				var L = this.tokens.length;
				var item;
				var i = 0;
				for (i = 0; i < L; i++) {
					item = this.tokens[i];
					var type_ = item.type_;
					if (type_ === TNUMBER) {
						nstack.push(escapeValue(item.number_));
					}
					else if (type_ === TOP2) {
						n2 = nstack.pop();
						n1 = nstack.pop();
						f = item.index_;
						if (toJS && f == "^") {
							nstack.push("Math.pow(" + n1 + "," + n2 + ")");
						}
						else {
							nstack.push("(" + n1 + f + n2 + ")");
						}
					}
					else if (type_ === TVAR) {
						nstack.push(item.index_);
					}
					else if (type_ === TOP1) {
						n1 = nstack.pop();
						f = item.index_;
						if (f === "-") {
							nstack.push("(" + f + n1 + ")");
						}
						else {
							nstack.push(f + "(" + n1 + ")");
						}
					}
					else if (type_ === TFUNCALL) {
						n1 = nstack.pop();
						f = nstack.pop();
						nstack.push(f + "(" + n1 + ")");
					}
					else {
						throw new Error("invalid Expression");
					}
				}
				if (nstack.length > 1) {
					throw new Error("invalid Expression (parity)");
				}
				return nstack[0];
			},

			variables: function () {
				var L = this.tokens.length;
				var vars = [];
				for (var i = 0; i < L; i++) {
					var item = this.tokens[i];
					if (item.type_ === TVAR && (vars.indexOf(item.index_) == -1)) {
						vars.push(item.index_);
					}
				}

				return vars;
			}/*,

			toJSFunction: function (param, variables) {
				var f = new Function(param, "with(Parser.values) { return " + this.simplify(variables).toString(true) + "; }");
				return f;
			}*/
		};

		function add(a, b) {
			return Number(a) + Number(b);
		}
		function sub(a, b) {
			return a - b;
		}
		function mul(a, b) {
			return a * b;
		}
		function div(a, b) {
			return a / b;
		}
		function mod(a, b) {
			return a % b;
		}
		function concat(a, b) {
			return "" + a + b;
		}
		function equal(a, b) {
			return a == b;
		}
		function notEqual(a, b) {
			return a != b;
		}
		function greaterThan(a, b) {
			return a > b;
		}
		function lessThan(a, b) {
			return a < b;
		}
		function greaterThanEqual(a, b) {
			return a >= b;
		}
		function lessThanEqual(a, b) {
			return a <= b;
		}
		function andOperator(a, b) {
			return Boolean(a && b);
		}
		function orOperator(a, b) {
			return Boolean(a || b);
		}
		function sinh(a) {
			return Math.sinh ? Math.sinh(a) : ((Math.exp(a) - Math.exp(-a)) / 2);
		}
		function cosh(a) {
			return Math.cosh ? Math.cosh(a) : ((Math.exp(a) + Math.exp(-a)) / 2);
		}
		function tanh(a) {
			if (Math.tanh) return Math.tanh(a);
			if(a === Infinity) return 1;
			if(a === -Infinity) return -1;
			return (Math.exp(a) - Math.exp(-a)) / (Math.exp(a) + Math.exp(-a));
		}
		function asinh(a) {
			if (Math.asinh) return Math.asinh(a);
			if(a === -Infinity) return a;
			return Math.log(a + Math.sqrt(a * a + 1));
		}
		function acosh(a) {
			return Math.acosh ? Math.acosh(a) : Math.log(a + Math.sqrt(a * a - 1));
		}
		function atanh(a) {
			return Math.atanh ? Math.atanh(a) : (Math.log((1+a)/(1-a)) / 2);
		}
		function log10(a) {
		      return Math.log(a) * Math.LOG10E;
		}
		function neg(a) {
			return -a;
		}
		function trunc(a) {
			if(Math.trunc) return Math.trunc(a);
			else return x < 0 ? Math.ceil(x) : Math.floor(x);
		}
		function random(a) {
			return Math.random() * (a || 1);
		}
		function fac(a) { //a!
			a = Math.floor(a);
			var b = a;
			while (a > 1) {
				b = b * (--a);
			}
			return b;
		}

		// TODO: use hypot that doesn't overflow
		function hypot() {
			if(Math.hypot) return Math.hypot.apply(this, arguments);
			var y = 0;
			var length = arguments.length;
			for (var i = 0; i < length; i++) {
				if (arguments[i] === Infinity || arguments[i] === -Infinity) {
					return Infinity;
				}
				y += arguments[i] * arguments[i];
			}
			return Math.sqrt(y);
		}

		function condition(cond, yep, nope) {
			return cond ? yep : nope;
		}

		function append(a, b) {
			if (Object.prototype.toString.call(a) != "[object Array]") {
				return [a, b];
			}
			a = a.slice();
			a.push(b);
			return a;
		}

		function Parser() {
			this.success = false;
			this.errormsg = "";
			this.expression = "";

			this.pos = 0;

			this.tokennumber = 0;
			this.tokenprio = 0;
			this.tokenindex = 0;
			this.tmpprio = 0;

			this.ops1 = {
				"sin": Math.sin,
				"cos": Math.cos,
				"tan": Math.tan,
				"asin": Math.asin,
				"acos": Math.acos,
				"atan": Math.atan,
				"sinh": sinh,
				"cosh": cosh,
				"tanh": tanh,
				"asinh": asinh,
				"acosh": acosh,
				"atanh": atanh,
				"sqrt": Math.sqrt,
				"log": Math.log,
				"lg" : log10,
				"log10" : log10,
				"abs": Math.abs,
				"ceil": Math.ceil,
				"floor": Math.floor,
				"round": Math.round,
				"trunc": trunc,
				"-": neg,
				"exp": Math.exp
			};

			this.ops2 = {
				"+": add,
				"-": sub,
				"*": mul,
				"/": div,
				"%": mod,
				"^": Math.pow,
				",": append,
				"||": concat,
				"==": equal,
				"!=": notEqual,
				">": greaterThan,
				"<": lessThan,
				">=": greaterThanEqual,
				"<=": lessThanEqual,
				"and": andOperator,
				"or": orOperator
			};

			this.functions = {
				"random": random,
				"fac": fac,
				"min": Math.min,
				"max": Math.max,
				"hypot": hypot,
				"pyt": hypot, // backward compat
				"pow": Math.pow,
				"atan2": Math.atan2,
				"if": condition
			};

			this.consts = {
				"E": Math.E,
				"PI": Math.PI
			};
		}

		Parser.parse = function (expr) {
			return new Parser().parse(expr);
		};

		Parser.evaluate = function (expr, variables) {
			return Parser.parse(expr).evaluate(variables);
		};

		Parser.Expression = Expression;

		Parser.values = {
			sin: Math.sin,
			cos: Math.cos,
			tan: Math.tan,
			asin: Math.asin,
			acos: Math.acos,
			atan: Math.atan,
			sinh: sinh,
			cosh: cosh,
			tanh: tanh,
			asinh: asinh,
			acosh: acosh,
			atanh: atanh,
			sqrt: Math.sqrt,
			log: Math.log,
			lg: log10,
			log10: log10,
			abs: Math.abs,
			ceil: Math.ceil,
			floor: Math.floor,
			round: Math.round,
			trunc: trunc,
			random: random,
			fac: fac,
			exp: Math.exp,
			min: Math.min,
			max: Math.max,
			hypot: hypot,
			pyt: hypot, // backward compat
			pow: Math.pow,
			atan2: Math.atan2,
			"if": condition,
			E: Math.E,
			PI: Math.PI
		};

		var PRIMARY      = 1 << 0;
		var OPERATOR     = 1 << 1;
		var FUNCTION     = 1 << 2;
		var LPAREN       = 1 << 3;
		var RPAREN       = 1 << 4;
		var COMMA        = 1 << 5;
		var SIGN         = 1 << 6;
		var CALL         = 1 << 7;
		var NULLARY_CALL = 1 << 8;

		Parser.prototype = {
			parse: function (expr) {
				this.errormsg = "";
				this.success = true;
				var operstack = [];
				var tokenstack = [];
				this.tmpprio = 0;
				var expected = (PRIMARY | LPAREN | FUNCTION | SIGN);
				var noperators = 0;
				this.expression = expr;
				this.pos = 0;

				while (this.pos < this.expression.length) {
					if (this.isOperator()) {
						if (this.isSign() && (expected & SIGN)) {
							if (this.isNegativeSign()) {
								this.tokenprio = 2;
								this.tokenindex = "-";
								noperators++;
								this.addfunc(tokenstack, operstack, TOP1);
							}
							expected = (PRIMARY | LPAREN | FUNCTION | SIGN);
						}
						else if (this.isComment()) {

						}
						else {
							if ((expected & OPERATOR) === 0) {
								this.error_parsing(this.pos, "unexpected operator");
							}
							noperators += 2;
							this.addfunc(tokenstack, operstack, TOP2);
							expected = (PRIMARY | LPAREN | FUNCTION | SIGN);
						}
					}
					else if (this.isNumber()) {
						if ((expected & PRIMARY) === 0) {
							this.error_parsing(this.pos, "unexpected number");
						}
						var token = new Token(TNUMBER, 0, 0, this.tokennumber);
						tokenstack.push(token);

						expected = (OPERATOR | RPAREN | COMMA);
					}
					else if (this.isString()) {
						if ((expected & PRIMARY) === 0) {
							this.error_parsing(this.pos, "unexpected string");
						}
						var token = new Token(TNUMBER, 0, 0, this.tokennumber);
						tokenstack.push(token);

						expected = (OPERATOR | RPAREN | COMMA);
					}
					else if (this.isLeftParenth()) {
						if ((expected & LPAREN) === 0) {
							this.error_parsing(this.pos, "unexpected \"(\"");
						}

						if (expected & CALL) {
							noperators += 2;
							this.tokenprio = -2;
							this.tokenindex = -1;
							this.addfunc(tokenstack, operstack, TFUNCALL);
						}

						expected = (PRIMARY | LPAREN | FUNCTION | SIGN | NULLARY_CALL);
					}
					else if (this.isRightParenth()) {
					    if (expected & NULLARY_CALL) {
							var token = new Token(TNUMBER, 0, 0, []);
							tokenstack.push(token);
						}
						else if ((expected & RPAREN) === 0) {
							this.error_parsing(this.pos, "unexpected \")\"");
						}

						expected = (OPERATOR | RPAREN | COMMA | LPAREN | CALL);
					}
					else if (this.isComma()) {
						if ((expected & COMMA) === 0) {
							this.error_parsing(this.pos, "unexpected \",\"");
						}
						this.addfunc(tokenstack, operstack, TOP2);
						noperators += 2;
						expected = (PRIMARY | LPAREN | FUNCTION | SIGN);
					}
					else if (this.isConst()) {
						if ((expected & PRIMARY) === 0) {
							this.error_parsing(this.pos, "unexpected constant");
						}
						var consttoken = new Token(TNUMBER, 0, 0, this.tokennumber);
						tokenstack.push(consttoken);
						expected = (OPERATOR | RPAREN | COMMA);
					}
					else if (this.isOp2()) {
						if ((expected & FUNCTION) === 0) {
							this.error_parsing(this.pos, "unexpected function");
						}
						this.addfunc(tokenstack, operstack, TOP2);
						noperators += 2;
						expected = (LPAREN);
					}
					else if (this.isOp1()) {
						if ((expected & FUNCTION) === 0) {
							this.error_parsing(this.pos, "unexpected function");
						}
						this.addfunc(tokenstack, operstack, TOP1);
						noperators++;
						expected = (LPAREN);
					}
					else if (this.isVar()) {
						if ((expected & PRIMARY) === 0) {
							this.error_parsing(this.pos, "unexpected variable");
						}
						var vartoken = new Token(TVAR, this.tokenindex, 0, 0);
						tokenstack.push(vartoken);

						expected = (OPERATOR | RPAREN | COMMA | LPAREN | CALL);
					}
					else if (this.isWhite()) {
					}
					else {
						if (this.errormsg === "") {
							this.error_parsing(this.pos, "unknown character");
						}
						else {
							this.error_parsing(this.pos, this.errormsg);
						}
					}
				}
				if (this.tmpprio < 0 || this.tmpprio >= 10) {
					this.error_parsing(this.pos, "unmatched \"()\"");
				}
				while (operstack.length > 0) {
					var tmp = operstack.pop();
					tokenstack.push(tmp);
				}
				if (noperators + 1 !== tokenstack.length) {
					//print(noperators + 1);
					//print(tokenstack);
					this.error_parsing(this.pos, "parity");
				}

				return new Expression(tokenstack, object(this.ops1), object(this.ops2), object(this.functions));
			},

			evaluate: function (expr, variables) {
				return this.parse(expr).evaluate(variables);
			},

			error_parsing: function (column, msg) {
				this.success = false;
				this.errormsg = "parse error [column " + (column) + "]: " + msg;
				this.column = column;
				throw new Error(this.errormsg);
			},

	//\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\

			addfunc: function (tokenstack, operstack, type_) {
				var operator = new Token(type_, this.tokenindex, this.tokenprio + this.tmpprio, 0);
				while (operstack.length > 0) {
					if (operator.prio_ <= operstack[operstack.length - 1].prio_) {
						tokenstack.push(operstack.pop());
					}
					else {
						break;
					}
				}
				operstack.push(operator);
			},

			isNumber: function () {
				var r = false;
				var str = "";
				while (this.pos < this.expression.length) {
					var code = this.expression.charCodeAt(this.pos);
					if ((code >= 48 && code <= 57) || code === 46) {
						str += this.expression.charAt(this.pos);
						this.pos++;
						this.tokennumber = parseFloat(str);
						r = true;
					}
					else {
						break;
					}
				}
				return r;
			},

			// Ported from the yajjl JSON parser at http://code.google.com/p/yajjl/
			unescape: function(v, pos) {
				var buffer = [];
				var escaping = false;

				for (var i = 0; i < v.length; i++) {
					var c = v.charAt(i);

					if (escaping) {
						switch (c) {
						case "'":
							buffer.push("'");
							break;
						case '\\':
							buffer.push('\\');
							break;
						case '/':
							buffer.push('/');
							break;
						case 'b':
							buffer.push('\b');
							break;
						case 'f':
							buffer.push('\f');
							break;
						case 'n':
							buffer.push('\n');
							break;
						case 'r':
							buffer.push('\r');
							break;
						case 't':
							buffer.push('\t');
							break;
						case 'u':
							// interpret the following 4 characters as the hex of the unicode code point
							var codePoint = parseInt(v.substring(i + 1, i + 5), 16);
							buffer.push(String.fromCharCode(codePoint));
							i += 4;
							break;
						default:
							throw this.error_parsing(pos + i, "Illegal escape sequence: '\\" + c + "'");
						}
						escaping = false;
					} else {
						if (c == '\\') {
							escaping = true;
						} else {
							buffer.push(c);
						}
					}
				}

				return buffer.join('');
			},

			isString: function () {
				var r = false;
				var str = "";
				var startpos = this.pos;
				if (this.pos < this.expression.length && this.expression.charAt(this.pos) == "'") {
					this.pos++;
					while (this.pos < this.expression.length) {
						var code = this.expression.charAt(this.pos);
						if (code != "'" || str.slice(-1) == "\\") {
							str += this.expression.charAt(this.pos);
							this.pos++;
						}
						else {
							this.pos++;
							this.tokennumber = this.unescape(str, startpos);
							r = true;
							break;
						}
					}
				}
				return r;
			},

			isConst: function () {
				var str;
				for (var i in this.consts) {
					if (true) {
						var L = i.length;
						str = this.expression.substr(this.pos, L);
						if (i === str) {
							this.tokennumber = this.consts[i];
							this.pos += L;
							return true;
						}
					}
				}
				return false;
			},

			isOperator: function () {
				var code = this.expression.charCodeAt(this.pos);
				if (code === 43) { // +
					this.tokenprio = 2;
					this.tokenindex = "+";
				}
				else if (code === 45) { // -
					this.tokenprio = 2;
					this.tokenindex = "-";
				}
				else if (code === 62) { // >
					if (this.expression.charCodeAt(this.pos + 1) === 61) {
						this.pos++;
						this.tokenprio = 1;
						this.tokenindex = ">=";
					} else {
						this.tokenprio = 1;
						this.tokenindex = ">";
					}
				}
				else if (code === 60) { // <
					if (this.expression.charCodeAt(this.pos + 1) === 61) {
						this.pos++;
						this.tokenprio = 1;
						this.tokenindex = "<=";
					} else {
						this.tokenprio = 1;
						this.tokenindex = "<";
					}
				}
				else if (code === 124) { // |
					if (this.expression.charCodeAt(this.pos + 1) === 124) {
						this.pos++;
						this.tokenprio = 1;
						this.tokenindex = "||";
					}
					else {
						return false;
					}
				}
				else if (code === 61) { // =
					if (this.expression.charCodeAt(this.pos + 1) === 61) {
						this.pos++;
						this.tokenprio = 1;
						this.tokenindex = "==";
					}
					else {
						return false;
					}
				}
				else if (code === 33) { // !
					if (this.expression.charCodeAt(this.pos + 1) === 61) {
						this.pos++;
						this.tokenprio = 1;
						this.tokenindex = "!=";
					}
					else {
						return false;
					}
				}
				else if (code === 97) { // a
					if (this.expression.charCodeAt(this.pos + 1) === 110 && this.expression.charCodeAt(this.pos + 2) === 100) { // n && d
						this.pos++;
						this.pos++;
						this.tokenprio = 0;
						this.tokenindex = "and";
					}
					else {
						return false;
					}
				}
				else if (code === 111) { // o
					if (this.expression.charCodeAt(this.pos + 1) === 114) { // r
						this.pos++;
						this.tokenprio = 0;
						this.tokenindex = "or";
					}
					else {
						return false;
					}
				}
				else if (code === 42 || code === 8729 || code === 8226) { // * or ∙ or •
					this.tokenprio = 3;
					this.tokenindex = "*";
				}
				else if (code === 47) { // /
					this.tokenprio = 4;
					this.tokenindex = "/";
				}
				else if (code === 37) { // %
					this.tokenprio = 4;
					this.tokenindex = "%";
				}
				else if (code === 94) { // ^
					this.tokenprio = 5;
					this.tokenindex = "^";
				}
				else {
					return false;
				}
				this.pos++;
				return true;
			},

			isSign: function () {
				var code = this.expression.charCodeAt(this.pos - 1);
				if (code === 45 || code === 43) { // -
					return true;
				}
				return false;
			},

			isPositiveSign: function () {
				var code = this.expression.charCodeAt(this.pos - 1);
				if (code === 43) { // +
					return true;
				}
				return false;
			},

			isNegativeSign: function () {
				var code = this.expression.charCodeAt(this.pos - 1);
				if (code === 45) { // -
					return true;
				}
				return false;
			},

			isLeftParenth: function () {
				var code = this.expression.charCodeAt(this.pos);
				if (code === 40) { // (
					this.pos++;
					this.tmpprio += 10;
					return true;
				}
				return false;
			},

			isRightParenth: function () {
				var code = this.expression.charCodeAt(this.pos);
				if (code === 41) { // )
					this.pos++;
					this.tmpprio -= 10;
					return true;
				}
				return false;
			},

			isComma: function () {
				var code = this.expression.charCodeAt(this.pos);
				if (code === 44) { // ,
					this.pos++;
					this.tokenprio = -1;
					this.tokenindex = ",";
					return true;
				}
				return false;
			},

			isWhite: function () {
				var code = this.expression.charCodeAt(this.pos);
				if (code === 32 || code === 9 || code === 10 || code === 13) {
					this.pos++;
					return true;
				}
				return false;
			},

			isOp1: function () {
				var str = "";
				for (var i = this.pos; i < this.expression.length; i++) {
					var c = this.expression.charAt(i);
					if (c.toUpperCase() === c.toLowerCase()) {
						if (i === this.pos || (c != '_' && (c < '0' || c > '9'))) {
							break;
						}
					}
					str += c;
				}
				if (str.length > 0 && (str in this.ops1)) {
					this.tokenindex = str;
					this.tokenprio = 5;
					this.pos += str.length;
					return true;
				}
				return false;
			},

			isOp2: function () {
				var str = "";
				for (var i = this.pos; i < this.expression.length; i++) {
					var c = this.expression.charAt(i);
					if (c.toUpperCase() === c.toLowerCase()) {
						if (i === this.pos || (c != '_' && (c < '0' || c > '9'))) {
							break;
						}
					}
					str += c;
				}
				if (str.length > 0 && (str in this.ops2)) {
					this.tokenindex = str;
					this.tokenprio = 5;
					this.pos += str.length;
					return true;
				}
				return false;
			},

			isVar: function () {
				var str = "";
				for (var i = this.pos; i < this.expression.length; i++) {
					var c = this.expression.charAt(i);
					if (c.toUpperCase() === c.toLowerCase()) {
						if (i === this.pos || (c != '_' && (c < '0' || c > '9'))) {
							break;
						}
					}
					str += c;
				}
				if (str.length > 0) {
					this.tokenindex = str;
					this.tokenprio = 4;
					this.pos += str.length;
					return true;
				}
				return false;
			},

			isComment: function () {
				var code = this.expression.charCodeAt(this.pos - 1);
				if (code === 47 && this.expression.charCodeAt(this.pos) === 42) {
					this.pos = this.expression.indexOf("*/", this.pos) + 2;
					if (this.pos === 1) {
						this.pos = this.expression.length;
					}
					return true;
				}
				return false;
			}
		};
		return Parser;
	};

	/**
	 * Extracts symbols from an equation.  An equation can consist of symbols and the following operators: +-/*%()
	 * PEMDAS order is followed.  Additionally, symbols can be enclosed in brackets [] to treat them as literal non-parseables.
	 * @param {string} equation The equation to parse (e.g. IBM+GE)
	 * @return  {object} Parsed equation, {equation: [formatted equation], symbols: [array of symbols found in the equation]}
	 * @memberOf CIQ
	 * @version ChartIQ Advanced Package
	 */
	CIQ.formatEquation=function(equation){
		var eq="";
		var syms=[];
		var thisSym="";
		var lockSymbol=false;
		for(var j=1;j<equation.length;j++){
			var c=equation[j].toUpperCase();
			if(c=="[" && !lockSymbol) {
				lockSymbol=true;
			}else if(c=="]" && lockSymbol) {
				lockSymbol=false;
				if(thisSym!=="") {
					syms.push(thisSym);
					eq+="["+thisSym+"]";
				}
				thisSym="";
			}else if(lockSymbol){
				thisSym+=c;
			}else if(c=='+' || c=='-' || c=='*' || c=='/' || c==':' || c=='%' || c=='(' || c==')'){
				if(thisSym!=="" && isNaN(thisSym)) {
					syms.push(thisSym);
					eq+="["+thisSym+"]";
				}else{
					eq+=thisSym;
				}
				if(c==':') c="/";
				eq+=c;
				thisSym="";
			}else if(c!=' '){
				thisSym+=c;
			}
		}
		if(thisSym!=="" && isNaN(thisSym)) {
			syms.push(thisSym);
			eq+="["+thisSym+"]";
		}else{
			eq+=thisSym;
		}
		return {equation:eq,symbols:syms};
	};
	
	/**
	 * Extracts symbols from an equation and fetches the quotes for them.
	 * @param {object} params Parameters used for the fetch
	 * @param  {function} cb Callback function once all quotes are fetched
	 * @memberOf CIQ
	 * @version ChartIQ Advanced Package
	 */
	CIQ.fetchEquationChart=function(params,cb){
		var formEq=CIQ.formatEquation(params.symbol);
		var syms=formEq.symbols;
		var arr=[];
		// jump through hoops with stx so that CIQ.clone doesn't choke on it
		var stx=params.stx;
		params.stx=null;
		for(var i=0;i<syms.length;i++){
		    var newParams=CIQ.shallowClone(params);
		    newParams.stx=stx;
		    newParams.symbol=syms[i];
		    arr.push(newParams);
		}
		console.log('the array:',arr);
		params.stx=stx;
		// multi fetch the symbols we need
		stx.quoteDriver.quoteFeed.multiFetch(arr, function(results){
		    var map={};
		    params.loadMoreReplace=true;
			var attribution={charge:0};
		    // error on any symbol then error out. Otherwise construct map.
		    for(var i=0;i<results.length;i++){
		      var result=results[i];
		      if(result.dataCallback.error){
		        cb({error:result.dataCallback.error});
		        return;
		      }
		      map[result.params.symbol]=result.dataCallback.quotes;
		      params.loadMoreReplace=params.loadMoreReplace && result.params.loadMoreReplace;
		      params.moreToLoad=params.moreToLoad || result.dataCallback.moreAvailable;
		      if(result.dataCallback.attribution.charge) attribution.charge+=result.dataCallback.attribution.charge;
		      //TODO: determine proper attribution source/exchange from result.dataCallback.attribution and assign to attribution
		    }
		    // compute the result and then pass to the response
		    if(arr.length || !(params.loadMore || params.update)){
		    	try{
			    	var equQuotes=CIQ.computeEquationChart(formEq.equation, map);
			    	cb({quotes:equQuotes, moreAvailable: params.moreToLoad, attribution:attribution});
			    }catch(e){
			    	var error={error:"Invalid equation: "+formEq.equation};
			    	if(e.name && e.name=="NoException") error.suppressAlert=true;
			    	cb(error);
			    }
		    }
		});
	};

	/**
	 * Computes an equation that may contain symbols and simple arithmetic operators.
	 * Parentheses can be used to separate portions of the equation.
	 * PEMDAS priority is observed.
	 * Symbols can be optionally contained within brackets.
	 * Valid examples: 3*IBM, 4+(IBM*2), (IBM-GM)/2
	 * If the equation cannot be resolved an exception is thrown.
	 * @param {string} equation The equation to compute.
	 * @param  {Object} map An map of symbols to data
	 * @return {Array}     A consolidated array of equation results
	 * @memberOf CIQ
	 * @version ChartIQ Advanced Package
	 */
	CIQ.computeEquationChart=function(equation, map){
		equation=equation.replace(/[:]/,"/").toUpperCase();
		var count=0;
		for(var sym in map){
			var r=new RegExp("\\["+sym.replace("^","\\\^").replace(/[\+\-\*\/\%\(\)]/g,"\\$&")+"\\]","g");
			equation=equation.replace(r,"symbol"+count);
			count++;
		}
		var expr=Parser().parse(equation);
		var newArray=[];
		var iters={};
		var numSyms=0,c;
		var firstIter=null;
		var priceRelative=false;
		for(sym in map) {
			iters[sym]={i:0,s:sym};
			if(map[sym]){
				numSyms++;
				c=map[sym][0];
			}else if(numSyms==1){
				priceRelative=sym;
			}
			if(!c.DT) c.DT=CIQ.strToDateTime(c.Date);
			iters[sym].d=c.DT;
			if(!firstIter) firstIter=iters[sym];
		}
		var constant=(numSyms===0);
		var computeHighLow=(numSyms==1 && equation.indexOf("%")==-1);
		function incrementIterator(iterator){
			iterator.i++;
			if(map[iterator.s]){
				if(iterator.i>=map[iterator.s].length) return 0;
				c=map[iterator.s][iterator.i];
			}
			if(!c.DT) c.DT=CIQ.strToDateTime(c.Date);
			iterator.d=c.DT;
			return 1;
		}
		function isAllAligned(){
			var laggard=null;
			var temp=null;
			for(var iter in iters){
				if(!temp) temp=iters[iter];
				else if(iters[iter].d.getTime()<temp.d.getTime()){
					laggard=temp=iters[iter];
				}else if(iters[iter].d.getTime()>temp.d.getTime()){
					laggard=temp;
				}
			}
			if(laggard){
				if(!incrementIterator(laggard)) return 0;
				return -1;
			}
			return 1;
		}
		whileLoop:
		while(true){
			var aligned=isAllAligned();
			if(!aligned) break;
			if(aligned==1){
				var m;
				if(priceRelative){
					var close=expr.evaluate({symbol0:map[firstIter.s][firstIter.i].Close,symbol1:map[firstIter.s][firstIter.i][priceRelative]});
					close=Number(close.toFixed(8));//Math.round(close*10000)/10000;
					m={DT:firstIter.d, Close:close, Adj_Close:close};
					m[firstIter.s]=map[firstIter.s][firstIter.i].Close;
					if(!isNaN(close)) newArray.push(m);
				}else if(constant){
					var res=expr.evaluate({});
					CIQ.alert(equation+"="+res);
					throw({"name":"NoException","message":""});
				}else{
					count=0;
					var evaluators={Adj_Close:{},Close:{},Open:{},High:{},Low:{},Volume:{}};
					for(sym in map){
						for(var e in evaluators){
							evaluators[e]["symbol"+count]=map[sym][iters[sym].i][e];
						}
						count++;
					}
					m={ DT:firstIter.d };
					/*
					variation 1 (Stockcharts.com):
					m.Close/=c.Close;
					m.High/=c.Close;
					m.Low/=c.Close;
					m.Open/=c.Close;

					variation 2 (eSignal):
					m.Close/=c.Close;
					m.High/=c.High;
					m.Low/=c.Low;
					m.Open/=c.Open;
					m.High=Math.max(m.High,Math.max(m.Open,m.Close));
					m.Low=Math.min(m.Low,Math.min(m.Open,m.Close));
					*/

					m.Adj_Close=expr.evaluate(evaluators.Adj_Close);
					m.Close=expr.evaluate(evaluators.Close);
					m.Open=expr.evaluate(evaluators.Open);
					m.Volume=expr.evaluate(evaluators.Volume);
					if(isNaN(m.Volume)) m.Volume=0;

					if(computeHighLow){
						m.High=expr.evaluate(evaluators.High);
						m.Low=expr.evaluate(evaluators.Low);
					}else{
						m.High=Math.max(m.Open,m.Close);
						m.Low=Math.min(m.Open,m.Close);
					}
					if(!isNaN(m.Close)) newArray.push(m);

					if(!isNaN(m.High)) m.High=Number(m.High.toFixed(8));//Math.round(m.High*10000)/10000;
					if(!isNaN(m.Low)) m.Low=Number(m.Low.toFixed(8));//Math.round(m.Low*10000)/10000;
					if(!isNaN(m.Open)) m.Open=Number(m.Open.toFixed(8));//Math.round(m.Open*10000)/10000;
					if(!isNaN(m.Close)) m.Close=Number(m.Close.toFixed(8));//Math.round(m.Close*10000)/10000;
					if(!isNaN(m.Adj_Close)) m.Adj_Close=Number(m.Adj_Close.toFixed(8));//Math.round(m.Adj_Close*10000)/10000;
					else m.Adj_Close=m.Close;

					count=0;
					for(sym in map){
						m[sym]=evaluators.Close["symbol"+count];
						count++;
					}

				}
				for(sym in map){
					if(!incrementIterator(iters[sym])) break whileLoop;
				}
			}
		}
		return newArray;
	};

	return _exports;
});