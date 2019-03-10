## PDF.js PDF Viewer Component ##
This component adds support for viewing PDF files inside a Finsemble PDF viewer, based on [PDF.js](https://github.com/mozilla/pdf.js).

![](./screenshot.png)

The viewer can be launched for a specified PDF, preserves its state in workspaces and supports context linking on color channels or drag and drop, via topic names `url` and `pdf`. The payload can either be string or an object with key `url`, indicating which PDF URL to load. 

### Installation ###
1. Add the `pdfJS` component folder to your _/src/components_ directory.
2. Add the component to your webpack build at _/build/webpack/webpack.components.entries.json_: 
```
{
    ...
    "pdfJs": {
        "output": "components/pdfJs/pdfJs",
        "entry": "./src/components/pdfJs/pdfJs.js"
    },
    ...
}
```
3. Add the optional PDF-aware native preload top your build (so that `window.open` calls in components using the preload automatically open in the viewer), by adding the following to your _/build/webpack/webpack.preloads.entries.json_ file:
```
{
	...
	"pdfJsNativeOverrides": {
		"output": "preloads/pdfJsNativeOverrides",
		"entry": "./src/components/pdfJs/pdfJsNativeOverrides.js"
	}
}
```
4. Add the following configuration to your _/configs/application/components.json_ file:
```
{
    "components": {
        ...
        "pdfJs": {
            "window": {
                "url": "$applicationRoot/components/pdfJs/web/viewer.html?file=",
                "frame": false,
                "resizable": true,
                "autoShow": true,
                "top": "center",
                "left": "center",
                "width": 800,
                "height": 600,
                "addToWorkspace": true
            },
            "component": {
                "preload": false
            },
            "foreign": {
                "services": {
                    "dockingService": {
                        "canGroup": true,
                        "isArrangable": true
                    }
                },
                "components": {
                    "App Launcher": {
                        "launchableByUser": true
                    },
                    "Window Manager": {
                        "title": "pdfJs",
                        "FSBLHeader": {
                            "bodyMarginTop": "0px"
                        },
                        "hackScrollbar": true,
                        "persistWindowState": true,
                        "showLinker": true,
                        "alwaysOnTopIcon": true
                    },
                    "Toolbar": {
                        "iconClass": "ff-document-2"
                    }
                }
            }
        },
        ...
```


### Usage ###
To launch the viewer programmatically:

```
window.launchPDFJs = function(url){
	//Spawn the PDF viewer component
	FSBL.Clients.LauncherClient.spawn("pdfJs", {
		position: 'relative', //position the window relative to this window
		left: 'adjacent',     //  to the right
		data: {
			url: url          //PDF URL to load
		}
	}, function(err, w) {
		if(err) { FSBL.Clients.Logger.error("Error launching PDF viewer!", err); }
	});
}
```
or if you want to make use of the Finsemble Linker channels to reuse an existing viewer, try:
```
let linkedComps = FSBL.Clients.LinkerClient.getLinkedComponents({componentTypes: ["pdfJs"]});
let useLinker = linkedComps && linkedComps.length > 0;
if (useLinker && (!name || name !="_blank")) {
	FSBL.Clients.Logger.log("Publishing PDF URL to linked PDF viewer component: " + urlToOpen);
	FSBL.Clients.LinkerClient.publish({dataType: "url", data: urlToOpen});
} else {
	//else spawn a new viewer
	FSBL.Clients.Logger.log("Spawning new PDF viewer component: " + urlToOpen);

	FSBL.Clients.LauncherClient.spawn("pdfJs", { 
		position: 'relative',
		left: 'adjacent',
		data: {
			url: urlToOpen
		}
	}, function (err, response) {
		if (err) {
			console.error("Error launching PDF viewer!", err);
		} else {
			//link new window to parent if any channel is set
			let channels = FSBL.Clients.LinkerClient.getState().channels;
			for (let c=0; c<channels.length; c++) {
				FSBL.Clients.LinkerClient.linkToChannel(channels[c].name, response.windowIdentifier);
			}
		}
	});
}
```

Alternatively, use the provide PDF-viewer aware native overrides file in other components to have them automatically open PDFs in the viewer (with support for linking). See the installation section above for how to add the preload to your build.

Specify the preload in the configuration of other components:
```
{
    "components": {
        ...
        "pdfTester": {
            "window": {
                ...
            },
            "component": {
                "preload": "$applicationRoot/preloads/pdfJsNativeOverrides.js"
            },
			...
```

`window.open` calls in other components will then automatically open in new viewer (or update any linked viewers). E.g.

```
<a onclick="window.open('https://cdn2.hubspot.net/hubfs/2246990/_ChartingLibrary/Library_DataSheet_7_26_17.pdf')" href="#">Charting datasheet</a>
<a onclick="window.open('https://cdn2.hubspot.net/hubfs/2246990/_CryptoIQ/CryptoIQ_Data_Sheet.pdf?utm_campaign=Website%20Tracking&utm_source=data_sheet', '_blank')" href="#">CryptoIQ datasheet</a>
```     
N.B. the last link always opens in new viewer as the `target` was set to `'_blank'`.   

### More examples ###
For more examples, please see the `pdfTester` component included with the viewer.

### Known issues ###
If you open a PDF from within the viewer, the state is currently not preserved.