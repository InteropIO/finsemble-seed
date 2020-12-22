require (['modules/wfg'], function() {
	if (!window.createMarketFactory) window.createMarketFactory = {};
	window.createMarketFactory.wfg = function () {
		CIQ.QuoteFeedToAttach = CIQ.QuoteFeed.wfgQuoteFeed;
		
		window.dataSources['wfg'].marketFactory=function(symbolObject){
			return CIQ.Market.NYSE;
		};
	}
});