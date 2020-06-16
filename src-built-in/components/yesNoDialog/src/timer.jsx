import React from "react";
export default class Timer extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			timerDuration: props.timerDuration,
		};
	}
	//Every second, subtract a second.
	componentWillMount() {
		setInterval(() => {
			let newTime = this.state.timerDuration - 1000;
			if (newTime === 0) {
				this.props.ontimerDurationExpiration();
			} else {
				this.setState({
					timerDuration: newTime,
				});
			}
		}, 1000);
	}
	//Countdown clock.
	render() {
		return <div>Time Remaining: {this.state.timerDuration / 1000}</div>;
	}
}
