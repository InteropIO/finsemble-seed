import { test, expect } from "@playwright/test";
import { AlwaysOnTopApp, DecoratorWindow, UserApp } from "../../apps";
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

	// Relies on the CI step that wires AlwaysOnTopButton into the template (.github/scripts/wire-decorator-aot-button.js)
	test("should toggle always on top from window titlebar", async () => {
		// The button only shows for apps with alwaysOnTopIcon enabled, which no seed app has, so add one
		await session.toolbar.evaluate(async (app) => {
			const { err } = await (window as any).FSBL.Clients.AppsClient.addApps([app]);
			if (err) throw new Error(`addApps failed: ${err}`);
		}, AlwaysOnTopApp.definition);

		let aotApp: IOCDWindowHandle | undefined;
		try {
			const aotAppPromise = session.waitForNewInstance(AlwaysOnTopApp.name, 30000);
			await session.toolbar.evaluate(
				(name) => (window as any).FSBL.Clients.AppsClient.spawn(name),
				AlwaysOnTopApp.name
			);
			aotApp = await aotAppPromise;

			const group = await session.findGroupByWindow(aotApp.window.id);
			const button = group.page.locator(DecoratorWindow.selectors.alwaysOnTopButton());
			const isAlwaysOnTop = async () =>
				Boolean((await aotApp.window.getContext())?.["#finsemble-componentState"]?.isAlwaysOnTop);
			const isHighlighted = async () =>
				((await button.locator("svg").getAttribute("style")) ?? "").includes("--accent-primary");

			await expect(button).toBeVisible();
			expect(await isAlwaysOnTop()).toBe(false);
			expect(await isHighlighted()).toBe(false);

			await button.click();
			await expect.poll(isAlwaysOnTop).toBe(true);
			await expect.poll(isHighlighted).toBe(true);

			await button.click();
			await expect.poll(isAlwaysOnTop).toBe(false);
			await expect.poll(isHighlighted).toBe(false);
		} finally {
			// Clean up even when an assertion fails, so the added app doesn't leak into later tests
			await aotApp?.window.close().catch(() => {});
			await session.toolbar.evaluate(
				(name) => (window as any).FSBL.Clients.AppsClient.removeApps([name]),
				AlwaysOnTopApp.name
			);
		}
	});
});
