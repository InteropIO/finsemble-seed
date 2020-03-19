import React, { useState, useEffect } from "react";
import { initialize, getStore } from "./stores/windowTitleBarStore";

export const StoreConditional = ({children, condition}) => {
    const [ready, setReady] = useState(false);
    useEffect(() => {
        initialize(() => {
            setReady(true);
        });
    }, []);

    if (ready) {
        if (condition(getStore())) {
            return <>{children}</>
        }
    } 
    return <></>
}
