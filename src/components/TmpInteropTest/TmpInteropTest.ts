/** Got to export _something_ to eliminate typescript linting errors */
export let nothing = 0;

let w = window as any;

// Broadcasting the same symbol twice appears as a broadcast loop to the service, so
// we rotate symbols to avoid this situation
const symbols = ["IBM", "GE", "MSFT", "AAPL"];
let symbolPointer = 0;

const symbolAndIterate = () => {
	const symbol = symbols[symbolPointer];
	/*symbolPointer = symbolPointer + 1;
	if (symbolPointer >= symbols.length) symbolPointer = 0;
	const element = document.getElementById("broadcast");
	if (element) element.innerText = `broadcast symbol="${symbols[symbolPointer]}"`;*/
	return symbol;
};

w.showDevTools = () => {
	const myWindow = FSBL.System.Window.getCurrent();
	FSBL.System.showDeveloperTools(myWindow.name);
};

w.addContextListenerSymbol = () => {
	fdc3.addContextListener("symbol", (context: any) => {
		const message: any = context;
		alert(`Received symbol context: ${message.symbol}`);
	});
};

w.broadcastSymbol = () => {
	const context = {
		type: "symbol",
		symbol: symbolAndIterate(),
	};
	fdc3.broadcast(context);
};

w.getSystemChannelsTest = async () => {
	let channels = await fdc3.getSystemChannels();
	console.log("---------getSystemChannelsTest result", channels);
};

/** Expect display all linked channels as "Channel" objects */
w.getCurrentChannelsTest = async () => {
	// @ts-ignore getCurrentChannels() doesn't exist on DesktopAgent yet because this won't be available until FDC3 2.0
	let channels = await fdc3.getCurrentChannels();
	console.log("---------getCurrentChannels result", channels);
};

/** Expect broadcast across the first linked channel */
w.broadcastToCurrentChannelTest = async () => {
	let channel = await fdc3.getCurrentChannel();
	const context = {
		type: "symbol",
		symbol: symbolAndIterate(),
	};

	if (channel) channel.broadcast(context);
	else console.log("No joined channel");
};

/** Expect linker to link to Channel 2 */
w.joinChannelTest = async () => {
	fdc3.joinChannel("Channel 2");
};

w.getInfoTest = async () => {
	let info = fdc3.getInfo();
	console.log("---------getInfoTest result", info);
};

w.sampleIntentResolver = async () => {
	let testHandler = async (choices: any) => {
		// return the last app in list
		let result = {
			selectedApp: { appId: choices.openApps[choices.openApps.length - 1].meta.appId },
			windowName: choices.openApps[choices.openApps.length - 1].windowName,
		};
		return result;
	};

	let channels = await w.FSBL.internal.interopAdmin.registerUIResolverListener(testHandler);

	console.log("---------getSystemChannelsTest result", channels);
};

w.findIntentTest1 = async () => {
	let appIntent = await fdc3.findIntent("ViewChart", { type: "fdc3.instrument" }).catch((err: any) => {
		console.error("findIntentTest1", err);
	});
	if (appIntent) {
		let element: any = document.getElementById("intentResponse1");
		if (element) {
			element.innerHTML = JSON.stringify(appIntent, undefined, 4);
			console.log("findIntentTest result", element.innerHTML);
		}
	}
};

w.findIntentTest2 = async () => {
	let appIntent = await fdc3.findIntent("ViewChartStudy", { type: "fdc3.instrument" }).catch((err: any) => {
		console.error("findIntentTest2", err);
	});
	if (appIntent) {
		let element: any = document.getElementById("intentResponse2");
		if (element) {
			element.innerHTML = JSON.stringify(appIntent, undefined, 4);
			console.log("findIntentTest result", element.innerHTML);
		}
	}
};

w.findIntentTest3 = async () => {
	let appIntent = await fdc3.findIntent("ViewNews", { type: "fdc3.date" }).catch((err: any) => {
		console.error("findIntentTest3", err);
	});
	if (appIntent) {
		let element: any = document.getElementById("intentResponse3");
		if (element) {
			element.innerHTML = JSON.stringify(appIntent, undefined, 4);
			console.log("findIntentTest result", element.innerHTML);
		}
	}
};

w.findIntentTest4 = async () => {
	let appIntent = await fdc3.findIntent("ViewChart", { type: "fdc3.news" }).catch((err: any) => {
		console.error("findIntentTest4", err);
	});
	if (appIntent) {
		let element: any = document.getElementById("intentResponse4");
		if (element) {
			element.innerHTML = JSON.stringify(appIntent, undefined, 4);
			console.log("findIntentTest result", element.innerHTML);
		}
	}
};

w.findIntentTest5 = async () => {
	let appIntent = await fdc3.findIntent("ViewChart").catch((err: any) => {
		console.error("findIntentTest5", err);
	});
	if (appIntent) {
		let element: any = document.getElementById("intentResponse5");
		if (element) {
			element.innerHTML = JSON.stringify(appIntent, undefined, 4);
			console.log("findIntentTest result", element.innerHTML);
		}
	}
};

w.findIntentTest6 = async () => {
	let appIntent = await fdc3.findIntent("Unknown", { type: "fdc3.instrument" }).catch((err: any) => {
		console.error("findIntentTest6", err);
	});
	if (appIntent) {
		let element: any = document.getElementById("intentResponse6");
		if (element) {
			element.innerHTML = JSON.stringify(appIntent, undefined, 4);
			console.log("findIntentTest result", element.innerHTML);
		}
	}
};

w.findIntents1 = async () => {
	let appIntents = await fdc3.findIntentsByContext({ type: "fdc3.instrument" });
	let element: any = document.getElementById("intentsResponse1");
	if (element) {
		element.innerHTML = JSON.stringify(appIntents, undefined, 4);
		console.log("findIntentTest result", element.innerHTML);
	}
};

w.findIntents2 = async () => {
	let appIntents = await fdc3.findIntentsByContext({ type: "fdc3.news" });
	let element: any = document.getElementById("intentsResponse2");
	if (element) {
		element.innerHTML = JSON.stringify(appIntents, undefined, 4);
		console.log("findIntentTest result", element.innerHTML);
	}
};

w.findIntents3 = async () => {
	let appIntents = await fdc3.findIntentsByContext({ type: "fdc3.date" });
	let element: any = document.getElementById("intentsResponse3");
	if (element) {
		element.innerHTML = JSON.stringify(appIntents, undefined, 4);
		console.log("findIntentTest result", element.innerHTML);
	}
};

w.findIntents4 = async () => {
	let appIntents = await fdc3.findIntentsByContext({ type: "unknown" });
	let element: any = document.getElementById("intentsResponse4");
	if (element) {
		element.innerHTML = JSON.stringify(appIntents, undefined, 4);
		console.log("findIntentTest result", element.innerHTML);
	}
};

w.findIntents5 = async () => {
	// @ts-ignore we want to test what happens when the function call is mis-used
	let appIntents = await fdc3.findIntentsByContext().catch((err: any) => {
		console.error("findIntents5", err);
	});
	let element: any = document.getElementById("intentsResponse5");
	if (element) {
		element.innerHTML = JSON.stringify(appIntents, undefined, 4);
		console.log("findIntentTest result", element.innerHTML);
	}
};

w.listenForIntentHotdog = () => {
	fdc3.addIntentListener("hotdog", () => {
		alert(`Received hotdog intent`);
	});
};

w.listenForIntentViewChart = () => {
	fdc3.addIntentListener("ViewChart", () => {
		alert(`Received ViewChart intent`);
	});
};

w.raiseIntentHotdog = () => {
	fdc3.raiseIntent("hotdog", { type: "fdc3.instrument", id: { ticker: "hotdog" } }).catch((err: any) => {
		console.error("raiseIntentHotdog", err);
	});
};

w.raiseIntentTestViewNews = () => {
	fdc3.raiseIntent("ViewNews", { type: "fdc3.instrument", id: { ticker: "ibm" } }).catch((err: any) => {
		console.error("raiseIntentTest0", err);
	});
};

w.raiseIntentTestViewChartWithTarget = () => {
	console.log(
		fdc3.raiseIntent(
			"ViewChart",
			{ type: "fdc3.instrument", id: { ticker: "ibm" } },
			{
				name: "Chart",
			}
		)
	);
};

w.raiseIntentTestViewChart = () => {
	fdc3.raiseIntent("ViewChart", { type: "fdc3.instrument", id: { ticker: "ibm" } });
};

w.raiseIntentTestThreeIntents = () => {
	fdc3.raiseIntent("ViewChart", { type: "fdc3.instrument", id: { ticker: "A" } });
	fdc3.raiseIntent("ViewChart", { type: "fdc3.instrument", id: { ticker: "B" } }, "Chart");
	fdc3.raiseIntent("ViewChart", { type: "fdc3.instrument", id: { ticker: "C" } }, "Chart");
};

w.raiseIntentTestViewChartABC = () => {
	fdc3.raiseIntent("ViewChartABC", { type: "fdc3.instrument", id: { ticker: "ibm" } }, "Chart").catch((err: any) => {
		console.error("raiseIntentTest3", err);
	});
};

w.raiseIntentForContextTest1 = () => {
	fdc3.raiseIntentForContext({ type: "fdc3.instrument", id: { ticker: "ibm" } });
};

w.raiseIntentForContextTest2 = () => {
	fdc3.raiseIntentForContext({ type: "fdc3.instrument", id: { ticker: "ibm" } }, "Chart");
};

w.showIntentSelector = async () => {
	/*
	// Maybe come back to this one day
	// @ts-ignore we want to test what happens when the function call is mis-used
	let appIntents = await fdc3.findIntentsByContext();
	console.log("==========>>>>>>>>>>>", appIntents);

	var intents = appIntents.map((element: any) => element.intent.name);

	var select = document.createElement("select");
	select.name = "intents";
	select.id = "intents";

	for (const val of intents) {
		let option = document.createElement("option");
		option.value = val;
		option.text = val.charAt(0).toUpperCase() + val.slice(1);
		select.appendChild(option);
	}

	var contexts: string[] = ["contextA", "contextB", "contextC"];

	var context = document.createElement("select");
	context.name = "contexts";
	context.id = "contexts";

	for (const val of contexts) {
		let option = document.createElement("option");
		option.value = val;
		option.text = val.charAt(0).toUpperCase() + val.slice(1);
		context.appendChild(option);
	}

	var label = document.createElement("label");
	label.innerHTML = "Choose Intent and Context: ";

	const intentSelector = document.getElementById("intentSelector");
	intentSelector && intentSelector.appendChild(label).appendChild(select);

	const contextSelector = document.getElementById("contextSelector");
	contextSelector && contextSelector.appendChild(label).appendChild(context);
*/
};

w.raiseIntentSelector = () => {};

w.openAppTest1 = () => {
	fdc3.open("Chart", { type: "fdc3.instrument", id: { ticker: "appl" } });
};

w.openAppTest2 = () => {
	fdc3.open("ChartXYZ", { type: "fdc3.instrument", id: { ticker: "appl" } }).catch((err: any) => {
		console.error("openAppTest2", err);
	});
};

w.addApps = async () => {
	let { data: appDConfig } = await FSBL.Clients.ConfigClient.getValue({ field: "finsemble.appd" });
	await w.FSBL.internal.interopAdmin.addAppDefinitions(appDConfig);
};

w.removeApps = async () => {
	await w.FSBL.internal.interopAdmin.removeAppDefinitions(["Chart"]);
};

w.dynamicConfig = () => {
	FSBL.Clients.ConfigClient.processAndSet({
		newConfig: {
			appd: {
				"Dynamic App": {
					appId: "Dynamic App",
					name: "Dynamic App",
					description: "Visualize market data in the leading FDC3 compliant technical chart.",
					manifest: {
						window: {
							url: "https://assets.finsemble.com/components/chart/technical-analysis-chart.html",
						},
						foreign: {
							components: {
								"App Launcher": { launchableByUser: true },
								Toolbar: { iconClass: "ff-chart-advanced" },
								"Window Manager": { FSBLHeader: true, persistWindowState: true },
							},
						},
					},
				},
			},
		},
		overwrite: true,
		replace: true,
	});
};

document.addEventListener("DOMContentLoaded", async (event) => {
	setTimeout(w.showIntentSelector, 2000);
});
