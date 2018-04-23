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

window.alert = window.console.log;
