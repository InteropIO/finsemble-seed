import { expect } from "@playwright/test";
import { ChannelSelector, Toolbar, ToolbarAppMenu, ToolbarWorkspaceMenu, UserApp } from "../../../apps";
import { IOCDSession, IOCDWindowHandle } from "./iocdSession";

export class UITestSteps {
	private session: IOCDSession;

	constructor(session: IOCDSession) {
		this.session = session;
	}

	async openUserAppFromMenu(): Promise<IOCDWindowHandle> {
		let appMenu = await this.session.findWindowHandleByName(ToolbarAppMenu.name);
		expect(appMenu?.window).toBeDefined(); // Visible or not, menu windows are normally loaded in advance.

		if (!appMenu.window.isVisible) {
			await this.session.toolbar.locator(Toolbar.selectors.appMenuButton()).click();
		}
		const userAppPromise = this.session.waitForNewInstance(UserApp.name);
		await appMenu.page.locator(ToolbarAppMenu.selectors.userApp()).click();
		const userApp = await userAppPromise;
		expect(userApp.window).toBeDefined();
		expect(userApp.page).toBeDefined();
		await expect.poll(async () => await this.session.isVisible(userApp.window.id)).toBe(true);
		return userApp;
	}

	async openWorkspaceMenu(): Promise<IOCDWindowHandle> {
		const workspaceMenu = await this.session.findWindowHandleByName(ToolbarWorkspaceMenu.name);
		expect(workspaceMenu?.window).toBeDefined(); // Visible or not, menu windows are normally loaded in advance.

		if (!workspaceMenu.window.isVisible) {
			await this.session.toolbar.locator(Toolbar.selectors.workspaceMenuButton()).click();
		}
		return workspaceMenu;
	}

	async clickTitlebarButton(target: IOCDWindowHandle, buttonSelector: string): Promise<void> {
		const group = await this.session.findGroupByWindow(target.window.id);
		if (!group?.page) throw new Error(`Group page not found for window '${target.window.id}'`);

		await group.page.locator(buttonSelector).click();
	}

	async toggleChannelFromTitlebar(target: IOCDWindowHandle, channelName: string): Promise<void> {
		const channelSelector = await this.openChannelSelector(target);
		await channelSelector.page.locator(ChannelSelector.selectors.channelItem(channelName)).click();
	}

	private async openChannelSelector(target: IOCDWindowHandle): Promise<IOCDWindowHandle> {
		let channelSelector = await this.session.findWindowHandleByName(ChannelSelector.name);
		expect(channelSelector?.window).toBeDefined();

		if (!channelSelector.window.isVisible) {
			const group = await this.session.findGroupByWindow(target.window.id);
			if (!group?.page) throw new Error(`Group page not found for window '${target.window.id}'`);

			const tab = group.page.locator(`[id^="t42-frame-tab-bar-tab-${target.window.id}-"]`);
			await tab.locator(".t42-tab-channel-selector").click();
			channelSelector = await this.session.findWindowHandleByName(ChannelSelector.name);
			expect(channelSelector.window.isVisible).toBe(true);
		}
		return channelSelector;
	}
}
