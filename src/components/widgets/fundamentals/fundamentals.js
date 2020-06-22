/***********************************************************************************************************************
	Copyright 2017-2020 by ChartIQ, Inc.
	Licensed under the ChartIQ, Inc. Developer License Agreement https://www.chartiq.com/developer-license-agreement
 **********************************************************************************************************************/
var finWindow;

var defaultSettings = {
	"newSearch": {
		"maxResults": 50
	},
	"dataSource": "xignite",
	"mainWidget": "Company",
	"items": {
		"widget1": {
			"itemType": "ScrollingTicker",
			"symbolList": [
				["NDX.IND_GIDS", "Nasdaq"],
				["SPX.INDCBSX", "S&P 500"],
				["DJI.IND_DJI", "Dow Jones"],
				["USDJPY", "Yen"],
				["USDEUR", "Euro"],
				["XAUUSD", "Gold"],

			]
		},
		"newSearch": {
			"itemType": "Search"
		},
		"fundamentals": {
			"itemType": "Fundamentals",
			"dependsOn": "finsemble",
			"fundamentals": {
				"stock": {
					"BusinessDescription": "Business Description",
					"PERatio": "Price/Earnings Ratio",
					"PriceToBook": "Price/Book Ratio",
					"PriceToCashFlow": "Price/Cash Flow",
					"PriceToSalesFiscal": "Price/Sales (TTM)",
					"QuickRatio": "Quick Ratio",
					"CurrentRatio": "Current Ratio (MRQ)",
					"LongTermDebtToEquityRatio": "LT Debt to Equity",
					"LongTermDebtToTotalCapital": "LT Debt to Total Capital",
					"ReturnOnCommonEquity": "Return On Equity",
					"ReturnOnAssets": "Return On Assets",
					"5YearAverageReturnOnInvestedCapital": "5 Year Average Return On Invested Capital",
					"AssetTurnover": "Asset Turnover",
					"52WeekRange": {
						"Type": "Range",
						"TitleText": "52 Week Range",
						"Value1": "FiftyTwoWeekLow",
						"Value2": "FiftyTwoWeekHigh",
						"Value3": "Last"
					},
					"DayRange": {
						"Type": "Range",
						"TitleText": "Day Range",
						"Value1": "Low",
						"Value2": "High",
						"Value3": "Last"
					}
				},
				"fund": {
					"52WeekRange": {
						"Type": "Range",
						"TitleText": "52 Week Range",
						"Value1": "FiftyTwoWeekLow",
						"Value2": "FiftyTwoWeekHigh",
						"Value3": "Last"
					},
					"FundObjective": "Fund Objective",
					"NetAssets": "Net Assets",
					"ProspectusNetExpenseRatio": "Prospectus Net Expense Ratio",
					"TrailingTwelveMonthYield": "TTM Yield",
					"WeightingTopTenHoldings": "Top Ten Holdings Weight",
					"TurnoverRatio": "TurnoverRatio",
					"InitialInvestment": "Initial Investment",
					"ClosedToNewInvestors": "Closed To New Investors"
				},
				"etf": {
					"52WeekRange": {
						"Type": "Range",
						"TitleText": "52 Week Range",
						"Value1": "FiftyTwoWeekLow",
						"Value2": "FiftyTwoWeekHigh",
						"Value3": "Last"
					},
					"BusinessDescription": "Fund Summary",
					"NetAssets": "Net Assets",
					"ProspectusNetExpenseRatio": "Prospectus Net Expense Ratio",
					"TrailingTwelveMonthYield": "TTM Yield",
					"WeightingTopTenHoldings": "Top Ten Holdings Weight",
					"TurnoverRatio": "TurnoverRatio"
				}

			},

			"display": {
				"stock": [
					["Company", [["BusinessDescription"]]],
					["Performance", [["52WeekRange"], ["DayRange"]]],
					["Valuation", [["PERatio", "PriceToBook"], ["PriceToCashFlow", "PriceToSalesFiscal"]]]
				],
				"fund": [
					["Company", [["FundObjective"]]],
					["Performance", [["52WeekRange"]]],
					["Fundamentals", [["TrailingTwelveMonthYield", "NetAssets", "ClosedToNewInvestors"]]],
					["Portfolio", [["WeightingTopTenHoldings", "TurnoverRatio"]]]
				],
				"etf": [
					["Company", [["BusinessDescription"]]],
					["Performance", [["52WeekRange"]]],
					["Fundamentals", [["TrailingTwelveMonthYield", "NetAssets"]]],
					["Portfolio", [["WeightingTopTenHoldings"]]]
				]

			}
		},
		"finsemble": {
			"itemType": "Finsemble",
			dependsOn: 'newSearch'
		}
	},
	"isSymbolDriven": true,

	"layout": [
		[
			["newSearch"]
		],
		[
			["fundamentals"]
		],
		[
			["finsemble"]
		]
	]
};


const init = function () {
	finWindow = fin.desktop.Window.getCurrent();
	requirejs(['../widgetBase']);

	FSBL.Clients.DataTransferClient.addReceivers({
		receivers: [
			{
				type: "symbol", //for drag and drop
				handler: function (err, response) {
					var message = {
						sender: "newSearch",
						subject: 'symbolChange',
						data: {
							symbol: response.data.symbol.symbol
						}
					}
					PortalCore.sendMessage(message);

				}
			}
		]
	})

	FSBL.Clients.DataTransferClient.setEmitters({
		emitters: [
			{
				type: "symbol", //for drag and drop
				data: function (err, response) {
					return {
						'symbol': portalSettings.items.fundamentals.symbol,
						'description': 'Symbol ' + portalSettings.items.fundamentals.symbol
					};
				}
			}
		]
	})
};

if (window.FSBL && FSBL.addEventListener) {
	FSBL.addEventListener("onReady", init);
} else {
	window.addEventListener("FSBLReady", init);
}