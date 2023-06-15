/**
 * Launch the PDF.js based PDF viewer component with a specified URL.
 */
window.launchPDFJs = function(url){
	fdc3.raiseIntent("ViewPdf", {
		type: "custom.pdf", url
	})
}


/**
 * Broadcast a new URL for linked viewers to load
 */
window.fdc3BroadcastPdf = function(url){
	fdc3.broadcast({
		type: "custom.pdf",
		url
	})
}
