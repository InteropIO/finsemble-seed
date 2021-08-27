(function (definition) {
    "use strict";

	if (typeof exports === "object" && typeof module === "object") {
		module.exports = definition(require('chartiq/examples/templates/js/sample-template-advanced'));
	} else if (typeof define === "function" && define.amd) {
		define(['chartiq/examples/templates/js/sample-template-advanced'], definition);
	} else if (typeof window !== "undefined" || typeof self !== "undefined") {
		var global = typeof window !== "undefined" ? window : self;
		definition(global);
	} else {
		throw new Error("Only CommonJS, RequireJS, and <script> tags supported for cryptoIQWorkstation.js.");
	}

})(function(_exports){
	var CIQ = _exports.CIQ;

	var createChart=_exports.createChart;

	_exports.createChart=function(){
		$("cq-tradehistory-table cq-scroll").prop("reduceMenuHeight", 45 - parseFloat($("#flexContainer").css("top"))); // take into account -15 margin on the flex container
		var stxx=createChart({animation:true, rangeSlider:true, marketDepth:false, initialSymbol:"^btcusd"});
    
		if(CIQ.MarketDepth) new CIQ.MarketDepth({stx:stxx, volume:true, mountain:true, step:true, record:true, height:"40%", precedingContainer:"#marketDepthBookmark"});
	
		// Set defaults for initial load
		function overrideLayoutSettings(obj){
			var stx=obj.stx;
			stx.setChartType("line");
			CIQ.extend(stx.layout,{
				crosshair:true,
				headsUp:"static",
				l2heatmap:true,
				rangeSlider:true,
				marketDepth:true,
				extended:false
			});
			stx.changeOccurred("layout");
			var tradeToggle=$('.stx-trade')[0];
			if(tradeToggle) tradeToggle.set(true);  // open the TFC sidepanel
		}

		overrideLayoutSettings({stx:stxx});
		stxx.addEventListener("symbolImport",overrideLayoutSettings);
		
		function moneyFlowChart(stx){
			var initialPieData={"Up":{index:1},"Down":{index:2},"Even":{index:3}};
		
			var pieChart=new CIQ.Visualization({
				container: "cq-tradehistory-table div[pie-chart] div",
				renderFunction: CIQ.SVGChart.renderPieChart,
				colorRange: ["#8cc176","#b82c0c","#7c7c7c"],
				className: "pie",
				valueFormatter: CIQ.condenseInt
			}).updateData(CIQ.clone(initialPieData));
			var last=0;
			stx.append("updateCurrentMarketData",function(data, chart, symbol, params){
				if(symbol) return;
				var items=document.querySelectorAll("cq-tradehistory-body cq-item");
				var d={};
				for(var i=0;i<items.length;i++){
					var item=items[i];
					if(item==last) break;
					var dir=item.getAttribute("dir");
					if(!dir) dir="even";
					dir=CIQ.capitalize(dir);
					if(!d[dir]) d[dir]=0;
					d[dir]+=parseFloat(item.querySelector("[col=amount]").getAttribute("rawval"));
				}
				if(i) pieChart.updateData(d, "add");
				last=items[0];
			});
			stx.addEventListener("symbolChange",function(obj){
				pieChart.updateData(CIQ.clone(initialPieData));
			});
			return pieChart;
		}
		stxx.moneyFlowChart=moneyFlowChart(stxx);
		
		return stxx;
	};

	return _exports;
	
});