window.onerror = function (error) {
	// Return true to tell IE we handled it
	console.log(error);
	return true;
};
try {
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

	function addShareAbility(CIQ) {
		var h2canvas;
		/**
		 * Manages chart sharing and uploading.
		 * @constructor
		 * @name CIQ.Share
		 */
		CIQ.Share = function () { };

		/**
		 * Create a png image or canvas of the current chart and everything inside of the container. This method keeps all of the html
		 * that is within the chart container as well as the chart. This does not seem to work with React or Safari.
		 * This function is asynchronous and requires a callback function. The callback will be passed
		 * a data object or canvas which can be sent to a server or converted to an image.
		 * @param {CIQ.ChartEngine} stx   Chart object
		 * @param {object} params
		 * @param {number} params.width
		 * @param {number} params.height
		 * @param {string} params.background
		 * @param {bolean} params.data If true returns the image data, otherwise, it returns the canvas
		 * @param {Function} cb  Callback when image is available fc(error,data) where data is the serialized image object or canvas
		 * @name CIQ.Share.FullChart2PNG
		 * @version ChartIQ plug-in
		 */

		CIQ.Share.FullChart2PNG = function (stx, params, cb) {
			if (!stx || !stx.chart) return;
			//If we haven't loaded html2canvas, load it
			if (typeof html2canvas === "undefined") return loadHTML2Canvas(function () {
				return createHTML2Canvas(stx, params, cb);
			});
			h2canvas = html2canvas;
			createHTML2Canvas(stx, params, cb);
		};

		function createHTML2Canvas(stx, params, cb) {
			if (!params) params = {};
			var recordsTurnedOff = [];
			//If you wish to hide elements from the picture tag them with a query selector and call it here.
			var hideItems = document.querySelectorAll("[cq-no-html2canvas]");

			for (var i = 0; i < hideItems.length; i++) {
				var item = hideItems[i];
				if (item.style.display !== "none") {
					recordsTurnedOff.push({
						element: item,
						prevDisplay: item.style.display
					});
					item.style.display = "none";
				}
			}

			h2canvas(stx.chart.container, {
				allowTaint: false,
				logging: false,
				width: params.width ? params.width : null,
				height: params.height ? params.height : null,
				background: params.background ? params.background : null,
				useCORS: true
			}).then(function (canvas) {
				if (cb) {
					recordsTurnedOff.map(function (item, index) {
						item.element.style.display = item.prevDisplay;
					});
					//return the full canvas if the data param is not true
					if (!params.data) {
						return cb(null, canvas);
					}
					return cb(null, canvas.toDataURL('image/png'));
				}
			});
		}

		//Load HTML2Canvas
		function loadHTML2Canvas(cb) {
			var root = getMyRoot();
			//Make sure HTML2Canvas is not already loaded
			if (typeof html2canvas === "undefined") {
				CIQ.loadScript(root + "thirdparty/html2canvas.js", function () {
					//If we have require, use it
					if (typeof require !== "undefined") {
						return require(["html2canvas"], function (h2) {
							h2canvas = h2;
							return cb();
						});
					}
					h2canvas = html2canvas;
					return cb();
				});
			} else {
				h2canvas = html2canvas;
				return cb();
			}
		}
		//get the location of this file
		function getMyRoot() {
			var sc = document.getElementsByTagName("script");
			for (var idx = 0; idx < sc.length; idx++) {
				var s = sc[idx];
				if (s.src && s.src.indexOf("share.js") > -1) {
					return s.src.replace(/advanced\/share\.js/, "");
				}
			}
			return null;
		}

		/**
		 * Create a png image based on the current chart. If widthPX and heightPX are passed in
		 * then the image will be scaled to the requested dimensions.
		 * This function is asynchronous and requires a callback function. The callback will be passed
		 * a data object which can be sent to a server or converted to an image.
		 * @param  {object}   stx           Chart object
		 * @param	 {object}		[parameters] 	Optional parameters to describe the image.
		 * @param  {number}   [parameters.widthPX]       Width of image to create. If passed then params.heightPX  will adjust to maintain ratio.
		 * @param  {number}   [parameters.heightPX]      Height of image to create. If passed then params.widthPX will adjust to maintain ratio.
		 * @param  {string}   [parameters.imageType]   Specifies the file format your image will be output in. The dfault is PNG and the format must be suported by your browswer.
		 * @param  {Function} cb            Callback when image is available fc(data) where data is the serialized image object
		 * @memberOf CIQ.Share
		 * @since 3.0.0 Function signature changed to take parameters.
		 * @version ChartIQ plug-in
		 */
		//imageType is in it's location so developers don't need to change their current code.
		CIQ.Share.createImage = function (stx, params, cb) {
			var args = [].slice.call(arguments);
			cb = args.pop();
			if (params === null || typeof params != 'object') params = {
				widthPX: args[1],
				heightPX: args[2],
				imageType: args[3]
			};
			var widthPX = params.widthPX;
			var heightPX = params.heightPX;
			var imageType = params.imageType;

			// Set background for any part of canvas that is currently transparent NO LONGER NECESSARY????
			// CIQ.fillTransparentCanvas(stx.chart.context, stx.containerColor, stx.chart.canvas.width, stx.chart.canvas.height);

			// We use style height/width instead of the canvas width/height when the backing store is 2x on retina screens
			var renderedHeight = stx.chart.canvas.height;
			var renderedWidth = stx.chart.canvas.width;
			if (stx.chart.canvas.style.height) {
				renderedHeight = CIQ.stripPX(stx.chart.canvas.style.height);
				renderedWidth = CIQ.stripPX(stx.chart.canvas.style.width);
			}
			if (widthPX && heightPX) {
				renderedHeight = heightPX;
				renderedWidth = widthPX;
			} else if (heightPX) {
				renderedWidth = stx.chart.canvas.width * (renderedHeight / stx.chart.canvas.height);
			} else if (widthPX) {
				renderedWidth = widthPX;
				renderedHeight = stx.chart.canvas.height * (widthPX / stx.chart.canvas.width);
			}
			//var totalHeight=renderedHeight;
			var imageResult = imageType ? "image/" + imageType : "image/png";
			// Render the canvas as an image
			var shareImage = document.createElement("img");
			shareImage.onload = function () {
				// Print the image on a new canvas of appropriate size
				CIQ.Share.FullChart2PNG(stx, {
					image: this,
					width: renderedWidth,
					height: renderedHeight
				}, function (err, canvas) {
					cb(canvas.toDataURL(imageResult));	// return the data
				});
			};
			shareImage.src = stx.chart.canvas.toDataURL(imageResult);
		};

		/**
		 * Uploads an image to a server. The callback will take two parameters. The first parameter is an error
		 * condition (server status), or null if there is no error. The second parameter (if no error) will contain
		 * the response from the server.
		 * 'payload' is an optional object that contains meta-data for the server. If payload exists then the image will be added as a member of the payload object, otherwise an object will be created
		 * 'dataImage' should be a data representation of an image created by the call canvas.toDataURL such as is returned by CIQ.Share.createImage
		 * If you are getting a status of zero back then you are probably encountering a cross-domain ajax issue. Check your access-control-allow-origin header on the server side

		 * @param  {string}   dataImage Serialized data for image
		 * @param  {string}   url       URL to send the image
		 * @param  {object}   [payload]   Any additional data to send to the server should be sent as an object.
		 * @param  {Function} cb        Callback when image is uploaded
		 * @memberOf CIQ.Share
		 * @version ChartIQ plug-in
		 */
		CIQ.Share.uploadImage = function (dataImage, url, payload, cb) {
			if (!payload) payload = {};
			payload.image = dataImage;
			var valid = CIQ.postAjax(url, JSON.stringify(payload), function (status, response) {
				if (status != 200) {
					cb(status, null);
					return;
				}
				cb(null, response);
			});
			if (!valid) cb(0, null);
		};

		/**
		 * Simple function that serves as a wrapper for createImage and uploadImage.
		 * It will create an image using the default parameters. If you wish to customize the image you must use createImage separately and then call uploadImage.
		 * (example python code available in our tutorials (http://chartiq.com/licensing/documentation/tutorial-Chart Sharing.html)
		 * @param {object}	stx Chart Object
		 * @param {object}  [override] Optional parameters that overwrite the default hosting location from https://share.chartiq.com to a custom location.
		 * @param {object}	[override.host]
		 * @param {object}	[override.path]
		 * @param {function}	cb Callback when the image is uploaded.
		 * @memberof CIQ.Share
		 * @since 2015-11-01
		 */
		CIQ.Share.shareChart = function (stx, override, cb) {
			CIQ.Share.createImage(stx, {}, function (imgData) {
				var id = CIQ.uniqueID();
				var host = "https://share.chartiq.com";
				var url = host + "/upload/" + id;
				if (override) {
					if (override.host) host = override.host;
					if (override.path) url = host + override.path + "/" + id;
				}
				var startOffset = stx.getStartDateOffset();
				var metaData = {
					"layout": stx.exportLayout(),
					"drawings": stx.exportDrawings(),
					"xOffset": startOffset,
					"startDate": stx.chart.dataSegment[startOffset].Date,
					"endDate": stx.chart.dataSegment[stx.chart.dataSegment.length - 1].Date,
					"id": id,
					"symbol": stx.chart.symbol
				};
				var payload = {
					"id": id,
					"image": imgData,
					"config": metaData
				};
				CIQ.Share.uploadImage(imgData, url, payload, function (err, response) {
					if (err !== null) {
						CIQ.alert("error sharing chart: ", err);
					} else {
						cb(host + response);
					}
				});
				// end sample code to upload image to a server
			});
		};
	}

	require(['jquery', 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/0.5.0-beta3/html2canvas.js'], function () {

		window.html2canvas = arguments[1];
		window.R2 = html2canvas;

		function addStyleSheet(url) {
			// Check if stylesheet already exists
			for (var i = 0; i < document.styleSheets.length; i++) {
				var styleSheet = document.styleSheets[i];
				if (styleSheet.href == url) {
					return;
				}

			}

			$('<link>')
				.appendTo('head')
				.attr({
					type: 'text/css',
					rel: 'stylesheet'
				})
				.attr('href', url);
		}

		/*if (parent.portalSettings.themeCSS) {
			window.cssUrl = parent.portalSettings.themeCSS;
		} else {*/
		window.cssUrl = parent.cssUrl.startsWith('http') ? parent.cssUrl : '../' + parent.cssUrl;
		//}

		//var cssUrl = (location.hostname != "127.0.0.1" && location.hostname != "localhost") ? 'https://widgetcdn.chartiq.com/v2/beta1/css/' : '../css/';
		addStyleSheet('https://cdn.jsdelivr.net/perfect-scrollbar/0.6.15/css/perfect-scrollbar.css');
		addStyleSheet(cssUrl + 'normalize.css');
		addStyleSheet(cssUrl + 'chartiq/page-defaults.css');
		addStyleSheet(cssUrl + 'chartiq/stx-chart.css');
		addStyleSheet(cssUrl + 'chartiq/chartiq.css');
		window.portalSettings = parent.portalSettings;
		window.PortalCore = parent.PortalCore
		var dataSource = 'modules/' + portalSettings.dataSource;
		var markets = dataSource + '-markets';
		window.dataSources = parent.dataSources;

		require(['componentUI', 'components', 'addOns', 'thirdparty/object-observe', 'thirdparty/iscroll', 'thirdparty/webcomponents-lite', 'https://cdn.jsdelivr.net/perfect-scrollbar/0.6.15/js/perfect-scrollbar.jquery.min.js'], function () {
			$.each(arguments[0], function (key, value) {
				window[key] = value;
			});

			var quoteFeed = parent.quoteFeed;


			require([quoteFeed], function () {
				require([dataSource], function () {
					require([markets], function () {
						/*CIQ.clone = function (from, to) {
							to = _.cloneDeep(from);
							//debugger;
							return to;
						}

						CIQ.shallowClone = function (from) {
							var to = _.clone(from);
							//debugger;
							return to;
						}*/
						addShareAbility(CIQ);

						CIQ.ChartEngine.prototype.prepend("resizeChart", function () {
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

						/* begin widget code */
						var portalSettings = parent.portalSettings;
						var qParams = CIQ.qs();
						var chartSettings = portalSettings.items[qParams.item];
						if (!chartSettings.defaultTheme) chartSettings.defaultTheme = "ciq-night";
						CIQ.ChartEngine.prototype.append("createDataSet", function () {
							if (typeof parent.noFetchUpdate === 'function' && this.chart.symbol) {
								var quoteData = {}
								if (this.chart.dataSet.length) {
									var current = this.chart.dataSet[this.chart.dataSet.length - 1];
									quoteData[this.chart.symbol] = {
										Last: current.Close,
										Date: current.DT,
										PrevClose: current.iqPrevClose,
										Change: current.Close - current.iqPrevClose,
										PercentChange: (current.Close - current.iqPrevClose) / current.iqPrevClose * 100,
										Bid: current.Bid,
										Ask: current.Ask,
										Symbol: this.chart.symbol
									};

									PortalCore.sendMessage({
										sender: qParams.item,
										subject: 'quoteSync',
										data: quoteData
									});
								}
							}

						});

						CIQ.QuoteFeed.prototype.announceError = function (params, dataCallback) {
							if (['Intraday futures data is not supported.', 'Intraday data not available.', 'Symbol not found'].includes(dataCallback.error) && !params.update) {
								if (params.stx.layout.interval == 'day') {
									return;
								}
								params.stx.setSpan({
									span: 'year',
									multiplier: 1,
									periodicity: {
										period: 1,
										interval: 'day'
									}
								});
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
						/* end widget code */

						function checkWidth() {
							if ($(window).width() > 768) {
								$('body').removeClass('break-md break-sm').addClass('break-lg');
								$('.icon-toggles').removeClass('sidenav active').addClass('ciq-toggles');
								stxx.layout.sidenav = 'sidenavOff';
							}
							if ($(window).width() <= 768) {
								$('body').removeClass('break-lg break-sm').addClass('break-md');
								$('.icon-toggles').removeClass('sidenav active').addClass('ciq-toggles');
								stxx.layout.sidenav = 'sidenavOff';
							}
							if ($(window).width() <= 600) {
								$('body').removeClass('break-md break-lg').addClass('break-sm');
								$('.icon-toggles').removeClass('ciq-toggles').addClass('sidenav');
							}
						}

						function setHeight() {
							var windowHeight = $(window).height();
							var ciqHeight = $('.ciq-chart').height();

							if ($('body').hasClass("toolbar-on")) {
								$('#chartContainer').css('height', $('.ciq-chart').height() - 45 + 'px');
							} else {
								$('#chartContainer').css('height', $('.ciq-chart').height() + 'px');
							}
							// This little snippet will ensure that dialog boxes are never large than the screen height
							$('#maxHeightCSS').remove();
							$('.sidenav').css('height', ciqHeight + 'px');
							$('head').append('<style id="maxHeightCSS">cq-dialog { max-height: ' + windowHeight + 'px }</style>');
						}


						$(".stx-markers cq-item.circle").stxtap(function () {
							$(".stx-markers .ciq-radio").removeClass("ciq-active");
							$(".stx-markers cq-item.circle .ciq-radio").addClass("ciq-active");
							showMarkers("circle");
						});
						$(".stx-markers cq-item.square").stxtap(function () {
							$(".stx-markers .ciq-radio").removeClass("ciq-active");
							$(".stx-markers cq-item.square .ciq-radio").addClass("ciq-active");
							showMarkers("square");
						});
						$(".stx-markers cq-item.callout").stxtap(function () {
							$(".stx-markers .ciq-radio").removeClass("ciq-active");
							$(".stx-markers cq-item.callout .ciq-radio").addClass("ciq-active");
							showMarkers("callout");
						});
						$(".stx-markers cq-item.abstract").stxtap(function () {
							$(".stx-markers .ciq-radio").removeClass("ciq-active");
							$(".stx-markers cq-item.abstract .ciq-radio").addClass("ciq-active");
							hideMarkers();
							var helicopter = $(".stx-marker.abstract").clone();
							helicopter.css({
								"z-index": "30",
								"left": (0.4 * stxx.chart.width).toString() + "px"
							});
							var marker = new CIQ.Marker({
								stx: stxx,
								xPositioner: "none",
								yPositioner: "above_candle",
								label: "helicopter",
								permanent: true,
								chartContainer: true,
								node: helicopter[0]
							});
							stxx.draw(); // call draw() when you're done adding markers. They will be positioned in batch.
						});

						$(".stx-markers cq-item.none").stxtap(function () {
							$(".stx-markers .ciq-radio").removeClass("ciq-active");
							$(".stx-markers cq-item.none .ciq-radio").addClass("ciq-active");
							hideMarkers();
						});

						window.stxx = new CIQ.ChartEngine({
							container: $("#chartContainer")[0],
							preferences: {
								labels: false,
								currentPriceLine: true,
								whitespace: 0
							}
						}); //widget change
						stxx.maintainSpan = true; //widget change
						stxx.chart.yAxis.goldenRatioYAxis = true;
						stxx.preferences.highlightsRadius = 10; //widget change


						// begin widget change

						//stxx.setMarketFactory(CIQ.Market.Symbology.factory);

						if (!window.dataSources[portalSettings.dataSource].marketFactory) var c = createMarketFactory[portalSettings.dataSource](CIQ);
						stxx.setMarketFactory(window.dataSources[portalSettings.dataSource].marketFactory);

						//stxx.attachQuoteFeed(quotefeedSimulator, { refreshInterval: 1 });
						if (!CIQ.QuoteFeedToAttach) {
							CIQ.QuoteFeedToAttach = CIQ.QuoteFeed.Xignite;
						}

						stxx.attachQuoteFeed(new CIQ.QuoteFeedToAttach(), {
							refreshInterval: Math.min(portalSettings.chartRefreshRate, portalSettings.quoteRefreshRate),
							suppressErrors: true

						});

						// end widget change

						stxx.xaxisHeight = 30;
						stxx.xAxisAsFooter = true;

						//TODO, encapsulate these in a helper object
						// this function has lots of widget changes
						function restoreLayout(stx, cb) {
							if (chartSettings.symbol) return;
							var datum = JSON.parse(CIQ.localStorage.getItem("portalChartLayout"));
							if (chartSettings.sharedData) datum = chartSettings.sharedData.layout;
							if (datum === null) return;
							function closure() {
								if (stx.chart.symbol) {
									PortalCore.sendMessage({
										sender: qParams.item,
										subject: 'symbolChange',
										data: {
											symbol: stx.chart.symbol
										}
									})

								}
								restoreDrawings(stx, stx.chart.symbol);
								restoreFundamentals(stx);
								cb();
							}
							stx.importLayout(datum, {
								managePeriodicity: true,
								cb: closure
							});
						}

						function saveLayout(obj) {
							var s = JSON.stringify(obj.stx.exportLayout(false)); //widget change
							CIQ.localStorageSetItem("portalChartLayout", s); //widget change
						}

						// this function has lots of widget changes
						function restoreDrawings(stx, symbol) {
							var memory = JSON.parse(CIQ.localStorage.getItem(symbol));
							if (chartSettings.sharedData) memory = chartSettings.sharedData.drawings;
							if (memory !== null) {
								var parsed = memory;
								if (parsed) {
									stx.reconstructDrawings(parsed);
									stx.draw();
								}
							}
						}

						// begin widget change
						function restoreFundamentals(stx) {
							/*if (stx.layout.fundamentals) {
								CIQ.Fundamentals.displayFundamentals(stx);
							}*/
							// Disabling restore for now
							stx.layout.fundamentals = {}
						}
						// end widget chante

						function saveDrawings(obj) {
							var tmp = obj.stx.exportDrawings();
							if (tmp.length === 0) {
								CIQ.localStorage.removeItem(obj.symbol);
							} else {
								CIQ.localStorageSetItem(obj.symbol, JSON.stringify(tmp));
							}
						}

						function retoggleEvents(obj) {
							var active = $(".stx-markers .ciq-radio.ciq-active");
							active.parent().triggerHandler("stxtap");
						}

						stxx.callbacks.layout = saveLayout;
						stxx.callbacks.symbolChange = saveLayout;
						stxx.callbacks.drawing = saveDrawings;
						stxx.callbacks.newChart = retoggleEvents;

						//var UIContext;

						function startUI() {
							// begin widget Change
							window.UIContext = new CIQ.UI.Context(stxx, $("*[cq-context]"));
							if (chartSettings.search) $('.ciq-nav .ciq-search').css('visibility', 'visible');

							CIQ.UI.Layout.prototype.clearFundamentals = function (node) {
								var stx = this.context.stx;
								for (var id in stx.layout.fundamentals) {
									CIQ.Fundamentals.removeFundamental(stx, id);
								}
								stx.draw();
							};

							// end widget change

							var UILayout = new CIQ.UI.Layout($(".ciq-display"), UIContext);
							UILayout.aggregationDialog = $("cq-dialog[cq-aggregation]");

							var UIHeadsUpDynamic = new CIQ.UI.HeadsUp($("cq-hu-dynamic"), UIContext, {
								followMouse: true,
								autoStart: false
							});

							var UIHeadsUpStatic = new CIQ.UI.HeadsUp($("cq-hu-static"), UIContext, { autoStart: true });

							var activeHeadsUp = UIHeadsUpStatic;

							UIContext.streamTrade = function (data) {
								//debugger;
								var stx = this.stx;
								if (!stx.chart.masterData || !stx.chart.masterData.length) return;
								var currentDate = new Date(data.Date + ' ' + data.Time);
								if (data.Time) currentDate.setMinutes(currentDate.getMinutes() - data.UTCOffset * 60 - currentDate.getTimezoneOffset());

								stx.streamTrade({
									last: data.Last,
									bid: data.Bid,
									ask: data.Ask
								}, data.DateTime);
							}

							UIContext.changeSymbol = function (data) {
								var stx = this.stx;
								if (stx.chart.symbol == data.symbol) return;
								if (this.loader) this.loader.show();
								data.symbol = data.symbol.toUpperCase(); // set a pretty display version

								// begin widget change
								PortalCore.sendMessage({
									sender: qParams.item,
									subject: 'symbolChange',
									data: {
										symbol: data.symbol
									}
								})
								// end widget change

								var self = this;
								stx.newChart(data, null, null, function (err) {
									if (err) {
										//TODO, symbol not found error
										if (self.loader) self.loader.hide();
										return;

									}
									// The user has changed the symbol, populate UITitle with yesterday's closing cq-hu-price
									// iqPrevClose is just a dummy value, you'll need to get the real value from your data source

									for (var field in stx.chart.series) stx.removeSeries(field); // reset comparisons - remove this line to transfer from symbol to symbol.
									if (stx.tfc) stx.tfc.changeSymbol();   // Update trade from chart, todo, do this with an observer
									if (self.loader) self.loader.hide();
									restoreDrawings(stx, stx.chart.symbol);
								}/*, {
								span: {
									base: 'week',
									multiplier: 1
								}
							}*/);
							};


							UIContext.setLookupDriver(new CIQ.UI.Lookup.Driver.ChartIQ(portalSettings.searchExchanges));

							UIContext.UISymbolLookup = $(".ciq-search cq-lookup")[0];
							UIContext.UISymbolLookup.setCallback(function (context, data) {
								context.changeSymbol(data);
							});

							var KeystrokeHub = new CIQ.UI.KeystrokeHub($("body"), UIContext, { cb: CIQ.UI.KeystrokeHub.defaultHotKeys });

							var UIStudyEdit = new CIQ.UI.StudyEdit(null, UIContext, $("cq-dialog[cq-study-context]"));

							var UIStorage = new CIQ.NameValueStore();

							var UIThemes = $("cq-themes");
							UIThemes[0].initialize({
								builtInThemes: {
									"ciq-day": "Day",
									"ciq-night": "Night"
								},
								defaultTheme: chartSettings.defaultTheme,
								nameValueStore: UIStorage
							});

							var sidePanel = $("cq-side-panel")[0];
							if (sidePanel) sidePanel.registerCallback(resizeScreen);

							$(".ciq-sidenav")[0].registerCallback(function (value) {
								var stx = this.context.stx,
									rightPx;
								var sidePanelWidth = $('cq-side-panel').width() || 0;
								if (value === 'sidenavOn') {
									rightPx = 40 + sidePanelWidth;
									this.node.addClass("active");
									stx.layout.sidenav = "sidenavOn";
									$('.sidenav').addClass("active");
									$('.ciq-chart-area').css({ 'right': rightPx + 'px' });
									stx.resizeChart();
								} else if (value === 'sidenavOff') {
									rightPx = sidePanelWidth ? sidePanelWidth - 40 : 0;
									$('.sidenav').removeClass("active");
									this.node.removeClass("active");
									stx.layout.sidenav = "sidenavOff";
									$('.ciq-chart-area').css({ 'right': rightPx + 'px' });
									stx.resizeChart();
								}
							});

							$(".ciq-HU")[0].registerCallback(function (value) {
								if (value === "static") {
									UIHeadsUpDynamic.end();
									UIHeadsUpStatic.begin();
									this.node.addClass("active");
								} else if (value === "dynamic") {
									UIHeadsUpStatic.end();
									UIHeadsUpDynamic.begin();
									this.node.addClass("active");
								} else {
									UIHeadsUpStatic.end();
									UIHeadsUpDynamic.end();
									this.node.removeClass("active");
								}
							});
							$(".ciq-draw")[0].registerCallback(function (value) {
								if (value) {
									this.node.addClass("active");
									$("body").addClass("toolbar-on");
								} else {
									this.node.removeClass("active");
									$("body").removeClass("toolbar-on");
								}
								setHeight('#chartContainer');
								var stx = this.context.stx;
								stx.resizeChart();

								// a little code here to remember what the previous drawing tool was
								// and to re-enable it when the toolbar is reopened
								if (value) {
									stx.changeVectorType(this.priorVectorType);
								} else {
									this.priorVectorType = stx.currentVectorParameters.vectorType;
									stx.changeVectorType("");
								}
							});

							if ($('.stx-trade')[0]) {
								$('.stx-trade')[0].registerCallback(function (value) {
									var sidePanel = $("cq-side-panel")[0];
									if (value) {
										sidePanel.open({
											selector: ".stx-trade-panel",
											className: "active"
										});
										this.node.addClass("active");
										$(".stx-trade-panel").removeClass("closed");
									} else {
										sidePanel.close();
										this.node.removeClass("active");
										$(".stx-trade-panel").addClass("closed");
									}
								});
							}

							if ($('.stx-tradingcentral')[0]) {
								$('.stx-tradingcentral')[0].registerCallback(function (value) {
									var tcElement = $('cq-tradingcentral')[0];
									if (value) {
										tcElement.removeAttribute('disabled');
									} else {
										tcElement.setAttribute('disabled', 'disabled');
									}
								});
							}

							$("cq-redo")[0].pairUp($("cq-undo"));

							var params = {
								excludedStudies: {
									"Directional": true,
									"Gopala": true,
									"vchart": true
								},
								alwaysDisplayDialog: { "ma": true },
								/*dialogBeforeAddingStudy: {"rsi": true} // here's how to always show a dialog before adding the study*/
							};
							var UIStudyMenu = new CIQ.UI.StudyMenu($("*[cq-studies]"), UIContext, params);
							UIStudyMenu.renderMenu();

							var UIViewsMenu = new CIQ.UI.ViewsMenu($("cq-views-content"), UIContext);
							UIViewsMenu.renderMenu();

							// widget change

							CIQ.Fundamentals = function () { }

							CIQ.Fundamentals.availableFundamentals = {
								"QuarterlySalesOrRevenue": {
									name: "Quarterly Revenue",
									id: "SalesOrRevenue",
									term: "Quarterly",
									color: '#f7f37b'
								},
								"AnnualSalesOrRevenue": {
									name: "Annual Revenue",
									id: "SalesOrRevenue",
									term: "Annual",
									color: '#e371b2'
								},
								"TTMSalesOrRevenue": {
									name: "TTM Revenue",
									id: "SalesOrRevenue",
									term: "TTM",
									color: '#ed6647'
								},
								"QuarterlyNetIncomeTotalOperations": {
									name: "Quarterly Net Income",
									id: "NetIncomeTotalOperations",
									term: "Quarterly",
									color: '#a75dba'
								},
								"AnnualNetIncomeTotalOperations": {
									name: "Annual Net Income",
									id: "NetIncomeTotalOperations",
									term: "Annual",
									color: '#ffb54d'
								},
								"TTMNetIncomeTotalOperations": {
									name: "TTM Net Income",
									id: "NetIncomeTotalOperations",
									term: "TTM",
									color: '#fad55c'
								},
								"QuarterlyGrossIncome": {
									name: "Quarterly Gross Income",
									id: "GrossIncome",
									term: "Quarterly",
									color: '#a2bf39'
								},
								"AnnualGrossIncome": {
									name: "Annual Gross Income",
									id: "GrossIncome",
									term: "Annual",
									color: '#6ddbdb'
								},
								"TTMGrossIncome": {
									name: "TTM Gross Income",
									id: "GrossIncome",
									term: "TTM",
									color: '#68c182'
								},
								"QuarterlyEPS": {
									name: "Quarterly EPS",
									id: "EPS",
									term: "Quarterly",
									color: '#47bdef',
									dontFormatPrice: true
								},
								"AnnualEPS": {
									name: "Annual EPS",
									id: "EPS",
									term: "Annual",
									color: '#8561c8',
									dontFormatPrice: true
								},
								"TTMEPS": {
									name: "TTM EPS",
									id: "EPS",
									term: "TTM",
									color: '#267db3',
									dontFormatPrice: true
								}, /* 	//TODO - figure out how to add this thing which depends on the value of the stock
									//- need to recalculate upon chart data change
									//- need to adjust for splits
									//- see "redraw any series that has calculations" below
							"PE": {
								name: "P/E",
								id: "EPS",
								term: "TTM",
								color: '#267db3',
								calculate: function(masterData, rawSeriesData) {
									var newSeriesData = []
									var j=rawSeriesData.length-1;
									for (var i=masterData.length-1; i>=0; i--) {
										var dataItem = masterData[i];
										var fundamentalItem = rawSeriesData[j];
										if (dataItem.DT.getTime() > fundamentalItem.DT.getTime()) {
											newSeriesData.unshift({
												DT: dataItem.DT.getTime(),
												Close: dataItem.Close/fundamentalItem.Close
											})
										} else {
											j--; i++;
										}
										if (j<0) break;
									}
									return newSeriesData;
								}
							}*/

							}

							CIQ.Fundamentals.addFundamental = function (stx, fm) {
								var symbolObject = {
									symbol: CIQ.Fundamentals.availableFundamentals[fm].name,
									mainSymbol: stx.chart.symbol,
									fundamental: {
										fundamental: CIQ.Fundamentals.availableFundamentals[fm].id,
										term: CIQ.Fundamentals.availableFundamentals[fm].term,
										label: CIQ.Fundamentals.availableFundamentals[fm].name
									}
								}

								var axis = new CIQ.ChartEngine.YAxis();
								if (!CIQ.Fundamentals.availableFundamentals[fm].dontFormatPrice) {
									axis.priceFormatter = function (stx, panel, price) {
										return CIQ.condenseInt(price);
									}
								}
								axis.position = 'right';

								if (!stx.layout.fundamentals) stx.layout.fundamentals = {};
								stx.layout.fundamentals[fm] = true;

								var renderer = stx.setSeriesRenderer(
									new STX.Renderer.Lines(
										{
											params: {
												name: CIQ.Fundamentals.availableFundamentals[fm].name,
												type: "line",
												yAxis: axis
											}
										}
									)
								);

								stx.addSeries(CIQ.Fundamentals.availableFundamentals[fm].name, {
									isComparison: false,
									gaps: {
										color: CIQ.Fundamentals.availableFundamentals[fm].color
									},
									display: CIQ.Fundamentals.availableFundamentals[fm].name,
									symbolObject: symbolObject
								}, function () {
									renderer.removeAllSeries().attachSeries(CIQ.Fundamentals.availableFundamentals[fm].name, CIQ.Fundamentals.availableFundamentals[fm].color).ready();
								})






								/*var seriesArray = {}
								seriesArray[CIQ.Fundamentals.availableFundamentals[fm].name] = stx.chart.series[CIQ.Fundamentals.availableFundamentals[fm].name]
								stx.drawSeries(stx.chart, seriesArray);*/

								/*var fSettings = {
									symbol: stx.chart.symbol,
									fundamentals: [
										{
											fundamental: CIQ.Fundamentals.availableFundamentals[fm].id,
											term: CIQ.Fundamentals.availableFundamentals[fm].term,
											label: CIQ.Fundamentals.availableFundamentals[fm].name
										}

									],
									years: 5
								}
								window.dataSources[portalSettings.dataSource].fetchFundamentalsFiscalRange(fSettings, function (err, data) {

									if (data && data.fundamentals) {
										var fundamentals = [];
										_.each(_.sortBy(data.fundamentals, 'Date'), function (fundamental) {
											fundamentals.push({
												DT: new Date(fundamental.Date),
												Close: fundamental[CIQ.Fundamentals.availableFundamentals[fm].name]
											})
										});

										if (typeof CIQ.Fundamentals.availableFundamentals[fm].calculate == 'function') {
											fundamentals = CIQ.Fundamentals.availableFundamentals[fm].calculate(stx.chart.masterData, fundamentals);
										}



										var axis = new CIQ.ChartEngine.YAxis();
										if (!CIQ.Fundamentals.availableFundamentals[fm].dontFormatPrice) {
											axis.priceFormatter = function (stx, panel, price) {
												return CIQ.condenseInt(price);
											}
										}
										axis.position = 'right';
										//stx.calculateYAxisMargins(axis);

										var renderer = stx.setSeriesRenderer(
											new STX.Renderer.Lines(
												{
													params: { name: CIQ.Fundamentals.availableFundamentals[fm].name, type: "line", yAxis: axis }
												}
											)
										);

										if (!stx.layout.fundamentals) stx.layout.fundamentals = {};
										stx.layout.fundamentals[fm] = true;

										stx.addSeries(CIQ.Fundamentals.availableFundamentals[fm].name, {
											isComparison: false,
											data: fundamentals,
											gaps: {
												color: CIQ.Fundamentals.availableFundamentals[fm].color
											},
											display: CIQ.Fundamentals.availableFundamentals[fm].name
										})

										renderer.removeAllSeries().attachSeries(CIQ.Fundamentals.availableFundamentals[fm].name, CIQ.Fundamentals.availableFundamentals[fm].color).ready();




									}

								});*/

							}

							CIQ.Fundamentals.removeFundamental = function (stx, fm) {
								stx.removeSeries(CIQ.Fundamentals.availableFundamentals[fm].name)
								delete stx.layout.fundamentals[fm];
								//stx.changeOccurred("layout");
							}

							CIQ.Fundamentals.displayFundamentals = function (stx, chart) {
								for (var fm in stx.layout.fundamentals) {
									CIQ.Fundamentals.addFundamental(stx, fm);
								}
							}

							/* redraw any series that has calculations - TODO - this causes an infinite loop. need to be able to figure out how to calculate value of series without createDataSet
							CIQ.ChartEngine.prototype.append("createDataSet", function () {
								var self=this;
								_.each(self.chart.series, function(series, seriesName) {
									_.each(CIQ.Fundamentals.availableFundamentals, function(fundamental, fundamentalId) {
										if (seriesName == fundamental.name && typeof fundamental.calculate == 'function') {
											CIQ.Fundamentals.removeFundamental(self, fundamentalId);
											CIQ.Fundamentals.addFundamental(self, fundamentalId);
										}
									})
								});
							}); */

							CIQ.UI.FundamentalsMenu = function (node, context, params) {
								this.node = $(node);
								this.context = context;
								this.params = params ? params : {};
								if (!this.params.template) this.params.template = ".stxTemplate";
								this.params.template = this.node.find(this.params.template);
								this.params.template.detach();
								//this.alwaysDisplayDialog = this.params.alwaysDisplayDialog ? this.params.alwaysDisplayDialog : false;
								//this.excludedStudies = this.params.excludedStudies;
								//if (!this.excludedStudies) this.excludedStudies = [];
								context.advertiseAs(this, "FundamentalsMenu");
							};
							CIQ.UI.FundamentalsMenu.ciqInheritsFrom(CIQ.UI.Helper);

							CIQ.UI.FundamentalsMenu.prototype.showFundamental = function (node, fundamentalName) {
								var stx = this.context.stx;
								var self = this;

								CIQ.Fundamentals.addFundamental(stx, fundamentalName);

							}

							CIQ.UI.FundamentalsMenu.prototype.renderMenu = function () {
								var self = this;
								var alphabetized = [];
								var sd;
								for (var field in CIQ.Fundamentals.availableFundamentals) {
									sd = CIQ.Fundamentals.availableFundamentals[field];
									if (!sd.name) sd.name = field; // Make sure there's always a name
									//if (this.excludedStudies[field] || this.excludedStudies[sd.name]) continue;
									alphabetized.push(field);
								}
								alphabetized.sort(function (lhs, rhs) {
									var lsd = CIQ.Fundamentals.availableFundamentals[lhs];
									var rsd = CIQ.Fundamentals.availableFundamentals[rhs];
									if (lsd.name < rsd.name) return -1;
									if (lsd.name > rsd.name) return 1;
									return 0;
								});
								var menu = $(self.node);

								var tapFn = function (fundamentalName, context) {
									return function (e) {
										self.showFundamental(e.target, fundamentalName);

										menu.resize();
									};
								};
								for (var i = 0; i < alphabetized.length; i++) {
									var menuItem = self.params.template.clone();
									sd = CIQ.Fundamentals.availableFundamentals[alphabetized[i]];
									menuItem.append(sd.name);
									menu.append(menuItem);
									menuItem[0].selectFC = tapFn(alphabetized[i], self.context);
									menuItem.stxtap(menuItem[0].selectFC);
								}
							}

							var UIFundamentalsMenu = new CIQ.UI.FundamentalsMenu($("*[cq-fundamentals]"), UIContext, {});
							UIFundamentalsMenu.renderMenu();

							var FundamentalLegend = {
								prototype: Object.create(CIQ.UI.ModalTag)
							};

							FundamentalLegend.prototype.setContext = function (context) {
								this.template = this.node.find("template");
								this.previousStudies = {};
								this.begin();
							};

							/**
							 * Begins running the StudyLegend.
							 * @memberof! WebComponents.cq-study-legend
							 * @private
							 */
							FundamentalLegend.prototype.begin = function () {
								var self = this;
								function renderDelete(deletedSeries) {
									for (var s in CIQ.Fundamentals.availableFundamentals) {
										if (CIQ.Fundamentals.availableFundamentals[s].name == deletedSeries) {
											delete this.layout.fundamentals[s];
											render();
											return;
										}
									}
								}
								function render() {
									self.showHide();
									self.renderLegend();
								}
								this.addInjection("append", "addSeries", render);
								this.addInjection("append", "deleteSeries", renderDelete);
								render();
							};

							FundamentalLegend.prototype.showHide = function () {
								for (var s in this.context.stx.layout.fundamentals) {
									if (!this.context.stx.layout.fundamentals[s].customLegend) {
										$("cq-fundamental-legend").css({ "display": "" });
										return;
									}
								}
								$("cq-fundamental-legend").css({ "display": "none" });
							};

							/**
							 * Renders the legend based on the current fundamentals in the CIQ.ChartEngine object. Since this gets called
							 * continually in the draw animation loop we are very careful not to render unnecessarily.
							 * @memberof! WebComponents.cq-study-legend
							 */
							FundamentalLegend.prototype.renderLegend = function (re) {
								var stx = this.context.stx;
								if (!stx.layout.fundamentals) return;
								var foundAChange = false;
								var id;

								// Logic to determine if the fundamentals have changed, otherwise don't re-create the legend
								if (CIQ.objLength(this.previousFundamentals) == CIQ.objLength(stx.layout.fundamentals)) {
									for (id in stx.layout.fundamentals) {
										if (!this.previousFundamentals[id]) {
											foundAChange = true;
											break;
										}
									}
									if (!foundAChange) return;
								}
								this.previousFundamentals = CIQ.shallowClone(stx.layout.fundamentals);

								$(this.template).parent().emptyExceptTemplate();

								function closeFundamental(self, sd) {
									return function (e) {
										CIQ.Fundamentals.removeFundamental(self.context.stx, sd);
										if (self.node[0].hasAttribute("cq-marker")) self.context.stx.modalEnd();
										self.renderLegend();
										//self.context.resize();
									};
								}

								for (id in stx.layout.fundamentals) {
									var sd = CIQ.Fundamentals.availableFundamentals[id];
									var newChild = CIQ.UI.makeFromTemplate(this.template, true);
									newChild.find("cq-label").html(sd.name);
									var close = newChild.find(".ciq-close");
									close.stxtap(closeFundamental(this, id));

									/*var edit = newChild.find(".ciq-edit");
									if (!edit.length) edit = newChild.find("cq-label");
									edit.stxtap(editFundamental(this, id));*/
								}
								//Only want to render the marker label if at least one study has been
								//rendered in the legend. If no studies are rendered, only the template tag
								//will be in there.
								if (typeof (markerLabel) != "undefined" && this.node[0].childElementCount > 1) {
									this.node.prepend("<cq-marker-label>" + markerLabel + "</cq-marker-label>");
								}
								//this.context.resize();
								this.showHide();
							};

							CIQ.UI.FundamentalLegend = document.registerElement("cq-fundamental-legend", FundamentalLegend);




							// end widget change

							UIContext.buildReverseBindings();

							if (UIContext.loader) UIContext.loader.show();
							restoreLayout(stxx, function () {
								if (UIContext.loader) UIContext.loader.hide();
							});

							if (!stxx.chart.symbol) {
								UIContext.UISymbolLookup.selectItem({ symbol: chartSettings.symbol }); // load an initial symbol
							}
						}

						function hideMarkers() {
							CIQ.Marker.removeByLabel(stxx, "circle");
							CIQ.Marker.removeByLabel(stxx, "square");
							CIQ.Marker.removeByLabel(stxx, "callout");
							CIQ.Marker.removeByLabel(stxx, "helicopter");
						}

						function showMarkers(standardType) {
							// Remove any existing markers
							hideMarkers();
							var l = stxx.masterData.length;
							// An example of a data array to drive the marker creation
							var data = [
								{
									x: stxx.masterData[l - 5].DT,
									type: standardType,
									category: "news",
									headline: "This is a Marker for a News Item"
								},
								{
									x: stxx.masterData[l - 15].DT,
									type: standardType,
									category: "earningsUp",
									headline: "This is a Marker for Earnings (+)"
								},
								{
									x: stxx.masterData[l - 25].DT,
									type: standardType,
									category: "earningsDown",
									headline: "This is a Marker for Earnings (-)"
								},
								{
									x: stxx.masterData[l - 35].DT,
									type: standardType,
									category: "dividend",
									headline: "This is a Marker for Dividends"
								},
								{
									x: stxx.masterData[l - 45].DT,
									type: standardType,
									category: "filing",
									headline: "This is a Marker for a Filing"
								},
								{
									x: stxx.masterData[l - 55].DT,
									type: standardType,
									category: "split",
									headline: "This is a Marker for a Split"
								}
							];
							var story = "Like all ChartIQ markers, the object itself is managed by the chart, so when you scroll the chart the object moves with you. It is also destroyed automatically for you when the symbol is changed.";

							// Loop through the data and create markers
							for (var i = 0; i < data.length; i++) {
								var datum = data[i];
								datum.story = story;
								var params = {
									stx: stxx,
									label: standardType,
									xPositioner: "date",
									x: datum.x,
									//chartContainer: true, // Allow markers to float out of chart. Set css .stx-marker{ z-index:20}
									node: new CIQ.Marker.Simple(datum)
								};

								var marker = new CIQ.Marker(params);
							}
							stxx.draw();
						}

						function resizeScreen(force) {
							if (!UIContext) return;
							if (!window.prevWidth) window.prevWidth = 0;

							var newWidth = $(window).width();
							if (!force && Math.abs(newWidth - prevWidth) < 30) return;

							checkWidth();
							setHeight('#chartContainer');
							var sidePanel = $("cq-side-panel")[0];
							if (sidePanel) {
								$('.ciq-chart-area').css({ 'right': sidePanel.nonAnimatedWidth() + 'px' });
								$('cq-tradingcentral').css({ 'margin-right': sidePanel.nonAnimatedWidth() + 15 + 'px' });
							}
							var noLoadMore = stxx.quoteDriver.behavior.noLoadMore;
							//stxx.quoteDriver.behavior.noLoadMore=true;
							var r = stxx.resizeChart();
							setTimeout(function () {
								stxx.quoteDriver.behavior.noLoadMore = noLoadMore;
								stxx.resizeChart();
							}, 2000);
							prevWidth = newWidth;
						}

						var webComponentsSupported = ('registerElement' in document &&
							'import' in document.createElement('link') &&
							'content' in document.createElement('template'));

						//if (webComponentsSupported) { //widget change - commented out
						startUI();
						resizeScreen();
						$('html')[0].style.visibility = "visible"; //widget change
						/*} else { // widget change
							window.addEventListener('WebComponentsReady', function (e) {
								startUI();
								resizeScreen();
							});
						}*/

						// begin widget change
						//$(window).resize(resizeScreen); //widget change
						PortalCore.PostResizeCalls.push(resizeScreen); //widget change
						if (chartSettings.fitInPage) {
							PortalCore.ParentHeightChecker.PostResizeCalls.push(resizeScreen);
						}

						//end widget change

						//CIQ.I18N.setLanguage(stxx, "es");				// Optionally set translation services

						// Extended hours trading zones
						// new CIQ.ExtendedHours({ stx: stxx, filter: true }); // widget change

						// Floating tooltip on mousehover
						new CIQ.Tooltip({
							stx: stxx,
							ohl: true,
							volume: true,
							series: true,
							studies: true
						});

						// Inactivity timer
						//new CIQ.InactivityTimer({ stx: stxx, minutes: 30 });

						CIQ.UI.ShareButton.prototype.portalShare = function (e) {
							if (PortalCore.ShareService.share) {
								PortalCore.ShareService.share({
									itemType: chartSettings.itemType,
									widgetId: qParams.item,
									data: {
										layout: stxx.exportLayout(true),
										drawings: stxx.serializeDrawings()
									}
								});
							} else {
								$("cq-share-dialog").each(function () {
									this.open();
								});
							}
						};


						/*var haveIResized = false;
						function resizeScreenOnce() {
							if (haveIResized) return;
							haveIResized = true;
							resizeScreen();
						}*/

						//STX.I18N.setLanguage(stxx, "es");				// Optionally set translation services
						//$(window).resize(resizeScreen);
						(function (i, s, o, g, r, a, m) {
							i['GoogleAnalyticsObject'] = r;
							i[r] = i[r] || function () {
								(i[r].q = i[r].q || []).push(arguments)
							}, i[r].l = 1 * new Date();
							a = s.createElement(o),
								m = s.getElementsByTagName(o)[0];
							a.async = 1;
							a.src = g;
							m.parentNode.insertBefore(a, m)
						})(window, document, 'script', 'https://www.google-analytics.com/analytics.js', 'ga');
						ga('create', 'UA-30306856-10', 'auto');
						ga('send', 'pageview');
					});
				});
			});
		});
	});
} catch (e) {

}