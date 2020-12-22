/***********************************************************************************************************************
	Copyright 2017-2020 by ChartIQ, Inc.
	Licensed under the ChartIQ, Inc. Developer License Agreement https://www.chartiq.com/developer-license-agreement
 **********************************************************************************************************************/
define(['https://cdnjs.cloudflare.com/ajax/libs/jquery.perfect-scrollbar/0.6.16/js/perfect-scrollbar.js'], function (Ps) {
	//This code is pulled in by the widgets site. It's run inside of the iframe that
	//marketsOverview embeds.
	var userSettings = {
		/*'portal' : {
			'markets' : true,
			'overview' : true,
			'news' : true,
			'company': true,
			'financials': true,
			'filings': true,
			'insiders' : true,
			'advancedchart': true
		},*/ // widgets below should automatically take care of the portal
		'widgets': {
			'navigation': true,
			'subnavigation': true,
			'search': true,
			'sparkchart': true,
			'basicchart': true,
			'simplechart': true,
			'advancedchart': true,
			'scrollingticker': true,
			'marketsnews': true,
			'tickernews': true,
			'topmovers': true,
			'sectorperformance': true,
			'rates': true,
			'rateschart': true,
			'financials': true,
			'filings': true,
			'insiderchart': true,
			'insiders': true,
			'quote': true,
			'fundamentals': true,
			'fundamentalchart': true,
			'regionchart': true,
			'piechart': true,
			'sidebar': true,
			'carousel': true,
			'economiccalendar': true,
			'earningscalendar': true,
			'image': true,
			'quoteboard': true,
			'carousel': true,
			'recommendations': true,
			'bidask': true,
			'blotter': true,
			'finsemble': true,
		},

		'data': {
			'internationalQuotes': [],
			/*'realtimeQuotes' : [],
			'delayedIndices' : [],
			'realtimeIndices' : [],*/ //dont care, fetchquotes should take care of this.
			'fundFundamentals': true,
			'calendar': true
		}
	};

	/* default global portal settings */
	var portalSettings = {
		"navigation": [
			["Markets", "markets.html"],
			["Research", "overview.html"],
			["Chart", "chart.html"],
			["Calendar", "economiccalendar.html"],
		],

		"subnavigation": [
			['Overview', 'overview.html'],
			['Financials', 'financials.html'],
			['Filings', 'filings.html'],
			['Insiders', 'insiders.html'],
			['News', 'news.html'],
			['Company', 'company.html'],
		],

		searchExchanges: [
			"XNYS",
			"XASE",
			"ARCX",
			"XNAS",
			"OOTC",
			"metals",
			"forex",
			"mutualfund",
			"INDCBSX",
			"INDARCX",
			"INDXASE",
			"INDXNAS",
			"IND_DJI",
			"XNSE",
			"XLON"
		],
		defaultSymbol: "TSLA",
		chartRefreshRate: 120,
		quoteRefreshRate: 10,
		quoteURL: "overview.html",
		searchURL: "overview.html",
		dataSource: "xignite",
		dataSourceSettings: {
			useDevServices: true,
			BATS: false
		},
		baseJsUrl: "./../js/",
		themeCSS: "./../css/",
		darkLogos: true,
		webFonts: ['Roboto:200,300,300i,400,700']
	};

	if (portalSettings.darkLogos) {
		portalSettings.topLogo = 'https://widgetcdn.chartiq.com/img/chartiq-logo-dark.png';
	} else {
		portalSettings.topLogo = 'https://widgetcdn.chartiq.com/img/chartiq-logo.png';
	}
	window.portalSettings = portalSettings;
	window.userSettings = userSettings;

	var finWindow = fin.desktop.Window.getCurrent();

	var windowName = finWindow.name;
	FSBL.Clients.WindowClient.getComponentState({
		field: 'symbol'
	}, function (err, response) {
		var data = response;
		if (data) {
			portalSettings.defaultSymbol = data;
		}
		if (defaultSettings.isSymbolDriven) {
			FSBL.Clients.WindowClient.setWindowTitle(defaultSettings.mainWidget + ' - ' + portalSettings.defaultSymbol);
		} else {
			FSBL.Clients.WindowClient.setWindowTitle(defaultSettings.mainWidget);
		}
		
		require(['./../js/modules/portalcore.js'], function () {
			FSBL.Clients.LinkerClient.subscribe("symbol", function (symbol) {
				FSBL.Clients.WindowClient.setComponentState({
					field: 'symbol',
					value: symbol
				});
				var message = {
					sender: 'newSearch',
					subject: 'symbolChange',
					data: {
						symbol: symbol
					}
				};
				PortalCore.sendMessage(message);
			});

			// Handle spawn data
			let spawnData  = FSBL.Clients.WindowClient.getSpawnData();
			if(spawnData.symbol){
				portalSettings.defaultSymbol = spawnData.symbol
			}
		});
		document.body.style.backgroundColor = 'rgb(21, 31, 40)';
	});

	/**
	 * Code below checks for the main widget container to see if it exists. If so, it wraps it (and the footer), then adds the CSS to make perfect scrollbar work. Removes the scrollbar from the body, and then clears the poller. Did it this way vs. CSS because the CSS files for the widgets are on Sidd's server, and I didn't want to make all components scrollbar-less. Wrapper exists so we don't have to deal with the widget height changing and blocking out the xignite logos.
	 */
	var interval = setInterval(function () {
		if (document.querySelector('#ciq--div0')) {
			var widgetWrap = document.createElement('div');
			//Two properties below necessary for PS to work.
			widgetWrap.style.position = 'relative';
			widgetWrap.style.height = '100%';
			document.body.style.overflow = 'hidden';

			widgetWrap.appendChild(document.querySelector('#ciq--div0'));
			//xignite logo.
			if (document.querySelector('.ciq-footer')) {
				widgetWrap.appendChild(document.querySelector('.ciq-footer'));
			}
			document.body.appendChild(widgetWrap);

			Ps.initialize(widgetWrap);
			function updateWrap() {
				Ps.update(widgetWrap);
			}
			function onCloseRequested() {
				finWindow.removeEventListener('diabled-frame-bounds-changed', updateWrap);
				finWindow.removeEventListener('close-requested', onCloseRequested);
			}
			finWindow.addEventListener('disabled-frame-bounds-changed', updateWrap);
			finWindow.addEventListener('close-requested', onCloseRequested);
			clearInterval(interval);
		}
	}, 50);
});

