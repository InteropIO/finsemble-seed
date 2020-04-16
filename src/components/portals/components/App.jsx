import * as React from "react"
import { Tearout } from "./Tearout"
import { EnableDisableSymbols } from "./EnableDisableSymbols"
import { Ticker } from "./Ticker"
import "@chartiq/finsemble-ui/react/assets/css/finsemble.css"
import { useEffect } from "react"
import { generateTick } from "../randomTicks"
import { SingleTicker } from "./SingleTicker"
import { Calendar } from "./EconomicCalendar"
import { reducer, initialState } from "../reducer"
// ReactContext + react's useReducer hook
// for a quick and easy redux store alternative
export const AppContext = React.createContext()

export const App = () => {
    // Pass initial state as the last argument to useReducer
    const [state, dispatch] = React.useReducer(reducer, initialState);
    useEffect(() => {
        // Dispatch some random prices
        /**
         * When finsemble is ready, get component state
         * and check if we have data we dispatch a restore
         * action to update the global app state
         */
        window.addEventListener("FSBLReady", () => {
            FSBL.Clients.WindowClient.getComponentState({ field: 'store' }, (error, value) => {
                // childWindows stores references to `window` objects. They are removed
                // when persisted. Add the property back after restoring.
                if (value) {
                    value.childWindows = {};
                    dispatch({ type: 'restore', value })
                }
            })
        });
        window.addEventListener("beforeunload", () => {
            dispatch({ type: 'closeallchildwindows' });
        })
    }, [])

    useEffect(() => {
        // Generate random fake ticks
       setInterval(() => {
            dispatch({
                type: 'ticks',
                value: generateTick(state.symbols)
            })
       }, 800)
    }, [])
    return (
        <AppContext.Provider value={{ state, dispatch }}>
            <div className="row">
                <Tearout id="id1" width={400} height={200}>
                     <Ticker />
                </Tearout>
                <Tearout id="id2" width={300}>
                    <SingleTicker item={state.symbols[0]} />
                </Tearout>
            </div>
            <div className="row">
                <Tearout id="id3" width={300}>
                    <SingleTicker item={state.symbols[1]} />
                </Tearout>
                <Tearout id="id4" width={200}>
                     <EnableDisableSymbols />
                </Tearout>
            </div>
            <div className="row">
                <Tearout id="5" width={600}>
                    <Calendar />
                </Tearout>
            </div>
        </AppContext.Provider>
    )
}