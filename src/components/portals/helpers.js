/**
 * Uses Finsemble API to return current mouse position
 * @param {object} e mouse event
 */
export const getMousePosition = (e) => {
    return new Promise((resolve, reject) => {
        if (typeof FSBL !== "undefined") {
            FSBL.System.getMousePosition((error, position) => {
                resolve(position);
            });
        } else {
            resolve({
                top: e.screenY,
                left: e.screenX
            });
        }

    })
}

/**
 * Checks if the value is null or undefined
 * @param {*} thing 
 */
export const isNullish = (thing) => {
    return thing === null || typeof (thing) === "undefined";
}

/**
 * Returns the bounds of parent window
 */
export const getParentWindowBounds = async () => {
    if (typeof FSBL !== "undefined") {
        const { data } = await finsembleWindow.getBounds();
        return data;
    }
    return {
        top: window.screenTop,
        left: window.screenLeft,
        width: window.outerWidth,
        height: window.outerHeight
    }
}