/**
    Override for the function that transmits data back to the parent window
*/
window.mySetData = function(e) {
	//retrieve the form data
	this.childValue = document.querySelector('#childvalue').value;
	//transmit it back to the parent window
	FSBL.Clients.RouterClient.transmit(window.channelName, this.childValue);
	//optionally, close the window
	FSBL.Clients.WindowClient.close();
}

function init() {
	console.log("Initialising child window overrides now")
	//Receive any data we were passed in spawnData and set it in the window's scope
	let data = FSBL.Clients.WindowClient.getSpawnData();
	if (data) {
		console.log("got data: ", data);
		for (const key in data) {
			if (data.hasOwnProperty(key)) {
				window[key] = data[key];
			}
		}
	} else {
		console.log("no spawn data to get :-(");
	}

	//remove the event listener on a button and replace it with the Finsemble version
	//n.b. if we don't have a reference to the event listener function then the only 
	//  way to remove is to clone it and replace it:
	// let el = document.querySelector('#set');
    // let elClone = el.cloneNode(true);
	// el.parentNode.replaceChild(elClone, el);
	document.querySelector('#set').removeEventListener('click', window.setData);
	document.querySelector('#set').addEventListener('click', window.mySetData);
}

//Init function to run when Finsemble is ready...
if (window.FSBL && FSBL.addEventListener) {
	FSBL.addEventListener('onReady', init);
} else {
	window.addEventListener('FSBLReady', init);
}