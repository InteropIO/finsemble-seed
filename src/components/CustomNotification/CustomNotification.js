
const FSBLReady = () => {
	// setTimeout(() => {
		const customData = document.getElementById("customData");
		try {
			// Do things with FSBL in here.
			debugger;
			var data = FSBL.Clients.WindowClient.getSpawnData();
			console.log("got data", data);
			customData.innerText = `got data:\n${JSON.stringify(data, null, "\t")}`;
		} catch (e) {
			FSBL.Clients.Logger.error(e);
			customData.innerText = `got error:\n${JSON.stringify(e, null, "\t")}`;
		}
	// }, 10);
}

FSBL.addEventListener('onReady', FSBLReady);
