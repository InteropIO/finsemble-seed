/*!
* Copyright 2018 by ChartIQ, Inc.
* All rights reserved.
*/
/**
 *
 */
import React from "react";
import NotificationsList from "./NotificationsList";
import NotificationDetails from "./NotificationDetails";
export default class NotificationsContent extends React.Component {
    constructor() {
        super();
        this.bindCorrectContext();
        this.state = {
            details: false
        };
    }
    bindCorrectContext() {
        this.itemClick = this.itemClick.bind(this);
        this.onOpenDetails = this.onOpenDetails.bind(this);
        this.onBackClick = this.onBackClick.bind(this);


    }

    itemClick() {
        console.log("this.props click", this.props)
        FSBL.Clients.SearchClient.invokeItemAction(this.props.app, this.props.app.actions[0]);//make this only use spawn for now
    }

    componentWillMount() {

    }
    onOpenDetails(item) {
        this.setState({ details: item })
    }
    onBackClick() {
        this.setState({ details: false })
    }
    render() {
        var self = this;
        console.log("this.props content", this.state)

        return <div className="content">
            <div className={(this.state.details ? "" : "hide")}><NotificationDetails item={this.state.details} backClick={this.onBackClick} /></div>
            <div className={(this.state.details ? "hide" : "")}><NotificationsList detailsClick={this.onOpenDetails} installed={true} /></div>
        </div>



    }
}