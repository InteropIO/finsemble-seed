import html2canvas from 'html2canvas';

const FSBLReady = () => {
	try {
		document.getElementById('screenCapBtn').onclick = screenCapBtnOnclick
	} catch (e) {
		FSBL.Clients.Logger.error(e);
	}
}

const screenCapBtnOnclick = (e) => {
	// Specify the element you wan to screen cap here
	html2canvas(document.body, {
		foreignObjectRendering: true,
		removeContainer: true,
		logging: false
	}).then(function (canvas) {
		// This img object can be passed to remote server using custom service.
		var img = canvas.toDataURL("image/png");

		// Download the img locally
		var link = document.createElement('a');
		link.download = 'filename.png';
		link.href = img
		link.click();
	});
}

if (window.FSBL && FSBL.addEventListener) {
	FSBL.addEventListener("onReady", FSBLReady)
} else {
	window.addEventListener("FSBLReady", FSBLReady)
}