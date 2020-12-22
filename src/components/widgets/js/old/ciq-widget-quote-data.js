verifyAccess();

// check if user has access to this feature:
if (!userSettings.portal.overview) {
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
		customSettings = customSettings.overviewPage;
	} catch (err) {
		console.log("Invalid custom settings");
	}
}

// settings that are common between all the research pages
var subNavigation = defaultSettings.subNavigation;

defaultSettings = defaultSettings.overviewPage;

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
		"ch": "chart",
		"fe": "fundamentals",
		"n": "headlines",
		"d": "summary"
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
	"chart": "ciq-quote-chart",
	"headlines": "ciq-quote-news",
	"fundamentals": "ciq-quote-fundamental-events",
	"events": "ciq-quote-events",
	"summary": "ciq-description"
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

		//Market Headlines
		if (visibleItems['headlines']) {
			for (var r = 1; r < PageLimits.securityHeadlines; r++) {
				$('.ciq-quote-news ul').first().append($('.ciq-quote-news li').first().clone(true));
			}
		}

		//Events
		if (visibleItems['events']) {
			for (var r = 1; r < PageLimits.events; r++) {
				$('.ciq-quote-events .ciq-table').first().append($('.ciq-quote-events tr').first().clone());
			}
		}

		//Toggle Interval tabs for Market Area
		if (visibleItems['chart']) {
			$(".ciq-range-nav li").on("click touchend", function () {
				if ($(this).hasClass("active")) return false;
				$(".ciq-range-nav li").removeClass("active");
				$(this).addClass("active");
				setChartRange($(this).attr("range"));
			});


			function setChartRange(value) {
				if (value == '1W') value = '5D';
				else if (value == '4W') value = '1M';
				else if (value == '13W') value = '3M';
				else if (value == '52W') value = '1Y';
				var iframe = $("iframe.chart-iframe");
				if (!iframe) {
					//setTimeout(function(value){ return function(){setRange(value)};}(value), 100);
					return;
				}
				var contentWindow = iframe[0].contentWindow;
				contentWindow.setRange(value);
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
		Quote: {},
		QuoteHistorical: {},
		QuoteHistoricalCache: {},
		Events: {},
		Headlines: {}
	},
	Statistics: { //last updated times
		Quote: null,
		QuoteHistorical: null,
		Events: null,
		Headlines: null
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

if (visibleItems['quote'] || visibleItems['chart']) {
	Quote.seed(v.Quote, null, PageLimits.quote, Quote.Flags.DATA);
	Quote.seed(v.QuoteHistorical, "52W", PageLimits.quote, Quote.Flags.DATA);
	Quote.seed(v.QuoteHistorical, "26W", PageLimits.quote, Quote.Flags.DATA);
	Quote.seed(v.QuoteHistorical, "13W", PageLimits.quote, Quote.Flags.DATA);
	Quote.seed(v.QuoteHistorical, "4W", PageLimits.quote, Quote.Flags.DATA);
	Quote.seed(v.QuoteHistorical, "1W", PageLimits.quote, Quote.Flags.DATA);
	Quote.seed(v.QuoteHistorical, "1D", PageLimits.quote, Quote.Flags.DATA);
}
if (visibleItems['headlines']) Quote.seed(v.Headlines, null, PageLimits.securityHeadlines, Quote.Flags.HEADLINE);
if (visibleItems['events']) Quote.seed(v.Events, null, PageLimits.events, Quote.Flags.HEADLINE);

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
	setFundOrEquity();

	switch (container) {
	case 'quote':
		var d = section[0].Data;
		jQuery(jQuery('.ciq-quote-info')[0]).html('<div><div><div><h2>(<span>' + d.Symbol + '</span>) <span>' + d.Name + '</span></h2><p>' + ((d.Date && !isNaN(d.Date.getTime())) ?
			d.Date.toDateString().replace(/ /, ", ") + ", " + ampmTimeTz(d.Date) : '') + '</p></div><div><div class="ciq-sym-price">' + d.Last + '</div><div class="ciq-sym-change"><div>Today\'s Change</div><div><div class="arrow" id="ciq-quote-arrow"></div><strong>' + d.Change + '</strong> (<span>' + d.PercentChange + '</span>)</div></div></div></div></div>');

		jQuery('#ciq-quote-arrow').removeClass("up");
		jQuery('#ciq-quote-arrow').removeClass("down");
		jQuery('#ciq-quote-arrow').addClass(d.Change > 0 ? "up" : (d.Change < 0 ? "down" : ""));

		break;
	case 'summary':
		var d = section[0].Data;
		jQuery('#ciq-summary').html('<h3>' + (isMutual(symbol) || isCEF || isETF ? 'Fund Profile' : 'Company Information') + '</h3><p class="summary">' + (isMutual(symbol) || isCEF || isETF? d.Description : d.SummaryDescription) + '</p>');

		break;
	case 'fundamental-table':
		var d = section[0].Data;
		var tables = [];
		if (isETF || isCEF) {
			tables = [
				[
					["52 Week Range", get52WeekHTML(d.FiftyTwoWeekLow, d.FiftyTwoWeekHigh, d.Last)],
					["Net Assets", d.NetAssets],
					["Prospectus Net Expense Ratio", d.ExpenseRatio],
					["Yield (TTM)", d.Yield]
				],
				[
					["Top Ten Holdings Weighting", d.WeightingTopTen],
					["Turnover Ratio", d.Turnover],
					["Volume", d.Volume]
				]
			];
		} else if (isMutual(symbol)) {
			tables = [
				[
					["52 Week Range", get52WeekHTML(d.FiftyTwoWeekLow, d.FiftyTwoWeekHigh, d.Last)],
					["Net Assets", d.NetAssets],
					["Prospectus Net Expense Ratio", d.ExpenseRatio],
					["Yield (TTM)", d.Yield]
				],
				[
					["Top Ten Holdings Weighting", d.WeightingTopTen],
					["Turnover Ratio", d.Turnover],
					["Initial Investment", d.InitialInvestment],
					["Closed to New Investors", d.Closed ? "Y" : "N"]
				]
			];
		} else {
			tables = [
				[
					["52 Week Range", get52WeekHTML(d.FiftyTwoWeekLow, d.FiftyTwoWeekHigh, d.Last)],
					["Market Cap", d.MarketCap],
					["Volume", d.Volume],
					["Short Interest", d.ShortInterest]
				],
				[
					["Dividend", d.DividendRate],
					["Yield", d.DividendYield],
					["EPS (TTM)", d.EPS],
					["PE Ratio", d.PERatio]
				]
			];
		}

		tableContainer = jQuery('#ciq-fundamentals-tables');

		var fCount = 0;
		var exists = false;
		_.each(tables, function (table, tKey) {
			tableId = '#ciq-fundamental-table-' + tKey;
			if (!jQuery(tableId).length) {
				tableContainer.append('<div class="ciq-col ciq-quote-fundamental"><table id="ciq-fundamental-table-' + tKey + '" class="ciq-table"><tbody></tbody></table></div>');
				exists = false;
			} else {
				exists = true;
			}

			_.each(table, function (row) {
				if (!exists) {
					jQuery(tableId + '  > tbody:last-child').append('<tr><td>' + row[0] + '</td><td id="ciq-fundamental-row' + fCount + '">' + row[1] + '</td></tr>');
				} else {
					jQuery('#ciq-fundamental-row' + fCount).html(row[1]);
				}
				fCount++;
			});
		});

		tableContainer.append('<div class="ciq-col ciq-quote-events noMF noIndex noFX noETF"><h3>Upcoming Events</h3><div class="no-news">No events</div><table class="ciq-table"><tr><td class="ciq-date"></td><td class="ciq-event-head"></td></tr></table></div><div class="clear"></div>');

		break;
	case 'chart-nav':
		var ranges = jQuery('#chart-span .ciq-sym-change');
		for (var r = 0; r < ranges.length; r++) {
			if (ranges[r].parentNode.tagName == "LI") {
				var key = ranges[r].parentNode.getAttribute("range");
				if (section[key]) {
					var d = section[key][0].Data;
					if (v.QuoteHistoricalCache[key]) {
						d.Previous = v.QuoteHistoricalCache[key];
					}
					if (!d.Last) d.Last = v.Quote[0].Data.Last;
					d.Change = d.Last - d.Previous;
					d.PercentChange = 100 * d.Change / d.Previous;
					unappendClass(ranges[r].children[0], "up");
					unappendClass(ranges[r].children[0], "down");
					appendClass(ranges[r].children[0], d.Change > 0 ? "up" : (d.Change < 0 ? "down" : ""));
					if (d.Change == null || isNaN(d.Change)) ranges[r].children[1].innerHTML = d.Change;
					else ranges[r].children[1].innerHTML = Math.abs(d.Change).toFixed(d.Last < 1 || (Math.abs(d.Change) < .01 && d.PercentChange) ? 4 : 2);
					if (d.Previous) {
						if (d.PercentChange == null || isNaN(d.PercentChange)) ranges[r].children[2].innerHTML = d.PercentChange;
						else ranges[r].children[2].innerHTML = Math.abs(d.PercentChange).toFixed(2) + "%";
					}
					if (key == "1D" && d.Date) {
						var testDate = new Date();
						var todayLi = document.getElementsByClassName("ciq-range-nav")[0].getElementsByTagName("LI")[0];
						if (d.Date.getTime() + 8 * 60 * 60 * 1000 < testDate.getTime() || d.Date.getDay() < testDate.getDay()) { //last tick over 8 hours ago or previous day of week
							todayLi.replaceChild(document.createTextNode("Previous Day "), todayLi.childNodes[0]);
						} else {
							todayLi.replaceChild(document.createTextNode("Today "), todayLi.childNodes[0]);
						}
					}
				}
			}
		}
		break;
	case 'news':
	case 'events':
		if (container == 'news') container = jQuery('.ciq-quote-news')[0]; //container.getElementsByClassName("ciq-news-list-item");
		else container = jQuery('.ciq-quote-events')[0]
		var dateAreas = container.getElementsByClassName("ciq-date");
		var headlines = container.getElementsByClassName("ciq-event-head");
		if (!headlines.length) headlines = container.getElementsByClassName("ciq-news-head");
		if (dateAreas.length && headlines.length) {
			var lis = container.getElementsByClassName("ciq-news-list-item");
			var dates = container.getElementsByClassName("date");
			var times = container.getElementsByClassName("time");
			var sources = container.getElementsByClassName("ciq-news-source");
			var images = container.getElementsByClassName("ciq-news-img");
			var heads = container.getElementsByClassName("ciq-news-head");
			var bodies = container.getElementsByClassName("ciq-news-body");
			var links = container.getElementsByClassName("ciq-news-link");
			if (!startingPoint) startingPoint = 0;
			var hasActive = false;
			for (var hi = 0; hi < dateAreas.length; hi++) {
				var h = section[hi + startingPoint].Headline;
				if (!h.Date) {
					if (hi + startingPoint == 0) container.getElementsByClassName("no-news")[0].style.display = "block";
					if (dates.length) dates[hi].innerHTML = "";
					if (times.length) times[hi].innerHTML = "";
					var link = headlines[hi].getElementsByTagName("a");
					if (link.length) {
						link[0].innerHTML = "";
						link[0].onclick = function () {
							return false;
						};
						link[0].style.cursor = "default";
					} else {
						headlines[hi].innerHTML = "";
					}
					continue;
				}
				var isActive = (lis.length && bodies.length &&
					(activeStory == h.Url || (!activeStory && hi == 0)));
				if (isActive) {
					appendClass(lis[hi], "active");
					hasActive = true;
				} else if (lis.length) {
					unappendClass(lis[hi], "active");
				}

				if (h.Date.getFullYear() == today.getFullYear() && h.Date.getMonth() == today.getMonth() && h.Date.getDate() == today.getDate()) {
					if (dates[hi]) {
						dates[hi].innerHTML = "Today";
						appendClass(dates[hi].parentNode, "today");
					} else {
						dateAreas[hi].innerHTML = "Today";
						if (h.Date.getHours() != 0) dateAreas[hi].innerHTML = ampmTime(h.Date);
					}
				} else {
					if (dates[hi]) {
						dates[hi].innerHTML = h.Date.toDateString().split(" ").splice(1, 2).join(" ");
						unappendClass(dates[hi].parentNode, "today");
					} else {
						dateAreas[hi].innerHTML = h.Date.toDateString().split(" ").splice(1, 2).join(" ");
						if (isActive && h.Date.getHours() != 0) dateAreas[hi].innerHTML += " " + ampmTime(h.Date);
					}
				}
				if (times.length) times[hi].innerHTML = ampmTime(h.Date);
				if (sources.length) sources[hi].innerHTML = h.Source.split(" - ")[0];
				if (images.length) {
					images[hi].style.display = "none";
					if (h.Image && showImages) {
						images[hi].children[0].href = h.Url;
						images[hi].children[0].target = "_blank";
						var img = images[hi].children[0].children[0];
						img.onload = function () {
							if (this.naturalWidth > 24 && this.naturalHeight > 24) this.parentNode.parentNode.style.display = "";
						};
						img.onerror = function () {
							this.parentNode.parentNode.style.display = "none";
						};
						img.src = h.Image;
						if (img.naturalWidth > 24 && img.naturalHeight > 24) images[hi].style.display = "";
					}
				}
				if (heads.length) {
					heads[hi].children[0].style.display = "";
					heads[hi].children[0].style.cursor = "";
					heads[hi].children[0].onclick = null;
					if (isActive) heads[hi].children[0].href = h.Url;
					else heads[hi].children[0].href = "javascript:void(0);";
					heads[hi].children[0].target = "_blank";
					heads[hi].children[0].innerText = h.Subject; //IE8
					heads[hi].children[0].textContent = h.Subject;
				}
				if (bodies.length) {
					if (h.Summary) bodies[hi].innerHTML = h.Summary;
					bodies[hi].style.display = "";
				}
				if (links.length) {
					links[hi].children[0].style.display = "";
					links[hi].children[0].style.cursor = "";
					links[hi].children[0].href = h.Url;
					links[hi].children[0].target = "_blank";
				} else {
					var link = headlines[hi].getElementsByTagName("a");
					if (link.length) {
						link[0].href = h.Url;
						link[0].innerHTML = h.Subject;
						link[0].target = "_blank";
						link[0].onclick = null;
						link[0].style.cursor = "";
					} else {
						headlines[hi].innerHTML = h.Subject;
					}
				}
			}
			if (!hasActive && activeStory) {
				activeStory = null;
				renderSection(container, section, startingPoint);
			}
			var paginate = document.getElementsByClassName("ciq-paginate");
			if (paginate.length) {
				var pagLis = paginate[0].getElementsByTagName("LI");
				var prev = 0;
				var next = pagLis.length - 1;
				var index = 1;
				var active = -1;
				var firstHidden = next;
				pagLis[prev].style.display = "";
				pagLis[next].style.display = "";
				for (var r = 0; r < Object.keys(section).length; r += PageLimits.paginate, index++) {
					pagLis[index].style.display = "";
					if (hasClass(pagLis[index].children[0], "active")) active = index;
					if (section[r].Headline.Date == null) {
						firstHidden = Math.min(firstHidden, index);
						pagLis[index].style.display = "none";
						if (r <= PageLimits.paginate) {
							pagLis[prev].style.display = "none";
							pagLis[index - 1].style.display = "none";
							pagLis[next].style.display = "none";
						}
					}
				}
				for (var clean = 0; clean < PageLimits.paginate; clean++) {
					lis[clean].style.display = "";
					if (dates[clean].innerHTML == "") lis[clean].style.display = "none";
				}
				for (var n = 1; n < firstHidden; n++) {
					var li = pagLis[n];
					if (active > 4 && active > n + 2 && n > 1 && n < firstHidden - 1) {
						if (n == 2) {
							if (li.getElementsByClassName("ellipses").length == 0) {
								li.children[0].style.display = "none";
								el1 = document.createElement("span");
								el1.className = "ellipses";
								el1.innerHTML = "...";
								li.appendChild(el1);
							}
						} else {
							appendClass(li, "ellipses");
						}
					} else if (active < firstHidden - 3 && active < n - 2 && n > 1 && n < firstHidden - 1) {
						if (n == firstHidden - 2) {
							if (li.getElementsByClassName("ellipses").length == 0) {
								li.children[0].style.display = "none";
								el2 = document.createElement("span");
								el2.className = "ellipses";
								el2.innerHTML = "...";
								li.appendChild(el2);
							}
						} else {
							appendClass(li, "ellipses");
						}
					} else {
						unappendClass(li, "ellipses");
						li.children[0].style.display = "";
						var ellipses = li.getElementsByClassName("ellipses");
						for (var e = 0; e < ellipses.length; e++) {
							li.removeChild(ellipses[e]);
						}
					}
				}
				appendClass(paginate[0], "on");
			}
		}
		break;
	}

	/*var prices = container.getElementsByClassName("ciq-sym-price");
	var tables = container.getElementsByClassName("ciq-table");
	if (!tables.length) tables = container.getElementsByClassName("ciq-box");
	var ranges = container.getElementsByClassName("ciq-sym-change");
	var dateAreas = container.getElementsByClassName("ciq-date");
	var headlines = container.getElementsByClassName("ciq-event-head");
	if (!headlines.length) headlines = container.getElementsByClassName("ciq-news-head");
	//var d = section[0].Data;
	if (prices.length) {
		document.getElementsByClassName("ciq-quote-info")[0].style.visibility = "";
		document.getElementsByClassName("ciq-content")[0].style.visibility = "";
		var fundas = document.getElementsByClassName("ciq-quote-fundamental");
		for (var fu = 0; fu < fundas.length; fu++) fundas[fu].style.display = "block";
		var d = section[0].Data;
		var div = prices[0].parentNode.parentNode;
		var h2 = div.getElementsByTagName("h2")[0];
		h2.children[0].innerHTML = d.Symbol;
		h2.children[1].innerHTML = d.Name;
		var p = div.getElementsByTagName("p")[0];
		if (d.Date && !isNaN(d.Date.getTime())) {
			p.innerHTML = d.Date.toDateString().replace(/ /, ", ") + ", " + ampmTimeTz(d.Date);
			if (d.Last == null || isNaN(d.Last)) prices[0].innerHTML = d.Last;
			else prices[0].innerHTML = Math.abs(d.Last).toFixed(Math.max(2, d.Last.toString().indexOf(".") == -1 ? 0 : d.Last.toString().split(".")[1].length));
			var arrow = div.getElementsByClassName("arrow")[0];
			if (d.Change == null || isNaN(d.Change)) arrow.parentNode.children[1].innerHTML = d.Change;
			else arrow.parentNode.children[1].innerHTML = Math.abs(d.Change).toFixed(d.Last < 1 || (Math.abs(d.Change) < .01 && d.PercentChange) ? 4 : 2);
			if (d.PercentChange == null || isNaN(d.PercentChange)) arrow.parentNode.children[2].innerHTML = d.PercentChange;
			else arrow.parentNode.children[2].innerHTML = Math.abs(d.PercentChange).toFixed(2) + "%";
			appendClass(arrow, d.Change > 0 ? "up" : (d.Change < 0 ? "down" : ""));
			if (document.getElementsByClassName("ciq-description").length) {
				if (document.getElementsByClassName("ciq-description")[0].getElementsByTagName("P")[0].className == "summary") {
					document.getElementsByClassName("ciq-description")[0].getElementsByTagName("P")[0].innerHTML = d.SummaryDescription ? d.SummaryDescription : "No description";
				} else {
					document.getElementsByClassName("ciq-description")[0].getElementsByTagName("P")[0].innerHTML = d.Description ? d.Description : "No description";
				}
			}
		} else {
			prices[0].innerHTML = "N/A";
			var arrow = div.getElementsByClassName("arrow")[0];
			arrow.parentNode.children[1].innerHTML = "N/A";
			arrow.parentNode.children[2].innerHTML = "N/A";
			if (document.getElementsByClassName("ciq-description").length)
				document.getElementsByClassName("ciq-description")[0].getElementsByTagName("P")[0].innerHTML = "No description";
		}
	}*/


	/*if (tables.length) {
		var d = section[0].Data;
		for (var t = 0; t < tables.length; t++) {
			var table = tables[t].getElementsByTagName("tr");
			for (var row = 0; row < table.length; row++) {
				if (hasClass(table[row].children[0], "ciq-date")) continue;
				if (table[row].children[0].innerHTML == "52 Week") {
					table[row].getElementsByClassName("ciq-range-high")[0].children[0].innerHTML = d.FiftyTwoWeekHigh;
					table[row].getElementsByClassName("ciq-range-low")[0].children[0].innerHTML = d.FiftyTwoWeekLow;
					if (Number(d.FiftyTwoWeekHigh) - Number(d.FiftyTwoWeekLow))
						table[row].getElementsByClassName("ciq-range-fill")[0].style.width = (100 * (Number(d.Last) - Number(d.FiftyTwoWeekLow)) / (Number(d.FiftyTwoWeekHigh) - Number(d.FiftyTwoWeekLow))).toString() + "%";
				} else if (table[row].children[0].innerHTML == "Market Cap") table[row].children[1].innerHTML = condenseInt(d.MarketCap, true);
				else if (table[row].children[0].innerHTML == "Volume") {
					appendClass(table[row].children[1].children[0], d.VolumeChange > 0 ? "up" : (d.VolumeChange < 0 ? "down" : ""));
					table[row].children[1].children[1].innerHTML = d.Volume !== null ? condenseInt(d.Volume) : "N/A";
					if (d.VolumePercentChange == null || isNaN(d.VolumePercentChange)) table[row].children[1].children[2].innerHTML = naIfNull(d.VolumePercentChange);
					else table[row].children[1].children[2].innerHTML = Math.abs(d.VolumePercentChange).toFixed(2) + "%";
				} else if (table[row].children[0].innerHTML == "Short Interest") table[row].children[1].innerHTML = commaInt(d.ShortInterest, true);
				else if (table[row].children[0].innerHTML == "Div Rate") table[row].children[1].innerHTML = naIfNull(d.DividendRate);
				else if (table[row].children[0].innerHTML == "Yield") {
					if (!d.DividendYield || isNaN(d.DividendYield)) table[row].children[1].innerHTML = naIfNull(d.DividendYield);
					else table[row].children[1].innerHTML = d.DividendYield.toFixed(2) + "%";
				} else if (table[row].children[0].innerHTML == "EPS (TTM)") {
					if (!d.EPS || isNaN(d.EPS)) table[row].children[1].innerHTML = naIfNull(d.EPS);
					else table[row].children[1].innerHTML = d.EPS.toFixed(2);
				} else if (table[row].children[0].innerHTML == "PE Ratio") table[row].children[1].innerHTML = naIfNull(d.PERatio);
				else if (table[row].children[0].innerHTML == "Net Assets") table[row].children[1].innerHTML = condenseInt(d.NetAssets, true);
				else if (table[row].children[0].innerHTML == "Prospectus Net Expense Ratio") {
					if (!d.ExpenseRatio || isNaN(d.ExpenseRatio)) table[row].children[1].innerHTML = naIfNull(d.ExpenseRatio);
					else table[row].children[1].innerHTML = Number(d.ExpenseRatio).toFixed(2) + "%";
				} else if (table[row].children[0].innerHTML == "Yield (TTM)") {
					if (!d.Yield || isNaN(d.Yield)) table[row].children[1].innerHTML = naIfNull(d.Yield);
					else table[row].children[1].innerHTML = Number(d.Yield).toFixed(2) + "%";
				} else if (table[row].children[0].innerHTML == "Top Ten Holdings Weighting") {
					if (!d.WeightingTopTen || isNaN(d.WeightingTopTen)) table[row].children[1].innerHTML = naIfNull(d.WeightingTopTen);
					else table[row].children[1].innerHTML = Number(d.WeightingTopTen).toFixed(2) + "%";
				} else if (table[row].children[0].innerHTML == "Turnover Ratio") {
					if (!d.Turnover || isNaN(d.Turnover)) table[row].children[1].innerHTML = naIfNull(d.Turnover);
					else table[row].children[1].innerHTML = Number(d.Turnover).toFixed(1) + "%";
				} else if (table[row].children[0].innerHTML == "Initial Investment") table[row].children[1].innerHTML = d.InitialInvestment !== null ? "$" + d.InitialInvestment : "N/A";
				else if (table[row].children[0].innerHTML == "Closed to New Investors") table[row].children[1].innerHTML = d.Closed ? "Y" : "N";
				else if (table[row].children[0].innerHTML == "Address") {
					if (d.Address1) {
						if (d.Address1) table[row].children[1].innerHTML = d.Address1;
						if (d.Address2) table[row].children[1].innerHTML += ", " + d.Address2;
						if (d.City) table[row].children[1].innerHTML += ", " + d.City;
						if (d.State) table[row].children[1].innerHTML += ", " + d.State;
						if (d.Zip) table[row].children[1].innerHTML += "  " + d.Zip;
						if (d.Country) table[row].children[1].innerHTML += ", " + d.Country;
					} else {
						table[row].children[1].innerHTML = "N/A";
					}
				} else if (table[row].children[0].innerHTML == "Phone") table[row].children[1].innerHTML = naIfNull(d.Phone);
				else if (table[row].children[0].innerHTML == "Website") {
					if (d.Website) {
						table[row].children[1].children[0].href = d.Website;
						table[row].children[1].children[0].target = "_blank";
						table[row].children[1].children[0].innerHTML = d.Website;
					} else {
						table[row].children[1].children[0].innerHTML = "N/A";
					}
				} else if (table[row].children[0].innerHTML == "Email") {
					if (d.Email) {
						table[row].children[1].children[0].href = "mailto:" + d.Email;
						table[row].children[1].children[0].innerHTML = d.Email;
					} else {
						table[row].children[1].children[0].innerHTML = "N/A";
					}
				} else if (table[row].children[0].innerHTML == "CEO") table[row].children[1].innerHTML = naIfNull(d.CEO);
				else if (table[row].children[0].innerHTML == "Manager") table[row].children[1].innerHTML = naIfNull(d.Manager);
				else if (table[row].children[0].innerHTML == "Employees") table[row].children[1].innerHTML = commaInt(d.Employees, true);
				else if (table[row].children[0].innerHTML == "Sector") table[row].children[1].innerHTML = naIfNull(d.Sector);
				else if (table[row].children[0].innerHTML == "Industry") table[row].children[1].innerHTML = naIfNull(d.Industry);
				else if (table[row].children[0].innerHTML == "Fund Family") table[row].children[1].innerHTML = naIfNull(d.Family);
				else if (table[row].children[0].innerHTML == "Share Class") table[row].children[1].innerHTML = naIfNull(d.Class);
				else if (table[row].children[0].innerHTML == "Category") table[row].children[1].innerHTML = naIfNull(d.Category);
			}
		}
		var objective = document.getElementsByClassName("ciq-quote-fund-objective");
		if (d && objective.length) {
			if (d.FundObjective) {
				objective[0].getElementsByClassName("objective")[0].innerHTML = d.FundObjective;
			} else {
				objective[0].getElementsByClassName("no-objective")[0].style.display = "block";
			}
		}
	}*/
	/*for (var r = 0; r < ranges.length; r++) {
		if (ranges[r].parentNode.tagName == "LI") {
			var key = ranges[r].parentNode.getAttribute("range");
			if (section[key]) {
				var d = section[key][0].Data;
				if (v.QuoteHistoricalCache[key]) {
					d.Previous = v.QuoteHistoricalCache[key];
				}
				if (!d.Last) d.Last = v.Quote[0].Data.Last;
				d.Change = d.Last - d.Previous;
				d.PercentChange = 100 * d.Change / d.Previous;
				unappendClass(ranges[r].children[0], "up");
				unappendClass(ranges[r].children[0], "down");
				appendClass(ranges[r].children[0], d.Change > 0 ? "up" : (d.Change < 0 ? "down" : ""));
				if (d.Change == null || isNaN(d.Change)) ranges[r].children[1].innerHTML = d.Change;
				else ranges[r].children[1].innerHTML = Math.abs(d.Change).toFixed(d.Last < 1 || (Math.abs(d.Change) < .01 && d.PercentChange) ? 4 : 2);
				if (d.Previous) {
					if (d.PercentChange == null || isNaN(d.PercentChange)) ranges[r].children[2].innerHTML = d.PercentChange;
					else ranges[r].children[2].innerHTML = Math.abs(d.PercentChange).toFixed(2) + "%";
				}
				if (key == "1D" && d.Date) {
					var testDate = new Date();
					var todayLi = document.getElementsByClassName("ciq-range-nav")[0].getElementsByTagName("LI")[0];
					if (d.Date.getTime() + 8 * 60 * 60 * 1000 < testDate.getTime() || d.Date.getDay() < testDate.getDay()) { //last tick over 8 hours ago or previous day of week
						todayLi.replaceChild(document.createTextNode("Previous Day "), todayLi.childNodes[0]);
					} else {
						todayLi.replaceChild(document.createTextNode("Today "), todayLi.childNodes[0]);
					}
				}
			}
		}
	}
	if (dateAreas.length && headlines.length) {
		var lis = container.getElementsByClassName("ciq-news-list-item");
		var dates = container.getElementsByClassName("date");
		var times = container.getElementsByClassName("time");
		var sources = container.getElementsByClassName("ciq-news-source");
		var images = container.getElementsByClassName("ciq-news-img");
		var heads = container.getElementsByClassName("ciq-news-head");
		var bodies = container.getElementsByClassName("ciq-news-body");
		var links = container.getElementsByClassName("ciq-news-link");
		if (!startingPoint) startingPoint = 0;
		var hasActive = false;
		for (var hi = 0; hi < dateAreas.length; hi++) {
			var h = section[hi + startingPoint].Headline;
			if (!h.Date) {
				if (hi + startingPoint == 0) container.getElementsByClassName("no-news")[0].style.display = "block";
				if (dates.length) dates[hi].innerHTML = "";
				if (times.length) times[hi].innerHTML = "";
				var link = headlines[hi].getElementsByTagName("a");
				if (link.length) {
					link[0].innerHTML = "";
					link[0].onclick = function () {
						return false;
					};
					link[0].style.cursor = "default";
				} else {
					headlines[hi].innerHTML = "";
				}
				continue;
			}
			var isActive = (lis.length && bodies.length &&
				(activeStory == h.Url || (!activeStory && hi == 0)));
			if (isActive) {
				appendClass(lis[hi], "active");
				hasActive = true;
			} else if (lis.length) {
				unappendClass(lis[hi], "active");
			}

			if (h.Date.getFullYear() == today.getFullYear() && h.Date.getMonth() == today.getMonth() && h.Date.getDate() == today.getDate()) {
				if (dates[hi]) {
					dates[hi].innerHTML = "Today";
					appendClass(dates[hi].parentNode, "today");
				} else {
					dateAreas[hi].innerHTML = "Today";
					if (h.Date.getHours() != 0) dateAreas[hi].innerHTML = ampmTime(h.Date);
				}
			} else {
				if (dates[hi]) {
					dates[hi].innerHTML = h.Date.toDateString().split(" ").splice(1, 2).join(" ");
					unappendClass(dates[hi].parentNode, "today");
				} else {
					dateAreas[hi].innerHTML = h.Date.toDateString().split(" ").splice(1, 2).join(" ");
					if (isActive && h.Date.getHours() != 0) dateAreas[hi].innerHTML += " " + ampmTime(h.Date);
				}
			}
			if (times.length) times[hi].innerHTML = ampmTime(h.Date);
			if (sources.length) sources[hi].innerHTML = h.Source.split(" - ")[0];
			if (images.length) {
				images[hi].style.display = "none";
				if (h.Image && showImages) {
					images[hi].children[0].href = h.Url;
					images[hi].children[0].target = "_blank";
					var img = images[hi].children[0].children[0];
					img.onload = function () {
						if (this.naturalWidth > 24 && this.naturalHeight > 24) this.parentNode.parentNode.style.display = "";
					};
					img.onerror = function () {
						this.parentNode.parentNode.style.display = "none";
					};
					img.src = h.Image;
					if (img.naturalWidth > 24 && img.naturalHeight > 24) images[hi].style.display = "";
				}
			}
			if (heads.length) {
				heads[hi].children[0].style.display = "";
				heads[hi].children[0].style.cursor = "";
				heads[hi].children[0].onclick = null;
				if (isActive) heads[hi].children[0].href = h.Url;
				else heads[hi].children[0].href = "javascript:void(0);";
				heads[hi].children[0].target = "_blank";
				heads[hi].children[0].innerText = h.Subject; //IE8
				heads[hi].children[0].textContent = h.Subject;
			}
			if (bodies.length) {
				if (h.Summary) bodies[hi].innerHTML = h.Summary;
				bodies[hi].style.display = "";
			}
			if (links.length) {
				links[hi].children[0].style.display = "";
				links[hi].children[0].style.cursor = "";
				links[hi].children[0].href = h.Url;
				links[hi].children[0].target = "_blank";
			} else {
				var link = headlines[hi].getElementsByTagName("a");
				if (link.length) {
					link[0].href = h.Url;
					link[0].innerHTML = h.Subject;
					link[0].target = "_blank";
					link[0].onclick = null;
					link[0].style.cursor = "";
				} else {
					headlines[hi].innerHTML = h.Subject;
				}
			}
		}
		if (!hasActive && activeStory) {
			activeStory = null;
			renderSection(container, section, startingPoint);
		}
		var paginate = document.getElementsByClassName("ciq-paginate");
		if (paginate.length) {
			var pagLis = paginate[0].getElementsByTagName("LI");
			var prev = 0;
			var next = pagLis.length - 1;
			var index = 1;
			var active = -1;
			var firstHidden = next;
			pagLis[prev].style.display = "";
			pagLis[next].style.display = "";
			for (var r = 0; r < Object.keys(section).length; r += PageLimits.paginate, index++) {
				pagLis[index].style.display = "";
				if (hasClass(pagLis[index].children[0], "active")) active = index;
				if (section[r].Headline.Date == null) {
					firstHidden = Math.min(firstHidden, index);
					pagLis[index].style.display = "none";
					if (r <= PageLimits.paginate) {
						pagLis[prev].style.display = "none";
						pagLis[index - 1].style.display = "none";
						pagLis[next].style.display = "none";
					}
				}
			}
			for (var clean = 0; clean < PageLimits.paginate; clean++) {
				lis[clean].style.display = "";
				if (dates[clean].innerHTML == "") lis[clean].style.display = "none";
			}
			for (var n = 1; n < firstHidden; n++) {
				var li = pagLis[n];
				if (active > 4 && active > n + 2 && n > 1 && n < firstHidden - 1) {
					if (n == 2) {
						if (li.getElementsByClassName("ellipses").length == 0) {
							li.children[0].style.display = "none";
							el1 = document.createElement("span");
							el1.className = "ellipses";
							el1.innerHTML = "...";
							li.appendChild(el1);
						}
					} else {
						appendClass(li, "ellipses");
					}
				} else if (active < firstHidden - 3 && active < n - 2 && n > 1 && n < firstHidden - 1) {
					if (n == firstHidden - 2) {
						if (li.getElementsByClassName("ellipses").length == 0) {
							li.children[0].style.display = "none";
							el2 = document.createElement("span");
							el2.className = "ellipses";
							el2.innerHTML = "...";
							li.appendChild(el2);
						}
					} else {
						appendClass(li, "ellipses");
					}
				} else {
					unappendClass(li, "ellipses");
					li.children[0].style.display = "";
					var ellipses = li.getElementsByClassName("ellipses");
					for (var e = 0; e < ellipses.length; e++) {
						li.removeChild(ellipses[e]);
					}
				}
			}
			appendClass(paginate[0], "on");
		}
	}*/
}

function updateHistoricals(range, previousClose, lastTime) {
	var map = {
		"1D": "1D",
		"5D": "1W",
		"1M": "4W",
		"3M": "13W",
		"1Y": "52W"
	};
	v.QuoteHistoricalCache[map[range]] = previousClose;
	if (v.QuoteHistorical[map[range]]) {
		v.QuoteHistorical[map[range]][0].Data.Previous = previousClose;
		v.QuoteHistorical[map[range]][0].Data.Date = lastTime;
		renderSection(document.getElementsByClassName("ciq-range-nav")[0], v.QuoteHistorical);
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

function setFundOrEquity() {
	if (fundInfo && isMutual(symbol)) jQuery("body").addClass("mutual-fund");
	if (fundInfo && (isETF || isCEF)) jQuery("body").addClass("etf");
	var equityItems = document.getElementsByClassName("ciq-fundamental-equity");
	for (var ei = 0; ei < equityItems.length; ei++) equityItems[ei].style.display = (fundInfo && isMutual(symbol)) ? "none" : "";
	var fundItems = document.getElementsByClassName("ciq-fundamental-fund");
	for (var fi = 0; fi < fundItems.length; fi++) fundItems[fi].style.display = !(fundInfo && isMutual(symbol)) ? "none" : "";
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

	if (isMutual(symbol)) {
		jQuery("body").addClass("mutual-fund");
	}
	if (isIndex(symbol)) {
		jQuery("body").addClass("index");
		if (getIndexEntitlement(symbol) === 0) jQuery("body").addClass("eod");
	}
	if (isForex(symbol)) {
		jQuery("body").addClass("forex");
	}
	var overviewFrame = document.getElementsByClassName("chart-iframe")[0];
	if (overviewFrame && (getStyle(".quotes-access", "display").indexOf("none") == -1 && getStyle(".mn-quotes-overview", "display") != "none")) {
		activateStartingRange(symbol);
		overviewFrame.src = "chart/simple-chart.html?symbol=" + encodeURIComponent(symbol) + "&refresh=" + chartRefreshRate;
	}
	//document.getElementsByClassName("ciq-quote-info")[0].style.visibility = "hidden";
	//document.getElementsByClassName("ciq-content")[0].style.visibility = "hidden";

	var fundInfo = false;
	var fundInfoEl = document.getElementsByClassName("ciq-get-fund-fundamentals");
	if (fundInfoEl.length) fundInfo = getComputedStyle(fundInfoEl[0]).display.indexOf("block") >= 0;

	setFundOrEquity();

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

if (visibleItems['quote'] || visibleItems['fundamentals'] || visibleItems['chart'] || visibleItems['summary']) {
	var quotePoll = function () {
		setTodayDate();
		fetchDetailedQuote(v.Quote, getFundamentals ? v.QuoteHistorical : null, symbol, PageLimits.quote, PageLimits.industry, flags, function () {
			if (visibleItems['quote']) renderSection('quote', v.Quote);
			if (visibleItems['fundamentals']) {
				renderSection('fundamental-table', v.Quote);
				if (visibleItems['events']) {
					if (!isMutual(symbol) && !isIndex(symbol) && !isForex(symbol)) {
						fetchSecurityEvents(v.Events, symbol, PageLimits.events, flags, function () {
							sortSection(v.Events, Quote.Flags.HEADLINE);
							renderSection('events', v.Events);
							Quote.Statistics.Events = new Date();
						});
					}
				}
			}
			if (visibleItems['chart']) renderSection('chart-nav', v.QuoteHistorical);
			if (visibleItems['summary']) renderSection('summary', v.Quote);
			Quote.Statistics.Quote = new Date();
			Quote.Statistics.QuoteHistorical = new Date();
		});
		if (quoteRefreshRate > 0) setTimeout(quotePoll, 1000 * quoteRefreshRate);
	};
	quotePoll();
}



if (visibleItems['headlines']) {
	var newsSection = document.getElementsByClassName("ciq-quote-news");
	if (!newsSection.length) newsSection = document.getElementsByClassName("quote-news");
	var newsPoll = function (stream) {
		setTodayDate();
		var newHeadlines = {};
		Quote.seed(newHeadlines, null, PageLimits.securityHeadlines, Quote.Flags.HEADLINE);
		fetchSecurityHeadlines(newHeadlines, symbol, PageLimits.securityHeadlines, flags, function (done) {
			if (!stream && !done) return;
			//sortSection(v.NewHeadlines,Quote.Flags.HEADLINE);
			renderSection('news', newHeadlines);
			if (done) {
				v.Headlines = newHeadlines;
				Quote.Statistics.Headlines = new Date();
			}
		});
		if (newsRefreshRate > 0) setTimeout(newsPoll, 1000 * newsRefreshRate);
	};
	if (!isMutual(symbol) && !isIndex(symbol) && !isForex(symbol)) newsPoll(true);
	else if (newsSection.length) {
		Quote.seed(v.Headlines, null, PageLimits.securityHeadlines, Quote.Flags.HEADLINE);
		renderSection('news', v.Headlines);
	}
}

//setTimeout("console.log(JSON.stringify(Quote))",5000);