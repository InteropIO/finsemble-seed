/*!
* Copyright 2020 by ChartIQ, Inc.
* All rights reserved.
*/
/**
 * This component is the name of a component and a pin that will pin that component to all toolbars.
 *
 */
import React from "react";
import * as storeExports from "../stores/searchStore";
let menuStore;
import AppList from "./AppList";
import AppDetails from "./AppDetails";
export default class AppContent extends React.Component {
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
       //console.log("this.props click", this.props)
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
       //console.log("this.props content", this.state)

        return <div className="content">
            <div className={(this.state.details ? "" : "hide")}><AppDetails item={this.state.details} backClick={this.onBackClick} /></div>
            <div className={(this.state.details ? "hide" : "")}><AppList detailsClick={this.onOpenDetails} installed={true} /></div>
        </div>



    }
}