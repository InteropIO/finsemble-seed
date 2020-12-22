verifyAccess();

// check if user has access to this feature:
if (!userSettings.portal.markets) {
	document.write('This Feature is not enabled for your account.');
	$("body").css("visibility", "");
	throw new Error('<p>This portal page is not enabled on this account</p>');
}

var customSettings = {};
sArr = queryStringValues("customsettings", location.search);
if (sArr.length) {
	settingsText = $.base64.atob(sArr[0]);
	try {
		var settingsDecoded = JSON.parse(settingsText);
		customSettings = settingsDecoded;
		if (customSettings.marketsPage) { //this is to allow for customsettings for all pages in one object
			customSettings = customSettings.marketsPage;
		}
	} catch (err) {
		console.log("Invalid custom settings");
	}
}

//menu
buildNavigation();


// visible items
var visibleItems = {};
var wArr = queryStringValues("sec", location.hash);
if (wArr.length) {
	var wArrItemToSecArrayMap = {
		"nav": "navigation",
		"srch": "search",
		"tm": "time",
		"ind": "markets",
		"tkr": "tickers",
		//"tkr2": "hovercharts",
		"n": "headlines",
		"ad": "movers",
		"sp": "sectors",
		"r": "rates"
	}
	_.forEach(wArr, function (value) {
		visibleItems[wArrItemToSecArrayMap[value]] = true;
	});
	var nodisc = queryStringValues("nodisc", location.hash);
	if (!nodisc.length) {
		visibleItems['disclaimer'] = true;
	}
} else {
	visibleItems = portalSettings.items;
	_.forEach(defaultSettings.items, function (value, key) {
		visibleItems[key] = value;
	});
	if (customSettings && customSettings.items) {
		_.forEach(customSettings.items, function (value, key) {
			visibleItems[key] = value;
		});
	}
}

var visibleItemToClassMap = {
	"navigation": "ciq-navbar",
	"search": "ciq-nav-quote",
	"time": "ciq-current-time",
	"markets": "ciq-mkt-indices",
	"tickers": "ciq-mkt-ticker",
	//"tkr2": "ciq-more-info",
	"headlines": "ciq-news",
	"movers": "ciq-top-adv-decl",
	"sectors": "ciq-sector-perf",
	"rates": "ciq-rates-col",
	"events": "ciq-events-col",
	"disclaimer": "ciq-footer"
}

var visibleKeys = _.keys(_.pickBy(visibleItems, function (value) {
	return value
})); //keys for all items where value is true
var allKeys = _.keys(visibleItemToClassMap);

_.forEach(allKeys, function (value) {
	$('.' + visibleItemToClassMap[value]).css('display', 'none');
})

_.forEach(_.intersection(visibleKeys, allKeys), function (value) {
	$('.' + visibleItemToClassMap[value]).css('display', '');
})

var PageLimits = {
	marketHeadlines: 10,
	advanceDecliners: 10,
	sectors: 9,
	movers: 3,
	events: 50,
	rates: 5,
	rateItems: 6,
	axisLines: 7,
	searchResults: 50
};

// MarketCharts
var indexNames = [];
var indexSymbols = [];
var indexTimes = [];

if (visibleItems['markets']) {
	// Get from settings
	if (customSettings.markets && customSettings.markets.charts) {
		_.forEach(customSettings.markets.charts, function (value) {
			indexNames.push(value[0]);
			indexSymbols.push(value[1]);
			if (value[2]) indexTimes.push(value[2]);
			else indexTimes.push(1); //delayed by default
		});
	} else if (getStyle('.ciq-index-names', 'content')) { // Get from CSS
		indexNames = getSymbolList("ciq-index-names");
		indexSymbols = getSymbolList("ciq-index-list");
		indexTimes = getSymbolList("ciq-index-times");
	} else { // Get defaults
		_.forEach(defaultSettings.markets.charts, function (value) {
			indexNames.push(value[0]);
			indexSymbols.push(value[1]);
			if (value[2]) indexTimes.push(value[2]);
			else indexTimes.push(1); //delayed by default
		});
	}
}

// Tickers
var tickerNames = [];
var tickerSymbols = [];
var tickerTimes = [];

if (visibleItems['tickers']) {
	if (customSettings.tickers && customSettings.tickers.quotes) {
		_.forEach(customSettings.tickers.quotes, function (value) {
			tickerNames.push(value[0]);
			tickerSymbols.push(value[1]);
			if (value[2]) tickerTimes.push(value[2]);
			else tickerTimes.push(1); //delayed by default
		});
	} else if (getStyle('.ciq-ticker-names', 'content')) { // Get from CSS
		tickerNames = getSymbolList("ciq-ticker-names");
		tickerSymbols = getSymbolList("ciq-ticker-list");
		tickerTimes = getSymbolList("ciq-ticker-times");
	} else { // Get Defaults
		_.forEach(defaultSettings.tickers.quotes, function (value) {
			tickerNames.push(value[0]);
			tickerSymbols.push(value[1]);
			if (value[2]) tickerTimes.push(value[2]);
			else tickerTimes.push(1); //delayed by default
		});
	}
}

PageLimits.charts = indexNames.length;
PageLimits.tickers = tickerNames.length;

// URL For Quote Links
var quoteURL = getQuoteURL();

// News Images
var showImages = true;
if (customSettings.headlines && typeof customSettings.headlines.showImages !== 'undefined') {
	showImages = customSettings.headlines.showImages;
} else if (getStyle(".news-images", "display")) {
	showImages = getStyle(".news-images", "display") != 'none';
} else {
	if (defaultSettings.headlines.showImages === false) {
		showImages = false;
	}
}

function getPriorityNumberProperty(cssSettingNameValueArray, jsSettingName) {
	if (_.isFinite(customSettings[jsSettingName])) chartRefreshRate = customSettings[jsSettingName];
	else if (_.isFinite(Number(getStyle(cssSettingNameValueArray[0], cssSettingNameValueArray[1])))) chartRefreshRate = getStyle(cssSettingNameValueArray[0], cssSettingNameValueArray[1]);
	else if (_.isFinite(defaultSettings[jsSettingName])) chartRefreshRate = defaultSettings[jsSettingName];
	else if (_.isFinite(portalSettings[jsSettingName])) chartRefreshRate = portalSettings[jsSettingName];
}

var chartRefreshRate = getPriorityNumberProperty([".chart-refresher", "z-index"], 'chartRefreshRate');
if (isNaN(chartRefreshRate)) chartRefreshRate = 0;
if (chartRefreshRate) chartRefreshRate = Math.max(10, chartRefreshRate); //minimum 10 second refresh rate

var newsRefreshRate = getPriorityNumberProperty([".news-refresher", "z-index"], 'newsRefreshRate');
if (isNaN(newsRefreshRate)) newsRefreshRate = 0;
if (newsRefreshRate) newsRefreshRate = Math.max(10, newsRefreshRate); //minimum 10 second refresh rate

if (customSettings.headlines && customSettings.headlines.count) PageLimits.marketHeadlines = customSettings.headlines.count;
else if (defaultSettings.headlines && defaultSettings.headlines.count) PageLimits.marketHeadlines = defaultSettings.headlines.count;

if (customSettings.movers && customSettings.movers.count) PageLimits.advanceDecliners = customSettings.movers.count;
else if (defaultSettings.movers && defaultSettings.movers.count) PageLimits.advanceDecliners = defaultSettings.movers.count;

if (customSettings.sectors && customSettings.sectors.axisLines) PageLimits.axisLines = customSettings.sectors.axisLines;
else if (defaultSettings.sectors && defaultSettings.sectors.axisLines) PageLimits.axisLines = defaultSettings.sectors.axisLines;


var myScroll = {};

function loaded() {
	if (visibleItems['events']) {
		myScroll.eventScroll = new IScroll('.ciq-events', {
			mouseWheel: true,
			interactiveScrollbars: true,
			scrollbars: 'custom'
		});
	}
	if (visibleItems['headlines']) {
		myScroll.articleScroll = new IScroll('.ciq-article-content', {
			mouseWheel: true,
			interactiveScrollbars: true,
			scrollbars: 'custom'
		});
	}
	if (visibleItems['search']) {
		myScroll.searchWizardScroll = new IScroll('.ciq-search-results', {
			mouseWheel: true,
			interactiveScrollbars: true,
			scrollbars: 'custom',
			tap: true
		});
	}
}

var carouselOffset = 0;

jQuery.noConflict();
(function ($) {

	$.fn.addExternalStyleSheet(function () {
		//Search results
		if (visibleItems['search']) {
			for (var r = 1; r < PageLimits.searchResults; r++) {
				$('.ciq-search ul').first().append($('.ciq-search li').first().clone());
			}
		}

		//Market Indices
		if (visibleItems['markets']) {
			for (var r = 1; r < PageLimits.charts; r++) {
				$('.ciq-mkt-indices ul').first().append($('.ciq-mkt-indices li').first().clone(true));
			}
		}

		// Quote Carousel JS (goes with the scrollbox plugin we are replacing)
		if (visibleItems['tickers']) {
			for (var r = 1; r < PageLimits.tickers; r++) {
				$('.ciq-tick-wrapper ul').first().append($('.ciq-tick-wrapper li').first().clone(true));
			}

			$(function () {
				$('.ciq-tick-wrapper').scrollbox({
					direction: 'horizontal',
					switchItems: 3,
					autoPlay: false,
					distance: "auto" //470
				});
				$('#slide-backward').on("click", function () {
					$('.ciq-tick-wrapper').trigger('backward');
					carouselOffset -= 3;
					return false;
				});
				$('#slide-forward').on("click", function () {
					$('.ciq-tick-wrapper').trigger('forward');
					carouselOffset += 3;
					return false;
				});
			});

			// Show the more info div for quotes carousel on hover 
			$("li.sample-tick-more").hover(function (event) {
					if ($('.ciq-tick-wrapper')[0].scrollLeft) return false;
					if ($(this).position().left + $(this).width() > $('.ciq-tick-wrapper').width()) return false;
					$(".ciq-overview .ciq-more-info").addClass("active");
					var accumWidth = parseInt($(".btn.prev").css("width"));
					var self = this;
					$("li.sample-tick-more").each(function (index, elem) {
						if (elem === self) {
							$(".ciq-overview .ciq-more-info").css("left", accumWidth + "px");
							if ($(elem).attr("moreInfoData"))
								repopulateMoreInfo($(".ciq-overview .ciq-more-info")[0], JSON.parse($(elem).attr("moreInfoData")));
						}
						accumWidth += parseInt($(elem).css("width"));
					});
				},
				function () {
					$('.ciq-overview .ciq-more-info').removeClass("active");
				});

			//forward/backward arrows on carousel
			$.fn.showCarouselArrow = function () {
				var bodyWidth = parseInt($("body").css("width"), 10);
				$("li.sample-tick-more").each(function (index, elem) {
					bodyWidth -= parseInt($(elem).css("width"), 10);
					if (bodyWidth < 0) {
						$("#slide-backward").css("visibility", "");
						$("#slide-forward").css("visibility", "");
						return;
					}
				});
			};

			//resize carousel width
			$.fn.resizeCarousel = function () {
				var bodyWidth = parseInt($("body").css("width"), 10);
				var newWrapperWidth = (bodyWidth - $('#slide-backward').width() - $('#slide-forward').width() - 10) + 'px';
				$('.ciq-tick-wrapper').css("width", newWrapperWidth);
				$('.ciq-mkt-ticker').css("width", "100%");
			};

			$(window).resize(function () {
				$('.ciq-mkt-ticker').css("width", 0);
				setTimeout($("body").resizeCarousel, 100);
				setTimeout($("body").showCarouselArrow, 100);
			});
		}

		// Market Headlines
		if (visibleItems['headlines']) {
			for (var r = 1; r < PageLimits.marketHeadlines; r++) {
				$('.ciq-news ul').first().append($('.ciq-news li').first().clone(true));
			}
			$('.ciq-news li').first().addClass('active');
		}


		// Advance/Decline bars
		if (visibleItems['movers']) {
			for (var r = 1; r < PageLimits.advanceDecliners; r++) {
				$('.ciq-interact ul').first().append($('.ciq-interact li').first().clone());
			}
			$('.ciq-interact li').first().addClass('active');

			// Advance/Decline Active state
			$(".ciq-interact li").on("click touchend", function () {
				if ($(this).hasClass("active")) return false;
				$(".ciq-interact li").removeClass("active");
				$(this).addClass("active");
				renderSection($(".ciq-article")[0], Market.Viewables.AdvanceDeclines);
			});
		}

		if (visibleItems['sectors']) {
			// Sector Bars
			for (var r = 1; r < PageLimits.sectors; r++) {
				$($('.ciq-sector')[0].parentNode).append($('.ciq-sector').first().clone());
			}
			for (var r1 = 1; r1 < PageLimits.movers; r1++) {
				$('.ciq-sector .ciq-table').append($('.ciq-sector .ciq-table li').first().clone());
			}
			for (var r2 = 1; r2 < PageLimits.axisLines; r2++) {
				var line = $('.ciq-axis div').first().clone();
				line.css('left', (100 * r2 / (PageLimits.axisLines - 1)) + "%");
				$('.ciq-axis').append(line);
			}

			// Toggle Interval tabs for Market Area
			$(".ciq-range-nav li").on("click touchend", function () {
				if ($(this).hasClass("active")) return false;
				$(".ciq-range-nav li").removeClass("active");
				$(this).addClass("active");
				toggleSectorPerformanceDisplay($(this).attr("range"));
				if ($(this).attr("range")) renderSection($(".ciq-sectors")[0], Market.Viewables.SectorPerformanceHistorical[$(this).attr("range")]);
				else renderSection($(".ciq-sectors")[0], Market.Viewables.SectorPerformance);
			});

			// Show the more info div for sectors on hover - needs positioning and population
			{
				var handlerIn = function (e) {
						//if(!$(".ciq-range-nav li.active").attr("range")){
						e.preventDefault();
						$(this).find('div.ciq-more-info').addClass('active');
						//}
					},
					handlerOut = function (e) {
						e.preventDefault();
						$(".ciq-sectors li").find('div.ciq-more-info').removeClass('active');
					};
				$(".ciq-sectors li").on({
					mouseenter: handlerIn,
					mouseleave: handlerOut,
					touchstart: handlerIn,
					touchend: handlerOut
				});
			}

		}


		// Events
		if (visibleItems['events']) {
			for (var r = 1; r < PageLimits.events; r++) {
				$('.ciq-events ul').first().append($('.ciq-events li').first().clone());
			}
		}

		// Rates
		if (visibleItems['rates']) {
			for (var r = 1; r < PageLimits.rateItems; r++) {
				$('.ciq-rates .ciq-box .ciq-table').first().append($('.ciq-rate-percentage').first().clone());
			}

			// Rates tabs Active state
			$(".ciq-tabs li").on("click touchend", function () {
				if ($(this).hasClass("active")) return false;
				$(".ciq-tabs li").removeClass("active");
				$(this).addClass("active");
				renderSection($(".ciq-rates")[0], Market.Viewables.Rates);
			});
		}

		// Cancel hover effect on touch action
		{
			var handlerIn = function (e) {
					$(".hoverable").addClass('unhoverable');
					$(".hoverable").removeClass('hoverable');
				},
				handlerOut = function (e) {
					$(".unhoverable").addClass('hoverable');
					$(".unhoverable").removeClass('unhoverable');
				};
			$("body").on({
				touchstart: handlerIn,
				mouseenter: handlerOut
			});
		}

		$.fn.bindInview = function () {
			if (visibleItems['movers']) {
				$('.ciq-advance-decline').bind('inview', function (event, visible) {
					if (visible == true) {
						// element is now visible in the viewport
						$(this).addClass('show');

						$(".ciq-advance-decline .ciq-value").addClass("show");
						$(".ciq-advance-decline .ciq-percent").addClass("show");

						$(".ciq-interact .ciq-bar").each(function () {
							$(this).css({
								width: $(this).attr("barwidth")
							});
						});
					}
				});
			}

			if (visibleItems['sectors']) {

				$('.ciq-sectors').bind('inview', function (event, visible) {
					if (visible == true) {
						// element is now visible in the viewport
						$(this).addClass('show');

						$(".ciq-sectors .ciq-value").addClass("show");
						$(".ciq-sectors .ciq-percent").addClass("show");

						$(".ciq-sectors .ciq-bar").each(function () {
							$(this).css({
								width: $(this).attr("barwidth")
							});
						});
					}
				});
			}

			$(this).trigger("scroll");
		};

		//set up menu hrefs - TODO
		if (visibleItems['navigation']) {
			$(".ciq-menu-item").each(function () {
				$(this).attr("href", pageName($(this).html().toLowerCase()));
			});
		}

		if (visibleItems['search']) {
			$(".ciq-search form").attr("action", pageName("quotes"));
		}

		if (visibleItems['tickers']) {
			$.fn.showCarouselArrow();
			$("#image_iframe").attr("src", "chart/image-chart.html");
		}

		$.fn.loadScripts(["js/ciq-widget-symbol-search.js"],
			function () {
				$("body").css("visibility", "");
			});

	});

})(jQuery);

var Market = {
	Viewables: {
		Indices: {},
		Ticker: {},
		Headlines: {},
		AdvanceDeclines: {},
		SectorPerformance: {},
		SectorPerformanceHistorical: {},
		Events: {},
		Rates: {}
	},
	Statistics: { //last updated times
		Indices: null,
		Ticker: null,
		Headlines: null,
		AdvanceDeclines: null,
		SectorPerformance: null,
		SectorPerformanceHistorical: null,
		Events: null,
		Rates: null
	},
	Template: {
		Data: {
			Symbol: null,
			Ticker: null,
			Last: null,
			Previous: null,
			Change: null,
			PercentChange: null,
			IsOpen: null,
			Delay: null,
			ListIndex: null,
			SortKey: null
		},
		Headline: {
			Symbol: null,
			Date: null,
			Source: null,
			Subject: null,
			Image: null,
			Summary: null,
			Url: null,
			SortKey: null
		}
	},
	Flags: {
		DATA: 1,
		HEADLINE: 2
	},
	seed: function (object, newSection, iterations, flags) {
		for (var i = 0; i < iterations; i++) {
			this.set(object, newSection, JSON.parse(JSON.stringify(this.Template)), i, flags);
		};
	},
	unseed: function (object, newSection) {
		if (!newSection) return;
		if (typeof (object) == "undefined") return;
		if (typeof (object[newSection]) == "undefined") return;
		object[newSection] = {};
	},
	set: function (object, newSection, template, i, flags) {
		if (!(flags & this.Flags.DATA)) delete template.Data;
		if (!(flags & this.Flags.HEADLINE)) delete template.Headline;
		if (typeof (object) == "undefined") object = {};
		if (newSection) {
			if (typeof (object[newSection]) == "undefined") object[newSection] = {};
			object[newSection][i] = template;
		} else {
			object[i] = template;
		}
	},
	unset: function (object, newSection, i) {
		this.set(object, newSection, {}, i);
	}
};


var v = Market.Viewables;
if (visibleItems['markets']) Market.seed(v.Indices, null, PageLimits.charts, Market.Flags.DATA);
if (visibleItems['tickers']) Market.seed(v.Ticker, null, PageLimits.tickers, Market.Flags.DATA);
if (visibleItems['headlines']) Market.seed(v.Headlines, null, PageLimits.marketHeadlines, Market.Flags.HEADLINE);
if (visibleItems['movers']) Market.seed(v.AdvanceDeclines, null, PageLimits.advanceDecliners, Market.Flags.DATA | Market.Flags.HEADLINE);
if (visibleItems['sectors']) {
	Market.seed(v.SectorPerformance, null, PageLimits.sectors, Market.Flags.DATA);
	for (var sector in v.SectorPerformance) {
		Market.seed(v.SectorPerformance[sector], "Movers", PageLimits.movers, Market.Flags.DATA);
	}
	Market.seed(v.SectorPerformanceHistorical, "52W", PageLimits.sectors, Market.Flags.DATA);
	Market.seed(v.SectorPerformanceHistorical, "26W", PageLimits.sectors, Market.Flags.DATA);
	Market.seed(v.SectorPerformanceHistorical, "13W", PageLimits.sectors, Market.Flags.DATA);
	Market.seed(v.SectorPerformanceHistorical, "4W", PageLimits.sectors, Market.Flags.DATA);
	Market.seed(v.SectorPerformanceHistorical, "1W", PageLimits.sectors, Market.Flags.DATA);
}
if (visibleItems['events']) Market.seed(v.Events, null, PageLimits.events, Market.Flags.HEADLINE);
if (visibleItems['rates']) {
	Market.seed(v.Rates, "Mortgage", PageLimits.rateItems, Market.Flags.DATA);
	//Market.seed(v.Rates,"Savings",PageLimits.rateItems,Market.Flags.DATA); //these are stale
	Market.seed(v.Rates, "Treasury", PageLimits.rateItems, Market.Flags.DATA);
	Market.seed(v.Rates, "Commercial", PageLimits.rateItems, Market.Flags.DATA);
	Market.seed(v.Rates, "LIBOR", PageLimits.rateItems, Market.Flags.DATA);
}

function clearSectionData(section) {
	if (!section) return;
	if (!section.Data) {
		for (var s in section) {
			clearSectionData(section[s]);
		}
	}
	for (var d in section.Data) {
		delete section.Data[d];
	}
}

function clearSectionHeadline(section) {
	if (!section) return;
	if (!section.Headline) {
		for (var s in section) {
			clearSectionHeadline(section[s]);
		}
	}
	for (var h in section.Headline) {
		delete section.Headline[h];
	}
}

function setSectionData(section, data, reverse) {
	if (!data) return;
	var t = null;
	var nextAvailable = null;
	for (var s in section) {
		if (!section[s].Data.Symbol && (reverse || nextAvailable == null)) {
			if (section[s].Headline && section[s].Headline.Symbol != null && section[s].Headline.Symbol != data.Symbol) continue;
			nextAvailable = s;
		}
		if (section[s].Data.ListIndex != data.ListIndex) continue;
		if (section[s].Data.Symbol != data.Symbol) continue;
		t = section[s];
		break;
	}
	if (!t) {
		if (nextAvailable == null) return;
		t = section[nextAvailable];
	}
	t.Data.Symbol = data.Symbol;
	t.Data.Ticker = data.Ticker;
	t.Data.Last = data.Last;
	t.Data.Previous = data.Previous;
	t.Data.IsOpen = data.IsOpen;
	t.Data.Delay = data.Delay;
	t.Data.ListIndex = data.ListIndex;
	t.Data.SortKey = data.SortKey;
	if (!isNaN(t.Data.Last) && !isNaN(t.Data.Previous)) {
		t.Data.Change = t.Data.Last - t.Data.Previous;
		t.Data.PercentChange = 100 * (t.Data.Last / t.Data.Previous - 1);
	}
}

function setSectionHeadline(section, headline, reverse) {
	if (!headline) return;
	if (!headline.Symbol) headline.Symbol = headline.Url;
	var t = null;
	var nextAvailable = null;
	for (var s in section) {
		if (!section[s].Headline.Symbol && (reverse || nextAvailable == null)) {
			if (section[s].Data && section[s].Data.Symbol != null && section[s].Data.Symbol != headline.Symbol) continue;
			nextAvailable = s;
		}
		if (section[s].Headline.Symbol != headline.Symbol) continue;
		t = section[s];
		break;
	}
	if (!t) {
		if (nextAvailable == null) return;
		t = section[nextAvailable];
	}
	t.Headline.Symbol = headline.Symbol;
	t.Headline.Date = headline.Date;
	t.Headline.Source = headline.Source;
	t.Headline.Subject = headline.Subject;
	t.Headline.Image = headline.Image;
	t.Headline.Summary = headline.Summary;
	t.Headline.Url = headline.Url;
	t.Headline.SortKey = headline.SortKey;
}

function sortSection(section, flag) {
	var arr = [];
	for (var s in section) {
		var inserted = false;
		for (var a = 0; a < arr.length; a++) {
			if (inserted) continue;
			if (flag & Market.Flags.DATA) {
				sortField = (section[s].Data.SortKey != null ? "SortKey" : "PercentChange");
				if (section[s].Data[sortField] > arr[a].Data[sortField]) {
					arr.splice(a, 0, section[s]);
					inserted = true;
				}
			} else if (flag & Market.Flags.HEADLINE) {
				sortField = (section[s].Headline.SortKey != null ? "SortKey" : "Date");
				if (section[s].Headline[sortField] > arr[a].Headline[sortField]) {
					arr.splice(a, 0, section[s]);
					inserted = true;
				}
			}
		}
		if (!inserted) arr.push(section[s]);
	}
	var count = 0;
	for (var s in section) {
		if (arr[count]) section[s] = arr[count];
		else section[s] = null;
		count++;
	}
}

function renderSection(container, section) {
	var labels = container.getElementsByClassName("ciq-label");
	var bars = container.getElementsByClassName("ciq-bar");
	var percents = container.getElementsByClassName("ciq-percent");
	var values = container.getElementsByClassName("ciq-value");
	var movers = container.getElementsByClassName("ciq-more-info");
	var axis = container.getElementsByClassName("ciq-axis");
	var article = container.getElementsByClassName("ciq-news-head");
	var event = container.getElementsByClassName("ciq-event-head");
	var ratePercentage = container.getElementsByClassName("ciq-rate-percentage");
	var tickers = container.getElementsByClassName("ciq-tick-name");
	var indices = container.getElementsByClassName("ciq-index");
	if (indices.length) {
		for (var i = 0; i < indices.length; i++) {
			if (!section[i] || !section[i].Data || !section[i].Data.Symbol) continue;
			container.style.display = "";
			repopulateMoreInfo(indices[section[i].Data.ListIndex], section[i].Data);
		}
	}
	if (tickers.length) {
		for (var i = 0; i < tickers.length; i++) {
			if (!section[i]) continue;
			var li = tickers[i].parentNode;
			var d = section[(tickers.length + i + (carouselOffset % tickers.length)) % tickers.length].Data;
			if (d == null || d.Symbol == null) continue;
			container.style.display = "";
			li.children[0].innerHTML = d.Symbol;
			if (d.Last == null || isNaN(d.Last)) li.children[1].innerHTML = d.Last;
			else li.children[1].innerHTML = Math.abs(d.Last).toFixed(Math.max(2, d.Last.toString().indexOf(".") == -1 ? 0 : d.Last.toString().split(".")[1].length));
			if (d.PercentChange == null) li.children[2].innerHTML = "N/A";
			else if (isNaN(d.PercentChange)) li.children[2].innerHTML = d.PercentChange;
			else li.children[2].innerHTML = (d.Change >= 0 ? "+" : "-") + Math.abs(d.PercentChange).toFixed(2) + "%";
			appendClass(li.children[2], d.Change > 0 ? "up" : (d.Change < 0 ? "down" : ""));
			li.setAttribute("moreInfoData", JSON.stringify(d));
			if (d.Delay) setDelay(li, d.Delay);
			jQuery("body").showCarouselArrow();
		}
	}
	var axisTexts = null;
	if (axis.length) {
		axisTexts = axis[0].getElementsByClassName("ciq-axis-text");
	}
	var axisMax = 0;
	for (var i = 0; i < labels.length; i++) {
		if (!section[i]) continue;
		var d = section[i].Data;
		if (!d.Symbol) continue;
		if (labels.length) labels[i].children[0].innerHTML = d.Symbol;
		if (values.length) {
			appendClass(values[i], "shift");
			if (isNaN(d.Last)) values[i].innerHTML = d.Last;
			else values[i].innerHTML = Math.abs(d.Last).toFixed(2);
		}
		if (percents.length) {
			appendClass(percents[i], "shift");
			if (isNaN(d.PercentChange)) percents[i].innerHTML = d.PercentChange;
			else percents[i].innerHTML = Math.abs(d.PercentChange).toFixed(2) + "%";
		}
		if (bars.length) {
			unappendClass(bars[i], "up");
			unappendClass(bars[i], "down");
			appendClass(bars[i], d.Change > 0 ? "up" : (d.Change < 0 ? "down" : ""));
			axisMax = Math.max(axisMax, Math.abs(d.PercentChange));
		}
		if (movers.length) {
			for (var ss in section) {
				if (section[ss].Data.Symbol == v.SectorPerformance[i].Data.Symbol) {
					var moverItems = movers[ss].getElementsByTagName("li");
					for (var mi = 0; mi < moverItems.length; mi++) {
						var m = v.SectorPerformance[i].Movers[mi].Data;
						var mic = moverItems[mi].children;
						mic[0].innerHTML = "";
						mic[1].innerHTML = "";
						mic[2].children[1].innerHTML = "";
						var arrow = mic[2].getElementsByClassName("arrow")[0];
						unappendClass(arrow, "up");
						unappendClass(arrow, "down");
						if (m.Symbol) {
							moverItems[mi].style.display = "";
							if (mi == 0) movers[ss].style.display = "";
							mic[0].innerHTML = m.Symbol;
							if (isNaN(d.Last)) mic[1].innerHTML = m.Last;
							else mic[1].innerHTML = m.Last.toFixed(2);
							appendClass(arrow, m.Change > 0 ? "up" : (m.Change < 0 ? "down" : ""));
							mic[2].children[1].innerHTML = Math.abs(m.PercentChange).toFixed(2) + "%";
						} else {
							moverItems[mi].style.display = "none";
							if (mi == 0) movers[ss].style.display = "none";
						}
					}
					break;
				}
			}
		}
	}
	var mult = 1;
	while (axisMax > 0 && mult * axisMax < 10) mult *= 10;
	var axisDivision = Math.ceil(mult * axisMax / (PageLimits.axisLines - 1)) / mult;
	if (axisDivision == 0) axisDivision = 5; //arbitrary value
	if (axisTexts) {
		for (var ad = 0; ad < axisTexts.length; ad++) {
			axisTexts[ad].innerHTML = (axisDivision * ad).toFixed(Math.log(mult) / Math.log(10));
		}
	}
	if (bars.length) {
		for (var i = 0; i < labels.length; i++) {
			if (!section[i]) continue;
			var d = section[i].Data;
			var barwidth = 100 * Math.abs(d.PercentChange) / (axisDivision * (PageLimits.axisLines - 1));
			bars[i].setAttribute("barwidth", barwidth + "%");
			if (percents.length) {
				if (hasClass(percents[i], "show")) bars[i].style.width = barwidth + "%";
				if (barwidth > 25) unappendClass(percents[i], "shift");
			}
			if (values.length && barwidth > 25) unappendClass(values[i], "shift");
		}
	}
	if (article.length) {
		article = article[0].parentNode;
		var lis;
		var isMainHeadlines = container.getElementsByClassName("ciq-news-main").length;
		if (isMainHeadlines) {
			lis = container.getElementsByTagName("li");
		} else {
			lis = container.parentNode.getElementsByTagName("li");
		}
		var dates = container.getElementsByClassName("date");
		var times = container.getElementsByClassName("time");
		var sources = container.getElementsByClassName("ciq-news-source");
		var images = container.getElementsByClassName("ciq-news-img");
		var heads = container.getElementsByClassName("ciq-news-head");
		var bodies = container.getElementsByClassName("ciq-news-body");
		var links = container.getElementsByClassName("ciq-news-link");
		var quotes = container.getElementsByClassName("ciq-news-quote");
		var hasActive = false;
		for (var hi = 0; hi < lis.length; hi++) {
			var h = section[hi].Headline;
			var isActive = ((h.Url && activeStory == h.Url) || (!activeStory && hi == 0) || (!isMainHeadlines && hasClass(lis[hi], "active")));
			if (!isMainHeadlines && !isActive) continue;
			if (isMainHeadlines && isActive) {
				appendClass(lis[hi], "active");
				hasActive = true;
			}
			if (!isActive) {
				unappendClass(lis[hi], "active");
			}
			var index = hi;
			if (!isMainHeadlines) index = 0;

			if (!h.Date) {
				if (dates.length) dates[index].innerHTML = "";
				if (times.length) times[index].innerHTML = "";
				if (sources.length) sources[index].innerHTML = "";
				if (images.length) images[index].style.display = "none";
				if (heads.length) {
					if (!isMainHeadlines) heads[index].children[0].innerHTML = "[No news for this security]";
					heads[index].children[0].onclick = function () {
						return false;
					};
					heads[index].children[0].style.cursor = "default";
				}
				if (bodies.length) bodies[index].style.display = "none";
				if (links.length) links[index].children[0].style.display = "none";
				if (quotes.length) {
					if (h.Symbol && userSettings.portal.overview) {
						quotes[index].children[0].href = quoteURL + (location.search ? location.search + '&' : '?') + "sym=" + encodeURIComponent(h.Symbol);
						quotes[index].children[0].innerText = "Quote for " + h.Symbol; //IE8
						quotes[index].children[0].textContent = "Quote for " + h.Symbol;
					} else {
						quotes[index].children[0].href = "javascript:void(0);";
						quotes[index].children[0].innerText = ""; //IE8
						quotes[index].children[0].textContent = "";
					}
				}
				continue;
			}
			if (h.Date.getFullYear() == today.getFullYear() && h.Date.getMonth() == today.getMonth() && h.Date.getDate() == today.getDate()) {
				dates[index].innerHTML = "Today";
				if (isMainHeadlines) {
					appendClass(dates[index].parentNode, "today");
				}
			} else {
				dates[index].innerHTML = h.Date.toDateString().split(" ").splice(1, 2).join(" ");
				if (isMainHeadlines) {
					unappendClass(dates[index].parentNode, "today");
				}
			}
			if (times.length) times[index].innerHTML = ampmTime(h.Date);

			sources[index].innerHTML = h.Source.split(" - ")[0];
			if (images.length) {
				images[index].style.display = "none";
				if (h.Image && showImages) {
					images[index].children[0].href = h.Url;
					images[index].children[0].target = "_blank";
					var img = images[index].children[0].children[0];
					img.onload = function () {
						if (this.naturalWidth > 24 && this.naturalHeight > 24) this.parentNode.parentNode.style.display = "";
					}
					img.onerror = function () {
						this.parentNode.parentNode.style.display = "none";
					}
					img.src = h.Image;
					if (img.naturalWidth > 24 && img.naturalHeight > 24) images[index].style.display = "";
				}
			}
			heads[index].children[0].style.display = "";
			heads[index].children[0].style.cursor = "";
			heads[index].children[0].onclick = null;
			if (isActive) heads[index].children[0].href = h.Url;
			else heads[index].children[0].href = "javascript:void(0);";
			heads[index].children[0].target = "_blank";
			heads[index].children[0].innerText = h.Subject; //IE8
			heads[index].children[0].textContent = h.Subject;
			if (h.Summary) bodies[index].innerHTML = h.Summary;
			bodies[index].style.display = "";
			links[index].children[0].style.display = "";
			links[index].children[0].style.display = "";
			links[index].children[0].href = h.Url;
			links[index].children[0].target = "_blank";
			if (quotes.length && userSettings.portal.overview) {
				quotes[index].children[0].href = quoteURL + (location.search ? location.search + '&' : '?') + "sym=" + encodeURIComponent(h.Symbol);
				quotes[index].children[0].innerText = "Quote for " + h.Symbol; //IE8
				quotes[index].children[0].textContent = "Quote for " + h.Symbol;
			}
		}
		if (isMainHeadlines && !hasActive && activeStory) {
			activeStory = null;
			appendClass(lis[0], "active");
			heads[0].children[0].href = h.Url;
		}
		setTimeout(function () {
			if (myScroll && myScroll.articleScroll) myScroll.articleScroll.refresh();
		}, 0);
		appendClass(container, "loaded");
	}
	if (event.length) {
		var dates = container.getElementsByClassName("ciq-date");
		var descs = container.getElementsByClassName("ciq-event-desc");
		for (var hi = 0; hi < event.length; hi++) {
			var h = section[hi].Headline;
			if (!h.Date) {
				dates[hi].parentNode.style.display = "none";
				continue;
			}
			dates[hi].parentNode.style.display = "";
			if (h.Date.getFullYear() == today.getFullYear() && h.Date.getMonth() == today.getMonth() && h.Date.getDate() == today.getDate()) {
				dates[hi].innerHTML = "Today, ";
			} else {
				dates[hi].innerHTML = h.Date.toDateString().split(" ").splice(1, 2).join(" ") + ", ";
			}
			dates[hi].innerHTML += ampmTime(h.Date);
			descs[hi].innerHTML = h.Summary;
			event[hi].children[0].innerHTML = h.Subject;
			if (!h.Url) {
				//h.Url="javascript:void(0);";
				event[hi].children[0].onclick = event[hi].children[0].ontouchend = function (h) {
					return function () {
						var myDesc = this.parentNode.parentNode.getElementsByClassName("ciq-event-desc")[0];
						for (var d = 0; d < descs.length; d++) {
							if (descs[d] == myDesc && !hasClass(myDesc.parentNode, "active")) {
								if (!h.Summary) {
									myDesc.innerHTML = "Getting description...";
									fetchEventDetail(h.Symbol, function (description) {
										h.Summary = description;
										if (!h.Summary) h.Summary = "-- No Description Available --";
										myDesc.innerHTML = h.Summary;
										setTimeout(function () {
											if (myScroll && myScroll.eventScroll) myScroll.eventScroll.refresh();
										}, 0);
									});
								}
								appendClass(myDesc.parentNode, "active");
							} else unappendClass(descs[d].parentNode, "active");
						}
						setTimeout(function () {
							if (myScroll && myScroll.eventScroll) myScroll.eventScroll.refresh();
						}, 0);
						return false;
					};
				}(h);
			}
			event[hi].children[0].href = h.Url;
			event[hi].children[0].target = "_blank";
		}
		setTimeout(function () {
			if (myScroll && myScroll.eventScroll) myScroll.eventScroll.refresh();
		}, 0);
	}
	if (ratePercentage.length) {
		var activeTab = null;
		var tabs = container.getElementsByClassName("ciq-tabs")[0].children[0].children;
		for (var a = 0; a < tabs.length; a++) {
			if (tabs[a].className.indexOf("active") > -1) activeTab = tabs[a].innerHTML;
		}
		for (var r in section) {
			if (r != activeTab) continue;
			var pcts = section[r];
			for (var pct = 0; pct < ratePercentage.length; pct++) {
				var p = pcts[pct].Data;
				var r = ratePercentage[pct].children;
				if (!p.Symbol) {
					r[0].children[0].innerHTML = "";
					r[0].children[1].innerHTML = "";
					r[1].innerHTML = "";
					r[2].innerHTML = "";
					continue;
				}
				if (isNaN(p.Last)) r[1].innerHTML = p.Last;
				else r[1].innerHTML = Math.abs(p.Last).toFixed(activeTab == "LIBOR" ? 5 : 2) + "%";
				if (isNaN(p.Previous)) r[2].innerHTML = p.Previous;
				else r[2].innerHTML = Math.abs(p.Previous).toFixed(activeTab == "LIBOR" ? 5 : 2) + "%";
				r[0].children[0].innerHTML = (p.Change > 0 ? "&#8593;" : (p.Change < 0 ? "&#8595;" : "&#8208;"));
				r[0].children[1].innerHTML = p.Symbol;
			}
		}
	}
}

function setDelay(element, delay) {
	unappendClass(element, "eod");
	unappendClass(element, "delayed");
	unappendClass(element, "realtime");
	appendClass(element, delay);
}



var symbol = ""; {

	var searchURL = quoteURL;
	if (!userSettings.portal.overview && userSettings.portal.chart) searchURL = pageName("chart") + (location.search ? location.search + '&' : '?') + "sym=" + encodeURIComponent(symbol);
	var search = document.getElementsByClassName('ciq-search')[0];
	search.parentNode.getElementsByTagName("FORM")[0].action = searchURL;
}

function repopulateMoreInfo(container, data) {
	var ciqSymName = container.getElementsByClassName("ciq-sym-name");
	if (ciqSymName.length) {
		ciqSymName[0].innerHTML = data.Symbol + ("&nbsp;");
		if (data.Delay) setDelay(ciqSymName[0], data.Delay);
	}
	var change = container.getElementsByClassName("ciq-sym-change")[0];
	change.children[0].style.display = "";
	unappendClass(change.children[0], "up");
	unappendClass(change.children[0], "down");
	appendClass(change.children[0], data.Change > 0 ? "up" : "down");
	if (data.Change == 0) change.children[0].style.display = "none";
	var text1 = "N/A",
		text2 = "N/A";
	if (data.Last != null && !isNaN(data.Last)) container.getElementsByClassName("ciq-sym-price")[0].innerHTML = data.Last.toFixed(Math.max(2, data.Last.toString().indexOf(".") == -1 ? 0 : data.Last.toString().split(".")[1].length));
	else container.getElementsByClassName("ciq-sym-price")[0].innerHTML = "N/A";
	if (data.Change != null && !isNaN(data.Change)) {
		if (data.Change != 0 && Math.abs(data.Change) < .01) text1 = data.Change.toFixed(4);
		else text1 = data.Change.toFixed(2);
	}
	if (data.PercentChange != null && !isNaN(data.PercentChange)) text2 = Math.abs(data.PercentChange).toFixed(2);
	change.children[1].innerHTML = " " + text1 + " (" + text2 + "%)";
	if (container == document.querySelectorAll(".ciq-more-info.bottom")[0]) {
		var thumb = container.getElementsByClassName("ciq-chart-thumb")[0];
		var image = thumb.getElementsByTagName("IMG")[0];
		for (var c = 0; c < thumb.children.length; c++) {
			thumb.children[c].style.display = "none";
		}
		if (data.Image) {
			image.src = data.Image;
			image.style.display = "";
		} else if (data.CanvasId) {
			var canvas = document.getElementById("canvas_" + data.CanvasId);
			if (canvas) canvas.style.display = "block";
		}
	}
}

function toggleSectorPerformanceDisplay(override) {
	var marketClosed = true;
	for (var sp in v.SectorPerformance) {
		if (override || v.SectorPerformance[sp].Data.IsOpen) {
			marketClosed = false;
			break;
		}
	}
	if (marketClosed) {
		document.getElementsByClassName("ciq-sectors-premarket")[0].style.display = "block";
		document.getElementsByClassName("ciq-sectors")[0].style.display = "none";
	} else {
		document.getElementsByClassName("ciq-sectors-premarket")[0].style.display = "none";
		document.getElementsByClassName("ciq-sectors")[0].style.display = "block";
	}
}

var today;

function setTodayDate() {
	today = new Date();
	today.setMilliseconds(0);
}
setTodayDate();



var flags = Market.Flags.DATA | Market.Flags.HEADLINE;

var activeStory = null;

for (var init = 0; init = PageLimits.charts.length; init++) v.Indices[0].Data.SortKey = -init;
for (var init = 0; init = PageLimits.tickers.length; init++) v.Ticker[0].Data.SortKey = -(init + 3);

if (visibleItems['markets'] || visibleItems['tickers']) {
	var chartPoll = function () {
		setTodayDate();
		fetchQuotes(v.Indices, v.Ticker, PageLimits.charts, PageLimits.tickers, flags, function () {
			if (visibleItems['markets']) {
				sortSection(v.Indices, Market.Flags.DATA);
				renderSection(document.getElementsByClassName("ciq-mkt-indices")[0], v.Indices);
				Market.Statistics.Indices = new Date();
				if (!visibleItems['tickers']) getCharts(v.Indices);
			}
			if (visibleItems['tickers']) {
				sortSection(v.Ticker, Market.Flags.DATA);
				renderSection(document.getElementsByClassName("ciq-mkt-ticker")[0], v.Ticker);
				Market.Statistics.Ticker = new Date();
				if (!visibleItems['markets']) getCharts(null, v.Ticker);
			}
			if (visibleItems['markets'] && visibleItems['tickers']) getCharts(v.Indices, v.Ticker);
			document.getElementsByClassName("ciq-current-time")[0].innerHTML = today.toDateString().replace(/ /, ", ") + ", " + ampmTimeTz(today);
		});
		if (chartRefreshRate > 0) setTimeout(chartPoll, 1000 * chartRefreshRate);
	};
	chartPoll();
}
if (visibleItems['headlines']) {
	var newsPoll = function (stream) {
		setTodayDate();
		var newHeadlines = {};
		Market.seed(newHeadlines, null, PageLimits.marketHeadlines, Market.Flags.HEADLINE);
		fetchMarketHeadlines(newHeadlines, PageLimits.marketHeadlines, flags, function (done) {
			if (!stream && !done) return;
			//sortSection(v.Headlines,Market.Flags.HEADLINE);
			renderSection(document.getElementsByClassName("ciq-news")[0], newHeadlines);
			if (done) {
				v.Headlines = newHeadlines;
				Market.Statistics.Headlines = new Date();
			}
		});
		if (newsRefreshRate > 0) setTimeout(newsPoll, 1000 * newsRefreshRate);
	};
	newsPoll(true);
}
if (visibleItems['movers']) fetchAdvanceDeclines(v.AdvanceDeclines, PageLimits.advanceDecliners / 2, flags, false, function (flags) {
	var marketClosed = true;
	for (var ad in v.AdvanceDeclines) {
		if (v.AdvanceDeclines[ad].Data.Symbol) {
			marketClosed = false;
			break;
		}
	}
	if (marketClosed) {
		document.getElementsByClassName("ciq-advance-decline")[0].innerHTML = "U.S. Markets not open";
		jQuery("body").bindInview();
	} else {
		sortSection(v.AdvanceDeclines, Market.Flags.DATA);
		if (flags & Market.Flags.HEADLINE) renderSection(document.getElementsByClassName("ciq-article")[0], v.AdvanceDeclines);
		fetchAdvanceDeclines(v.AdvanceDeclines, PageLimits.advanceDecliners / 2, flags, true, function (flags) {
			if (flags & Market.Flags.DATA) renderSection(document.getElementsByClassName("ciq-interact")[0], v.AdvanceDeclines);
			Market.Statistics.AdvanceDeclines = new Date();
			jQuery("body").bindInview();
		});
	}
});

if (visibleItems['sectors']) fetchSectors(v.SectorPerformance, v.SectorPerformanceHistorical, PageLimits.sectors, PageLimits.movers, flags, function (historical) {
	if (!historical) toggleSectorPerformanceDisplay(false);
	sortSection(v.SectorPerformance, Market.Flags.DATA);
	renderSection(document.getElementsByClassName("ciq-sectors")[0], v.SectorPerformance);
	Market.Statistics.SectorPerformance = new Date();
	for (s in v.SectorPerformanceHistorical) {
		sortSection(v.SectorPerformanceHistorical[s], Market.Flags.DATA);
	}
	Market.Statistics.SectorPerformanceHistorical = new Date();
	jQuery("body").bindInview();
});

if (visibleItems['events']) fetchEvents(v.Events, PageLimits.events, flags, function () {
	sortSection(v.Events, Market.Flags.HEADLINE);
	renderSection(document.getElementsByClassName("ciq-events")[0], v.Events);
	Market.Statistics.Events = new Date();
});

if (visibleItems['rates']) fetchRates(v.Rates, PageLimits.rateItems, flags, function () {
	//sortSection(v.Events,Market.Flags.DATA);
	renderSection(document.getElementsByClassName("ciq-rates")[0], v.Rates);
	Market.Statistics.Rates = new Date();
});


function sectorSymbolTransform(item) {
	var sectorNames = ["Materials", "Energy", "Financials", "Industrials", "Technology", "Cons Staples", "Utilities", "Health Care", "Cons Discretionary"];
	var symbols = ["XLB", "XLE", "XLF", "XLI", "XLK", "XLP", "XLU", "XLV", "XLY"];
	if (item == "*") {
		return symbols.join(",");
	} else if (isNaN(item)) {
		for (var x = 0; x < sectorNames.length; x++) {
			if (item == sectorNames[x]) return symbols[x];
			else if (item == symbols[x]) return sectorNames[x];
		}
	} else if (item >= 0 && item < sectorNames.length) {
		return {
			"name": sectorNames[item],
			"symbol": symbols[item]
		};
	}
	return "";
}

function tickerSymbolAccessor(item, type, delay) {
	var metals = {
		"XAU": 1,
		"XAG": 1,
		"XPT": 1,
		"XPD": 1
	};
	var delays = {
		"0": "eod",
		"1": "delayed",
		"2": "realtime"
	};
	var names = indexNames.concat(tickerNames);
	var symbols = indexSymbols.concat(tickerSymbols);
	var times = indexTimes.concat(tickerTimes);
	if (item == "*") {
		var rc = [];
		for (var i = 0; i < symbols.length; i++) {
			var d = delays[times[i]];
			if (type == "INDEX") {
				if (symbols[i].indexOf(".IND") > 0 && (!delay || delay == d)) rc.push(i);
			} else if (type == "FOREX") {
				if (symbols[i].indexOf("^") == 0 && !metals[symbols[i].substr(1, 3)] && (!delay || delay == d)) rc.push(i);
			} else if (type == "METAL") {
				if (symbols[i].indexOf("^") == 0 && metals[symbols[i].substr(1, 3)] && (!delay || delay == d)) rc.push(i);
			} else if (type == "FUTURE") {
				if (symbols[i].indexOf("/") == 0 && (!delay || delay == d)) rc.push(i);
			} else if (type == "STOCK") {
				if (symbols[i].indexOf(".IND") <= 0 &&
					symbols[i].indexOf("^") != 0 &&
					symbols[i].indexOf("/") != 0 &&
					(!delay || delay == d)) rc.push(i);
			} else if ((type == null || type == "") && (!delay || delay == d)) {
				rc.push(i);
			}
		}
		return rc;
	} else if (isNaN(item)) {
		for (var x = 0; x < names.length; x++) {
			if (item == names[x] && x < symbols.length) return symbols[x];
			else if (item == symbols[x] && x < names.length) return names[x];
		}
	} else if (item >= 0 && item < names.length && item < symbols.length) {
		return {
			"name": names[item],
			"symbol": symbols[item],
			"delay": delays[times[item]]
		};
	}
	return null;
}

/*** chart generation ***/
var CanvasStore = {
	_canvases: {},
	newCanvas: function (cNo) {
		var w = document.getElementById('image_iframe').contentWindow;
		var canvas = w.document.createElement("canvas");
		canvas.style.visibility = "hidden";
		canvas.style.position = "absolute";
		canvas.style.top = "0px";
		document.body.appendChild(canvas);
		if (w.G_vmlCanvasManager) w.G_vmlCanvasManager.initElement(canvas);
		this._canvases[cNo] = canvas;
		canvas.id = "canvas_" + cNo;
		return cNo;
	},
	get: function (cNo) {
		return this._canvases[cNo];
	}
};

var chartsRetrieved = {};
var iframeReady = false;

function getCharts(mediums, smalls) {
	if (!iframeReady) {
		setTimeout(function () {
			return getCharts(mediums, smalls);
		}, 100);
		return;
	}
	var w = document.getElementById('image_iframe').contentWindow;
	var d = new Date();
	for (var indx in mediums) {
		if (mediums[indx].Data.Symbol) {
			var last = chartsRetrieved[mediums[indx].Data.ListIndex + "|medium"];
			var expireTime = 300000;
			if (chartRefreshRate > 0) expireTime = 1000 * chartRefreshRate;
			if (!last || last < d.getTime() - expireTime) { // old or never retrieved
				chartsRetrieved[mediums[indx].Data.ListIndex + "|medium"] = d.getTime();
				var width = document.querySelectorAll(".ciq-index .ciq-chart-thumb")[mediums[indx].Data.ListIndex].clientWidth;
				w.createChart({
					action: "shareChart",
					symbol: mediums[indx].Data.Ticker,
					size: "medium",
					delay: mediums[indx].Data.Delay,
					width: width,
					listindex: CanvasStore.newCanvas(mediums[indx].Data.ListIndex)
				});
				document.getElementsByClassName("ciq-index")[-mediums[indx].Data.SortKey].style.display = "block";
			}
		}
	}
	for (var indx in smalls) {
		if (smalls[indx].Data.Symbol) {
			var last = chartsRetrieved[smalls[indx].Data.ListIndex + "|small"];
			var expireTime = 300000;
			if (chartRefreshRate > 0) expireTime = 1000 * chartRefreshRate;
			if (!last || last < d.getTime() - expireTime) { // old or never retrieved
				chartsRetrieved[smalls[indx].Data.ListIndex + "|small"] = d.getTime();
				w.createChart({
					action: "shareChart",
					symbol: smalls[indx].Data.Ticker,
					size: "small",
					delay: smalls[indx].Data.Delay,
					listindex: CanvasStore.newCanvas(smalls[indx].Data.ListIndex)
				});
			}
		}
	}
}

function processChart(data) {
	if (data) {
		if (data.ready) iframeReady = true;
		else {
			var png = data.imageData;
			var id = data.l_index;
			if (data.size == "medium") {
				for (var indx in v.Indices) {
					if (data.l_index != v.Indices[indx].Data.ListIndex) continue;
					var indexArea = document.getElementsByClassName("ciq-index");
					var image = indexArea[v.Indices[indx].Data.ListIndex].getElementsByClassName("ciq-chart-thumb")[0].children[0];
					if (png) {
						image.src = image.alt = "";
						image.style.height = ""; //parseInt(image.getAttribute("height"),10)+"px";
						image.style.width = ""; //parseInt(image.getAttribute("width"),10)+"px";
						image.style.margin = "";
						image.src = png;
					} else if (id != null) {
						var w = document.getElementById('image_iframe').contentWindow;
						var container = w.document.getElementById("container_" + id);
						image.parentNode.replaceChild(container, image);
						container.style.visibility = container.style.width = container.style.position = container.style.top = "";
						var canvas = CanvasStore.get(id);
						canvas.style.visibility = canvas.style.position = canvas.style.top = "";
					}
					break;
				}
			} else {
				var tickers = document.getElementsByClassName("ciq-mkt-ticker")[0].getElementsByClassName("ciq-tick-name");
				for (var indx in v.Ticker) {
					if (data.l_index != v.Ticker[indx].Data.ListIndex) continue;
					if (png) {
						v.Ticker[indx].Data.Image = png;
					} else if (id) {
						v.Ticker[indx].Data.CanvasId = id;
					}
					tickers[(tickers.length + Number(indx) - (carouselOffset % tickers.length)) % tickers.length].parentNode.setAttribute("moreInfoData", JSON.stringify(v.Ticker[indx].Data));
					var canvas = CanvasStore.get(id);
					canvas.style.visibility = canvas.style.position = canvas.style.top = "";
					var oldCanvas = document.getElementById(canvas.id);
					var moreInfo = document.querySelectorAll(".ciq-more-info.bottom")[0];
					if (oldCanvas) {
						var display = getComputedStyle(oldCanvas).getPropertyValue("display");
						canvas.style.display = display;
						if (oldCanvas.parentNode == moreInfo.getElementsByClassName("ciq-chart-thumb")[0])
							moreInfo.getElementsByClassName("ciq-chart-thumb")[0].removeChild(oldCanvas);
						moreInfo.getElementsByClassName("ciq-chart-thumb")[0].appendChild(canvas);
						if (display != "none") repopulateMoreInfo(moreInfo, v.Ticker[indx].Data);
					} else {
						canvas.style.display = "none";
						moreInfo.getElementsByClassName("ciq-chart-thumb")[0].appendChild(canvas);
					}
					break;
				}
			}
		}
	}
}