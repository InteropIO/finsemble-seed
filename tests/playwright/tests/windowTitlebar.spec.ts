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

	// The AOT tests rely on the CI step that wires AlwaysOnTopButton into the template (.github/scripts/wire-decorator-aot-button.js)

	// The button only shows for apps with alwaysOnTopIcon enabled, which no seed app has, so add one
	const addAotApp = () =>
		session.toolbar.evaluate(async (app) => {
			const { err } = await (window as any).FSBL.Clients.AppsClient.addApps([app]);
			if (err) throw new Error(`addApps failed: ${err}`);
		}, AlwaysOnTopApp.definition);

	const removeAotApp = () =>
		session.toolbar.evaluate((name) => (window as any).FSBL.Clients.AppsClient.removeApps([name]), AlwaysOnTopApp.name);

	const spawnAotApp = async () => {
		const aotAppPromise = session.waitForNewInstance(AlwaysOnTopApp.name, 30000);
		await session.toolbar.evaluate((name) => (window as any).FSBL.Clients.AppsClient.spawn(name), AlwaysOnTopApp.name);
		return aotAppPromise;
	};

	const isAlwaysOnTop = async (handle: IOCDWindowHandle) =>
		Boolean((await handle.window.getContext())?.["#finsemble-componentState"]?.isAlwaysOnTop);

	test("should toggle always on top from window titlebar", async () => {
		await addAotApp();

		let aotApp: IOCDWindowHandle | undefined;
		try {
			aotApp = await spawnAotApp();

			const group = await session.findGroupByWindow(aotApp.window.id);
			const button = group.page.locator(DecoratorWindow.selectors.alwaysOnTopButton());
			const isHighlighted = async () =>
				((await button.locator("svg").getAttribute("style")) ?? "").includes("--accent-primary");

			await expect(button).toBeVisible();
			expect(await isAlwaysOnTop(aotApp)).toBe(false);
			expect(await isHighlighted()).toBe(false);

			await button.click();
			await expect.poll(() => isAlwaysOnTop(aotApp)).toBe(true);
			await expect.poll(isHighlighted).toBe(true);

			await button.click();
			await expect.poll(() => isAlwaysOnTop(aotApp)).toBe(false);
			await expect.poll(isHighlighted).toBe(false);
		} finally {
			// Clean up even when an assertion fails, so the added app doesn't leak into later tests
			await aotApp?.window.close().catch(() => {});
			await removeAotApp();
		}
	});

	test("should toggle always on top for every window in a group", async () => {
		await addAotApp();

		let aotApp: IOCDWindowHandle | undefined;
		let userApp: IOCDWindowHandle | undefined;
		try {
			userApp = await steps.openUserAppFromMenu();
			aotApp = await spawnAotApp();

			await aotApp.window.snap(userApp.window.id, "right");
			await expect.poll(() => aotApp.window.group?.windows.length).toBe(2);

			const group = await session.findGroupByWindow(aotApp.window.id);
			const button = group.page.locator(DecoratorWindow.selectors.alwaysOnTopButton());
			await expect(button).toBeVisible();

			await button.click();
			await expect.poll(() => isAlwaysOnTop(aotApp)).toBe(true);
			await expect.poll(() => isAlwaysOnTop(userApp)).toBe(true);
			await expect.poll(() => session.isAlwaysOnTop(group.page)).toBe(true);

			await button.click();
			await expect.poll(() => isAlwaysOnTop(aotApp)).toBe(false);
			await expect.poll(() => isAlwaysOnTop(userApp)).toBe(false);
			// iocd keeps the frame on top while any member is, so this proves every window was unpinned
			await expect.poll(() => session.isAlwaysOnTop(group.page)).toBe(false);
		} finally {
			await aotApp?.window.close().catch(() => {});
			await userApp?.window.close().catch(() => {});
			await removeAotApp();
		}
	});
});
