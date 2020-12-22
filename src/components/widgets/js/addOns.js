//-------------------------------------------------------------------------------------------
// Copyright 2012-2016 by ChartIQ, Inc.
// All rights reserved
//-------------------------------------------------------------------------------------------

(function (definition) {
	"use strict";

	if (typeof exports === "object" && typeof module === "object") {
		module.exports = definition(require('./chartiq') );
	} else if (typeof define === "function" && define.amd) {
		define(["chartiq" ], definition);
	} else if (typeof window !== "undefined" || typeof self !== "undefined") {
		var global = typeof window !== "undefined" ? window : self;
		definition(global,global);
	} else {
		throw new Error("Only CommonJS, RequireJS, and <script> tags supported for addOns.js.");
	}
})(function(_exports){
	var CIQ=_exports.CIQ;

	/**
	 * Use this constructor to initialize visualization styles of extended hours by the use of shading and delimitation lines.
	 * This visualization will only work if the `extended` and `marketSessions` parameters in the {@link CIQ.ChartEngine#layout} object are set,
	 * data for the corresponding sessions is provided from your quote feed and the market definitions have the corresponding entries.
	 * See {@link CIQ.Market} for details on how to define extended (non-default) hours.
	 *
	 * All possible market sessions needed to be shaded at any given time should be enabled at once with this method.
	 *
	 * It is **important to note** that unless `params.filter` is set, this method simply highlights the data within a particular market session as set by the CSS colors, but does not exclude any timeframes. 
	 * If the data is on the chart, the session will be highlighted if initialized.
	 * If you wish to exclude a particular session from the chart, either `params.filter` or exclude the data at quote feed level so it is not present in the masterData.
	 * See examples section for more details.

	 *
	 * - The styles for the shading of each session is determined by the corresponding CSS class in the form of "stx_market_session."+session_name (Example: `stx_market_session.pre`)
	 * - The divider line is determined by the CSS class "stx_market_session.divider".
	 *
	 * Example <iframe width="800" height="500" scrolling="no" seamless="seamless" align="top" style="float:top" src="http://jsfiddle.net/chartiq/g2vvww67/embedded/result,js,html/" allowfullscreen="allowfullscreen" frameborder="1"></iframe>
	 *
	 * @param {object} params The constructor parameters
	 * @param {CIQ.ChartEngine} [params.stx] The chart object
	 * @param {boolean} [params.filter] Setting to true performs a filter of masterData rather than a reload of the data from the server
	 * @constructor
	 * @name  CIQ.ExtendedHours
	 * @example
	 * // initialize the session names, which must have a corresponding CSS entry.
		// call this only once to initialize the market sessions display manager
		new CIQ.ExtendedHours({stx:stxx});

		// Call something like this from your menu to enable or disable the sessions
		 //enable extended ours mode or set to false to disable.
		 stxx.layout.extended=true;
		 // enable the particular sessions you want to display or set to {} to display none
		 stxx.layout.marketSessions={pre:true,post:true};
		 //set the market to reflect your market preferences. This is only need if you are not using setMarketFactory and instead just using setMarket
		 stxx.setMarket(CIQ.Market.NYSE);
		// call new chart to now show the session you enabled.
		 stxx.newChart(stxx.chart.symbol, null, null, finishedLoadingNewChart(stxx.chart.symbol, stxx.chart.symbol));
	 * @example
	 * 	// CSS entries for a session divider and sessions named "pre" and "post"
		.stx_market_session.divider {
			background-color: rgba(0,255,0,0.8);
			width: 1px;
		}
		.stx_market_session.pre {
			background-color: rgba(255,255,0,0.1);
		}
		.stx_market_session.post {
			background-color: rgba(0,0,255,0.2);
		}
	 * @example
	 * 	// sample code for turning on and off sessions on the chart when using setMarketFactory

		// initialize the sessions you want to shade and make sure you have the corresponding CSS defined.
		new CIQ.ExtendedHours({stx:stxx});

		// call this function form your UI to enable or disable the sessions on the chart
		// ( requires your feed to only send data for the enabled sessions )
		function toggleExtHours(session){

			// toggle the session on the layout.marketSessions array so you know what the user wants to see and what to load.
			stxx.layout.marketSessions[session]=!stxx.layout.marketSessions[session];

			// assume you are using check boxes on your UI to enable and disable the sessions. Set them here.
			var checkbox=$$$(".stxExtHours-"+session);
			if(stxx.layout.marketSessions[session]){
				CIQ.appendClassName(checkbox, "true");
			}else{
				CIQ.unappendClassName(checkbox, "true");
			}

			// if you have after hours sessions enabled, then set the extended flag on so your feed knows to get this data.
			stxx.layout.extended=stxx.layout.marketSessions.pre || stxx.layout.marketSessions.post;

			if(!stxx.displayInitialized) return;

			// now create a new chart with just the data the user wants to see (if not using `params.filter`, your feed should follow the extended and marketSessions settings)
			// the data will be highlighted as initialized.
			stxx.newChart(stxx.chart.symbol, null, null, finishedLoadingNewChart(stxx.chart.symbol, stxx.chart.symbol));
			stxx.changeOccurred("layout");
			stxx.doDisplayCrosshairs();
		}
	 * @since  06-2016-02
	 * @since 3.0.0 changed argument to an object to support filter
	 */
	CIQ.ExtendedHours=function(params){
		var stx=params.stx;
		var filter=params.filter;
		if(!stx) { // backwards compatibility
			stx=params;
			filter=false;
		}
		var styles={};
		var init=false;
		this.stx=stx;
		this.stx.extendedHours=this;
        /**
         * Turns on extended hours for the session names enumerated in the arguments.
         * @param  {boolean} enable Set to turn on/off the extended-hours visualization.
         * @param  {array} sessions The sessions to visualize when enable is true.  Any sessions previously visualized will be disabled.  If set to null, will default to ["pre","post"].
         * @param  {function} cb Optional callback function to be invoked once chart is reloaded with extended hours data.
         * @memberof CIQ.ExtendedHours
         * @method set
         */
		this.set=function(enable,sessions,cb){
			init=true;
			stx.layout.extended=enable;
			for(var sess in stx.layout.marketSessions) {
				styles.session={};
				stx.chart.market.disableSession(sess);
			}
			stx.layout.marketSessions={};
			if(enable){
				if(!sessions) sessions=["pre","post"];
				if(sessions.length){
					for(var s=0;s<sessions.length;s++){
						stx.layout.marketSessions[sessions[s]]=true;
					}
				}else{
					stx.layout.marketSessions=sessions;
				}
			}
			stx.changeOccurred("layout");
			for(sess in stx.layout.marketSessions) {
				if(!styles.session) styles.session={};
				styles.session[sess]=stx.canvasStyle("stx_market_session "+sess);
				stx.chart.market.disableSession(sess,true);
			}
			if(filter){
				stx.createDataSet();
				stx.draw();
				if(cb) cb();
			}else{
				stx.newChart(stx.chart.symbol, null, null, cb);
			}
		};
		this.stx.append("initializeDisplay", function(){
			if(!this.layout.extended) return;
			if(CIQ.ChartEngine.isDailyInterval(this.layout.interval)) return;
			if(!init) this.extendedHours.set(this.layout.extended, stx.layout.marketSessions);
			styles.divider=this.canvasStyle("stx_market_session divider");
			if(styles.session){
				var m=this.chart.market;
				var ranges=[];
				var range={};
				var nextBoundary, thisSession;
				for(var i=0;i<this.chart.dataSegment.length;i++){
					var ds=this.chart.dataSegment[i];
					if(!ds || !ds.DT) continue;
					var c=null;
					if(m.market_def){
						if(!nextBoundary || nextBoundary<=ds.DT){
							thisSession=m.getSession(ds.DT, this.dataZone);
							var filterSession=(thisSession!=="" && (!this.layout.marketSessions || !this.layout.marketSessions[thisSession]));
							nextBoundary=m[filterSession?"getNextOpen":"getNextClose"](ds.DT, this.dataZone, this.dataZone);
						}
					}

					var s=styles.session[thisSession];
					if(s) c=s.backgroundColor;
					if(range.color && range.color!=c){
						ranges.push({start:range.start,end:range.end,color:range.color});
						range={};
					}
					if(c){
						var cw=this.layout.candleWidth;
						if(ds.candleWidth) cw=ds.candleWidth;
						range.end=this.pixelFromBar(i,this.chart)+cw/2;
						if(!range.start && range.start!==0) range.start=range.end-cw+1;
						range.color=c;
					}else{
						range={};
					}
				}
				if(range.start || range.start===0) ranges.push({start:range.start,end:range.end,color:range.color});
				var noDashes=CIQ.isTransparent(styles.divider.backgroundColor);
				var dividerLineWidth=styles.divider.width.replace(/px/g, '');
				for(var panel in this.panels){
					if(this.panels[panel].shareChartXAxis===false) continue;
					this.startClip(panel);
					for(i=0;i<ranges.length;i++){
						this.chart.context.fillStyle=ranges[i].color;
						if(!noDashes && ranges[i].start>this.chart.left) this.plotLine(ranges[i].start, ranges[i].start, this.panels[panel].bottom, this.panels[panel].top, styles.divider.backgroundColor, "line", this.chart.context, this.panels[panel], {
							pattern: "dashed",
							lineWidth: dividerLineWidth
						});
						this.chart.context.fillRect(ranges[i].start,this.panels[panel].top,ranges[i].end-ranges[i].start,this.panels[panel].bottom-this.panels[panel].top);
						if(!noDashes && ranges[i].end<this.chart.right) this.plotLine(ranges[i].end, ranges[i].end, this.panels[panel].bottom, this.panels[panel].top, styles.divider.backgroundColor, "line", this.chart.context, this.panels[panel], {
							pattern: "dashed",
							lineWidth: dividerLineWidth
						});
					}
					this.endClip();
				}
			}
		});
	};

	/**
	 * Add-On that creates a hovering "tooltip" as mouse is moved over the chart when the cross-hairs are active.
	 *
	 * Requires `jquery` and `addOns.js`; as well as `markers.js` to be bundled in `chartiq.js`.
	 *
	 * There can be only one CIQ.Tooltip per chart.
	 *
	 * Color and layout can be customized via `stx-hu-tooltip` and related CSS classes. Defaults can be found in `stx-chart.css`.
	 *
	 * CIQ.Tooltip automatically creates its own HTML inside the chart container.
	 * Here is an example of the structure (there will be one field tag per displayed element):
	 * ```
	 * <stx-hu-tooltip>
	 * 		<stx-hu-tooltip-field>
	 * 			<stx-hu-tooltip-field-name>
	 * 			</stx-hu-tooltip-field-name>
	 * 			<stx-hu-tooltip-field-value>
	 * 			</stx-hu-tooltip-field-value>
	 * 		</stx-hu-tooltip-field>
	 * </stx-hu-tooltip>
	 * ```
	 * By default, the `stx-hu-tooltip-field` elements are inserted in the following order:
	 * - DT
	 * - Open
	 * - High
	 * - Low
	 * - Close
	 * - Volume
	 * - series
	 * - studies
	 *
	 * But the default layout can be changed. You can override the order of fields or change the labels by manually inserting
	 * the HTML that the tooltip would otherwise have created for that field.
	 * If no override HTML is found for a particular field, the default will be used.
	 * This HTML must be placed *inside the chart container*.
	 *
	 * All of the code is provided in `addOns.js` and can be fully customized by copying the source code from the library and overriding
	 * the functions with your changes. Be sure to never modify a library file as this will hinder upgrades.
	 *
	 * Visual Reference:<br>
	 * ![stx-hu-tooltip](stx-hu-tooltip.png "stx-hu-tooltip")
	 *
	 * @param {object} tooltipParams The constructor parameters
	 * @param {CIQ.ChartEngine} [tooltipParams.stx] The chart object
	 * @param {boolean} [tooltipParams.ohl] set to true to show OHL data (Close is always shown).
	 * @param {boolean} [tooltipParams.volume] set to true to show Volume
	 * @param {boolean} [tooltipParams.series] set to true to show value of series
	 * @param {boolean} [tooltipParams.studies] set to true to show value of studies
	 * @constructor
	 * @name  CIQ.Tooltip
	 * @since 09-2016-19
	 *
	 *
	 * @example <caption>Adding a hover tool tip to a chart:</caption>
	 *
	 * //First declare your chart engine
	 * var stxx=new CIQ.ChartEngine({container:$("#chartContainer")[0]});
	 *
	 * //Then link the hoer to that chart.
	 * //Note how we've enabled OHL, Volume, Series and Studies.
	 * new CIQ.Tooltip({stx:stxx, ohl:true, volume:true, series:true, studies:true});
	 *
	 * @example <caption>Customize the order, layout or text in tooltip labels:</caption>
	 * // In this example, we've rearranged the HTML to display the Close filed first, then the DT
	 * // We are also labeling the DT 'Date/Time' and the Close 'Last'
	 * // The rest of the fileds will be then displayed in their default order.
	 *
	  	<stx-hu-tooltip>
			<stx-hu-tooltip-field field="Close">
				<stx-hu-tooltip-field-name>Last</stx-hu-tooltip-field-name>
				<stx-hu-tooltip-field-value></stx-hu-tooltip-field-value>
			</stx-hu-tooltip-field>
			<stx-hu-tooltip-field field="DT">
				<stx-hu-tooltip-field-name>Date/Time:</stx-hu-tooltip-field-name>
				<stx-hu-tooltip-field-value></stx-hu-tooltip-field-value>
			</stx-hu-tooltip-field>
		</stx-hu-tooltip>
	 *
	 * @example
	 * // Sample CSS for the hover tool tip. Working sample found in stx-chart.css
		stx-hu-tooltip {
			position: absolute;
			left: -1000px;
			z-index: 30;
			white-space: nowrap;
			padding: 6px;
			border: 1px solid gray;
			background-color: rgba(42,81,208,.5);
			color: white;
		}

		stx-hu-tooltip-field {
			display:table-row;
		}

		stx-hu-tooltip-field-name {
			display:table-cell;
			font-weight:bold;
			padding-right:5px;
		}

		stx-hu-tooltip-field-value {
			display:table-cell;
			text-align:right;
		}
	 */

	CIQ.Tooltip=function(tooltipParams){
		var stx=tooltipParams.stx;
		var showOhl=tooltipParams.ohl;
		var showVolume=tooltipParams.volume;
		var showSeries=tooltipParams.series;
		var showStudies=tooltipParams.studies;

		var node=$(stx.chart.container).find("stx-hu-tooltip")[0];
		if(!node){
			node=$("<stx-hu-tooltip></stx-hu-tooltip>").appendTo($(stx.chart.container))[0];
		}
		CIQ.Marker.Tooltip=function(params){
			if(!this.className) this.className="CIQ.Marker.Tooltip";
			params.label="tooltip";
			CIQ.Marker.call(this, params);
		};

		CIQ.Marker.Tooltip.ciqInheritsFrom(CIQ.Marker,false);

		CIQ.Marker.Tooltip.sameBar=function(bar1, bar2){
			if(!bar1 || !bar2) return false;
			if(+bar1.DT!=+bar2.DT) return false;
			if(bar1.Close!=bar2.Close) return false;
			if(bar1.Open!=bar2.Open) return false;
			if(bar1.Volume!=bar2.Volume) return false;
			return true;
		};

		CIQ.Marker.Tooltip.placementFunction=function(params){
			var offset=30;
			var stx=params.stx;
			for(var i=0;i<params.arr.length;i++){
				var marker=params.arr[i];
				var bar=stx.barFromPixel(stx.cx);
				if(
					(stx.controls.crossX && stx.controls.crossX.style.display=="none") ||
					(stx.controls.crossY && stx.controls.crossY.style.display=="none") ||
					!(CIQ.ChartEngine.insideChart &&
						stx.layout.crosshair &&
						stx.displayCrosshairs &&
						!stx.overXAxis &&
						!stx.overYAxis &&
						!stx.openDialog &&
						!stx.activeDrawing &&
						!stx.grabbingScreen &&
						stx.chart.dataSegment[bar] != "undefined" &&
						stx.chart.dataSegment[bar] &&
						stx.chart.dataSegment[bar].DT)
				){
					marker.node.style.left="-1000px";
					marker.node.style.right="auto";
					marker.lastBar={};
					return;
				}
				if(CIQ.Marker.Tooltip.sameBar(stx.chart.dataSegment[bar], marker.lastBar) && bar!=stx.chart.dataSegment.length-1) return;
				marker.lastBar=stx.chart.dataSegment[bar];
				if(parseInt(getComputedStyle(marker.node).width,10)+offset<CIQ.ChartEngine.crosshairX){
					marker.node.style.left="auto";
					marker.node.style.right=Math.round(stx.container.clientWidth-stx.pixelFromBar(bar)+offset)+"px";
				}else{
					marker.node.style.left=Math.round(stx.pixelFromBar(bar)+offset)+"px";
					marker.node.style.right="auto";
				}
				marker.node.style.top=Math.round(CIQ.ChartEngine.crosshairY-stx.top-parseInt(getComputedStyle(marker.node).height,10)/2)+"px";
			}
			stx.doDisplayCrosshairs();
		};

		function renderFunction(){
			// the tooltip has not been initialized with this chart.
			if(!this.huTooltip) return;

			// crosshairs are not on
			if(
				(stx.controls.crossX && stx.controls.crossX.style.display=="none") ||
				(stx.controls.crossY && stx.controls.crossY.style.display=="none")
			) return;

			var bar=this.barFromPixel(this.cx);
			if(!this.chart.dataSegment[bar]) {
				this.positionMarkers();
				return;
			}
			if(CIQ.Marker.Tooltip.sameBar(this.chart.dataSegment[bar], this.huTooltip.lastBar) && bar!=this.chart.dataSegment.length-1) return;
			var node=$(this.huTooltip.node);
			node.find("[auto]").remove();
			node.find("stx-hu-tooltip-field-value").html();
			var fields=["DT"];
			if(showOhl) fields=fields.concat(["Open","High","Low"]);
			fields.push("Close");
			if(showVolume) fields.push("Volume");
			if(showSeries){
				for(var series in this.chart.series) {
					fields.push(this.chart.series[series].display);
				}
			}
			if(showStudies){
				for(var study in this.layout.studies) {
					for(var output in this.layout.studies[study].outputMap)
						fields=fields.concat([output,study+"_hist",study+"_hist1",study+"_hist2"]);
				}
			}
			var dupMap={};
			fields.forEach(function(name){
				if((this.chart.dataSegment[bar][name] || this.chart.dataSegment[bar][name]===0) &&
					(typeof this.chart.dataSegment[bar][name]!=="object" || name=="DT") &&
					!dupMap[name]){
					var fieldName=name.replace(/^(Result )(.*)/,"$2");
					var fieldValue="";
					dupMap[name]=true;
					if(this.chart.dataSegment[bar][name].constructor==Number){
						if(name=="Volume"){  // bad hack
							fieldValue=this.chart.dataSegment[bar][name].toString();
						}else{
							fieldValue=this.padOutPrice(this.chart.dataSegment[bar][name],4);
						}
					}else if(this.chart.dataSegment[bar][name].constructor==Date){
						if( name=="DT" && this.controls.floatDate && this.controls.floatDate.innerHTML ) {
							if(CIQ.ChartEngine.hideDates()) fieldValue="N/A";
							else fieldValue=this.controls.floatDate.innerHTML;
						} else {
							fieldValue=CIQ.yyyymmdd(this.chart.dataSegment[bar][name]);
							if(!CIQ.ChartEngine.isDailyInterval(this.layout.interval)){
								fieldValue+=" "+this.chart.dataSegment[bar][name].toTimeString().substr(0,8);
							}
						}
					}else{
						fieldValue=this.chart.dataSegment[bar][name];
					}
					var dedicatedField=node.find('stx-hu-tooltip-field[field="'+fieldName+'"]');
					if(dedicatedField.length){
						dedicatedField.find("stx-hu-tooltip-field-value").html(fieldValue);
						var fieldNameField=dedicatedField.find("stx-hu-tooltip-field-name");
						if(fieldNameField.html()==="") fieldNameField.html(fieldName+":");
					}else{
						$("<stx-hu-tooltip-field auto></stx-hu-tooltip-field>")
							.append($("<stx-hu-tooltip-field-name>"+this.translateIf(fieldName)+":</stx-hu-tooltip-field-name>"))
							.append($("<stx-hu-tooltip-field-value>"+fieldValue+"</stx-hu-tooltip-field-value>"))
							.appendTo(node);
					}
				}else{
					var naField=node.find('stx-hu-tooltip-field[field="'+name+'"]');
					if(naField.length){
						var naFieldNameField=naField.find("stx-hu-tooltip-field-name");
						if(naFieldNameField.html()!=="")
							naField.find("stx-hu-tooltip-field-value").html("n/a");
					}
				}
			},this);
			this.huTooltip.render();
		}

		CIQ.ChartEngine.prototype.append("undisplayCrosshairs",function(){
			var tt=this.huTooltip;
			if( tt && tt.node ) {
				var node=$(tt.node);
				if( node && node[0]){
					node[0].style.left="-1000px";
					node[0].style.right="auto";
					tt.lastBar={};
				}
			}
		});
		CIQ.ChartEngine.prototype.append("headsUpHR", renderFunction);
		CIQ.ChartEngine.prototype.append("createDataSegment", renderFunction);
		stx.huTooltip=new CIQ.Marker.Tooltip({ stx:stx, xPositioner:"bar", chartContainer:true, node:node });
	};


	/**
	 * Add-On that puts the chart into "sleep mode" after a period of inactivity.
	 * In sleep mode, a class "ciq-sleeping" will be added to the body.  This will dim out the chart.
	 * Sleep mode is ended when interaction with the chart is detected.
	 *
	 * @param {object} params Configuration parameters
	 * @param {CIQ.ChartEngine} [params.stx] The chart object
	 * @param {number} [params.minutes] Inactivity period in _minutes_.  Set to 0 to disable the sleep mode.
	 * @param {number} [params.interval] Sleeping quote update interval in _seconds_.  During sleep mode, this is used for the update loop.
	 * 									Set to non-zero positive number or defaults to 60.
	 * @param {function} [params.wakeCB] Optional callback function after waking
	 * @param {function} [params.sleepCB] Optional callback function after sleeping
	 * @constructor
	 * @name  CIQ.InactivityTimer
	 * @since 3.0.0
	 * @example
	 * 	new CIQ.InactivityTimer({stx:stxx, minutes:30, interval:15});  //30 minutes of inactivity will put chart into sleep mode, updating every 15 seconds
	 *
	 */
	CIQ.InactivityTimer=function(params){
		if(!params.minutes) return;
		if(!params.interval || params.interval<0) params.interval=60;
		this.stx=params.stx;
		this.timeout=params.minutes;
		this.interval=params.interval;
		this.wakeCB=params.wakeCB;
		this.sleepCB=params.sleepCB;
		this.sleepTimer=null;
		this.sleeping=false;
		this.last=new Date().getTime();
		this.wakeChart=function(){
			window.clearTimeout(this.sleepTimer);
			this.last=new Date().getTime();
			if(this.sleeping) {
				if(this.stx.quoteDriver) this.stx.quoteDriver.updateChartLoop();
				this.sleeping=false;
				CIQ.unappendClassName(document.body,"ciq-sleeping");
			}
			this.sleepTimer=window.setTimeout(this.sleepChart.bind(this), this.timeout*60000);
			if(this.wakeCB) wakeCB();
		};
		this.sleepChart=function(){
			if(!this.sleeping) {
				if(this.stx.quoteDriver) this.stx.quoteDriver.updateChartLoop(this.interval);
				this.sleeping=true;
				CIQ.appendClassName(document.body,"ciq-sleeping");
			}
			if(this.sleepCB) sleepCB();
		};
		$(document).on(
				"mousemove mousedown touchstart touchmove pointerdown pointermove keydown wheel",
				$("body"),
				function(self){ return function(e){ self.wakeChart(); };}(this)
			);
		this.wakeChart();
	};


	/**
	 * Add-On that animates the chart. The chart is animated in three ways:
	 * 1.  The current price pulsates
	 * 2.  The current price appears to move smoothly from the previous price
	 * 3.  The chart's y-axis smoothly expands/contracts when a new high or low is reached
	 *
	 * The following chart types are supported: line, mountain, baseline_delta
	 *
	 * @param {CIQ.ChartEngine} stx The chart object
	 * @param {object} animationParameters Configuration parameters
	 * @param {boolean} [animationParameters.stayPut=false] Set to true for last tick to stay in position it was scrolled and have rest of the chart move backwards as new ticks are added instead of having new ticks advance forward and leave the rest of the chart in place.
	 * @param {number} [animationParameters.ticksFromEdgeOfScreen=5] Number of ticks from the right edge the chart should stop moving forward so the last tick never goes off screen (only applicable if stayPut=false)
	 * @param {number} [animationParameters.granularity=1000000] Set to a value that will give enough granularity for the animation.  The larger the number the smaller the price jump between frames, which is good for charts that need a very slow smooth animation either because the price jumps between ticks are very small, or because the animation was set up to run over a large number of frames when instantiating the CIQ.EaseMachine.
	 * @param {number} [animationParameters.tension=null] Splining tension for smooth curves around data points (range 0-1).  Must include splines.js for this to be effective.
	 * @param {CIQ.EaseMachine} easeMachine Override the default easeMachine.  Default is `new CIQ.EaseMachine(Math.easeOutCubic, 1000);`
	 * @constructor
	 * @name  CIQ.Animation
	 * @since 3.0.0 Now part of addOns.js. Previously provided as a standalone animation.js file
	 * @example
	 * 	new CIQ.Animation(stxx, {tension:0.3});  //Default animation with splining tension of 0.3
	 *
	 */
	CIQ.Animation=function(stx, animationParameters, easeMachine){
		var params={
			stayPut:false,
			ticksFromEdgeOfScreen:5,
			granularity:1000000
		};
		animationParameters=CIQ.extend(params,animationParameters);

		if(params.tension) stx.chart.tension=animationParameters.tension;
		stx.tickAnimator=easeMachine || new CIQ.EaseMachine(Math.easeOutCubic, 1000);
		var scrollAnimator = new CIQ.EaseMachine(Math.easeInOutCubic, 200);

		var flashingColors=['#0298d3','#19bcfc','#5dcffc','#9ee3ff'];
		var flashingColorIndex=0;
		var flashingColorThrottle=20;
		var flashingColorThrottleCounter=0;

		stx.prepend("appendMasterData", function(appendQuotes, chart, params) {

		    var self=this;
		    if (!chart) {
		        chart = self.chart;
		    }

		    if( !self.tickAnimator) {
		       	alert('Animation plug-in can not run because the tickAnimator has not be declared. See instructions in animation.js');
		    	return;
		    }
		    var tickAnimator=self.tickAnimator;

		    function unanimateScroll(){
		        if(chart.animatingHorizontalScroll) {
		            chart.animatingHorizontalScroll = false;
		            self.micropixels = self.nextMicroPixels = self.previousMicroPixels;  // <-- Reset self.nextMicroPixels here
		            chart.lastTickOffset = 0;
		        }
		        if(chart.closePendingAnimation) {
		            chart.masterData[chart.masterData.length-1].Close=chart.closePendingAnimation;
		            chart.closePendingAnimation=0;
		        }
		    }
		    if (chart === null || chart === undefined) return;

		    if (params !== undefined && params.animationEntry) return;

			// If symbol changes then reset all of our variables
			if(this.prevSymbol!=chart.symbol){
				this.prevQuote=0;
				chart.closePendingAnimation=0;
				this.prevSymbol=chart.symbol;
			}
		    unanimateScroll();
		    tickAnimator.stop();
		    if(appendQuotes.length > 2) {
		        return;
		    }
		    var newParams = CIQ.clone(params);
		    if (!newParams) newParams = {};
		    newParams.animationEntry = true;
		    newParams.bypassGovernor = true;
		    newParams.noCreateDataSet = false;
		    newParams.allowReplaceOHL = true;
		    newParams.firstLoop=true;
		    var symbol = this.chart.symbol;
		    var interval = this.layout.interval;
		    var timeUnit = this.layout.timeUnit;

		    function cb(quote, prevQuote, chartJustAdvanced) {
		        return function(newData) {
		            var newClose = newData.Close;
			        if(!chart.dataSet.length || symbol != chart.symbol || interval != self.layout.interval || timeUnit != self.layout.timeUnit) {
		            	//console.log ("---- STOP animating: Old",symbol,' New : ',chart.symbol, Date())
					    unanimateScroll();
					    tickAnimator.stop();
		                return; // changed symbols mid animation
		            }
		            var q = CIQ.clone(quote);
		            q.Close = Math.round(newClose*animationParameters.granularity)/animationParameters.granularity; //<<------ IMPORTANT! Use 1000000 for small price increments, otherwise animation will be in increments of .0001
		            //q.Close = Math.round(newClose*chart.roundit)/chart.roundit; // to ensure decimal points don't go out too far for interim values
		            if (quote.Close > prevQuote.High) q.High = q.Close;
		            if (quote.Close < prevQuote.Low) q.Low = q.Close;
		            if (chartJustAdvanced) {
		                q.Open = q.High = q.Low = q.Close;
		            }
		            if (chart.animatingHorizontalScroll) {
		                self.micropixels = newData.micropixels;
		                chart.lastTickOffset = newData.lineOffset;
		            }
		            newParams.updateDataSegmentInPlace =! tickAnimator.hasCompleted;
		            //console.log("animating: Old",symbol,' New : ',chart.symbol);
		            self.appendMasterData([q], chart, newParams);
		            newParams.firstLoop=false;
		            if (tickAnimator.hasCompleted) {
		            	//console.log( 'animator has completed') ;
		            	//self.pendingScrollAdvance=false;
		                //var possibleYAxisChange = chart.animatingHorizontalScroll;
		                unanimateScroll();
		                /*if (possibleYAxisChange) { // <---- Logic no longer necessary
		                    // After completion, one more draw for good measure in case our
		                    // displayed high and low have changed, which would trigger
		                    // the y-axis animation
		                    setTimeout(function(){
		                        self.draw();
		                    }, 0);
		                }*/
		            }
		        };
		    }

		    var quote = appendQuotes[appendQuotes.length-1];
		    if(!this.prevQuote) this.prevQuote = this.currentQuote();  // <---- prevQuote logic has been changed to prevent forward/back jitter when more than one tick comes in between animations
		    var chartJustAdvanced = false; // When advancing, we need special logic to deal with the open
		    if (appendQuotes.length == 2){
		        this.prevQuote=appendQuotes[0];
		        appendQuotes.splice(1,1);
		    }
		    if (quote.DT.getTime() !== this.prevQuote.DT.getTime()) chartJustAdvanced=true;
		    var linearChart=(this.layout.chartType=="mountain" || this.layout.chartType=="line" || this.layout.chartType=="baseline_delta");

		    var beginningOffset = 0;
		    if(chart.scroll < chart.maxTicks && chartJustAdvanced) {
		        this.previousMicroPixels = this.micropixels;
		        this.nextMicroPixels = this.micropixels + this.layout.candleWidth;
		        beginningOffset = this.layout.candleWidth * -1;
		        if (chart.dataSegment.length < chart.maxTicks - animationParameters.ticksFromEdgeOfScreen && !animationParameters.stayPut){
		            this.nextMicroPixels = this.micropixels;
		            chart.scroll++;
		        }
		        chart.animatingHorizontalScroll = linearChart; // When the chart advances we also animate the horizontal scroll by incrementing micropixels
		        chart.previousDataSetLength = chart.dataSet.length;
		    }
		    chart.closePendingAnimation = quote.Close;
		    tickAnimator.run(cb(quote, CIQ.clone(this.prevQuote), chartJustAdvanced), {"Close":this.prevQuote.Close, "micropixels":this.nextMicroPixels, "lineOffset":beginningOffset}, {"Close":quote.Close, "micropixels": this.micropixels, "lineOffset":0});
		    this.prevQuote=quote;
		    return true; // bypass default behavior in favor of animation

		});

		stx.prepend("renderYAxis", function(chart){
		    if(this.grabbingScreen) return;

		    var panel = chart.panel;
		    var arr = panel.yaxisRHS.concat(panel.yaxisLHS);

		    function closure(self){
		        return function(values){
		            chart.animatedLow=values.low;
		            chart.animatedHigh=values.high;
		            self.draw();
		        };
		    }
		    var i;
		    for (i = 0; i < arr.length; i++) {
		        var yAxis = arr[i];
		        var low = null, high = null;
		        if(panel.yAxis === yAxis){
		            // initialize prev values
		            if(!chart.prevLowValue){
		                chart.prevLowValue=chart.animatedLow=chart.lowValue;
		            }
		            if(!chart.prevHighValue){
		                chart.prevHighValue=chart.animatedHigh=chart.highValue;
		            }

		            // check for a change, if so we will spin off an animation

					if(chart.prevLowValue!=chart.lowValue || chart.prevHighValue!=chart.highValue){
		                scrollAnimator.stop();
		                var prevLow=chart.prevLowValue; var prevHigh=chart.prevHighValue;
		                chart.prevLowValue=chart.lowValue;
		                chart.prevHighValue=chart.highValue;
		                scrollAnimator.run(closure(this), {"low": prevLow, "high": prevHigh}, {"low":chart.lowValue, "high":chart.highValue});
		                return true;
		            }
		        low=chart.animatedLow;
		        high=chart.animatedHigh;
		        }
		        this.calculateYAxisRange(panel, yAxis, low, high);
		    }

		    var parameters={};

		    for(i=0;i<arr.length;i++){
		        parameters.yAxis=arr[i];
		        this.createYAxis(panel, parameters);
		        this.drawYAxis(panel, parameters);
		    }
		    return true; // bypass original kernel code
		});

		stx.append("draw", function() {
		  if (this.chart.dataSet && this.chart.dataSet.length ) {
			if(flashingColorThrottleCounter%flashingColorThrottle===0) {
				flashingColorIndex++;
				flashingColorThrottleCounter=0;
			}
			flashingColorThrottleCounter++;

		    var context = this.chart.context;
		    var panel = this.chart.panel;
		    var price = this.currentQuote().Close;
		    var x = this.pixelFromDate(this.currentQuote().DT, this.chart);
		    if( this.chart.lastTickOffset ) x = x + this.chart.lastTickOffset;
		    var y = this.pixelFromPrice(price, panel);
		    if (this.chart.yAxis.left > x) {
		      if(flashingColorIndex >= flashingColors.length) flashingColorIndex = 0;
		      context.beginPath();
		      context.moveTo(x, y);
		      context.arc(x, y, 2+flashingColorIndex*1.07, 0, Math.PI * 2, false);
			  context.fillStyle = flashingColors[flashingColorIndex];
			  context.fill();
		    }
		  }
		});
	};

	
	/**
	 * Add-On that puts a range slider under the chart. This allows the datasegment to be selectable as a portion of the dataset.
	 * @param {object} params Configuration parameters
	 * @param {CIQ.ChartEngine} [params.stx] The chart object
	 * @param {number} [params.height=95] Height of range slider panel
	 * @param {number} [params.chartContainer=$("#chartContainer")] jquery handle to the main chart container
	 * @constructor
	 * @name  CIQ.RangeSlider
	 * @since TBD
	 * @example
	 * 	new CIQ.RangeSlider({stx:stxx,height:95,chartContainer:$("#chartContainer")});
	 *
	 */
	CIQ.RangeSlider=function(params){
		var stx=params.stx;
		stx.slider=this;
		var sliderHeight=params.height?params.height:95;
		var chartContainer=params.chartContainer?params.chartContainer:$("#chartContainer");

		var ciqSlider=$('<div class="ciq-slider"></div>');
		var sliderContainer=$('<div class="chartContainer" id="sliderContainer"></div>');
		ciqSlider.insertAfter(chartContainer.parent()).append(sliderContainer);
		ciqSlider.css("height",sliderHeight+"px").css("padding-top","5px").hide();
		sliderContainer.css('height', ciqSlider.height()+'px');
		sliderContainer.prop("dimensionlessCanvas",true);
		var self=this.slider=new CIQ.ChartEngine({container:sliderContainer[0], preferences:{labels:false, whitespace:0}});
		self.xaxisHeight=30;
		self.manageTouchAndMouse=false;
		self.chart.yAxis.drawCurrentPriceLabel=false;
		self.chart.baseline.userLevel=false;
		self.initializeChart();
		var subholder=self.chart.panel.subholder;
		var style=stx.canvasStyle("stx_range_slider shading");
		
		this.display=function(on){
			ciqSlider[on?"show":"hide"]();
			stx.resizeChart();
			self.resizeChart();
			self.initializeChart();
			self.draw();
			this.drawSlider();
		};
		this.setSymbol=function(symbol){
			self.chart.symbol=symbol;
			self.adjustPanelPositions();			
		};
		this.acceptLayoutChange=function(layout){
			var doDraw=false;
			if(self.layout.rangeSlider!==layout.rangeSlider){
				stx.slider.display(layout.rangeSlider);
			}
			var relevantLayoutPropertiesForRedraw=[ "chartType","aggregationType",
				"periodicity","interval","timeUnit",
				"chartScale","extended","marketSessions","rangeSlider",
				"kagi","range","renko","priceLines","pandf" ];
			relevantLayoutPropertiesForRedraw.forEach(function(x){
				if(!CIQ.equals(self.layout[x],layout[x])){
					self.layout[x]=layout[x];
					doDraw=true;
				}
			});
			if(!ciqSlider.is(":visible")) return;
			if(doDraw) {
				self.draw();
				this.drawSlider();
			}
		};
		this.copyData=function(chart){
			//if(!ciqSlider.is(":visible")) return;
			if(!chart.dataSet) return;
			self.chart.symbol=chart.symbol;
			self.masterData=self.chart.masterData=chart.masterData;
			self.chart.dataSet=chart.dataSet;
			self.chart.state=chart.state;
			self.chart.baseline.defaultLevel=chart.baseline.actualLevel;
			self.chart.scroll=self.chart.dataSet.length;
			self.chart.maxTicks=self.chart.scroll+1;
			self.layout.candleWidth=chart.width/(self.chart.maxTicks+1);
			self.draw();
			this.drawSlider();
		};
		this.drawSlider=function(){
			var chartSubholder=stx.chart.panel.subholder, ctx=self.chart.context;
			var left=self.tickLeft=Math.max(stx.tickFromPixel(chartSubholder.offsetLeft), 0);
			var right=self.tickRight=Math.min(left+stx.chart.maxTicks-1, stx.chart.dataSet.length-1);
			var pLeft=self.pixelLeft=self.pixelFromTick(left), pRight=self.pixelRight=self.pixelFromTick(right);
			ctx.save();
			ctx.beginPath();
			ctx.fillStyle=style.backgroundColor;
			ctx.fillRect(subholder.offsetLeft, subholder.offsetTop, pLeft-subholder.offsetLeft, subholder.offsetHeight);
			ctx.fillRect(subholder.offsetWidth, subholder.offsetTop, pRight-subholder.offsetWidth, subholder.offsetHeight);
			ctx.strokeStyle=style.borderColor;
			ctx.lineWidth=parseInt(style.borderWidth,10);
			ctx.moveTo(pLeft,subholder.offsetTop);
			ctx.lineTo(pLeft,subholder.offsetTop+subholder.offsetHeight);
			ctx.moveTo(pRight,subholder.offsetTop);
			ctx.lineTo(pRight,subholder.offsetTop+subholder.offsetHeight);
			ctx.stroke();
			ctx.beginPath();
			ctx.lineWidth=parseInt(style.width,10);
			ctx.lineCap="round";
			ctx.moveTo(pLeft,subholder.offsetTop+subholder.offsetHeight/4);
			ctx.lineTo(pLeft,subholder.offsetTop+3*subholder.offsetHeight/4);
			ctx.moveTo(pRight,subholder.offsetTop+subholder.offsetHeight/4);
			ctx.lineTo(pRight,subholder.offsetTop+3*subholder.offsetHeight/4);
			ctx.stroke();
			ctx.restore();
		};
		stx.addEventListener("layout",function(obj){
			obj.stx.slider.acceptLayoutChange(obj.stx.layout);
		});
		stx.addEventListener("symbolChange",function(obj){
			if(obj.action=="master") obj.stx.slider.setSymbol(obj.symbol);
		});
		stx.addEventListener("symbolImported",function(obj){
			if(obj.action=="master") obj.stx.slider.setSymbol(obj.symbol);
			obj.stx.slider.acceptLayoutChange(obj.stx.layout);
		});
		stx.addEventListener("theme",function(obj){
			self.clearPixelCache();
			self.styles={};
			self.chart.container.style.backgroundColor="";
			var helper=new CIQ.ThemeHelper({stx:obj.stx});
			helper.params.stx=self;
			helper.update();
		});
		stx.append("createDataSet",function(){
			this.slider.copyData(this.chart);
		});
		stx.append("draw",function(){
			if(!ciqSlider.is(":visible")) return;
			if(!self.chart.dataSet) return;
			self.chart.baseline.defaultLevel=this.chart.baseline.actualLevel;
			self.draw();
			this.slider.drawSlider();
		});
		stx.prepend("resizeChart",function(){
			var ciqChart=chartContainer.parent();
			ciqChart.css("height",ciqChart.parent().height()-(ciqSlider.is(":visible")?sliderHeight:0)+"px");
			chartContainer.css('height', ciqChart.height()+'px');
		});
		$(subholder).on("mousedown touchstart pointerdown", function(e){
			var start=e.offsetX || e.originalEvent.layerX;
			if(!start && start!==0) return; // wrong event
			self.startDrag=start;
			self.startPixelLeft=self.pixelLeft;
			self.startPixelRight=self.pixelRight;
			var bw=parseInt(style.borderWidth,10);
			if(self.startDrag<self.pixelRight-bw) self.needsLeft=true;
			if(self.startDrag>self.pixelLeft+bw) self.needsRight=true;
			if(CIQ.touchDevice) return;
			CIQ.appendClassName(e.target,"stx-drag-chart");
		});
		$(subholder).on("mouseup mouseout touchend pointerup", function(e){
			CIQ.unappendClassName(e.target, "stx-drag-chart");
			self.startDrag=null;
			self.needsLeft=false;
			self.needsRight=false;
		});
		$(subholder).on("mousemove touchmove pointermove", function(e){
			if(!self.startDrag && self.startDrag!==0) return;
			var touches=e.originalEvent.touches;
			var movement=(touches && touches.length) ? touches[0].pageX - e.target.offsetLeft : e.offsetX;
			if(!movement && movement!==0) return;  // wrong event
			movement-=self.startDrag;
			var tickLeft=self.tickLeft,tickRight=self.tickRight;
			if(self.needsLeft){
				if(self.startPixelLeft+movement<0) movement=-self.startPixelLeft;
			}
			if(self.needsRight){
				if(self.startPixelRight+movement>self.chart.width) movement=self.chart.width-self.startPixelRight; 
				tickRight=self.tickFromPixel(self.startPixelRight+movement);
			}
			if(self.needsLeft) {
				tickLeft=self.tickFromPixel(self.startPixelLeft+movement);
			}

			var newMaxTicks=tickRight-tickLeft+1;
			var newCandleWidth=stx.chart.width/(newMaxTicks+1);
			if(newMaxTicks>1 && newCandleWidth>=stx.minimumCandleWidth){
				self.tickLeft=tickLeft;
				self.tickRight=tickRight;
				stx.layout.candleWidth=newCandleWidth;
				stx.chart.scroll=stx.chart.dataSet.length-self.tickLeft;
				stx.chart.maxTicks=newMaxTicks;
				stx.micropixels=0;
				stx.draw();
			}
		});
		this.copyData(stx.chart);
	};


	return _exports;
});