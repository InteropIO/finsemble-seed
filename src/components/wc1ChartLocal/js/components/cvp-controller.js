/* removeIf(umd) */ ;(function(root, factory) {
	if (typeof define === 'function' && define.amd) {
		define(['componentUI'], factory);
	} else if (typeof exports === 'object') {
		module.exports = factory(require('./componentUI'));
	} else {
		factory(root);
	}
})(this, function(_exports) {
	var CIQ = _exports.CIQ;
	/* endRemoveIf(umd) */

	/**
	 * Simple WebComponent that allows data binding to arbitrary properties of currentVectorParameters.
	 * Ideal for use as a drawing toolbar extension.
	 *
	 * @example
	 * <cq-cvp-controller cq-section cq-cvp-scope="1">
	 * 	<div cq-section>
	 * 		<div class="ciq-heading">Dev 1</div>
	 * 		<span stxtap="toggleActive()" class="ciq-checkbox">
	 * 			<span></span>
	 * 		</span>
	 * 	</div>
	 * 	<cq-line-color cq-section class="ciq-color" stxbind="getColor()" stxtap="pickColor()">
	 * 		<span></span>
	 * 	</cq-line-color>
	 * 	<cq-line-style cq-section>
	 * 		<cq-menu class="ciq-select">
	 * 			<span cq-cvp-line-style class="ciq-line ciq-selected"></span>
	 * 			<cq-menu-dropdown class="ciq-line-style-menu">
	 * 				<cq-item stxtap="setStyle(1, 'solid')"><span class="ciq-line-style-option ciq-solid-1"></span></cq-item>
	 * 				<cq-item stxtap="setStyle(3, 'solid')"><span class="ciq-line-style-option ciq-solid-3"></span></cq-item>
	 * 				<cq-item stxtap="setStyle(5, 'solid')"><span class="ciq-line-style-option ciq-solid-5"></span></cq-item>
	 * 				<cq-item stxtap="setStyle(1, 'dotted')"><span class="ciq-line-style-option ciq-dotted-1"></span></cq-item>
	 * 				<cq-item stxtap="setStyle(3, 'dotted')"><span class="ciq-line-style-option ciq-dotted-3"></span></cq-item>
	 * 				<cq-item stxtap="setStyle(5, 'dotted')"><span class="ciq-line-style-option ciq-dotted-5"></span></cq-item>
	 * 				<cq-item stxtap="setStyle(1, 'dashed')"><span class="ciq-line-style-option ciq-dashed-1"></span></cq-item>
	 * 				<cq-item stxtap="setStyle(3, 'dashed')"><span class="ciq-line-style-option ciq-dashed-3"></span></cq-item>
	 * 				<cq-item stxtap="setStyle(5, 'dashed')"><span class="ciq-line-style-option ciq-dashed-5"></span></cq-item>
	 * 			</cq-menu-dropdown>
	 * 		</cq-menu>
	 * 	</cq-line-style>
	 * </cq-cvp-controller>
	 */
	// var CVPController = {
	// 	prototype: Object.create(CIQ.UI.ContextTag)
	// };

	class CVPController extends CIQ.UI.ContextTag {
		constructor() {
			super()
		CIQ.UI.ContextTag.constructor.call(this);

		Object.defineProperty(this, '_scope', {
			configurable: true,
			enumerable: false,
			value: this.getAttribute('cq-cvp-header') || '',
			writable: false
		});

		Object.defineProperties(CVPController.prototype, {
			active: createPropertyOfCVP('active'),
			color: createPropertyOfCVP('color'),
			lineWidth: createPropertyOfCVP('lineWidth'),
			pattern: createPropertyOfCVP('pattern')
		});

		}
	}

	var createPropertyOfCVP = function(key) {
		return {
			configurable: true,
			enumerable: false,
			get: function() {
				return this.context.stx.currentVectorParameters[key + this._scope];
			},
			set: function(value) {
				this.context.stx.currentVectorParameters[key + this._scope] = value;
			}
		};
	};

	// Object.defineProperties(CVPController.prototype, {
	// 	active: createPropertyOfCVP('active'),
	// 	color: createPropertyOfCVP('color'),
	// 	lineWidth: createPropertyOfCVP('lineWidth'),
	// 	pattern: createPropertyOfCVP('pattern')
	// });

	// CVPController.prototype.createdCallback = function() {
	// 	CIQ.UI.ContextTag.createdCallback.call(this);

	// 	Object.defineProperty(this, '_scope', {
	// 		configurable: true,
	// 		enumerable: false,
	// 		value: this.getAttribute('cq-cvp-header') || '',
	// 		writable: false
	// 	});
	// };

	CVPController.prototype.connectedCallback = function() {
		if (this.attached) return;
		var tmpl = document.querySelector('template[cq-cvp-controller]');
		if (this.children.length === 0 && tmpl) {
			var nodes = document.importNode(tmpl.content, true);
			var heading = nodes.querySelector('.ciq-heading');
			if (heading) {
				heading.innerHTML = this._scope;
			}
			this.appendChild(nodes);
		}
		CIQ.UI.ContextTag.attachedCallback.call(this);
		this.attached = true;
	};

	CVPController.prototype.setContext = function(context) {
		this.setStyle(null, 1, 'dotted');
	};

	CVPController.prototype.emit = function(eventName, value) {
		if(this.toolbar) {
			this.toolbar.emit(eventName, value);
		}else if (typeof CustomEvent === 'function') {
			this.dispatchEvent(new CustomEvent(eventName, {detail: value}));
		}else{
			// IE11 typeof above returned 'object' instead of 'function'
			var event = document.createEvent('CustomEvent');
			event.initCustomEvent(eventName, true, true, value);
			this.dispatchEvent(event);
		}
	};

	CVPController.prototype.toggleActive = function(activator) {
		var node = $(activator.node);
		var className = 'ciq-active';

		if (this.active) {
			this.active = false;
			node.removeClass(className);
		} else {
			this.active = true;
			node.addClass(className);
		}

		this.emit('change', {
			active: this.active
		});
	};

	CVPController.prototype.setStyle = function(activator, width, pattern) {
		this.lineWidth = parseInt(width, 10);
		this.pattern = pattern;

		var selection = $(this).find('*[cq-cvp-line-style]');

		if (this.lineStyleClassName) {
			selection.removeClass(this.lineStyleClassName);
		}

		if (pattern && pattern !== 'none') {
			this.lineStyleClassName = 'ciq-' + pattern + '-' + this.lineWidth;
			selection.addClass(this.lineStyleClassName);
		} else {
			this.lineStyleClassName = null;
		}

		this.emit('change', {
			lineWidth: width,
			pattern: pattern
		});
	};

	CVPController.prototype.getColor = function(activator) {
		var node = activator.node || $(this).find('cq-line-color');
		var color = this.color;

		if (color == 'transparent' || color == 'auto') {
			color = '';
		}

		$(node).css({
			'background-color': color
		});
	};

	CVPController.prototype.pickColor = function(activator) {
		var colorPicker = $('cq-color-picker')[0];
		var cvpController = this;

		if (!colorPicker) return console.error('CVPController.prototype.pickColor: no <cq-color-picker> available');

		colorPicker.callback = function(color) {
			cvpController.color = color;
			cvpController.getColor(activator);
			cvpController.emit('change', {
				color: color
			});
		};
		colorPicker.display(activator);
	};

	CIQ.UI.CVPController = customElements.define('cq-cvp-controller', CVPController);

	/* removeIf(umd) */
	return _exports;
});
/* endRemoveIf(umd) */
