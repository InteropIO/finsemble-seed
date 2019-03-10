window.launchPDFJs = function(url){
	FSBL.Clients.LauncherClient.spawn("pdfJs", {
		position: 'relative',
		left: 'adjacent',
		data: {
			url: url
		}
	}, function(err, w) {
		if(err) {
			FSBL.Clients.Logger.error("Error launching PDF viewer!",err);
		} else {
			//link new window to parent if any channel is set
			let channels = FSBL.Clients.LinkerClient.getState().channels;
			for (let c=0; c<channels.length; c++) {
				FSBL.Clients.LinkerClient.linkToChannel(channels[c].name, response.windowIdentifier);
			}
		}
	});
}

window.launchViewerJs = function(url){
	FSBL.Clients.LauncherClient.spawn("viewerJs", {
		position: 'relative',
		right: 'adjacent',
		data: {
			url: url
		}
	}, function(err, response) {
		if(err) {
			FSBL.Clients.Logger.error("Error launching PDF viewer!",err);
		} else {
			//link new window to parent if any channel is set
			  //add a slight delay as viewerJS windows refresh after spawning and can miss the signal
			let winId = response.windowIdentifier;
			setTimeout(() => {
				let channels = FSBL.Clients.LinkerClient.getState().channels;
				for (let c=0; c<channels.length; c++) {
					FSBL.Clients.LinkerClient.linkToChannel(channels[c].name, winId);
				}
			},2500);
		}
	});
}

window.linkerShare = function(url){
	FSBL.Clients.LinkerClient.publish({dataType: "url", data: url});
}

if (window.FSBL && FSBL.addEventListener) {
	FSBL.addEventListener('onReady', init);
} else {
	window.addEventListener('FSBLReady', init);
} 

function init() {
	FSBL.Clients.DragAndDropClient.setEmitters({
		emitters: [
			{
				type: "url",
				data: "https://cdn2.hubspot.net/hubfs/2246990/TFC_DataSheet-1.pdf?utm_campaign=Website%20Tracking&utm_source=data_sheet"
			}
		]
	});
}
