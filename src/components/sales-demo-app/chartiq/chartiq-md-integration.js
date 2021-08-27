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
	var currentSymbol = '';
	var pointIdx = 0;
	var fullMd = [];
	var updatePointsTimerId;

	const FINSEMBLE_SYMPHONY_CHARTIQ_APP_ID_CONFIG_PATH = 'finsemble.custom.symphony.chartiqApp.id'
	const FINSEMBLE_SYMPHONY_CHARTIQ_APP_NAME_CONFIG_PATH = 'finsemble.custom.symphony.chartiqApp.name'

	let symphonyChartIQAppId = ''
	let symphonyChartIQAppName = '' 

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
			drawings: stx.serializeDrawings()
		};

		return {
			chart: chart,
			description: `ChartIQ Chart For ${symbol}`
		};
	}

	const setEmitters = () => {
		FSBL.Clients.Logger.debug("Setting drag and drop emitters");
		FSBL.Clients.DragAndDropClient.setEmitters({
			emitters: [{
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
			receivers: [{
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
		if (window.fdc3) {
			fdc3.addIntentListener('ViewChart', (context) => {
				const symbol = context.id.ticker;
				if (stx.chart.symbol !== symbol) {
					const state = {
						symbol: symbol
					};
					updateFromState(state);
				}
			})
		}
	}
	//#endregion intents

	// #region Publish and Subscribe to data via linker and fdc3
	/**
	 * Subscribe to data via Linker or FDC3
	 */
	const subscribeToDataSharing = () => {
		if (window.usingFDC3) {
			fdc3.addContextListener("fdc3.instrument", (context) => {
				const symbol = context.id.ticker;

				if (stx.chart.symbol !== symbol) {
					const state = {
						symbol: symbol
					};

					updateFromState(state);
				}
			});
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
		if (window.fdc3) {
			fdc3.broadcast({
				"type": "fdc3.instrument",
				"name": symbol,
				"id": {
					"ticker": symbol
				}
			});
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
		FSBL.Clients.Logger.debug("Updating from state");
		if (!state) {
			// Make sure state isn't undefined
			state = {};
		}

		// Default values for anything not retrieved from storage or passed in
		if (!state.symbol) {
			state.symbol = "AAPL";
		}
		CIQ.Marker.removeByLabel(stx, "Trade");
		stx.loadChart(
			state.symbol,
			null,
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
		FSBL.Clients.Logger.debug(`Symbol changed: ${symbol}`);
		document.title = symbol;

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
	};

	FSBL.Clients.Logger.debug("Starting Finsemble integration");
	document.title = stx.chart.symbol;


	const createCssClass = () => {
		var myEvents = document.createElement('style');
		myEvents.type = 'text/css';
		myEvents.innerHTML = '.myEvents {position: absolute;text-align: center;width: 20px;height: 20px;line-height: 20px;color: white;}';
		document.getElementsByTagName('head')[0].appendChild(myEvents);

		var myEvents_trade = document.createElement('style');
		myEvents_trade.type = 'text/css';
		myEvents_trade.innerHTML = '.myEvents {background-color: blue;-webkit-border-radius: 50%;-moz-border-radius: 50%;-ms-border-radius: 50%;border-radius: 50%;}';
		document.getElementsByTagName('head')[0].appendChild(myEvents_trade);
	}

	const changeQuoteFeed = () => {
		stx.setMarketFactory(function(a){return {}});
		stx.detachQuoteFeed();
		const symbol = FSBL.Clients.WindowClient.getSpawnData().symbol;
		FSBL.Clients.ConfigClient.getValue('finsemble.applicationRoot', (err, value) => {
			if (!err) {
				//loadChart(symbol, value);
				stx.setPeriodicity({ period: 1, timeUnit: "second", interval: 1 }, function(err) {});

				var quotefeed = {};
				quotefeed.url = value;
				quotefeed.fetchInitialData = function(symbol, startDate, endDate, params, cb) {
					fetch(this.url + `/components/oms/data/market/${symbol}.json`).then((response) => {
						return response.json();
					}).then((fullMd) => {
						let currentDT = new Date();
						this.pointIdx = fullMd.length;//Math.floor(fullMd.length / 2);
						this.fullMd = fullMd;//fullMd.slice(0, this.pointIdx);
						this.currentSymbol = symbol;
			
						for (var i = this.fullMd.length - 1; i > -1; i--) {
							currentDT.setSeconds(currentDT.getSeconds() - 1);
							delete this.fullMd[i].Date;
							this.fullMd[i].DT = currentDT.getTime();
							this.fullMd[i].Date = new Date(currentDT.getTime());
						}			
						cb({ quotes: this.fullMd });
					})
				};

				quotefeed.fetchUpdateData = function(symbol, startDate, params, cb) {
					this.pointIdx++;
					if (this.pointIdx > this.fullMd.length - 1) {
						this.pointIdx = 0;
					}

					const count = Math.round(Math.random() * 50);
					if (this.pointIdx % count === 0) {
						if (!stx.masterData) return;

						const newNode = document.createElement('div')
						newNode.setAttribute('class', 'myEvents');
						newNode.id = null;
						newNode.innerHTML = "T"; // T for trade
						newNode.classList.add("trade");

						const point = stx.masterData[stx.masterData.length - 1];
						const center = (point.High + point.Low) / 2;
						const maxDeviation = 1.1 * (point.High - point.Low);
						const value = maxDeviation * (0.5 - Math.random()) + center;
						new CIQ.Marker({
							stx: stx,
							xPositioner: "date",
							yPositioner: "value",
							x: point.DT,
							y: value,
							label: "Trade",
							node: newNode
						});
					}

					let newPoint = this.fullMd[this.pointIdx];
					delete newPoint.Date;
					delete newPoint.DT;
					newPoint.DT = new Date().getTime();
					newPoint.Date = new Date();
					cb({ quotes: [newPoint] });
				};
				stx.attachQuoteFeed(quotefeed, { refreshInterval: 1 });
			}
		});
	}

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

	try {
		changeQuoteFeed();
		initHandlers();
		createCssClass();
		setEmitters();
		addReceivers();
		subscribeToDataSharing();
		addIntentListener();
		restoreState();
		modifyShareButton()
		document.title = stx.chart.symbol;
	} catch (err) {
		FSBL.Clients.Logger.error("Component initialization failed: ", err);
	}
}