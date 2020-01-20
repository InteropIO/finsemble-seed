


const FSBLReady = () => {
	try {
		FSBL.Clients.RouterClient.addListener('WindowService-Event-'+finsembleWindow.identifier.name+"-fileDownloadProgress", function(error,res) {
			if (error) {
				console.log("FILE DOWNLOAD ERROR - ", error);
			} else {
				//console.log(`FILE DOWNLOAD PROGRESS - FILE: ${res.data.path} - STATUS: ${res.data.state} - RECEIVED BYTES: ${res.data.receivedBytes} - TOTAL BYTES: ${res.data.totalBytes}`)
				let fileName = res.data.path.substring(res.data.path.lastIndexOf('\\')+1, res.data.path.length)
				let fileListLength =  document.getElementById('fileList').querySelectorAll(`div`).length
				switch(res.data.state){
					case 'progressing':
						let progressingFile = document.getElementById('fileList').querySelectorAll(`div[fileName='${fileName}'][status='progressing']`)
						if(fileName)
							if(progressingFile.length == 0){
								let file = document.createElement("div");
								file.setAttribute('id', fileListLength+1)
								file.setAttribute('fileName', fileName)
								file.setAttribute('status', res.data.state)
								file.setAttribute('receivedBytes', res.data.receivedBytes)
								file.setAttribute('totalBytes', res.data.totalBytes)
								file.innerHTML = `${file.getAttribute('id')}: ${file.getAttribute('fileName')} ${file.getAttribute('status')} ${file.getAttribute('receivedBytes')}/${file.getAttribute('totalBytes')}`
								document.getElementById('fileList').appendChild(file);
							}else{
								progressingFile[0].setAttribute('status', res.data.state)
								progressingFile[0].setAttribute('receivedBytes', res.data.receivedBytes)
								progressingFile[0].setAttribute('totalBytes', res.data.totalBytes)
								progressingFile[0].innerHTML = `${progressingFile[0].getAttribute('id')}: ${progressingFile[0].getAttribute('fileName')} ${progressingFile[0].getAttribute('status')} ${progressingFile[0].getAttribute('receivedBytes')}/${progressingFile[0].getAttribute('totalBytes')}`
							}
						break;
						
					case 'completed':
						let toCompleteFile = document.getElementById('fileList').querySelectorAll(`div[fileName='${fileName}'][status='progressing']`)
						toCompleteFile[0].setAttribute('status', res.data.state)
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


