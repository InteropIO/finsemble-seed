//-------------------------------------------------------------------------------------------
// Copyright 2012-2017 by ChartIQ, Inc.
// All rights reserved
//-------------------------------------------------------------------------------------------
(function(_exports){

	var CIQ=_exports.CIQ;
	var h2canvas;

	/**
	 * Manages chart sharing and uploading.
	 * @constructor
	 * @name CIQ.Share
	 */
	CIQ.Share=function(){};
	_exports.STXSocial=CIQ.Share;

	/**
	 * Creates a png image or canvas of the current chart and everything inside the container associated with the chart when it was instantiated; including HTML.
	 * Elements outside the chart container will **NOT** be included. 
	 * 
	 * It will dynamically try to load `js/thirdparty/html2canvas.js` if not already loaded.
	 *
	 * This function is asynchronous and requires a callback function. The callback will be passed
	 * a data object or canvas which can be sent to a server or converted to an image.
	 *
	 * By default this method will rely on HTML2Canvas to create an image which will rely on Promises. If your browser does not implement Promises, be sure to include a polyfill to ensure HTML2Canvas works properly.
	 *
	 * ** This method does not always work with React or Safari **
	 *
	 * **Canvases can only be exported if all the contents including CSS images come from the same domain,
	 * or all images have cross origin set properly and come from a server that supports CORS; which may or may not be possible with CSS images.**
	 *
	 * **Note when using the charts from `file:///` :**
	 * If your application will use this functionality in a `file:///` environment, make sure to include `html2canvas` statically instead of allowing this method to load it dynamically.
	 * <br>Example:
	 * <br>`<script src="js/thirdparty/html2canvas.js"></script>`
	 *
	 *
	 * @param {CIQ.ChartEngine} stx   Chart object
	 * @param {object} params
	 * @param {number} params.width
	 * @param {number} params.height
	 * @param {string} params.background
	 * @param {bolean} params.data If true returns the image data, otherwise, it returns the canvas
	 * @param {Array} params.hide Array of strings; array of the CSS selectors of the DOM elements to hide, before creating a PNG
	 * @param {Function} cb  Callback when image is available fc(error,data) where data is the serialized image object or canvas
	 * @name CIQ.Share.FullChart2PNG
	 * @since 4.0.0 Addition of `params.hide`
	 * @version ChartIQ Advanced Package plug-in
	 * @private
	 */

	CIQ.Share.FullChart2PNG=function(stx,params,cb){
		if(!stx || !stx.chart) return;
		//If we haven't loaded html2canvas, load it
		if(typeof html2canvas === "undefined")return loadHTML2Canvas(function(){
			return createHTML2Canvas(stx,params,cb);
		});
		h2canvas=html2canvas;
		createHTML2Canvas(stx,params,cb);
	};

	function createHTML2Canvas(stx,params,cb){
		if(!params) params = {};
		var recordsTurnedOff=[], ciqNoShare="ciq-no-share", body=document.querySelector("body");

		if (params.hide && params.hide instanceof Array) {
			var customHide = params.hide.join(", ");
			var hideItems = document.querySelectorAll(customHide);
			for (var idx=0; idx<hideItems.length;idx++){
				CIQ.appendClassName(hideItems[idx], ciqNoShare);
			}
		}
		// Combining ".sharing" and ".ciq-no-share" to display:none for selected elements
		CIQ.appendClassName(body, "sharing");

		h2canvas(stx.chart.container, {
			allowTaint:false,
			logging:false,
			width:params.width || null,
			height:params.height || null,
			backgroundColor:params.background || null,
			useCORS:true
		}).then(function(canvas){
			if(cb) {
				//return the full canvas if the data param is not true
				cb(null,params.data?canvas.toDataURL('image/png'):canvas);
			}
			CIQ.unappendClassName(body, "sharing");
		}).catch(function(error){
            if(cb) cb(error);
            CIQ.unappendClassName(body, "sharing");
		});
	}

	//Load HTML2Canvas dynamically. If html2canvas.js is already loaded (statically, webpacked or with require.js) then this will be skipped.
	// HTML2Canvas is rather heavy which is why we provide the option to load dynamically. It isn't really necessary to load this until
	// a user actually shares a chart.
	function loadHTML2Canvas(cb){
		//Make sure HTML2Canvas is not already loaded
		if(typeof html2canvas === "undefined" ){
			//If we have require, use it
			if(typeof requirejs !== "undefined"){
				try {
					return requirejs(["html2canvas"],function(h2){
						h2canvas = h2;
						return cb();
					});
				} catch(exception) {
					console.warn("Require loading has failed, attempting to load html2canvas manually.");
				}
			}

			// if no require then load directly
			CIQ.loadScript(getMyRoot() +"/html2canvas.js",function(){
				h2canvas = html2canvas;
				return cb();
			});
		}else{
			h2canvas = html2canvas;
			return cb();
		}
	}

	//Get the location of this file. Unbundled, this would be share.js. Bundled, this would be chartiq.js. When unbundled
	//we need to walk back up out of advanced. When bundled we don't need a root because thirdparty should be a relative
	//path.
	//Set CIQ.Share.html2canvasLocation to completely override this logic.
	function getMyRoot(){
		if(CIQ.Share.html2canvasLocation) return CIQ.Share.html2canvasLocation;
		var sc = document.getElementsByTagName("script");
		for(var idx = 0; idx < sc.length; idx++){
			var s = sc[idx];
			if(s.src && s.src.indexOf("share.js")>-1){
				return s.src.replace(/advanced\/share\.js/,"") + "thirdparty/";
			}
		}
		return "js/thirdparty/";
	}

	/**
	 * Creates a png image of the current chart and everything inside the container associated with the chart when it was instantiated; including HTML.
	 * Elements outside the chart container will **NOT** be included. 
	 * 
	 * If widthPX and heightPX are passed in then the image will be scaled to the requested dimensions.
	 * 
	 * It will dynamically try to load `js/thirdparty/html2canvas.js` if not already loaded.
	 *
	 * This function is asynchronous and requires a callback function. 
	 * The callback will be passed a data object or canvas which can be sent to a server or converted to an image.
	 *
	 * Important Notes:
	 * - ** This method will rely on Promises. If your browser does not implement Promises, be sure to include a polyfill.**
	 *
	 * - ** This method does not always work with React or Safari **
	 *
	 * - **Canvases can only be exported if all the contents including CSS images come from the same domain, 
	 * or all images have cross origin set properly and come from a server that supports CORS; which may or may not be possible with CSS images.**
	 *
	 * - **When using the charts from `file:///` :**
	 * If your application will use this functionality in a `file:///` environment, make sure to include `html2canvas` statically instead of allowing this method to load it dynamically.
	 * <br>Example:
	 * <br>`<script src="js/thirdparty/html2canvas.js"></script>`
	 *
	 * @param  {object}   stx           Chart object
	 * @param	 {object}		[parameters]			Parameters to describe the image.
	 * @param  {number}   [parameters.widthPX]       Width of image to create. If passed then params.heightPX  will adjust to maintain ratio.
	 * @param  {number}   [parameters.heightPX]      Height of image to create. If passed then params.widthPX will adjust to maintain ratio.
	 * @param  {string}   [parameters.imageType]   Specifies the file format your image will be output in. The dfault is PNG and the format must be suported by your browswer.
	 * @param {Array} 	[parameters.hide] Array of strings; array of the CSS selectors of the DOM elements to hide, before creating a PNG
	 * @param  {Function} cb            Callback when image is available fc(data) where data is the serialized image object
	 * @memberOf CIQ.Share
	 * @since
	 * <br>&bull; 3.0.0 Function signature changed to take parameters.
	 * <br>&bull; 4.0.0 Addition of `parameters.hide`
	 * @version ChartIQ Advanced Package plug-in
	 */
	//imageType is in its location so developers don't need to change their current code.
	CIQ.Share.createImage=function(stx, params, cb){
		var args = [].slice.call(arguments);
		cb=args.pop();
		if(params===null || typeof params!='object')params={widthPX:args[1], heightPX:args[2], imageType:args[3]};
		var widthPX=params.widthPX;
		var heightPX=params.heightPX;
		var imageType=params.imageType;

		// Set background for any part of canvas that is currently transparent NO LONGER NECESSARY????
		// CIQ.fillTransparentCanvas(stx.chart.context, stx.containerColor, stx.chart.canvas.width, stx.chart.canvas.height);

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
		}else if(heightPX){
			renderedWidth=stx.chart.canvas.width*(renderedHeight/stx.chart.canvas.height);
		}else if(widthPX){
			renderedWidth=widthPX;
			renderedHeight=stx.chart.canvas.height*(widthPX/stx.chart.canvas.width);
		}
		//var totalHeight=renderedHeight;
		var imageResult=imageType?"image/"+imageType:"image/png";
		// Render the canvas as an image
		var shareImage=document.createElement("img");
		shareImage.onload = function(){
			// Print the image on a new canvas of appropriate size
			CIQ.Share.FullChart2PNG(stx,{image:this,width:renderedWidth,height:renderedHeight, hide:params.hide},function(err,canvas){
				try{
					cb(canvas.toDataURL(imageResult)); // return the data
				} catch(e){
					console.warn("Safari devices do not handle CORS enabled images. Using the charts' canvas as a fallback.");
					cb(shareImage.src);
				}
			});
		};
		shareImage.src=stx.chart.canvas.toDataURL(imageResult);
	};

	/**
	 * Uploads an image to a server. The callback will take two parameters. The first parameter is an error
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
	 * @version ChartIQ Advanced Package plug-in
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
	 * Convenience function that serves as a wrapper for createImage and uploadImage.
	 * It will create an image using the default parameters. If you wish to customize the image you must use {@link CIQ.Share.createImage} separately and then call {@link CIQ.Share.uploadImage}.
	 * (example python code available in our {@tutorial Chart Sharing} tutorial.
	 * @param {object}	stx Chart Object
	 * @param {object}  [override] Parameters that overwrite the default hosting location from https://share.chartiq.com to a custom location.
	 * @param {object}	[override.host]
	 * @param {object}	[override.path]
	 * @param {function}	cb Callback when the image is uploaded.
	 * @memberof CIQ.Share
	 * @since 2015-11-01
	 * @example
	 *  // here is the exact code this convenience function is using
		CIQ.Share.createImage(stx, {}, function(imgData){
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
				"drawings": stx.exportDrawings(),
				"xOffset": startOffset,
				"startDate": stx.chart.dataSegment[startOffset].Date,
				"endDate": stx.chart.dataSegment[stx.chart.dataSegment.length-1].Date,
				"id": id,
				"symbol": stx.chart.symbol
			};
			var payload={"id": id, "image": imgData, "config": metaData};
			CIQ.Share.uploadImage(imgData, url, payload, function(err, response){
				if(err!==null){
					CIQ.alert("error sharing chart: ",err);
				}else{
					cb(host+response);
				}
			});
			// end sample code to upload image to a server
		});
	 * 
	 */
	CIQ.Share.shareChart=function(stx, override, cb){
		CIQ.Share.createImage(stx, {}, function(imgData){
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
				"drawings": stx.exportDrawings(),
				"xOffset": startOffset,
				"startDate": stx.chart.dataSegment[startOffset].Date,
				"endDate": stx.chart.dataSegment[stx.chart.dataSegment.length-1].Date,
				"id": id,
				"symbol": stx.chart.symbol
			};
			var payload={"id": id, "image": imgData, "config": metaData};
			CIQ.Share.uploadImage(imgData, url, payload, function(err, response){
				if(err!==null){
					CIQ.alert("error sharing chart: ",err);
				}else{
					cb(host+response);
				}
			});
			// end sample code to upload image to a server
		});
	};

	return _exports;
})/* removeIf(umd) */(typeof window !== 'undefined' ? window : global)/* endRemoveIf(umd) */;
