var React = require("react");
var ReactDOM = require("react-dom");
var NotificationsCenterStore = require("./stores/NotificationsCenterStore").Store;
var NotificationsCenterComponent = require("./components/NotificationsCenterComponent");
var NotificationsCenter = React.createClass({
	getInitialState() {
		return {};
	},
	componentDidUpdate() {
	},
	componentWillMount() {
		var self = this;
	},
	componentDidMount() {
	},
	componentWillUnmount() {
	},
	componentWillReceiveProps(nextProps) { },	
	render() {
		var self = this;
		return (<div>
				<NotificationsCenterComponent />
			</div>)
	}
});
//for debugging.
window.NotificationsCenterStore = NotificationsCenterStore;

//render component when FSBL is ready.
FSBL.addEventListener('onReady', function(){
	ReactDOM.render(
	<NotificationsCenter />
	, document.getElementById('NotificationsCenter-component-wrapper'));
});