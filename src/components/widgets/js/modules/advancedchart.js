var symbolHistory = {};

function streamToChart(err, quote, list) {
	_.each(list, function (widgetId) {
		var container = 'ciq-' + widgetId;
		var settings = defaultSettings.items[widgetId];
		var chartFrame = $('#' + container + '-chart');

		if (quote[settings.symbol]) {
			if (chartFrame[0].contentWindow.UIContext) chartFrame[0].contentWindow.UIContext.streamTrade(quote[settings.symbol]);
		}

	});
}

function advancedchart(list) {

	//require(['hi-base64'], function () {
	_.each(list, function (widgetId) {
		var container = 'ciq-' + widgetId;
		var settings = defaultSettings.items[widgetId];
		var containerObject = $('#' + container);

		if (settings.message && settings.message.data && settings.message.data.symbol) {
			settings.symbol = settings.message.data.symbol;
		}

		if (!settings.symbol) settings.symbol = portalSettings.defaultSymbol;
		var height = containerObject.width() * 9 / 16;
		if (settings.heightWidthRatio) {
			height = containerObject.width() * settings.heightWidthRatio;
		} else if (settings.height) {
			height = settings.height;
		}

		if ($.isNumeric(height)) height = height + 'px'

		var chartFrame = $('#' + container + '-chart');
		if (!chartFrame.length) {
			if (portalSettings.dataSource == "xignite") {
				var dataSource = 'modules/' + portalSettings.dataSource;
				require([dataSource], function () {
					function testTokenAndLoadFrame() {
						var token = localStorage.getItem("Xignite.token");
						if (!token) {
							return setTimeout(testTokenAndLoadFrame, 250);
						}
						chartFrame = $('<iframe>').attr('id', container + '-chart').css('width', '100%').attr('frameBorder', 0).attr('allowTransparency', "true").css('height', height);
						if (settings.minHeight) chartFrame.css('min-height', settings.minHeight + 'px')

						chartFrame.attr('src', 'iframedmodules/chartiq.html?sym=' + settings.symbol + '&item=' + widgetId);
						containerObject.append(chartFrame);
						containerObject.show();
					}
					testTokenAndLoadFrame();
				});
			} else {
				chartFrame = $('<iframe>').attr('id', container + '-chart').css('width', '100%').attr('frameBorder', 0).attr('allowTransparency', "true").css('height', height);
				if (settings.minHeight) chartFrame.css('min-height', settings.minHeight + 'px')

				chartFrame.attr('src', 'iframedmodules/chartiq.html?sym=' + settings.symbol + '&item=' + widgetId);
				containerObject.append(chartFrame);
				containerObject.show();
			}

		} else {
			if (symbolHistory[widgetId] != settings.symbol) {
				chartFrame[0].contentWindow.UIContext.changeSymbol({ symbol: settings.symbol })
			}/* else {
				if (chartFrame[0].contentWindow.UIContext) chartFrame[0].contentWindow.UIContext.streamTrade(settings);
			}*/
		}

		symbolHistory[widgetId] = settings.symbol;

		function resizeScreen(force) {
			if (!containerObject.prevWidth) containerObject.prevWidth = 0;

			containerObject.newWidth = $(window).width();
			if (!force && Math.abs(containerObject.newWidth - containerObject.prevWidth) < 30) return;


			var height = chartFrame.width() * 9 / 16;
			if (settings.heightWidthRatio) {
				height = chartFrame.width() * settings.heightWidthRatio;
			} else if (settings.height) {
				height = settings.height;
			}

			if ($.isNumeric(height) && settings.fitInPage && PortalCore.parentInfo) {
				var chartFramePosition = chartFrame.position();
				maxHeight = PortalCore.parentInfo.clientHeight - 10 - chartFramePosition.top - ($('#ciq-bottom-finder').offset().top - chartFramePosition.top - chartFrame.outerHeight(true)) - parseInt($('body').css('padding-bottom')) - parseInt($('body').css('margin-bottom')) - parseInt($('.ciq-element-container').css('margin-bottom')) - parseInt($('.ciq-element-container').css('padding-bottom'));
				if (settings.fitInPage == 'expand') height = maxHeight;
				else if (chartFrame.position().top + height > PortalCore.parentInfo.clientHeight) {
					height = maxHeight;
				}
			}


			if ($.isNumeric(height)) height = height + 'px'

			chartFrame.css('height', height);

			if (settings.minHeight) chartFrame.css('min-height', settings.minHeight + 'px')

			if (chartFrame.length) chartFrame[0].contentWindow.resizeBy(0, 0);

			containerObject.prevWidth = containerObject.newWidth;


		}

		if (settings.fitInPage) {
			PortalCore.ParentHeightChecker.enable();
			PortalCore.ParentHeightChecker.PostResizeCalls.push(resizeScreen);
		}

		PortalCore.PostResizeCalls.push(resizeScreen)

		//$(window).resize(_.debounce(, 125));
	});

	//if we have a quote module do something to sync
	if (typeof quoteDependencyList !== 'undefined') {
		quoteDependencyList[_.join(list)] = {
			quoteCallback: streamToChart,
			extraParams: list
		}
	}



}