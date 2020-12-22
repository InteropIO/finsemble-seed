// -------------------------------------------------------------------------------------------
// Copyright 2012-2019 by ChartIQ, Inc
// -------------------------------------------------------------------------------------------
// @jscrambler DEFINE

(function (definition) {
	"use strict";

	if (typeof exports === "object" && typeof module === "object") {
		module.exports = definition(require('chartiq/js/chartiq'),
		                            require('chartiq/plugins/timespanevent/timespanevent-marker.js'),
		                            require('chartiq/plugins/timespanevent/timespanevent.scss'));
	} else if (typeof define === "function" && define.amd) {
		define([
			'chartiq/js/chartiq',
			'chartiq/plugins/timespanevent/timespanevent-marker.js',
			'chartiq/plugins/timespanevent/timespanevent.scss',
		], definition);
	} else if (typeof window !== "undefined" || typeof self !== "undefined") {
		var global = typeof window !== "undefined" ? window : self;
		definition(global);
	} else {
		throw new Error("Only CommonJS, RequireJS, and <script> tags supported for timespanevent/timespanevent.js.");
	}
})(function(_exports,tse, css) {
	var CIQ = _exports.CIQ;

	const SPACING = 30;
	const DEFAULT_HEIGHT = 150;
	const TIME_SPAN_EVENT = "TimeSpanEvent";
	const TIME_SPAN_EVENT_PANEL = "timeSpanEventPanel";
	const TIME_SPAN_EVENT_CLASS = "span-event";

	var basePath = "plugins/timespanevent/";

	/**
	 * The Time Span Event panel that will contain and display all the time span events created by the user.
	 * @param {Object} params Configuration parameters.
	 * @param {CIQ.ChartEngine}	params.stx The chart object.
	 * @param {string} params.menuItemSelector The selector used to identify menu items for selecting time span events.
	 * @param {number} [params.height=150] Height of the Time Span Event panel.
	 * @param {boolean} [loadSample] If `true`, load the built-in time span event sample.
	 * @constructor
	 * @name  CIQ.TimeSpanEventPanel
	 * @example <caption>Declare a time span event panel and enable/disable using commands to be triggered from a menu.</caption>
	 * var stxx=new CIQ.ChartEngine({container:document.querySelector(".chartContainer")});
	 *
	 * // Instantiate the time span event panel.
	 * new CIQ.TimeSpanEventPanel({stx:stxx, height: 150});
	 *
	 * // To display the panel from a menu, use:
	 * stxx.layout.timeSpanEventPanel = true // Show the panel.
	 * stxx.changeOccurred("layout"); // Signal the change to force a redraw.
	 *
	 * // To hide the panel from a menu, use:
	 * stxx.layout.timeSpanEventPanel = false; // Hide the panel.
	 * stxx.changeOccurred("layout"); // Signal the change to force a redraw.
	 * @jscrambler ENABLE
	 * @since 7.2.0
	 */
	CIQ.TimeSpanEventPanel=function(params){
		var stx = params.stx;
		var timeSpanEventPanelHeight = params.height?params.height:DEFAULT_HEIGHT;
		this.eventData = []; // order selected matters
		this.activeMarkers = {};
		stx.timeSpanEventPanel = this;

		if(!css) {
			CIQ.loadStylesheet(basePath + "timespanevent.css", function() {
				if(!tse) CIQ.loadScript(basePath + "timespanevent-marker.js", function() {
					if(CIQ.UI) new CIQ.UI.TimeSpanEvent(params.context, {menuItemSelector: params.menuSelector, loadSample: params.loadSample});
				});
			});
		} else {
			if(CIQ.UI) new CIQ.UI.TimeSpanEvent(params.context, {menuItemSelector: params.menuSelector, loadSample: params.loadSample});
		}

		/**
		 * Creates and displays the panel or destroys the panel depending on the state.
		 * @param {Boolean} on State boolean that determines whether to show or destroy the panel; `true` = display, `false` = destroy.
		 * @memberOf CIQ.TimeSpanEventPanel.prototype
		 * @alias display
		 * @since 7.2.0
		 */
		this.display=function(on){
			if(!on) {
				stx.panelClose(stx.panels[TIME_SPAN_EVENT_PANEL]);
				return;
			}

			var yAxis = null;
			if(!stx.panels.timeSpanEventPanel) {
				yAxis = new CIQ.ChartEngine.YAxis();
				yAxis.name = TIME_SPAN_EVENT;
				stx.timeSpanEventPanel.panel = stx.createPanel("Time Span Events", TIME_SPAN_EVENT_PANEL, timeSpanEventPanelHeight, stx.chart.name, yAxis);
			} else {
				var panel = stx.panels.timeSpanEventPanel;
				yAxis = stx.getYAxisByName(panel, TIME_SPAN_EVENT);
				stx.timeSpanEventPanel.panel = panel;
			}

			yAxis.max = stx.timeSpanEventPanel.panel.height;
			yAxis.min = 0;
			yAxis.displayGridLines = false;
			yAxis.noDraw = true;

			stx.resizeChart();

			// add markers to the panel if they already exist
			var eventData = stx.timeSpanEventPanel.eventData;
			for(var i=0; i<eventData.length; i++) {
				this.showTimeSpanEvent(eventData[i], true);
			}
			stx.layout.timeSpanEventPanel = true;
		};

		/**
		 * Displays a time span event on the panel.
		 * @param {Object} spanEvent Object that defines the time span event.
		 * @param {String} spanEvent.type The type of time span event to display and the basis to identify each individual marker; for example, "News", "CEO", etc.
		 * @param {Object[]} spanEvent.events The data that drives the markers. See Time Span Event tutorial on how to format the data.
		 * @param {String} spanEvent.spanType One of three types that determine how the time span marker is drawn: `spanEvent`, `durationEvent`, `singleEvent`.
		 * @param {boolean} preLoad If `true`, the event data already exists, usually when time span event data is loaded before the panel is active.
		 * @memberOf CIQ.TimeSpanEventPanel.prototype
		 * @alias showTimeSpanEvent
		 * @since 7.2.0
		 */
		this.showTimeSpanEvent=function(spanEvent, preLoad) {
			var tsePanel = stx.timeSpanEventPanel;
			var eventData = tsePanel.eventData;
			var type = spanEvent.type;

			if(!tsePanel.panel) tsePanel.display(true);

			if(!preLoad) {
				spanEvent.spacingModifier = SPACING*(eventData.length + 1);
				eventData.push(spanEvent);
			}

			var activeMarker = {
				label: type,
				injections: [],
				uniqueMarkerIds: []
			};
			this.activeMarkers[type] = activeMarker;

			stx.timeSpanEventPanel.renderTimeSpanEvent(spanEvent);
			stx.draw();
		};

		/**
		 * Removes a time span event on the panel.
		 * @param {String} type The type of time span event to remove from the panel; for example, "News", "CEO", etc.
		 * @memberOf CIQ.TimeSpanEventPanel.prototype
		 * @alias removeTimeSpanEvent
		 * @since 7.2.0
		 */
		this.removeTimeSpanEvent=function(type) {
			var tsePanel = stx.timeSpanEventPanel;
			var tsePanelVisible = tsePanel.panel;
			var eventData = tsePanel.eventData;
			var spacingModifierDeleted = null;
			var indexToSplice = null;
			// remove the markers on the time span panel and modify the event data
			for(var i = 0; i < eventData.length; i++){
				var spacingModifier = eventData[i].spacingModifier;
				if (eventData[i].type === type) {
					indexToSplice = i;
					spacingModifierDeleted = spacingModifier;
					if(tsePanelVisible) CIQ.Marker.removeByLabel(stx, type);
				}
				// event data is in order of selected, so anything below the removed event needs a new spacing
				if(spacingModifierDeleted && (spacingModifier >= spacingModifierDeleted)) {
					eventData[i].spacingModifier -= SPACING;
				}
			}

			this.removeChartArtifacts(type);

			if(indexToSplice >= 0) eventData.splice(indexToSplice, 1);
			if(!eventData.length && stx.layout.timeSpanEventPanel) {
				tsePanel.display(false);
				tsePanel.panel = null;
			}

			if(!tsePanelVisible) return; // no need to remove/modify drawings that do not exist

			// go through the existing time span markers and move the "rows" that was below the deleted type
			var markers = stx.markerHelper.classMap["CIQ.Marker." + TIME_SPAN_EVENT][TIME_SPAN_EVENT_PANEL];
			for(i=0; i<markers.length; i++) {
				if(markers[i].params.datum.spacingModifier >= spacingModifierDeleted) {
					markers[i].params.datum.spacingModifier -= SPACING;
				}
			}
		};

		/**
		 * Helper function to remove all the injection and markers from the main chart.
		 * @param {string} type The type of marker that needs its injections and markers removed.
		 * @memberOf CIQ.TimeSpanEventPanel.prototype
		 * @alias removeChartArtifacts
		 * @since 7.2.0
		 */
		this.removeChartArtifacts=function(type) {
			// now remove all the injections and relevant markers on the main chart
			var activeMarker = this.activeMarkers[type];
			var markerInjections = activeMarker.injections;
			var markerIds = activeMarker.uniqueMarkerIds;
			for(var i=0; i<markerInjections.length; i++) {
				stx.removeInjection(markerInjections[i]);
			}

			for(i=0; i<markerIds.length; i++) {
				CIQ.Marker.removeByLabel(stx, markerIds[i]);
			}
			delete this.activeMarkers[type];
			stx.draw();
		};

		/**
		 * Takes the selected event data and makes Time Span Event markers.
		 * @param {Object} spanEvent Object that defines the time span event.
		 * @param {String} spanEvent.type The type of time span event to display and the basis to identify each individual marker; for example, "News", "CEO", etc.
		 * @param {Object[]} spanEvent.events The data that drives the markers. See Time Span Event tutorial on how to format the data.
		 * @param {String} spanEvent.spanType One of three types that determine how the time span marker is drawn: `spanEvent`, `durationEvent`, `singleEvent`.
		 * @param {Number} spanEvent.spacingModifier A number that determines how much space to draw between time span event marker rows. Can be configured by adjusting the `SPACING` constant.
		 * @memberOf CIQ.TimeSpanEventPanel.prototype
		 * @alias renderTimeSpanEvent
		 * @since 7.2.0
		 */
		this.renderTimeSpanEvent=function(spanEvents) {
			if(stx.timeSpanEventPanel.panel) {
				var panel = stx.timeSpanEventPanel.panel;
				var dataSet = stx.chart.dataSet;
				var yPixel = spanEvents.yPixel;
				var spanType = spanEvents.spanType;

				/**
				 * Helper function that actually creates the TimeSpanEvent marker
				 */
				var createTimeSpanMarker=function(event, eventType, spacingModifier) {
					var datum = {
						stx: stx,
						startDate: new Date(event.startDate),
						endDate: new Date(event.endDate),
						label: event.label,
						headline: event.headline,
						story: event.story ||  null,
						category: event.category || null,
						markerShape: event.markerShape || null,
						bgColor: event.bgColor,
						textColor: event.textColor,
						panelName: panel.name,
						spanLabel: event.spanLabel,
						img: event.img,
						subChildren: event.subChildren,
						isActive: event.isActive,
						showPriceLines: event.showPriceLines,
						spacing: SPACING,
						spacingModifier: spacingModifier,
					};

					new CIQ.Marker[TIME_SPAN_EVENT]({
						stx:stx,
						label:event.label,
						type: eventType,
						xPositioner:"date",
						x: datum.x,
						yPositioner:"value",
						panelName: panel.name,
						datum: datum
					});
				};

				// Make the yAxis label a marker for the moment. Need more time to figure out how to achieve mockup prototype.
				createTimeSpanMarker(spanEvents.events[0], "yAxisLabel", spanEvents.spacingModifier);

				for(var i=0; i<spanEvents.events.length; i++) {
					var event = spanEvents.events[i];
					var glyph = event.glyph;

					if(!event.startDate) { // no start date supplied, take first DT in dataSet
						event.startDate = dataSet[0].DT;
					}

					if(!event.endDate) { // no end date supplied, take last DT in dataSet
						event.endDate = dataSet[dataSet.length - 1].DT;
					}
					
					if(glyph) {
						event.img = new Image();
						event.img.src = glyph;
					}
					createTimeSpanMarker(event, spanType, spanEvents.spacingModifier);
				}
			}
		};

		stx.prepend("panelClose", function(){
			if(!stx.timeSpanEventPanel) return;
			stx.layout.timeSpanEventPanel = false;

			// deactivate all existing events
			$("." + TIME_SPAN_EVENT_CLASS + ".ciq-active").trigger("stxtap");

			stx.timeSpanEventPanel.panel = null;
			stx.changeOccurred("layout");
		});
	};

	if(CIQ.UI && CIQ.UI.Layout){
		/**
		 * UI helper for managing the time span event options for showing markers on the chart.
		 * @name CIQ.UI.TimeSpanEvent
		 * @param {CIQ.UI.Context} context The context.
		 * @param {Object} params Initialization parameters.
		 * @param {string} params.menuItemSelector The selector used to identify menu items for selecting markers.
		 * @param {string} [params.activeClassName="ciq-active"] The class name to be added to a node when a layout item is enabled.
		 * @param {boolean} [params.loadSample] A boolean that determines whether to use the sample time span events.
		 * @constructor
		 * @since 7.2.0
		 */
		CIQ.UI.TimeSpanEvent=function(context, params){
			var self = this;
			self.context=context;
			if(!params) params={};
			self.menuItemSelector=params.menuItemSelector;
			self.activeClassName=params.activeClassName || "ciq-active";

			if(CIQ.TimeSpanEventSample){
				self.implementation = new CIQ.TimeSpanEventSample(context.stx);				
			}else if(params.loadSample) {
				CIQ.loadScript(basePath + "examples/timeSpanEventSample.js", function(){
					self.implementation = new CIQ.TimeSpanEventSample(context.stx);
				});
			}

			context.advertiseAs(this, TIME_SPAN_EVENT);
		};

		CIQ.inheritsFrom(CIQ.UI.TimeSpanEvent,CIQ.UI.Helper);

		/**
		 * Shows or hides the time span event markers.
		 * @param {HTMLElement} node The HTML element clicked.
		 * @param {string} type The type of time span event to show or hide.
		 * @memberOf CIQ.UI.TimeSpanEvent
		 * @since 7.2.0
		 */
		CIQ.UI.TimeSpanEvent.prototype.showMarkers=function(node, type){
			var activeClassName=this.activeClassName;
			if($(node.node).hasClass(activeClassName)) {
				$(node.node).removeClass(activeClassName);
				if(this.implementation) this.implementation.removeTimeSpanEvent(type);
			} else {
				$(node.node).addClass(activeClassName);
				if(this.implementation) this.implementation.showTimeSpanEvent(type);
			}
		};
	}

	return _exports;
});
