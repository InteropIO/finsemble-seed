var Insider = {
	Viewables: {
		Quote: {},
		Transactions: {}
	},
	Statistics: { //last updated times
		Quote: null,
		Transactions: null
	},
	Template: {
		Data: {
			Symbol: null,
			Last: null,
			Previous: null,
			Change: null,
			PercentChange: null
		},
		Trade: {
			Amount: null,
			Date: null,
			Name: null,
			Description: null,
			Price: null,
			Owned: null
		}
	},
	Flags: {
		DATA: 1,
		TRADE: 2
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
		if (!(flags & this.Flags.TRADE)) delete template.Trade;
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

var v = Insider.Viewables;

Insider.seed(v.Quote, null, PageLimits.quote, Insider.Flags.DATA);
Insider.seed(v.Transactions, null, PageLimits.transactions, Insider.Flags.TRADE);

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

function setSectionTrade(section, trade, reverse) {
	if (!trade) return;
	var t = null;
	var nextAvailable = null;
	for (var s in section) {
		if (!section[s].Trade.SortKey && (reverse || nextAvailable == null)) {
			nextAvailable = s;
		}
		if (section[s].Trade.SortKey != trade.SortKey) continue;
		t = section[s];
		break;
	}
	if (!t) {
		if (nextAvailable == null) return;
		t = section[nextAvailable];
	}
	for (var tr in trade) {
		t.Trade[tr] = trade[tr];
	}
}

function sortSection(section, flag) {
	var arr = [];
	for (var s in section) {
		var inserted = false;
		for (var a = 0; a < arr.length; a++) {
			if (inserted) continue;
			if (flag & Insider.Flags.DATA) {
				sortField = (section[s].Data.SortKey != null ? "SortKey" : "PercentChange");
				if (section[s].Data[sortField] > arr[a].Data[sortField]) {
					arr.splice(a, 0, section[s]);
					inserted = true;
				}
			} else if (flag & Insider.Flags.TRADE) {
				sortField = (section[s].Trade.SortKey != null ? "SortKey" : "Date");
				if (section[s].Trade[sortField] > arr[a].Trade[sortField]) {
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

function renderSection(container, section) {
	if (symbol == "") return;
	var prices = container.getElementsByClassName("ciq-sym-price");
	var trades = container.getElementsByTagName("TR");
	if (prices.length) {
		document.getElementsByClassName("ciq-quote-info")[0].style.visibility = "";
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
			if (document.getElementsByClassName("ciq-description").length)
				document.getElementsByClassName("ciq-description")[0].getElementsByTagName("P")[0].innerHTML = d.Description;
		} else {
			prices[0].innerHTML = "N/A";
			var arrow = div.getElementsByClassName("arrow")[0];
			arrow.parentNode.children[1].innerHTML = "N/A";
			arrow.parentNode.children[2].innerHTML = "N/A";
		}
	}
	if (trades.length) {
		document.getElementsByClassName("ciq-content")[0].style.visibility = "";
		var totalBuy12Month = 0;
		var totalSell12Month = 0;
		var total12MonthActivity = 0;
		var totalBuy3Month = 0;
		var totalSell3Month = 0;
		var total3MonthActivity = 0;
		var threeMonthsAgo = new Date();
		threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
		for (var row = 1; row < trades.length; row++) {
			if(!section[row]) break;
			if (section[row].Trade.Date) {
				trades[row].parentNode.appendChild(trades[row].cloneNode(true));
				trades = container.getElementsByTagName("TR");
			} else if (row == 1) { //(no records)
				container.parentNode.getElementsByClassName("no-insiders")[0].style.display = "block";
				return;
			}
			var t = section[row - 1].Trade;
			if (t.Date) {
				trades[row].children[0].innerHTML = mmddyyyy(t.Date);
				trades[row].children[1].innerHTML = t.Name;
				trades[row].children[2].innerHTML = t.Description;
				appendClass(trades[row].children[3].children[0], t.Amount > 0 ? "up" : (t.Amount < 0 ? "down" : ""));
				trades[row].children[3].children[1].innerHTML = commaInt(Math.abs(t.Amount));
				trades[row].children[4].innerHTML = t.Price.toFixed(4);
				trades[row].children[5].innerHTML = commaInt(t.Owned);
			}
			if (t.Description.indexOf("Purchase") > -1 || t.Description.indexOf("Grant") > -1) {
				totalBuy12Month++;
				if (threeMonthsAgo <= t.Date) totalBuy3Month++;
			} else if (t.Description.indexOf("Sale") > -1 || t.Description.indexOf("Same Day Exercise") > -1) {
				totalSell12Month++;
				if (threeMonthsAgo <= t.Date) totalSell3Month++;
			}
			total12MonthActivity += t.Amount;
			if (threeMonthsAgo <= t.Date) total3MonthActivity += t.Amount;
		}

		function setBars(section, bar, value, axisMax) {
			var axisDivision = Math.ceil(axisMax / (PageLimits.axisLines - 1));
			if (axisDivision == 0) axisDivision = 1;
			var axisTexts = section.getElementsByClassName("ciq-axis-text");
			for (var ad = 0; ad < axisTexts.length; ad++) {
				axisTexts[ad].innerHTML = (axisDivision * ad).toFixed(0);
			}
			var barwidth = 100 * Math.abs(value) / (axisDivision * (PageLimits.axisLines - 1));
			bar.children[0].innerHTML = commaInt(value);
			bar.setAttribute("barwidth", barwidth + "%");
			if (barwidth < 5) appendClass(bar.children[0], "shift");
		}
		var totalSections = document.getElementsByClassName("ciq-col");
		setBars(totalSections[0], totalSections[0].getElementsByClassName("ciq-bar up")[0], totalBuy3Month, Math.max(totalBuy3Month, totalSell3Month));
		setBars(totalSections[0], totalSections[0].getElementsByClassName("ciq-bar down")[0], totalSell3Month, Math.max(totalBuy3Month, totalSell3Month));
		var threeMonthTotals = totalSections[1].getElementsByTagName("TR");
		for (var t = 0; t < threeMonthTotals.length; t++) {
			if (threeMonthTotals[t].children[0].innerHTML == "Number of Buys") threeMonthTotals[t].children[1].innerHTML = commaInt(totalBuy3Month);
			else if (threeMonthTotals[t].children[0].innerHTML == "Number of Sells") threeMonthTotals[t].children[1].innerHTML = commaInt(totalSell3Month);
			else if (threeMonthTotals[t].children[0].innerHTML == "Number of Trades") threeMonthTotals[t].children[1].innerHTML = commaInt(totalBuy3Month + totalSell3Month);
			else if (threeMonthTotals[t].children[0].innerHTML == "Net Activity") threeMonthTotals[t].children[1].innerHTML = commaInt(total3MonthActivity);
		}
		setBars(totalSections[2], totalSections[2].getElementsByClassName("ciq-bar up")[0], totalBuy12Month, Math.max(totalBuy12Month, totalSell12Month));
		setBars(totalSections[2], totalSections[2].getElementsByClassName("ciq-bar down")[0], totalSell12Month, Math.max(totalBuy12Month, totalSell12Month));
		var twelveMonthTotals = totalSections[3].getElementsByTagName("TR");
		for (var t = 0; t < twelveMonthTotals.length; t++) {
			if (twelveMonthTotals[t].children[0].innerHTML == "Number of Buys") twelveMonthTotals[t].children[1].innerHTML = commaInt(totalBuy12Month);
			else if (twelveMonthTotals[t].children[0].innerHTML == "Number of Sells") twelveMonthTotals[t].children[1].innerHTML = commaInt(totalSell12Month);
			else if (twelveMonthTotals[t].children[0].innerHTML == "Number of Trades") twelveMonthTotals[t].children[1].innerHTML = commaInt(totalBuy12Month + totalSell12Month);
			else if (twelveMonthTotals[t].children[0].innerHTML == "Net Activity") twelveMonthTotals[t].children[1].innerHTML = commaInt(total12MonthActivity);
		}
	}
}

var today;

function setTodayDate() {
	today = new Date();
	today.setMilliseconds(0);
}
setTodayDate();

function getQuoteURL() {
	var href = "javascript:void(0);";
	var links = 0;
	if (getStyle(".mn-quotes-insiders", "display") != "none") {
		href = pageName("insiders");
		links++;
	}
	if (getStyle(".mn-quotes-filings", "display") != "none") {
		href = pageName("filings");
		links++;
	}
	if (getStyle(".mn-quotes-financials", "display") != "none") {
		href = pageName("financials");
		links++;
	}
	if (getStyle(".mn-quotes-company", "display") != "none") {
		href = pageName("company");
		links++;
	}
	if (getStyle(".mn-quotes-news", "display") != "none") {
		href = pageName("news");
		links++;
	}
	if (getStyle(".mn-quotes-overview", "display") != "none") {
		href = pageName("overview");
		links++;
	}
	if (links > 1) document.getElementsByClassName("ciq-quote-filter")[0].style.display = "block";
	return href;
}
var quoteURL = getQuoteURL();

var symbol = ""; {
	var sArr = queryStringValues("sym", location.search);
	if (sArr.length) symbol = sArr[0].toUpperCase();
	if (symbol == "") symbol = getSymbolList("quote-default").join("");
	var qmenu = document.getElementsByClassName("ciq-quote-filter")[0];
	var options = qmenu.getElementsByTagName("A");
	for (var a = 0; a < options.length; a++) {
		options[a].href += "?sym=" + encodeURIComponent(symbol);
	}
	var menu = document.getElementsByClassName("ciq-nav")[0];
	var options = menu.getElementsByTagName("A");
	for (var o = 0; o < options.length; o++) {
		if (hasClass(options[o].parentNode, "quotes")) options[o].href = quoteURL + "?sym=" + encodeURIComponent(symbol);
		else options[o].href += "?sym=" + encodeURIComponent(symbol);
	}

	document.getElementsByClassName("ciq-quote-info")[0].style.visibility = "hidden";
	document.getElementsByClassName("ciq-content")[0].style.visibility = "hidden";
}

var retrieve = {}; {
	function convertToStyle(param) {
		if (param == "nav") return "ciq-navbar";
		else if (param == "q") return "ciq-quote-info";
		else if (param == "i") return "quote-insiders";
		else return param;
	}
	var nodisc = queryStringValues("nodisc", location.hash);
	if (nodisc.length) {
		var footerSec = document.getElementsByClassName("ciq-footer");
		for (var s = 0; s < footerSec.length; s++) {
			footerSec[s].style.display = "none";
		}
	}
	var wArr = queryStringValues("sec", location.hash);
	if (wArr.length) {
		/*var sec = document.getElementsByClassName("ciq-overview-section");
		for (var s = 0; s < sec.length; s++) {
			sec[s].style.display = "none";
		}*/
		document.getElementsByClassName("ciq-quote-info")[0].style.display = "none";
		document.getElementsByClassName("ciq-navbar")[0].style.display = "none";


		for (var w = 0; w < wArr.length; w++) {
			retrieve[wArr[w]] = true;
			var widget = document.getElementsByClassName(convertToStyle(wArr[w]))[0];
			if (widget) {
				widget.style.display = "";
				widget.style.float = "none";
			}
		}
		document.getElementsByClassName("ciq-widget-container")[0].style.display = "";
	} else {
		retrieve = null;
	}
	document.getElementsByClassName("ciq-widget-container")[0].style.display = "";

}


var flags = Insider.Flags.DATA | Insider.Flags.TRADE;
var quoteRefreshRate = Number(getStyle(".quote-refresher", "z-index"));
if (isNaN(quoteRefreshRate)) quoteRefreshRate = 0;

if (getStyle(".quotes-access", "display").indexOf("none") == -1 && getStyle(".mn-quotes-insiders", "display") != "none") {

	if (document.getElementsByClassName("ciq-quote-info")[0].style.display != "none") {
		var quotePoll = function () {
			setTodayDate();
			fetchDetailedQuote(v.Quote, null, symbol, PageLimits.quote, PageLimits.industry, flags, function () {
				renderSection(document.getElementsByClassName("ciq-quote-info")[0], v.Quote);
				Insider.Statistics.Quote = new Date();
			});
			if (quoteRefreshRate > 0) setTimeout(quotePoll, 1000 * quoteRefreshRate);
		};
		quotePoll();
	}

	fetchSecurityInsiders(v.Transactions, symbol, PageLimits.transactions, flags, function () {
		sortSection(v.Transactions, Insider.Flags.TRADE);
		renderSection(document.getElementsByClassName("ciq-table")[0], v.Transactions);
		Insider.Statistics.Transactions = new Date();
		jQuery("body").bindInview();
	});

} else {
	console.log("Feature not entitled");
}
//setTimeout("console.log(JSON.stringify(Insider))",5000);