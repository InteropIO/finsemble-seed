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
import { Sample } from "./sample";


const entries = [
    {
        name: "general",
        label: "General"
    },
    {
        name: "workspaces",
        label: "Workspaces"
    },
    {
        name: "sample",
        label: "Sample"
    }
];

const customSections = {
    sample: Sample
};

const UserPreferences = () => {
    const [activeSection, setActiveSection] = useState("general");
    return (
        <UserPreferencesShell>
            <LeftNav entries={entries} setActiveEntry={setActiveSection} />
            <ContentSection activeSection={activeSection} customSections={customSections} />
        </UserPreferencesShell>
    )
}

ReactDOM.render(<UserPreferences />, document.getElementById("UserPreferences-component-wrapper"));