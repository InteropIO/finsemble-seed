import React from 'react';
import { Actions, Store as UserPreferencesStore } from "../../stores/UserPreferencesStore";
import Checkbox from '../checkbox';


const DEFAULT_RESTART = {
    hour: 4,
    minute: 0,
    meridiem: "AM"
};

//Create an array 1-12.
let HOURS = [];
for (var i = 1; i < 13; i++) {
    HOURS.push(i);
}

//FOR TESTING
// let MINUTES = [];
// for (var i = 1; i <= 60; i++){
//     MINUTES.push(i);
// }
const MINUTES = ["00", 15, 30, 45];
export default class ScheduledRestart extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            scheduledRestart: DEFAULT_RESTART,
            enabled: false
        };
        this.setPreferences = this.setPreferences.bind(this);
        this.toggleEnabled = this.toggleEnabled.bind(this);
        this.setHour = this.setHour.bind(this);
        this.setMinute = this.setMinute.bind(this);
        this.setMeridiem = this.setMeridiem.bind(this);
        this.getDisplayHour = this.getDisplayHour.bind(this);
    }

    /**
     * Invoked when any preference is changed on the userPreferencesStore.
     * @param {obj} err
     * @param {data} data
     */
    setPreferences(err, data) {
        if (!data && !data.value) return;
        let scheduledRestart = data.value['finsemble.scheduledRestart'];
        //If scheduledRestart is falsy, set "enabled" to false. I probably could've done !scheduledRestart. Oh well.
        let enabled = typeof scheduledRestart === "object";
        if (enabled) {
            //This is purely for display. I found that military time forced a scroll bar onto the dropdown that looked bad.
            scheduledRestart.meridiem = scheduledRestart.hour > 11 ? "PM" : "AM";
        } else {
            scheduledRestart = DEFAULT_RESTART;
        }
        this.setState({ scheduledRestart, enabled });
    }

    /**
     * Toggle the enabled state of the select boxes.
     */
    toggleEnabled() {
        let { enabled, scheduledRestart } = this.state;
        enabled = !enabled;
        //If the select boxes are no longer enabled, reset the scheduled restart time and call a method on the Actions object.
        //That function will set scheduledRestart to null via the preferences API. But we want our display to look nice, hence the bit where we reset it to the default value.
        if (!enabled) {
            scheduledRestart = DEFAULT_RESTART;
            this.setState({ enabled, scheduledRestart })
            Actions.disableScheduledRestart();
        } else {
            this.setState({ enabled })
            Actions.setScheduledRestart(scheduledRestart);
        }
    }

    /**
     * This method will transform 8 PM into 20:00. It also handles when the user changes the meridiem.
     * e.g., 8PM (20) => 8AM (8).
     * Set the minute, then set the 'finsemble.scheduledRestart' preference via the method on the Actions object.
     * @param {event} e
     */
    setHour(e) {
        let hour = Number(e.target.value);
        let { scheduledRestart } = this.state;
        if (hour < 12 && scheduledRestart.meridiem === "PM") {
            hour = hour + 12;
        } else if (hour > 12 && scheduledRestart.meridiem === "AM") {
            hour = hour - 12;
        } else if (scheduledRestart.meridiem === "AM" && hour === 12) {
            hour = 0;
        }

        scheduledRestart.hour = hour;
        this.setState({ scheduledRestart });
        Actions.setScheduledRestart(scheduledRestart);
    }

    /**
     * Set the minute, then set the 'finsemble.scheduledRestart' preference via the method on the Actions object.
     * @param {event} e
     */
    setMinute(e) {
        let minute = Number(e.target.value);
        let { scheduledRestart } = this.state;
        scheduledRestart.minute = minute;

        this.setState({ scheduledRestart });
        Actions.setScheduledRestart(scheduledRestart);
    }

    /**
     * Sets the meridiem for the time (AM or PM). Afterwards, this calls setHour to handle any necessary conversions to military time.
     * @param {event} e
     */
    setMeridiem(e) {
        let { scheduledRestart } = this.state;
        let currentMeridiem = scheduledRestart.meridiem;

        let meridiem = e.target.value;
        scheduledRestart.meridiem = meridiem;
        this.setState({
            scheduledRestart
        }, () => {
            this.setHour({
                target: {
                    value: this.state.scheduledRestart.hour
                }
            })
        })
    }
    getDisplayHour() {
        let { scheduledRestart } = this.state;
        if (scheduledRestart.meridiem === "AM" && scheduledRestart.hour === 0) {
            return 12;
        } else if (scheduledRestart.meridiem === "PM" && scheduledRestart.hour > 12) {
            return scheduledRestart.hour - 12;
        } else {
            return scheduledRestart.hour;
        }
    }
    /**
     * Add listener on the store. When the preferences field changes, we change our local state.
     * Also, get the initial state from the store.
     */
    componentDidMount() {
        UserPreferencesStore.addListener({ field: 'preferences' }, this.setPreferences)
        UserPreferencesStore.getValue({ field: "preferences" }, (err, data) => {
            console.log('response: ', data)
            if (data) {
                let scheduledRestart = data['finsemble.scheduledRestart'];
                let enabled = typeof scheduledRestart === "object";
                if (enabled) {
                    scheduledRestart.meridiem = scheduledRestart.hour > 11 ? "PM" : "AM";
                } else {
                    scheduledRestart = DEFAULT_RESTART;
                }
                this.setState({ scheduledRestart, enabled });
            }
        })
    }

    componentWillUnmount() {
        UserPreferencesStore.removeListener({ field: 'preferences' }, this.setPreferences)
    }

    render() {
        const { scheduledRestart, enabled } = this.state;
        let wrapClasses = "scheduled-restart";
        if (!enabled) {
            wrapClasses += " disabled-restart";
        }
        return <div className="complex-menu-content-row">
            <Checkbox
                onClick={this.toggleEnabled}
                checked={this.state.enabled}
                label="Restart daily" />
            <div className={wrapClasses}>
                <span className="scheduled-restart-select-label">
                    Time:
                </span>
                {/* HOURS */}
                <select disabled={!enabled} onChange={this.setHour} value={this.getDisplayHour()}>
                    {HOURS.map((hour, i) => {
                        return <option key={i} value={hour}>{hour}</option>
                    })}
                </select>
                &nbsp;:&nbsp;
                {/* MINUTES */}
                <select disabled={!enabled} value={scheduledRestart.minute} onChange={this.setMinute}>
                    {MINUTES.map((minute, i) => {
                        return <option key={i} value={minute}>{minute}</option>
                    })}
                </select>
                &nbsp;
                {/* MERIDIEM */}
                <select disabled={!enabled} onChange={this.setMeridiem} value={scheduledRestart.meridiem}>
                    <option value={"AM"}>AM</option>
                    <option value={"PM"}>PM</option>
                </select>
            </div>
        </div>
    }
}
