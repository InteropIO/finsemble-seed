/**
 * This file contains a set of overrides that will convert HTML5 window actions to corresponding Finsemble actions.
 * Overrides must be specified for each component via a "preload" script. You do this by adding the preload to the
 * component config like so:
 * 
 * 	"Your Component": {
  			...
			"component": {
				...
				"inject": false,
				"preload": "$applicationRoot/preloads/nativeOverrides.js"
				...
			}
			...
		}

	IMPORTANT NOTE: If you set that path incorrectly it will cause Finsemble to stop working in that component.
	Check your component's chrome console for the existence of FSBL. If it doesn't exist then check your path.
 */

/**
 * This overrides the browser's built in window.open function by instead creating windows using LauncherClient.spawn.
 * This ensures that the Finsemble workspace manager is aware of newly opened windows, that they can participate in
 * the on screen workspace management, and that they can be restored with workspaces.
 */
window.open = function (URL, name, specs, replace) {
	var params = {};
	if (specs) {
		let paramList = specs.split(",");
		for (let i = 0; i < paramList.length; i++) {
			let param = paramList[i].split("=");
			params[param[0]] = param[1];
		}
	}
	if (name) {
		switch (name) {
			case "_self":
				location.href = URL;
				return;
			case "_top":
				window.top.href = URL;
				return;
			case "_parent":
				window.parent.href = URL;
				return;
			case "_blank":
				break;
			default:
				params.name = name;
		}
	}
	params.url = URL;

	var w;
	FSBL.Clients.LauncherClient.spawn(null, params, function (err, response) {
		w = response.finWindow;
	});
	return w;
}

/**
 * Overrides the browser's built in alerting. Native alerts are synchronous. They cause the application to cease functioning
 * and they create an ugly pop up window. For now these alerts can be supressed. In the future they will be channeled to a specific notification channel.
 */
window.alert = window.console.log;
