### Viewer.js PDF Viewer ###




```
pdfURL = "https://cdn2.hubspot.net/hubfs/2246990/_Finsemble/DataSheets/Finsemble_DataSheet_4_12_18.pdf";

FSBL.Clients.ConfigClient.getValue("finsemble.components.viewerJs.window.url", (err,viewerURL) => {
    let spawnURL = viewerURL + "#" + pdfURL;
    console.log(`
pdfURL:    ${pdfURL}
viewerURL: ${viewerURL}
spawnURL:  ${spawnURL}`);

    FSBL.Clients.LauncherClient.spawn("viewerJs", {
        url: spawnURL
    });
});
```


```
FSBL.Clients.LauncherClient.spawn("viewerJs", {
    url: spawnURL,
	data: {
		url: <PDF url>
	}
});
```