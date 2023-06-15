## PDF Viewer Testing Component ##
This testing component is intended to provide an example of working with the [PDF.js](../pdfJs/README.md). Please ensure that you have this viewer before using this component.

![](./screenshot.png)

Please review [pdfTester.html](./pdfTester.html) and [pdfTester.js](./pdfTester.js) for other examples of spawning or context sharing with the viewers.

### Installation ###
1. Add the `pdfTester` app folder to your _/src/_ directory.
2. Add the app to your webpack build at _/webpack/entries.json_:
```
{
  ...
	{
		"filename": "pdfTester/pdfTester.js",
		"import": "./src/pdfTester/pdfTester.js"
	}
  ...
}
```
3. Install the [PDF.js](../pdfJs/README.md) app (as per its own instructions).
4. Add the following configuration to your _/public/configs/apps.json_ file:
```
{
	"apps": [
		{
			"appId": "pdfTester",
			"type": "web",
			"details": {
				"url": "$applicationRoot/pdfTester/pdfTester.html"
			},
			"hostManifests": {
				"Finsemble": {
					"component": {
						"preload": "$applicationRoot/pdfJs/pdfJsNativeOverrides.js"
					}
				}
			}
		},
    ...
	]
```

Note the preload above. The tester makes use of the PDF-viewer aware native overrides file, provided with the PDF.js viewer. Please ensure that you've added this preload file to your webpack build (as per the README file) and have updated the preload path is correct according to your implementation.

