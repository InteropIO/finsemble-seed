(function (definition) {
	"use strict";

	if (typeof exports === "object" && typeof module === "object") {
		module.exports = definition(require('./componentUI'));
	} else if (typeof define === "function" && define.amd) {
		define(['componentUI'], definition);
	} else if (typeof window !== "undefined" || typeof self !== "undefined") {
		var global = typeof window !== "undefined" ? window : self;
		definition(global);
	} else {
		throw new Error("Only CommonJS, RequireJS, and <script> tags supported for tradingcentral/components.js.");
	}
})(function(_exports) {
	var CIQ = _exports.CIQ;
	var TradingCentralController; // loaded dynamically via XHR
	var UI = CIQ.UI;
	var BasicDetails = {};
	var CqTcNumber = {};
	var TradingCentral = {};

	BasicDetails.prototype = Object.create(window.HTMLElement.prototype);

	BasicDetails.prototype.createdCallback = function() {
		var self = this;
		var summary = this.querySelector('cq-summary');

		// When share (html2canvas) clones the dom, this element doesn't exist yet, safe to ignore.
		if (!summary) return;

		summary.addEventListener('click', function() {
			if (self.hasAttribute('open')) {
				self.removeAttribute('open');
			} else {
				self.setAttribute('open', 'open');
			}
		});
	};

	BasicDetails.prototype.attributeChangedCallback = function(name, oldVal, newVal) {
		// if the open attribute was added or removed
		if (name === 'open' && ((oldVal === null && typeof newVal == 'string') || (newVal === null && typeof oldVal == 'string'))) {
			this.dispatchEvent(new Event('toggle'));
		}
	};

	/**
	 * TradingCentral tag to create a box around an analysis line when the mouse enters this element.
	 */
	CqTcNumber.prototype = Object.create(UI.ContextTag);

	CqTcNumber.prototype.createdCallback = function() {
		UI.ContextTag.createdCallback.call(this);

		Object.defineProperty(this, 'number', {
			get: function() {
				return this.textContent.trim();
			},
			set: function(newVal) {
				this.textContent = newVal;
			},
			enumerable: false
		});
	};

	CqTcNumber.prototype.attachedCallback = function() {
		if (this.attached) return;
		UI.ContextTag.attachedCallback.call(this);
		this.attached = true;
	};

	CqTcNumber.prototype.setContext = function(context) {
		context.advertiseAs(this, "CqTcNumber");
		this.initialize();
	};

	CqTcNumber.prototype.initialize = function() {
		var self = this;

		this.addEventListener('mouseenter', function() {
			var node = document.createElement('cq-tc-number-line-selector');

			node.innerHTML = '&nbsp;';

			new CIQ.Marker({
				stx: self.context.stx,
				node: node,
				yPositioner: 'value',
				y: self.number,
				xPositioner: 'none',
				label: 'cq-tc-number-line-selector'
			});

			self.context.stx.draw();
		});

		this.addEventListener('mouseleave', function() {
			CIQ.Marker.removeByLabel(self.context.stx, 'cq-tc-number-line-selector');
		});
	};

	/**
	 * Tag to insert the TradingCentral plugin above your chart.
	 *
	 * @example
	 * <cq-tradingcentral partner="000" token="Mk4r34"></cq-tradingcentral>
	 */
	TradingCentral.prototype = Object.create(UI.ContextTag);

	TradingCentral.prototype.attachedCallback = function() {
		if (this.attached) return;
		UI.ContextTag.attachedCallback.call(this);
		this.attached = true;
	};

	TradingCentral.prototype.setContext = function(context) {
		context.advertiseAs(this, "TradingCentral");
		this.initialize();
	};

	TradingCentral.prototype.attributeChangedCallback = function(name, oldVal, newVal) {
		if (name !== 'disabled') return;

		var offset = 38 + (this.querySelector('cq-details[open]') ? 76 : 0);

		// disabled attribute added
		if (oldVal === null && typeof newVal == 'string') {
			if (this.context.events) {
				if (this.context.events.layout) this.context.stx.removeEventListener(this.context.events.layout);
				if (this.context.events.symbolChange) this.context.stx.removeEventListener(this.context.events.symbolChange);
			}
			if (this.context.updateAgeTimer) window.clearInterval(this.context.updateAgeTimer);

			this.context.events = null;
			this.context.updateAgeTimer = null;
			this.context.controller.removeInjections();
			this.adjustChartArea(offset * -1);
		}

		// disabled attribute removed
		if (newVal === null && typeof oldVal == 'string') {
			this.adjustChartArea(offset);
			this.run();
		}
	};

	/**
	 * Use this method to create/remove display space above the chart.
	 *
	 * @param {Number} pixels pass a negative number to remove space or a positive number to create space
	 * @example
	 * // move chart area down 38 pixels
	 * tcElement.adjustChartArea(38);
	 *
	 * @example
	 * // move chart area up 38 pixels
	 * tcElement.adjustChartArea(-38);
	 */
	TradingCentral.prototype.adjustChartArea = function(pixels) {
		var chartArea = document.querySelector('.ciq-chart-area');
		var top = parseInt(window.getComputedStyle(chartArea).top, 10);

		chartArea.style.top = (top + pixels) + "px";

		// force a resize event to correct the chart-area's height
		window.dispatchEvent(new Event('resize'));
	};

	TradingCentral.prototype.initialize = function() {
		var self = this;
		var basePath = 'plugins/tradingcentral';
		var uiCount = 0;
		var uiDone = function(err) {
			if (err) return console.error(err);

			if (++uiCount === 3) {
				TradingCentralController = CIQ.TradingCentral;
				self.context.controller = new TradingCentralController(self.context.stx, self.getAttribute('token'), self.getAttribute('partner'));
				self.run();
			}
		};

		var lineInfoCount = 0;
		var lineInfoDone = function(err) {
			if (err) return console.error(err);

			if (++lineInfoCount == 2) return self.lineHoverListen();
		};

		CIQ.loadScript(basePath + '/controller.js', uiDone);
		CIQ.loadStylesheet(basePath + '/ui.css', uiDone);
		CIQ.loadUI(basePath + '/ui.html', function(err) {
			if (err) return uiDone(err);

			var details = document.querySelector('cq-details');

			details.addEventListener('toggle', function() {
				var offset = 76; // TODO: Make this dynamic

				self.adjustChartArea(this.hasAttribute('open') ? offset : offset * -1);
			});

			details.parentNode.removeChild(details);
			self.appendChild(details);

			if (!self.hasAttribute('disabled')) {
				self.adjustChartArea(38 + (details.hasAttribute('open') ? 76 : 0));
			}

			uiDone(null);
		});

		CIQ.loadUI(basePath + '/line-info.html', lineInfoDone);
		CIQ.postAjax({
			url: basePath + '/line-info.json',
			cb: function(status, response, headers) {
				if (status != 200) return lineInfoDone(response || 'unknown server error');

				try {
					self.context.buildText = JSON.parse(response);
				} catch (e) {
					return lineInfoDone(e);
				}

				lineInfoDone(null);
			}
		});
	};

	TradingCentral.prototype.lineHoverListen = function() {
		var buildText = this.context.buildText;
		var lineInfo = document.getElementById('tc-line-info-tmpl').content.querySelector('tc-line-info');
		var stxx = this.context.stx;

		this.addEventListener('linehoverbegin', function(hover) {
			var newNode = document.importNode(lineInfo, true);
			var parts = buildText[hover.detail.line];

			newNode.className = hover.detail.line;
			newNode.appendChild(document.createTextNode(parts.description + parts.trend[hover.detail.trend]));

			new CIQ.Marker({
				stx: stxx,
				node: newNode,
				yPositioner: 'value',
				y: hover.detail.price,
				xPositioner: 'none',
				label: 'tc-line-info-' + hover.detail.line
			});

			stxx.draw();
		});

		this.addEventListener('linehoverend', function(hover) {
			CIQ.Marker.removeByLabel(stxx, 'tc-line-info-' + hover.detail.line);
		});
	};

	TradingCentral.prototype.run = function() {
		if (this.hasAttribute('disabled')) return;

		this.context.events = {};
		this.context.updateAgeTimer = null;

		var controller = this.context.controller;
		var selfNode = this;
		var dom = {
			symbol: this.querySelector('cq-tc-symbol'),
			story: this.querySelector('cq-tc-story'),
			age: this.querySelector('cq-tc-age'),
			preference: this.querySelector('cq-tc-preference'),
			alternative: this.querySelector('cq-tc-alternative'),
			comments: this.querySelector('cq-tc-comments'),
			indicatorToggle: this.querySelector('cq-tc-indicator-toggle'),
			activeTerm: this.querySelector('cq-tc-term-active'),
			termButtons: {
				Intraday: this.querySelector('cq-tc-term-button[value="Intraday"]'),
				ST: this.querySelector('cq-tc-term-button[value="ST"]'),
				MT: this.querySelector('cq-tc-term-button[value="MT"]')
			}
		};
		var goBackButton;
		var numberRE = /[0-9]+\.?[0-9]*/g;
		var appendSubsection = function(element, subsection) {
			element.innerHTML = '';
			subsection.paragraphs.map(function(fulltext) {
				var p = document.createElement('p');
				var text = fulltext.split(numberRE);
				var number = fulltext.match(numberRE);
				var nElement;
				var i = 0;
				for (; number && i < number.length; ++i) {
					nElement = document.createElement('cq-tc-number');
					nElement.innerHTML = number[i];

					p.appendChild(document.createTextNode(text[i]));
					p.appendChild(nElement);
				}
				p.appendChild(document.createTextNode(text[i]));
				return p;
			}).forEach(function(p) { element.appendChild(p); });
		};
		var buttonSelected = false;
		var changingTerm = false;
		var currentTerm = controller.getCurrentTerm();
		var loader = this.context.loader;
		var changeTerm = function(info) {
			info.stopPropagation();

			// The selected button just needs to stop propagation
			if (this.hasAttribute('selected')) return;
			if (loader) loader.show();

			changingTerm = true;

			var term = this.getAttribute('value');

			if (buttonSelected) {
				for (var k in dom.termButtons) {
					if (dom.termButtons[k].hasAttribute('selected')) {
						dom.termButtons[k].removeAttribute('selected');
						break;
					}
				}
			}

			dom.termButtons[term].setAttribute('selected', 'selected');
			buttonSelected = true;

			updateAnalysis({symbolObject: controller.stx.chart.symbolObject}, term);

			controller.stx.setPeriodicityV2(1, controller.interval[term], function() {
				var parent = dom.activeTerm.parentNode;
				var moveChild = dom.activeTerm.childNodes[0];

				if (moveChild) parent.appendChild(moveChild);

				dom.activeTerm.innerHTML = '';
				dom.activeTerm.appendChild(dom.termButtons[term]);

				if (goBackButton) {
					goBackButton.remove();
					goBackButton = null;
				}

				if (loader) loader.hide();

				changingTerm = false;
				currentTerm = term;
			});
		};

		dom.termButtons.Intraday.addEventListener('click', changeTerm);
		dom.termButtons.ST.addEventListener('click', changeTerm);
		dom.termButtons.MT.addEventListener('click', changeTerm);

		if (currentTerm) {
			dom.termButtons[currentTerm].setAttribute('selected', 'selected');
			buttonSelected = true;
			dom.activeTerm.appendChild(dom.termButtons[currentTerm]);
		}

		this.context.events.layout = controller.stx.addEventListener('layout', function() {
			if (changingTerm) return;
			if (!dom.termButtons[currentTerm].hasAttribute('selected')) return;
			if (currentTerm === controller.getCurrentTerm()) return;

			dom.termButtons[currentTerm].removeAttribute('selected');
			buttonSelected = false;

			var node = document.createElement('cq-tc-term-button');
			node.setAttribute('cq-marker', 'cq-marker');
			node.setAttribute('value', dom.termButtons[currentTerm].getAttribute('value'));
			node.appendChild(document.createTextNode('Go back to ' + dom.termButtons[currentTerm].textContent));
			node.addEventListener('click', changeTerm);
			node.addEventListener('click', function() {
				this.setAttribute('selected', 'selected');
			});

			goBackButton = new CIQ.Marker({
				stx: controller.stx,
				node: node,
				xPositioner: 'none',
				yPositioner: 'none'
			});
		});

		if (dom.indicatorToggle) {
			dom.indicatorToggle.addEventListener('click', function() {
				if (controller.displayingIndicators) {
					this.innerHTML = 'Show Indicators';
					controller.hideIndicators();
				} else {
					this.innerHTML = 'Hide Indicators';
					controller.showIndicators();
				}
			});
		}

		this.context.events.symbolChange = controller.stx.addEventListener('symbolChange', updateAnalysis);
		updateAnalysis({symbolObject: controller.stx.chart.symbolObject});

		function updateAnalysis(info, term) {
			if (!term) term = currentTerm;
			if (!term) return;
			if (selfNode.context.updateAgeTimer) {
				window.clearInterval(selfNode.context.updateAgeTimer);
				selfNode.context.updateAgeTimer = null;
			}

			controller.analysis({
				type_product: 'forex',
				product: info.symbolObject.symbol.replace(/^\^/, ''),
				term: term
			}, function(error, xmlDocument) {
				if (error) {
					controller.removeInjections();

					dom.symbol.innerHTML = '';
					dom.story.innerHTML = 'No TA Found';
					dom.story.className = '';
					dom.age.innerHTML = '';
					dom.preference.innerHTML = '';
					dom.alternative.innerHTML = '';
					dom.comments.innerHTML = '';

					console.error(error);
					return;
				}

				var fields = TradingCentralController.parse(xmlDocument);

				controller.removeInjections();

				dom.symbol.innerHTML = info.symbolObject.symbol;

				dom.story.innerHTML = '';
				var img = document.createElement('img');
				img.src = 'plugins/tradingcentral/img/tc-' + fields.header.directionName + '-' + Math.abs(fields.header.directionArrow) + '.png';
				img.className = 'tc-arrow';
				dom.story.appendChild(img);
				dom.story.appendChild(document.createTextNode(' ' + fields.story.title));
				dom.story.className = fields.header.directionName;

				dom.age.innerHTML = fields.header.$age;
				selfNode.context.updateAgeTimer = window.setInterval(function() {
					dom.age.innerHTML = fields.header.$age;
				}, 25000 /*25 seconds*/);

				appendSubsection(dom.preference, fields.story.subsections[1]);
				appendSubsection(dom.alternative, fields.story.subsections[2]);
				appendSubsection(dom.comments, fields.story.subsections[3]);

				controller.createDrawInjections(fields.header.option.chartlevels, fields.header.directionArrow);
				controller.createMouseInjections(fields.header.option.chartlevels, fields.header.directionName, selfNode);
			});
		}
	};

	UI.TradingCentral = document.registerElement("cq-tradingcentral", {prototype: TradingCentral.prototype});
	UI.BasicDetails = document.registerElement("cq-details", {prototype: BasicDetails.prototype});
	UI.CqTcNumber = document.registerElement("cq-tc-number", {prototype: CqTcNumber.prototype});

	return _exports;
});
