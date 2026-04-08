import { NotificationsPanel, Toolbar, UserApp } from "../../apps";
import { IOCDSession, UITestSteps } from "./common";

describe("Smoke tests on Toolbar UI", () => {
	let session: IOCDSession;
	let steps: UITestSteps;

	before(async () => {
		session = new IOCDSession(await browser.io());
		steps = new UITestSteps(session);
	});

	beforeEach(async () => {
		const toolbar = await session.findWindowByName(Toolbar.name);
		await browser.switchById(toolbar.id);
	});

	it(`should open app '${UserApp.name}' from Toolbar`, async () => {
		const userApp = await steps.openUserAppFromMenu();
		await browser.switchById(userApp.id);
		await browser.waitUntil(async () => await $(UserApp.selectors.container()).isDisplayed(), {
			timeout: 2000,
			timeoutMsg: `Expected app '${UserApp.name}' to render its container`,
		});

		await userApp.close();
	});

	it("should open and close Notifications Panel", async () => {
		await $(Toolbar.selectors.notificationsButton()).waitAndClick();
		const notificationsPanel = await session.findWindowByName(NotificationsPanel.name, 2000);
		await browser.waitUntil(async () => await session.isVisible(notificationsPanel.id), {
			timeout: 2000,
			timeoutMsg: "Expected notifications panel to be visible",
		});
		await browser.switchById(notificationsPanel.id);

		// Close notifications panel
		await $(NotificationsPanel.selectors.closeButton()).waitAndClick();
		await browser.waitUntil(async () => !(await session.isVisible(notificationsPanel.id)), {
			timeout: 2000,
			timeoutMsg: "Expected notifications panel to be not visible",
		});
	});
});
