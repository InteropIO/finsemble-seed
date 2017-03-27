var Finsemble = require('finsemble');
var RouterClient = Finsemble.Clients.RouterClient;
var BaseClient = Finsemble.Clients.BaseClient;
var WindowClient = Finsemble.Clients.WindowClient;
var DialogManager = Finsemble.Clients.DialogManager;

var util = Finsemble.Utils;
var console = new util.Console("BaseClient"); // Finsemble console
var Validate = Finsemble.Validate; // Finsemble args validator

/**
 * 
 * The launcher client handles spawning windows for the application.
 * @constructor
 */
function testClient(params) {
	BaseClient.call(this, params);
	Validate.args(params, "object=") && params && Validate.args2("params.onReady", params.onReady, "function=");

	console.log('holaaa!');
	this.spawnADialog = function () {
		DialogManager.spawnDialog({
			defaultTop: 'center',
			defaultLeft: 'center',
			defaultWidth: 350,
			defaultHeight: 125,
			url: '/components/dialogs/yesNo.html'

		},
		{
			question: 'Would you like to close this window?'
		}, function (err, response) {
			if (err) {
				console.error(err);
				return;
			}
			if (response.choice === 'affirmative') {
				WindowClient.close();
			}
		});
	}

	return this;
};


var clientInstance = new testClient({
	onReady: function (cb) {
		cb();
	},
	name: "testClient"
});
clientInstance.requiredServices = [];

module.exports = clientInstance;