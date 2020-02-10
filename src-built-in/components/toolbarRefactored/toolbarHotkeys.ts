const keys = FSBL.Clients.HotkeyClient.keyMap;

/**
 * Helper so I didn't have to rewrite the same 3 lines of code 6
 * times.
 * @param err Unlikely error; would be coming in when our hotkey is registered.
 */
const handleHotkeyRegistrationError = (err:any) => {
	if (err) {
		FSBL.Clients.Logger.error(`HotkeyClient.addGlobalHotkey failed, error:`, err);
	}
}
/**
	 * Function to bring toolbar to front (since dockable toolbar can be hidden)
	 * The search input box will be open and any previous results will be displayed
	 * @param {boolean} focus If true, will also focus the toolbar
	 * @TODO Evaluate whether focus is necessary or if it's just vestigial.
	 */
const bringToolbarToFront = (focus = false) => {
	finsembleWindow.bringToFront(null, (err:any) => {
		if (err) {
			FSBL.Clients.Logger.error(`bringToolbarToFront failed, error:`, err);
		}

		if (focus) {
			finsembleWindow.focus();
			// @todo when the search component is finished, dispatch the action
			// that focuses the search field
		}
	});
}

 	/**
* Hides the toolbar
*/
const hideToolbar = () => {
 finsembleWindow.blur();
 finsembleWindow.hide();
}

/**
 * Shows the toolbar left-aligned to the user's mouse.
 */
const showToolbar = () => {
	FSBL.Clients.WindowClient.showAtMousePosition();
	bringToolbarToFront(true);
}

/**
 * Mimimizes all windows.
 */
const minimizeAllWindows = () => {
	FSBL.Clients.WorkspaceClient.minimizeAll();
}

/**
 * Brings all windows to front.
 */
const revealAllWindows = () => {
	FSBL.Clients.LauncherClient.bringWindowsToFront()
}

const registerShowToolbarHotkey = () => {
	FSBL.Clients.HotkeyClient.addGlobalHotkey(
		[keys.ctrl, keys.alt, keys.t],
		(err: any) => {
			handleHotkeyRegistrationError(err);
			showToolbar();
		}
	);
}

const registerHideToolbarHotkey = () => {
	FSBL.Clients.HotkeyClient.addGlobalHotkey(
		[keys.ctrl, keys.alt, keys.h],
		(err: any) => {
			handleHotkeyRegistrationError(err);
			hideToolbar();
	});
}

const registerRevealAllHotkey = () => {
	FSBL.Clients.HotkeyClient.addGlobalHotkey([keys.ctrl, keys.alt, keys.up], (err: any) => {
		handleHotkeyRegistrationError(err);
		revealAllWindows();
	});
}

const registerMinimizeAllHotkey = () => {
	FSBL.Clients.HotkeyClient.addGlobalHotkey([keys.ctrl, keys.alt, keys.down], (err: any) => {
		handleHotkeyRegistrationError(err);
		minimizeAllWindows();
	});
}

const registerShowSearchHotkey = () => {
	FSBL.Clients.HotkeyClient.addGlobalHotkey([keys.ctrl, keys.alt, keys.f], (err: any) => {
		handleHotkeyRegistrationError(err);
		bringToolbarToFront(true);
	});
}

export {
	registerHideToolbarHotkey,
	registerMinimizeAllHotkey,
	registerRevealAllHotkey,
	registerShowSearchHotkey,
	registerShowToolbarHotkey
}