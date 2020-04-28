const transmitOnclick = () => {
	let symbol = document.getElementById('symbol').value
	let price = document.getElementById('price').value
	let dt = document.getElementById('dt').value
	let input = document.getElementById('input').value

	FSBL.Clients.RouterClient.query("demoServiceResponder", {
		"action": 'sendOrderData',
		"data": {
			symbol: symbol,
			price: price,
			dt: dt,
			input: input
		}
	}, function (error, response) {
		if (!error) {
			alert(response.data.result)
		} else {
			FSBL.Clients.Logger.error(error)
		}
	});

	FSBL.Clients.RouterClient.transmit("demoTransmitChannel2", );
}

const FSBLReady = () => {
	try {
		// Retrieve spawn data
		var spawndata = FSBL.Clients.WindowClient.getSpawnData()
		if(Object.keys(spawndata).length !== 0)
			handleData(spawndata)

		// Do things with FSBL in here.
		FSBL.Clients.RouterClient.addListener("demoTransmitChannel1", function (error, response) {
			if (!error) {
				handleData(response.data)
			} else {
				FSBL.Clients.Logger.error(error)
			}
		});

		document.getElementById('transmit').addEventListener('click', transmitOnclick)
	} catch (e) {
		FSBL.Clients.Logger.error(e);
	}
}

const handleData = (data) => {
	document.getElementById("symbol").value = data.symbol
	document.getElementById("price").value = data.price
	document.getElementById("dt").value = data.dt
}

if (window.FSBL && FSBL.addEventListener) {
	FSBL.addEventListener("onReady", FSBLReady)
} else {
	window.addEventListener("FSBLReady", FSBLReady)
}