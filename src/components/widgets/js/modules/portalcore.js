window.onerror = function (error) {
	// Return true to tell IE we handled it
	console.log(error);
	return true;
};

if (!String.prototype.startsWith) {
	String.prototype.startsWith = function (searchString, position) {
		position = position || 0;
		return this.substr(position, searchString.length) === searchString;
	};
}

if (!String.prototype.trim) {
	String.prototype.trim = function () {
		return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
	};
}

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

window.PortalCore = function () { };

PortalCore.ShareService = function () { };

PortalCore.ShareService.loadSharedInfo = function () {
	var sharedInfo;
	if (urlParams['sharedInfo'] === 'true') {
		sharedInfo = localStorage.getItem('sharedInfo');
	} else if (urlParams['sharedInfo']) {
		sharedInfo = JSON.parse(urlParams['sharedInfo']);
	}
	return sharedInfo;
}

PortalCore.ParentHeightChecker = function () { };

PortalCore.ParentHeightChecker.PostResizeCalls = [];

PortalCore.ParentHeightChecker.getParentInfo = function (parentInfo) {
	PortalCore.parentInfo = parentInfo;
	if (!PortalCore.ParentHeightChecker.prevHeight) PortalCore.ParentHeightChecker.prevHeight = 0;
	if (parentInfo.clientHeight != PortalCore.ParentHeightChecker.prevHeight) {
		_.each(PortalCore.ParentHeightChecker.PostResizeCalls, function (postResizeCall) {
			postResizeCall(true);
		});
	}
	PortalCore.ParentHeightChecker.prevHeight = parentInfo.clientHeight;
}

PortalCore.ParentHeightChecker.checkHeight = function () {
	if (typeof parentIFrame !== 'undefined') parentIFrame.getPageInfo(PortalCore.ParentHeightChecker.getParentInfo);
	else {
		var parentInfo = {
			clientHeight: $(window).height()
		}
		PortalCore.ParentHeightChecker.getParentInfo(parentInfo);
	}
}

PortalCore.ParentHeightChecker.enable = function () {
	if (!PortalCore.ParentHeightChecker.enabled) {
		PortalCore.ParentHeightChecker.enabled = true;
		setInterval(PortalCore.ParentHeightChecker.checkHeight, 250)
	}
}


PortalCore.PostResizeCalls = [];

PortalCore.windowSize = function () {
	var myWidth = 0,
		myHeight = 0;
	if (typeof (window.innerWidth) == 'number') {
		//Non-IE
		myWidth = window.innerWidth;
		myHeight = window.innerHeight;
	} else if (document.documentElement && (document.documentElement.clientWidth || document.documentElement.clientHeight)) {
		//IE 6+ in 'standards compliant mode'
		myWidth = document.documentElement.clientWidth;
		myHeight = document.documentElement.clientHeight;
	} else if (document.body && (document.body.clientWidth || document.body.clientHeight)) {
		//IE 4 compatible
		myWidth = document.body.clientWidth;
		myHeight = document.body.clientHeight;
	}
	return {
		width: myWidth,
		height: myHeight
	}
}

PortalCore.getParentInfo = function (parentInfo) {
	PortalCore.parentInfo = parentInfo;
	if (!PortalCore.prevHeight) PortalCore.prevHeight = 0;
	if (parentInfo.clientHeight != PortalCore.ParentHeightChecker.prevHeight) {
		_.each(PortalCore.PostResizeCalls, function (postResizeCall) {
			postResizeCall(true);
		});
	}
}

PortalCore.getUrlParameters = function (a) { //http://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript
	if (a == "") return {};
	var b = {};
	for (var i = 0; i < a.length; ++i) {
		var p = a[i].split('=', 2);
		if (p.length == 1)
			b[p[0]] = "";
		else
			b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " "));
	}
	return b;
}

var urlParams = PortalCore.getUrlParameters(location.search.substr(1).split('&'));
PortalCore.urlParams = urlParams;

var requirePaths = {
	// Third Party Modules
	lodash: 'https://cdn.jsdelivr.net/lodash/4.15.0/lodash.min',
	jquery: 'https://cdn.jsdelivr.net/jquery/2.2.4/jquery.min',
	jqueryui: 'https://cdn.jsdelivr.net/jquery.ui/1.11.4/jquery-ui.min',
	'datatables.net': 'https://cdn.datatables.net/1.10.13/js/jquery.dataTables.min', //Do not change the naming here. It is required by the library.
	datatablesresponsive: 'https://cdn.datatables.net/responsive/2.1.1/js/dataTables.responsive.min',
	datatablesdatetime: 'https://cdn.datatables.net/plug-ins/1.10.12/dataRender/datetime',
	datatablesscroller: 'https://cdn.jsdelivr.net/jquery.datatables/1.10.10/plugins/scroller/js/dataTables.scroller.min',
	scrollbox: 'https://cdn.jsdelivr.net/jquery.scrollbox/1.0.6/jquery.scrollbox.min',
	googlecharts: 'https://www.gstatic.com/charts/loader',
	moment: 'https://cdn.jsdelivr.net/momentjs/2.15.1/moment.min',
	iscroll: 'thirdparty/iscroll',
	owl: 'https://cdnjs.cloudflare.com/ajax/libs/OwlCarousel2/2.1.6/owl.carousel.min',
	'hi-base64': 'https://cdn.jsdelivr.net/hi-base64/0.2.0/base64.min',
	'webfonts': 'https://ajax.googleapis.com/ajax/libs/webfont/1.6.16/webfont',

	// Common Modules
	search: 'modules/search',

	// Individual Items
	chartcommon: 'modules/chartcommon',
	basicchart: 'chart-basic',
	simplechart: 'chart-some',
	'advancedchart': 'chart-all',
	chartoverrides: 'chartoverrides',

	//Note: Other modules are all in modules/modulename.

}


var hostname = document.location.href.match(/:\/\/(.[^/]+)/)[1];
if (!portalSettings.baseJsUrl) portalSettings.baseJsUrl = baseJsUrl;
if (!portalSettings.baseJsUrl) portalSettings.baseJsUrl = (hostname != "127.0.0.1" && hostname != "localhost") ? 'https://widgetcdn.chartiq.com/v2/js/' : 'js/';

require.config({
	baseUrl: portalSettings.baseJsUrl,
	//baseUrl: 'https://widgetcdn.chartiq.com/v2/js/',
	paths: requirePaths,
	shim: {
		'stxKernelOs': {
			exports: 'stxKernel'
		},
		'scrollingticker': {
			deps: ['modules/' + defaultSettings.dataSource, 'scrollbox']
		},
		'widgetapi': {
			deps: ['widgetutilities']
		},
		'lodash': {
			exports: '_'
		},
		'jqueryui': {
			deps: ['jquery']
		},
		'jquery': {
			exports: '$'
		},
		'datatablesresponsive': {
			deps: ['datatables.net']
		},
		'datatablesdatetime': {
			deps: ['datatables.net', 'moment']
		},
		'datatablesscroller': {
			deps: ['datatables.net']
		},
		'moment': {
			exports: 'moment'
		}


	}
});

PortalCore.serverFetch = function (url, payload, contentType, callback) {
	function getHostName(url) {
		try {
			return url.match(/:\/\/(.[^/]+)/)[1];
		} catch (e) {
			return "";
		}
	};

	function getAjaxServer(url) {
		var server = false;
		var crossDomain = true;
		if (url) {
			if (getHostName(url) == "") crossDomain = false;
			if (getHostName(url) == getHostName(window.location.href)) crossDomain = false;
		}
		if (crossDomain && window.XDomainRequest) {
			server = new XDomainRequest();
			return server;
		}
		try {
			server = new XMLHttpRequest();
		} catch (e) {
			alert("ajax not supported in browser");
		}
		return server;
	};

	function postIt(url, payload, contentType) {
		var server = getAjaxServer(url);
		if (!server) return false;
		if (!contentType) contentType = "application/x-www-form-urlencoded";
		var epoch = new Date();
		if (url.indexOf('?') == -1) url += "?" + epoch.getTime();
		else url += "&" + epoch.getTime();
		var method = payload ? "POST" : "GET";
		if (!window.XDomainRequest) {
			server.open(method, url, true);
			if (payload) server.setRequestHeader('Content-Type', contentType);
		} else {
			if (server.constructor == XDomainRequest) url = url.replace("https:", window.location.protocol);
			server.open(method, url, true);
			server.onload = function () {
				callback(server.responseText == "" ? 204 : 200, server.responseText);
			};
			server.onerror = function () {
				callback(0);
			};
			server.onprogress = function () { };
		}
		server.onreadystatechange = function () {
			if (server.readyState == 4) {
				callback(server.status, server.responseText);
			}
		};
		try {
			server.send(payload);
		} catch (e) {
			callback(0);
		}
		return true;
	};
	return postIt(url, payload, contentType);
};

PortalCore.getETUTCOffset = function (date) {
	switch (date.getMonth()) {
		case 3:
		case 4:
		case 5:
		case 6:
		case 7:
		case 8:
		case 9:
			return -240;
		case 0:
		case 1:
		case 11:
			return -300;
		case 2:
			{
				if (date.getDate() < 8) return -300;
				else if (date.getDate() >= 14) return -240;
				else if (date.getDate() % 7 > date.getDay()) {
					if (date.getDay() != 0) return -240;
					else if (date.getHours() < 3) return -300;
					else return -240;
				} else return -300;
			}
		case 10:
			{
				if (date.getDate() >= 7) return -300;
				else if (date.getDate() % 7 > date.getDay()) {
					if (date.getDay() != 0) return -300;
					else if (date.getHours() == 0) return -240;
					else if (date.getHours() == 1) { //which 1 is it?
						if ((new Date(date.getTime() - 1000 * 60 * 60)).getHours() == 0) return -240;
					}
					return -300;
				} else return -240;
			}
	}
}

PortalCore.getStyleRuleValue = function (style, selector) { //http://stackoverflow.com/questions/6338217/get-a-css-value-with-javascript

	var selector_compare = selector.toLowerCase();
	var selector_compare2 = selector_compare.substr(0, 1) === '.' ? selector_compare.substr(1) : '.' + selector_compare;

	/*try {

		for (var i = 0; i < document.styleSheets.length; i++) {
			var mysheet = document.styleSheets[i];
			var myrules = mysheet.cssRules ? mysheet.cssRules : mysheet.rules;
			if (myrules) {
				for (var j = 0; j < myrules.length; j++) {
					if (myrules[j].selectorText) {
						var check = myrules[j].selectorText.toLowerCase();
						switch (check) {
							case selector_compare:
							case selector_compare2:
								return myrules[j].style[style];
						}
					}
				}
			}

		}
	} catch (e) { // firefox :(*/
	var div = $('<div>').addClass(selector.substr(0, 1) === '.' ? selector.substr(1) : '.' + selector);
	$('body').append(div);
	var styleValue = div.css(style);
	div.remove();
	return styleValue;

	//}
}

PortalCore.mmddyyyy = function (dt) {
	var m = dt.getMonth() + 1;
	if (m < 10) m = "0" + m;
	var d = dt.getDate();
	if (d < 10) d = "0" + d;
	return m + "/" + d + "/" + dt.getFullYear();
};

PortalCore.yyyymmdd = function (dt) {
	var m = dt.getMonth() + 1;
	if (m < 10) m = "0" + m;
	var d = dt.getDate();
	if (d < 10) d = "0" + d;
	return dt.getFullYear() + "/" + m + "/" + d;
};

PortalCore.hhmmss = function (dt) {
	var h = dt.getHours();
	if (h < 10) h = "0" + h;
	var m = dt.getMinutes();
	if (m < 10) m = "0" + m;
	var s = dt.getSeconds();
	if (s < 10) s = "0" + s;
	return h + ":" + m + ":" + s;
};

PortalCore.ampmTime = function (date) {
	var ampm = "AM";
	var hrmn = date.toTimeString().split(" ")[0].split(":");
	if (hrmn[0] >= 12) ampm = "PM";
	if (hrmn[0] > 12) hrmn[0] -= 12;
	if (hrmn[0] == 0) hrmn[0] = 12;
	return Number(hrmn[0]) + ":" + hrmn[1] + ampm;
}

PortalCore.ampmTimeTz = function (date) {
	var ampm = "am";
	var tCmpnt = date.toTimeString().split(" ");
	var hrmn = tCmpnt[0].split(":");
	if (hrmn[0] >= 12) ampm = "pm";
	if (hrmn[0] > 12) hrmn[0] -= 12;
	if (hrmn[0] == 0) hrmn[0] = 12;
	var ret = Number(hrmn[0]) + ":" + hrmn[1] + ampm + " ";
	if (tCmpnt.length > 2) ret += tCmpnt.splice(2).join(" ").replace(/[\(\)]/g, "");
	else ret += tCmpnt[1];
	return ret;
}


PortalCore.xmlToDom = function (data) {
	if (window.DOMParser) {
		parser = new DOMParser();
		xmlDoc = parser.parseFromString(data, "text/xml");
	} else // Internet Explorer
	{
		xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
		xmlDoc.async = false;
		xmlDoc.loadXML(data);
	}
	return xmlDoc;
}

PortalCore.entityDecode = function (item) {
	return item.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
}

PortalCore.commaInt = function (number, naIfNull) {
	if (number == null || typeof number == "undefined") return naIfNull ? "N/A" : "";
	if (!isNaN(number)) number = number.toString();
	var txt = number;
	if (number.indexOf(".") > -1) txt = number.split(".")[0];
	var res = "";
	var cnt = 0;
	for (var x = txt.length - 1; x >= 0; x--) {
		if (txt[x] != '-') {
			if (cnt > 0 && cnt % 3 == 0) res = "," + res;
		}
		res = txt[x] + res;
		cnt++;
	}
	if (number.indexOf(".") > -1) res += "." + number.split(".")[1];
	return res;
}


PortalCore.naIfNull = function (x) {
	if (x === null || typeof (x) == "undefined") return "N/A";
	return x;
}

PortalCore.condenseInt = function (txt, naIfNull) {
	if (txt == null || typeof txt == "undefined") return naIfNull ? "N/A" : "";
	if (txt > 0) {
		if (txt > 1000000000) txt = Math.round(txt / 10000000) / 100 + "b";
		else if (txt > 1000000) txt = Math.round(txt / 10000) / 100 + "m";
		else if (txt > 1000) txt = Math.round(txt / 10) / 100 + "k";
		else txt = txt.toFixed(0);
	} else {
		if (txt < -1000000000) txt = Math.round(txt / 10000000) / 100 + "b";
		else if (txt < -1000000) txt = Math.round(txt / 10000) / 100 + "m";
		else if (txt < -1000) txt = Math.round(txt / 10) / 100 + "k";
		else txt = txt.toFixed(0);
	}
	return txt;
};

PortalCore.queryStringValues = function (name, qs) {
	var res = [];
	if (qs.indexOf("?") == 0) qs = qs.substr(1);
	else if (qs.indexOf("#") == 0) qs = qs.substr(1);
	var parms = qs.split("&");
	for (var p = 0; p < parms.length; p++) {
		var t = parms[p].split("=");
		if (decodeURI(t[0]) == name) res.push(decodeURIComponent(t[1]));
	}
	return res;
}

PortalCore.buildLink = function (linkURL, symbol, text) {
	// external link
	if (linkURL.startsWith('http://') || linkURL.startsWith('https://')) {
		//replace {SYMBOL} with symbol
		return '<a target="_blank" href="' + linkURL.replace('{SYMBOL}', symbol) + '">' + text + '</a>';
	} else if (linkURL.startsWith('javascript:')) {
		return '<a href="' + linkURL.replace('{SYMBOL}', symbol) + '">' + text + '</a>';
	} else {
		return PortalCore.buildInternalLink(linkURL, symbol, text);
	}

}

PortalCore.buildInternalLink = function (linkURL, symbol, text) {
	var splitURL = linkURL.split('?');

	var value1Page = splitURL[0];
	value1Page = value1Page.split('#')[0];
	value1Page = value1Page.split('/');
	value1Page = value1Page[value1Page.length - 1];

	var value1P = splitURL[1];
	if (value1P) value1P = value1P.split('&');
	else value1P = [];
	value1P = PortalCore.getUrlParameters(value1P);

	var locationP = urlParams;
	if (symbol) locationP['sym'] = symbol;
	if (locationP.customsettings) delete locationP.customsettings;

	var params = _.merge(locationP, value1P);
	params = '?' + $.param(params);

	return '<a href="' + splitURL[0] + params + '">' + text + '</a>';
}

PortalCore.buildNavigation = function () {
	var navigation = portalSettings.navigation;
	if (navigation) PortalCore.buildList('.ciq-nav', navigation);
}

/*
	parent: id/class of parent for jQuery -> e.g. #ciq-nav or .ciq-nav
	navigation: List of Items in Menu = [[name, link], [name,link]]
	activeItem: string matching active item (TODO for subnavigation)
*/
PortalCore.buildList = function (parentOfList, navigation, symbol) {
	// TODO: exceptions to items to pass
	var exceptions = ['customcss', 'customsettings'];

	if (navigation.length) {
		var page = location.pathname.split('/');
		page = page[page.length - 1];

		_.forEach(navigation, function (value) {
			var active = '';
			var link;
			var params = '';
			if (value[1].startsWith('javascript:')) {
				link = value[1];
			} else {
				var value1Page = value[1].split('?')[0];
				link = value[1].split('?')[0];
				value1Page = value1Page.split('#')[0];
				value1Page = value1Page.split('/');
				value1Page = value1Page[value1Page.length - 1];
				//get query strings
				var value1P = value[1].split('?')[1];
				if (value1P) value1P = value1P.split('&');
				else value1P = [];
				var value1P = PortalCore.getUrlParameters(value1P);
				var locationP = urlParams;
				if (symbol) locationP['sym'] = symbol;

				params = _.merge(locationP, value1P);
				params = '?' + $.param(params);
			}

			if (portalSettings.parentNav) {
				if (portalSettings.parentNav == value[0]) active = ' class = "active"';
			}
			if (page == value1Page) active = ' class = "active"';
			if (value[2]) active = ' class="active"';
			var linkURL = link + params;



			$(parentOfList + ' ul').append('<li' + active + '><a ' + ((linkURL.startsWith('http://') || linkURL.startsWith('https://')) ? 'target="_blank"' : '') + ' href="' + linkURL + '">' + value[0] + '</a></li>');
		});



		//$(parentOfList).css("display", "block");
	} else {
		//$(parentOfList).css("display", "none");
	}
}

window.addedStylesheets = [];

PortalCore.addStyleSheet = function (url) {
	// Check if stylesheet already exists
	for (var i = 0; i < document.styleSheets.length; i++) {
		var styleSheet = document.styleSheets[i];
		if (styleSheet.href == url) {
			return;
		}
	}

	if (_.includes(addedStylesheets, url)) return;
	addedStylesheets.push(url);

	$('<link>')
		.appendTo('head')
		.attr({
			type: 'text/css',
			rel: 'stylesheet'
		})
		.attr('href', url);
}

PortalCore.updateUrlParameter = function (uri, key, value) {
	// remove the hash part before operating on the uri
	var i = uri.indexOf('#');
	var hash = i === -1 ? '' : uri.substr(i);
	uri = i === -1 ? uri : uri.substr(0, i);

	var re = new RegExp("([?&])" + key + "=.*?(&|$)", "i");
	var separator = uri.indexOf('?') !== -1 ? "&" : "?";
	if (uri.match(re)) {
		uri = uri.replace(re, '$1' + key + "=" + value + '$2');
	} else {
		uri = uri + separator + key + "=" + value;
	}
	return uri + hash; // finally append the hash as well
}

require(['lodash', 'jquery', 'hi-base64'], function () {
	window._ = _;
	$(document).ready(function () {
		if (!defaultSettings) defaultSettings = {};
		//portalSettings = _.assign(portalSettings, defaultSettings);

		// check if we have default settings in the URL
		var customSettings = urlParams['customsettings']; //, location.search);
		if (customSettings) {
			customSettings = base64.decode(customSettings);
			customSettings = JSON.parse(customSettings);
			defaultSettings = _.assign(defaultSettings, customSettings);
		}

		var customSettingsUrl = urlParams['customsettingsurl'];
		if (customSettingsUrl) {
			/*PortalCore.serverFetch(customSettingsUrl, null, null, function (status, result) {
				if (status == 200) {
					result = JSON.parse(result);
					defaultSettings = _.assign(defaultSettings, result);
				}
				customSettingsAreLoaded();
			});*/
			$.ajax({
				url: customSettingsUrl,
				type: "GET",
				dataType: "jsonp",
				jsonpCallback: "chartiq_portal_magic",
				success: function (result) {
					defaultSettings = _.assign(defaultSettings, result);
					customSettingsAreLoaded();
				},
				error: function (xhr, ajaxOptions, thrownError) {
					alert(thrownError);
					customSettingsAreLoaded();
				}
			});
		} else {
			customSettingsAreLoaded();
		}

		function customSettingsAreLoaded() {
			/*if (!defaultSettings.dataSource) defaultSettings.dataSource = portalSettings.dataSource;
			else portalSettings.dataSource = defaultSettings.dataSource;*/

			portalSettings = _.assign(portalSettings, defaultSettings);

			if (urlParams['sharedInfo']) {
				var sharedInfo = PortalCore.ShareService.loadSharedInfo();
				sharedInfo = JSON.parse(sharedInfo);
				if (sharedInfo) {
					if (sharedInfo.widgetId && portalSettings.items[sharedInfo.widgetId]) {
						if (sharedInfo.itemType = portalSettings.items[sharedInfo.widgetId].itemType) {
							portalSettings.items[sharedInfo.widgetId].sharedData = sharedInfo.data;
						}
					}
				}
			}

			//if not defined, look locally.
			var dataSource = 'modules/' + portalSettings.dataSource;
			window.quoteFeed = 'quoteFeed' + portalSettings.dataSource.charAt(0).toUpperCase() + portalSettings.dataSource.slice(1);

			var symbol = urlParams['sym']; //, location.search);
			if (symbol) portalSettings.defaultSymbol = symbol;
			portalSettings.defaultSymbol = portalSettings.defaultSymbol.toUpperCase();

			var items = [];
			PortalCore.itemTypes = {};
			var itemTypes = PortalCore.itemTypes;

			if (portalSettings.themeCSS) {
				window.cssUrl = portalSettings.themeCSS;
			}

			if (!window.cssUrl) window.cssUrl = (hostname != "127.0.0.1" && hostname != "localhost") ? 'https://widgetcdn.chartiq.com/v2/css/' : 'css/';

			PortalCore.addStyleSheet(cssUrl + 'normalize.css');
			PortalCore.addStyleSheet(cssUrl + 'portalcore.css');

			// get DPI for responsiveness - http://stackoverflow.com/questions/279749/detecting-the-system-dpi-ppi-from-js-css
			/*function findFirstPositive(b, a, i, c) {
				c = (d, e) => e >= d ? (a = d + (e - d) / 2, 0 < b(a) && (a == d || 0 >= b(a - 1)) ? a : 0 >= b(a) ? c(a + 1, e) : c(d, a - 1)) : -1
				for (i = 1; 0 >= b(i);) i *= 2
				return c(i / 2, i) | 0
			}

			window.pixelsPerInch = findFirstPositive(x => matchMedia(`(max-resolution: ${x}dpi)`).matches);

			if (!window.pixelsPerInch) window.pixelsPerInch = 96;*/
			/*var dpiDiv = $('<div>').attr('id', 'resolution').css('width', '1cm');
			$('body').append(dpiDiv);
			window.pixelsPerInch = dpiDiv.width() * 2.54;
			dpiDiv.remove();*/

			var count = 0;

			// get all the visible items and create the page layout
			var processItems = function (itemList, depth, parentDiv, width) {
				if (width > 100) width = 100;
				if (_.isString(itemList)) {
					var itemType;
					if (itemList != 'navigation' && itemList != 'search' && itemList != 'subnavigation') {
						items.push(portalSettings.items[itemList]);
						itemType = portalSettings.items[itemList].itemType;
					} else {
						itemType = itemList;
					}
					if (!itemTypes[itemType]) itemTypes[itemType] = [];
					itemTypes[itemType].push(itemList);
					var div = $('<div>').addClass('ciq-' + itemType).addClass('ciq-' + depth + '-div').addClass('ciq-container ciq-element-container').attr('id', 'ciq-' + itemList).css('display', 'none').css('width', width + '%');
					if (width != 100) {
						div.css('float', 'left');
					} else {
						div.css('clear', 'both');
					}
					div.appendTo(parentDiv);
					return true;
				} else {
					var length = 1
					if (Array.isArray(itemList)) {
						length = 0;
						_.each(itemList, function (value) {
							if (value.colSpan) length += value.colSpan
							else length++;
						});
					}

					var title, divName;
					var colSpan = 1; //rowspan??
					if (_.isObject(itemList) && !Array.isArray(itemList)) {
						title = itemList.title;
						divName = itemList.class + " ciq-widget-group";
						itemList = itemList.items;
						colSpan = itemList.colSpan ? itemList.colSpan : 1;
					}
					var id = 'ciq-' + depth + '-div' + count;
					count++;
					var div = $('<div>').addClass('ciq-' + depth + '-div').addClass('ciq-container').attr('id', id).css('width', width + '%');
					if (title) {
						div.html('<h2>' + title + '</h2>');
					}
					if (divName) {
						div.addClass(divName);
					}
					if (width != 100) {
						div.css('float', 'left');
					} else {
						div.css('clear', 'both');
					}
					div.appendTo(parentDiv);
					if (depth == '') width = 100;
					else width = 100 / length;
					_.each(itemList, function (value) {
						var multiplier = value.colSpan ? value.colSpan : 1;
						return processItems(value, 'sub' + depth, '#' + id, width * multiplier);
					});
				}
			}
			var doneProcessing = processItems(portalSettings.layout, '', 'body', 100); //Force sync operation
			window.itemTypes = itemTypes;
			//globals.items = items;

			// responsive layout
			resizeScreen = function (event, force) {
				if (typeof parentIFrame !== 'undefined') parentIFrame.getPageInfo(PortalCore.getParentInfo);
				else {
					var parentInfo = {
						clientHeight: $(window).height()
					}
					PortalCore.getParentInfo(parentInfo);
				}

				if (!PortalCore.prevWidth) PortalCore.prevWidth = 0;

				PortalCore.newWidth = $(window).width();
				if (!force && Math.abs(PortalCore.newWidth - PortalCore.prevWidth) < 30) return;

				var count = 0;
				var recalculateLayout = function (itemList, depth, parentDiv, width) {
					if (width > 100) width = 100;
					if (_.isString(itemList)) {
						var itemType;
						/*if (itemList != 'navigation' && itemList != 'search' && itemList != 'subnavigation') {
							itemType = defaultSettings.items[itemList].itemType;
						} else {
							itemType = itemList;
						}*/
						//if (!itemTypes[itemType]) itemTypes[itemType] = [];
						//itemTypes[itemType].push(itemList);
						var div = $('#ciq-' + itemList);
						div.css('width', width + '%').css('overflow', 'none');
						if (width != 100) {
							div.css('float', 'left');
							div.css('clear', '');
						} else {
							div.css('clear', 'both');
							div.css('float', '');
						}
						var widthInPixels = div.width();
						if (widthInPixels < 450) {
							div.removeClass('medium').removeClass('large').removeClass('xlarge');
							div.addClass('small');
						} else if (widthInPixels < 900) {
							div.removeClass('small').removeClass('large').removeClass('xlarge');
							div.addClass('medium');
						} else if (widthInPixels < 1350) {
							div.removeClass('small').removeClass('medium').removeClass('xlarge');
							div.addClass('large');
						} else {
							div.removeClass('small').removeClass('medium').removeClass('xlarge');
							div.addClass('xlarge');
						}

						//div.appendTo(parentDiv);
						return true;
					} else {
						var length = 1;
						if (Array.isArray(itemList)) {
							length = 0;
							_.each(itemList, function (value) {
								if (value.colSpan) length += value.colSpan
								else length++;
							});
						}

						var colSpan = 1;
						if (_.isObject(itemList) && !Array.isArray(itemList)) {
							itemList = itemList.items;
							length = 1;
							if (Array.isArray(itemList)) {
								length = 0;
								_.each(itemList, function (value) {
									if (value.colSpan) length += value.colSpan
									else length++;
								});
							}
							colSpan = itemList.colSpan ? itemList.colSpan : 1;
						}
						var id = 'ciq-' + depth + '-div' + count;
						count++;
						var div = $('#' + id);
						div.css('width', width + '%').css('overflow', 'none');
						if (width != 100) {
							div.css('float', 'left');
							div.css('clear', '');
						} else {
							div.css('clear', 'both');
							div.css('float', '');
						}
						//div.appendTo(parentDiv);
						if (depth == '') width = 100;
						else {
							width = 100 / length;
							//var widthInInches = ($(window).width() * width / 100) / pixelsPerInch;
							var widthInPixels = div.width() * width / 100;
							//if (widthInInches < 2) {
							if (widthInPixels < 300) {
								if (itemList.length % 2) {
									width = 100;
								} else {
									width = width * 2;
								}
							}



						}
						_.each(itemList, function (value) {
							var multiplier = value.colSpan ? value.colSpan : 1;
							return recalculateLayout(value, 'sub' + depth, '#' + id, width * multiplier);
						});
					}
				}
				var recalculatedLayout = recalculateLayout(portalSettings.layout, '', 'body', 100);

				// SubNavigation
				_.each($('.ciq-SubNavigation'), function (value) {
					var subNavigation = $(value);
					if (subNavigation.hasClass('small')) {
						subNavigation.children('span').first().css('display', 'block')
						subNavigation.children('div').first().css('display', 'none')
					} else {
						subNavigation.children('span').first().css('display', 'none')
						subNavigation.children('div').first().css('display', 'block')
					}
				});

				PortalCore.prevWidth = PortalCore.newWidth;

				_.each(PortalCore.PostResizeCalls, function (postResizeCall) {
					postResizeCall(force);
				});
			}
			$(window).on('resize', _.debounce(resizeScreen, 125));

			// dark logos in footer for dark themes
			var darkLogos = '';
			//if (_.isBoolean(portalSettings.darkLogos)) portalSettings.darkLogos = portalSettings.darkLogos;
			if (portalSettings.darkLogos) darkLogos = "-dark";

			if (!portalSettings.hideLogos) {
				$('body').append('<div class="ciq-footer" style="clear:both"><p style="text-align:center; vertical-align:middle;"><a href="http://www.xignite.com" target="_blank" title="Market Data by Xignite"><img src="https://widgetcdn.chartiq.com/img/xignite-logo' + darkLogos + '.png" height="17" style="padding-bottom:3px"/></a>&nbsp;&nbsp;<a href="http://www.chartiq.com" target="_blank" title="Built by ChartIQ"><img src="https://widgetcdn.chartiq.com/img/chartiq-logo' + darkLogos + '.png" height="25" /></a></p></div>');
			}
			// tag for iframeResizer
			$('body').append('<div id="ciq-bottom-finder" data-iframe-height="true" style="clear:both"></div>');

			// which chart library to use?
			var chartLibraryChoice = ['basicchart', 'simplechart', 'advancedchart'];
			var chartLibrary = -1;
			_.each(itemTypes, function (value, key) {
				switch (key) {
					case 'BasicChart':
					case 'RatesChart':
					case 'SparkChart':
						if (chartLibrary < 0) chartLibrary = 0;
						break;
					case 'SimpleChart':
						if (chartLibrary < 1) chartLibrary = 1;
						break;
					case 'search':
					case 'Search':
						break;
					case 'navigation':
					case 'Navigation':
						break;

					case 'AdvancedChart':
						break;


				}
			});
			if (chartLibrary >= 0) {
				chartLibrary = chartLibraryChoice[chartLibrary];
				window.availableChartLibrary = chartLibrary;
			}

			// analyze dependencies - if item settings do not have dependsOn property - add to noDepItems and load those
			window.dependencies = {};
			PortalCore.noDepItems = {};
			var noDepItems = PortalCore.noDepItems;
			_.each(itemTypes, function (value, key) {
				_.each(value, function (value2) {
					var settings = portalSettings.items[value2];
					if (settings && settings.dependsOn) {
						if (!_.isArray(settings.dependsOn)) {
							settings.dependsOn = [settings.dependsOn]
						}
						_.each(settings.dependsOn, function (value3) {
							if (!window.dependencies[value3]) {
								window.dependencies[value3] = {
									data: {},
									items: [value2]
								};
							} else {
								window.dependencies[value3].items.push(value2);
							}
						})
					} else if (settings) {
						if (!noDepItems[settings.itemType]) {
							noDepItems[settings.itemType] = [value2];
						} else {
							noDepItems[settings.itemType].push(value2);
						}
					} else {
						if (!noDepItems[value2]) {
							noDepItems[value2] = [value2];
						} else {
							noDepItems[value2].push(value2);
						}
					}
				});
			});

			PortalCore.refreshableItems = [];

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

			// populate all the items
			PortalCore.loadItems = function (items) {

				_.each(items, function (value, key) {
					if (!userSettings.widgets[key.toLowerCase()] && !userSettings.widgets[key]) return; // two checks is because of boneheaded move in setup creation that cannot be reversed without a lot of pain.
					_.each(value, function (widgetId) {
						if (portalSettings.items[widgetId].circularDependsOn) {
							//portalSettings.items[widgetId].dependsOn = portalSettings.items[widgetId].circularDependsOn;
							//delete (portalSettings.items[widgetToUpdate].circularDependsOn);
							if (!_.isArray(portalSettings.items[widgetId].circularDependsOn)) {
								portalSettings.items[widgetId].circularDependsOn = [portalSettings.items[widgetId].circularDependsOn]
							}
							_.each(portalSettings.items[widgetId].circularDependsOn, function (value3) {
								if (!window.dependencies[value3]) {
									window.dependencies[value3] = {
										data: {},
										items: [widgetId]
									};
								} else {
									window.dependencies[value3].items.push(widgetId);
								}
							})
						}
					})
				})

				_.each(items, function (value, key) {
					//var chartCSS = false;
					if (!userSettings.widgets[key.toLowerCase()] && !userSettings.widgets[key]) return;
					// Items that can be reloaded by postmessage (TODO: need to deal with navigation)
					_.each(value, function (value2) {
						if (portalSettings.items[value2] && !portalSettings.items[value2].symbol) {
							PortalCore.refreshableItems.push(value2);
						}
					});

					var navigation = portalSettings.navigation;
					//if (defaultSettings.navigation) navigation = defaultSettings.navigation;
					var subNavigation = portalSettings.subNavigation;
					//if (defaultSettings.subNavigation) subNavigation = defaultSettings.subNavigation;

					switch (key) {
						// deal with special modules - TODO convert these to something that follows the generic pattern
						case 'Navigation':
							_.each(value, function (value2) {
								var container = 'ciq-' + value2;
								var settings = portalSettings.items[value2];
								if (settings.message && settings.message.data && settings.message.data.symbol) {
									settings.symbol = settings.message.data.symbol;
								}
								if (!settings.navigation) settings.navigation = navigation;
								var containerObject = $('#' + container);
								containerObject.html('');
								containerObject.append('<ul>').addClass('ciq-nav');
								if (settings.navigation.length) {
									PortalCore.buildList('#' + container, settings.navigation, settings.symbol);
									containerObject.show();
								}
							});
							PortalCore.addStyleSheet(cssUrl + 'modules/navigation.css');
							break;
						/*case 'navigation':
							if (navigation) {
								//require(['widgetutilities'], function () {
								//var list = $('<div>').addClass('ciq-nav').attr('id', 'ciq-nav').appendTo('body');
								$('#ciq-navigation').html('');
								$('#ciq-navigation').append('<ul>').addClass('ciq-nav');
								PortalCore.buildList('.ciq-navigation', navigation);

								//});
							}
							break;*/
						case 'SubNavigation':
							_.each(value, function (value2) {
								var container = 'ciq-' + value2;
								var settings = portalSettings.items[value2];
								if (settings.message && settings.message.data && settings.message.data.symbol) {
									settings.symbol = settings.message.data.symbol;
								}
								if (!settings.navigation) settings.navigation = subNavigation;
								var containerObject = $('#' + container);

								containerObject.html('<span class="hamburger" onclick="$(\'#' + container + '-nav\').toggle()"></span>');
								var subnavDiv = $('<div>').attr('id', container + '-nav');
								subnavDiv.append('<ul>').addClass('ciq-subnav');
								containerObject.append(subnavDiv);
								if (settings.navigation.length) {
									PortalCore.buildList('#' + container + '-nav', settings.navigation, settings.symbol);
									if (containerObject.hasClass('small')) {
										$('#' + container + ' .hamburger').show();
										$('#' + container + '-nav').hide();
									};
									containerObject.show();
								}

							});
							PortalCore.addStyleSheet(cssUrl + 'modules/subnavigation.css');
							break;
						case 'Image':
							_.each(value, function (value2) {
								var container = 'ciq-' + value2;
								var imageSettings = portalSettings.items[value2];
								var containerObject = $('#' + container);
								var html = '<img src="' + imageSettings.url + '" style="width:auto;"></img>';
								if (imageSettings.link)
									containerObject.html(PortalCore.buildLink(imageSettings.link, '', html));
								else
									containerObject.html(html);
								containerObject.show();

							});
							break;
						case 'HTML':
							_.each(value, function (value2) {
								var container = 'ciq-' + value2;
								var htmlSettings = portalSettings.items[value2];
								if (settings.message && settings.message.data && settings.message.data.symbol) {
									settings.symbol = settings.message.data.symbol;
								}
								var containerObject = $('#' + container);
								var html = htmlSettings.html.valueOf();
								if (htmlSettings.replaceSymbol) {
									var symbol = settings.symbol ? settings.symbol : portalSettings.defaultSymbol;
									html = html.replace("{SYMBOL}", symbol);
								}
								containerObject.html(html);
								containerObject.show();
							});
							break;
						case 'BasicChart':
						case 'SimpleChart':
						case 'SparkChart':
							require(['chartcommon'], function () {
								chart(key, value);
							});


							break;

						case 'AdvancedChart':
							require(['modules/advancedchart'], function () {
								advancedchart(value);
							});
							break;

						case 'RatesChart':
							require([dataSource, chartLibrary, 'modules/rateschart'], function () {
								rateschart(value);
							});
							break;

						default:

							// Looks for the right module and the module file needs to take care of everything
							var module = key.toLowerCase();
							/*var modulePath = module;
							if (!modulePath) {*/
							modulePath = 'modules/' + module;
							//}
							require([dataSource, modulePath], function () {
								setTimeout(key.toLowerCase() + "('" + JSON.stringify(value) + "')", 0);
							});
							PortalCore.addStyleSheet(cssUrl + 'modules/' + module + '.css');

							break;
					}




					//if (chartCSS) {

					//}
					ga('send', 'event', 'widget', 'load', key);

				});
				$(window).trigger('resize');



			}

			PortalCore.loadItems(PortalCore.noDepItems);
			var customStyleUrl = urlParams['customstylesheeturl'];
			if (customStyleUrl) {
				PortalCore.addStyleSheet(customStyleUrl);
			}
		}

		// TODO: invisible dependencies



		PortalCore.loadDependencies = function (widgetId, message, force) {
			//debugger;
			if (dependencies[widgetId]) {
				var newItems = {};
				_.each(dependencies[widgetId].items, function (widgetToUpdate) {
					//added check to see if something has really changed. TODO: can be optimized.
					/*var currentSettings = portalSettings.items[value];
					var changes = false;
					_.each(data, function (v, k) {
						if (currentSettings[k] != v) {
							changes = true;
						}
					});
					if (changes || !data) { // if no data then initial load
						_.assign(portalSettings.items[value], data);
						if (!newItems[portalSettings.items[value].itemType]) {
							newItems[portalSettings.items[value].itemType] = [value];
						} else {
							newItems[portalSettings.items[value].itemType].push(value);
						}
					}*/
					var oldMessage = portalSettings.items[widgetToUpdate].message;

					if (force || !message || !message.data || !oldMessage || (oldMessage && oldMessage.data && !_.isEqual(message.data, oldMessage.data))) {
						portalSettings.items[widgetToUpdate].message = message;
						if (!newItems[portalSettings.items[widgetToUpdate].itemType]) {
							newItems[portalSettings.items[widgetToUpdate].itemType] = [widgetToUpdate];
						} else {
							newItems[portalSettings.items[widgetToUpdate].itemType].push(widgetToUpdate);
						}

					}
				});
				PortalCore.loadItems(newItems);
				setTimeout(function () {
					resizeScreen(null, true);
				}, 500);
			}

		}

		PortalCore.sendMessage = function (message, force) {
			switch (message.subject) {
				case 'symbolChange':
					PortalCore.loadDependencies(message.sender, message, force);
					break;
				case 'quoteSync':
					if (typeof noFetchUpdate === 'function') {
						noFetchUpdate(message.data, message.sender);
					}
					break;
				case 'rateFamilyChange':
					PortalCore.loadDependencies(message.sender, message, force);
					break;
				case 'customCallback':
					message.callback(message);
					break;
				default:
					PortalCore.loadDependencies(message.sender, message, force);
					break;

			}
		}




		PortalCore.receiveMessage = function (e) {
			if (!_.isString(e.data)) return;
			var message = JSON.stringify(e.data);

			switch (message.subject) {
				case 'symbolChange':
					var symbol = message.symbol;
					if (symbol) {
						symbol = symbol.toUpperCase();
						var newItems = {}
						_.each(PortalCore.refreshableItems, function (value) {
							_.assign(portalSettings.items[value], { symbol: symbol });
							if (!newItems[portalSettings.items[value].itemType]) {
								newItems[portalSettings.items[value].itemType] = [value];
							} else {
								newItems[portalSettings.items[value].itemType].push(value);
							}
						});

						PortalCore.loadItems(newItems);

					}
					break;

			}

		}

		window.addEventListener('message', PortalCore.receiveMessage, false);

		var webFonts = portalSettings.webFonts;
		if (webFonts) {
			require(['webfonts'], function () {
				arguments[0].load({
					google: {
						families: portalSettings.webFonts
					}
				});
			});
		}


		ga('send', 'pageview');


	});

});