/*!
* Copyright 2017 - 2020 by ChartIQ, Inc.
* All rights reserved.
*/
import React, { useState } from "react";
import ReactDOM from "react-dom"
import "../../../assets/css/font-finance.css";
import "../../../assets/css/finsemble.css";
import "./userPreferences.css";
import { UserPreferencesShell, LeftNav, ContentSection, General, Workspaces } from "@chartiq/finsemble-ui/react/components";

/*
 * Put your customized preference menu components here and pass this object as a prop to the ContentSection component.
 * Each key should be a use preference component's entry name and each value should be a React component associated with that entry name.
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

/** The preference menu entries. It is passed as a prop to the LeftNav component to generate the preference menu section names. */
const entries = Object.keys(sections);

const UserPreferences = () => {
    // The active section is the section that is currently selected and displayed in the preference menu.
    const [activeSection, setActiveSection] = useState("General");
    return (
        <UserPreferencesShell>
            <LeftNav entries={entries} setActiveEntry={setActiveSection} />
            <ContentSection activeSection={activeSection} sections={sections} />
        </UserPreferencesShell>
    )
}

ReactDOM.render(<UserPreferences />, document.getElementById("UserPreferences-component-wrapper"));
