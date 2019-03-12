const FSBLReady = () => {
	interface MessageConfig {
		color?: string;
		message?: string;
		done?: boolean;
	}
	try {
		// Do things with FSBL in here.
		const runMe = (config: MessageConfig): void => {
			window.alert(`<p>${config.message} ${config.color}</p>`)
		}
		runMe({ color: "red", message: "yeaah it works" })
	} catch (e) {
		FSBL.Clients.Logger.error(e);
	}
}

if (window.FSBL && FSBL.addEventListener) {
	FSBL.addEventListener("onReady", FSBLReady)
} else {
	window.addEventListener("FSBLReady", FSBLReady)
}