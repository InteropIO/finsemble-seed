import React from 'react';
import { Actions, Store as UserPreferencesStore } from "../../stores/UserPreferencesStore";
import Checkbox from '../checkbox';

const DEFAULT_RESTART = {
    hour: 4,
    minute: 0,
    meridiem: "AM"
};
let HOURS = [];
for (var i = 1; i < 13; i++) {
    HOURS.push(i);
}
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
    }

    setPreferences(err, data) {
        if (!data && !data.value) return;
        let scheduledRestart = data.value['finsemble.scheduledRestart'];
        let enabled = scheduledRestart !== null && scheduledRestart !== false;
        if (enabled) {
            scheduledRestart.meridiem = scheduledRestart.hour > 11 ? "PM" : "AM";
        }
        this.setState({ scheduledRestart, enabled });
    }

    toggleEnabled() {
        let { enabled, scheduledRestart } = this.state;
        enabled = !enabled;
        if (!enabled) {
            scheduledRestart = DEFAULT_RESTART;
            this.setState({ enabled, scheduledRestart })
            Actions.disableScheduledRestart();
        } else {
            this.setState({ enabled, scheduledRestart })
        }
    }

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
    setMinute(e) {
        let minute = Number(e.target.value);
        let { scheduledRestart } = this.state;
        scheduledRestart.minute = minute;

        this.setState({ scheduledRestart });
        Actions.setScheduledRestart(scheduledRestart);
    }

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

    componentDidMount() {
        UserPreferencesStore.addListener({ field: 'preferences' }, this.setPreferences)
        UserPreferencesStore.getValue({ field: "preferences" }, (err, data) => {
            if (data) {
                let scheduledRestart = data['finsemble.scheduledRestart'];
                let enabled = scheduledRestart !== null;
                if (enabled) {
                    scheduledRestart.meridiem = scheduledRestart.hour > 11 ? "PM" : "AM";
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
                <select disabled={!enabled} onChange={this.setHour} value={scheduledRestart.meridiem === "PM" && scheduledRestart.hour > 12 ? scheduledRestart.hour - 12 : scheduledRestart.hour}>
                    {HOURS.map((hour, i) => {
                        return <option key={i} value={hour}>{hour}</option>
                    })}
                </select>
                &nbsp;:&nbsp;
                    <select disabled={!enabled} value={scheduledRestart.minute} onChange={this.setMinute}>
                    {MINUTES.map((minute, i) => {
                        return <option key={i} value={minute}>{minute}</option>
                    })}
                </select>
                &nbsp;
                    <select disabled={!enabled} onChange={this.setMeridiem} value={scheduledRestart.meridiem}>
                    <option value={"PM"}>PM</option>
                    <option value={"AM"}>AM</option>
                </select>
            </div>
        </div>
    }
}