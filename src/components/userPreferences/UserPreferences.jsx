/*!
* Copyright 2017 - 2020 by ChartIQ, Inc.
* All rights reserved.
*/
import React from "react";
import ReactDOM from "react-dom"
import "../../../assets/css/font-finance.css";
import "../../../assets/css/finsemble.css";
import "./userPreferences.css";
import { UserPreferences, General, Workspaces } from "@chartiq/finsemble-ui/react/components";

/*
 * Put your customized preference menu components here and pass this object as a prop to the UserPreferences component.
 * Each key should be a user preference component's entry name and each value should be a React component associated with that entry name.
 * For example, if you have a customized menu component called "Sample" with entry name "My Section":
 * 
 * // Import the component to this file.
 * import { Sample } from "./sample";
 * 
 * const sections = {
 *   "General": General,
 *   "Workspaces": Workspaces
 *   "My section": Sample  // Include this component in the "sections" object.
 * };
*/
const sections = {
    "General": General,
    "Workspaces": Workspaces
};

ReactDOM.render(<UserPreferences sections={sections} />, document.getElementById("UserPreferences-component-wrapper"));
