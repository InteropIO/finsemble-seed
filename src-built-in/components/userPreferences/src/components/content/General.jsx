import React from 'react';
import ScheduledRestart from "../general/ScheduledRestart";
export default class General extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return <div>
            <ScheduledRestart />
         </div>
    }
}
