FSBL.addEventListener('onReady', function () {
	$('#notifyButton').click(
		function (event) { 
			spawnNotification("Test notification content - lets have more notifications", {componentType: "test-stack", params: {left: "center", top: "center"}} ); 
		}
	);
});