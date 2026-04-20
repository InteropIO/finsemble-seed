import { test, expect } from "@playwright/test";
import { NotificationsPanel, Toolbar, UserApp } from "../../apps";
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

test("should open and close Notifications Panel", async () => {
	await session.toolbar.locator(Toolbar.selectors.notificationsButton()).click();
	const notificationsPanel = await session.waitForNewInstance(NotificationsPanel.name);
	expect.poll(async () => await session.isVisible(notificationsPanel.window.id)).toBe(true);

	// Close notifications panel
	await notificationsPanel.page.locator(NotificationsPanel.selectors.closeButton()).click();
	expect.poll(async () => await session.isVisible(notificationsPanel.window.id)).toBe(false);
});
