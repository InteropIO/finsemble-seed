/*!
* The yes/no dialog is a component that shows the user two options - one to act on a particular option, one to cancel it.
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/

import React from "react";
import ReactDOM from "react-dom";
import "../../../assets/css/finsemble.css";
import { YesNoDialog } from "@chartiq/finsemble-ui/lib/components/yesNoDialog/yesNoDialog";


window.yesNoDone = false;
if (!window.yesNoDone) {
    window.yesNoDone = true;
    ReactDOM.render(<YesNoDialog />, document.getElementById("YesNoDialog-component-wrapper"));
}