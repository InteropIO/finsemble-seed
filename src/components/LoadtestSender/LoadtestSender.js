const FSBLReady = () => {
	try {
		document.getElementById('startTest').addEventListener('click', startTest)
		FSBL.Clients.RouterClient.addListener('EndDsTestChannel', (err,msg)=>{
			if(err!=null){
				console.log(err)
			}else{
				if(msg.data.state == 'end'){
					document.getElementById('startTest').disabled = false
					console.log("test complete");
				}

			}
		})
	} catch (e) {
		FSBL.Clients.Logger.error(e);
	}
}

const startTest = () => {
	let source = document.getElementById('mode').value
	let dataSize = document.getElementById('dataSize').value
	let testDuration = document.getElementById('testDuration').value
	let burstInterval = document.getElementById('burstInterval').value
	let burstCount = document.getElementById('burstCount').value
	let msgGroupCount = document.getElementById('groupMsgCount').value
	console.log("starting test");
	switch (document.getElementById('mode').value) {
		case 'routerTransmit':
			routerTest(source, dataSize, testDuration, burstInterval, burstCount, msgGroupCount)
			break;
		case 'distributedStore':
			distributedStoreTest(source, dataSize, testDuration, burstInterval, burstCount, msgGroupCount)
			break;
		default:
			break;
	}
}

const distributedStoreTest = (source, dataSize, testDuration, burstInterval, burstCount, msgGroupCount) => {
	let dsStartMsg ={
		testState: "start",
		dataSize: dataSize,
		testDuration: testDuration,
		burstInterval: burstInterval,
		burstCount: burstCount,
		messageCounter: 0,
		source: source,
		msgGroupCount: msgGroupCount
	}

	FSBL.Clients.RouterClient.transmit("StartDsTestChannel", dsStartMsg);
	document.getElementById('startTest').disabled = true

}

// FOR SENDER WINDOW
// Copy and execute this section of code in the devTools console of component/window that will send the router data -- allows just one sender
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Parameters:
// 		dataSize: the number of bytes to send in each message
//		testDuration: how long to run the test in milliseconds
//		burstInterval: the timer interval in milliseconds to send each burst of message (e.g. 1 is every millisecond; 10 is every 10 milliseconds )
//		burstCount: the number of messages to send in each burst
// Notes:
//		1) test results are logged in the central logger -- filter on "RouterPerformance" and look at contents of "RouterPerformance receiver done" message
//		2) if the burstInterval is small(e.g. 1 millisecond) then sender often can't keep up, resulting in few messages being sent
//		3) if the test is long and the burstInterval is small and the burstCount is high then can saturate the system, possibly crashing Finsemble
// Example:
// 		senderTest (10, 5000, 10, 10) results in a 5 second test with 5 byte messages, with a burst of 10 messages sent every 10 milliseconds
// 		senderTest (2048, 10000, 5, 20) results in a 10 second test with 2048 byte messages, with a burst of 20 messages sent every 5 milliseconds
const routerTest = (source, dataSize, testDuration, burstInterval, burstCount, msgGroupCount) => {
	let messageCounter = 0
	document.getElementById('startTest').disabled = true

	let testData = "";
	for (let i = 0; i < dataSize; i++) {
		testData = testData.concat("X");
	}

	let startMsg = {
		testState: "start",
		dataSize: dataSize,
		testDuration: testDuration,
		burstInterval: burstInterval,
		burstCount: burstCount,
		senderStartTime: new Date(),
		messageCounter: 0,
		source: source
	}

	FSBL.Clients.RouterClient.transmit("RouterTestChannel", startMsg);

	let timerID = setInterval(() => {
		let msgGroup = []
		for (let i = 0; i < burstCount; i++) {
			messageCounter++
			let testRecord = {
				testState: "continuing",
				dataSize: dataSize,
				testDuration: testDuration,
				burstInterval: burstInterval,
				burstCount: burstCount,
				startTime: new Date(),
				messageCounter: messageCounter,
				testData: testData,
				source: source,
				dt: new Date().getTime()
			};
			msgGroup.push(testRecord)
			if (msgGroup.length == msgGroupCount) {
				FSBL.Clients.RouterClient.transmit("RouterTestChannel", msgGroup);
				msgGroup = []
			}
		}

		let timeDiff = new Date() - startMsg.senderStartTime;
		if (timeDiff > startMsg.testDuration) {
			clearInterval(timerID);
			let endMsg = {
				testState: "done"
			}
			FSBL.Clients.RouterClient.transmit("RouterTestChannel", endMsg);
			document.getElementById('startTest').disabled = false
			console.log("test complete");
		}
	}, startMsg.burstInterval);
}

if (window.FSBL && FSBL.addEventListener) {
	FSBL.addEventListener("onReady", FSBLReady)
} else {
	window.addEventListener("FSBLReady", FSBLReady)
}