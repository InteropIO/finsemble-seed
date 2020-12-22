import { CIQ } from "../../../js/chartiq.js";
class ChartLinker {
	constructor() {
		this.charts = new Map();
		this.symbols = new Map();
	}
	add(symbol, stx, context, nodeId) {
		if (this.charts.has(stx)) {
			return null;
		}
		// Used for pan/zoom ops and set via the chart-grid mouse event handlers the identify the chart the user is currently interacting with.
		stx.linkerMaster = false;
		const linkContainer = {
			id: nodeId,
			symbol,
			stx,
			context: context,
			injections: {},
			state: {
				slave: false,
				forcePosition: false
			}
		};
		this.setCrosshairInjection(linkContainer);
		this.setScrollInjection(linkContainer);
		this.charts.set(stx, linkContainer);
		this.symbols.set(symbol, linkContainer);
		return linkContainer;
	}
	// Remove a chart
	// Accepts a value from the charts map
	remove(chartDetail) {
		const { stx, injections, symbol } = chartDetail;
		stx.removeInjection(injections.crosshair);
		stx.removeInjection(injections.scroll);
		stx.destroy();
		// Disable the instance resize handler because the global event is still holding on to it
		stx.resizeChart = stx.resizeCanvas = stx.draw = () => false;
		this.charts.delete(stx);
		this.symbols.delete(symbol);
		return true;
	}
	// Remove all charts from the grid
	removeAll() {
		let chartKeys = this.charts.keys();
		let chartDetail = this.charts.get(chartKeys.next().value);
		while (chartDetail) {
			// Never remove chart0 because it's tied to the UI
			if (chartDetail.id !== "chart0") {
				this.remove(chartDetail);
			}
			chartDetail = this.charts.get(chartKeys.next().value);
		}
	}
	// Set a particular chart as the master for scroll syncing. Otherwise the charts step all over each other during each data update.
	setLinkerMaster(masterId) {
		for (const { id, stx } of this.charts.values()) {
			if (id == masterId) {
				stx.linkerMaster = true;
			} else {
				stx.linkerMaster = false;
			}
		}
	}
	// Injects a crosshair handler into each chart to set each chart crosshair position in sync
	setCrosshairInjection({ stx, injections, state }) {
		injections.crosshair = stx.prepend("positionCrosshairsAtPointer", () => {
			if (state.forcePosition) return false;
			if (!state.slave) {
				if (
					CIQ.withinElement(
						stx.chart.container,
						CIQ.ChartEngine.crosshairX,
						CIQ.ChartEngine.crosshairY
					)
				) {
					this.setCrosshair(stx);
				}
			}
			return true;
		});
		injections.hideCrosshair = stx.append("undisplayCrosshairs", () => {
			if (!state.slave) this.hideCrosshair(stx);
		});
	}
	// Injects a draw handler into each chart to keep their scroll and zoom positions in sync
	// Checks for linkerMaster = true in each chart instance to determine which chart the others should follow
	// linkerMaster is set by the global UI to indicate which chart the user is interacting with
	setScrollInjection({ stx, injections, state }) {
		injections.scroll = stx.append("draw", () => {
			if (stx.linkerMaster) {
				this.setScroll(stx);
			}
		});
	}
	// Syncronizes crosshair position between charts. Adds additional fixes which caused the crosshair to flicker during mouse interaction
	setCrosshair(master) {
		const {
			left,
			cy,
			chart,
			chart: {
				yAxis: { height }
			}
		} = master;
		const cyPercentage = cy / height;
		const targetTick = master.tickFromPixel(
			CIQ.ChartEngine.crosshairX - left,
			chart
		);
		let date = 0;
		// When the chart symbol changes, there is a momentary period where the dataSet is empty. Performing a date lookup at that point will cause the chart to fail.
		if (targetTick >= 0 && targetTick < chart.dataSet.length)
			date = master.dateFromTick(targetTick, chart, true);
		const field = master.preferences.horizontalCrosshairField;
		for (const { stx, state } of this.symbols.values()) {
			if (master.overXAxis || master.overYAxis || !master.insideChart) {
				stx.undisplayCrosshairs();
				continue;
			}
			if (stx === master) {
				state.forcePosition = true;
				stx.updateChartAccessories();
				state.forcePosition = false;
				continue;
			}
			state.slave = true;
			if (master.controls.crossX.style.display == "none" || date === 0) {
				stx.undisplayCrosshairs();
			} else {
				let x = stx.pixelFromDate(date, stx.chart) - 1,
					y = cyPercentage * stx.chart.yAxis.height,
					dataSet = stx.chart.dataSet;
				if (stx.controls.crossX) stx.controls.crossX.style.left = x + "px";
				let tick = stx.tickFromDate(date, stx.chart);
				if (field && dataSet && tick < dataSet.length && tick > -1) {
					y = stx.pixelFromPrice(dataSet[tick][field], stx.currentPanel);
				}
				if (stx.controls.crossY) stx.controls.crossY.style.top = y + "px";
				stx.insideChart = true;
				stx.crosshairTick = tick;
				stx.crossYActualPos = y;
				stx.cx = master.cx;
				stx.currentPanel = stx.whichPanel(y);
				stx.doDisplayCrosshairs();
				stx.updateChartAccessories();
				stx.insideChart = false;
			}
			state.slave = false;
		}
	}
	showCrosshair(show) {
		this.charts.forEach((details, stx) => {
			stx.layout.crosshair = show;
		});
	}
	hideCrosshair(master) {
		for (const { stx, state } of this.symbols.values()) {
			if (stx === master) {
				continue;
			}
			state.slave = true;
			stx.undisplayCrosshairs();
			state.slave = false;
		}
	}
	setScroll(master) {
		for (const { stx, state } of this.charts.values()) {
			if (stx === master) {
				continue;
			}
			state.slave = true;
			stx.micropixels = master.micropixels;
			stx.chart.scroll = master.chart.scroll;
			stx.setCandleWidth(master.layout.candleWidth);
			stx.draw();
			state.slave = false;
		}
	}
	changeTheme(node, className) {
		this.charts.forEach((details, stx) => {
			details.context.topNode.classList.remove("ciq-night");
			details.context.topNode.classList.add(className);
			details.context.stx.setThemeSettings(null);
		});
	}
	addStudy(studyName) {
		let sd;
		this.charts.forEach((details, stx) => {
			// If x-axis is visible, ad extra height to the panel
			if (document.getElementById(details.id).hasAttribute("x-axis")) {
				CIQ.Studies.studyLibrary[studyName].panelHeight =
					stx.chart.canvasHeight * 0.2 + 20;
			}
			sd = CIQ.Studies.addStudy(stx, studyName);
			CIQ.Studies.studyLibrary[studyName].panelHeight = null;
		});
		return sd;
	}
	updateStudy(helper, updates) {
		// Save the study ID because it can change as period changes
		let studyId = helper.sd.inputs.id;
		this.charts.forEach((details, stx) => {
			helper.stx = stx;
			// Restore the id because it changes when the period changes from the pervious iteration
			helper.sd.inputs.id = studyId;
			helper.updateStudy(updates);
		});
	}
	removeStudy(studyDefinition) {
		//if(!sd.permanent) CIQ.Studies.removeStudy(self.context.stx,sd);
		this.charts.forEach((details, stx) => {
			CIQ.Studies.removeStudy(stx, studyDefinition);
		});
	}
	setUI(context, layout) {
		this.uiContext = context;
		this.uiLayout = layout;
	}
	// Linker adapter for UI stxtap handlers
	// params passed as: node, helpername, methodname, params...
	// node is always the first param, injected by stxtap
	UIHelperProxy() {
		let args = Array.prototype.slice.call(arguments);
		// Extract the helper and method names so the rest can be passed as params to the named method
		let [helper, method] = args.splice(1, 2);
		this.charts.forEach((details, stx) => {
			this.uiContext.getAdvertised(helper)[method].apply(details, args);
		});
	}
	// Linker adapters for UI stxgetset handlers.
	getUIHelperProxy() {
		let args = Array.prototype.slice.call(arguments);
		// Extract the helper and method names so the rest can be passed as params to the named method
		let [helper, method] = args.splice(1, 2);
		this.uiContext
			.getAdvertised(helper)
			["get" + method].apply(this.uiLayout, args);
	}
	setUIHelperProxy() {
		let args = Array.prototype.slice.call(arguments);
		// Extract the helper and method names so the rest can be passed as params to the named method
		let [helper, method] = args.splice(1, 2);
		this.charts.forEach((details, stx) => {
			this.uiContext.getAdvertised(helper)["set" + method].apply(details, args);
		});
	}
}
export { ChartLinker };
