import React from "react";
//Not used right now. Currently using alerts. This is for the future.
export default class Toast extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            shouldRender: true
        };
        this.hide = this.hide.bind(this);
    }
    hide() {
        this.setState({
            shouldRender: false
        });
    }
    render() {
        const { message, className } = this.props;
        const { shouldRender } = this.state;
        if (!shouldRender) return null;
        if (!message) return null;
        return (
            <div className={className}>
                <div className="toast-header">
                    <div className="toast-close">
                        <i className="ff-close" onClick={this.hide}></i>
                    </div>
                </div>
                <div className="toast-message">
                    {message}
                </div>
            </div>
        )
    }
}