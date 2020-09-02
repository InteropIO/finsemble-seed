const FSBLReady = () => {
	try {
		require("@cosaic/finsemble-ui/react/assets/css/finsemble.css");
	} catch (e) {
		// @ts-ignore
		FSBL.Clients.Logger.error(e);
	}
};

// @ts-ignore
if (window.FSBL && FSBL.addEventListener) {
	// @ts-ignore
	FSBL.addEventListener("onReady", FSBLReady);
} else {
	window.addEventListener("FSBLReady", FSBLReady);
}
