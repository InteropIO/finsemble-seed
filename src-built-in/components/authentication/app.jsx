/*!
* The authentication component is a React component that renders a user form to collect auth info and determine whether to give user access to the rest of finsemble
* based on the information provided. 
* Copyright 2020 by ChartIQ, Inc.
* All rights reserved.
*/

import React, { useState } from "react";
import ReactDOM from "react-dom";
import { AuthHeader, AuthForm, ErrorMessage, AuthInput, AuthSubmit } from "@chartiq/finsemble-ui/lib/components";
import useAuth from "@chartiq/finsemble-ui/lib/hooks/useAuth";

export const Authentication = () => {
    const { handleChange, formValues, proceedToAuthorize, quitApplication } = useAuth();
    const { error, setError } = useState(null);

    /*
     * Replace this function with your own authentication method that makes the call to the user authentication server.
     */
    const authenticateUser = async () => {
        const { username, password } = formValues;  // Send this data to the server to validate user input
        const result = await Promise.resolve({res: "ok"});  // Replace this with your own authentication calls
        return result;  // the result is an object 
    }

    const onSubmit = async (authenticateUser) => {
        const authResult = await authenticateUser();
        if (authResult.res === "ok") {
            proceedToAuthorize();
        } else {
            setError(authResult.error);
        }
    };

    return (
        <>
            <AuthHeader>
                <img className="fsbl-logo" />
                <div className="fsbl-close">
                    <i className="ff-close" onClick={quitApplication}></i>
                </div>
            </AuthHeader>

            <AuthForm>
                <div className="fsbl-login-logo" alt="Finsemble Sign In"></div>
                <div className="fsbl-button-wrapper">
                    {error && <ErrorMessage>
                        {error}
                    </ErrorMessage>}
                    <input 
                        type="text"
                        name="username"
                        placeholder="Username"
                        onChange={handleChange} 
                    />
                    <AuthInput 
                        type="password"
                        name="password"
                        placeholder="Password"
                        onChange={handleChange} 
                    />
                    <AuthSubmit onClick={() => onSubmit(authenticateUser)} >
                        Login
                    </AuthSubmit>
                </div>
            </AuthForm>
        </>
    )
}


function renderAuthComponent() {
    ReactDOM.render(<Authentication />, document.getElementById("authentication"));
    FSBL.System.Window.getCurrent().show();
}

if (window.FSBL && FSBL.addEventListener) {
	FSBL.addEventListener("onReady", renderAuthComponent);
} else {
	window.addEventListener("FSBLReady", renderAuthComponent);
}
