export const initialState = {
    childWindows: {},
    interval: 400,
    popouts: {},
    enabled: ['EURUSD', 'USDCAD', 'USDGBP'],
    symbols: [
        { symbol: 'EURUSD', bid: 1.10121, ask: 1.10121, bidclass: '', askClass: ''},
        { symbol: 'USDCAD', bid: 1.43412, ask: 1.43412, bidclass: '', askClass: ''},
        { symbol: 'USDGBP', bid: 0.81434, ask: 0.81434, bidclass: '', askClass: ''}
    ],
    isReloading: false
}

export const reducer = (state, action) => {
    // ignore all actions on reload.
    if (state.isReloading) return state;
    let nextState
    switch (action.type) {
        case 'interval':
            nextState = Object.assign({}, state)
            nextState.interval = action.value
            return nextState
        case 'add':
            nextState = Object.assign({}, state)
            nextState.popouts[action.value.id] = action.value
            return nextState
        case 'remove':
            nextState = Object.assign({}, state)
            delete nextState.popouts[action.value.id]
            return nextState
        case 'restore':
            return action.value
        case 'ticks':
            nextState = Object.assign({}, state)
            nextState.symbols = action.value
            return nextState
        case 'setVisibile':
            nextState = Object.assign({}, state)
            const {symbol, visible} = action.value
            const index = nextState.enabled.indexOf(symbol)
            if (!visible) {
                nextState.enabled.splice(index, 1)
            } else {
                nextState.enabled.push(symbol)
            }
            return nextState
        case 'persistState':
            nextState = Object.assign({}, state);
            const childWindows = nextState.childWindows;
            // can't persist childWindow; it's a reference to window.open
            const safeState = Object.assign({}, nextState);
            delete safeState.childWindows;
            debugger
            typeof FSBL !== "undefined" && FSBL.Clients.WindowClient.setComponentState({ field: 'store', value: safeState });
            nextState.childWindows = childWindows;
            return nextState;
        case 'addchildwindow':
            nextState = Object.assign({}, state);
            nextState.childWindows[action.value.id] = action.value.childWindow;
            return nextState;
        case 'removechildwindow':
            nextState = Object.assign({}, state);
            delete nextState.childWindows[action.value.id];
            return nextState;
        case 'reloadwindow':
            nextState = Object.assign({}, state);
            nextState.isReloading = true;
            Object.values(state.childWindows).forEach(cw => cw.close());
            return nextState;
        default:
            throw new Error("unknown type");
    }
}
