import * as React from "react"
import { AppContext } from "./App"
import { useContext } from "react"

export const EnableDisableSymbols = () => {
    const { state, dispatch } = useContext(AppContext)
    const onChange = (event) => {
        dispatch({
            type: 'setVisibile',
            value: {
                symbol: event.target.value,
                visible: event.target.checked
            }
        })
    }
    return (
        <div className="card">
            <div className="card-title">Enabled instruments</div>
            <div className="content enabled-instruments">
                {state.symbols.map(({ symbol, visible }) => {
                    return <p className="checkbox-row" key={symbol}>
                        <input onChange={onChange} checked={state.enabled.includes(symbol)}
                            type="checkbox" value={symbol} id={symbol} />
                        <label htmlFor={symbol}>{symbol}</label>
                    </p>
                })}
           </div>
        </div>
    )
}