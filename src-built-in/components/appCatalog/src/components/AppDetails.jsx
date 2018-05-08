/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/
/**
 * This component is the name of a component and a pin that will pin that component to all toolbars.
 *
 */
import React from "react";
import * as storeExports from "../stores/searchStore";
let menuStore;
export default class AppList extends React.Component {
    constructor() {
        super();
        this.bindCorrectContext();
        this.state = {

        };
    }
    bindCorrectContext() {
        this.itemClick = this.itemClick.bind(this);
    }

    itemClick() {
        console.log("this.props click", this.props)
        FSBL.Clients.SearchClient.invokeItemAction(this.props.item, this.props.item.actions[0]);//make this only use spawn for now
        setTimeout(() => {//we do this because the originating window doesn't exist in the launcher if we dont wait.
            FSBL.Clients.WindowClient.finsembleWindow.close();
            FSBL.Clients.DialogManager.hideModal();
        }, 100);

    }

    componentWillMount() {

    }

    render() {
        var self = this;
        return <div className="AppDetailsContainer">
            <div className="back-wrapper" onClick={self.props.backClick}><i className="ff-arrow-back"></i>Back</div>
            <div className="detailsHeader">
                <div style={{ backgroundImage: "url(src/assets/logo-placeholder-52.png)" }} className="logo"></div>
                <div className="titleContainer">
                    <div className="titleDisplay">{this.props.item.name}</div>
                    <div className="vendor">{this.props.item.vendor}</div>
                </div>
                <div onClick={this.itemClick} className="openButton">Open</div>
            </div>
            <div >{this.props.item.description}</div>
        </div>
    }
}