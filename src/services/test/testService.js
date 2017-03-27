var Finsemble = require('@chartiq/finsemble');
var baseService = Finsemble.baseService;

/**
 * @namespace
 * @property {Object} 
 * @property {string}
 */
function TestService() {
	var self = this;

	this.initialize = function (cb) {
		cb();
	};

};

TestService.prototype = new baseService();
var testService = new TestService("TestService");


testService.setOnConnectionComplete(function (callback) {
	testService.initialize(function () {
		callback();
	});
});

testService.start();
window.testService = testService;

