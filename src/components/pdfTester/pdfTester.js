/**
 * Launch the PDF.js based PDF viewer component with a specified URL.
 * Once spawned the viewer's linker channels are set to match the current window's.
 */
window.launchPDFJs = function(url){
	FSBL.Clients.LauncherClient.spawn("pdfJs", {
		position: 'relative', //position the window relative to this window
		left: 'adjacent',     //  to the right
		data: {
			url: url          //PDF URL to load
		}
	}, function(err, w) {
		if(err) {
			FSBL.Clients.Logger.error("Error launching PDF viewer!",err);
		} else {
			//link new window to same channels as parent (if any are set)
			let channels = FSBL.Clients.LinkerClient.getState().channels;
			for (let c=0; c<channels.length; c++) {
				FSBL.Clients.LinkerClient.linkToChannel(channels[c].name, response.windowIdentifier);
			}
		}
	});
}

/**
 * Launch the Viewer.js based PDF viewer component with a specified URL.
 * Once spawned the viewer's linker channels are set to match the current window's
 * (although note the slight delay added to account for the viewer refreshing on load).
 */
window.launchViewerJs = function(url){
	FSBL.Clients.LauncherClient.spawn("viewerJs", {
		position: 'relative', //position the window relative to this window
		right: 'adjacent',    //  to the left
		data: {
			url: url          //PDF URL to load
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

/**
 * Send a linker share with a new URL for linked viewers to load
 */
window.linkerShare = function(url){
	FSBL.Clients.LinkerClient.publish({dataType: "pdf", data: url});
}

if (window.FSBL && FSBL.addEventListener) {
	FSBL.addEventListener('onReady', init);
} else {
	window.addEventListener('FSBLReady', init);
} 

function init() {
	/**
	 * Setup a DragAndDrop emitter with a PDF URL to load.
	 */
	FSBL.Clients.DragAndDropClient.setEmitters({
		emitters: [
			{
				type: "pdf",
				data: "https://cdn2.hubspot.net/hubfs/2246990/TFC_DataSheet-1.pdf?utm_campaign=Website%20Tracking&utm_source=data_sheet"
			}
		]
	});
}
