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
      window.stxx.loadChart(symbol);
    }

		document.title = componentType + " - " + symbol;

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
    
    addIntentListener();
	  linkerAndFDC3Subscriber();
  });

};

const addIntentListener = () => {
	if (window.fdc3) {
		fdc3.addIntentListener('ViewChart', context => {
      console.log(context)
      if (context.type === 'fdc3.instrument') {
        setContext(context.id.ticker)
      }
		})
  }
}

/**
 * Listen to data sent via Finsemble's Linker OR FDC3
 */
const linkerAndFDC3Subscriber = () => {
	// If FDC3 support is present then use FDC3 else fallback to using the linker
	if (window.fdc3) {
    fdc3.addContextListener("fdc3.instrument", (context) => {
			setContext(context.id.ticker)
		})
	}
};

/**
 * Setting up the window state, linker and DnD
 */
export default function setUpStateAndContextSharing() {
	console.log("setUpStateAndContextSharing");
	getSymbolFromComponentState();
}
