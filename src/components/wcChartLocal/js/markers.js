//-------------------------------------------------------------------------------------------
// Copyright 2012-2017 by ChartIQ, Inc.
// All rights reserved
//-------------------------------------------------------------------------------------------
(function(_exports){
	var CIQ=_exports.CIQ;

	/**
	 * The markerHelper is a private object that we use for placeholder values, primarily as a performance aid
	 * @private
	 * @memberOf CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.makeMarkerHelper=function(){
		this.markerHelper={
			chartMap:{},
			classMap:{}
		};
	};

	/**
	 * Adds a marker to the chart
	 * @private
	 * @memberOf CIQ.ChartEngine
	 * @param {CIQ.Marker} marker The marker to add
	 */
	CIQ.ChartEngine.prototype.addToHolder=function(marker){
		var panel=this.panels[marker.params.panelName];
		if(!panel) return;

		// Switcheroo. If a NodeCreator is passed in, then we change the marker
		// to reference the actual DOM node and then we add stxNodeCreator to the
		// marker so that we can reference it if need be
		if(CIQ.derivedFrom(marker.params.node, CIQ.Marker.NodeCreator)){
			marker.stxNodeCreator=marker.params.node;
			marker.node=marker.stxNodeCreator.node;
		}else{
			marker.node=marker.params.node;
		}

		if(!this.markerHelper) this.makeMarkerHelper();


		if(marker.params.chartContainer){
			this.container.appendChild(marker.node);
		}else if(marker.params.includeAxis){
			panel.holder.appendChild(marker.node);
		}else{
			panel.subholder.appendChild(marker.node);
		}

		var label=marker.params.label;
		if(!this.markers[label]) this.markers[label]=[];
		this.markers[label].push(marker);

		marker.chart=panel.chart;

		// Put it in the map of charts
		if(!this.markerHelper.chartMap[marker.chart.name]){
			this.markerHelper.chartMap[marker.chart.name]={
				dataSetLength: 0,
				markers: []
			};
		}
		this.markerHelper.chartMap[marker.chart.name].markers.push(marker);

		// Put it in the map of placement functions
		if(!marker.className){
			console.log("Marker objects must have a member className");
		}
		var classMap=this.markerHelper.classMap[marker.className];
		if(!classMap) classMap=this.markerHelper.classMap[marker.className]={};
		if(!classMap[marker.params.panelName]) classMap[marker.params.panelName]=[];
		classMap[marker.params.panelName].push(marker);

		this.setMarkerTick(marker);
	};

	/**
	 * Gets an array of markers
	 * @private
	 * @param {string} type The type of comparison "panelName","label","all"
	 * @param {string} comparison The value to compare to
	 * @return {array} The marker array
	 */
	CIQ.ChartEngine.prototype.getMarkerArray=function(type, comparison){
		var arr=[];
		for(var label in this.markers){
			for(var i=0;i<this.markers[label].length;i++){
				var marker=this.markers[label][i];
				if(type=="panelName"){
					if(marker.params.panelName==comparison) arr.push(marker);
				}else if(type=="label"){
					if(label==comparison) arr.push(marker);
				}else if(type=="all"){
					arr.push(marker);
				}
			}
		}
		return arr;
	};
	/**
	 * Removes the marker from the chart
	 * @private
	 * @param  {CIQ.Marker} marker The marker to remove
	 * @memberOf CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.removeFromHolder=function(marker){
		var panel=this.panels[marker.params.panelName];
		if(panel) {
			if(marker.node.parentNode==panel.holder) panel.holder.removeChild(marker.node);
			else if(marker.node.parentNode==panel.subholder) panel.subholder.removeChild(marker.node);
			else if(marker.node.parentNode==this.container) this.container.removeChild(marker.node);
		}
		// Remove from label map
		var labels=this.markers[marker.params.label];
		if(!labels) return;
		var i;
		for(i=0;i<labels.length;i++){
			if(labels[i]===marker){
				labels.splice(i,1);
				break;
			}
		}

		// remove from chart map
		var chartMap=this.markerHelper.chartMap[marker.chart.name];
		if(chartMap){
			for(i=0;i<chartMap.markers.length;i++){
				if(chartMap.markers[i]===marker){
					chartMap.markers.splice(i,1);
					break;
				}
			}
		}

		// remove from class map
		var classMap=this.markerHelper.classMap[marker.className];
		if(classMap){
			var panelArray=classMap[marker.params.panelName];
			if(panelArray){
				for(i=0;i<panelArray.length;i++){
					if(panelArray[i]===marker){
						panelArray.splice(i,1);
						break;
					}
				}
			}
		}
	};

	/**
	 * Moves the markers from one panel to another
	 * Useful when renaming panels
	 * @param  {string} fromPanelName The panel to move markers from
	 * @param  {string} toPanelName The panel to move markers to
	 * @memberOf CIQ.ChartEngine
	 * @since 2016-07-16
	 */
	CIQ.ChartEngine.prototype.moveMarkers=function(fromPanelName,toPanelName){
		var arr=this.getMarkerArray("panelName", fromPanelName);
		for(var i=0;i<arr.length;i++){
			arr[i].params.panelName=toPanelName;
		}
		for(var className in this.markerHelper.classMap){
			var tmp=this.markerHelper.classMap[className][fromPanelName];
			if(tmp){
				this.markerHelper.classMap[className][toPanelName]=tmp;
				delete this.markerHelper.classMap[className][fromPanelName];
			}
		}
	};

	/**
	 * Establishes the tick value for any markers that have a "date" specified. It tries to be efficient, not recalculating
	 * unless the size of the dataSet for a chart has actually changed
	 * @private
	 * @memberOf CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.establishMarkerTicks=function(){
		if(!this.markerHelper) this.makeMarkerHelper();
		var chartMap=this.markerHelper.chartMap;
		for(var chart in chartMap){
			var chartEntry=chartMap[chart];
			if(chartEntry.dataSetLength==this.charts[chart].dataSet.length) continue;
			for(var i=0;i<chartEntry.markers.length;i++){
				this.setMarkerTick(chartEntry.markers[i]);
			}
		}
	};

	/**
	 * Figures out the position of a future marker but only if it is displayed on the screen.
	 * @param  {CIQ.Marker} marker The marker to check
	 * @memberOf CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.futureTickIfDisplayed=function(marker){
		var chart=marker.chart;
		if(chart.dataSet.length<1) return;
		var xaxisDT=chart.xaxis[chart.xaxis.length-1].DT;

		xaxisDT=new Date(xaxisDT.getTime()-this.timeZoneOffset*60000);
		if(marker.params.x>xaxisDT) return; // not displayed on screen yet

		// It should be displayed on the screen now so find the exact tick
		var futureTicksOnScreen=chart.maxTicks-chart.dataSegment.length;
		var ticksToSearch=chart.dataSet.length+futureTicksOnScreen;
		var pms, qms;
		var dt=new Date(+chart.dataSet[chart.dataSet.length-1].DT);

		var iter = this.standardMarketIterator(dt, null, chart);

		var dms=marker.params.x.getTime();
		for(var j=chart.dataSet.length;j<ticksToSearch;j++){
			pms=dt.getTime();
			dt = iter.next();
			qms=dt.getTime();
			// If the event lands on that day, or if the event landed between bars
			if(qms==dms){
				marker.tick=j;
				return;
			}else if(qms>dms && pms<dms){
				marker.tick=Math.max(j-1,0);
				return;
			}
		}
	};

	/**
	 * Establishes the tick value for the specified marker. We do this to avoid calculating the date every time we want
	 * to place the marker. Converting date to tick is a very expensive operation!
	 * @param {CIQ.Marker} marker The marker for which to establish the tick
	 * @private
	 * @memberOf CIQ.ChartEngine
	 */
	CIQ.ChartEngine.prototype.setMarkerTick=function(marker){
		var chart=marker.chart;
		if(marker.params.xPositioner=="master" && marker.params.x){
			marker.tick=Math.floor(marker.params.x/this.layout.periodicity);
			return;
		}else if(marker.params.xPositioner=="date" && marker.params.x){
			var pms, qms;
			// TODO, use binary search for finding date
			var dms=marker.params.x.getTime();
			for(var i=0;i<chart.dataSet.length;i++){
				var quotes=chart.dataSet[i];
				qms=quotes.DT.getTime();
				pms=qms;
				if(i>0) pms=chart.dataSet[i-1].DT.getTime();
				// If the event lands on that day, or if the event landed between bars
				if(qms==dms){
					marker.tick=i;
					return;
				}else if(qms>dms && pms<dms){
					marker.tick=Math.max(i-1,0);
					return;
				}else if(dms<qms){
					marker.tick=null;
					// marker date is in distant past, shortcircuit the logic for performance.
					return;
				}
			}
			if(chart.dataSet.length<1) return;
			var dt=new Date(+chart.dataSet[i-1].DT);
			if(dt.getTime()<dms) marker.params.future=true;
			marker.tick=null; // reset in case we had figured it out with an earlier dataset
		}
	};

	/**
	 * <span class="injection">INJECTABLE</span>
	 * <span class="animation">Animation Loop</span>
	 * Iterates trough all marker handlers, calling their corresponding custom `placementFunction` or {@link CIQ.ChartEngine#defaultMarkerPlacement} if none defined.
	 * @memberOf CIQ.ChartEngine.AdvancedInjectable#
	 * @alias positionMarkers
	 */
	CIQ.ChartEngine.prototype.positionMarkers=function(){
		var self=this;
		if(!self.markerHelper) return;

		function draw(){
			if(self.runPrepend("positionMarkers", arguments)) return;
			self.markerTimeout=null;
			for(var className in self.markerHelper.classMap){
				for(var panelName in self.markerHelper.classMap[className]){
					var arr=self.markerHelper.classMap[className][panelName];
					var panel=self.panels[panelName];
					if(arr.length){
						var params={
							stx : self,
							arr : arr,
							panel : panel
						};
						params.firstTick=panel.chart.dataSet.length-panel.chart.scroll;
						params.lastTick=params.firstTick+panel.chart.dataSegment.length;


						var fn=arr[0].constructor.placementFunction; // Some magic, this gets the static member "placementFunction" of the class (not the instance)
						if(fn){
							(fn)(params);
						}else {
							self.defaultMarkerPlacement(params);
						}
					}
				}
			}
			self.runAppend("positionMarkers", arguments);
		}

		if(this.markerDelay || this.markerDelay===0){
			if(!this.markerTimeout) this.markerTimeout=setTimeout(draw, this.markerDelay);
		}else{
			draw();
		}
	};


	/**
	 * A marker is a DOM object that is managed by the chart. Makers are placed in "holders" which are
	 * DIV elements whose placement and size corresponds with a panel on the chart.
	 * A holder exists for each panel.
	 * Markers are placed by date, tick or bar to control their position on the x-axis.
	 * They are placed by value (price) to control their position on the y-axis.
	 * Markers will be repositioned when the user scrolls or zooms the chart.
	 *
	 * The default placement function for any markers is {@link CIQ.ChartEngine#defaultMarkerPlacement}, but custom placement functions can be created as needed.
	 *
	 * If markers must be part of an exported image generated using the {@link CIQ.Share} plug-in, you need to draw them on the actual canvas instead using [Canvas Markers](tutorial-Popular%20API%20Injections.html#marker).
	 *
	 * See the {@tutorial Markers} tutorials for additional implementation instruction, and details for managing  performance on deployments requiring a large number of markers.
	 *
	 * @name CIQ.Marker
	 * @param {Object} params Parameters that describe the marker
	 * @param {CIQ.ChartEngine} params.stx The chart to attach the marker
	 * @param {*} params.x A valid date, date string, tick or bar (depending on selected xPositioner) to select a candle to attach to.
	 * @param {Number} params.y A valid value for positioning on the y-axis (depending on selected yPositioner, if missing the marker will be set "above_candle" as long as a valid candle is selected by `params.x`)
	 * @param {HTMLElement} [params.node] The HTML element. This should be detached from the DOM! If none passed then a blank div will be created.
	 * @param {string} params.panelName="chart" The name of the panel to attach the holder. Defaults to the main chart panel.
	 * @param {string} [params.xPositioner="date"] Determines the x position.
	 * Values are:
	 * - "date" (`params.x` must be set to a JavaScript date)
	 * - "master" (`params.x` must be set to a masterData position)
	 * - "bar" (`params.x` must be set to a dataSegment position)
	 * - "none" (use CSS positioning, `params.x` will not be used)
	 * @param {string} [params.yPositioner="value"] Determines the y position.
	 * Values are:
	 * - "value" (`params.y` must be set to an exact y axis value.  If `params.y` is omitted, the y position will default to above_candle)
	 * - "above_candle" (right above the candle or line. If more than one on same position, they will align upwards from the first. `params.y` will not be used)
	 * - "under_candle" (right under the candle or line. If more than one on same position, they will align downwards from the first. `params.y` will not be used)
	 * - "on_candle" (in the center or the candle or line - covering it. If more than one on same position, they will align downwards from the first. `params.y` will not be used)
	 * - "top" (on top of the chart, right under the margin. If more than one on same position, they will align downwards from the first. `params.y` will not be used)
	 * - "bottom" ( on the bottom of the chart, right over the margin. If more than one on same position, they will align upwards from the first. `params.y` will not be used)
	 * - "none" (use CSS positioning. `params.y` will not be used)
	 * @param {boolean} [params.permanent=false] Stays on the chart even when chart is re-initialized (symbol change, newChart(), initializeChart())
	 * @param {string} [params.label="generic"] A label for the marker. Multiple markers can be assigned the same label. This allows them to be deleted in one fell swoop.
	 * @param {boolean} [params.includeAxis=false] If true then the marker can display on the x or y axis. Otherwise it will be cropped at the axis edges.
	 * @param {Boolean} [params.chartContainer] If true then the marker will be put directly in the chart container as opposed to in a holder. When placing
	 * markers directly in the chart container, the z-index setting for the marker should be set vis a vis the z-index of the holders in order to place
	 * the markers below or above those inside the holders.
	 * @constructor
	 * @since
	 * <br> 15-07-01 Class added
	 * <br> 05-2016-10 It now takes the following `params.yPositioner` values: "value", "above_candle", "under_candle","on_candle","top","bottom"
	 * @version ChartIQ Advanced Package
	 * @example
	 * new CIQ.Marker({
     * 	stx: stxx,
     * 	xPositioner: "date",
     *  yPositioner: "value",
     * 	x: someDate,
	 * 	label: "events",
     * 	node: newNode
     * });
	 */
	CIQ.Marker=function(params){
		this.params={
			xPositioner: "date",
			yPositioner: "value",
			panelName: "chart",
			permanent: false,
			label: "generic",
			includeAxis: false
		};
		CIQ.extend(this.params, params);
		if(!this.params.node){
			this.params.node=document.createElement("DIV");
		}
		if(!this.params.stx){
			console.log("Marker created without specifying stx");
			return;
		}
		if(!this.className) this.className="CIQ.Marker";
		this.params.stx.addToHolder(this);
	};

	/**
	 * Removes the marker from the chart object
	 * @memberOf CIQ.Marker
	 * @since  15-07-01
	 */
	CIQ.Marker.prototype.remove=function(){
		this.params.stx.removeFromHolder(this);
	};

	/**
	 * Normally the chart will take care of positioning the marker automatically but you can
	 * force a marker to render itself by calling this method. This will cause the marker to
	 * call its placement function. You might want to do this for instance if your marker morphs
	 * or changes position outside of the animation loop.
	 */
	CIQ.Marker.prototype.render=function(){
		var arr=[this];
		var params={
			stx: this.params.stx,
			arr: arr,
			panel: this.params.stx.panels[this.params.panelName],
			showClass: this.showClass
		};
		(this.constructor.placementFunction)(params);
	};


	/**
	 * Removes all markers with the specified label from the chart object
	 * @param  {CIQ.ChartEngine} stx   The chart object
	 * @param  {string} label The label
	 * @memberOf CIQ.Marker
	 * @since  15-07-01
	 */
	CIQ.Marker.removeByLabel=function(stx, label){
		var arr=stx.getMarkerArray("label", label);
		for(var i=0;i<arr.length;i++)
			stx.removeFromHolder(arr[i]);
	};

	/**
	 *
	* Content positioner for any markers using the 'stx-marker-expand' class,
	* this will consider the marker node's loction within its container and determine where to
	* place the content, be it to the left or right/top or bottom of the marker node (so it is all showing)
	* @memberOf CIQ.Marker
	* @param {HTMLElement} node The HTML element representing the marker which has content
	* @since 5.1.2
	*/
	CIQ.Marker.positionContentVerticalAndHorizontal=function(node){
		var content_node=node.querySelectorAll('.stx-marker-expand')[0];
		if (content_node){
			var offsetWidth=content_node.offsetWidth,
			offsetHeight=content_node.offsetHeight;
			if(!offsetWidth || !offsetHeight) return;

			var nodeStyle=content_node.style;
			nodeStyle.left=nodeStyle.right="";  // reset content to right of node
			nodeStyle.bottom=nodeStyle.top=""; // reset content to bottom of node

			var contentLeft=getComputedStyle(content_node).left;
			var contentBottom=getComputedStyle(content_node).bottom;
			var contentHeight=getComputedStyle(content_node).height;

			var leftPxOfContent=node.offsetLeft+parseInt(contentLeft,10);
			var bottomContentInt=parseInt(contentBottom,10);
			var heightInt=parseInt(contentHeight,10);
			var topPxOfContent=node.offsetTop+bottomContentInt-heightInt;

			var offsetMaxWidth=node.parentNode.offsetWidth;
			var offsetMaxHeight=node.parentNode.offsetHeight;

			//switch content to left of node if node is off the left of the chart or content will not fit to the right of the node
			if(leftPxOfContent+offsetWidth>offsetMaxWidth){
				nodeStyle.right=contentLeft;
				nodeStyle.left="auto";
			}

			if(node.offsetTop-heightInt<offsetMaxHeight){ //node not off the top of the chart
				//switch content to the bottom of the node if node is off the top of the chart
				if(node.offsetTop-node.offsetHeight<0){
					nodeStyle.top=contentBottom;
					nodeStyle.bottom="auto";
				} else if(topPxOfContent+offsetHeight>offsetMaxHeight){
					//switch content to top of node if node is off the top of the chart
					nodeStyle.top="auto";
					//Since the "middle" placement has a bottom content of 30px, if we want to move above the marker
					//we have to make this number larger than the default (otherwise it'll be back in the middle)
					nodeStyle.bottom=bottomContentInt*3+"px";
				}
			}
		}
	};

/**
	 * The above_candle and below_candle y-positioner will usually use the high and low to place the marker.
	 * However, some chart renderings will draw the extent of the bar either inside or outside the high/low range.
	 * For those chart types, this function will return the actual high/low to be used by the marker placement function.
	 * This is only valid when {@link CIQ.Renderer#highLowBars} is true.
	 * Currently this function will handle p&f and histogram chart types.
	 * For any other chart type, define "markerHigh" and "markerLow" for each bar in the dataSet/dataSegment
	 * and these will be honored and returned.
	 * Note: This function may be used with any markerPlacement function to give the lowest and highest point of the bar.
	 *
	 * @memberOf CIQ.ChartEngine
	 * @param {Object} quote The bar's data.  This can come from the chart.dataSet
	 * @return {Object}        The high and low for the marker
	 * @since 
	 * <br>&bull; 3.0.0
	 * <br>&bull; 6.2.0 Will consider `Open` and `Close` if `High` and/or `Low` are missing from quote
	 */
	CIQ.ChartEngine.prototype.getBarBounds=function(quote){
		var type=this.layout.chartType, aggregation=this.layout.aggregationType;
		var bounds;
		if(aggregation=="pandf") bounds={high:Math.max(quote.pfOpen,quote.pfClose), low:Math.min(quote.pfOpen,quote.pfClose)};
		else bounds={high:quote.High, low:quote.Low};
		if(quote.markerHigh) bounds.high=quote.markerHigh;
		if(quote.markerLow) bounds.low=quote.markerLow;
		
		var O,H,L;
		if(quote.Open===undefined) O=quote.Close;
		if(quote.High===undefined) H=Math.max(quote.Open || O, quote.Close);
		if(quote.Low===undefined) L=Math.min(quote.Open || O, quote.Close);
		if(!bounds.high && bounds.high!==0) bounds.high=H; 
		if(!bounds.low && bounds.low!==0) bounds.low=L; 
		return bounds;
	};

	/**
	 * Placement functions are responsible for positioning markers in their holder according to each marker's settings.
	 * They are called directly form the draw() function in the animation loop.
	 * Each Marker placement handler must have a corresponding `placementFunction` or this method will be used.
	 *
	 * `firstTick` and `lastTick` can be used as a hint as to whether to display a marker or not.
	 *
	 * See {@link CIQ.Marker} and {@tutorial Markers} for more details
	 * @memberOf CIQ.ChartEngine
	 * @param {Object} params The parameters
	 * @param {Array} params.arr The array of markers
	 * @param {Object} params.panel The panel to display
	 * @param {Number} params.firstTick The first tick displayed on the screen
	 * @param {Number} params.lastTick The last tick displayed on the screen
	 * @since
	 * <br> 2015-09-01 On prior versions you must define your own default function. Example: CIQ.ChartEngine.prototype.defaultMarkerPlacement = yourPlacementFunction;
	 */
	CIQ.ChartEngine.prototype.defaultMarkerPlacement=function(params){
		var panel=params.panel;
		var yAxis=params.yAxis?params.yAxis:params.panel.yAxis;
		var chart=panel.chart;
		var stx=params.stx;

		var showsHighs=stx.chart.highLowBars || stx.highLowBars[stx.layout.chartType];
		var plotField=chart.defaultPlotField;
		if(!plotField || showsHighs) plotField="Close";

		var placementMap ={};

		for(var i=0;i<params.arr.length;i++){
			var marker=params.arr[i], mparams=marker.params;
			var node=marker.node;
			// Getting clientWidth and clientHeight is a very expensive operation
			// so we'll cache the results. Don't use this function if your markers change
			// shape or size dynamically!
			if(!marker.clientWidth) marker.clientWidth=node.clientWidth;
			if(!marker.clientHeight) marker.clientHeight=node.clientHeight;
			var quote=null;

			// X axis positioning logic

			var xPositioner=mparams.xPositioner, yPositioner=mparams.yPositioner, tick=marker.tick, dataSet=chart.dataSet, clientWidth=marker.clientWidth;
			if(xPositioner!="none"){
				if(xPositioner=="bar" && mparams.x){
					if(mparams.x<chart.xaxis.length){
						var xaxis=chart.xaxis[mparams.x];
						if(xaxis) quote=xaxis.data;
					}
					node.style.left=Math.round(stx.pixelFromBar(mparams.x, chart)-clientWidth/2)+1+"px";
				}else{
					// This is a section of code to hide markers if they are off screen, and also to figure out
					// the position of markers "just in time"
					// the tick is conditionally pre-set by CIQ.ChartEngine.prototype.setMarkerTick depending on marker.params.xPositioner
					if(!tick && tick!==0){ // if tick is not defined then hide, probably in distant past
						if(mparams.future && chart.scroll<chart.maxTicks){ // In future
							stx.futureTickIfDisplayed(marker); // Just in time check for tick
							tick=marker.tick;  //copy new tick from prior function
							if(!tick && tick!==0){
								node.style.left="-1000px";
								continue;
							}
						}else{
							node.style.left="-1000px";
							continue;
						}
					}
					if(tick<dataSet.length) quote=dataSet[tick];
					marker.leftpx=Math.round(stx.pixelFromTick(tick, chart)-chart.left-clientWidth/2);
					marker.rightEdge=marker.leftpx+clientWidth;
					node.style.left=marker.leftpx+"px";
					if(tick<params.firstTick && marker.rightEdge<chart.left-50) continue; // off screen, no need to reposition the marker (accounting 50px for any visual effects)
				}
				if(!quote) quote=dataSet[dataSet.length-1]; // Future ticks based off the value of the current quote

			}else if(yPositioner.indexOf("candle")>-1){
				// candle positioning, find the quote
				left=getComputedStyle(node).left;
				if(left){
					var bar=stx.barFromPixel(parseInt(left,10), chart);
					if(bar>=0) {
						quote=chart.xaxis[bar].data;
						if(!quote) quote=dataSet[dataSet.length-1]; // Future ticks based off the value of the current quote
					}
				}
			}

			// Y axis positioning logic
			var y=mparams.y, clientHeight=node.clientHeight, val;
			if(yPositioner!="none"){
				var placementKey = yPositioner+'-'+node.style.left;
				var height=mparams.chartContainer?stx.height:panel.yAxis.bottom;
				var bottom=0, bottomAdjust=0;
				if (typeof placementMap[placementKey]=="undefined"){
					placementMap[placementKey]=0;
				}
				bottomAdjust = placementMap[placementKey];
				placementMap[placementKey]+=clientHeight;

				if(yPositioner=="value" && y){
					bottom=Math.round(height-stx.pixelFromPrice(y, panel, yAxis)-clientHeight/2)+"px";
				} else if(yPositioner=="under_candle" && quote) {
					val=quote[plotField];
					if(showsHighs) val=stx.getBarBounds(quote).low;
					bottom=Math.round(height-stx.pixelFromPrice(val, panel, yAxis)-clientHeight-bottomAdjust)+"px";
				} else if(yPositioner=="on_candle" && quote) {
					val=quote[plotField];
					if(showsHighs) val=(quote.Low+quote.High)/2;
					bottom=Math.round(height-stx.pixelFromPrice(val, panel, yAxis)-clientHeight/2-bottomAdjust)+"px";
				} else if(yPositioner=="top") {
					bottom=Math.round(height-clientHeight-bottomAdjust)+"px";
				} else if(yPositioner=="bottom") {
					bottom=Math.round(bottomAdjust)+"px";
				} else if(quote) {
					//above_candle
					val=quote[plotField];
					if(showsHighs) val=stx.getBarBounds(quote).high;
					bottom=Math.round(height-stx.pixelFromPrice(val, panel, yAxis)+bottomAdjust)+"px";
				}
				if(node.style.bottom!=bottom) node.style.bottom=bottom;
			}
			CIQ.Marker.positionContentVerticalAndHorizontal(node);
		}
	};

	/**
	 * Base class to create an empty marker node that can then be styled. Used by {@link CIQ.Marker.Simple}
	 * See {@tutorial Markers} tutorials for additional implementation instructions.
	 * @name CIQ.Marker.NodeCreator
	 * @constructor
	 */
	CIQ.Marker.NodeCreator=function(){};

	CIQ.Marker.NodeCreator.toNode=function(){
		return this.node;
	};

	/**
	 * Constructor for basic built-in markers.
	 * See {@tutorial Markers} tutorials for additional implementation instructions.
	 * @name CIQ.Marker.Simple
	 * @constructor
	 * @param {Object} params Parameters to describe the marker
	 * @param {string} params.type The marker type "circle", "square", "callout"
	 * @param {string} params.headline The headline text to display
	 * @param {string} [params.category] The category "news", "earningsUp", "earningsDown", "dividend", "filing", "split"
	 * @param {string} [params.story] The story to display when hovered
	 */
	CIQ.Marker.Simple=function(params){
		var node=this.node=document.createElement("div");
		node.className="stx-marker";
		CIQ.appendClassName(node, params.type);
		if(params.category) CIQ.appendClassName(node, params.category);
		var visual=CIQ.newChild(node, "div", "stx-visual");
		CIQ.newChild(node, "div", "stx-stem");

		var expand;
		if(params.type=="callout"){
			var content=CIQ.newChild(visual, "div", "stx-marker-content");
			CIQ.newChild(content, "h4", null, params.headline);
			expand=CIQ.newChild(content, "div", "stx-marker-expand");
			CIQ.newChild(expand, "p", null, params.story);
		}else{
			expand=CIQ.newChild(node, "div", "stx-marker-expand");
			CIQ.newChild(expand, "h4", null, params.headline);
			CIQ.newChild(expand, "p", null, params.story);
			CIQ.safeClickTouch(expand, function(e){
				CIQ.toggleClassName(node, "highlight");
			});
		}
		function cb(){
			CIQ.Marker.positionContentVerticalAndHorizontal(node);
		}
		CIQ.safeClickTouch(visual, function(e){
			CIQ.toggleClassName(node, "highlight");
			setTimeout(cb,10);
		});
	};

	CIQ.Marker.Simple.ciqInheritsFrom(CIQ.Marker.NodeCreator, false);

	return _exports;
})/* removeIf(umd) */(typeof window !== 'undefined' ? window : global)/* endRemoveIf(umd) */;
