import { type IOConnectDesktop as IOCD } from "@interopio/desktop";
import { Toolbar, ToolbarAppMenu, ToolbarWorkspaceMenu, UserApp } from "../../../apps";
import { IOCDSession } from "./iocdSession";

export class UITestSteps {
	private session: IOCDSession;

	constructor(session: IOCDSession) {
		this.session = session;
	}

	async openUserAppFromMenu(): Promise<IOCD.Windows.IOConnectWindow> {
		const appMenu = await this.session.findWindowByName(ToolbarAppMenu.name);
		expect(appMenu).toBeDefined(); // Visible or not, menu windows are normally loaded in advance.

		if (!appMenu.isVisible) {
			const toolbar = await this.session.findWindowByName(Toolbar.name);
			await browser.switchById(toolbar.id);
			await $(Toolbar.selectors.appMenuButton()).waitAndClick();
			await browser.waitUntil(async () => await this.session.isVisible(appMenu.id), {
				timeout: 2000,
				timeoutMsg: `Expected ${ToolbarAppMenu.name} to be visible`,
			});
		}
		await browser.switchById(appMenu.id);
		await $(ToolbarAppMenu.selectors.userApp()).waitAndClick();
		const userApp = await this.session.findWindowByName(UserApp.name, 2000);
		expect(userApp).toBeDefined();
		await browser.waitUntil(async () => await this.session.isVisible(userApp.id), {
			timeout: 2000,
			timeoutMsg: `Expected app '${UserApp.name}' to be visible`,
		});
		return userApp;
	}
}
