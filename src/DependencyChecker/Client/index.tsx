/**
 * This "Client" component acts as a proxy for applications that need to spawn dependencies before launch.
 *
 * The Client sends its windowName and dependency details to the dependency checker service, and creates
 * a dedicated router channel to receive dependency status updates.
 *
 * For web applications, once all dependencies are marked as complete, the Client will navigate to the intended
 * URL of the app. For native applications, the dependency checker service will close the Client window and
 * re-use its windowName to spawn the native application.
 *
 * Note that this component is designed to be used as a component within your application, and should not be
 * used as a preload or an API.
 *
 * To use the Client, simply update your apps configurations that have dependency requirements as per
 * the documentation provided.
 */
import { Dependency, DependencyConfig } from "../../types";

const FSBLReady = () => {
	FSBL.Clients.Logger.log("Starting LauncherDependencyClient...");

	const { windowName } = finsembleWindow;
	const { appConfig, custom } = finsembleWindow?.windowOptions?.customData;
	const { appId } = appConfig;
	const {
		appUrl,
		appPath,
		dependencies = [],
	}: { appUrl?: string; appPath?: string; dependencies?: Dependency[] } = custom;

	const dependencyConfigMap = new Map<string, DependencyConfig>();

	dependencies.reduce((acc, curr) => {
		const { appId, ...rest } = curr;
		acc.set(curr.appId, rest);
		return acc;
	}, dependencyConfigMap);

	// send my dependencies and windowName to DependencyCheckerService
	FSBL.Clients.RouterClient.transmit("DependencyCheckerService", {
		dependencies,
		windowName,
		appId,
		appConfig,
		appPath,
	});

	// Listen to dependency status changes
	const removeListener = FSBL.Clients.RouterClient.addListener(`DependenciesStatus_${windowName}`, (err, response) => {
		if (response.data.error) {
			const errorDiv = document.getElementById("error");
			errorDiv!.innerHTML = "Error spawning component dependencies - Check Central Logger for additional details";
		}

		if (response.data.status) {
			const { status, dependency } = response.data;
			const statusMsg = `${dependency} -  status: ${status}`;
			const messageContainer = document.getElementById("message-container");
			messageContainer!.innerHTML += `<br>${statusMsg}`;
			if (status === "started" || (status === "error" && dependencyConfigMap.get(dependency)?.critical === false)) {
				dependencies.splice(dependencies.indexOf(dependency), 1);
			}
		}
		// navigate to original app url
		if (dependencies.length === 0) {
			removeListener();
			// if we have an appUrl then we're spawning a web app
			// native apps are spawned by the service which will
			// trigger the close of this window
			if (appUrl) {
				window.location.href = appUrl;
			}
		}
	});
};

/**
 * This initialization pattern is required in preloads. Do not call FSBL or fdc3 without waiting for this pattern.
 */
if (window.FSBL && FSBL.addEventListener) {
	FSBL.addEventListener("onReady", FSBLReady);
} else {
	window.addEventListener("FSBLReady", FSBLReady);
}
