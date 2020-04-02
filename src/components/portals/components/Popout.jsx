import * as React from "react"
import { useContext } from "react"
import { AppContext } from "./App"
import { Portal } from "./Portal"

export const Popout = ({ id, children, width }) => {
    const passedWidth = width
    const { state, dispatch } = useContext(AppContext)
    const poppedOut = state.popouts[id]
    const popOut = (bounds = {}) => {
        dispatch({
            type: 'add',
            value: { id, ...bounds }
        });
        dispatch({ type: 'persistState' })
    }

    const getMousePosition = (e) => {
        return new Promise((resolve, reject) => {
            if (typeof FSBL !== "undefined") {
                FSBL.System.getMousePosition((error, position) => {
                    resolve(position);
                });
            } else {
                resolve({
                    top: e.clientY,
                    left: e.clientX
                });
            }

        })
    }

    const dragOut = async (e) => {
        if (poppedOut) return;
        const mousePosition = await getMousePosition(e);
        popOut({
            top: mousePosition.top,
            left: mousePosition.left
        })
    }

    const renderDOM = () => {
        return (
            <div draggable={!poppedOut} onDragEnd={dragOut} className="col">
                {!poppedOut && <i title="Pop out" className="ff-chat-popout" onClick={() => { popOut(); }}></i>}
                {children}
            </div>
        )
    }
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

    const renderPortal = () => {
        const { top, left, height, width } = state.popouts[id];
        const bounds = { top, left, height, width };
        return (
            <React.Fragment>
                <div className="col card">
                    {typeof FSBL !== "undefined" &&
                    <React.Fragment>
                        <div className="card-title">
                            Control Panel for Portal {id}
                        </div>
                        <div className="content">
                            <div className="row controls">
                                <div className="control-button" onClick={hideChildWindow}>Hide</div>
                                <div className="control-button" onClick={showChildWindow}>Show</div>
                                <div className="control-button" onClick={focusChildWindow}>Focus</div>
                                <div className="control-button" onClick={closeChildWindow}>Close</div>
                            </div>
                            <div>
                                <p>&nbsp;Current Position:</p>
                                <pre>{JSON.stringify(bounds, null, '  ')}</pre>
                            </div>
                        </div>
                    </React.Fragment>
                    }
                </div>
                <Portal id={id} customWidth={passedWidth}>
                    {renderDOM()}
                </Portal>
            </React.Fragment>
        );
    }
    return !poppedOut ? renderDOM() : renderPortal()
}