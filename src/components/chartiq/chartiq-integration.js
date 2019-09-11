/**
 * Function to add Finsemble integration using a passed in chart object.
 * 
 * @param stx The ChartEngine instance.
 */
module.exports = (stx) => {
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
		if (err) {
			return FSBL.Clients.Logger.error(err);
		}

		const symbol = response.data["symbol"].symbol;
		const state = {
			symbol: symbol
		}

		updateFromState(state);
	};

	const chartReceiverHandler = (err, response) => {
		if (err) {
			return FSBL.Clients.Logger.error(err);
		}

		// TODO: refactor to use function apply state to chart
		const state = response.data["chartiq.chart"].chart;
		updateFromState(state);
	};

	const addReceivers = () => {
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

	// #region Linker
	const subscribeLinker = () => {
		FSBL.Clients.LinkerClient.subscribe("symbol", (symbol, response) => {
			if (response.originatedHere()) {
				return;
			}

			if (stx.chart.symbol !== symbol) {
				const state = {
					symbol: symbol
				};
				
				updateFromState(state);
			}
		});
	};

	const publishSymbol = () => {
		const symbol = stx.chart.symbol;

		const params = { dataType: "symbol", data: symbol };
		FSBL.Clients.LinkerClient.publish(params);
	};
	// #endregion

	// #region State
	const saveState = () => {
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
		if (!state) {
			// Make sure state isn't undefined
			state = {};
		}

		// Default values for anything not retrieved from storage or passed in
		if (!state.symbol) {
			state.symbol = "AAPL";
		}

		stx.newChart(
			state.symbol,
			null,
			null,
			() => {
				FSBL.Clients.WindowClient.setWindowTitle(state.symbol);

				if (state.layout) {
					stx.importLayout(state.layout);
				}

				if (state.drawings) {
					stx.importDrawings(state.drawings);
				}
			});
	}

	const componentStateHandler = (err, state) => {
		if (err) {
			return FSBL.Clients.Logger.error(err);
		}

		if (!state) {
			state = {};
		}

		const opts = FSBL.Clients.WindowClient.options;

		// Data passed in from an opener will override the saved state
		if (opts.customData && opts.customData.spawnData) {
			const spawnData = opts.customData.spawnData;

			if (spawnData.symbol) {
				state.symbol = spawnData.symbol;
			}

			if (spawnData.layout) {
				state.layout = spawnData.layout;
			}

			// Ensure spawnData doesn't overwrite what's in storage the next time the app is loaded.
			FSBL.Clients.WindowClient.options.customData.spawnData = undefined;
		}

		updateFromState(state);
	};

	const restoreState = () => {
		const params = {
			fields: [
				"symbol",
				"layout",
				"drawings"
			]
		};

		// TODO: Take this out when the bug in the getComponentState is fixed. https://chartiq.kanbanize.com/ctrl_board/48/cards/13378/details/
		// FSBL.Clients.WindowClient.getComponentState(params, componentStateHandler);

		const state = {};
		FSBL.Clients.WindowClient.getComponentState(
			{ field: "symbol" },
			(err, symbol) => {
				state.symbol = symbol;
				FSBL.Clients.WindowClient.getComponentState(
					{ field: "layout" },
					(err, layout) => {
						state.layout = layout;

						FSBL.Clients.WindowClient.getComponentState(
							{ field: "drawings" },
							(err, drawings) => {
								state.drawings = drawings;

								componentStateHandler(null, state);
							});
					});
			});
	};
	// #endregion

	// #region Scrim
	const showScrim = () => {
		// TODO: Add throbber
		const overlay = document.createElement("div");
		overlay.id = "overlay";
		overlay.style = "position: fixed; display: block; width: 100%; height: 100%;  top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(0,0,0,1); z-index: 2; cursor: pointer;";
		document.body.appendChild(overlay);
	};

	const hideScrim = () => {
		const overlay = document.getElementById("overlay");
		if (overlay && overlay.parentNode) {
			overlay.parentNode.removeChild(overlay);
		}
	};
	// #endregion

	const layoutChanged = () => {
		saveState();
	};

	const symbolChanged = () => {
		const symbol = stx.chart.symbol;
		FSBL.Clients.WindowClient.setWindowTitle(symbol);

		saveState();

		publishSymbol();
	};

	const drawingChanged = () => {
		saveState();
	};

	const initHandlers = () => {
		stx.callbacks.layout = layoutChanged;
		stx.callbacks.symbolChange = symbolChanged;
		stx.callbacks.drawing = drawingChanged;

		// Disable localStorage read/write by chart by replacing functions with no ops.
		CIQ.localStorage.getItem = () => { };
		CIQ.localStorage.removeItem = () => { };
		CIQ.localStorage.setItem = () => { };

		// If the chart is narrow enough that the gear appears for "More", when you click on the gear the sidenav covers 
		// the gear. The below CSS modification takes the top position of the side nav (45px) and pushes it down by the 
		// height of fsbl-header (25px) so the final top position of the sidenav is 75px. 
		// TODO: Update the chart CSS so this isn't	necessary.
		$(".ciq-sidenav").click(() => {
			$(".break-sm .sidenav").css("top", "75px");
		});

		// When resizing, reset the top for the toggles so they show pu correctly.
		$(window).resize(() => {
			$("div.icon-toggles.ciq-toggles").css("top", "0px");
		});

		// When the charts in Finsemble get smaller than 585px wide, scrollbars appear. Scrollbars aren't needed/desired, so
		// so hide them.
		$("body").css("overflow", "hidden");
	};

	FSBL.Clients.Logger.log("Starting Finsemble integration");
	FSBL.Clients.WindowClient.setWindowTitle(stx.chart.symbol);

	try {
		initHandlers();
		setEmitters();
		addReceivers();
		subscribeLinker();
		restoreState();
	} catch (e) {
		FSBL.Clients.Logger.error(e);
	}

	document.onload = showScrim;

	window.showScrim = showScrim;
	window.hideScrim = hideScrim;
}