import setUpStateAndContextSharing from './active-trader-integration'

// Scope variables
function displayChart(context) {
	const { stxx, CIQ } = context;
	window.stxx = stxx; // for integration
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