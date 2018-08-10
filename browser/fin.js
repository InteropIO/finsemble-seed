var config = {
	"devtools_port": 9090,
	"startup_app": {
		"name": "ChartIQ Local",
		"url": "http://localhost/finsembleBrowser/finsemble/components/system/serviceManager/serviceManager.html",
		"uuid": "Finsemble-Nomura-POC",
		"applicationIcon": "http://localhost/finsembleBrowser/components/assets/img/Nomura_Taskbar_Icon.png",
		"defaultTop": 0, "defaultLeft": 0, "showTaskbarIcon": true, "autoShow": false, "frame": false,
		"resizable": false, "maximizable": false, "delay_connection": true, "contextMenu": true, "cornerRounding": { "width": 4, "height": 4 }, "alwaysOnTop": false
	},
	"runtime": { "arguments": "--noerrdialogs  --v=1 --no-sandbox  --enable-crash-reporting", "version": "7.53.23.16" },
	"shortcut": {
		"company": "ChartIQ", "description": "ChartIQ Local", "icon": "http://localhost/finsembleBrowser/components/assets/img/Nomura_Taskbar_Icon.ico", "name": "ChartIQ - LOCAL", "target": ["desktop", "start-menu"], "force": false, "startMenuRootFolder": "ChartIQ Local"
	},
	"dialogSettings": {
		"logo": "http://localhost/finsembleBrowser/components/assets/img/ciq-banner-100x25.png", "bgColor": 4280109424, "textColor": 4293521652, "progressBarBgColor": 4294967295, "progressBarFillColor": 4282684881, "progressBarBorderColor": 4293521652
	},
	"supportInformation": { "company": "ChartIQ", "product": "Finsemble Local Demo", "email": "finsemble@chartiq.com" },
	"splashScreenImage": "http://localhost/finsembleBrowser/components/assets/img/nomura-splash.png", "fileName": "Nomura-Finsemble-POC-installer",
	"finsemble": {
		"rootServiceDir": "", //Added by Sidd
		"applicationRoot": "http://localhost/finsembleBrowser/finsemble-seed",
		"cssOverridePath": "http://localhost/finsembleBrowser/components/assets/css/finsemble-overrides.css",
		"moduleRoot": "http://localhost/finsembleBrowser/finsemble/",
		"importConfig": ["$moduleRoot/configs/core/services.json", "$applicationRoot/configs/application/presentationComponents.json"],
		"comment": "Top-level core configuration -- the `hidden` config file that is always automatically loaded",
		"FSBLVersion": "1.2.40-0",
		"gitHash": "e94cb8b28040a0d701a47fe5e8f3559e59121e69",
		"runTimeContext": "local",
		"servicesRoot": "http://localhost/finsembleBrowser/finsemble/services",
		"finsembleLibraryPath": "http://localhost/finsembleBrowser/index.js",
		"betaFeatures": {
			"assimilation": {
				"enabled": false
			}
		},
		"servicesConfig": {
			"docking": {
				"enabled": false
			}
		},
		"components": {},
		"splinteringConfig": {
			"enabled": false,
			"splinterAgents": []
		},
		"storage": {

		}
	}
}

var windows;
if (window === window.top) {
	windows = {};
} else {
	windows = window.top.windows;
}


class FinsembleBrowserFinWindow {
	constructor(params, callback) {
		this.name = params.name;
		this.options = {};
		var frame = document.createElement('iframe');
		if (params.url) frame.src = params.url;

		//var frame = window.open(params.url, params.name);
		Object.assign(frame, params);
		Object.assign(self, params);
		this.frame = frame;

		let win = window;
		if (window !== window.top) {
			win = window.top;
		}
		win.document.body.appendChild(frame);
		this.contentWindow = frame.contentWindow;
		//self.contentWindow = frame;
		this.contentWindow.fin = fin;

		windows[this.name] = this;

		setTimeout(callback, 10);
	}

	getNativeWindow() {
		return this.frame.contentWindow;
	}

	addEventListener(event, callback) {
		window.addEventListener(event, callback);
	}

	isShowing() {
		return true;
	}

	static getCurrent() {
		return window;
	}

	static wrap(name) {
		return windows[name]
	}

	getOptions(callback) {
		callback(this.options);
	}

	updateOptions(options) {
		this.options = Object.assign(this.options, options);
	}
}

class FinsembleSystem {
	static getMonitorInfo(cb) {
		cb({
			primaryMonitor: {
				monitor: {
					scaledRect: {
						top: 0,
						left: 0,
						bottom: window.top.document.documentElement.clientHeight,
						right: window.top.document.documentElement.clientWidth,
						height: window.top.document.documentElement.clientHeight,
						width: window.top.document.documentElement.clientWidth,
					},
					dipRect: {
						top: 0,
						left: 0,
						bottom: window.top.document.documentElement.clientHeight,
						right: window.top.document.documentElement.clientWidth,
						height: window.top.document.documentElement.clientHeight,
						width: window.top.document.documentElement.clientWidth,
					},
				},
				monitorRect: {
					top: 0,
					left: 0,
					bottom: window.top.document.documentElement.clientHeight,
					right: window.top.document.documentElement.clientWidth,
					height: window.top.document.documentElement.clientHeight,
					width: window.top.document.documentElement.clientWidth,
				},
				availableRect: {
					top: 0,
					left: 0,
					bottom: window.top.document.documentElement.clientHeight,
					right: window.top.document.documentElement.clientWidth,
					height: window.top.document.documentElement.clientHeight,
					width: window.top.document.documentElement.clientWidth,
				}
			},
			nonPrimaryMonitors: []
		});
	}

	static addEventListener () {

	}

	static getHostSpecs (cb) {
		cb("Browser");
	}

	static getVersion (cb) {
		cb("Browser");
	}
}

class FinsembleApplication extends FinsembleBrowserFinWindow {
	constructor(params, callback) {
		super(params, callback);
	}
	run() {

	}
}


var systemReady = false;
window.addEventListener("load", () => {
	systemReady = true;
})


window.fin = function () { }
fin.desktop = {
	Window: FinsembleBrowserFinWindow,
	System: FinsembleSystem,
	Application: FinsembleApplication,
	main: (doStuffOnLoad) => {
		if (!systemReady) {
			window.addEventListener('load', doStuffOnLoad)
		} else {
			doStuffOnLoad();
		}
	}

}

window.getManifest = function (callback) {
	callback(config)
}

window.isShowing = function (callback) {
	callback(true);
}

fin.desktop.InterApplicationBus = function () {
	return this;
}

fin.desktop.InterApplicationBus.subscribe = function () {

}

fin.desktop.System = FinsembleSystem;



if (window.parent) {
	window.__parent = window.parent
} else {
	window.__parent = window.self
}

window.getOptions = function (cb) {
	let options = {
		customData: {
			manifest: config
		}
	}
	cb(options);
	return options;
}

fin.desktop.Window.wrap = function (name) {
	return windows[name]
}

fin.desktop.Notification = function () {
	return this;
}