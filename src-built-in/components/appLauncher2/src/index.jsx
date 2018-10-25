import "../style.css"
import "../../../../assets/css/font-finance.css"
import "../../../../assets/css/finsemble.css"
// Import js modules
import React from  'react'
import ReactDOM from  'react-dom'
import {createStore, getStore} from './stores/LauncherStore'
// Import React components
import LeftNav from './components/LeftNav'
import Content from './components/Content'

class AppLauncher extends React.Component {

	constructor(props) {
		super(props);
		this.finWindow = fin.desktop.Window.getCurrent();
	}

	componentWillMount() {
		this.finWindow.addEventListener('shown', () => {
			console.log('focusing');
			this.finWindow.focus();
		});
	}

	render() {
		return (
			<div className="user-preferences">
				<div className="complex-menu-wrapper">
					<LeftNav />
					<Content />
				</div>
			</div>
		)
	}
}


// FSBL.addEventListener("onReady", function () {
// 	createStore((store) => {
// 		ReactDOM.render(<AppLauncher />,
// 			document.getElementById("wrapper"))
// 	})
// })

fin.desktop.main(function () {
	FSBL.addEventListener("onReady", function () {
		createStore((store) => {
			ReactDOM.render(<AppLauncher />, document.getElementById("wrapper"));
		});
	});
});