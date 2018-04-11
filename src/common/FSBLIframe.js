if (window.top === window) {
	// Proxy subscribe and publis requests
	window.addEventListener("message", (e) => {
		var msg = e.data;
		console.log(msg);
		if (!msg) return;
		switch (msg.command) {
			case "subscribe":
				let dataType = msg.arguments[0];	
				FSBL.Clients.LinkerClient.subscribe(dataType, function (response) {
					Array.from(window.frames).forEach(frame => {
						frame.postMessage({command:"subscribe", dataType: dataType, response: response}, "*");
					});
				});
			case "publish":
				FSBL.Clients.LinkerClient.publish.apply(FSBL.Clients.LinkerClient, msg.arguments);
			default:
				break;
		}
	});
} else {
	let linkerSubscribeHandler = {};
	window.addEventListener("message", (e) => {
		var msg = e.data;
		switch (msg.command) {
			case "subscribe":
				linkerSubscribeHandler[msg.dataType](msg.response);
			default:
				break;
		}
	});
	window.FSBL = {
		addEventListener: (type, cb) => {
			if (document.readyState === "loading") {
				document.addEventListener("DOMContentLoaded", function () {
					setTimeout(cb, 1000); // Give the top frame a second for FSBL to get ready
				});
			} else {
				cb();
			}
		},
		Clients: {
			Logger: {
				log: console.log,
				info: console.info,
				debug: console.debug,
				verbose: console.info,
				error: console.error,
			},
			WindowClient: {
				options: {},
				getComponentState: (p, cb) => { cb(null, undefined); },
				setComponentState: (p, cb = Function.prototype) => { cb(); },
				setWindowTitle: (p) => { return null; }
			},
			DragAndDropClient: {
				setEmitters: () => { },
				updateReceivers: () => { },
				removeReceivers: () => { },
				addReceivers: () => { }
			},
			LinkerClient: {
				subscribe: (dataType, cb) => {
					console.log("child frame is subscribing");
					var msg = {
						api: "LinkerClient",
						command: "subscribe",
						arguments: [dataType]
					}
					linkerSubscribeHandler[dataType] = cb;
					window.top.postMessage(msg, "*");
				},
				publish: (params) => {
					var msg = {
						api: "LinkerClient",
						command: "publish",
						arguments: [params]
					}
					window.top.postMessage(msg, "*");
				}
			}
		}
	};
}