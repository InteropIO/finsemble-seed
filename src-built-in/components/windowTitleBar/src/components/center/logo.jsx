import React from "react";
export default class Logo extends React.Component {
  constructor() {
    super();
    this.state = {
      tabLogo: {}
    }
  }
  componentWillReceiveProps() {
    let wrap = FSBL.FinsembleWindow.wrap(this.props.windowIdentifier, (err, wrapper) => {
      wrapper.getOptions((err, opts) => {
        let fontIcon;
        try {
          fontIcon = opts.customData.foreign.components.Toolbar.iconClass;
        } catch (e) {
          fontIcon = "";
        }

        var imageIcon;
        try {
          imageIcon = opts.customData.foreign.components.Toolbar.iconURL;
        } catch (e) {
          imageIcon = "";
        }
        if (fontIcon && fontIcon != "") {
          //We'll randomize the default logo to test looks.
          if (fontIcon === "component") {
            let logos = [
              "component",
              "chat-group",
              "layout",
              "table",
              "list"
            ]

            fontIcon = logos[Math.floor(Math.random() * logos.length)];

          }
          this.setState({
            tabLogo: {
              type: "icon",
              class: "ff-" + fontIcon
            }
          })
        } else if (imageIcon && imageIcon !== "") {
          this.setState({
            tabLogo: {
              type: "image",
              url: imageIcon
            }
          })
        } else {
          this.setState({
            tabLogo: {
              type: "icon",
              url: "ff-grid"
            }
          })
        }
      });
    });
  }
  render() {
    return <div className="fsbl-tab-logo">
      {this.state.tabLogo.type === "icon" &&
        <i className={this.state.tabLogo.class}></i>
      }
      {this.state.tabLogo.type === "image" &&
        <img src={this.state.tabLogo.url} />}
    </div>
  }
}