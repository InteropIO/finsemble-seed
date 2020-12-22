verifyAccess();

// check if user has access to this feature:
if (!userSettings.portal.company) {
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
		customSettings = customSettings.companyPage;
	} catch (err) {
		console.log("Invalid custom settings");
	}
}

// settings that are common between all the research pages
var subNavigation = defaultSettings.subNavigation;

defaultSettings = defaultSettings.companyPage;

// check if any common settings need to be overwritten
if (defaultSettings.subNavigation) subNavigation = defaultSettings.subNavigation;

//menu
buildNavigation();

// visible items
var visibleItems = {};
var wArr = queryStringValues("sec", location.hash);
if (wArr.length) {
	var wArrItemToSecArrayMap = {
		"nav": "navigation",
		"srch": "search",
		"q": "quote",
		"co": "overview",
		"ci": "contact",
		"ai": "additional"
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
	"quote": "ciq-quote-info",
	"overview": "ciq-quote-feature",
	"contact": "ciq-quote-contact",
	"additional": "ciq-quote-additional"
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
	quote: 1,
	securityHeadlines: 3,
	events: 1, //4,
	searchResults: 50
};

if (visibleItems['search']) {
	var myScroll = {};
	myScroll.searchWizardScroll = new IScroll('.ciq-search-results', {
		mouseWheel: true,
		interactiveScrollbars: true,
		scrollbars: 'custom',
		tap: true
	});
}

jQuery.noConflict();
(function ($) {

	$.fn.addExternalStyleSheet(function () {

		//Search results
		if (visibleItems['search']) {
			for (var r = 1; r < PageLimits.searchResults; r++) {
				$('.ciq-search ul').first().append($('.ciq-search li').first().clone());
			}
		}

		//set up menu hrefs
		$(".ciq-menu-item").each(function () {
			$(this).attr("href", pageName($(this).html().toLowerCase()));
		});

		$.fn.loadScripts(["js/ciq-widget-symbol-search.js"],
			function () {
				$("body").css("visibility", "");
			});

	});

})(jQuery);


var Quote = {
	Viewables: {
		Quote: {}
	},
	Statistics: { //last updated times
		Quote: null
	},
	Template: {
		Data: {
			Symbol: null,
			Last: null,
			Previous: null,
			Change: null,
			PercentChange: null,
			Volume: null,
			VolumePrevious: null,
			VolumeChange: null,
			VolumePercentChange: null,
			Date: null,
			FiftyTwoWeekHigh: null,
			FiftyTwoWeekLow: null,
			MarketCap: null,
			ShortInterest: null,
			PERatio: null,
			EPS: null,
			DividendRate: null,
			DividendYield: null,
			Name: null,
			SummaryDescription: null,
			Description: null,
			Address1: null,
			Address2: null,
			City: null,
			State: null,
			Zip: null,
			Country: null,
			Phone: null,
			Email: null,
			Website: null,
			CEO: null,
			Manager: null,
			Employees: null,
			Sector: null,
			Industry: null,
			FundObjective: null,
			NetAssets: null,
			ExpenseRatio: null,
			Yield: null,
			WeightingTopTen: null,
			Turnover: null,
			InitialInvestment: null,
			Closed: null,
			Family: null,
			Class: null,
			Category: null,
			isETF: false,
			isCEF: false
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

var v = Quote.Viewables;
Quote.seed(v.Quote, null, PageLimits.quote, Quote.Flags.DATA);

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
		if (section[s].Data.Symbol != data.Symbol) continue;
		t = section[s];
		break;
	}
	if (!t) {
		if (nextAvailable == null) return;
		t = section[nextAvailable];
	}
	for (var d in data) {
		t.Data[d] = data[d];
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
	for (var h in headline) {
		t.Headline[h] = headline[h];
	}
}

function sortSection(section, flag) {
	var arr = [];
	for (var s in section) {
		var inserted = false;
		for (var a = 0; a < arr.length; a++) {
			if (inserted) continue;
			if (flag & Quote.Flags.DATA) {
				sortField = (section[s].Data.SortKey != null ? "SortKey" : "PercentChange");
				if (section[s].Data[sortField] > arr[a].Data[sortField]) {
					arr.splice(a, 0, section[s]);
					inserted = true;
				}
			} else if (flag & Quote.Flags.HEADLINE) {
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

function doFilter() {}

function get52WeekHTML(low, high, last) {
	var width = (100 * (Number(last) - Number(low)) / (Number(high) - Number(low))).toString() + "%";

	return '<div class="ciq-range"><div class="ciq-range-fill" style="width:' + width + '"><div class="ciq-range-tab"></div></div><div class="ciq-range-low"><span>' + low + '</span></div><div class="ciq-range-high"><span>' + high + '</span></div></div>';

}

function renderSection(container, section, startingPoint) {
	if (startingPoint == null) startingPoint = lastStartingPoint;
	lastStartingPoint = startingPoint;
	if (symbol == "") return;
	isETF |= (section[0] && section[0].Data && section[0].Data.isETF);
	isCEF |= (!isMutual(symbol) && section[0] && section[0].Data && section[0].Data.isCEF);

	switch (container) {
	case 'quote':
		var d = section[0].Data;
		jQuery(jQuery('.ciq-quote-info')[0]).html('<div><div><div><h2>(<span>' + d.Symbol + '</span>) <span>' + d.Name + '</span></h2><p>' + ((d.Date && !isNaN(d.Date.getTime())) ?
			d.Date.toDateString().replace(/ /, ", ") + ", " + ampmTimeTz(d.Date) : '') + '</p></div><div><div class="ciq-sym-price">' + d.Last + '</div><div class="ciq-sym-change"><div>Today\'s Change</div><div><div class="arrow" id="ciq-quote-arrow"></div><strong>' + d.Change + '</strong> (<span>' + d.PercentChange + '</span>)</div></div></div></div></div>');

		jQuery('#ciq-quote-arrow').removeClass("up");
		jQuery('#ciq-quote-arrow').removeClass("down");
		jQuery('#ciq-quote-arrow').addClass(d.Change > 0 ? "up" : (d.Change < 0 ? "down" : ""));

		break;
	case 'overview':
		var d = section[0].Data;
		jQuery('#ciq-summary-title').html(isMutual(symbol) || isCEF || isETF ? 'Fund Profile' : 'Company Information');
		jQuery('#ciq-summary').html('<p class="lead">' + d.Description + '</p>');

		break;
	case 'contact':
		var d = section[0].Data;
		var tables = [];
		
		tables = [
			[
				["Address", d.Address1 + ', ' + d.Address2 + ', ' + d.City + ', ' + d.State + ', ' + d.Zip + ', ' + d.Country],
				["Phone", d.Phone],
				["Website", d.Website],
				["Email", d.Email]
			]
		];
		
		var tableContainer = jQuery('#ciq-quote-contact');

		var fCount = 0;
		var exists = false;
		_.each(tables, function (table, tKey) {
			tableId = '#ciq-contact-table-' + tKey;
			if (!jQuery(tableId).length) {
				tableContainer.append('<div class="ciq-col ciq-quote-fundamental"><table id="ciq-contact-table-' + tKey + '" class="ciq-table"><tbody></tbody></table></div>');
				exists = false;
			} else {
				exists = true;
			}

			_.each(table, function (row) {
				if (!exists) {
					jQuery(tableId + '  > tbody:last-child').append('<tr><td>' + row[0] + '</td><td id="ciq-contact-row' + fCount + '">' + row[1] + '</td></tr>');
				} else {
					jQuery('#ciq-contact-row' + fCount).html(row[1]);
				}
				fCount++;
			});
		});

		break;
	case 'additional':

		var d = section[0].Data;
		var tables = [];
		if (isETF || isCEF || isMutual(symbol)) {
			tables = [
				[
					["Manager", d.Manager],
					["Fund Family", d.Family],
					["Share Class", d.Class],
					["Category", d.Category]
				]
			];
		} else {
			tables = [
				[
					["CEO", d.CEO],
					["Employees", d.Employees],
					["Sector", d.Sector],
					["Industry", d.Industry]
				]
			];
		}

		var tableContainer = jQuery('#ciq-quote-additional');
			
		var fCount = 0;
		var exists = false;
		_.each(tables, function (table, tKey) {
			tableId = '#ciq-additional-table-' + tKey;
			if (!jQuery(tableId).length) {
				tableContainer.append('<div class="ciq-col ciq-quote-fundamental"><table id="ciq-additional-table-' + tKey + '" class="ciq-table"><tbody></tbody></table></div>');
				exists = false;
			} else {
				exists = true;
			}

			_.each(table, function (row) {
				if (!exists) {
					jQuery(tableId + '  > tbody:last-child').append('<tr><td>' + row[0] + '</td><td id="ciq-additional-row' + fCount + '">' + row[1] + '</td></tr>');
				} else {
					jQuery('#ciq-additional-row' + fCount).html(row[1]);
				}
				fCount++;
			});
		});

		break;
	}


}

var today;

function setTodayDate() {
	today = new Date();
	today.setMilliseconds(0);
}
setTodayDate();

var quoteURL = getQuoteURL();

var isETF = false;
var isCEF = false;

function isMutual(symbol) {
	if (isETF || isCEF) return true;
	if (symbol.length < 5 || symbol.length > 6) return false;
	if (symbol[symbol.length - 1] != "X") return false;
	for (var j = 0; j < symbol.length; j++) {
		if (symbol[j] < 'A' || symbol[j] > 'Z') return false;
	}
	return true;
}

function isForex(symbol) {
	if (symbol.length < 6 || symbol.length > 7) return false;
	if (symbol.indexOf("^") == 0 && symbol.length == 6) return false;
	if (symbol[symbol.length - 1] == "X") return false;
	for (var j = symbol.indexOf("^") + 1; j < symbol.length; j++) {
		if (symbol[j] < 'A' || symbol[j] > 'Z') return false;
	}
	return true;
}

function isIndex(symbol) {
	if (symbol.indexOf(".IND") > 0) return true;
	if (symbol.indexOf("^") == 0 && symbol.length != 7) return true;
	return false;
}

function isDailyOnly(symbol) {
	return isMutual(symbol) || (isIndex(symbol) && hasClass(document.body, "eod"));
}


function activateStartingRange(symbol) {
	var ranges = document.querySelectorAll(".ciq-range-nav li");
	var range = null;
	var isDaily = isDailyOnly(symbol);
	for (var r = 0; r < ranges.length; r++) {
		range = ranges[r].getAttribute("range");
		if (isDaily) {
			if (range == "52W") break;
		} else if (range == "1D") break;
	}
	if (r < ranges.length) appendClass(ranges[r], "active");
}

//var showChartQuote = getStyle(".chart-quote", "display") != "none";
//var showImages = getStyle(".news-images", "display") != "none";
var chartRefreshRate = Number(getStyle(".chart-refresher", "z-index"));
if (isNaN(chartRefreshRate)) chartRefreshRate = 10;
var symbol = ""; {
	var sArr = queryStringValues("sym", location.search);
	if (sArr.length) symbol = sArr[0].toUpperCase();
	if (symbol == "") symbol = getSymbolList("quote-default").join("");
	/*var advChart = document.getElementsByClassName("ciq-more-link");
	if (advChart.length) advChart[0].href += "?sym=" + encodeURIComponent(symbol);*/

	buildList('.ciq-quote-filter', subNavigation);

}

var flags = Quote.Flags.DATA | Quote.Flags.HEADLINE;
var quoteRefreshRate = Number(getStyle(".quote-refresher", "z-index"));
if (isNaN(quoteRefreshRate)) quoteRefreshRate = 0;
var newsRefreshRate = Number(getStyle(".news-refresher", "z-index"));
if (isNaN(newsRefreshRate)) newsRefreshRate = 0;
var lastStartingPoint = null;
var activeStory = null;
var isChartPage = window.location.href.indexOf(pageName("chart")) > -1;

//var isNoFundamentals = isChartPage || window.location.href.indexOf(pageName("news")) > -1;
var getFundamentals = visibleItems['chart'] || visibleItems['fundamentals'];
/*if (isIndex(symbol) || isForex(symbol)) isNoFundamentals = true;
else if (isMutual(symbol) && !fundInfo) isNoFundamentals = true;*/

if (isIndex(symbol) || isForex(symbol)) getFundamentals = false;

/*var getDetailedQuote = getStyle(".quotes-access", "display").indexOf("none") == -1 &&
	(getStyle(".mn-quotes-overview", "display") != "none" || getStyle(".mn-quotes-news", "display") != "none" || getStyle(".mn-quotes-company", "display") != "none");
if (isChartPage) {
	getDetailedQuote = getStyle(".chart-access", "display").indexOf("none") == -1 && showChartQuote;
}*/

//if (visibleItems['quote'] || visibleItems['fundamentals'] || visibleItems['chart'] || visibleItems['summary']) {
var quotePoll = function () {
	setTodayDate();
	fetchDetailedQuote(v.Quote, v.Quote, symbol, PageLimits.quote, PageLimits.industry, flags, function () {
		if (visibleItems['quote']) renderSection('quote', v.Quote);
		if (visibleItems['overview']) renderSection('overview', v.Quote);
		if (visibleItems['contact']) renderSection('contact', v.Quote);
		if (visibleItems['additional']) renderSection('additional', v.Quote);
		Quote.Statistics.Quote = new Date();
	});
	if (quoteRefreshRate > 0) setTimeout(quotePoll, 1000 * quoteRefreshRate);
};
quotePoll();
//}



//setTimeout("console.log(JSON.stringify(Quote))",5000);