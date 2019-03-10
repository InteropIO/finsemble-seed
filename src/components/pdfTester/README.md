## PDF Viewer Testing Component ##
This testing component is intended to provide examples of working with the [PDF.js](../pdfJs/README.md) or [Viewer.js](../viewerJS/README.md) PDF viewer components. Please ensure that you have included one or both of these viewers before using this component.

The tester makes use of the PDF-viewer aware native overrides file, provided with the PDF.js viewer (there is viewer.js equivalent also), to automatically open PDFs in the viewer (with support for linking). To install the preload, add it to your _/build/webpack/webpack.preloads.entries.json_ file:
```
{
	...
	"pdfJsNativeOverrides": {
		"output": "preloads/pdfJsNativeOverrides",
		"entry": "./src/components/pdfJs/pdfJsNativeOverrides.js"
	}
}
```

and then specify it in the configuration of other components:
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
<a onclick="window.open('https://cdn2.hubspot.net/hubfs/2246990/_Finsemble/DataSheets/Finsemble_DataSheet_4_12_18.pdf')" href="#">Finsemble datasheet</a>
```     

Please review [pdfTester.html](./pdfTester.html) and [pdfTester.js](./pdfTester.js) for other examples of spawning or context sharing with the viewers.
