import userConfigs from "./userConfigs.json";

let switcher = (() => {
	function init() {
		setupEvents();
	}

	function setupEvents() {
		let elementList = document.querySelectorAll(".user-list > li");
		elementList.forEach((listItem) => {
			listItem.addEventListener("click", () => {
				switchUser(listItem.dataset.userId);
			});
		})
	}


	function switchUser(userId) {
		getUserDetails(userId).then((userDetails) => {
			performSwitch(userDetails);
		});
	}

	function getUserDetails(userId) {
		let userDatabase = userConfigs;
		return new Promise((resolve, reject) => {
			if (typeof userDatabase[userId] !== "undefined") {
				resolve(userDatabase[userId]);
			} else {
				reject("No user found!");
			}
		});

	}

	function performSwitch(userDetails) {
		FSBL.Clients.AuthenticationClient.publishAuthorization(userDetails.user.username, userDetails.user);

		FSBL.Clients.ConfigClient.processAndSet({
			newConfig: userDetails.config,
			overwrite: true,
			replace: true
		});
	}


	return {init: init};
})();

console.log(switcher);

if (window.FSBL && FSBL.addEventListener) {
	FSBL.addEventListener("onReady", switcher.init);
} else {
	window.addEventListener("FSBLReady", switcher.init)
}
