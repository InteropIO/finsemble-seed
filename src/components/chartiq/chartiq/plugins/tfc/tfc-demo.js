(function (definition) {
	"use strict";

	if (typeof exports === "object" && typeof module === "object") {
		module.exports = definition(require('chartiq/js/chartiq'), require('chartiq/plugins/tfc/tfc'));
	} else if (typeof define === "function" && define.amd) {
		define(['chartiq/js/chartiq','chartiq/plugins/tfc/tfc'], definition);
	} else if (typeof window !== "undefined" || typeof self !== "undefined") {
		var global = typeof window !== "undefined" ? window : self;
		definition(global);
	} else {
		throw new Error("Only CommonJS, RequireJS, and <script> tags supported for tfc/tfc-demo.js.");
	}
})(function(_exports, _demo) {
	var CIQ = _exports.CIQ;
	/*
		Demo account - A demo implementation of the CIQ.Account abstract class. This
		class supports placing, modifying and canceling orders. The openOrders will reflect
		the changes but are never executed. Market orders execute immediately and update
		positions. Balances and P&L are static.
	
		You should add your own code to the account fetch and order management functions.
		See {@tutorial Trade From Chart introduction} for implementation details.
	*/
	CIQ.Account.Demo=function(){
		this.currency="USD";
		this.config={
			oto:true,
			oco:true,
			closeAll:true,
			tradeActions:true,
			vsp:"M",
			//showOpenOrdersWhenTFCClosed:true,  // enable this if you want to still show open orders when the tab is closed.
		};

		// this is demo data only and should not be set in the constructor in a live system
		// use fetchBalances(), fetchPositions() and fetchOpenOrders() to gather your data instead.
		// see fully functional CIQ.Account.Demo.fetchBalances() for code sample
		// VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV
		this.positions = {
			"IBM": {quantity: 1000, basis: 126.13, price: 129.13, prevClose: 123.13, currency: "USD"},
			"GE": {quantity: 100, basis: 26.11, price: 24.11, prevClose: 26.11, currency: "USD"},
			"SPY": {quantity: -1000, basis: 187.11, price: 187.11, prevClose: 190.11, currency: "USD"},
			"MSFT": {quantity: -100, basis: 230, price: 58, prevClose: 240, currency: "USD"}
		};
		this.trades = {
			"IBM": [
				{id: "IBM001", time: 1366206180000, quantity: 300, basis: 124.13, price: 129.13, currency: "USD", protect: {limit: 165, stop: 135}},
				{id: "IBM002", time: 1366910520000, quantity: 600, basis: 127.13, price: 129.13, currency: "USD"},
				{id: "IBM003", time: 1407181680000, quantity: 100, basis: 126.13, price: 129.13, currency: "USD"}
			],
			"GE": [{id: "GE001", time: 1433779740000, quantity: 100, basis: 26.11, price: 24.11, currency: "USD", protect: {limit: 30, stop: 25}}],
			"SPY": [
				{id: "SPY001", time: 1419262080000, quantity: -700, basis: 190.45, price: 187.11, currency: "USD"},
				{id: "SPY002", time: 1419262380000, quantity: -300, basis: 179.32, price: 187.11, currency: "USD"}
			],
			"MSFT": [{id: "MSFT001", time: 1420740540000, quantity: -100, basis: 230, price: 58, currency: "USD"}]
		};
		this.openOrders = {
			"IBM": [
				{id: "1", action: "sell", quantity: 500, limit: 197, tif: "GTC", currency: "USD"},
				{id: "2", action: "sell", quantity: 500, limit: 196, tif: "GTC", currency: "USD", vspId: "IBM002"},
				{id: "9", tradeid: "IBM001", action: "sell", quantity: 300, limit: 165, tif: "GTC", currency: "USD", oco: "10"},
				{id: "10", tradeid: "IBM001", action: "sell", quantity: 300, stop: 135, tif: "GTC", currency: "USD", oco: "9"}
			],
			"TSLA": [{id: "3", action: "buy", quantity: 10, limit: 170, tif: "DAY", currency: "USD"}],
			"GE": [
				{id: "4", tradeid: "GE001", action: "sell", quantity: 100, limit: 30, tif: "GTC", currency: "USD", oco: "5"},
				{id: "5", tradeid: "GE001", action: "sell", quantity: 100, stop: 25, tif: "GTC", currency: "USD", oco: "4"}
			],
			"MSFT": [
				{id: "6", action: "buy", quantity: 100, limit: 61, tif: "DAY", currency: "USD", oto: [
					{id: "7", action: "sell", quantity: 100, limit: 61, tif: "GTC", currency: "USD", oco: "8"},
					{id: "8", action: "sell", quantity: 100, stop: 61, tif: "GTC", currency: "USD", oco: "7"}]},
				{id: "9", action: "buy", quantity: 100, limit: 112, tif: "DAY", currency: "USD", oto: [
					{id: "10", action: "sell", quantity: 100, limit: 61, tif: "GTC", currency: "USD", oco: true}]}, // if only one leg, set oco to true.
			]
		};
		// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
	};
	CIQ.inheritsFrom(CIQ.Account.Demo,CIQ.Account);

	CIQ.Account.Demo.prototype.fetchBalances=function(cb){

		// make your server call here and in the request call back set balances and call cb();
		var self = this;
	    CIQ.postAjax("https://jsfiddle.chartiq.com/sample_tfc_balances.js", null, function (status, myserverResponseData) {
	        if (status != 200) {
	            // something went wrong
	        	cb();
	            return;
	        }
	        if(typeof self.balances.cash=="undefined") self.balances=JSON.parse(myserverResponseData);
	        cb();
	    });
	};

	CIQ.Account.Demo.prototype.fetchPositions=function(cb){
	
		// make your server call here and in the request call back set positions and call cb();
		// see CIQ.Account.Demo.fetchBalances for working example
		cb();
	};

	CIQ.Account.Demo.prototype.fetchOpenOrders=function(cb){
	
		// make your server call here and in the request call back set positions and call cb();
		// see CIQ.Account.Demo.fetchBalances for working example
		cb();
	};

	CIQ.Account.Demo.prototype.fetchTrades=function(cb){
	
		// make your server call here and in the request call back set trades and call cb();
		// see CIQ.Account.Demo.fetchBalances for working example
		cb();
	};

	CIQ.Account.Demo.prototype.placeOrder=function(tfc, order, cb){
		if(order.constructor == Array){
			var symbol=order[0].symbol;
			if(!this.openOrders[symbol]) this.openOrders[symbol]=[];
			order[0].id=CIQ.uniqueID();
			order[1].id=CIQ.uniqueID();
			order[0].oco=order[1].id;
			order[1].oco=order[0].id;
			this.openOrders[symbol].push(order[0]);
			this.openOrders[symbol].push(order[1]);
		}else{
			if(!this.openOrders[order.symbol]) this.openOrders[order.symbol]=[];
			if(!order.limit && !order.stop){	// market orders
				this.execute(order, tfc.getCurrentPriceForOrder(order.action));
			}else{
				order.id=CIQ.uniqueID();
				this.openOrders[order.symbol].push(order);
			}
		}
		cb();
	};

	CIQ.Account.Demo.prototype.cancelOrder=function(tfc, order, cb){
		for(var symbol in this.openOrders){
			var openOrders=this.openOrders[symbol];
			for(var i=0;i<openOrders.length;i++){
				var openOrder=openOrders[i];
				if(order.id==openOrder.id){
					if(openOrder.tradeid && this.trades[symbol]){
						for(var t=0;t<this.trades[symbol].length;t++){
							var trade=this.trades[symbol][t];
							if(trade.id==openOrder.tradeid){
								if(openOrder.stop) delete trade.protect.stop;
								else if(openOrder.limit) delete trade.protect.limit;
								if(!trade.protect.stop && !trade.protect.limit) delete trade.protect;
								break;
							}
						}
					}
					openOrders.splice(i--,1);
				}else if(order.id==openOrder.oco){
					openOrder.oco=null;
				}
			}
		}
		cb();
	};

	CIQ.Account.Demo.prototype.replaceOrder=function(tfc, order, cb){
		for(var symbol in this.openOrders){
			var openOrders=this.openOrders[symbol];
			for(var i=0;i<openOrders.length;i++){
				var openOrder=openOrders[i];
				if(order.id==openOrder.id){
					openOrder.limit=order.limit["new"];
					openOrder.stop=order.stop["new"];
					openOrder.tif=order.tif["new"];
					openOrder.quantity=order.quantity["new"];
					if(order.oto["new"]){
						openOrder.oto=order.oto["new"];
					}else{
						delete openOrder.oto;
					}
					if(openOrder.tradeid && this.trades[symbol]){
						for(var t=0;t<this.trades[symbol].length;t++){
							var trade=this.trades[symbol][t];
							if(trade.id==openOrder.tradeid){
								if(openOrder.stop) trade.protect.stop=openOrder.stop;
								else if(openOrder.limit) trade.protect.limit=openOrder.limit;
								break;
							}
						}
					}
					cb();
					return;
				}
			}
		}
	};

	CIQ.Account.Demo.prototype.execute=function(order, price){
		var quantity=order.quantity;
		if(order.action=="sell" || order.action=="short") quantity*=-1;
		this.balances.cash-=quantity*price;
		this.balances.buyingPower=2*this.balances.cash;
		var position=this.positions[order.symbol];
		if(!position){
			this.positions[order.symbol]={quantity: quantity, basis: price, price:price, prevClose:price};
		}else{
			if(position.quantity<0){
				if(order.action=="buy") order.action="cover";
				else if(order.action=="sell") order.action="short";
			}
			if(order.action=="buy" || order.action=="short") {
				position.basis=(((position.quantity * position.basis) + (quantity*price))/(position.quantity+quantity)).toFixed(2);
			}
			position.quantity+=Number(quantity);
			position.price=price;
			if(position.quantity===0){
				delete this.positions[order.symbol];
			}
		}
		var newTrade={id: CIQ.uniqueID(), time: new Date().getTime(), basis: price, price:price};
		if(order.oto){
			newTrade.protect={};
			if(order.oto[0] && order.oto[0].stop) newTrade.protect.stop=order.oto[0].stop;
			else if(order.oto[1] && order.oto[1].stop) newTrade.protect.stop=order.oto[1].stop;
			if(order.oto[0] && order.oto[0].limit) newTrade.protect.limit=order.oto[0].limit;
			else if(order.oto[1] && order.oto[1].limit) newTrade.protect.limit=order.oto[1].limit;
		}
		if(!this.trades[order.symbol]) this.trades[order.symbol]=[];
		if(order.action=="buy" || order.action=="short") {
			newTrade.quantity=quantity;
			this.trades[order.symbol].push(newTrade);
		}else{
			var trades=this.trades[order.symbol];
			var qty=quantity*-1;
			for(var i=0;i<trades.length;i++){
				if(order.vspId && trades[i].id!=order.vspId) continue;
	
				if(Math.abs(trades[i].quantity)<=Math.abs(qty)) {
					qty-=trades[i].quantity;
					if(trades[i].protect) {
						for(var p1=0;p1<this.openOrders[order.symbol].length;p1++){
							var o1=this.openOrders[order.symbol][p1];
							if(o1.tradeid==trades[i].id){
								this.openOrders[order.symbol].splice(p1--,1);
							}
						}
					}
					trades.splice(i--,1);
				}else{
					trades[i].quantity-=qty;
					if(trades[i].protect){
						for(var p2=0;p2<this.openOrders[order.symbol].length;p2++){
							var o2=this.openOrders[order.symbol][p2];
							if(o2.tradeid==trades[i].id){
								o2.quantity-=qty;
							}
						}
					}
					qty=0;
					break;
				}
			}
			if(qty===0){
				if(!this.trades[order.symbol].length) delete this.trades[order.symbol];
			}else{
				newTrade.quantity=qty*-1;
				this.trades[order.symbol].push(newTrade);
			}
		}
		var openOrders=this.openOrders[order.symbol];
		for(var j=0;j<openOrders.length;j++){
			if(openOrders[j].id==order.id){
				openOrders.splice(j,1);
				break;
			}
		}
		if(newTrade.quantity && newTrade.protect){
			var uid=CIQ.uniqueID();
			if(newTrade.protect.limit) this.openOrders[order.symbol].push({id:uid+"A", tradeid:newTrade.id, action:order.action=="buy"?"sell":"cover", quantity:Math.abs(newTrade.quantity), limit:newTrade.protect.limit, tif:"GTC", oco:(newTrade.protect.stop?uid+"B":null)});
			if(newTrade.protect.stop) this.openOrders[order.symbol].push({id:uid+"B", tradeid:newTrade.id, action:order.action=="buy"?"sell":"cover", quantity:Math.abs(newTrade.quantity), stop:newTrade.protect.stop, tif:"GTC", oco:(newTrade.protect.limit?uid+"A":null)});
		}
		if(!this.openOrders[order.symbol].length) delete this.openOrders[order.symbol];
	};

	CIQ.Account.Demo.prototype.setProtection=function(tfc, order, cb){
		var id=[];
		for(var i=0;i<order.length;i++){
			id.push(order[i].tradeid+(order[i].limit?"|L":"|S"));
		}
		cb(null,{id:id});
	};

	CIQ.Account.Demo.prototype.closeAllPositions=function(tfc, cb){
		this.positions={};
		this.trades={};
		for(var symbol in this.openOrders){
			var openOrders=this.openOrders[symbol];
			for(var i=0;i<openOrders.length;i++){
				if(openOrders[i].tradeid){
					openOrders.splice(i--,1);
				}
			}
		}
		cb();
	};

	CIQ.Account.Demo.prototype.closePosition=function(tfc, position, cb){
		var trades=this.trades[position.symbol];
		for(var i=0;i<trades.length;i++){
			var openOrders=this.openOrders[position.symbol];
			if(openOrders){
				for(var j=0;j<openOrders.length;j++){
					if(openOrders[j].tradeid==trades[i].id){
						openOrders.splice(j--,1);
					}
				}
			}
		}
		delete this.trades[position.symbol];
		delete this.positions[position.symbol];
		cb();
	};

	CIQ.Account.Demo.prototype.closeTrade=function(tfc, trade, cb){
		var trades=this.trades[trade.symbol];
		for(var i=0;i<trades.length;i++){
			if(trades[i].id==trade.id){
				trades.splice(i--,1);
				break;
			}
		}
		var position=this.positions[trade.symbol];
		if(position.quantity==trade.quantity){
			delete this.positions[trade.symbol];
		}else{
			position.basis=(((position.quantity*position.basis)-(trade.quantity*trade.basis))/(position.quantity-trade.quantity)).toFixed(2);
			position.quantity-=trade.quantity;
		}
		var openOrders=this.openOrders[trade.symbol];
		if(openOrders){
			for(i=0;i<openOrders.length;i++){
				if(openOrders[i].tradeid==trade.id){
					openOrders.splice(i--,1);
				}
			}
		}
		cb();
	};

	// Set the interval for the Poller
	CIQ.Account.Demo.prototype.Poller.intervals={
		"quotes":{timer:null, poll:5000},
		"account":{timer:null, poll:20000}
	};

	return _exports;
});
