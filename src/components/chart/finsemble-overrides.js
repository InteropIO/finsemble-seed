

// var Test = require('./test');

/**
 * Eliminate animation on the cq-chart-title price. It's too expensive when there are multiple charts on the screen.
 */
CIQ.UI.animatePrice = function () { };

// prevent white background from showing when resizing window
document.body.style.backgroundColor = "#151f28";
let UIInterval;
function lookForUI() {
	if (!CIQ.UI && !CIQ.UI.StudyParameter) return;
	clearInterval(UIInterval);
	FSBL.Clients.Logger.log("Starting Advanced Chart");
	quotefeedSimulator.url = quotefeedSimulator.url.replace('http://', 'https://');
	var appendCreateDataSet = function () {
		$("cq-chart-title").each(function () {
			FSBL.Clients.WindowClient.setWindowTitle(this.title);
		});
	};
	STXChart.prototype.append("createDataSet", appendCreateDataSet);
	function setEmitters() {
		FSBL.Clients.DragAndDropClient.setEmitters({
			emitters: [
				{
					type: "symbol",
					data: getSymbol
				},
				{

					type: "chartiq.chart",
					data: getChart
				}
			]
		});
	};
	setEmitters();

	function getSymbol() {
		return {
			'symbol': stxx.chart.symbol,
			'description': 'Symbol ' + stxx.chart.symbol
		};
	}

	function getChart(cb) {
		var stx = window.stxx;
		var chart = {
			layout: stx.exportLayout(true),
			drawings: stx.serializeDrawings()
		};
		if (cb) { cb(null, chart); }
		return {
			chart: chart,
			description: 'ChartIQ Chart For ' + stx.chart.symbol
		};
	}


	FSBL.Clients.LinkerClient.subscribe("symbol", function (symbol) {
		changeSymbol({ symbol: symbol });
	});

	FSBL.Clients.DragAndDropClient.addReceivers({
		receivers: [
			{
				type: 'symbol',
				handler: function (err, response) {
					if (!err) { changeSymbol({ symbol: response.data['symbol'].symbol }); };
				}
			},
			{
				type: 'chartiq.chart',
				handler: function (err, response) {
					if (!err) { setChart(response.data['chartiq.chart'].chart); }
				}
			}
		]
	});
	stxx.callbacks.layout = saveLayout;
	stxx.callbacks.symbolChange = saveLayout;

	startUI();
	setTimeout(resizeScreen, 100);
	setTimeout(fixUI, 500);

	UIContext.UISymbolLookup.setCallback(function (context, data) {
		data.symbol = data.symbol.toUpperCase();
		context.changeSymbol(data);
		FSBL.Clients.LinkerClient.publish({ dataType: "symbol", data: data.symbol });
		fin.desktop.InterApplicationBus.publish('fts.navigate.entityBySymbol', { symbol: data.symbol });
	});
	UIContext.changeSymbol = changeSymbol;

}
FSBL.addEventListener('onReady', function () {
	UIInterval = setInterval(lookForUI, 10);
});

function fixUI() {
	hide(document.querySelector('.stx-zoom-in'));
	hide(document.querySelector('.stx-zoom-out'));
	hide(document.querySelector('#chartControls'));
	hide(document.querySelector('cq-themes'));
	let style = document.createElement('style');
	style.type = 'text/css';
	style.innerHTML = '.sidenav{top:75px !important;}';
	document.body.appendChild(style);


	let headings = Array.from(document.querySelectorAll('cq-heading'));
	for (var i = 0; i < headings.length; i++) {
		var heading = headings[i];
		if (heading.textContent === 'Themes') {
			hide(heading);

			let seps = heading.parentNode.querySelectorAll('cq-separator');
			let lastSep = seps[0];
			for (var j = 1; j < seps.length; j++) {
				var sep = seps[j];
				if (sep.offsetTop > lastSep.offsetTop) {
					lastSep = sep;
				}
			}

			hide(lastSep);
			break;
		}
	}

	var UIThemes = $("cq-themes");
	UIThemes[0].initialize({
		defaultTheme: "ciq-night",
	});

	function hide(el) {
		el.style.display = 'none';
	}
}

window.setChart = function (chart) {
	var stx = this.stx ? this.stx : this.stxx;
	function closure() {
		if (UIContext.loader) { UIContext.loader.hide(); }
		stx.reconstructDrawings(chart.drawings);
		stx.draw();
	}
	//@TODO remove this line below once library is updated
	if (chart.layout.span && Object.keys(chart.layout.span).length == 0) { chart.layout.span = null; }
	stx.importLayout(chart.layout, { managePeriodicity: true, cb: closure });
};
window.restoreLayout = function (stx, cb) {
	function closure(/*lookInCustomData*/) {
		let opts = FSBL.Clients.WindowClient.options;
		/*if (lookInCustomData) {
			if (opts.customData &&
				opts.customData.spawnData &&
				opts.customData.spawnData.drawings) {
				stx.importDrawings(opts.customData.spawnData.drawings);
				CIQ.localStorageSetItem(stx.chart.symbol, JSON.stringify(stx.exportDrawings()));
			}
		} else {*/
		restoreDrawings(stx, stx.chart.symbol);
		//}

		cb();
	}
	var opts = FSBL.Clients.WindowClient.options;

	FSBL.Clients.WindowClient.getComponentState({ field: 'myChartLayout' }, function (err, state) {
		if (state === null || typeof state == 'undefined') {
			if (opts.customData &&
				opts.customData.spawnData &&
				opts.customData.spawnData.layout) {
				stx.importLayout(opts.customData.spawnData.layout, {
					managePeriodicity: true, cb: function () {
						closure(/*false*/);
						cb();
					}
				});
				opts.customData.spawnData.layout = null;
				//so it doesn't overwrite what's in storage the next time the app is loaded.
			} else {
				FSBL.Clients.WindowClient.setWindowTitle(stx.chart.symbol);

				cb();
			}

			return;
		}

		stx.importLayout(state, { managePeriodicity: true, cb: closure });
	});


};

window.saveLayout = function (obj) {
	var s = obj.stx.exportLayout(true);
	FSBL.Clients.WindowClient.setComponentState({ field: 'myChartLayout', value: s });
};

//Only difference from lib is that I got rid of the call to save sideNav to the layout.
window.checkWidth = function () {
	if ($(window).width() > 768) {
		$('body').removeClass('break-md break-sm').addClass('break-lg');
		$('.icon-toggles').removeClass('sidenav active').addClass('ciq-toggles');
	}
	if ($(window).width() <= 768) {
		$('body').removeClass('break-lg break-sm').addClass('break-md');
		$('.icon-toggles').removeClass('sidenav active').addClass('ciq-toggles');
	}
	if ($(window).width() <= 600) {
		$('body').removeClass('break-md break-lg').addClass('break-sm');
		$('.icon-toggles').removeClass('ciq-toggles').addClass('sidenav');
	}
};

window.changeSymbol = function (data) {

	var stx = this.stx ? this.stx : this.stxx;
	if (this.loader) { this.loader.show(); }
	data.symbol = data.symbol.toUpperCase(); // set a pretty display version
	//FSBL.LinkerClient.publish("symbol", data.symbol);
	var self = this;
	stxx.newChart(data, null, null, function (err) {
		if (err) {
			//TODO, symbol not found error
			if (self.loader) { self.loader.hide(); }
			return;

		}
		// The user has changed the symbol, populate UITitle with yesterday's closing cq-hu-price
		// iqPrevClose is just a dummy value, you'll need to get the real value from your data source

		for (var field in stx.chart.series) { stx.removeSeries(field); } // reset comparisons - remove this line to transfer from symbol to symbol.
		if (stx.tfc) { stx.tfc.changeSymbol(); }   // Update trade from chart, todo, do this with an observer
		if (self.loader) { self.loader.hide(); }
		restoreDrawings(stx, stx.chart.symbol);
	});
};

fin.desktop.InterApplicationBus.subscribe("*", "fts.entity.active", (message) => {
	let symbol = message.symbol;
	changeSymbol({
		symbol: symbol
	});
}, (e => (console.log(e))));