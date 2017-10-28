var React = require("react");
var ReactDOM = require("react-dom");
var AboutFinsemble = React.createClass({
	componentWillReceiveProps(nextProps) { },
	render() {
		var self = this;
		return (<div >
				test here
			</div>)
	}
});

//render component when FSBL is ready.
FSBL.addEventListener('onReady', function(){
	ReactDOM.render(
	<AboutFinsemble />
	, document.getElementById('AboutFinsemble-component-wrapper'));
});