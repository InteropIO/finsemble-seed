/*!
* Copyright 2017 - 2020 by ChartIQ, Inc.
* All rights reserved.
*/
import React, { useState } from "react";
import ReactDOM from "react-dom"
import "../../../assets/css/font-finance.css";
import "../../../assets/css/finsemble.css";
import "./userPreferences.css";
import { UserPreferencesShell, LeftNav, ContentSection } from "@chartiq/finsemble-ui/react/components";

// The preference menu entries. It is passed as a prop to the LeftNav component to generate the preference menu section names.
const entries = ["General", "Workspaces", "My section"];

/*
 * Put your customized preference menu components here and pass this object as a prop to the ContentSection component.
 * The key should be the customized component's entry name and the value should be the customized React component.
 * For example, if you have a customized menu component called "Sample" with entry name "My Section", after you import the component to this file, i.e. import { Sample } from "./sample";
 * include this component in this object like so:
 * 
 * const customSections = {
 *  "My section": Sample
 * };
*/
const customSections = {};

const UserPreferences = () => {
    // The active section is the section that is currently selected and displayed in the preference menu.
    const [activeSection, setActiveSection] = useState("General");
    return (
        <UserPreferencesShell>
            <LeftNav entries={entries} setActiveEntry={setActiveSection} />
            <ContentSection activeSection={activeSection} customSections={customSections} />
        </UserPreferencesShell>
    )
}

ReactDOM.render(<UserPreferences />, document.getElementById("UserPreferences-component-wrapper"));