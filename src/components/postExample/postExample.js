/**
 * Example of sending POST data to spawn a component
 */

//make sure both Finsemble and the DOM are ready before we process the form
let domIsReady = false, fsblIsReady = false;
document.addEventListener('DOMContentLoaded', domReady);
if (window.FSBL && FSBL.addEventListener) {
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
		var form = document.getElementById('theForm');
		const spawnData = FSBL.Clients.WindowClient.getSpawnData();
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
			var urlLabel = document.getElementById('urlLabel');
			var urlField = document.getElementById('urlField');

			//add a data field
			var input = document.createElement('input');
			input.id = "data"
			input.name = "data";
			var label = document.createElement('label');
			label.innerText = "Enter POST data:";
			label.appendChild(input);
			form.prepend(label);

			document.getElementById('submitButton').addEventListener('click', () => {
				form.setAttribute("action", urlField.value);
				form.submit();
			});

			//make the form visible
			urlLabel.style.visibility = 'visible';
			form.style.visibility = 'visible';
		}	
	}
}
