
const demoItem1Updated = (err, data) => {
	console.log(data)
}

const FSBLReady = () => {
	try {
		//Get the global distributed store
		FSBL.Clients.DistributedStoreClient.getStore({
				store: "demoStore"
			},
			function (err, storeObject) {
				//Add listener to the store
				storeObject.addListeners(
					[{
						field: "demoItem1",
						listener: demoItem1Updated
					}],
					null,
					() => {

					}
				);
			}
		);




	} catch (e) {
		FSBL.Clients.Logger.error(e);
	}
}

if (window.FSBL && FSBL.addEventListener) {
	FSBL.addEventListener("onReady", FSBLReady)
} else {
	window.addEventListener("FSBLReady", FSBLReady)
}