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
	let groupMode = document.getElementById('groupMode').value

	let startMsg = {
		testState: "start",
		dataSize: dataSize,
		testDuration: testDuration,
		burstInterval: burstInterval,
		burstCount: burstCount,
		messageCounter: 0,
		source: source,
		groupMode: groupMode,
		msgGroupCount: msgGroupCount
	}

	let testData = "";
	for (let i = 0; i < dataSize; i++) {
		testData = testData.concat("X");
	}
	
	switch (startMsg.source) {
		case 'routerTransmit':
			routerTest(startMsg, testData)
			break;
		case 'distributedStore':
			distributedStoreTest(startMsg, testData)
			break;
		default:
			break;
	}
	document.getElementById('startTest').disabled = true
	document.getElementById('result').innerHTML = ''
}

const distributedStoreTest = (startMsg) => {
	FSBL.Clients.RouterClient.transmit("StartDsTestChannel", startMsg);
	document.getElementById('startTest').disabled = true
}

const routerTest = (startMsg, testData) => {
	startMsg.senderStartTime = new Date()
	let messageCounter = 0
	FSBL.Clients.RouterClient.transmit("RouterTestChannel", startMsg);

	let msgGroup = []
	let sendMsgInternval = setInterval(() => {
		for (let i = 0; i < startMsg.burstCount; i++) {
			messageCounter++
			let testRecord = {
				testState: "continuing",
				dataSize: startMsg.dataSize,
				testDuration: startMsg.testDuration,
				burstInterval: startMsg.burstInterval,
				burstCount: startMsg.burstCount,
				testData: testData,
				source: startMsg.source,
				startTime: new Date(),
				dt: new Date().getTime(),
				messageCounter: messageCounter
			};
			msgGroup.push(testRecord)

			if(startMsg.groupMode == 'messagegroup'){
				msgGroup = routerSendGroupMsgs(startMsg, msgGroup, messageCounter, sendMsgInternval)
			}
		}		
	}, startMsg.burstInterval);

	if(startMsg.groupMode=='timegroup'){
		let timegroupTimerInterval = setInterval(() => {
			routerSendTimeGroupMsgs(startMsg, msgGroup, messageCounter, sendMsgInternval, timegroupTimerInterval)
			msgGroup = []
		}, startMsg.msgGroupCount);
	}
}


const routerSendGroupMsgs = (startMsg, msgGroup, messageCounter, sendMsgInternval) =>{
	if (msgGroup.length == startMsg.msgGroupCount) {
		FSBL.Clients.RouterClient.transmit("RouterTestChannel", msgGroup);
		
		if((new Date() - startMsg.senderStartTime) >= startMsg.testDuration){
			clearInterval(sendMsgInternval);
			let endMsg = {
				testState: "done"
			}
			FSBL.Clients.RouterClient.transmit("RouterTestChannel", endMsg);
			
			let endTime = new Date();
			let totalTime = endTime - startMsg.senderStartTime;
			let result = 'Total Message Sent: ' + messageCounter + '<br/>' + 'Total Time: ' + totalTime + ' ms<br/>'
			document.getElementById('result').innerHTML = result
			document.getElementById('startTest').disabled = false
		}
		return []
	}else{
		return msgGroup
	}
}


const routerSendTimeGroupMsgs= (startMsg, msgGroup, messageCounter, sendMsgInternval, timegroupTimerInterval) =>{
	FSBL.Clients.RouterClient.transmit("RouterTestChannel", msgGroup);
	if((new Date() - startMsg.senderStartTime) >= startMsg.testDuration){
		clearInterval(timegroupTimerInterval);
		clearInterval(sendMsgInternval);
		let endMsg = {
			testState: "done"
		}
		FSBL.Clients.RouterClient.transmit("RouterTestChannel", endMsg);
		
		let endTime = new Date();
		let totalTime = endTime - startMsg.senderStartTime;
		let result = 'Total Message Sent: ' + messageCounter + '<br/>' + 'Total Time: ' + totalTime + ' ms<br/>'
		document.getElementById('result').innerHTML = result
		document.getElementById('startTest').disabled = false
	}
}

if (window.FSBL && FSBL.addEventListener) {
	FSBL.addEventListener("onReady", FSBLReady)
} else {
	window.addEventListener("FSBLReady", FSBLReady)
}