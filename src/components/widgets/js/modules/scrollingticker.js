window.stSymbolList = [];
window.stContainerList = {};


var scrollingTickerCallback = function (err, quoteData, list) {
	require(['owl'], function () {

		_.each(list, function (value, key) {
			var container = 'ciq-' + value;
			var settings = defaultSettings.items[value];
			var containerObject = $('#' + container);
			var carouselDiv = $('#' + 'owl-' + container);
			if (!carouselDiv.length) {
				var carouselDiv = $('<div>').attr('id', 'owl-' + container).addClass('owl-carousel owl-theme').css('width', '100%');
				containerObject.append(carouselDiv);
				carouselDiv.owlCarousel({
					loop: true,
					autoplay: true,
					autoplaySpeed: 2000,
					/*autoplayTimeout: 2000,*/
					//autoplayTimeout:Number.MAX_VALUE,
					autoplayHoverPause: false,
					responsive: {
						0: {
							items: 1
						},
						400: {
							items: 2
						},
						600: {
							items: 3
						},
						800: {
							items: 4
						},
						1000: {
							items: 5
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
					li = $('<div>').addClass('sample-tick-more item').append('<div class="ciq-tick-name"></div><div class="ciq-tick-price"></div><div class="ciq-tick-change"></div>').attr('id', id).addClass(id); 
					newItem = true;
				}
				
				var d = quoteData[symbol[0]];
				if (!d) d = quoteData[symbol[0].substring(1)];
				if (!d) d = quoteData[symbol[0].split(':')[1]];
				if (!d) return;
				//if (d == null || d.Symbol == null) return;
				//container.style.display = "";
				_.each(li, function(value) {
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

function scrollingticker(list) {
	list = JSON.parse(list);
	var allSymbols = [];

	_.each(list, function (value, key) {
		var container = 'ciq-' + value;
		var settings = defaultSettings.items[value];
		var containerObject = $('#' + container);

		allSymbols = _.union(allSymbols, settings.symbolList);
		containerObject.addClass('ciq-mkt-ticker').css('width', '100%');

	});

	/*var refreshRate = portalSettings.quoteRefreshRate;
	if (defaultSettings.quoteRefreshRate) refreshRate = defaultSettings.quoteRefreshRate;

	function updateQuote() {
		dataSources[portalSettings.dataSource].fetchQuotes(_.uniq(_.map(allSymbols, 0)), scrollingTickerCallback, list);
		setTimeout(updateQuote, refreshRate * 1000);
	}
	updateQuote();*/



	PortalCore.addStyleSheet('https://cdnjs.cloudflare.com/ajax/libs/OwlCarousel2/2.1.6/assets/owl.carousel.css');
	//PortalCore.addStyleSheet(cssUrl + 'modules/scrollingticker.css');
	
	allSymbols = _.uniq(_.map(allSymbols, 0));
	dataSources[portalSettings.dataSource].fetchQuotes(allSymbols, scrollingTickerCallback, list);
	
	require(['modules/quote'], function() {
		//quoteSymbolList = _.union(quoteSymbolList, allSymbols);
		quoteSymbolList[_.join(list)] = allSymbols;
		quoteDependencyList[_.join(list)]={
			quoteCallback: scrollingTickerCallback,
			extraParams: list
		};
		updateQuote();
	});
}