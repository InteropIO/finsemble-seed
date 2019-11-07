const FSBLReady = () => {
	try {
		FSBL.Clients.RouterClient.addListener("Migration", (err, event) => {
			if (event.data == "needed") {
				// The Migration component isn't intended to be visible to users in a menu, but just in case, there is a default message.
				// However, if migration is needed, that message will be hidden and migration activities begun.
				document.querySelector('#migrationCheck').classList.add('hidden');
				
				// Warn the user that migration is needed.
				document.querySelector('#migrationWarning').classList.remove('hidden');
				let timeout = 30000;

				migrationTimer = setInterval(() => {
					timeout -= 1000;

					document.querySelector('#countdown').innerHTML = (timeout / 1000);

					if (timeout === 0) {
						clearInterval(migrationTimer);
						FSBL.Clients.RouterClient.transmit("Migration", "begin");
					}
				}, 1000);	
			}

			if (event.data == "end") {
				document.querySelector("#migrationWarning").classList.add("hidden");
				document.querySelector("#migrationComplete").classList.remove("hidden");
			}

			if (event.data == "not needed") {
				document.querySelector("#migrationNotNeeded").classList.remove("hidden");
				document.querySelector("#migrationCheck").classList.add("hidden");
			}

			// Allow the user to cancel the migration and ask questions.
			document.querySelector("#cancel").addEventListener("click", (e) => {
				clearInterval(migrationTimer);
				FSBL.Clients.RouterClient.transmit("Application.shutdown");
			});

			// Allow the user to skip the countdown and begin immediately.
			document.querySelector('#begin').addEventListener('click', (e) => {
				clearInterval(migrationTimer);
				FSBL.Clients.RouterClient.transmit("Migration", "begin");
			});

			document.querySelector("#restart").addEventListener("click", (e) => {
				FSBL.Clients.RouterClient.transmit("Application.restart");
			});
		})
	} catch (e) {
		FSBL.Clients.Logger.error(e);
	}
}

if (window.FSBL && FSBL.addEventListener) {
	FSBL.addEventListener("onReady", FSBLReady)
} else {
	window.addEventListener("FSBLReady", FSBLReady)
}