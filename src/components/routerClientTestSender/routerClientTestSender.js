const FSBLReady = () => {
	try {
		document.getElementById('startTest').addEventListener('click', senderTest)
	} catch (e) {
		FSBL.Clients.Logger.error(e);
	}
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
function senderTest() {
	dataSize = document.getElementById('dataSize').value
	testDuration = document.getElementById('testDuration').value
	burstInterval = document.getElementById('burstInterval').value
	burstCount = document.getElementById('burstCount').value
	document.getElementById('startTest').disabled = true

	console.log("starting test");
	FSBL.Clients.Logger.system.log("RouterPerformance sender: start (dataSize:"+dataSize+" byte, testDuration:"+testDuration+" ms, bursInterval"+burstInterval+", burstCount:"+burstCount+")");

	let testRecord = {};
	testRecord.testState = "start";
	testRecord.dataSize = dataSize;
	testRecord.testDuration = testDuration;
	testRecord.burstInterval = burstInterval;
	testRecord.burstCount = burstCount;
	testRecord.startTime = new Date();
	testRecord.messageCounter = 0;

	testRecord.testData = "";
	for (let i = 0; i < dataSize; i++) {
		testRecord.testData = testRecord.testData.concat("X");
	}

	testRecord.testState = "start";
	FSBL.Clients.RouterClient.transmit("RouterTestChannel", testRecord);
	let timerID = setInterval(() => {

		testRecord.testState = "continuing";

		for (let i = 0; i < burstCount;  i++) {
			testRecord.messageCounter++;
			FSBL.Clients.RouterClient.transmit("RouterTestChannel", testRecord);
		}

		let currentTime = new Date();

		testRecord.timeDiff = currentTime - testRecord.startTime;

		if (testRecord.timeDiff > testRecord.testDuration) {
			clearInterval(timerID);
			testRecord.testState = "done";
			FSBL.Clients.RouterClient.transmit("RouterTestChannel", testRecord);
		}

	}, testRecord.burstInterval);
	console.log("test complete");
	document.getElementById('startTest').disabled = false
}

if (window.FSBL && FSBL.addEventListener) {
	FSBL.addEventListener("onReady", FSBLReady)
} else {
	window.addEventListener("FSBLReady", FSBLReady)
}