import { test, expect } from "@playwright/test";
import { IntentResolver, InteropApp } from "../../apps";
import { IOCDSession, IOCDWindowHandle, UITestSteps } from "./common";

let session: IOCDSession;
let steps: UITestSteps;

test.beforeAll(async () => {
	session = await IOCDSession.startSession();
	steps = new UITestSteps(session);
});

test.afterEach(async () => {
	// Allocate some spare time between tests.
	await new Promise((r) => setTimeout(r, 2500));
});

test.afterAll(async () => {
	await session?.shutdown();
});

test(`should open app '${InteropApp.name}' via fdc3.open`, async () => {
	const userApp = await steps.openUserAppFromMenu();
	await userApp.page.evaluate((name) => {
		(window as any).fdc3.open(name);
	}, InteropApp.name);

	const interopApp = await session.waitForNewInstance(InteropApp.name, 30000);
	await expect.poll(async () => await session.isVisible(interopApp.window.id)).toBe(true);

	await Promise.all([userApp.window.close(), interopApp.window.close()]);
});

test(`should open app '${InteropApp.name}' via fdc3.raiseIntent`, async () => {
	const userApp = await steps.openUserAppFromMenu();
	await userApp.page.evaluate((listensFor) => {
		(window as any).fdc3.raiseIntent(listensFor.intent, listensFor.context);
	}, InteropApp.listensFor);

	const interopApp = await session.waitForNewInstance(InteropApp.name, 30000);
	await expect.poll(async () => await session.isVisible(interopApp.window.id)).toBe(true);

	await Promise.all([userApp.window.close(), interopApp.window.close()]);
});

test(
	`should use Intent Resolver to open '${InteropApp.name}' without console errors`,
	{ tag: "@ui-template" },
	async () => {
		const userApp = await steps.openUserAppFromMenu();
		await userApp.page.evaluate((listensFor) => {
			(window as any).fdc3.raiseIntent(listensFor.intent, listensFor.context);
		}, InteropApp.listensFor);

		// the 1st instance is auto opened
		const interopApp1 = await session.waitForNewInstance(InteropApp.name, 30000);
		await expect.poll(async () => await session.isVisible(interopApp1.window.id)).toBe(true);

		await userApp.page.evaluate((listensFor) => {
			(window as any).fdc3.raiseIntent(listensFor.intent, listensFor.context);
		}, InteropApp.listensFor);

		let intentResolver: IOCDWindowHandle | undefined;
		await expect
			.poll(async () => (intentResolver = await session.findWindowHandleByName(IntentResolver.name)))
			.toBeDefined();
		await expect.poll(async () => await session.isVisible(intentResolver.window.id)).toBe(true);
		// TODO currently disabled due to server-side console errors that can not be reproduced locally.
		// expect(session.getConsoleErrors(intentResolver.page)).toEqual([]);

		await intentResolver.page.locator(IntentResolver.selectors.appTarget(InteropApp.name)).click();
		await intentResolver.page.locator(IntentResolver.selectors.confirmButton()).click();
		await expect.poll(async () => await session.isVisible(intentResolver.window.id)).toBe(false);

		// the 2nd instance is opened via Intent Resolver
		const interopApp2 = await session.waitForNewInstance(InteropApp.name, 30000);
		await expect.poll(async () => await session.isVisible(interopApp2.window.id)).toBe(true);

		await Promise.all([userApp.window.close(), interopApp1.window.close(), interopApp2.window.close()]);
	}
);
