var Dispatcher = require('flux').Dispatcher;
Dispatcher = new Dispatcher();

var EventEmitter = require('events').EventEmitter;
var assign = require('object-assign');
var request = require('superagent');
const constants = {};

var NotificationsCenterStore = assign({}, EventEmitter.prototype, {
	initialize: function () {
		
		FSBL.Clients.RouterClient.addListener("notificationCenter.toggle", function (error, response) {
			if (error) {
				Logger.system.log('notificationCenter toggle error: ' + JSON.stringify(error));
			} else {
				let window = FSBL.Clients.WindowClient.getCurrentWindow();        
				window.isShowing(function(showing) {
					if(showing){
						window.hide();
					} else {
						window.show(); //assumes window is already positioned correctly, if not then use LauncherClient.showWindow instead
					}
				});
			}
		});

	}
});

var Actions = {

};

//wait for FSBL to be ready before initializing.
FSBL.addEventListener('onReady', function(){
	NotificationsCenterStore.initialize();
});

module.exports.Store = NotificationsCenterStore;
module.exports.Actions = Actions;