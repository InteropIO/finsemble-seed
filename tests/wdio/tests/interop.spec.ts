import { InteropApp } from "../../apps";
import { IOCDSession, UITestSteps } from "./common";

describe("Smoke tests on interoperability", () => {
	let session: IOCDSession;
	let steps: UITestSteps;

	before(async () => {
		session = new IOCDSession(await browser.io());
		steps = new UITestSteps(session);
	});

	it(`should open app '${InteropApp.name}' via fdc3.open`, async () => {
		const userApp = await steps.openUserAppFromMenu();
		await browser.switchById(userApp.id);

		await browser.execute(async (name) => {
			await (window as any).fdc3.open(name);
		}, InteropApp.name);
		const interopApp = await session.findWindowByName(InteropApp.name, 2000);
		await browser.waitUntil(async () => await session.isVisible(interopApp.id), {
			timeout: 2000,
			timeoutMsg: `Expected app '${interopApp.name}' to be visible`,
		});

		await Promise.all([userApp.close(), interopApp.close()]);
	});

	it(`should open app '${InteropApp.name}' via fdc3.raiseIntent`, async () => {
		const userApp = await steps.openUserAppFromMenu();
		await browser.switchById(userApp.id);

		await browser.execute(async (listensFor) => {
			(window as any).fdc3.raiseIntent(listensFor.intent, listensFor.context);
		}, InteropApp.listensFor);
		const interopApp = await session.findWindowByName(InteropApp.name, 2000);
		await browser.waitUntil(async () => await session.isVisible(interopApp.id), {
			timeout: 2000,
			timeoutMsg: `Expected app '${interopApp.name}' to be visible`,
		});

		await Promise.all([userApp.close(), interopApp.close()]);
	});
});
