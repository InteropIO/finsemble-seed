var merge = require('deepmerge');

/**
 * The CompoundWindow joins a header window with a foreign window to create a single virtual window
 * that can be treated with the same interface as an OpenFin window.
 *
 * @param {any} options
 * @param {any} callback 
 * @param {any} errorCallback 
 *	@constructor
 */

function CompoundWindow(options, callback, errorCallback) {
	var self = this;
	this.header = null;
	this.foreign = null;

	this.construct = function () {
		var headerOptions = merge({}, options);
		var foreignOptions = merge({}, options);

		var headerConfig = options.headerConfig;
		
		// Adjust height and position of windows so that the header is stacked on the foreign
		headerOptions.defaultHeight = headerConfig.window.height;
		headerOptions.name = headerOptions.name + "_header";
		headerOptions.url = headerConfig.window.url;
		headerOptions.resizable = false;
		headerOptions.showTaskbarIcon = false;
		headerOptions.customData = merge({}, headerConfig); // The header has it's own customData

		foreignOptions.defaultHeight = foreignOptions.defaultHeight - headerOptions.defaultHeight;
		foreignOptions.defaultTop = foreignOptions.defaultTop + headerOptions.defaultHeight;

		console.log("headerOptions", headerOptions);
		console.log("foreignOptions", foreignOptions);
		// First create a header
		self.header = new fin.desktop.Window(headerOptions, function () {
			// If that is successful then create the foreign window
			self.foreign = new fin.desktop.Window(foreignOptions, function (result) {
				self.header.joinGroup(self.foreign);
				callback(result);
			}, function (error) {
				// If the foreign window fails, close the header and report the error
				self.header.close();
				errorCallback(error);
			});
		}, function (error) {
			// If the header window fails, report the error
			errorCallback(error);
		});
	};

	this.addEventListener=function(type, listener, callback, errorCallback){
	};

	this.animate=function(transitions, options, callback, errorCallback){
		setTimeout(callback,0);
	};

	this.blur=function(callback, errorCallback){};

	this.bringToFront=function(callback, errorCallback){};

	this.close=function(force, callback, errorCallback){
	};

	this.disableFrame=function(callback, errorCallback){};

	this.enableFrame=function(callback, errorCallback){};

	this.focus=function(callback, errorCallback){};

	this.getBounds=function(callback, errorCallback){};

	this.getOptions=function(callback, errorCallback){
	};

	this.hide=function(callback, errorCallback){
	};

	this.isShowing=function(callback, errorCallback){};

	this.moveTo=function(left, top, callback, errorCallback){};

	this.removeEventListener=function(type, listener, callback, errorCallback){};

	this.resizeTo=function(width, height, anchor, callback, errorCallback){};

	this.setBounds=function(left, top, width, height, anchor, callback, errorCallback){
		this.resizeTo(width, height, function(){
			self.moveTo(left, top, function(){
				callback();
			}, function(err){
				errorCallback(err);
			});
		}, function(err){
			errorCallback(err);
		});
	};

	this.show=function(force, callback, errorCallback){};

	this.showAt=function(left, top, force, callback, errorCallback){
		this.moveTo(left, top, function(){
			this.show(force, function(){
				callback();
			}, function(err){
				errorCallback(err);
			});
		}, function(err){
			errorCallback(err);
		});
	};
	
	this.wrap = function (appUuid, windowName) {
		
	};

	this.construct();
};

module.exports = CompoundWindow;