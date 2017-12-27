FSBL.addEventListener('onReady', function () {
	FSBL.Clients.LinkerClient.addToGroup("group1");
	//do things with FSBL in here.
	function addSymbolToDom(symbol) {
		let div = document.createElement('div');
		div.innerHTML = `Symbol received:${symbol}`;
		document.body.appendChild(div);
	};
	FSBL.Clients.LinkerClient.subscribe("symbol", addSymbolToDom);

	document.getElementById('publish').onclick = () => {
		let val = document.getElementById('symbol').value;
		FSBL.Clients.LinkerClient.publish({ dataType: "symbol", data: val });
	};
});