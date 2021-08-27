/**
 *	8.3.99
 *	Generation date: 2021-05-21T20:54:02.745Z
 *	Client name: finsemble
 *	Package Type: Technical Analysis
 *	License type: annual
 *	Expiration date: "2022/07/20"
 *	Domain lock: ["127.0.0.1","localhost","chartiq.com","finsemble.com"]
 *	iFrame lock: true
 */

/***********************************************************
 * Copyright by ChartIQ, Inc.
 * Licensed under the ChartIQ, Inc. Developer License Agreement https://www.chartiq.com/developer-license-agreement
*************************************************************/
/*************************************** DO NOT MAKE CHANGES TO THIS LIBRARY FILE!! **************************************/
/* If you wish to overwrite default functionality, create a separate file with a copy of the methods you are overwriting */
/* and load that file right after the library has been loaded, but before the chart engine is instantiated.              */
/* Directly modifying library files will prevent upgrades and the ability for ChartIQ to support your solution.          */
/*************************************************************************************************************************/
/* eslint-disable no-extra-parens */



import { CIQ as _CIQ } from "../../../js/chartiq.js";

var CIQ = typeof _CIQ !== "undefined" ? _CIQ : {}.CIQ;

/**
 * Add-On that animates the chart.
 *
 * Requires *addOns.js*.
 *
 * The chart is animated in three ways:
 * 1.  The current price pulsates
 * 2.  The current price appears to move smoothly from the previous price
 * 3.  The chart's y-axis smoothly expands/contracts when a new high or low is reached
 *
 * The following chart types are supported: line, mountain, baseline_delta.
 *
 * Chart aggregations such as Kagi, Renko, Range Bars, etc. are not supported.
 *
 * **Animation displays more gracefully when updates are sent into the chart one at a time using {@link CIQ.ChartEngine#updateChartData}
 * instead of in batches using a [QuoteFeed]{@link CIQ.ChartEngine#attachQuoteFeed}. Sending data in batches will produce a ‘jumping’ effect.**
 *
 * By default, there will be a flashing beacon created using a canvas circle. If instead you want to use a custom animation beacon, you will be able to extend the functionality yourself as follows:
 * - In js/addOns.js, at the bottom of the CIQ.Animation function, there is an stx.append("draw") function.
 * - Make a copy of this function so you can override the behavior.
 * - In there you will see it determine var x and y, which are the coordinates for the center of the beacon.
 * - At the bottom of this append function, we draw the beacon by using the Canvas arc() function to draw a circle and then fill() to make the circle solid.
 * - You can replace  the canvas circle with an image using [CanvasRenderingContext2D.drawImage()](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D#Drawing_images) .
 * - Example:
 *
 *   ```
 *   var image = document.getElementById('beacon'); // include a hidden image on your HTML
 *   context.drawImage(image, x-10, y-10, 20, 20); // add the image on the canvas. Offset the x and y values by the radius of the beacon.
 *   ```
 *
 * Animation Example <iframe width="800" height="500" scrolling="no" seamless="seamless" align="top" style="float:top" src="https://jsfiddle.net/chartiq/6fqw652z/embedded/result,js,html/" allowfullscreen="allowfullscreen" frameborder="1"></iframe>
 *
 * You can disable animation after each different [chart type is activated]{@link CIQ.ChartEngine#setChartType} by calling:
 * ```
 * stxx.mainSeriesRenderer.supportsAnimation=false;
 * ```
 * Keep in mind that changing to a different chart type, may once again enable animation. You can override this by [adding an event listener]{@link CIQ.ChartEngine#addEventListener} on [layout changes]{@link CIQ.ChartEngine~layoutEventListener}.
 *
 * @param {object} config The constructor parameters
 * @param {CIQ.ChartEngine} config.stx The chart object
 * @param {object} [config.animationParameters] Configuration parameters
 * @param {boolean} [config.animationParameters.stayPut=false] Set to true for last tick to stay in position it was scrolled and have rest of the chart move backwards as new ticks are added instead of having new ticks advance forward and leave the rest of the chart in place.
 * @param {number} [config.animationParameters.ticksFromEdgeOfScreen=5] Number of ticks from the right edge the chart should stop moving forward so the last tick never goes off screen (only applicable if stayPut=false)
 * @param {number} [config.animationParameters.granularity=1000000] Set to a value that will give enough granularity for the animation.  The larger the number the smaller the price jump between frames, which is good for charts that need a very slow smooth animation either because the price jumps between ticks are very small, or because the animation was set up to run over a large number of frames when instantiating the CIQ.EaseMachine.
 * @param {number} [config.animationParameters.tension=null] Splining tension for smooth curves around data points (range 0-1).
 * @param {CIQ.EaseMachine} config.easeMachine Override the default easeMachine.  Default is `new CIQ.EaseMachine(Math.easeOutCubic, 1000);`
 * @constructor
 * @name  CIQ.Animation
 * @since
 * - 3.0.0 Now part of *addOns.js*. Previously provided as a standalone *animation.js* file.
 * - 4.0.0 Beacon only flashes for line charts. On candles or bars, it is suppressed as it produces an unnatural effect.
 * - 7.0.2 Now takes one configuration object as its constructor. Must have a reference to a chart engine.
 * @example
 * 	new CIQ.Animation({stx: stxx, animationParameters: {tension:0.3}});  //Default animation with splining tension of 0.3
 *
 */
CIQ.Animation =
	CIQ.Animation ||
	function (config) {
		if (!config) throw new Error("Invalid constructor arguments.");
		var stx, animationParameters, easeMachine;
		if (config instanceof CIQ.ChartEngine) {
			// legacy constructor
			stx = arguments[0];
			animationParameters = arguments[1];
			easeMachine = arguments[2];
		} else {
			stx = config.stx;
			animationParameters = config.animationParameters;
			easeMachine = config.easeMachine;
		}
		if (!stx)
			return console.warn(
				"No CIQ.ChartEngine provided. Cannot properly create CIQ.Animation instance"
			);
		var params = {
			stayPut: false,
			ticksFromEdgeOfScreen: 5,
			granularity: 1000000
		};
		animationParameters = CIQ.extend(params, animationParameters);

		if (params.tension) stx.chart.tension = animationParameters.tension;
		stx.tickAnimator =
			easeMachine || new CIQ.EaseMachine(Math.easeOutCubic, 1000);
		var scrollAnimator = new CIQ.EaseMachine(Math.easeInOutCubic, 1000);

		var flashingColors = ["#0298d3", "#19bcfc", "#5dcffc", "#9ee3ff"];
		var flashingColorIndex = 0;
		var flashingColorThrottle = 20;
		var flashingColorThrottleCounter = 0;

		var filterSession = false;
		var nextBoundary = null;

		function initMarketSessionFlags() {
			filterSession = false;
			nextBoundary = null;
		}

		stx.addEventListener(["symbolChange", "layout"], function (obj) {
			initMarketSessionFlags();
		});

		stx.prepend(
			"updateCurrentMarketData",
			function (data, chart, symbol, params) {
				if (!chart) chart = this.chart;
				if (params && params.fromTrade && chart.closePendingAnimation) {
					params.finalClose = chart.closePendingAnimation.Close;
				}
			}
		);

		stx.prepend("updateChartData", function (appendQuotes, chart, params) {
			var self = this;
			if (!chart) {
				chart = self.chart;
			}
			if (
				!chart ||
				!chart.defaultChartStyleConfig ||
				chart.defaultChartStyleConfig == "none"
			)
				return;

			if (params !== undefined) {
				if (params.animationEntry || params.secondarySeries) return;
			}

			if (!chart.dataSegment) return;

			function completeLastBar(record) {
				if (!chart.masterData) return;
				for (var md = chart.masterData.length - 1; md >= 0; md--) {
					var bar = chart.masterData[md];
					if (bar.Close || bar.Close === 0) {
						bar.Close = record.Close;
						if (record.LastSize) bar.LastSize = record.LastSize;
						if (record.LastTime) bar.LastTime = record.LastTime;

						// Reset properties to close if Open, High and Low have been added and changed during animation process
						if (record.Open === undefined && bar.Open !== undefined)
							bar.Open = record.Close;
						if (record.High === undefined && bar.High !== undefined)
							bar.High = record.Close;
						if (record.Low === undefined && bar.Low !== undefined)
							bar.Low = record.Close;

						self.updateCurrentMarketData({
							Close: bar.Close,
							DT: bar.DT,
							LastSize: bar.LastSize,
							LastTime: bar.LastTime
						});
						self.createDataSet(null, null, { appending: true });
						return;
					}
				}
			}
			function unanimateScroll() {
				if (chart.animatingHorizontalScroll) {
					chart.animatingHorizontalScroll = false;
					self.micropixels = self.nextMicroPixels = self.previousMicroPixels; // <-- Reset self.nextMicroPixels here
					chart.lastTickOffset = 0;
				}
				if (chart.closePendingAnimation) {
					completeLastBar(chart.closePendingAnimation);
					chart.closePendingAnimation = null;
				}
			}
			var tickAnimator = self.tickAnimator;
			// These chart types are the only types supported by animation
			var supportedChartType =
				this.mainSeriesRenderer && this.mainSeriesRenderer.supportsAnimation;
			if (supportedChartType) {
				if (!tickAnimator) {
					console.warn(
						"Animation plug-in can not run because the tickAnimator has not been declared. See instructions in animation.js"
					);
					return;
				}

				// If symbol changes then reset all of our variables
				if (this.prevSymbol != chart.symbol) {
					this.prevQuote = 0;
					chart.closePendingAnimation = null;
					this.prevSymbol = chart.symbol;
				}
				unanimateScroll();
				tickAnimator.stop();

				if (appendQuotes.length > 1) {
					// Only the last quote can be be animated. First add all except the last without animation
					var quotesExceptLastOne = appendQuotes.splice(
						0,
						appendQuotes.length - 1
					);
					var firstSetParams = CIQ.clone(params);

					firstSetParams.animationEntry = true;
					firstSetParams.bypassGovernor = true;
					firstSetParams.noCreateDataSet = false;
					firstSetParams.appending = true;
					self.updateChartData(quotesExceptLastOne, chart, firstSetParams);
				}
			}
			var newParams = CIQ.clone(params);
			if (!newParams) newParams = {};
			newParams.animationEntry = true;
			newParams.bypassGovernor = true;
			newParams.noCreateDataSet = false;
			newParams.appending = true;
			//newParams.allowReplaceOHL = true;
			newParams.firstLoop = true;
			var symbol = this.chart.symbol;
			var period = this.layout.periodicity;
			var interval = this.layout.interval;
			var timeUnit = this.layout.timeUnit;

			function cb(quote, prevQuote, chartJustAdvanced) {
				return function (newData) {
					var newClose = newData.Close;
					if (
						!chart.dataSet.length ||
						symbol != chart.symbol ||
						period != self.layout.periodicity ||
						interval != self.layout.interval ||
						timeUnit != self.layout.timeUnit
					) {
						//console.log ("---- STOP animating: Old",symbol,' New : ',chart.symbol, Date())
						tickAnimator.stop();
						unanimateScroll();
						return; // changed symbols mid animation
					}
					var q = CIQ.clone(quote);
					q.Adj_Close = null; // Don't use this, it will mess up our calculated close
					q.Close =
						Math.round(newClose * animationParameters.granularity) /
						animationParameters.granularity; //<<------ IMPORTANT! Use 1000000 for small price increments, otherwise animation will be in increments of .0001
					if (chart.animatingHorizontalScroll) {
						self.micropixels = newData.micropixels;
						chart.lastTickOffset = newData.lineOffset;
					}
					newParams.updateDataSegmentInPlace = !tickAnimator.hasCompleted;
					//console.log("animating: Old",symbol,' New : ',chart.symbol);
					var updateQuotes = [q];
					// Don't include previous quote if tick mode. It will append, duplicating the quote
					if (chartJustAdvanced && self.layout.interval !== "tick")
						updateQuotes.unshift(prevQuote);
					self.updateChartData(updateQuotes, chart, newParams);
					newParams.firstLoop = false;
					if (tickAnimator.hasCompleted) {
						//console.log( 'animator has completed') ;
						//self.pendingScrollAdvance=false;
						//var possibleYAxisChange = chart.animatingHorizontalScroll;
						unanimateScroll();
						/*if (possibleYAxisChange) { // <---- Logic no longer necessary
						 // After completion, one more draw for good measure in case our
						 // displayed high and low have changed, which would trigger
						 // the y-axis animation
						 setTimeout(function(){
						 self.draw();
						 }, 0);
						 }*/
					}
				};
			}
			if (supportedChartType) {
				var quote = appendQuotes[appendQuotes.length - 1];
				this.prevQuote = this.currentQuote("Close"); // <---- prevQuote logic has been changed to prevent forward/back jitter when more than one tick comes in between animations
				var chartJustAdvanced = false; // When advancing, we need special logic to deal with the open
				var dontScroll = false;
				if (!self.isHome()) {
					dontScroll = true;
				}
				if (!quote || !quote.Close || !this.prevQuote || !this.prevQuote.Close)
					return false;

				if (this.extendedHours && chart.market.market_def) {
					// Filter out unwanted sessions
					var dtToFilter = quote.DT;
					if (CIQ.ChartEngine.isDailyInterval(interval)) {
						filterSession = !chart.market.isMarketDate(dtToFilter);
					} else {
						if (!nextBoundary || nextBoundary <= dtToFilter) {
							var session = chart.market.getSession(dtToFilter);
							filterSession =
								session !== "" &&
								(!this.layout.marketSessions ||
									!this.layout.marketSessions[session]);
							nextBoundary = chart.market[
								filterSession ? "getNextOpen" : "getNextClose"
							](dtToFilter);
						}
					}
					if (filterSession) {
						this.draw();
						return false;
					}
				}

				var barSpan = period;
				if (interval == "second" || timeUnit == "second") barSpan *= 1000;
				else if (interval == "minute" || timeUnit == "minute") barSpan *= 60000;
				if (!isNaN(interval)) barSpan *= interval;
				if (interval == "day" || timeUnit == "day")
					chartJustAdvanced = quote.DT.getDate() != this.prevQuote.DT.getDate();
				else if (interval == "week" || timeUnit == "week")
					chartJustAdvanced =
						quote.DT.getDate() >= this.prevQuote.DT.getDate() + 7;
				else if (interval == "month" || timeUnit == "month")
					chartJustAdvanced =
						quote.DT.getMonth() != this.prevQuote.DT.getMonth();
				else
					chartJustAdvanced =
						quote.DT.getTime() >= this.prevQuote.DT.getTime() + barSpan;

				var linearChart =
					!this.mainSeriesRenderer || !this.mainSeriesRenderer.standaloneBars;

				var beginningOffset = 0;
				if (chartJustAdvanced) {
					if (this.animations.zoom.hasCompleted) {
						var candleWidth = this.layout.candleWidth;
						if (chart.scroll <= chart.maxTicks) {
							while (this.micropixels > 0) {
								// If micropixels is larger than a candle then scroll back further
								chart.scroll++;
								this.micropixels -= candleWidth;
							}
						}
						beginningOffset = candleWidth * -1;
						if (chart.scroll <= chart.maxTicks) {
							this.previousMicroPixels = this.micropixels;
							this.nextMicroPixels = this.micropixels + candleWidth;
							if (
								chart.dataSegment.length <
									chart.maxTicks - animationParameters.ticksFromEdgeOfScreen &&
								!animationParameters.stayPut
							) {
								this.nextMicroPixels = this.micropixels;
								chart.scroll++;
							}
							chart.animatingHorizontalScroll = linearChart; // When the chart advances we also animate the horizontal scroll by incrementing micropixels
							chart.previousDataSetLength = chart.dataSet.length;
						} else {
							if (!dontScroll) chart.scroll++;
						}
					} else {
						return false;
					}
				}
				chart.closePendingAnimation = {
					Close: quote.Close,
					Open: quote.Open,
					High: quote.High,
					Low: quote.Low
				};

				var start =
					chartJustAdvanced && !linearChart ? quote.Open : this.prevQuote.Close;
				tickAnimator.run(
					cb(quote, CIQ.clone(this.prevQuote), chartJustAdvanced),
					{
						Close: start,
						micropixels: this.nextMicroPixels,
						lineOffset: beginningOffset
					},
					{ Close: quote.Close, micropixels: this.micropixels, lineOffset: 0 }
				);
				return true; // bypass default behavior in favor of animation
			}
		});

		stx.prepend("renderYAxis", function (chart) {
			if (this.grabbingScreen || !this.isHome()) return;
			// When display style doesn't support animation
			var supportedChartType =
				this.mainSeriesRenderer && this.mainSeriesRenderer.supportsAnimation;
			if (!supportedChartType) return;

			var panel = chart.panel;
			var yAxis = panel.yAxis;
			if (CIQ.Comparison && yAxis.priceFormatter == CIQ.Comparison.priceFormat)
				return; // too difficult to animate y-axis change when it changes on every tick due to percentage axis on comparison

			function closure(self) {
				return function (values) {
					chart.animatedLow = values.low;
					chart.animatedHigh = values.high;
					self.draw();
				};
			}
			// initialize prev values
			if (!chart.prevLowValue && chart.prevLowValue !== 0) {
				chart.prevLowValue = chart.animatedLow = chart.lowValue;
			}
			if (!chart.prevHighValue && chart.prevHighValue !== 0) {
				chart.prevHighValue = chart.animatedHigh = chart.highValue;
			}

			// check for a change, if so we will spin off an animation
			if (!scrollAnimator.running) chart.animatingVerticalScroll = false;
			if (
				chart.prevLowValue >= chart.lowValue &&
				chart.prevHighValue <= chart.highValue
			) {
				if (chart.animatingVerticalScroll) {
					yAxis.highValue = chart.animatedHigh;
					yAxis.lowValue = chart.animatedLow;
				}
				return;
			}
			if (scrollAnimator.running) scrollAnimator.stop();
			if (!chart.lowValue && !chart.highValue) return; // chart just reset, don't animate yet
			var prevLow = chart.prevLowValue,
				prevHigh = chart.prevHighValue;
			chart.prevLowValue = chart.lowValue;
			chart.prevHighValue = chart.highValue;
			chart.animatingVerticalScroll = true;
			scrollAnimator.run(
				closure(this),
				{ low: prevLow, high: prevHigh },
				{ low: chart.lowValue, high: chart.highValue }
			);

			yAxis.lowValue = chart.animatedLow;
			yAxis.highValue = chart.animatedHigh;
		});

		/*stx.prepend("draw", function() {
			if(this.chart.animatingVerticalScroll) {
				this.renderYAxis(this.chart);
				return true;
			}
		});*/

		stx.append("draw", function () {
			if (filterSession) return;
			if (
				this.chart.dataSet &&
				this.chart.dataSet.length &&
				this.mainSeriesRenderer &&
				this.mainSeriesRenderer.supportsAnimation
			) {
				if (flashingColorThrottleCounter % flashingColorThrottle === 0) {
					flashingColorIndex++;
					flashingColorThrottleCounter = 0;
				}
				flashingColorThrottleCounter++;

				var context = this.chart.context;
				var panel = this.chart.panel;
				var currentQuote = this.currentQuote("Close");
				if (!currentQuote) return;
				var price = currentQuote.Close;
				var x = this.pixelFromTick(currentQuote.tick, this.chart);
				if (this.chart.lastTickOffset) x = x + this.chart.lastTickOffset;
				var y = this.pixelFromPrice(price, panel);
				if (
					this.chart.yAxis.left > x &&
					this.chart.yAxis.top <= y &&
					this.chart.yAxis.bottom >= y
				) {
					if (flashingColorIndex >= flashingColors.length)
						flashingColorIndex = 0;
					context.beginPath();
					context.moveTo(x, y);
					context.arc(
						x,
						y,
						2 + flashingColorIndex * 1.07,
						0,
						Math.PI * 2,
						false
					);
					context.fillStyle = flashingColors[flashingColorIndex];
					context.fill();
				}
			}
		});
	};

/**
 * CIQ.EaseMachine interface placeholder to be augmented in *standard.js* with properties.
 *
 * @tsinterface CIQ~EaseMachine
 */
