// var React = require("react");
// var ReactDOM = require("react-dom");
// var NotificationsCenterActions = require("../stores/NotificationsCenterStore").Actions;
// var NotificationsTable = require('./NotificationsTable');
// var NotificationsCenterComponent = React.createClass({
// 	componentDidUpdate() {
// 	},
// 	componentWillMount() {
// 	},
// 	componentWillUnmount() {
// 	},
// 	componentWillReceiveProps(nextProps) { },
// 	render() {
// 		var self = this;		
// 		return <div>
					
// 					<NotificationsTable />
					
// 				</div>
// 	}
// 	});

// module.exports = NotificationsCenterComponent;

import React from 'react';
import { render } from 'react-dom';
import NotificationsTable from './NotificationsTable';

const rootElement = document.querySelector('#NotificationsTable');
if (rootElement) {
  render(<NotificationsTable />, rootElement);
}
      