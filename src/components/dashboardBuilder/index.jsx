import React from 'react'
import ReactDOM from 'react-dom'
import Dashboard from './Dashboard'

FSBL.addEventListener("onReady", function () {
	ReactDOM.render(<Dashboard />,
		document.getElementById('app'), () => {
			// async function spawnCanvas() {
			// 	var canvasAttributes = {
			// 		position: "unclaimed",
			// 		left: "25",
			// 		right: "25",
			// 		bottom: "25",
			// 		height: "400",
			// 		width: "400",
			// 		dockOnSpawn: false
			// 	};

			// 	await FSBL.Clients.LauncherClient.spawn("dashboardCanvas", canvasAttributes, (err, response) => { });
			// }

			FSBL.addEventListener("onReady", () => {
				// spawnCanvas();
				// FSBL.Clients.LauncherClient.spawn('dashboardCanvas')
			});
		})
})