const FSBLReady = () => {
	try {
		FSBL.Clients.RouterClient.addListener("fileDownloadProgress", function(error,res) {
			if (error) {
				console.log("FILE DOWNLOAD ERROR - ", error);
			} else {
				//console.log(`FILE DOWNLOAD PROGRESS - WINDOW:${res.data.data.windowName} - FILE: ${res.data.data.path} - STATUS: ${res.data.data.state} - RECEIVED BYTES: ${res.data.data.receivedBytes} - TOTAL BYTES: ${res.data.data.totalBytes}`)
			
				let windowList = document.getElementById('windowList').querySelectorAll(`div[windowName='${res.data.data.windowName}']`)
				let window;
				if(windowList.length==0){
					window = document.createElement("div");
					window.setAttribute('windowName', res.data.data.windowName)
					window.innerHTML = res.data.data.windowName
					document.getElementById('windowList').appendChild(window);
				}else{
					window = windowList[0]
				}

				let fileName = res.data.data.path.substring(res.data.data.path.lastIndexOf('\\')+1, res.data.data.path.length)
				let fileListLength =  window.querySelectorAll(`div`).length
				switch(res.data.data.state){
					case 'progressing':
						let progressingFile = window.querySelectorAll(`div[fileName='${fileName}'][status='progressing']`)
						if(fileName)
							if(progressingFile.length == 0){
								let file = document.createElement("div");
								file.setAttribute('id', fileListLength+1)
								file.setAttribute('fileName', fileName)
								file.setAttribute('status', res.data.data.state)
								file.setAttribute('receivedBytes', res.data.data.receivedBytes)
								file.setAttribute('totalBytes', res.data.data.totalBytes)
								file.innerHTML = `${file.getAttribute('id')}: ${file.getAttribute('fileName')} ${file.getAttribute('status')} ${file.getAttribute('receivedBytes')}/${file.getAttribute('totalBytes')}`
								window.appendChild(file);
							}else{
								progressingFile[0].setAttribute('status', res.data.data.state)
								progressingFile[0].setAttribute('receivedBytes', res.data.data.receivedBytes)
								progressingFile[0].setAttribute('totalBytes', res.data.data.totalBytes)
								progressingFile[0].innerHTML = `${progressingFile[0].getAttribute('id')}: ${progressingFile[0].getAttribute('fileName')} ${progressingFile[0].getAttribute('status')} ${progressingFile[0].getAttribute('receivedBytes')}/${progressingFile[0].getAttribute('totalBytes')}`
							}
						break;
						
					case 'completed':
						let toCompleteFile = window.querySelectorAll(`div[fileName='${fileName}'][status='progressing']`)
						toCompleteFile[0].setAttribute('status', res.data.data.state)
						toCompleteFile[0].innerHTML = `${toCompleteFile[0].getAttribute('id')}: ${toCompleteFile[0].getAttribute('fileName')} ${toCompleteFile[0].getAttribute('status')}`	
						break;
					
				}
			
			
			}
		});
	} catch (e) {
		FSBL.Clients.Logger.error(e);
	}
}

if (window.FSBL && FSBL.addEventListener) {
	FSBL.addEventListener("onReady", FSBLReady)
} else {
	window.addEventListener("FSBLReady", FSBLReady)
}