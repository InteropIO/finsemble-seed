const FSBLReady = () => {
	try {
		// Do things with FSBL in here.
		document.getElementById('showWelcomeBtn').onclick = showWelcome

	} catch (e) {
		FSBL.Clients.Logger.error(e);
	}
}

const showWelcome = () => {
	FSBL.Clients.RouterClient.query('test.showWindow',{}, (err,data)=>{
		if(!err){
			console.log(data)
		} else {
			console.log(err)
		}
	})
}

if (window.FSBL && FSBL.addEventListener) {
	FSBL.addEventListener("onReady", FSBLReady)
} else {
	window.addEventListener("FSBLReady", FSBLReady)
}