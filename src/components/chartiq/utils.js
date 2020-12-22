/**
 * Check for the FDC3 preload
 * @returns {boolean}
 */
export const fdc3Check = () =>
  FSBL.Clients.WindowClient.options.preload.find(({ url }) => url.includes("FDC3"))
//TODO: it might be worth thinking about adding a check for fdc3 in the config in the future - FSBL.Clients.WindowClient.options.customData.foreign.services.fdc3

/**
 * When ready this function will fire the callback provided
 *
 * @param {function} cb
 */
// if fdc3 is already available don't wait just run the calback
export const fdc3OnReady = (cb) => window.fdc3 ? cb() : window.addEventListener('fdc3Ready', cb)