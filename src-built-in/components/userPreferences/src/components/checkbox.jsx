import React from 'react';
export default class Checkbox extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        let checkboxClasses = "complex-menu-checkbox";
        if (this.props.checked) {
            checkboxClasses += " checked";
        }
        return <div className="complex-menu-checkbox-wrapper" onClick={this.props.onClick}>
            <div className={checkboxClasses}>
                {this.props.checked &&
                    <i className="ff-check-mark"></i>
                }
            </div>
            <div className="complex-menu-checkbox-label">{this.props.label}</div>
        </div>
    }
}