if (typeof _ == 'undefined') _ = parent._;

var apiToken = null;
var encryptedToken = {};
var needsEncryption = true;


var xignite = function () { };
if (!window.dataSources) window.dataSources = {};
//if (!window.dataSources.xignite) window.dataSources.xignite = function() {};

//Returns true if it has a valid token already
xignite.setXigniteEncryptedToken = function (override, testOnly, polling, cb) {
	if (polling) {
		setTimeout(function (o) {
			return function () {
				xignite.setXigniteEncryptedToken(o, testOnly, polling);
			};
		}(override), 10000);
	}
	var mySite = location.pathname.split("/").slice(1, 3).join("/");
	var token;
	if (!override.token) {
		token = localStorage.getItem("Xignite.token");
		if (token) {
			token = JSON.parse(token);
			if (token.site == mySite) {
				override.token = token.token;
				override.tokenUser = token.userid;
				override.tokenExpiration = token.expires;
			}
		}
	}
	if (override.tokenExpiration) {
		if (override.tokenExpiration - 300000 > Date.now()) {
			if (cb) cb(token);
			return true; // not within 5 minutes of expiration
		}
	}
	if (testOnly) return false;
	var url = "data/xignite_token/";
	if (portalSettings.dataSourceSettings && portalSettings.dataSourceSettings.useDevServices) url = "https://devservices.chartiq.com/demodata/xignite_token/";
	PortalCore.serverFetch(url, null, null, function (status, response) {
		if (status == 200) {
			try {
				response = JSON.parse(response);
				override.tokenUser = response.userid;
				override.token = response.token;
				override.tokenExpiration = Date.now() + 1800000; //30 minutes
				token = {
					"token": override.token,
					"userid": override.tokenUser,
					"expires": override.tokenExpiration,
					"site": mySite
				};
				localStorage.setItem("Xignite.token", JSON.stringify(token));
				if (CIQ) {
					CIQ.QuoteFeed.Xignite.Utility.overrides.token = override.token
					CIQ.QuoteFeed.Xignite.Utility.overrides.tokenUser = override.tokenUser
				}
				if (cb) cb(override.token);

			} catch (e) { }
		}
	});
	return false;
};

if (!apiToken && needsEncryption) xignite.setXigniteEncryptedToken(encryptedToken, false, true);

xignite.makeUrl = function (path) {
	function getHostName() {
		var url = document.location.href;
		try {
			return url.match(/:\/\/(.[^/]+)/)[1];
		} catch (e) {
			return "";
		}
	}

	function urlBase(topDir) {
		var hostname = getHostName();
		var base = "data";
		if (apiToken) base = "https://devservices.chartiq.com" + (topDir ? "/" + topDir : "");
		else if (needsEncryption) {
			var baseParts = topDir.split('_');
			if (['www','chartiq','factsetestimates','globaloptions','globalcurrencies','globalmetals'].includes(baseParts[0])) {
				base = "https://" + topDir.replace(/_/, ".") + ".com";
			} else {
				base = "https://" + topDir.replace(/_/, "-chartiq.") + ".com";
			}
		} else if (hostname == "127.0.0.1" || hostname == "localhost") base = "https://devservices.chartiq.com/data" + (topDir ? "/" + topDir : "");
		else base += "/" + topDir;
		return base;
	}
	if (path[0] == "/") path = path.substr(1);
	var dirs = path.split("/");
	var url;
	/*if (dirs[0]=='historical_currencies_bugfix') {
		dirs.shift();
		url = 'https://globalcurrencies.xignite.com'
	} else {*/
	url = urlBase(dirs.shift());
	//}
	url += "/" + dirs.join("/");
	if (apiToken) {
		if (url.indexOf('?') == -1) url += "?_Token=" + apiToken;
		else url += "&_Token=" + apiToken;
	} else if (needsEncryption && encryptedToken.token) {
		if (url.indexOf('?') == -1) url += "?_Token=" + encryptedToken.token;
		else url += "&_Token=" + encryptedToken.token;
		url += "&_Token_Userid=" + encryptedToken.tokenUser;
	}
	return url;
};



xignite.fetchMarketHeadlines = function (settings, cb, extraParams) {
	if (!xignite.setXigniteEncryptedToken(encryptedToken, false, true)) {
		setTimeout(function (self, args) {
			return function () {
				xignite.fetchMarketHeadlines.apply(self, args);
			};
		}(this, arguments), 100);
		return;
	}

	var limit = 5;
	var showImages = false;
	if (settings) {
		if (settings.numberOfItems) limit = settings.numberOfItems;
		if (settings.showImages) showImages = settings.showImages;
	}

	var url = xignite.makeUrl("/globalnews_xignite/xGlobalNews.json/GetTopMarketSummaries?Count=" + limit);
	PortalCore.serverFetch(url, null, null, function (status, result) {
		if (status != 200) cb("Service Unavailable", null, extraParams);
		result = JSON.parse(result);
		if (!result.HeadlineSummaries) {
			cb("No News", null, extraParams);
			return;
		}
		var count = 0;
		var items = [];
		for (var s = 0; s < result.HeadlineSummaries.length; s++) {
			var item = result.HeadlineSummaries[s];
			item.Subject = PortalCore.entityDecode(item.Title);
			delete item.Title;
			if (item.Images.length) item.Image = item.Images[0];
			delete item.Images;
			if (item.Image && location.protocol == "https:" && item.Image.indexOf("http:") == 0) {
				item.Image = "https:" + item.Image.substr(5);
			}
			if (item.Image) item.Image = PortalCore.entityDecode(item.Image);
			item.Date = new Date(item.Date + " " + item.Time);
			if (item.Time) item.Date.setMinutes(item.Date.getMinutes() - item.UTCOffset * 60 - item.Date.getTimezoneOffset());
			delete item.Time;
			items.push(item);
		}
		cb(null, items, extraParams);
	});

}

xignite.fetchSecurityHeadlines = function (settings, cb, extraParams) {
	if (!xignite.setXigniteEncryptedToken(encryptedToken, false, true)) {
		setTimeout(function (self, args) {
			return function () {
				xignite.fetchSecurityHeadlines.apply(self, args);
			};
		}(this, arguments), 100);
		return;
	}

	var url = xignite.makeUrl("/globalnews_xignite/xGlobalNews.json/GetTopSecuritySummaries?IdentifierType=Symbol&Identifier=" + encodeURIComponent(settings.symbol) + "&Count=" + settings.limit + "&_fields=HeadlineSummaries.Title,HeadlineSummaries.Date,HeadlineSummaries.Time,Headlines.UTCOffset,HeadlineSummaries.Source,HeadlineSummaries.Url,HeadlineSummaries.Images,HeadlineSummaries.Images.string,HeadlineSummaries.Summary");
	PortalCore.serverFetch(url, null, null, function (status, result) {
		if (status != 200) {
			cb("Data Source Error", null, extraParams);
			return;
		}
		result = JSON.parse(result);
		if (!result.HeadlineSummaries) {
			cb("No News", {
				'settings': settings,
				items: []
			}, extraParams);
			return;
		}
		var count = 0;
		var items = [];
		for (var s = 0; s < result.HeadlineSummaries.length; s++) {
			var item = result.HeadlineSummaries[s];
			item.Subject = PortalCore.entityDecode(item.Title);
			delete item.Title;
			if (item.Images.length) item.Image = item.Images[0];
			delete item.Images;
			if (item.Image && location.protocol == "https:" && item.Image.indexOf("http:") == 0) {
				item.Image = "https:" + item.Image.substr(5);
			}
			if (item.Image) item.Image = PortalCore.entityDecode(item.Image);
			item.Date = new Date(item.Date + " " + item.Time);
			if (item.Time) item.Date.setMinutes(item.Date.getMinutes() - item.UTCOffset * 60 - item.Date.getTimezoneOffset());
			delete item.Time;
			items.push(item);
		}
		cb(null, {
			'settings': settings,
			'items': items
		}, extraParams);
	});


}



window.dataSources.xignite = xignite;