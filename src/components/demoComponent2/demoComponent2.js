const transmitOnclick = () => {
	let symbol = document.getElementById('symbol').value
	let price = document.getElementById('price').value
	let dt = document.getElementById('dt').value
	let input = document.getElementById('input').value


	FSBL.Clients.RouterClient.transmit("demoTransmitChannel2", {
		symbol: symbol,
		price: price,
		dt: dt,
		input: input
	});
}

const FSBLReady = () => {
	try {
		// Do things with FSBL in here.
		FSBL.Clients.RouterClient.addListener("demoTransmitChannel1", function (error, response) {
			if (error) {
				FSBL.Clients.Logger.error(error)
			} else {
				var data = response.data;
				document.getElementById("symbol").value = response.data.symbol
				document.getElementById("price").value = response.data.price
				document.getElementById("dt").value = response.data.dt
			}
		});

		document.getElementById('transmit').addEventListener('click', transmitOnclick)

	} catch (e) {
		FSBL.Clients.Logger.error(e);
	}
}

if (window.FSBL && FSBL.addEventListener) {
	FSBL.addEventListener("onReady", FSBLReady)
} else {
	window.addEventListener("FSBLReady", FSBLReady)
}