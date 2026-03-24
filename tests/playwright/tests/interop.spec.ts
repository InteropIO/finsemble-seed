import { test, expect } from "@playwright/test";
import { InteropApp } from "../../apps";
import { IOCDSession, UITestSteps } from "./common";

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

	const interopApp = await session.waitForNewInstance(InteropApp.name);
	await expect.poll(async () => await session.isVisible(interopApp.window.id)).toBe(true);

	await Promise.all([userApp.window.close(), interopApp.window.close()]);
});

test(`should open app '${InteropApp.name}' via fdc3.raiseIntent`, async () => {
	const userApp = await steps.openUserAppFromMenu();
	await userApp.page.evaluate((listensFor) => {
		(window as any).fdc3.raiseIntent(listensFor.intent, listensFor.context);
	}, InteropApp.listensFor);

	const interopApp = await session.waitForNewInstance(InteropApp.name);
	await expect.poll(async () => await session.isVisible(interopApp.window.id)).toBe(true);

	await Promise.all([userApp.window.close(), interopApp.window.close()]);
});
