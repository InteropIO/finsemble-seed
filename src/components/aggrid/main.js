// Please include your own ag-grid license ley 
agGrid.LicenseManager.setLicenseKey("");

var data = require('./data.js')
let Logger;
let LinkerClient;


var MIN_BOOK_COUNT = 10;
var MAX_BOOK_COUNT = 20;

var MIN_TRADE_COUNT = 1;
var MAX_TRADE_COUNT = 10;

var symbolList = data.symbolList;

var portfolios = data.portfolios;

// start the book id's and trade id's at some future random number,
// looks more realistic than starting them at 0
var nextBookId = 62472;
var nextTradeId = 24287;

var columnDefs = [
    // these are the row groups, so they are all hidden (they are show in the group column)
    { headerName: 'Security', field: 'security', enableRowGroup: true, enablePivot: true, rowGroupIndex: 0, hide: true, tooltipField: 'security', tooltipComponentParams: { color: "#ececec" } },
    { headerName: 'Portfolio', field: 'portfolio', enableRowGroup: true, enablePivot: true, rowGroupIndex: 1, hide: true },
    { headerName: 'Book ID', field: 'book', enableRowGroup: true, enablePivot: true, rowGroupIndex: 2, hide: true },
    { headerName: 'Trade ID', field: 'trade', width: 100, filter: "agTextColumnFilter" },

    // some string values, that do not get aggregated
    { headerName: 'Bid', field: 'bidFlag', enableRowGroup: true, enablePivot: true, width: 100, filter: "agTextColumnFilter" },

    // all the other columns (visible and not grouped)

    { headerName: 'Current', field: 'current', width: 150, aggFunc: 'sum', enableValue: true, cellClass: 'number', valueFormatter: numberCellFormatter, cellRenderer: 'agAnimateShowChangeCellRenderer', filter: "agNumberColumnFilter" },
    { headerName: 'Previous', field: 'previous', width: 150, aggFunc: 'sum', enableValue: true, cellClass: 'number', valueFormatter: numberCellFormatter, cellRenderer: 'agAnimateShowChangeCellRenderer', filter: "agNumberColumnFilter" },
    { headerName: 'Gain/Loss', field: 'chng', width: 150, aggFunc: 'sum', enableValue: true, cellClass: 'number', valueFormatter: gainLossFormatter, cellRenderer: 'agAnimateShowChangeCellRenderer', filter: "agNumberColumnFilter" },
    { headerName: '% Change (avg)', field: 'pctchng', width: 150, aggFunc: 'avg', enableValue: true, cellClass: 'number', cellRenderer: 'agAnimateShowChangeCellRenderer', valueFormatter: percentCellFormatter, filter: "agNumberColumnFilter" },
    { headerName: '52 Wk High', field: 'h52', width: 150, aggFunc: 'sum', enableValue: true, cellClass: 'number', valueFormatter: numberCellFormatter, cellRenderer: 'agAnimateShowChangeCellRenderer', filter: "agNumberColumnFilter" },
    { headerName: '52 Wk Low', field: 'l52', width: 150, aggFunc: 'sum', enableValue: true, cellClass: 'number', valueFormatter: numberCellFormatter, cellRenderer: 'agAnimateShowChangeCellRenderer', filter: "agNumberColumnFilter" },
    { headerName: 'Hi-Low Range', field: 'hlrange', width: 150, aggFunc: 'sum', enableValue: true, cellClass: 'number', valueFormatter: numberCellFormatter, cellRenderer: 'agAnimateShowChangeCellRenderer', filter: "agNumberColumnFilter" },
    { headerName: 'Current P/E', field: 'pe', width: 150, aggFunc: 'sum', enableValue: true, cellClass: 'number', valueFormatter: numberCellFormatter, cellRenderer: 'agAnimateShowChangeCellRenderer', filter: "agNumberColumnFilter" }


];

// a list of the data, that we modify as we go. if you are using an immutable
// data store (such as Redux) then this would be similar to your store of data.
var globalRowData;

// build up the test data
function createRowData() {
    globalRowData = [];
    for (var i = 0; i < symbolList.length; i++) {
        var symbol = symbolList[i];
        for (var j = 0; j < portfolios.length; j++) {
            var portfolio = portfolios[j];

            var bookCount = randomBetween(MAX_BOOK_COUNT, MIN_BOOK_COUNT);

            for (var k = 0; k < bookCount; k++) {
                var book = createBookName();
                var tradeCount = randomBetween(MAX_TRADE_COUNT, MIN_TRADE_COUNT);
                for (var l = 0; l < tradeCount; l++) {
                    var trade = createTradeRecord(symbol, portfolio, book);
                    globalRowData.push(trade);
                }
            }
        }
    }
}

// https://stackoverflow.com/questions/1527803/generating-random-whole-numbers-in-javascript-in-a-specific-range
function randomBetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function createTradeRecord(symbol, portfolio, book) {
    var previous = Math.floor(Math.random() * 100000) + 100;
    var current = previous + Math.floor(Math.random() * 10000) - 2000;
    var difference = current - previous;

    var l52 = Math.floor(Math.random() * 100000) + 100;
    var h52 = l52 + Math.floor(Math.random() * 10000) - 2000;

    var trade = {
        security: symbol,
        portfolio: portfolio,
        book: book,
        trade: createTradeId(),
        submitterID: randomBetween(10, 1000),
        submitterDealID: randomBetween(10, 1000),
        bidFlag: (Math.random() < .5) ? 'Buy' : 'Sell',
        current: current,
        previous: previous,
        chng: difference,
        pctchng: (difference / previous) * 100,
        h52: h52,
        l52: l52,
        hlrange: h52 - l52,
        pe: randomBetween(385, 100000) / 100

    };
    return trade;
}

function numberCellFormatter(params) {
    return "$" + Math.floor(params.value).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
}

function gainLossFormatter(params) {
    return `<span class=${params.value > 0 ? "gain" : "loss"}> ${params.value > 0 ? "+" : ""} $${Math.floor(params.value).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,")}</span>`;
}

function percentCellFormatter(params) {
    return `<span class=${params.value > 0 ? "gain" : "loss"}>${Math.floor(params.value).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,")}%</span>`;
}

function createBookName() {
    nextBookId++;
    return 'IQ-' + nextBookId
}

function createTradeId() {
    nextTradeId++;
    return nextTradeId
} 

/*
    Launch or Share pattern
*/
function launchOrShare(topic, data) {
    /* FDC3 object implementation
    data = {
        "type": "fdc3.instrument",
        "name": data,
        "id":
        {
            "ticker": data,
            "ISIN": null,
            "CUSIP": null
        },
        "country": "US"
    };
    */
    let spawnType = FSBL.Clients.WindowClient.getSpawnData()[0].component;
    let activeChannels = Object.keys(FSBL.Clients.LinkerClient.channels);
    let linkedComponents = FSBL.Clients.LinkerClient.getLinkedComponents({ channels: activeChannels, componentTypes: [spawnType] }, (err) => {
        if (err) {
            Logger.error("Function: launchOrShare FSBL.Clients.LinkerClient.getLinkedComponents error:", err);
        }
    });
    const existingComponentsAreLinked = linkedComponents !== undefined && linkedComponents.length > 0;
    const noChannelsActive = activeChannels.length === 0;
    Logger.log("active Channels", activeChannels);
    const passContextToApps = () => {
        passContext(topic, data);
    };
    FSBL.Clients.Logger.log("active Channels", activeChannels);
    if (!spawnType || existingComponentsAreLinked === true) {
        passContext(topic, data);
        return
    }

    if (noChannelsActive === true) {
        FSBL.Clients.Logger.log("No Active Channels Selected");
        return launchComponent(activeChannels, spawnType, topic, data);
    }
    launchComponent(activeChannels, spawnType, topic, data)
        .then(passContextToApps);

};


function passContext(topic, data, windowIdentifiers) {
    if (windowIdentifiers) {
        for (var i = 0; i < windowIdentifiers.length; i++) {
            FSBL.Clients.LauncherClient.showWindow({ componentType: windowIdentifiers[i].componentType, windowName: windowIdentifiers[i].windowName }, (err) => {
                if (err) {
                    Logger.error("Function: passContext FSBL.Clients.LauncherClient.showWindow error:", err);
                }
            });
            //TO DO - Switch to router message to share to the specific wwindow by identifer - need to update components to listen for their own window name...
        }
    }

    //return FSBL.Clients.LinkerClient.publish({ dataType: topic, data }, () => true);
    /* FDC3 object implementation
    return FSBL.Clients.LinkerClient.publish({dataType: topic, data: data.id.ticker}),...
    */
    return FSBL.Clients.LinkerClient.publish({ dataType: topic, data: data }, (err) => {
        if (err) {
            Logger.error("Function: passContext FSBL.Clients.LinkerClient.publish error:", err);
        }
    });


}

function setChannels(selectedChannels, windowIdentifier) {
    return FSBL.Clients.LinkerClient.linkToChannel(selectedChannels, windowIdentifier, (err) => {
        if (err) {
            Logger.error("Function: setChannels FSBL.Clients.LinkerClient.linkToChannel error:", err);
        }
    });
}


function launchComponent(activeChannels, componentType, topic, data) {
    FSBL.Clients.Logger.log("ChannelValue:", activeChannels);
    return FSBL.Clients.LauncherClient.spawn(componentType, {
        addToWorkspace: true,
        data: {topic, symbol: data }
        // FDC3 object implementation
        // data: { topic, symbol: data.id.ticker }

    }, function (err, response) {
        if (err) {
            Logger.error("Error spawning component:", err)
            return err;
        }

        FSBL.Clients.Logger.log("spawn() returns information about the new component", response);
        setChannels(activeChannels, response.windowIdentifier);
    });
}

function symbolValueGetter(event) {
    return event.value;

}

function cellDoubleClickEventHandler(event) {
    if (event.column.left === 0) {
        var symbol = symbolValueGetter(event);
        launchOrShare("symbol", symbol);
    }
}

var gridOptions = {
    defaultColDef: {
        filter: "true" // set filtering on for all cols
    },
    floatingFilter: true,
    columnDefs: columnDefs,
    suppressAggFuncInHeader: true,
    animateRows: true,
    rowGroupPanelShow: 'always',
    pivotPanelShow: 'always',
    getRowNodeId: function (data) { return data.trade; },
    defaultColDef: {
        width: 120,
        sortable: true,
        resizable: true
    },
    autoGroupColumnDef: {
        width: 200
    },
    onGridReady: function (params) {
        createRowData();
        params.api.setRowData(globalRowData)
    },
    onCellDoubleClicked: function (event) { cellDoubleClickEventHandler(event); }
};
// after page is loaded, create the grid.


const init = () => {
    LinkerClient = FSBL.Clients.LinkerClient
    Logger = FSBL.Clients.Logger
    var eGridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(eGridDiv, gridOptions);
    FSBL.Clients.LinkerClient.subscribe("symbol", (data) => {
        document.getElementById("quick-filter-box").value = data;
        gridOptions.api.setQuickFilter(data);
    })
    document.getElementById("quick-filter-box").oninput = function (event) {
        gridOptions.api.setQuickFilter(event.target.value);
    }
};  

//standard finsemble initialize pattern
if (window.FSBL && FSBL.addEventListener) {
    FSBL.addEventListener('onReady', init);
} else {
    window.addEventListener('FSBLReady', init);
};
