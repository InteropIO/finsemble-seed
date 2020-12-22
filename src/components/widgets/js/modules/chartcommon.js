if (!Array.prototype.includes) {
	Object.defineProperty(Array.prototype, 'includes', {
		value: function (searchElement, fromIndex) {

			if (this == null) {
				throw new TypeError('"this" is null or not defined');
			}

			// 1. Let O be ? ToObject(this value).
			var o = Object(this);

			// 2. Let len be ? ToLength(? Get(O, "length")).
			var len = o.length >>> 0;

			// 3. If len is 0, return false.
			if (len === 0) {
				return false;
			}

			// 4. Let n be ? ToInteger(fromIndex).
			//    (If fromIndex is undefined, this step produces the value 0.)
			var n = fromIndex | 0;

			// 5. If n ≥ 0, then
			//  a. Let k be n.
			// 6. Else n < 0,
			//  a. Let k be len + n.
			//  b. If k < 0, let k be 0.
			var k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);

			function sameValueZero(x, y) {
				return x === y || (typeof x === 'number' && typeof y === 'number' && isNaN(x) && isNaN(y));
			}

			// 7. Repeat, while k < len
			while (k < len) {
				// a. Let elementK be the result of ? Get(O, ! ToString(k)).
				// b. If SameValueZero(searchElement, elementK) is true, return true.
				if (sameValueZero(o[k], searchElement)) {
					return true;
				}
				// c. Increase k by 1.
				k++;
			}

			// 8. Return false
			return false;
		}
	});
}

function setRange(stxx, range, container) {

	//var cb = function (stxx) {
	/*if (range == '1D' & !stxx.chart.dataSegment.length) {
		setMostRecentDaySpan();
	}
	resizeScreen();*/

	//stxx.setTimeZone(null, stxx.chart.market.market_tz);
	//stxx.draw();
	//$('#' + container.id).css('visibility', '');
	//
	/*if (stxx.kindOfChart == 'BasicChart') {
		$('#' + stxx.container.id + ' .stx-panel-title').html('<div class="ciq-index" style="display: block;"><div class="delayed ciq-sym-name">Dow Jones Industrials&nbsp;</div><div class="ciq-sym-change"> <span class="down arrow"></span><span> -2.19 (0.01%)</span></div><div class="ciq-sym-price">18266.31</div>')
	}*/

	//}

	this.setMostRecentDaySpan = function () {
		//debugger;
		cb();
	}

	stxx.requestedRange = range;

	// begin spinner code

	var spinnerContainer = $('#spinner-container');
	if(window.firstChartLoad) spinnerContainer[0].classList.add('active');

	setTimeout(function(){
		spinnerContainer[0].classList.remove('active');
	}, 1000);
	// end spinner code

	if (range == "1D") {
		//stxx.layout.chartType = "baseline_delta";
		//stxx.chart.baseline.includeInDataSegment = true;
		//stxx.chart.xAxis.useDataDate = true;

		//$('#' + container.id).css('visibility', 'visible');
		stxx.newChart(stxx.chart.symbol, null, null, function () {
			$('#' + container.id).css('visibility', 'visible');
			if (stxx.layout.interval != 'day') stxx.setSpan({ span: 'today' });
		}, {
				span: {
					multiplier: 1,
					base: 'today'
				}
			});

		//setMostRecentDaySpan(0, cb);

		/*setMostRecentDaySpan(0, function(){
			setMostRecentDaySpan(getPadding(stxx.chart), cb);  //first call to get the full dataSegment, next call to pad the right side
		});*/
	} else {
		//stxx.layout.chartType = "baseline_delta";

		var rangeUnit = range.slice(-1);
		var rangePeriod = range.substring(0, range.length - 1);
		//$('#' + container.id).css('visibility', 'visible');

		switch (rangeUnit) {
			case 'D':
				//if (rangePeriod == 5) rangePeriod = 7;
				stxx.newChart(stxx.chart.symbol, null, null, function () {
					$('#' + container.id).css('visibility', 'visible');
				}, {
						span: {
							multiplier: rangePeriod,
							base: "day"
						}
					}/*, function () {
					cb(stxx);
				}*/);
				break;
			case 'M':
				stxx.newChart(stxx.chart.symbol, null, null, function () {
					$('#' + container.id).css('visibility', 'visible');
				}, {
						span: {
							multiplier: rangePeriod,
							base: "month",
							periodicity: {
								interval: "day",
								period: 1
							}
						}
					}/*, function () {
					cb(stxx);
				}*/);
				break;
			case 'Y':
				stxx.newChart(stxx.chart.symbol, null, null, function () {
					$('#' + container.id).css('visibility', 'visible');
				}, {
						span: {
							multiplier: rangePeriod,
							base: "year",
							periodicity: {
								interval: "day",
								period: 1
							}
						}
					}/*, function () {
					cb(stxx);
				}*/);
				break;
		}

	}
}

function initializeChart(container, kindOfChart, settings) {
	var dataSource = 'modules/' + portalSettings.dataSource;
	require([quoteFeed, dataSource, dataSource + '-markets'], function () {
		var symbol = settings.symbol.toUpperCase();
		var range = settings.range;

		var stxx; // = window.allCharts[container.id];
		var jContainer = $('#' + container.id);
		if (!jContainer[0].stx) {
			stxx = new CIQ.ChartEngine(container);
		} else {
			stxx = jContainer[0].stx;
			jContainer.css('visibility', 'hidden');
			//stxx.chart.masterData = [];
		}
		stxx.widgetId = settings.widgetId;

		if (settings.heightWidthRatio) {
			jContainer.height(jContainer.width() * settings.heightWidthRatio);
			stxx.widgetHeightWidthRatio = settings.heightWidthRatio;
		} else if (settings.height) {
			jContainer.height(settings.height);
			stxx.widgetHeight = settings.height;
		} else {
			jContainer.height(jContainer.width() * 9 / 21);
			settings.heightWidthRatio = 9 / 21;
		}

		var chart = stxx.chart;
		//stxx.newChart(symbol);
		chart.symbol = symbol;
		chart.symbolObject = { symbol: symbol };
		if (settings.name) chart.symbolDisplay = settings.name;

		//setXigniteEncryptedToken(STX.QuoteFeed.Xignite.Utility.overrides);
		if (!window.dataSources[portalSettings.dataSource].marketFactory) createMarketFactory[portalSettings.dataSource](CIQ);
		stxx.setMarketFactory(window.dataSources[portalSettings.dataSource].marketFactory);

		stxx.goldenRatioYAxis = true;
		stxx.kindOfChart = kindOfChart;
		stxx.maintainSpan = true;
		//stxx.setResizeTimer(0);

		switch (kindOfChart) {
			case 'SparkChart':
				stxx.manageTouchAndMouse = false;
				stxx.yaxisLeft = 0;
				stxx.layout.chartType = settings.chartType;
				stxx.prepend("drawXAxis", function () {
					return true;
				});
				stxx.xaxisHeight = 0;

				chart.xAxis.axisType = null;
				chart.xAxis.noDraw = true;

				chart.xAxis.displayGridLines = false;
				chart.yAxis.noDraw = true;
				chart.yAxis.drawCurrentPriceLabel = false;
				chart.baseline.centerMinMax = true;

				break;
			case 'BasicChart':
				stxx.manageTouchAndMouse = false;
				stxx.layout.chartType = 'baseline_delta';

				stxx.preferences.whitespace = 0;
				stxx.yaxisLeft = 0;
				stxx.cleanupGaps = false;
				stxx.axisBorders = false;
				stxx.panels[stxx.chart.name].yAxis.displayGridLines = false;


				chart.baseline.includeInDataSegment = true;
				chart.baseline.userLevel = false;

				chart.xAxis.displayGridLines = false;
				chart.xAxis.displayBorder = true;
				chart.xAxis.minimumLabelWidth = 16;
				chart.xAxis.useDataDate = true;
				stxx.controls.chartControls.style.display = "none";


				chart.yAxis.justifyRight = true;
				chart.yAxis.drawCurrentPriceLabel = false;

				require(['modules/quote'], function () {
					var parentDiv = $('#' + container.id).parent();
					if (!$('#ciq-quote-' + container.id).length) {
						var quoteDiv = $('<div id="ciq-quote-' + container.id + '" class="ciq-basicchart-quote">');
						parentDiv.prepend(quoteDiv);
					}
					portalSettings.items['quote-' + container.id] = {
						symbol: chart.symbol,
						"chartName": chart.symbolDisplay
					}
					quote(['quote-' + container.id]);
				});

				break;

			case 'SimpleChart':
				stxx.layout.chartType = 'baseline_delta';
				break;
		}

		stxx.initializeChart();

		var refreshRate = portalSettings.chartRefreshRate ? portalSettings.chartRefreshRate : 0;
		//if (defaultSettings.quoteRefreshRate) refreshRate = defaultSettings.quoteRefreshRate;

		if (!stxx.quoteDriver) {
			stxx.attachQuoteFeed(new CIQ.QuoteFeedToAttach(), {
				refreshInterval: refreshRate,
				suppressErrors: true
			});
			if (!PortalCore.chartList) PortalCore.chartList = [];
			PortalCore.chartList.push(stxx);
		}


		stxx.requestedRange = range;
		setRange(stxx, range, container);

	});


}

if (!window.firstChartLoad) window.firstChartLoad = 'yes';

function chart(key, value) {
	var chartLibrary = availableChartLibrary;
	if (key == 'BasicChart') {
		chartType = 'basic';
	} else if (key == 'SimpleChart') {
		chartType = 'simple';
	} else {
		chartType = 'spark';
	}


	require([chartLibrary], function () {
		window.$$ = arguments[0].$$;
		window.CIQ = arguments[0].CIQ;

		if (window.firstChartLoad == 'yes') {
			CIQ.ChartEngine.prototype.prepend("resizeChart", function () {
				var jContainer = $('#' + this.container.id);
				var newWidth = jContainer.width();
				if (this.prevWidth) {
					if ((newWidth > this.prevWidth && newWidth - this.prevWidth > 30) || (newWidth < this.prevWidth)) {
						if (this.widgetHeightWidthRatio) {
							jContainer.height(jContainer.width() * this.widgetHeightWidthRatio);
						} else if (this.widgetHeight) {
							jContainer.height(this.widgetHeight);
						} else {
							jContainer.height(jContainer.width() * 9 / 21);
						}
						this.prevWidth = jContainer.width();
					}
				}

				if (!this.prevWidth) this.prevWidth = jContainer.width();

				if (this.maintainSpan && this.chart.xaxis && this.chart.xaxis.length) {
					this.cw = this.layout.candleWidth;
					this.ow = this.chart.width;
					this.s = this.chart.scroll;
				}
			});

			CIQ.ChartEngine.prototype.append("resizeChart", function () {
				if (this.maintainSpan && this.ow) {
					var ot = this.ow / this.cw;
					this.layout.candleWidth = this.chart.width / ot;
					this.chart.scroll = this.s;
					this.draw();
				}
			});

			CIQ.ChartEngine.prototype.append("createDataSet", function () {
				if (this.chart.symbol && this.chart.dataSet && this.chart.dataSet.length) {
					var quoteData = {}
					var current = this.chart.dataSet[this.chart.dataSet.length - 1];
					quoteData[this.chart.symbol] = {
						Last: current.Close,
						Date: current.DT
						/*PrevClose: current.iqPrevClose,
						Change: current.Close - current.iqPrevClose,
						PercentChange: (current.Close - current.iqPrevClose) / current.iqPrevClose * 100,*/
					};

					PortalCore.sendMessage({
						sender: this.widgetId,
						subject: 'quoteSync',
						data: quoteData
					});

					var self = this;

					// need to execute this one time only but also need to make sure this executes because chart can load before quote and the function might not exist then
					if (typeof quoteSymbolList !== "undefined" &&  _.isArray(quoteSymbolList)) {
						quoteSymbolList[self.widgetId] = [self.chart.symbol];
						if (!quoteDependencyList[self.widgetId]) {
							dataSources[portalSettings.dataSource].fetchQuotes([self.chart.symbol], function (err, quoteData) {
								quoteToStream = quoteData[self.chart.symbol];
								self.streamTrade({ last: quoteToStream.Last, bid: quoteToStream.Bid, ask: quoteToStream.Ask }, new Date(quoteToStream.DateTime))
							}, null);
							quoteDependencyList[self.widgetId] = {
								quoteCallback: function (err, quoteData) {
									quoteToStream = quoteData[self.chart.symbol];
									self.streamTrade({ last: quoteToStream.Last, bid: quoteToStream.Bid, ask: quoteToStream.Ask }, new Date(quoteToStream.DateTime))
								},
								extraParams: self.widgetId
							}
							updateQuote();
						}
					}

				}

			});

		}


		var dataSource = 'modules/' + portalSettings.dataSource;
		require([quoteFeed, dataSource, dataSource + '-markets'], function () {

			if (window.firstChartLoad == 'yes') {
				CIQ.QuoteFeed.prototype.announceError = function (params, dataCallback) {
					if (['Intraday futures data is not supported.', 'Intraday data not available.', 'Symbol not found', '0'].includes(dataCallback.error) && !params.update) {
						if (params.stx.layout.interval == 'day') {
							return;
						}
						params.stx.setSpan({ span: 'year', multiplier: 1, periodicity: { period: 1, interval: 'day' } });
						// TO DO - change selected range selector item to 1Y
						var container = params.stx.container.id.substring(0, params.stx.container.id.length - 6);
						$('#' + container + '-range li').removeClass('active');
						$('#' + container + '-range li[range="1Y"]').addClass('active');
						return;
					}
					if (params.suppressErrors || dataCallback.suppressAlert) return;
					if (params.startDate) {
						// Perhaps some sort of "disconnected" message on screen
					} else if (params.endDate) {
						// Perhaps something indicating the end of the chart
					} else if (dataCallback.error) {
						CIQ.alert("Error fetching quote:" + dataCallback.error);
					} else {
						//CIQ.alert("Error fetching quote:" + params.symbol);	// Probably a not found error?
					}
				};
			}

			_.each(value, function (widgetId) {

				var container = 'ciq-' + widgetId;
				var chartSettings = portalSettings.items[widgetId];
				chartSettings.widgetId = widgetId;
				if (chartSettings.message && chartSettings.message.data && chartSettings.message.data.symbol) {
					chartSettings.symbol = chartSettings.message.data.symbol;
				}
				var containerObject = $('#' + container);

				containerObject.css('display', 'block').css('position', 'relative').css('float', 'left');

				var chartContainerId = container + '-chart'
				if (!$('#' + chartContainerId).length) {

					if (chartType == 'simple') {
						containerObject.append('<div class="ciq-range-nav ciq-chart-nav-type" id="' + container + '-charttype"><ul><li type="baseline_delta" class="active"><img alt="Baseline Delta" style="height: 24px; width: 24px;" src="https://widgetcdn.chartiq.com/img/Baseline_Delta.svg"></li><li type="mountain"><img alt="Mountain" style="height: 24px; width: 24px; " src="https://widgetcdn.chartiq.com/img/Mountain.svg"></li><li type="line"><img alt="Line" style="height: 24px; width: 24px;" src="https://widgetcdn.chartiq.com/img/Line.svg"></li><li type="candle"><img style="height: 24px; width: 24px;" alt="Candle" src="https://widgetcdn.chartiq.com/img/Candle.svg"></li></ul></div>');
					}

					if (chartType != 'spark') {
						containerObject.append('<div class="ciq-range-nav ciq-chart-nav-range" id="' + container + '-range"><ul><li range="1D" class="active">Today</li><li range="5D">5D</li><li range="1M">1M</li><li range="3M">3M</li><li range="6M">6M</li><li range="1Y">1Y</li></ul></div>');
					}

					var chartContainer = $('<div>').attr('id', chartContainerId).css('width', '100%').addClass('ciq-' + chartType + 'chart loading').css('visibility', 'hidden').css('height', '150px').css('position', 'relative').css('clear', 'both');
					containerObject.append(chartContainer);

					// begin spinner code
					var spinnerContainer = $('<div>').attr('id', 'spinner-container').css('width', '32px').css('height', '32px').addClass('spinner-container active');
					containerObject.append(spinnerContainer);

					setTimeout(function(){
						chartContainer[0].classList.remove('loading');
					}, 1500);
					setTimeout(function(){
						spinnerContainer[0].classList.remove('active');
					}, 1000);
					// end spinner code

					containerObject.show();

					$('#' + container + '-range li').on('click', function () {
						var parentUL = $(this).parent();
						parentUL.children().removeClass('active');
						$(this).addClass('active');
						var parentDiv = $(this).parent().parent().parent();
						var id = parentDiv.attr('id') + '-chart';
						var stxx = $('#' + id)[0].stx;
						setRange(stxx, $(this).attr('range'), $$(id));
					});

					$('#' + container + '-charttype li').on('click', function () {
						var parentUL = $(this).parent();
						parentUL.children().removeClass('active');
						$(this).addClass('active');
						var parentDiv = $(this).parent().parent().parent();
						var id = parentDiv.attr('id') + '-chart';
						var stxx = $('#' + id)[0].stx;
						stxx.layout.chartType = $(this).attr('type');
						stxx.draw();
					});

				} else {
					var stxx = $('#' + chartContainerId)[0].stx;
					if (stxx) {
						//stxx.widgetId = widgetId;
						chartSettings.range = stxx.requestedRange;
					}
				}

				if (!chartSettings.range) chartSettings.range = '1D';
				if (!chartSettings.symbol) chartSettings.symbol = portalSettings.defaultSymbol;

				initializeChart($$(chartContainerId), key, chartSettings);
			});


			window.firstChartLoad = 'no';

		});

	});
	PortalCore.addStyleSheet(cssUrl + 'modules/' + chartType + '-chart.css');
}