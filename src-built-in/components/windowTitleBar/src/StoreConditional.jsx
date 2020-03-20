import React, { useState, useEffect } from "react";
import { initialize, Store } from "./stores/windowTitleBarStore";

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
            {ready && condition(Store) && children}
        </>
    )
}
