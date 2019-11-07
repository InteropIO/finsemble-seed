/**
 * Launch the PDF.js based PDF viewer component with a specified URL.
 * Once spawned the viewer's linker channels are set to match the current window's.
 */
window.launchPDFJs = function(url){
	let myChannels = FSBL.Clients.LinkerClient.getState().channels;
	let channels = [];
	myChannels.forEach(channel => {
		channels.push(channel.name);
	});
	let data = {
		url: url,          	    //PDF URL to load
		linker: {
			channels: channels  //Set same linker channels as parent
		}
	};
	
	FSBL.Clients.LauncherClient.spawn("pdfJs", {
		position: 'relative', //position the window relative to this window
		left: 'adjacent',     //  to the right
		data: data
	}, function(err, response) {
		if(err) {
			FSBL.Clients.Logger.error("Error launching PDF viewer!",err);
		}
	});
}

/**
 * Launch the Viewer.js based PDF viewer component with a specified URL.
 * Once spawned the viewer's linker channels are set to match the current window's
 * (although note the slight delay added to account for the viewer refreshing on load).
 */
window.launchViewerJs = function(url){
	let myChannels = FSBL.Clients.LinkerClient.getState().channels;
	let channels = [];
	myChannels.forEach(channel => {
		channels.push(channel.name);
	});
	let data = {
		url: url,          	    //PDF URL to load
		linker: {
			channels: channels  //Set same linker channels as parent
		}
	};
	
	FSBL.Clients.LauncherClient.spawn("viewerJs", {
		position: 'relative', //position the window relative to this window
		right: 'adjacent',    //  to the left
		data: data
	}, function(err, response) {
		if(err) {
			FSBL.Clients.Logger.error("Error launching PDF viewer!",err);
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
