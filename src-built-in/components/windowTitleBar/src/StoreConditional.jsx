import React, { useState, useEffect } from "react";
import { initialize, getStore } from "../../../../../finsemble-ui/src/components/windowTitlebar/stores/windowTitleBarStore";

export const If = ({ children, condition}) => {
    return (
        <>
        {condition && children}
        </>
    )
}

export const WaitForStore = ({children, condition}) => {
    const [ready, setReady] = useState(false);
    useEffect(() => {
            initialize(() => {
                setReady(true);
             });
    }, [])  ;
    return (
        <>
            {ready && condition(getStore()) && children}
        </>
    )
}
