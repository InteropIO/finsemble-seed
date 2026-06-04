import { test, expect } from "@playwright/test";
import { UserApp } from "../../apps";
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

test(`should toggle 1st channel from window titlebar`, async () => {
	const userApp = await steps.openUserAppFromMenu();
	await userApp.page.waitForSelector(UserApp.selectors.container());

	await steps.toggleChannelFromTitlebar(userApp, "Channel 1"); // selects Channel 1
	expect(await userApp.window.getChannels()).toEqual(["Channel 1"]);

	await steps.toggleChannelFromTitlebar(userApp, "Channel 1"); // unselects Channel 1
	expect(await userApp.window.getChannels()).toEqual([]);

	await userApp.window.close();
});
