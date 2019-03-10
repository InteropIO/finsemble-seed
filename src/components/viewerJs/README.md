### Viewer.js PDF Viewer ###
https://viewerjs.org/


```
pdfURL = "https://cdn2.hubspot.net/hubfs/2246990/_Finsemble/DataSheets/Finsemble_DataSheet_4_12_18.pdf";

//manually construct spawn URL from viewer URL and PDF url (seaprated by #)
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

//Or just pass in PDF URL as spawn data and component wrapper will deal with it
```
FSBL.Clients.LauncherClient.spawn("viewerJs", {
    url: spawnURL,
	data: {
		url: <PDF url>
	}
});
```