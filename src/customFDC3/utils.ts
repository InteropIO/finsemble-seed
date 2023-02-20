import { NAME_PREFIX } from "./constants";

/** Debug logging function */
export function debug(...args: any[]) {
	FSBL.Clients.Logger.debug(...args);
	console.log(...args);
}

/** Normal logging function */
export function log(...args: any[]) {
	FSBL.Clients.Logger.log(...args);
	console.log(...args);
}

/** Warning logging function */
export function warn(...args: any[]) {
	FSBL.Clients.Logger.warn(...args);
	console.warn(...args);
}

/** Error Logging function */
export function errorLog(...args: any[]) {
	FSBL.Clients.Logger.error(...args);
	//not needed as Finsemble will print these to console.log anyway
	//console.error(...args);
}


/** Util function to get router topic or query responder names for API calls. */
export function getRouterTopicName(action: string, windowName?: string) {
	return `${NAME_PREFIX}-${windowName ?? finsembleWindow.windowName}-${action}`;
}

/** Hashing function for context objects, used to detect messages received from multiple channels. */
export function objectHash(obj: any): number {
	return JSON.stringify(obj).split('').reduce((s, c) => Math.imul(31, s) + c.charCodeAt(0) | 0, 0);
}

/** Async wait function */
export function wait(numMs: number) {
	return new Promise((resolve) => {
		setTimeout(()=>resolve, numMs);
	})
}