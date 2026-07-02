import { test, expect } from "@playwright/test";
import { DownloadManager, NotificationsPanel, Toolbar, UserApp } from "../../apps";
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

test(`should open app '${UserApp.name}' from Toolbar`, async () => {
	const userApp = await steps.openUserAppFromMenu();
	await userApp.page.waitForSelector(UserApp.selectors.container());
	await userApp.window.close();
});

test("should show Notifications Panel without console errors", { tag: "@ui-template" }, async () => {
	await session.toolbar.locator(Toolbar.selectors.notificationsButton()).click();
	const notificationsPanel = await session.waitForNewInstance(NotificationsPanel.name, 10000);
	await expect.poll(async () => await session.isVisible(notificationsPanel.window.id)).toBe(true);

	await new Promise((r) => setTimeout(r, 2500)); // gives it a bit more time to render
	expect(session.getConsoleErrors(notificationsPanel.page)).toEqual([]);

	// Hides notifications panel
	await notificationsPanel.page.locator(NotificationsPanel.selectors.closeButton()).click();
	await expect.poll(async () => await session.isVisible(notificationsPanel.window.id)).toBe(false);
});

test("should show Download Manager without console errors", { tag: "@ui-template" }, async () => {
	await session.toolbar.locator(Toolbar.selectors.downloadsButton()).click();
	const downloadManager = await session.waitForNewInstance(DownloadManager.name, 10000);
	await expect.poll(async () => await session.isVisible(downloadManager.window.id)).toBe(true);

	await new Promise((r) => setTimeout(r, 2500)); // gives it a bit more time to render
	expect(session.getConsoleErrors(downloadManager.page)).toEqual([]);

	// Closes download manager
	await downloadManager.page.locator(DownloadManager.selectors.closeButton()).click();
	await session.waitForWindowClose(downloadManager.window.id);
});
