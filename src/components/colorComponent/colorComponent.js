function setColor(colorData) {
	document.body.style.backgroundColor = colorData.colorHex;
	document.getElementById("colorName").textContent = colorData.colorName;
}

const FSBLReady = () => {
	window.updateColor = async () => {
		var colorData = (await FSBL.Clients.RouterClient.query("colorSearchProvider.currentColor", {})).response.data;
		setColor(colorData);
	};

	try {
		var colorData = FSBL.Clients.WindowClient.getSpawnData();
		setColor(colorData);
	} catch (e) {
		FSBL.Clients.Logger.error(e);
	}
};

if (window.FSBL && FSBL.addEventListener) {
	FSBL.addEventListener("onReady", FSBLReady);
} else {
	window.addEventListener("FSBLReady", FSBLReady);
}
