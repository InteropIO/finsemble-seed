import setUpStateAndContextSharing from './active-trader-integration'


function displayChart(context) {
	const { stxx, CIQ, quoteFeedSimulator } = context;
	window.stxx = stxx; // for integration
	stxx.chart.symbol = "EURUSD";
	new CIQ.UI.Context(stxx, $("cq-context"));
	stxx.attachQuoteFeed(quoteFeedSimulator, { refreshInterval: 1 });
	CIQ.simulateL2({ stx: stxx, onTrade: true });
	CIQ.UI.begin();
}

function init() {
	if (document.readyState == 'loading') {
		// wait for the DOM to be ready before inserting the chart
		document.addEventListener('DOMContentLoaded', () => {
			displayChart(window.context);
		});
	} else {
		// DOM is ready!
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
