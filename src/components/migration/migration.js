const FSBLReady = () => {
	try {
		FSBL.Clients.Logger.log("*** datamigration FE");
		console.log('fsbl ready 1')

		let shutdownTimer;

		FSBL.Clients.RouterClient.addListener('Migration', (err, event) => {
			if (event.data == 'needed') {
				document.querySelector('#migrationWarning').classList.remove('hidden');
				FSBL.Clients.Logger.log("*** datamigration FE handling needed");

				let timeout = 30000;

				migrationTimer = setInterval(() => {
					timeout -= 1000;

					document.querySelector('#countdown').innerHTML = (timeout/ 1000);

					if (timeout === 0) {
						clearInterval(migrationTimer);
						FSBL.Clients.RouterClient.transmit("Migration", "begin");
					}
				}, 1000);	
			}
			
			document.querySelector('#cancel').addEventListener('click', (e) => {
				console.log('Cancelled')
				clearInterval(migrationTimer);
				FSBL.Clients.RouterClient.transmit("Application.shutdown");
			});

			document.querySelector('#begin').addEventListener('click', (e) => {
				console.log('Begin')
				clearInterval(migrationTimer);
				FSBL.Clients.RouterClient.transmit("Migration", "begin");
			});
			

			
			

		})


		
		

		/*let data = FSBL.Clients.StorageClient;
		FSBL.Clients.Logger.log("*** datamigration storageclient options", data)
		FSBL.Clients.ConfigClient.getValue('finsemble', (err, value) => {
			FSBL.Clients.Logger.log('*** datamigration all', value.servicesConfig.storage.topicToDataStoreAdapters.finsemble)
		});


		/*FSBL.Clients.RouterClient.query("Migration", {}, function (error, queryResponseMessage) {
			if (error) {
				FSBL.Clients.Logger.log('*** datamigration query failed: ' + JSON.stringify(error));
			} else {
				// process income query response message
				const responseData = queryResponseMessage.data;
				FSBL.Clients.Logger.log('*** datamigration query response: ' + JSON.stringify(queryResponseMessage));

				if (!responseData) {
					document.querySelector('.migration-needed').classList.remove('hidden')
				}
			}
		});*/
	} catch (e) {
		FSBL.Clients.Logger.error(e);
	}
}

if (window.FSBL && FSBL.addEventListener) {
	FSBL.addEventListener("onReady", FSBLReady)
} else {
	window.addEventListener("FSBLReady", FSBLReady)
}