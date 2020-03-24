/*!
* The authentication component is a React component that renders a user form to collect auth info and determine whether to give user access to the rest of Finsemble
* based on the information provided.
* Copyright 2020 by ChartIQ, Inc.
* All rights reserved.
*/

import React, { useState } from "react";
import ReactDOM from "react-dom";
import { AuthHeader, AuthForm, ErrorMessage, AuthInput, AuthSubmit } from "@chartiq/finsemble-ui/react/components";
import useAuth from "@chartiq/finsemble-ui/react/hooks";

export const Authentication = () => {
    const { saveInputChange, formValues, authorize, quitApplication } = useAuth();
    const { error, setError } = useState(null);

    /*
     * Replace this function with your own authentication method that makes the call to your authentication server.
     */
    const authenticateUser = async () => {
        // The user form data to be sent to the authentication server.
        const { username, password } = formValues;
        // Replace this with your own authentication calls. Currently it will always authenticate no matter what the user input is.
        const result = await Promise.resolve({res: "ok"});
        // the result is an object containing a response and an error. For example:
        // {
        //     res: "ok",
        //     error: "Password is not correct"
        // }
        return result;
    }

    /**
     * This function invokes the function that makes the call to the server that verifies user authentication information and
     * decides whether to authorize the user to the rest of the application or display an error on the authentication form.
     * @param {func} authenticateUser The function to call to authenticate the user.
     */
    const onSubmit = async (authenticateUser) => {
        const authResult = await authenticateUser();
        if (authResult.res === "ok") {
            authorize();
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
                    <AuthInput
                        type="text"
                        name="username"
                        placeholder="Username"
                        onChange={saveInputChange}
                    />
                    <AuthInput
                        type="password"
                        name="password"
                        placeholder="Password"
                        onChange={saveInputChange}
                    />
                    <AuthSubmit onClick={() => onSubmit(authenticateUser)} >
                        Login
                    </AuthSubmit>
                </div>
            </AuthForm>
        </>
    )
}

ReactDOM.render(<Authentication />, document.getElementById("authentication"));
FSBL.System.Window.getCurrent().show();