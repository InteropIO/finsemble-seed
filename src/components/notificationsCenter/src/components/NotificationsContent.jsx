/*!
* Copyright 2018 by ChartIQ, Inc.
* All rights reserved.
*/
/**
 *
 */
import React from "react";
import NotificationsList from "./NotificationsList";
export default class NotificationsContent extends React.Component {
    constructor() {
        super();
        this.bindCorrectContext();
        this.state = {
            details: false
        };
    }
    bindCorrectContext() {

    }

    componentWillMount() {

    }

    render() {
        var self = this;

        return <div className="content">
            <NotificationsList key={"theList"} detailsClick={this.onOpenDetails} installed={true} />
        </div>

    }
}