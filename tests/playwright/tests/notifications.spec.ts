import { test, expect } from "@playwright/test";
import { NotificationsApp } from "../../apps";
import { IOCDSession, IOCDWindowHandle } from "./common";

let session: IOCDSession;

test.beforeAll(async () => {
	session = await IOCDSession.startSession();
});

test.afterEach(async () => {
	// Allocate some spare time between tests.
	await new Promise((r) => setTimeout(r, 2500));
});

test.afterAll(async () => {
	await session?.shutdown();
});

test.describe("Notification toasts", { tag: "@ui-template" }, () => {
	test("should render notification toast on notify", async () => {
		let notificationsApp: IOCDWindowHandle | undefined;

		await session.toolbar.evaluate(() => {
			(window as any).FSBL.Clients.NotificationClient.notify({ source: "toast-test", title: "Quote 1" });
		});
		await expect
			.poll(async () => (notificationsApp = await session.findWindowHandleByName(NotificationsApp.name)))
			.toBeDefined();
		await expect.poll(async () => await session.isVisible(notificationsApp.window.id)).toBe(true);
		expect(session.getConsoleErrors(notificationsApp.page)).toEqual([]);

		const title = notificationsApp.page.locator(NotificationsApp.selectors.title()).first();
		await expect(title).toHaveText("Quote 1");

		// Clicks toast close icon to dismiss the notification.
		await notificationsApp.page.locator(NotificationsApp.selectors.closeButton()).first().click();
	});

	test("should render notification action toast on notify", async () => {
		let notificationsApp: IOCDWindowHandle | undefined;

		await session.toolbar.evaluate(() => {
			(window as any).FSBL.Clients.NotificationClient.notify({
				source: "toast-test",
				title: "Quote 2",
				actions: [{ buttonText: "Test.Transmit", type: "TRANSMIT" }],
			});
		});
		await expect
			.poll(async () => (notificationsApp = await session.findWindowHandleByName(NotificationsApp.name)))
			.toBeDefined();
		await expect.poll(async () => await session.isVisible(notificationsApp.window.id)).toBe(true);
		expect(session.getConsoleErrors(notificationsApp.page)).toEqual([]);

		const title = notificationsApp.page.locator(NotificationsApp.selectors.title()).first();
		await expect(title).toHaveText("Quote 2");

		const actionButton = notificationsApp.page.locator(NotificationsApp.selectors.actionButton("Test.Transmit"));
		await expect(actionButton).toBeVisible();

		// Clicks toast close icon to dismiss the notification.
		await notificationsApp.page.locator(NotificationsApp.selectors.closeButton()).first().click();
	});
});
