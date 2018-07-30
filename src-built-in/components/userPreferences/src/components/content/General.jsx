import React from 'react';
import { Store as UserPreferencesStore } from "../../stores/UserPreferencesStore";
import ScheduledRestart from "../general/ScheduledRestart";
import Toolbar from "../general/Toolbar";
export default class General extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return <div>
            <ScheduledRestart />
            <Toolbar />
         </div>
    }
}