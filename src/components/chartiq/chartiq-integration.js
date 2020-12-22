/***********************************************************************************************************************
	Copyright 2017-2020 by ChartIQ, Inc.
	Licensed under the ChartIQ, Inc. Developer License Agreement https://www.chartiq.com/developer-license-agreement
 **********************************************************************************************************************/
/**
 * Function to add Finsemble integration using a passed in chart object.
 *
 * @param stx The ChartEngine instance.
 */
module.exports = (stx) => {
	const { fdc3Check, fdc3OnReady } = require('./utils')
	FSBL.Clients.Logger.debug("Starting chart integration");

	//state variable to prevent resharing of symbol received from linker
	let supressSymbolPublish = null;

	// #region Emitters
	const symbolEmitter = () => {
		const symbol = stx.chart.symbol;

		return {
			"symbol": symbol,
			"description": `Symbol ${symbol}`
		};
	};

	const chartEmitter = () => {
		const symbol = stx.chart.symbol;

		// TODO: Should there be a get chart state function?
		const chart = {
			symbol: symbol,
			layout: stx.exportLayout(true),
			drawings: stx.exportDrawings()
		};

		return {
			chart: chart,
			description: `ChartIQ Chart For ${symbol}`
		};
	}

	const setEmitters = () => {
		FSBL.Clients.Logger.debug("Setting drag and drop emitters");
		FSBL.Clients.DragAndDropClient.setEmitters({
			emitters: [
				{
					type: "symbol",
					data: symbolEmitter
				},
				{
					type: "chartiq.chart",
					data: chartEmitter
				}
			]
		});
	}
	// #endregion

	// #region Receivers
	const symbolReceiverHandler = (err, response) => {
		FSBL.Clients.Logger.debug("Symbol received");
		if (err) {
			return FSBL.Clients.Logger.error("Error with drag and drop symbol receiver:", err);
		}

		const symbol = response.data["symbol"].symbol;
		const state = {
			symbol: symbol
		}

		updateFromState(state);
	};

	const chartReceiverHandler = (err, response) => {
		FSBL.Clients.Logger.debug("Chart received");
		if (err) {
			return FSBL.Clients.Logger.error("Error with drag and drop chart receiver:", err);
		}

		const state = response.data["chartiq.chart"].chart;
		updateFromState(state);
	};

	const addReceivers = () => {
		FSBL.Clients.Logger.debug("Adding drag and drop receivers");
		FSBL.Clients.DragAndDropClient.addReceivers({
			receivers: [
				{
					type: "symbol",
					handler: symbolReceiverHandler
				},
				{
					type: "chartiq.chart",
					handler: chartReceiverHandler
				}
			]
		});
	};
	// #endregion

	// #region intents
	const addIntentListener = () => {
		if (window.usingFDC3) {
			fdc3OnReady(
				() =>
					fdc3.addIntentListener('ViewChart', (context) => {
						const symbol = context.id.ticker;
						if (stx.chart.symbol !== symbol) {
							const state = {
								symbol: symbol
							};
							updateFromState(state);
						}
					})
			)
		}
	}
	//#endregion intents

	// #region Publish and Subscribe to data via linker and fdc3
	/**
	 * Subscribe to data via Linker or FDC3
	 */
	const subscribeToDataSharing = () => {
		if (window.usingFDC3) {
			fdc3OnReady(
				() => fdc3.addContextListener(context => {
					if (context.type === "fdc3.instrument") {
						const symbol = context.id.ticker;

						if (stx.chart.symbol !== symbol) {
							const state = {
								symbol: symbol
							};

							updateFromState(state);
						}
					}
				})
			)
		} else { // use the linker
			FSBL.Clients.Logger.debug("Subscribing to symbol linker");
			FSBL.Clients.LinkerClient.subscribe("symbol", (symbol, response) => {
				if (response.originatedHere()) {
					return;
				}

				if (stx.chart.symbol !== symbol) {
					const state = {
						symbol: symbol
					};

					supressSymbolPublish = symbol;

					updateFromState(state);
				}
			});
		}
	};

	/**
	 * Publish data via Linker or FDC3
	 */
	const publishSymbol = () => {
		const symbol = stx.chart.symbol;
		if (window.usingFDC3) {

			fdc3OnReady(
				() =>
					fdc3.broadcast({
						"type": "fdc3.instrument",
						"name": symbol,
						"id": {
							"ticker": symbol
						}
					})
			)
		} else { // use the linker
			FSBL.Clients.Logger.debug(`Publishing symbol: ${symbol}`);
			const params = { dataType: "symbol", data: symbol };
			FSBL.Clients.LinkerClient.publish(params);
		}
	};
	// #endregion

	// #region State
	const saveState = () => {
		FSBL.Clients.Logger.debug("Saving state");
		const symbol = stx.chart.symbol;
		const layout = stx.exportLayout(true);
		const drawings = stx.exportDrawings();

		// TODO: Is this necessary? Can we save the drawings object directly?
		const drawingsStr = drawings.length === 0 ? null : JSON.stringify(drawings);

		const params = {
			fields: [
				{
					field: "symbol",
					value: symbol
				},
				{
					field: "layout",
					value: layout
				},
				{
					field: "drawings",
					value: drawingsStr
				}
			]
		}

		FSBL.Clients.WindowClient.setComponentState(params);
	};

	const updateFromState = (state) => {
		FSBL.Clients.Logger.debug("Updating from state", state);
		if (!state) {
			// Make sure state isn't undefined
			state = {};
		}

		// Default values for anything not retrieved from storage or passed in
		if (!state.symbol) {
			state.symbol = "AAPL";
		}

		stx.loadChart(
			state.symbol,
			null,
			() => {
				const title = window.usingFDC3 ? state.symbol + " (FDC3)" : state.symbol
				FSBL.Clients.WindowClient.setWindowTitle(title);

				if (state.layout) {
					stx.importLayout(state.layout);
				}

				if (state.drawings) {
					stx.importDrawings(state.drawings);
				}

				// Force study to redraw. For more information see:
				// https://documentation.chartiq.com/WebComponents.cq-study-legend.html#main
				document.querySelector("cq-study-legend").begin()

				// Show on restore state, if hidden until state is ready
				FSBL.Clients.WindowClient.getCurrentWindow().show();
			});
	}

	const componentStateHandler = (err, state) => {
		if (err || !state || Object.keys(state).length === 0) {
			// Component is not in workspace
			let spawnData = FSBL.Clients.WindowClient.getSpawnData();
			state = {};
			if (spawnData.symbol) {
				state.symbol = spawnData.symbol;
				supressSymbolPublish = spawnData.symbol;
			}

			if (spawnData.layout) {
				state.layout = spawnData.layout;
			}
		}
		updateFromState(state);
	};

	const restoreState = () => {
		FSBL.Clients.Logger.debug("Restoring component state");

		const params = {
			fields: [
				"symbol",
				"layout",
				"drawings"
			]
		};

		// TODO: Change to await so show can be after restore
		FSBL.Clients.WindowClient.getComponentState(params, componentStateHandler);
	};
	// #endregion

	const symbolChanged = () => {
		const symbol = stx.chart.symbol;
		const title = window.usingFDC3 ? symbol + " (FDC3)" : symbol;
		FSBL.Clients.Logger.debug(`Symbol changed: ${symbol}`);
		FSBL.Clients.WindowClient.setWindowTitle(title);

		saveState();
		if (supressSymbolPublish !== symbol) {
			publishSymbol();
		}
		supressSymbolPublish = null;
	};

	const initHandlers = () => {
		FSBL.Clients.Logger.debug("Initializing handlers");
		stx.addEventListener("layout", saveState);
		stx.addEventListener("symbolChange", symbolChanged);
		stx.addEventListener("drawing", saveState);

		// Disable localStorage read/write by chart by replacing functions with no ops.
		CIQ.localStorageGetItem = () => { };
		CIQ.localStorageSetItem = () => { };

		// When the charts in Finsemble get smaller than 585px wide, scrollbars appear. Scrollbars aren't needed/desired, so
		// so hide them.
		$("body").css("overflow", "hidden");
	};

	FSBL.Clients.Logger.debug("Starting Finsemble integration");
	FSBL.Clients.WindowClient.setWindowTitle(stx.chart.symbol);

	try {
		window.usingFDC3 = fdc3Check();
		initHandlers();
		setEmitters();
		addReceivers();
		subscribeToDataSharing();
		addIntentListener();
		restoreState();
		const title = window.usingFDC3 ? stx.chart.symbol + " (FDC3)" : stx.chart.symbol
		FSBL.Clients.WindowClient.setWindowTitle(title);
	} catch (err) {
		FSBL.Clients.Logger.error("Component initialization failed: ", err);
	}
}