var Filings = {
	Viewables: {
		Quote: {},
		Filings: {},
		UnfilteredFilings: {}
	},
	Statistics: { //last updated times
		Quote: null,
		Filings: null,
		UnfilteredFilings: null
	},
	Template: {
		Data: {
			Symbol: null,
			Last: null,
			Previous: null,
			Change: null,
			PercentChange: null
		},
		Filing: {
			Date: null,
			FormType: null,
			FormName: null,
			Subject: null,
			Url: null,
			SortKey: null
		}
	},
	Flags: {
		DATA: 1,
		FILING: 2
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
		if (!(flags & this.Flags.FILING)) delete template.Filings;
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

var v = Filings.Viewables;

Filings.seed(v.Quote, null, PageLimits.quote, Filings.Flags.DATA);
Filings.seed(v.UnfilteredFilings, null, PageLimits.filings, Filings.Flags.FILING);

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

function setSectionFiling(section, filing, reverse) {
	if (!filing) return;
	var f = null;
	var nextAvailable = null;
	for (var s in section) {
		if (!section[s].Filing.Url && (reverse || nextAvailable == null)) {
			nextAvailable = s;
		}
		if (section[s].Filing.Url != filing.Url) continue;
		f = section[s];
		break;
	}
	if (!f) {
		if (nextAvailable == null) return;
		f = section[nextAvailable];
	}
	for (var fi in filing) {
		f.Filing[fi] = filing[fi];
	}
}

function sortSection(section, flag) {
	var arr = [];
	for (var s in section) {
		var inserted = false;
		for (var a = 0; a < arr.length; a++) {
			if (inserted) continue;
			if (flag & Filings.Flags.DATA) {
				sortField = (section[s].Data.SortKey != null ? "SortKey" : "PercentChange");
				if (section[s].Data[sortField] > arr[a].Data[sortField]) {
					arr.splice(a, 0, section[s]);
					inserted = true;
				}
			} else if (flag & Filings.Flags.FILING) {
				sortField = (section[s].Filing.SortKey != null ? "SortKey" : "Date");
				if (section[s].Filing[sortField] > arr[a].Filing[sortField]) {
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

function doFilter() {
	var filter = document.getElementsByClassName("filter-selected")[0].innerHTML;
	Filings.seed(v.Filings, null, PageLimits.filings, Filings.Flags.FILING);
	for (var uf in v.UnfilteredFilings) {
		var filing = v.UnfilteredFilings[uf].Filing;
		if (!filing.FormName) filing.FormName = SECFilingTypes(filing.FormType);
		if (filter == "Show All SEC Filings" || filter == filing.FormName) {
			setSectionFiling(v.Filings, filing);
		}
	}
	var lis = document.getElementsByClassName("ciq-paginate")[0].getElementsByTagName("LI");
	appendClass(lis[0].children[0], "disabled");
	lis[0].setAttribute("page", 1);
	for (var ch = 0; ch < lis.length; ch++) {
		unappendClass(lis[ch].children[0], "active");
	}
	appendClass(lis[1].children[0], "active");
	lis[lis.length - 1].setAttribute("page", 2);
	unappendClass(lis[lis.length - 1].children[0], "disabled");
	renderSection(document.getElementsByClassName("ciq-table")[0], v.Filings);
	Filings.Statistics.Filings = new Date();
}

function renderSection(container, section, startingPoint) {
	if (symbol == "") return;
	var prices = container.getElementsByClassName("ciq-sym-price");
	var dates = container.getElementsByClassName("ciq-date");
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
	if (dates.length) {
		document.getElementsByClassName("ciq-content")[0].style.visibility = "";
		container.parentNode.getElementsByClassName("no-filings")[0].style.display = "";
		container.style.display = "";
		var tableRows = dates[0].parentNode.parentNode.children;
		if (!startingPoint) startingPoint = 0;
		for (var tr = 0; tr < tableRows.length; tr++) {
			var f = section[tr + startingPoint].Filing;
			if (!f.Date) {
				if (startingPoint == 0 && tr == 0) {
					container.parentNode.getElementsByClassName("no-filings")[0].style.display = "block";
					container.style.display = "none";
					break;
				}
				dates[tr].innerHTML = "";
				continue;
			}
			dates[tr].innerHTML = mmddyyyy(f.Date);
			tableRows[tr].children[0].innerHTML = f.FormType;
			tableRows[tr].children[1].innerHTML = f.Subject;
			var link = tableRows[tr].getElementsByTagName("a")[0];
			link.href = (f.Url ? f.Url : "javascript:void(0);");
			link.target = "_blank";
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
				if (section[r].Filing.Date == null) {
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
				tableRows[clean].style.display = "";
				if (dates[clean].innerHTML == "") tableRows[clean].style.display = "none";
			}
			for (var n = 1; n < firstHidden; n++) {
				var li = pagLis[n];
				if (active > 4 && active > n + 2 && n > 1 && n < firstHidden - 1) {
					if (n == 2) {
						unappendClass(li, "ellipses");
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
						unappendClass(li, "ellipses");
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
		else if (param == "f") return "quote-filings";
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
			if (widget ) {
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


var flags = Filings.Flags.DATA | Filings.Flags.FILING;
var quoteRefreshRate = Number(getStyle(".quote-refresher", "z-index"));
if (isNaN(quoteRefreshRate)) quoteRefreshRate = 0;

if (getStyle(".quotes-access", "display").indexOf("none") == -1 && getStyle(".mn-quotes-filings", "display") != "none") {

	if (document.getElementsByClassName("ciq-quote-info")[0].style.display != "none") {
		var quotePoll = function () {
			setTodayDate();
			fetchDetailedQuote(v.Quote, null, symbol, PageLimits.quote, PageLimits.industry, flags, function () {
				renderSection(document.getElementsByClassName("ciq-quote-info")[0], v.Quote);
				Filings.Statistics.Quote = new Date();
			});
			if (quoteRefreshRate > 0) setTimeout(quotePoll, 1000 * quoteRefreshRate);
		};
		quotePoll();
	}

	fetchSecurityFilings(v.UnfilteredFilings, symbol, PageLimits.filings, flags, function () {
		sortSection(v.UnfilteredFilings, Filings.Flags.FILING);
		doFilter();
		renderSection(document.getElementsByClassName("ciq-table")[0], v.Filings);
		Filings.Statistics.UnfilteredFilings = new Date();
	});

} else {
	console.log("Feature not entitled");
}
//setTimeout("console.log(JSON.stringify(Filings))",5000);