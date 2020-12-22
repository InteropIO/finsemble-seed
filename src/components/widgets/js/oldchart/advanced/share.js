//-------------------------------------------------------------------------------------------
// Copyright 2012-2016 by ChartIQ, Inc.
// All rights reserved
//-------------------------------------------------------------------------------------------

(function (definition) {
	"use strict";

	if (typeof exports === "object" && typeof module === "object") {
		module.exports = definition( require('../core/master') );
	} else if (typeof define === "function" && define.amd) {
		define(["core/master"], definition);
	} else if (typeof window !== "undefined" || typeof self !== "undefined") {
		var global = typeof window !== "undefined" ? window : self;
		definition(global);
	} else {
		throw new Error("Only CommonJS, RequireJS, and <script> tags supported for share.js.");
	}
})(function(_exports){
	console.log("share.js",_exports);
	var CIQ=_exports.CIQ;

	CIQ.Share=function(){};

	_exports.STXSocial=CIQ.Share;

	/**
	 * Base class for a decorator. A decorator adds custom branding to a chart image before it is rendered.
	 * 
	 * The decoration function will be called right after the chart image is created to overlay any additional 'decorations' you may want to have on that image.
	 * The default decoration function can be found in stx-share.js (CIQ.Share.defaultDecorator.decorate). 
	 * Feel free to modify as needed or create a new one based on it by setting `CIQ.Share.defaultDecorator.decorate` to the name of your custom decoration function.
	 * 
	 * For example, if you want to have a watermark logo on the shared image but not the interactive chart, 
	 * you will have to do it as a decoration rather than using {@link CIQ.Share.brandMyChart}.
	 * 
	 * To do this, first add a hidden div in your HTML to store the watermark picture.
	 * Example (change the image link to whatever you will use):
	 * ```
	 * <img id="shareWatermark" src="img/helicopter.png" style="display:none">
	 * ```
	 * Then you can take the default decoration function in stx-share.js (CIQ.Share.defaultDecorator.decorate) and add the following to it:
	 * ```
	 * var img = document.getElementById("shareWatermark");
	 * context.drawImage(img, 10, stx.panels.chart.height-50, 60,60);  //Parameters are: image. x axis, y axis, width, hight.
	 * ```
	 * Adjust the location and size as needed. You should be all set.
	 * 
	 * Be sure to set the pixel count you want to use for the header and footer. 
	 * These amounts will be used to reduce the size of the chart and leave space for the additional decorations you will place as footer or headers.
	 * This is done in the `CIQ.Share.defaultDecorator.initialize` function. 
	 * Feel free to modify as needed or create a new one based on it by setting `CIQ.Share.defaultDecorator.initialize` to the name of your custom initialization function.
	 * The values to be set are:
	 * ```
	 * 	this.headerPX=headerSize;
	 *	this.footerPX=footerSize;
	 * ```
	 * 
	 * @constructor
	 * @name CIQ.Share.Decoration
	 * @version ChartIQ plug-in
	 */
	CIQ.Share.Decoration=function(){
		this.initialize=function(stx, canvas, widthPX, heightPX){};	// Override this with a function to calculate and store header and footer pixels
		this.headerPX=0;
		this.footerPX=0;
		this.decorate=function(stx, context){};	// Override this with a function to actually decorate the canvas
	};
	
	
	/**
	 * Create a png image based on the current chart. If widthPX and heightPX are passed in
	 * then the image will be scaled to the requested dimensions.
	 * This function is asynchronous and requires a callback function. The callback will be passed
	 * a data object which can be sent to a server or converted to an image.
	 * [decorationObj]{@link CIQ.Share.Decoration} can be used to "decorate" the canvas. For instance, you can add a header
	 * or footer to the canvas, or even brand it with an image if you only want the branding done on the shared image but not on the chart itself.
	 * @param  {object}   stx           Chart object
	 * @param  {number}   [widthPX]       Width of image to create. If passed then height will adjust to maintain ratio.
	 * @param  {number}   [heightPX]      Height of image to create. If passed then width will adjust to maintain ratio.
	 * @param  {object}   [decorationObj=defaultDecorator] A decorator to add custom branding. Pass {} to not use the defaultDecorator.
	 * @param  {Function} cb            Callback when image is available fc(data) where data is the serialized image object
	 * @memberOf CIQ.Share
	 * @version ChartIQ plug-in
	 */
	CIQ.Share.createImage=function(stx, widthPX, heightPX, decorationObj, cb){
		if(!decorationObj) decorationObj=CIQ.Share.defaultDecorator;
		if(!decorationObj.initialize) decorationObj=null;
		
		// Compute and/or determine sizes of headers and footers for decorator
		if(decorationObj){
			decorationObj.initialize(stx, stx.chart.canvas, widthPX, heightPX);
		}
		
		// Set background for any part of canvas that is currently transparent
		CIQ.fillTransparentCanvas(stx.chart.context, stx.containerColor, stx.chart.canvas.width, stx.chart.canvas.height);
		
		// Render panel labels
		CIQ.Share.watermarkPanels(stx);
		
		// We use style height/width instead of the canvas width/height when the backing store is 2x on retina screens
		var renderedHeight=stx.chart.canvas.height;
		var renderedWidth=stx.chart.canvas.width;
		if(stx.chart.canvas.style.height){
			renderedHeight=CIQ.stripPX(stx.chart.canvas.style.height);
			renderedWidth=CIQ.stripPX(stx.chart.canvas.style.width);
		}
		if(widthPX && heightPX){
			renderedHeight=heightPX;
			renderedWidth=widthPX;
			if(decorationObj){
				renderedHeight=renderedHeight-decorationObj.headerPX-decorationObj.footerPX;
			}
		}else if(heightPX){
			if(decorationObj){
				renderedHeight=heightPX-decorationObj.headerPX-decorationObj.footerPX;
			}
			renderedWidth=stx.chart.canvas.width*(renderedHeight/stx.chart.canvas.height);
		}else if(widthPX){
			renderedWidth=widthPX;
			renderedHeight=stx.chart.canvas.height*(widthPX/stx.chart.canvas.width);
			if(decorationObj){
				renderedHeight=renderedHeight+decorationObj.headerPX + decorationObj.footerPX;
			}
		}
		var totalHeight=renderedHeight;
		var y=0;
		if(decorationObj){
			totalHeight=totalHeight+decorationObj.headerPX + decorationObj.footerPX;
			y=decorationObj.headerPX;
		}
	
		// Render the canvas as an image
		var shareImage=document.createElement("img");
		shareImage.onload = function(){
			// Print the image on a new canvas of appropriate size
			var canvas=document.createElement("canvas");
			canvas.width=renderedWidth;
			canvas.height=totalHeight;
			var context=canvas.getContext("2d");
			stx.adjustBackingStore(canvas, context);
			CIQ.fillTransparentCanvas(context, "#FFFFFF", canvas.width, canvas.height);
			context.drawImage(this, 0, 0, stx.chart.canvas.width, stx.chart.canvas.height, 0, y, renderedWidth, renderedHeight);
	
			// Add any decorations
			if(decorationObj){
				decorationObj.decorate(stx, context);
			}
			stx.draw();	// redraw the canvas to get rid of the watermark panels
	
			cb(canvas.toDataURL("image/png"));	// return the data
		};
		shareImage.src=stx.chart.canvas.toDataURL("image/png");
	};
	
	
	// BEGIN Copy and paste this to your own decorator to customize the image headers and footers
	CIQ.Share.defaultDecorator=new CIQ.Share.Decoration();
	CIQ.Share.defaultDecorator.initialize=function(stx, canvas, widthPX, heightPX){
		this.headerPX=50;
		this.footerPX=0;
	};
	CIQ.Share.defaultDecorator.decorate=function(stx, context){
		var cursor=10;
		var centerLine=24;
		context.textBaseline="middle";
		stx.canvasColor("stx_share", context);
		stx.canvasFont("stx_share_symbol", context);
		var w=context.measureText(stx.chart.symbol).width;
		context.fillText(stx.chart.symbol, cursor, centerLine);
		
		cursor+=w+5;	
		stx.plotLine(cursor, cursor, centerLine-8, centerLine+8, stx.canvasStyle("stx_share"), "segment", context);
		
		cursor+=5;
		
		stx.canvasFont("stx_share", context);
		var txt=CIQ.mmddyyyy(stx.chart.dataSegment[stx.getStartDateOffset()].Date) + "-" + CIQ.mmddyyyy(stx.chart.dataSegment[stx.chart.dataSegment.length-1].Date);
		w=context.measureText(txt).width;
		context.fillText(txt, cursor, centerLine);
	
		cursor+=w+5;
		stx.plotLine(cursor, cursor, centerLine-8, centerLine+8, stx.canvasStyle("stx_share"), "segment", context);
	
		cursor+=5;
		txt=CIQ.readablePeriodicity(stx);
		context.fillText(txt, cursor, centerLine);
		context.textBaseline="alphabetic";
	};
	// END copy and paste
	
	
	
	/**
	 * Uploads an image to a server. See {@tutorial Python chart-sharing server example} for a comple server code.
	 * on the server side. The callback will take two parameters. The first parameter is an error
	 * condition (server status), or null if there is no error. The second parameter (if no error) will contain
	 * the response from the server.
	 * 'payload' is an optional object that contains meta-data for the server. If payload exists then the image will be added as a member of the payload object, otherwise an object will be created
	 * 'dataImage' should be a data representation of an image created by the call canvas.toDataURL such as is returned by CIQ.Share.createImage
	 * If you are getting a status of zero back then you are probably encountering a cross-domain ajax issue. Check your access-control-allow-origin header on the server side
	
	 * @param  {string}   dataImage Serialized data for image
	 * @param  {string}   url       URL to send the image
	 * @param  {object}   [payload]   Any additional data to send to the server should be sent as an object.
	 * @param  {Function} cb        Callback when image is uploaded
	 * @memberOf CIQ.Share
	 * @version ChartIQ plug-in
	 */
	CIQ.Share.uploadImage=function(dataImage, url, payload, cb){
		if(!payload) payload={};
		payload.image=dataImage;
		var valid=CIQ.postAjax(url, JSON.stringify(payload), function(status, response){
			if(status!=200){
				cb(status, null);
				return;
			}
			cb(null, response);
		});
		if(!valid) cb(0, null);
	};

	/**
	 * The panel names in charts are div tags which will not render as images.
	 * This method will draw the panel names on the canvas itself. It is called
	 * temporarily when creating an image.
	 * @param  {object} stx The chart
	 * @memberOf CIQ.Share
	 * @version ChartIQ plug-in
	 */
	CIQ.Share.watermarkPanels=function(stx){
		//stx.chart.context.font="12px Helvetica";
		//stx.chart.context.strokeStyle="#7c878b";
		stx.canvasFont("stx_panels");
		stx.chart.context.globalAlpha=1;
		stx.chart.context.textBaseline="alphabetic";
		stx.chart.context.textAlign="left";
		var first=false;
		for(var p in stx.panels){
			var panel=stx.panels[p];
			if(panel.hidden) continue;
			if(panel.name=="chart") continue;
			stx.canvasColor("stx_panel_background");
			stx.chart.context.font=getComputedStyle(panel.title).font;
			var t=panel.top + panel.icons.offsetTop;
			var w=stx.chart.context.measureText(panel.title.innerHTML.toUpperCase()).width;
			CIQ.semiRoundRect(stx.chart.context, 0, t+4, w+6, 20, 5, true);
	
			stx.canvasColor("stx_panels");
			stx.chart.context.fillText(panel.title.innerHTML.toUpperCase(), panel.icons.offsetLeft+4, t+18);
		}	
	};
	
	/*
	 * Here's an example of how you can display the image on the screen. Create a real dialog using HTML if you want to use this.
	 */
	CIQ.Share.displayImageExample=function(imgData){
		var div=document.createElement("div");
		div.style.margin="0 auto";
		div.style.width="1000px";
		div.style.border="solid black 3px";
		div.style.zIndex=100;
		div.style.position="relative";
		div.style.top="-500px";
	
		var img=document.createElement("img");
		img.onload=function(){
			div.appendChild(img);
			document.body.appendChild(div);			
		};
		img.src=imgData;
	};
	
	/**
	 * Places a watermark image on the chart for branding. This method should only be called once after you create your chart object -new CIQ.ChartEngine()-.
	 * @param  {object} stx         The chart
	 * @param  {string} imageURL    The URL of the image
	 * @param  {array} positioning A tuple. The first item of the tuple is the X offset from the edge of the chart. The second item is the Y offset from the top of the chart. Use negative numbers to offset from right of chart or bottom of chart.
	 * @param  {array} size A tuple. The first item of the tuple is the width. The second item is the height. Leave out to use actual size.
	 * @memberOf CIQ.Share
	 * @version ChartIQ plug-in
	 * @example
	 * function runSampleUI(){
	 * 		// put your code to establish the behavior of your UI.
	 * 		CIQ.Share.brandMyChart(stxx, "logo.png",[10,-30],[50,50]);
	 * }
	 * @since  2016-03-11 Image size can now be specified using the new `size` argument
	 */
	CIQ.Share.brandMyChart=function(stx, imageURL, positioning, size){
		function prependDisplayChart(stx, image, positioning,size){
			return function(){
				var width=image.width;
				var height=image.height;
				if(size){
					width=size[0];
					height=size[1];
				}
				var x=stx.chart.canvasWidth/2-width/2;
				var y=stx.panels.chart.height/2-height/2;
				if(positioning){
					if(positioning[0]>0){
						x=positioning[0];
					}else{
						x=stx.chart.width-width+positioning[0];
					}
					if(positioning[1]>0){
						y=positioning[1];
					}else{
						y=stx.panels.chart.height-height+positioning[1];
					}
				}
				stx.chart.context.drawImage(image, x, stx.panels.chart.top+y, width, height);
			};
		}
	
		var image=document.createElement("img");
		image.onload=function(stx, prependDisplayChart, positioning){
			return function(){
				CIQ.ChartEngine.prototype.prepend("displayChart", prependDisplayChart(stx, this, positioning, size));
				stx.draw();
			};
		}(stx, prependDisplayChart, positioning);
		image.src=imageURL;
	};

	/*
	 * Here's an example implementation of chart sharing upload.
	 * (example python code available in our tutorials (http://chartiq.com/licensing/documentation/tutorial-Chart Sharing.html)
	 */
	CIQ.Share.shareChart=function(stx, override, successCB, failureCB){
		CIQ.Share.createImage(stx, null, null, null, function(imgData){
			var id=CIQ.uniqueID();
			var host="https://share.chartiq.com";
			var url= host + "/upload/" + id;
			if(override){
				if(override.host) host=override.host;
				if(override.path) url=host+override.path+"/"+id;
			}
			var startOffset=stx.getStartDateOffset();
			var metaData={
				"layout": stx.exportLayout(),
				"drawings": stx.serializeDrawings(),
				"xOffset": startOffset,
				"startDate": stx.chart.dataSegment[startOffset].Date,
				"endDate": stx.chart.dataSegment[stx.chart.dataSegment.length-1].Date,
				"id": id,
				"symbol": stx.chart.symbol
			};
			var payload={"id": id, "image": imgData, "config": metaData};
			CIQ.Share.uploadImage(imgData, url, payload, function(err, response){
				if(err!==null){
					failureCB(err);
				}else{
					successCB(host+response);
				}
			});
			// end sample code to upload image to a server
		});
	};

	return _exports;
});