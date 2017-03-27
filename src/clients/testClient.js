var Finsemble = require('@chartiq/finsemble');
var RouterClient = Finsemble.Clients.RouterClient;
var BaseClient = Finsemble.Clients.BaseClient;
var WindowClient = Finsemble.Clients.WindowClient;
var DialogManager = Finsemble.Clients.DialogManager;

var util = Finsemble.Utils;
var console = new util.Console("BaseClient"); // Finsemble console
var Validate = Finsemble.Validate; // Finsemble args validator

//TERRY: I don't think this is a good example of a client. A client should demonstrate interaction with it's service counterpart.
// A classic example service is a random string generator. You'll see that all the time in books and it would work here as well.
// I wouldn't want to mislead people into thinking that the dialog manager should be used through a client rather than directly by a component.
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