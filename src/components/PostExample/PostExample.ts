/**
 * Example of sending POST data to spawn a component
 */
export {} 

declare global {
	interface Window { FSBL: any; }
}

declare const FSBL: any

//make sure both Finsemble and the DOM are ready before we process the form
let domIsReady = false, fsblIsReady = false;
document.addEventListener('DOMContentLoaded', domReady);
if (window.FSBL && FSBL && FSBL.addEventListener) {
	FSBL.addEventListener('onReady', fsblReady);
} else {
	window.addEventListener('FSBLReady', fsblReady);
}

function fsblReady() {
	fsblIsReady = true;
	console.log("FSBL ready");
	init();
}

function domReady() {
	domIsReady = true;
	console.log("DOM ready");
	init();
}

function init() {
	if (domIsReady && fsblIsReady) {
		console.log('Initializing form');
		const form : HTMLFormElement = <HTMLFormElement> document.getElementById('theForm');
		const spawnData = FSBL && FSBL.Clients.WindowClient.getSpawnData();
		if (spawnData) {
			Object.keys(spawnData).forEach(key => {
				if (key == "url") {
					form.setAttribute("action", spawnData.url);
				} else if (key == "method") {
					form.setAttribute("method", spawnData.method);
				} else {
					//add all other fields to the form
					var input = document.createElement('input');
					input.name = key;
					input.value = spawnData[key];
					form.appendChild(input);
				}
			});
		}

		if (spawnData.url) {
			//if a URL was specified, auto-submit the form
			form.submit();
		} else {
			//setup the form for manual testing
			const urlLabel : HTMLInputElement = <HTMLInputElement> document.getElementById('urlLabel');
			const urlField : HTMLInputElement = <HTMLInputElement> document.getElementById('urlField');

			//add a data field
			const input = document.createElement('input');
			input.id = "data"
			input.name = "data";
			const label = document.createElement('label');
			label.innerText = "Enter POST data:";
			label.appendChild(input);
			form.prepend(label);

			const submitButton = document.getElementById('submitButton');
			if(submitButton) {
				submitButton.addEventListener('click', () => {
					form.setAttribute("action", urlField.value);
					form.submit();
				});
			}

			//make the form visible
			urlLabel.style.visibility = 'visible';
			form.style.visibility = 'visible';
		}	
	}
}