FSBL.addEventListener('onReady', function () {
	setTimeout(function () {
		FSBL.UserNotification.alert(
			"alert",
			"",
			"ALWAYS",
			{ "description": "This is a tricky one!", "title": "What???" },
			{});		
	},2000);
	/*
	setTimeout(function () {
		window.alert("Oh boy this sucks");
	}, 5000);*/
});