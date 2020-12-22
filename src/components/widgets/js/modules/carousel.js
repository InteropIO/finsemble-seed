var carouselCallback = function (err, quoteData, list) {

	if (!verifyQuoteData(quoteData)) {
		dataSources[portalSettings.dataSource].fetchQuotes(_.uniq(_(quoteSymbolList).values().join().split(',')), updateQuoteCallback);
		return;
	}

	if (!window.availableChartLibrary) window.availableChartLibrary = 'basicchart';
	require(['owl', availableChartLibrary, 'chartcommon'], function () {
		_.each(list, function (value, key) {
			var container = 'ciq-' + value;
			var settings = portalSettings.items[value];
			if (!settings.chartType) settings.chartType = 'baseline_delta_mountain';
			var containerObject = $('#' + container);
			var carouselDiv = $('#' + 'owl-' + container);
			if (!carouselDiv.length) {
				carouselDiv = $('<div>').attr('id', 'owl-' + container).addClass('owl-carousel owl-theme').css('width', '100%');
				if (settings.height) carouselDiv.css('height', settings.height + 'px');
				containerObject.append(carouselDiv);
				carouselDiv.owlCarousel({
					//loop: true,
					autoplay: true,
					autoplaySpeed: 2000,
					/*autoplayHoverPause: true,*/
					nav: false,
					rewind: true,
					responsive: {
						0: {
							items: 1
						},
						500: {
							items: Math.min(settings.symbolList.length, 2)
						},
						750: {
							items: Math.min(settings.symbolList.length, 3)
						},
						1000: {
							items: Math.min(settings.symbolList.length, 4)
						},
						1250: {
							items: Math.min(settings.symbolList.length, 5)
						}
					}
				});
				carouselDiv.trigger('autoplay.play.owl');
				containerObject.show();
			}

			_.each(settings.symbolList, function (symbol, key2) {

				var id = container + '-' + symbol[0];
				var li = $(document.getElementsByClassName(id));
				//carouselDiv.trigger('remove.owl.carousel', key2);
				var newItem = false;
				if (!li.length) {
					var chartContainerId = 'ciq-chart-' + key2 + '-' + container;
					li = $('<div style="height:100%">').addClass('item').append('<div class="ciq-tick-name"></div><div class="ciq-tick-price"></div><div class="ciq-tick-change"></div><div class="ciq-SparkChart" id="ciq-' + chartContainerId + '" style="height:100%"></div>').attr('id', id).addClass(id);
					newItem = true;

					portalSettings.items[chartContainerId] = {
						symbol: symbol[0],
						height: '100%',
						chartType: settings.chartType
					}

					chart('SparkChart', [chartContainerId]);

				}

				var d = quoteData[symbol[0]];
				if (!d) d = quoteData[symbol[0].substring(1)];
				if (!d) d = quoteData[symbol[0].split(':')[1]];
				//if (d == null || d.Symbol == null) return;
				//container.style.display = "";
				_.each(li, function (value) {
					var $li = $(value);
					var children = $li.children();
					children[0].innerHTML = symbol[1];
					if (d.Last == null || isNaN(d.Last)) children[1].innerHTML = d.Last;
					else children[1].innerHTML = Math.abs(d.Last).toFixed(Math.max(2, d.Last.toString().indexOf(".") == -1 ? 0 : d.Last.toString().split(".")[1].length));
					if (d.PercentChange == null) children[2].innerHTML = "N/A";
					else if (isNaN(d.PercentChange)) children[2].innerHTML = d.PercentChange;
					else children[2].innerHTML = (d.Change >= 0 ? "+" : "-") + Math.abs(d.PercentChange).toFixed(2) + "%";
					$(children[2]).addClass(d.Change > 0 ? "up" : (d.Change < 0 ? "down" : ""));
					$li.attr("moreInfoData", JSON.stringify(d));
				});

				//if (d.Delay) setDelay(li, d.Delay);
				if (newItem) carouselDiv.trigger('add.owl.carousel', li, key2);
			});


		});

	});

}

function carousel(list) {
	list = JSON.parse(list);
	var allSymbols = [];

	_.each(list, function (value, key) {
		var container = 'ciq-' + value;
		var settings = portalSettings.items[value];
		var containerObject = $('#' + container);

		allSymbols = _.union(allSymbols, settings.symbolList);
		containerObject.addClass('ciq-mkt-ticker').css('width', '100%');

	});

	PortalCore.addStyleSheet('https://cdnjs.cloudflare.com/ajax/libs/OwlCarousel2/2.1.6/assets/owl.carousel.css');
	//PortalCore.addStyleSheet(cssUrl + 'modules/carousel.css');

	allSymbols = _.uniq(_.map(allSymbols, 0));
	dataSources[portalSettings.dataSource].fetchQuotes(allSymbols, carouselCallback, list);

	require(['modules/quote'], function () {
		//quoteSymbolList = _.union(quoteSymbolList, allSymbols);
		quoteSymbolList[_.join(list)] = allSymbols;
		quoteDependencyList[_.join(list)] = {
			quoteCallback: carouselCallback,
			extraParams: list
		};
		updateQuote();
	});
}