import * as React from "react"
import { useContext } from "react"
import { AppContext } from "./App"

export const Ticker = () => {
    const { state } = useContext(AppContext)
    return (<div className="card">
        <div className="card-title">Instruments </div>
        <div className="content">
            <table>
                <thead>
                    <tr>
                        <td>Symbol</td>
                        <td>Bid</td>
                        <td>Ask</td>
                    </tr>
                </thead>
                <tbody>
                    {
                        state.symbols.map(({ bid, ask, symbol, bidClass, askClass }) => {
                            const row = <tr key={symbol}>
                                <td><span>{symbol}</span></td>
                                <td><span className={bidClass}>{bid.toFixed(5)}</span></td>
                                <td><span className={askClass}>{ask.toFixed(5)}</span></td>
                            </tr>
                            return state.enabled.includes(symbol) && row
                        })
                    }
                </tbody>
            </table>
        </div>
    </div>)
}