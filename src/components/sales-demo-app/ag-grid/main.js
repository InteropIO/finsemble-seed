//TODO: Replace with your own license key
// agGrid.LicenseManager.setLicenseKey("ChartIQ__MultiApp_5Devs30_January_2020__MTU4MDM0MjQwMDAwMA==c40cbaa67e6fbd2d45b729e1edab8d44");
const linkerchannelName = "symbol";

//Import example data
let data = require('./data.js')
const symbolList = data.symbolList;
const portfolios = data.portfolios;

//Data generation constants and variables
const MIN_BOOK_COUNT = 10;
const MAX_BOOK_COUNT = 20;

const MIN_TRADE_COUNT = 1;
const MAX_TRADE_COUNT = 10;

let gridOptions = null;

// start the book id's and trade id's at some future random number,
// looks more realistic than starting them at 0
let nextBookId = 62472;
let nextTradeId = 24287;

function setupGridOptions() {
    //Grid column definitions
    const columnDefs = [
        // these are the row groups, so they are all hidden (they are show in the group column)
        { headerName: 'Security', field: 'security', enableRowGroup: true, enablePivot: true, rowGroupIndex: 0, hide: true, tooltipField: 'security', tooltipComponentParams: { color: "#ececec" } },
        { headerName: 'Portfolio', field: 'portfolio', enableRowGroup: true, enablePivot: true, rowGroupIndex: 1, hide: true },
        { headerName: 'Book ID', field: 'book', enableRowGroup: true, enablePivot: true, rowGroupIndex: 2, hide: true },


        // all the other columns (visible and not grouped)
        { headerName: 'Current', field: 'current', width: 100, aggFunc: 'sum', enableValue: true, cellClass: 'number', valueFormatter: numberCellFormatter, cellRenderer: 'agAnimateShowChangeCellRenderer', filter: "agNumberColumnFilter" },
        { headerName: 'Previous', field: 'previous', width: 100, aggFunc: 'sum', enableValue: true, cellClass: 'number', valueFormatter: numberCellFormatter, cellRenderer: 'agAnimateShowChangeCellRenderer', filter: "agNumberColumnFilter" }
    ];
    if (window.fdc3){
        columnDefs.push(
            { headerName: 'Action', field: 'security', width: 75, enableValue: true, cellRenderer: 'btnCellRenderer', 
                cellRendererParams : {
                    title: 'Chart',
                    clicked: function(params) {
                        raiseIntent("ViewChart",params.node.key);
                    }
                }
            });
            columnDefs.push(
                { headerName: 'Action', field: 'security', width: 75, enableValue: true, cellRenderer: 'btnCellRenderer', 
                    cellRendererParams : {
                        title: 'News',
                        clicked: function(params) {
                            raiseIntent("ViewNews",params.node.key);
                        }
                    }
                });
    }
    columnDefs.push(...[        
        { headerName: 'Gain/Loss', field: 'chng', width: 125, aggFunc: 'sum', enableValue: true, cellClass: 'number', valueFormatter: gainLossFormatter, cellRenderer: 'agAnimateShowChangeCellRenderer', filter: "agNumberColumnFilter" },
        { headerName: '% Change (avg)', field: 'pctchng', width: 75, aggFunc: 'avg', enableValue: true, cellClass: 'number', cellRenderer: 'agAnimateShowChangeCellRenderer', valueFormatter: percentCellFormatter, filter: "agNumberColumnFilter" },
        { headerName: '52 Wk High', field: 'h52', width: 100, aggFunc: 'sum', enableValue: true, cellClass: 'number', valueFormatter: numberCellFormatter, cellRenderer: 'agAnimateShowChangeCellRenderer', filter: "agNumberColumnFilter" },
        { headerName: '52 Wk Low', field: 'l52', width: 100, aggFunc: 'sum', enableValue: true, cellClass: 'number', valueFormatter: numberCellFormatter, cellRenderer: 'agAnimateShowChangeCellRenderer', filter: "agNumberColumnFilter" },
        { headerName: 'Hi-Low Range', field: 'hlrange', width: 100, aggFunc: 'sum', enableValue: true, cellClass: 'number', valueFormatter: numberCellFormatter, cellRenderer: 'agAnimateShowChangeCellRenderer', filter: "agNumberColumnFilter" },
        { headerName: 'Current P/E', field: 'pe', width: 100, aggFunc: 'sum', enableValue: true, cellClass: 'number', valueFormatter: numberCellFormatter, cellRenderer: 'agAnimateShowChangeCellRenderer', filter: "agNumberColumnFilter" },

        { headerName: 'Trade ID', field: 'trade', width: 80, filter: "agTextColumnFilter" },
        { headerName: 'Bid', field: 'bidFlag', enableRowGroup: true, enablePivot: true, width: 80, filter: "agTextColumnFilter" }
    ]);

    

    //configure the grid
    return {
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
            params.api.setRowData(createRowData())
        },
        onCellDoubleClicked: function (event) { cellDoubleClickEventHandler(event); },
        components: {
            btnCellRenderer: BtnCellRenderer
        }
    };
}

//==================================================================================
// Utility functions for creating example data
//----------------------------------------------------------------------------------
function randomBetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
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

function createTradeRecord(symbol, portfolio, book) {
    let previous = Math.floor(Math.random() * 100000) + 100;
    let current = previous + Math.floor(Math.random() * 10000) - 2000;
    let difference = current - previous;

    let l52 = Math.floor(Math.random() * 100000) + 100;
    let h52 = l52 + Math.floor(Math.random() * 10000) - 2000;

    let trade = {
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

// Create a list of the data, that we modify as we go. if you are using an immutable
// data store (such as Redux) then this would be similar to your store of data.
function createRowData() {
    let rowData = [];
    for (let i = 0; i < symbolList.length; i++) {
        let symbol = symbolList[i];
        for (let j = 0; j < portfolios.length; j++) {
            let portfolio = portfolios[j];

            let bookCount = randomBetween(MAX_BOOK_COUNT, MIN_BOOK_COUNT);

            for (let k = 0; k < bookCount; k++) {
                let book = createBookName();
                let tradeCount = randomBetween(MAX_TRADE_COUNT, MIN_TRADE_COUNT);
                for (let l = 0; l < tradeCount; l++) {
                    let trade = createTradeRecord(symbol, portfolio, book);
                    rowData.push(trade);
                }
            }
        }
    }
    return rowData;
}

//==================================================================================
// Utility functions for context sharing
//----------------------------------------------------------------------------------
/**
 * Pass context to other linked components.
 * @param {string} data Context data to send, expects a simple string but could be any (JSON) Object 
 */
function passContext(data) {
    if (window.fdc3){
        fdc3.broadcast({
            "type": "fdc3.instrument",
            "name": data,
            "id": {
                "ticker": data
            }
        })
    } else {//using FInsemble Linker
        FSBL.Clients.LinkerClient.publish({ dataType: linkerchannelName, data: data });
    }
}

/**
 * Raise an intent with the ticker from the selected row as an instrument as context.
 * @param {string} ticker Ticker symbol to send as context, expects a simple string
 */
function raiseIntent(intent, ticker) {
    if (window.fdc3){
        fdc3.raiseIntent(intent, {
            "type": "fdc3.instrument",
            "name": ticker,
            "id": {
                "ticker": ticker
            }
        });
    }
}

/**
 * Subscribe to context from other linked components.
 */
function subscribeToContext() {
    if (window.fdc3){
        fdc3.addContextListener("fdc3.instrument", (context) => {
            const symbol = context.id.ticker;
            document.getElementById("quick-filter-box").value = symbol;
            gridOptions.api.setQuickFilter(symbol);
            console.log(`Setting quick filter to ${symbol}, stringified: ${JSON.stringify(symbol)}`);
        });
    } else { //using Finsemble Linker
        FSBL.Clients.LinkerClient.subscribe(linkerchannelName, (data) => {
            document.getElementById("quick-filter-box").value = data;
            gridOptions.api.setQuickFilter(data);
            console.log(`Setting quick filter to ${data}, stringified: ${JSON.stringify(data)}`);
        });
    }
}

function cellDoubleClickEventHandler(event) {
    if (event.column.left === 0 && event.value && event.value.trim() !== "") {
        passContext(event.value);
    }
}

//==================================================================================
// Renderer for action buttons
//----------------------------------------------------------------------------------
function BtnCellRenderer() {}

BtnCellRenderer.prototype.init = function(params) {
    if(params.node.level === 0){
        this.params = params;

        this.eGui = document.createElement('button');
        this.eGui.innerHTML = params.title;

        this.btnClickedHandler = this.btnClickedHandler.bind(this);
        this.eGui.addEventListener('click', this.btnClickedHandler);
    }
}

BtnCellRenderer.prototype.getGui = function() {
  return this.eGui;
}

BtnCellRenderer.prototype.destroy = function() {
    if(this.eGui){
        this.eGui.removeEventListener('click', this.btnClickedHandler);
    }
}

BtnCellRenderer.prototype.btnClickedHandler = function(event) {
  this.params.clicked(this.params);
}

//==================================================================================
// Main initialisation function
//----------------------------------------------------------------------------------
const init = () => {
    //configure the grid
    gridOptions = setupGridOptions();

    //init the grid
    let eGridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(eGridDiv, gridOptions);
    document.getElementById("quick-filter-box").oninput = function (event) {
        gridOptions.api.setQuickFilter(event.target.value);
    }
    document.getElementById("quick-filter-box").addEventListener('keyup', (event) => {
        if (event.key == "Enter" && event.target.value && event.target.value.trim() !== "") {
            passContext(event.target.value.toUpperCase());
        }
    });

    //init context subscriptions
    subscribeToContext();
};

//standard finsemble initialize pattern
if (window.FSBL && FSBL.addEventListener) {
    FSBL.addEventListener('onReady', init);
} else {
    window.addEventListener('FSBLReady', init);
};
