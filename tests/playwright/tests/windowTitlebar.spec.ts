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

test.describe("Window titlebar", { tag: "@ui-template" }, () => {
	test("should render window titlebar without console errors", async () => {
		const userApp = await steps.openUserAppFromMenu();
		await userApp.page.waitForSelector(UserApp.selectors.container());

		const group = await session.findGroupByWindow(userApp.window.id);
		expect(group?.page).toBeDefined();
		expect(session.getConsoleErrors(group.page)).toEqual([]);

		await userApp.window.close();
	});

	test("should minimize, maximize and close window", async () => {
		const userApp = await steps.openUserAppFromMenu();
		await userApp.page.waitForSelector(UserApp.selectors.container());

		await steps.clickTitlebarButton(userApp, "[id^='t42-frame-tab-bar-standard-buttons-minimize-']");
		await expect.poll(() => userApp.window.state).toBe("minimized");

		await userApp.window.restore();
		await expect.poll(() => userApp.window.state).toBe("normal");

		await steps.clickTitlebarButton(userApp, "[id^='t42-frame-tab-bar-standard-buttons-maximize-']");
		await expect.poll(() => userApp.window.state).toBe("maximized");

		await steps.clickTitlebarButton(userApp, "[id^='t42-frame-tab-bar-standard-buttons-close-']");
		await session.waitForWindowClose(userApp.window.id);
	});

	test("should toggle 'Channel 1' from window titlebar", async () => {
		const userApp = await steps.openUserAppFromMenu();
		await userApp.page.waitForSelector(UserApp.selectors.container());

		await steps.toggleChannelFromTitlebar(userApp, "Channel 1"); // selects Channel 1
		expect(await userApp.window.getChannels()).toEqual(["Channel 1"]);

		await steps.toggleChannelFromTitlebar(userApp, "Channel 1"); // unselects Channel 1
		expect(await userApp.window.getChannels()).toEqual([]);

		await userApp.window.close();
	});
});
