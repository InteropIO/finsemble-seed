## PDF Viewer Testing Component ##
This testing component is intended to provide examples of working with the [PDF.js](../pdfJs/README.md) or [Viewer.js](../viewerJS/README.md) PDF viewer components. Please ensure that you have included one or both of these viewers before using this component.

![](./screenshot.png)

Please review [pdfTester.html](./pdfTester.html) and [pdfTester.js](./pdfTester.js) for other examples of spawning or context sharing with the viewers.

### Installation ###
1. Add the `pdfTester` component folder to your _/src/components_ directory.
2. Add the component to your webpack build at _/build/webpack/webpack.components.entries.json_: 
```
{
    ...
    "pdfTester": {
        "output": "components/pdfTester/pdfTester",
        "entry": "./src/components/pdfTester/pdfTester.js"
    },
    ...
}
```
3. Install either or both of the [PDF.js](../pdfJs/README.md) or [Viewer.js](../viewerJs/README.md) PDF viewer components (as per their own instructions).
4. Add the following configuration to your _/configs/application/components.json_ file:
```
{
    "components": {
        ...
        "pdfTester": {
            "window": {
                "url": "$applicationRoot/components/pdfTester/pdfTester.html",
                "frame": false,
                "resizable": true,
                "autoShow": true,
                "top": "center",
                "left": "center",
                "width": 400,
                "height": 850
            },
            "component": {
                "preload": "$applicationRoot/preloads/pdfJsNativeOverrides.js"
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
                        "title": "pdfTester",
                        "FSBLHeader": true,
                        "persistWindowState": true,
                        "showLinker": true
                    },
                    "Toolbar": {
                        "iconClass": "ff-component"
                    }
                }
            }
        }
        ...
```

The tester makes use of the PDF-viewer aware native overrides file, provided with the PDF.js viewer (there is viewer.js equivalent also). Please ensure that you've add one or other of these preload files to your webpack build (as per the relevant README file for your chosen viewer) and have updated the preload specified in above component configuration (`components.pdfTester.component.preload`) accordingly.

