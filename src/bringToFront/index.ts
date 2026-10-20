// This line imports type declarations for Finsemble's globals such as FSBL and fdc3. You can ignore the warning that it is defined but never used.
// Important! Please use the global FSBL and fdc3 objects. Do not import functionality from finsemble
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { types } from "@finsemble/finsemble-core";

const TOTAL_CALLS = 500;
const DURATION_MS = 60 * 1000;
const INTERVAL_MS = DURATION_MS / TOTAL_CALLS;

const main = () => {
	const button = document.createElement("button");
	button.textContent = "Bring to Front";
	button.style.cssText = "position:fixed;top:10px;right:10px;z-index:2147483647;padding:20px 12px;height:40px;width:120px;";

	button.addEventListener("click", async () => {
		await FSBL.Clients.AppsClient.showWindow({componentType: "WPFExample"}, {spawnIfNotFound:true});
		await FSBL.Clients.AppsClient.showWindow({componentType: "Process Monitor"}, {spawnIfNotFound:true});

		let count = 0;
		button.disabled = true;

		const timer = setInterval(() => {
			count++;
			const call = count;
			// finsembleWindow.bringToFront().then(({ err }) => {
			finsembleWindow.setAlwaysOnTop({alwaysOnTop:true}, (err) => {
				finsembleWindow.setAlwaysOnTop({alwaysOnTop:false})
				if (err) FSBL.Clients.Logger.error(`bringToFront failed on call ${call}`, err);
			});
			button.textContent = `Bringing to front (${count}/${TOTAL_CALLS})`;

			if (count >= TOTAL_CALLS) {
				clearInterval(timer);
				button.textContent = "Bring to Front";
				button.disabled = false;
			}
		}, INTERVAL_MS);
	});

	document.body.appendChild(button);
};

/**
 * This initialization pattern is required in preloads. Do not call FSBL or fdc3 without waiting for this pattern.
 */
if (window.FSBL && FSBL.addEventListener) {
	FSBL.addEventListener("onReady", main);
} else {
	window.addEventListener("FSBLReady", main);
}
