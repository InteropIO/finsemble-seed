/**
 * Launch the PDF.js based PDF viewer component with a specified URL.
 * Once spawned the viewer's linker channels are set to match the current window's.
 */
window.launchPDFJs = function(url){
	console.log("Asdf")
	fdc3.raiseIntent("ViewPdf", {
		type: "custom.pdf", url
	})
}


/**
 * Send a linker share with a new URL for linked viewers to load
 */
window.fdc3BroadcastPdf = function(url){
	fdc3.broadcast({
		type: "custom.pdf",
		url
	})
}
