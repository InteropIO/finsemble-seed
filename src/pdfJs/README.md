## PDF.js PDF Viewer Component ##
These files add support for viewing PDF files inside a Finsemble using [PDF.js](https://github.com/mozilla/pdf.js).

![](./screenshot.png)

The viewer can be launched for a specified PDF, preserves its state in workspaces and supports FDC3 broadcasts on user channels, and raising a `ViewPdf` intent and a `{"type":"custom.pdf", "url": "url-to.pdf"}` context.

**NOTE**: This uses the [prebuilt PFD.js viewer](https://mozilla.github.io/pdf.js/getting_started/#download) which can be [downloaded here](https://mozilla.github.io/pdf.js/getting_started/#download). It's been added directly to the document root to avoid the Finsemble build process. If you need to customise this you may need to build this outside of Finsemble.

### Installation ###
1. Add the `pdfJS` folder to your _/src/_ directory.
2. Add the pdfJs.js preload to your webpack build at _/webpack/entries.json_:
```
[
	{
		"import": "./src/pdfJs/pdfJs.js",
		"filename": "pdfJs/pdfJs.js"
	},
	...
]
```
3. Add the optional PDF-aware native preload top your build (so that `window.open` calls in components using the preload automatically open in the viewer), by adding the following to your _/webpack/entries.json_ file:
```
[
	{
		"import": "./src/pdfJs/pdfJsNativeOverrides.js",
		"filename": "pdfJs/pdfJsNativeOverrides.js"
	},
	...
]
```
4. Add the configuration for the PDF.js viewer app and its preload to your _/public/configs/apps.json_ file. Note that the url for this is referencing the prebuilt PDF.js viewer.

```
{
	"apps": [
		{
			"appId": "pdfJs",
			"type": "web",
			"details": {
				"url": "$documentRoot/preBuiltPdfJs/web/viewer.html?file="
			},
			"hostManifests": {
				"Finsemble": {
					"window": {
						"width": 800,
						"height": 600
					},
					"component": {
						"preload": "$applicationRoot/pdfJs/pdfjs.js"
					}
				}
			},
			"interop": {
				"intents": {
					"listensFor": {
						"ViewPdf": {
							"displayName": "View PDF",
							"contexts": ["custom.pdf"]
						}
					}
				}
			}
		},
		...
	]
```


### Usage ###
To launch the viewer programmatically:

```
window.launchPDFJs = function(url){
	fdc3.raiseIntent("ViewPdf", {
		type: "custom.pdf", url
	})
}
```

or if you want to make use of the FDC3 channels to reuse an existing viewer, try:
```
window.fdc3BroadcastPdf = function(url){
	fdc3.broadcast({
		type: "custom.pdf",
		url
	})
}
```

Alternatively, use the provided PDF-viewer aware native overrides file in other components to have them automatically open PDFs in the viewer (with support for linking). See the installation section above for how to add the preload to your build.

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
