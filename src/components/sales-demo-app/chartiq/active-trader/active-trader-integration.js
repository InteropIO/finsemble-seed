import { fdc3Check, fdc3OnReady } from '../utils'
let currentState = null;
//! The data simulator currently only returns data for forex symbols
//    As we only care about the data being present (not what it is) we'll 
//    just cycle through different forex symbols to retrieve dummy data
const forexSymbols = ["^EURGBP","^USDCAD","^GBPUSD","^USDCHF","^GBPCAD"];
let currSymbol = 0;
const getNextSymbol = () => {
  currSymbol = ++currSymbol < forexSymbols.length ? currSymbol : 0;
  return forexSymbols[currSymbol];
}

const logError = (err) => {
  console.error(err)
  FSBL.Clients.Logger.error(err)
}


const setContext = (symbol) => {
	console.log("set context: ", symbol);
  // use the component type for the window name
  const { componentType } = FSBL.Clients.WindowClient.getWindowIdentifier();

  if (symbol != currentState) {
		currentState = symbol;
		//! market depth requires the optional array to load the chart,
    //    trade history mustn't have it or it will load a chart behind the table
    if (componentType.toLowerCase().includes("market depth")) {
      window.stxx.loadChart(symbol, []);
    } else {
      //! the data simulator only returns data for forex symbols,
      //    need to use those retreive dummy data for trade history and orderbook
      window.stxx.loadChart(getNextSymbol());
    }

		FSBL.Clients.WindowClient.setWindowTitle(componentType + " - " + (window.usingFDC3 ? symbol + " (FDC3)" : symbol));

    FSBL.Clients.WindowClient.setComponentState({ field: "symbol", value: symbol }, function () { });
  }
};

//
const getSymbolFromComponentState = () => {
	console.log("getSymbolFromComponentState");
  // do we want to always save as symbol for now?
  FSBL.Clients.WindowClient.getComponentState({ fields: ["symbol"] }, (err, state) => {
    if (err) {
      console.error("Error occurred while retrieving state, error: ", err);
    }
    if (state && state.symbol) {
		setContext(state.symbol);
		console.log("set context from state");
    } else {
      // Component is not in workspace
      let spawnData = FSBL.Clients.WindowClient.getSpawnData();
      if (spawnData.symbol) {
			setContext(spawnData.symbol);
			console.log("set context from spawn data");
      } else {
				//set default context
			setContext("EURUSD");
			console.log("set context from defaults");
      }
    }
  });

};

const addIntentListener = () => {
	if (window.usingFDC3) {
		fdc3OnReady(
			() => fdc3.addIntentListener('ViewChart', context => {
				if (context.type === 'fdc3.instrument') {
					setContext(context.id.ticker)
				}
			})
		)
	}
}

/**
 * Listen to data sent via Finsemble's Linker OR FDC3
 */
const linkerAndFDC3Subscriber = () => {

	// If FDC3 support is present then use FDC3 else fallback to using the linker
	if (window.usingFDC3) {
		fdc3OnReady(
			() => fdc3.addContextListener(context => {
				if (context.type === 'fdc3.instrument') {
					setContext(context.id.ticker)
				}
			})
		)
	} else {
  FSBL.Clients.LinkerClient.subscribe("symbol", (data) => {
    FSBL.Clients.Logger.log(`Received symbol message: `, data);
    setContext(data);
  });
	}
};


// setup the drag and drop support
const setDragAndDropReceiver = () => {
	FSBL.Clients.Logger.debug("Adding drag and drop receivers");
	console.log("Adding drag and drop receivers");

  // handler function for the addReciever below
  const symbolReceiverHandler = (err, response) => {
    FSBL.Clients.Logger.debug("Symbol received");
    if (err) {
      return FSBL.Clients.Logger.error("Error with drag and drop symbol receiver:", err);
    }

    const symbol = response.data["symbol"].symbol;
    setContext(symbol);
  };


  FSBL.Clients.DragAndDropClient.addReceivers({
    receivers: [
      {
        type: "symbol",
        handler: symbolReceiverHandler
      }
    ]
  });
};

/**
 * Setting up the window state, linker and DnD
 */
export default function setUpStateAndContextSharing() {
	window.usingFDC3 = fdc3Check();
	console.log("setUpStateAndContextSharing");
	getSymbolFromComponentState();
	addIntentListener();
	linkerAndFDC3Subscriber();
	setDragAndDropReceiver();
}
