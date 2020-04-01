import * as React from "react"

export const SingleTicker = ({ item }) => {
    const { symbol, bid, ask, bidClass, askClass } = item
    return (
        <div className="card">
            <div className="card-title">{symbol}</div>
            <div className="content ">
                <div className="row">
                    <div className={`single-ticker col big-number ${bidClass}`}>
                        <span>&#129093; {bid.toFixed(5)}</span>
                        <center>Short</center>
                    </div>
                    <div className={`single-ticker col big-number ${askClass}`}>
                        <span>&#129093; {ask.toFixed(5)}</span>
                        <center>Long</center>
                    </div>
                </div>
            </div>
        </div>
    )
}