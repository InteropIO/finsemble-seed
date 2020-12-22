import setUpStateAndContextSharing from './active-trader-integration'

function displayChart(context) {
	const { stxx, CIQ } = context;
	window.stxx = stxx; // for integration
	stxx.layout.crosshair = true;
	stxx.setChartType("marketdepth_mountain_volume");
	stxx.chart.tension = 0.5;
	stxx.manageTouchAndMouse = false;
	stxx.loadChart("Market Depth", [], null, {
		periodicity: {
			interval: 'tick'
		}
	});
	CIQ.simulateL2({ stx: stxx, onInterval: 1000, callback: function () { this.draw(); } });
}

function init() {
	if (document.readyState == 'loading') {
		// wait for the DOM to be ready before inserting the chart
		document.addEventListener('DOMContentLoaded', displayChart);
	} else {
		// Body is now ready for the chart
		displayChart(window.context);
	}
	setUpStateAndContextSharing();
}

// Startup pattern for preload. Preloads can come in any order, so we need to wait on either the window event or the
// FSBL event
if (window.FSBL && FSBL.addEventListener) {
	FSBL.addEventListener("onReady", init);
} else {
	window.addEventListener("FSBLReady", init);
}
