import * as React from "react"
import { Popout } from "./Popout"
import { EnableDisableSymbols } from "./EnableDisableSymbols"
import { Ticker } from "./Ticker"
import '../../../../assets/css/finsemble.css'
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
                <Popout id="id1" width={400} height={200}>
                   <Ticker />
                </Popout>
                <Popout id="id2" width={300}>
                    <SingleTicker item={state.symbols[0]} />
                </Popout>
            </div>
            <div className="row">
                <Popout id="id3" width={300}>
                    <SingleTicker item={state.symbols[1]} />
                </Popout>
                <Popout id="id4" width={200}>
                     <EnableDisableSymbols />
                </Popout>
            </div>
            <div className="row">
                <Popout id="5" width={600}>
                    <Calendar />
                </Popout>
            </div>
        </AppContext.Provider>
    )
}