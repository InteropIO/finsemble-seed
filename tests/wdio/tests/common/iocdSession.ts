import { type IOConnectDesktop as IOCD } from "@interopio/desktop";

export class IOCDSession {
	private io: IOCD.API;

	constructor(io: IOCD.API) {
		this.io = io;
	}

	async findWindow(id: string, timeout: number = 0): Promise<IOCD.Windows.IOConnectWindow | undefined> {
		let win = this.io.windows.findById(id);

		if (!win && timeout > 0) {
			await new Promise((r) => setTimeout(r, timeout));
			win = this.io.windows.findById(id);
		}
		return win;
	}

	async findWindowByName(name: string, timeout: number = 0): Promise<IOCD.Windows.IOConnectWindow | undefined> {
		let win = this.io.windows.find(name);

		if (!win && timeout > 0) {
			await new Promise((r) => setTimeout(r, timeout));
			win = this.io.windows.find(name);
		}
		return win;
	}

	async isVisible(id: string): Promise<boolean> {
		return (await this.findWindow(id))?.isVisible ?? false;
	}
}
