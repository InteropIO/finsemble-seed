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
	FSBL.Clients.Logger.debug("Starting chart integration");
	const FINSEMBLE_SYMPHONY_CHARTIQ_APP_ID_CONFIG_PATH = 'finsemble.custom.symphony.chartiqApp.id'
	const FINSEMBLE_SYMPHONY_CHARTIQ_APP_NAME_CONFIG_PATH = 'finsemble.custom.symphony.chartiqApp.name'

	let symphonyChartIQAppId = ''
	let symphonyChartIQAppName = '' 

	//state variable to prevent resharing of symbol received from linker
	let supressSymbolPublish = null;

	// #region intents
	const addIntentListener = () => {
		if (window.fdc3) {
			fdc3.addIntentListener('ViewChart', (context) => {
				const { type } = context; 
				if(type === "fdc3.instrument"){
					const symbol = context.id.ticker;
					if (stx.chart.symbol !== symbol) {
						const state = {
							symbol: symbol
						};
						supressSymbolPublish = symbol;
						updateFromState(state);
					}				
				}
			});
		}
	}
	//#endregion intents

	// #region Publish and Subscribe to data via linker and fdc3
	/**
	 * Subscribe to data via Linker or FDC3
	 */
	const subscribeToDataSharing = () => {
		if (window.fdc3) {
			fdc3.addContextListener("fdc3.instrument", (context) => {
				const symbol = context.id.ticker;

				if (stx.chart.symbol !== symbol) {
					const state = {
						symbol: symbol
					};
					supressSymbolPublish = symbol;
					updateFromState(state);
				}
			})
		}
	};

	/**
	 * Publish data via Linker or FDC3
	 */
	const publishSymbol = () => {
		const symbol = stx.chart.symbol;
		if (window.fdc3) {
			fdc3.broadcast({
				"type": "fdc3.instrument",
				"name": symbol,
				"id": {
					"ticker": symbol
				}
			});
		}
	};
	// #endregion

	// #region State
	const saveState = () => {
		FSBL.Clients.Logger.debug("Saving state");
		const symbol = stx.chart.symbol;
		const layout = stx.exportLayout();
		const drawings = stx.exportDrawings();

		// TODO: Is this necessary? Can we save the drawings object directly?
		const drawingsStr = drawings.length === 0 ? null : JSON.stringify(drawings);

		const params = {
			fields: [{
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

		//only do the update if we're not already showing that symbol
		if (stx.chart.symbol !== state.symbol) {
			stx.loadChart(
				state.symbol,
				{
					periodicity: {
						period: 1,
						interval: 1,
						timeUnit: "minute"
					}
				},
				() => {
					document.title = state.symbol;
	
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

			if (spawnData.chart) {
				state.symbol = spawnData.chart.symbol;
				state.layout = spawnData.chart.layout;
				state.drawings = spawnData.chart.drawings;
				supressSymbolPublish = spawnData.chart.symbol;
			}
		} 
		
		if (Object.keys(state).length > 0){
			updateFromState(state);
		}
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
		FSBL.Clients.Logger.debug(`Symbol changed: ${symbol}`);
		document.title = symbol;

		saveState();
		if (supressSymbolPublish != symbol) {
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
		CIQ.localStorageGetItem = () => {};
		CIQ.localStorageSetItem = () => {};
	};

	const shareChart = (e) => {
		let toggleTarget = {
			componentType: 'SymphonyAdvanceShare',
		}
		let toggleParams = {
			addToWorkspace: false,
			spawnIfNotFound: true,
			position: "relative",
			left: "center",
			top: "center"
		}

		FSBL.Clients.LauncherClient.toggleWindowOnClick(e.e.target, toggleTarget, toggleParams)

		// For later chart sharing enhancement
		let symbol = stx.chart.symbol
		let layout = stx.exportLayout({ withSymbols: true });
		let drawings = stx.exportDrawings()
		let preferences = stxx.exportPreferences();
		let chartTitle = symbol.toUpperCase() + " Chart"

		let transmitParams = {
			shareContent: {
				title: chartTitle,
				subTitle: "Share a " + symbol + ' chart',
				summary: "Chart Type: " + layout.chartType,
				articleId: JSON.stringify({
					itemType: "AdvancedChart",
					widgetId: "chart",
					data: {
						layout: {
							symbols: [{
								symbol: symbol,
							}, ],
						},
					},
				}),
				author: "ChartIQ",
				publisher: "ChartIQ",
				appId: symphonyChartIQAppId, 
				appName: symphonyChartIQAppName,
				thumbnailUrl: "https://symphony.chartiq.com/ChartIQ/Symphony/img/CIQ_Mark_64x64.png",
				appIconUrl: "https://symphony.chartiq.com/ChartIQ/Symphony/img/CIQ_Mark_64x64.png",
				chart: {
					symbol: symbol,
					layout: layout,
					drawings: drawings,
					preferences: preferences,
					chartTitle: chartTitle
				}
			},
			shareMsg: "Share a " + symbol + ' chart'
		};
		FSBL.Clients.RouterClient.transmit('ShareToSymphony', transmitParams)
	}

	const modifyShareButton = () => {
		FSBL.Clients.ConfigClient.getValues([FINSEMBLE_SYMPHONY_CHARTIQ_APP_ID_CONFIG_PATH, FINSEMBLE_SYMPHONY_CHARTIQ_APP_NAME_CONFIG_PATH],(err, configRes)=>{
			symphonyChartIQAppId = configRes[FINSEMBLE_SYMPHONY_CHARTIQ_APP_ID_CONFIG_PATH]
			symphonyChartIQAppName = configRes[FINSEMBLE_SYMPHONY_CHARTIQ_APP_NAME_CONFIG_PATH]
		})
		document.querySelector('cq-share-button').tap = shareChart
	}

	FSBL.Clients.Logger.debug("Starting Finsemble integration");
	document.title = stx.chart.symbol;

	try {
		restoreState();
		initHandlers();
		subscribeToDataSharing();
		addIntentListener();
		modifyShareButton()
	} catch (err) {
		FSBL.Clients.Logger.error("Component initialization failed: ", err);
	}
}