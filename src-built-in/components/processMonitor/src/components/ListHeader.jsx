import React from "react";
import { Store, Actions } from "../stores/ProcessMonitorStore";
//Not used right now. Currently using alerts. This is for the future.
export default class ListHeader extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            sort: Store.getValue({ field: "sort" })
        }
        this.onSortChanged = this.onSortChanged.bind(this);

    }
    onSortChanged(err, response) {
        let { value } = response;
        this.setState({
            sort: value
        })
    }
    componentWillMount() {
        Store.addListener({ field: "sort" }, this.onSortChanged);
    }
    componentWillUnmount() {
        Store.removeListener({ field: "sort" }, this.onSortChanged);
    }
    render() {
        //Just a list of the things beneath it. name, CPU, mem, etc. drive from store.
        return <div className="list-header">
            <div className="list-header-statistic-label list-header-name" onClick={() => {
                Actions.setSort("name")
            }}>
                Name
                {/* If this field is the one being sorted, render the direction of the sort. Otherwise return null. */}
                {this.state.sort.field === "name" ?
                    this.state.sort.direction === "ascending" ? <i className="sort-direction ff-arrow-up"></i> : <i className="sort-direction ff-arrow-down"></i> :
                    null
                }
            </div>
            <div className="list-header-statistic-labels">
                {this.props.fields.map(field => {
                    return (<div className="list-header-statistic-label" onClick={() => {
                        Actions.setSort(field.value)
                    }}>
                        {field.label}
                        {/* If this field is the one being sorted, render the direction of the sort. Otherwise return null. */}
                        {this.state.sort.field === field.value ?
                            this.state.sort.direction === "ascending" ? <i className="sort-direction ff-arrow-up"></i> : <i className="sort-direction ff-arrow-down"></i> :
                            null
                        }
                    </div>)
                })}
                <div className="list-header-statistic-label"></div>
            </div>
        </div>
    }
}