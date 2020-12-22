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
		customSettings = customSettings.fundamentalsPage;
	} catch (err) {
		console.log("Invalid custom settings");
	}
}

// settings that are common between all the research pages
var subNavigation = defaultSettings.subNavigation;

defaultSettings = defaultSettings.fundamentalsPage;

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
		"co": "fundamentals"
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
	"fundamentals": "ciq-content"
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

		$.fn.loadScripts(["js/ciq-widget-symbol-search.js"],
			function () {
				$("body").css("visibility", "");
			});

	});

})(jQuery);


function get52WeekHTML(low, high, last) {
	var width = (100 * (Number(last) - Number(low)) / (Number(high) - Number(low))).toString() + "%";
	return '<div class="ciq-range"><div class="ciq-range-fill" style="width:' + width + '"><div class="ciq-range-tab"></div></div><div class="ciq-range-low"><span>' + low + '</span></div><div class="ciq-range-high"><span>' + high + '</span></div></div>';
}



var today;

function setTodayDate() {
	today = new Date();
	today.setMilliseconds(0);
}
setTodayDate();

var quoteURL = getQuoteURL();

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

var quoteRefreshRate = Number(getStyle(".quote-refresher", "z-index"));
if (isNaN(quoteRefreshRate)) quoteRefreshRate = 0;
var newsRefreshRate = Number(getStyle(".news-refresher", "z-index"));
if (isNaN(newsRefreshRate)) newsRefreshRate = 0;


function renderQuotes(d) {
		jQuery(jQuery('.ciq-quote-info')[0]).html('<div><div><div><h2>(<span>' + d.Symbol + '</span>) <span>' + d.Name + '</span></h2><p>' + ((d.Date && !isNaN(d.Date.getTime())) ?
			d.Date.toDateString().replace(/ /, ", ") + ", " + ampmTimeTz(d.Date) : '') + '</p></div><div><div class="ciq-sym-price">' + d.Last + '</div><div class="ciq-sym-change"><div>Today\'s Change</div><div><div class="arrow" id="ciq-quote-arrow"></div><strong>' + d.Change + '</strong> (<span>' + d.PercentChange + '</span>)</div></div></div></div></div>');

		jQuery('#ciq-quote-arrow').removeClass("up");
		jQuery('#ciq-quote-arrow').removeClass("down");
		jQuery('#ciq-quote-arrow').addClass(d.Change > 0 ? "up" : (d.Change < 0 ? "down" : ""));
}

function renderFundamentals(d) {
	var tables=[];
	var displayNames={};
	if (d.isMutual) {
		tables = defaultSettings.fundamentalsDisplay.fund;
		displayNames = defaultSettings.fundamentals.fund;
	} else if (d.isETF || d.isCEF) {
		tables = defaultSettings.fundamentalsDisplay.etf;
		displayNames = defaultSettings.fundamentals.etf;
	} else {
		tables = defaultSettings.fundamentalsDisplay.stock;
		displayNames = defaultSettings.fundamentals.stock;
	}
	var tableContainer = jQuery('#ciq-content');
		
	var fCount = 0;
	var exists = false;
	_.each(tables, function (tableDetails, tKey) {
		tableContainer.append('<h3>' + tableDetails[0] + '</h3>');
		_.each(tableDetails[1], function(table, tSubKey) {
			tableId = '#ciq-additional-table-' + tKey + '-' + tSubKey;
			if (!jQuery(tableId).length) {
				tableContainer.append('<div class="ciq-col ciq-quote-fundamental"><table id="ciq-additional-table-' + tKey + '-' + tSubKey + '" class="ciq-table"><tbody></tbody></table></div>');
				exists = false;
			} else {
				exists = true;
			}

			_.each(table, function (row) {
				if (!exists) {
					// special cases
					if (_.isObject(displayNames[row])) {
						switch (displayNames[row].Type) {
							case 'Ratio':
								d[row] = d[displayNames[row].Value1]/d[displayNames[row].Value2];
							case 'Range':
								d[row] = get52WeekHTML(d[displayNames[row].Value1],d[displayNames[row].Value2],d.Last);
						}
					} 
					jQuery(tableId + '  > tbody:last-child').append('<tr><td>' + (displayNames[row].TitleText?displayNames[row].TitleText:displayNames[row]) + '</td><td id="ciq-additional-row' + fCount + '">' + d[row] + '</td></tr>');
				} else {
					jQuery('#ciq-additional-row' + fCount).html(d[row]);
				}
				fCount++;
			});	
		});	
	});
	jQuery('#ciq-content').css('display','');
}

//if (visibleItems['quote'] || visibleItems['fundamentals'] || visibleItems['chart'] || visibleItems['summary']) {
var quotePoll = function () {
	setTodayDate();
	fetchDetailedQuotev2(symbol, defaultSettings.fundamentals, renderQuotes, renderFundamentals);
	if (quoteRefreshRate > 0) setTimeout(quotePoll, 1000 * quoteRefreshRate);
};
quotePoll();
//}



//setTimeout("console.log(JSON.stringify(Quote))",5000);