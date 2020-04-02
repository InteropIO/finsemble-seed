import * as React from "react"
import { useContext } from "react"
import { AppContext } from "./App"

export const Button = ({ onClick, label }) => {
    return <div className="control-button" onClick={onClick}>{label}</div>
}

export const ControlButtons = ({ id }) => {

    const { state, dispatch } = useContext(AppContext)
    const { top, left, height, width } = state.popouts[id];
    const bounds = { top, left, height, width };
    /**
     * finsembleWindow doesn't exist until FSBL is online. If the hide/show button
     * was clicked before that happened (small chance, but possible), these functions
     * would fail. We don't want that.
     *
     * Here, we return the finsembleWindow if it exists; otherwise, we wait.
     */
    const getFinsembleWindowFromChild = () => {
        const childWindow = state.childWindows[id];
        if (childWindow.finsembleWindow) return Promise.resolve(childWindow.finsembleWindow);
        return new Promise((resolve) => {
            childWindow.addEventListener("FSBLReady", () => {
                resolve(childWindow.finsembleWindow);
            });
        })
    }

    const hideChildWindow = async () => {
        const cw = await getFinsembleWindowFromChild()
        cw.hide();
    }

    const showChildWindow = async () => {
        const cw = await getFinsembleWindowFromChild()
        cw.show();
    }

    const focusChildWindow = async () => {
        const cw = await getFinsembleWindowFromChild()
        cw.focus();
    }

    const closeChildWindow = async () => {
        const cw = await getFinsembleWindowFromChild()
        cw.close();
    }

    return (
        
        <div className="col card">
            {typeof FSBL !== "undefined" &&
                <React.Fragment>
                    <div className="card-title">
                        Control Panel for Portal {id}
                    </div>
                    <div className="content">
                        <div className="row controls">
                            <Button onClick={hideChildWindow} label="Hide" />
                            <Button onClick={showChildWindow} label="Show" />
                            <Button onClick={focusChildWindow} label="Focus" />
                            <Button onClick={closeChildWindow} label="Close" />
                        </div>
                        <div>
                            <p>&nbsp;Current Position:</p>
                            <pre>{JSON.stringify(bounds, null, '  ')}</pre>
                        </div>
                    </div>
                </React.Fragment>
            }
        </div>
    )
}