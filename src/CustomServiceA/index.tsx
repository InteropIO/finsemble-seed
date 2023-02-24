import { types } from "@finsemble/finsemble-core";

const FSBLReady = () => {
	FSBL.Clients.Logger.log("Starting CustomServiceA");
	FSBL.publishReady();

	// MANDATORY if App needs to waitForInitialization
	FSBL.Clients.RouterClient.addResponder(
		`DCS.waitForInitialization_${finsembleWindow.windowName}`,
		(err, message) => {
			message?.sendQueryResponse(null, {
				windowName: finsembleWindow.windowName,
				ready: true,
			});
		}
	);
};

/**
 * This initialization pattern is required in preloads. Do not call FSBL or fdc3 without waiting for this pattern.
 */
if (window.FSBL && FSBL.addEventListener) {
	FSBL.addEventListener("onReady", FSBLReady);
} else {
	window.addEventListener("FSBLReady", FSBLReady);
}
