/**
 * PDF viewer aware native overrides.
 * This file contains a set of overrides, customised to work with a PDF.js based PDF viewer component, that will
 * convert HTML5 window actions to corresponding Finsemble actions.
 * Overrides must be specified for each component via a "preload" script. You do this by adding the preload to the
 * component config like so:
 *
 * 	"Your Component": {
  			...
			"component": {
				...
				"inject": false,
				"preload": "$applicationRoot/preloads/pdfJsNativeOverrides.js"
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
 *
 * This attempts to detect URLs pointing to PDF files and automatically opens them in the PDF viewer component.
 */

var originalWindowOpen = window.open;
window.open = function (urlToOpen, name, specs, replace) {

	var parsedUrl = new URL(urlToOpen);
	if (parsedUrl.pathname.toLowerCase().endsWith(".pdf")) {
		//Handle a PDF
		return handlePdfUrl(urlToOpen, name, specs, replace);
	} else {
		//Handle other URL
		return handleOtherUrl(urlToOpen, name, specs, replace);
	}
}

const handlePdfUrl = async function (urlToOpen, name, specs, replace) {
	FSBL.Clients.Logger.log("Handling PDF URL via PDF.js: " + urlToOpen);
	fdc3.raiseIntent("ViewPdf", {
		type: "custom.pdf",
		url: urlToOpen
	})
}

const handleOtherUrl = function (urlToOpen, name, specs, replace) {
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
				location.href = urlToOpen;
				return;
			case "_top":
				window.top.href = urlToOpen;
				return;
			case "_parent":
				window.parent.href = urlToOpen;
				return;
			case "_blank":
				break;
			default:
				params.name = name;
		}
	}
	params.url = urlToOpen;

	var w;
	FSBL.Clients.LauncherClient.spawn("", params, function (err, response) {
		if (err) {
			console.error("pdfJsNativeOverrides.js window.open patch error: " + err);
		} else {
			w = response.finWindow;
		}
	});
	return w;
}
