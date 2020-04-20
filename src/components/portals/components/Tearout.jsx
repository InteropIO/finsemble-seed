import * as React from "react"
import { useContext, useEffect } from "react"
import { AppContext } from "./App"
import { Portal } from "./Portal"
import { ControlButtons } from "./ControlButtons"

import { getMousePosition } from "../helpers"

export const Tearout = ({ id, children, width }) => {
    const passedWidth = width
    const { state, dispatch } = useContext(AppContext)
    const poppedOut = state.popouts[id]
    /**
     * Dispatches a popout aand persistState actions
     * @param {object} bounds Popout position
     */
    const popOut = (bounds = {}) => {
        dispatch({
            type: 'popout',
            value: { id, ...bounds }
        });
        dispatch({ type: 'persistState' })
    }
    /**
     * Pops out a card when its dragged from the title
     * and dropped onto the desktop.
     */
    const dragOut = async (e) => {
        if (poppedOut) return;
        const mousePosition = await getMousePosition(e);
        popOut({
            top: mousePosition.top,
            left: mousePosition.left
        })
    }

    const renderContent = () => {
        return (
            <div draggable={!poppedOut} onDragEnd={dragOut} className="col">
                {!poppedOut && <i title="Pop out" className="ff-chat-popout" onClick={() => { popOut(); }}></i>}
                {children}
            </div>
        )
    }

    const renderPortal = () => {
        return (
            <React.Fragment>
                <ControlButtons id={id}/>
                <Portal id={id} customWidth={passedWidth}>
                    {renderContent()}
                </Portal>
            </React.Fragment>
        );
    }
    return !poppedOut ? renderContent() : renderPortal()
}