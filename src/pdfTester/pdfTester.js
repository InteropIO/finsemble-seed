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
 * Send a linker share with a new URL for linked viewers to load
 */
window.linkerShare = function(url){
	FSBL.Clients.LinkerClient.publish({dataType: "pdf", data: url});
}
