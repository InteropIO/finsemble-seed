/* removeIf(umd) */ ;(function(root, factory) {
	if (typeof define === 'function' && define.amd) {
		define(['componentUI'], factory);
	} else if (typeof exports === 'object') {
		module.exports = factory(require('./componentUI'));
	} else {
		factory(root);
	}
})(this, function(_exports) {
	var CIQ = _exports.CIQ;
	/* endRemoveIf(umd) */

	/**
	  * Drawing toolbar web component used to activate and manage available drawings.
	 * 
	 * Emits a "change" event when changed
	 * 
	 * @namespace WebComponents.cq-toolbar
	 * @example
		<cq-toolbar>
			<cq-menu class="ciq-select">
				<span cq-current-tool>Select Tool</span>
				<cq-menu-dropdown>
					<cq-item stxtap="noTool()">None</cq-item>
					<cq-item stxtap="clearDrawings()">Clear Drawings</cq-item>
					<cq-item stxtap="restoreDefaultConfig(true)">Restore Default Parameters</cq-item>
					<cq-item stxtap="tool('measure')">Measure</cq-item>
					<cq-separator></cq-separator>
					<cq-item stxtap="tool('annotation')">Annotation</cq-item>
					<cq-item stxtap="tool('average')">Average Line</cq-item>
					<cq-item stxtap="tool('callout')">Callout</cq-item>
					<cq-item stxtap="tool('channel')">Channel</cq-item>
					<cq-item stxtap="tool('continuous')">Continuous</cq-item>
					<cq-item stxtap="tool('crossline')">Crossline</cq-item>
					<cq-item stxtap="tool('freeform')">Doodle</cq-item>
					<cq-item stxtap="tool('ellipse')">Ellipse</cq-item>
					<cq-item stxtap="tool('retracement')">Fib Retracement</cq-item>
					<cq-item stxtap="tool('fibprojection')">Fib Projection</cq-item>
					<cq-item stxtap="tool('fibarc')">Fib Arc</cq-item>
					<cq-item stxtap="tool('fibfan')">Fib Fan</cq-item>
					<cq-item stxtap="tool('fibtimezone')">Fib Time Zone</cq-item>
					<cq-item stxtap="tool('gannfan')">Gann Fan</cq-item>
					<cq-item stxtap="tool('gartley')">Gartley</cq-item>
					<cq-item stxtap="tool('horizontal')">Horizontal</cq-item>
					<cq-item stxtap="tool('line')">Line</cq-item>
					<cq-item stxtap="tool('pitchfork')">Pitchfork</cq-item>
					<cq-item stxtap="tool('quadrant')">Quadrant Lines</cq-item>
					<cq-item stxtap="tool('ray')">Ray</cq-item>
					<cq-item stxtap="tool('rectangle')">Rectangle</cq-item>
					<cq-item stxtap="tool('regression')">Regression Line</cq-item>
					<cq-item stxtap="tool('segment')">Segment</cq-item>
					<cq-item stxtap="tool('arrow')">Shape - Arrow</cq-item>
					<cq-item stxtap="tool('check')">Shape - Check</cq-item>
					<cq-item stxtap="tool('xcross')">Shape - Cross</cq-item>
					<cq-item stxtap="tool('focusarrow')">Shape - Focus</cq-item>
					<cq-item stxtap="tool('heart')">Shape - Heart</cq-item>
					<cq-item stxtap="tool('star')">Shape - Star</cq-item>
					<cq-item stxtap="tool('speedarc')">Speed Resistance Arc</cq-item>
					<cq-item stxtap="tool('speedline')">Speed Resistance Line</cq-item>
					<cq-item stxtap="tool('timecycle')">Time Cycle</cq-item>
					<cq-item stxtap="tool('tirone')">Tirone Levels</cq-item>
					<cq-item stxtap="tool('trendline')">Trend Line</cq-item>
					<cq-item stxtap="tool('vertical')">Vertical</cq-item>
				</cq-menu-dropdown>
			</cq-menu>
			<cq-toolbar-settings>
				<cq-fill-color cq-section class="ciq-color" stxbind="getFillColor()" stxtap="pickFillColor()">
					<span></span>
				</cq-fill-color>
				<div>
					<cq-line-color cq-section cq-overrides="auto" class="ciq-color" stxbind="getLineColor()" stxtap="pickLineColor()"><span></span></cq-line-color>
					<cq-line-style cq-section>
						<cq-menu class="ciq-select">
							<span cq-line-style class="ciq-line ciq-selected"></span>
							<cq-menu-dropdown class="ciq-line-style-menu">
								<cq-item stxtap="setLine(1,'solid')"><span class="ciq-line-style-option ciq-solid-1"></span></cq-item>
								<cq-item stxtap="setLine(3,'solid')"><span class="ciq-line-style-option ciq-solid-3"></span></cq-item>
								<cq-item stxtap="setLine(5,'solid')"><span class="ciq-line-style-option ciq-solid-5"></span></cq-item>
								<cq-item stxtap="setLine(1,'dotted')"><span class="ciq-line-style-option ciq-dotted-1"></span></cq-item>
								<cq-item stxtap="setLine(3,'dotted')"><span class="ciq-line-style-option ciq-dotted-3"></span></cq-item>
								<cq-item stxtap="setLine(5,'dotted')"><span class="ciq-line-style-option ciq-dotted-5"></span></cq-item>
								<cq-item stxtap="setLine(1,'dashed')"><span class="ciq-line-style-option ciq-dashed-1"></span></cq-item>
								<cq-item stxtap="setLine(3,'dashed')"><span class="ciq-line-style-option ciq-dashed-3"></span></cq-item>
								<cq-item stxtap="setLine(5,'dashed')"><span class="ciq-line-style-option ciq-dashed-5"></span></cq-item>
								<cq-item stxtap="setLine(0,'none')" class="ciq-none">None</cq-item>
							</cq-menu-dropdown>
						</cq-menu>
					</cq-line-style>
				</div>
				<cq-axis-label cq-section>
					<div class="ciq-heading">Axis Label:</div>
					<span stxtap="toggleAxisLabel()" class="ciq-checkbox ciq-active"><span></span></span>
				</cq-axis-label>
				<cq-annotation cq-section>
					<cq-annotation-italic stxtap="toggleFontStyle('italic')" class="ciq-btn" style="font-style:italic;">I</cq-annotation-italic>
					<cq-annotation-bold stxtap="toggleFontStyle('bold')" class="ciq-btn" style="font-weight:bold;">B</cq-annotation-bold>
					<cq-menu class="ciq-select">
						<span cq-font-size>12px</span>
						<cq-menu-dropdown class="ciq-font-size">
							<cq-item stxtap="setFontSize('8px')">8</cq-item>
							<cq-item stxtap="setFontSize('10px')">10</cq-item>
							<cq-item stxtap="setFontSize('12px')">12</cq-item>
							<cq-item stxtap="setFontSize('13px')">13</cq-item>
							<cq-item stxtap="setFontSize('14px')">14</cq-item>
							<cq-item stxtap="setFontSize('16px')">16</cq-item>
							<cq-item stxtap="setFontSize('20px')">20</cq-item>
							<cq-item stxtap="setFontSize('28px')">28</cq-item>
							<cq-item stxtap="setFontSize('36px')">36</cq-item>
							<cq-item stxtap="setFontSize('48px')">48</cq-item>
							<cq-item stxtap="setFontSize('64px')">64</cq-item>
						</cq-menu-dropdown>
					</cq-menu>
					<cq-menu class="ciq-select">
						<span cq-font-family>Default</span>
						<cq-menu-dropdown class="ciq-font-family">
							<cq-item stxtap="setFontFamily('Default')">Default</cq-item>
							<cq-item stxtap="setFontFamily('Helvetica')">Helvetica</cq-item>
							<cq-item stxtap="setFontFamily('Courier')">Courier</cq-item>
							<cq-item stxtap="setFontFamily('Garamond')">Garamond</cq-item>
							<cq-item stxtap="setFontFamily('Palatino')">Palatino</cq-item>
							<cq-item stxtap="setFontFamily('Times New Roman')">Times New Roman</cq-item>
						</cq-menu-dropdown>
					</cq-menu>
				</cq-annotation>
				<cq-clickable cq-fib-settings cq-selector="cq-fib-settings-dialog" cq-method="open" cq-section><span class="ciq-btn">Settings</span></cq-clickable>
				<div cq-toolbar-action="save" stxtap="saveConfig()" cq-section><div cq-toolbar-dirty></div><cq-tooltip>Save Config</cq-tooltip></div>
				<div cq-toolbar-action="restore" stxtap="restoreDefaultConfig()" cq-section><cq-tooltip>Restore Config</cq-tooltip></div>
			</cq-toolbar-settings>
			<cq-measure><span class="mMeasure"></span></cq-measure>
			<cq-undo-section>
				<cq-undo class="ciq-btn">Undo</cq-undo>
				<cq-redo class="ciq-btn">Redo</cq-redo>
			</cq-undo-section>
		</cq-toolbar>
	 */
	var DrawingToolbar = {
		prototype: Object.create(CIQ.UI.ContextTag)
	};

	DrawingToolbar.prototype.attachedCallback=function(){
		if(this.attached) return;
		CIQ.UI.ContextTag.attachedCallback.apply(this);
		this.node=$(this);
		this.params={
			toolSelection:this.node.find("*[cq-current-tool]"),
			lineSelection:this.node.find("*[cq-line-style]"),
			fontSizeSelection:this.node.find("*[cq-font-size]"),
			fontFamilySelection:this.node.find("*[cq-font-family]"),
			fontStyleToggle:this.node.find("cq-annotation-italic"),
			fontWeightToggle:this.node.find("cq-annotation-bold"),
			axisLabelToggle:this.node.find("cq-axis-label .ciq-checkbox"),
			fillColor:this.node.find("cq-fill-color").not("cq-cvp-controller"),
			lineColor:this.node.find("cq-line-color").not("cq-cvp-controller"),
			cvpControllers:this.node.find("cq-cvp-controller")
		};
		this.params.cvpControllers.prop("toolbar",this);
		this.noToolSelectedText="";
		this.attached=true;
	};

	DrawingToolbar.prototype.defaultElements=function(drawingParameters){
		var arr=[];
		for(var param in drawingParameters){
			if(param=="color") arr.push("cq-line-color");
			else if(param=="fillColor") arr.push("cq-fill-color");
			else if(param=="pattern" || param=="lineWidth") arr.push("cq-line-style");
			else if(param=="axisLabel") arr.push("cq-axis-label");
			else if(param=="font") arr.push("cq-annotation");
			else if(param=="parameters") arr.push("cq-clickable");
		}

		return arr;
	};

	DrawingToolbar.prototype.setContext=function(context){
		this.noToolSelectedText=$(this.params.toolSelection).text();
		this.sync();
	};


	/**
	 * Synchronizes the drawing toolbar with stx.currentVectorParameters. Poor man's data binding.
	 * @param {Object} [cvp=stx.currentVectorParameters] A new drawing object, otherwise defaults to the current one
	 * @memberof WebComponents.cq-toolbar
	 */
	DrawingToolbar.prototype.sync=function(cvp){
		var stx=this.context.stx;
		if(!cvp) cvp=stx.currentVectorParameters;
		else stx.currentVectorParameters=cvp;

		this.setLine(null, cvp.lineWidth, cvp.pattern);

		var style=stx.canvasStyle("stx_annotation");	

		var initialSize=(cvp.annotation.font.size || style.fontSize);
		this.setFontSize(null, initialSize);

		var initialFamily=(cvp.annotation.font.family || style.fontFamily);
		this.setFontFamily(null, initialFamily);

		var initialFontStyle=(cvp.annotation.font.style || style.fontStyle);
		$(this.params.fontStyleToggle)[initialFontStyle==='italic'?'addClass':'removeClass']('ciq-active');

		var initialWeight=(cvp.annotation.font.weight || style.fontWeight);
		$(this.params.fontWeightToggle)[(initialWeight==='bold' || initialWeight >= 700) ? 'addClass' : 'removeClass']('ciq-active');

		$(this.params.axisLabelToggle)[cvp.axisLabel?'addClass':'removeClass']('ciq-active');

		this.getFillColor({node:$(this.params.fillColor)});
		this.getLineColor({node:$(this.params.lineColor)});
		
		this.getControllerSettings($(this.params.cvpControllers));

		this.node.find("*[cq-toolbar-dirty]").removeClass("ciq-active");
	};

	DrawingToolbar.prototype.emit=function(){
		// This is old style to support IE11
		var event = document.createEvent('Event');
		event.initEvent('change', true, true);
		this.node.find("*[cq-toolbar-dirty]").addClass("ciq-active");
		this.dispatchEvent(event);
	};

	DrawingToolbar.prototype.noTool=function(){
		var stx=this.context.stx;
		stx.changeVectorType(null);
		if(stx.layout.crosshair){
			stx.layout.crosshair=false;
			stx.changeOccurred("layout");
			stx.doDisplayCrosshairs();
		}
		if(stx.preferences.magnet){
			this.toggleMagnet(this);
		}
		$(this.params.toolSelection).text(this.noToolSelectedText);
		this.node.find("*[cq-section]").removeClass("ciq-active");
		this.emit();
	};

	DrawingToolbar.prototype.crosshairs=function(activator){
		var stx=this.context.stx;
		$(this.params.toolSelection).html($(activator.node).html());
		stx.changeVectorType(null);
		stx.layout.crosshair=true;
		stx.doDisplayCrosshairs();
		stx.findHighlights(false, true);
		stx.changeOccurred("layout");
		stx.draw();
		stx.updateChartAccessories();
		this.node.find("*[cq-section]").removeClass("ciq-active");
		this.emit();
	};

	DrawingToolbar.prototype.toggleMagnet=function(activator){
		var toggle=$(activator.node);//.find("cq-toggle");
		var stx=this.context.stx;
		if(stx.preferences.magnet){
			toggle.removeClass("active");
			stx.preferences.magnet=false;
		}else{
			toggle.addClass("active");
			stx.preferences.magnet=true;
		}
		CIQ.clearCanvas(stx.chart.tempCanvas, stx);
	};

	DrawingToolbar.prototype.clearDrawings=function(){
		this.context.stx.clearDrawings(null,false);
	};

	DrawingToolbar.prototype.restoreDefaultConfig=function(activator, all){
		var stx=this.context.stx;
		CIQ.Drawing.restoreDefaultConfig(stx,stx.currentVectorParameters.vectorType,all);
		this.node.find("*[cq-toolbar-action='restore']").removeClass("ciq-active");
		this.sync();
	};

	DrawingToolbar.prototype.saveConfig=function(){
		var stx=this.context.stx;
		CIQ.Drawing.saveConfig(stx,stx.currentVectorParameters.vectorType);
		this.node.find("*[cq-toolbar-action='restore']").addClass("ciq-active");
		this.sync();
	};

	DrawingToolbar.prototype.tool=function(activator, toolName){
		var stx=this.context.stx;
		stx.clearMeasure();
		stx.changeVectorType(toolName);
		$(this.params.toolSelection).html($(activator.node).html());

		this.node.find("*[cq-section]").removeClass("ciq-active");
		var drawingParameters=CIQ.Drawing.getDrawingParameters(stx, toolName);
		if(drawingParameters){
			this.node.find("*[cq-toolbar-action='save']").addClass("ciq-active");
			drawingPrefs=stx.preferences.drawings;
			if(drawingPrefs && drawingPrefs[toolName]) this.node.find("*[cq-toolbar-action='restore']").addClass("ciq-active");
			// fibtimezone has no values to display in the settings dialog
			if(toolName === 'fibtimezone') {
				delete drawingParameters.parameters;
			}

			var none=$(this.params.lineSelection).parent().find(".ciq-none");
			none.hide();
			var elements=this.defaultElements(drawingParameters);
			for(var i=0;i<elements.length;i++){
				$(this.node).find(elements[i]).addClass("ciq-active");
				if(elements[i]=="cq-fill-color") none.show();
			}
			elements = CIQ.Drawing[toolName].prototype.$controls;
			for (i = 0; elements && i < elements.length; i++) {
				$(this.node).find(elements[i]).addClass('ciq-active');
			}
		}
		this.sync();
	};

	DrawingToolbar.prototype.setLine=function(activator, width, pattern){
		var stx=this.context.stx;

		stx.currentVectorParameters.lineWidth=width;
		stx.currentVectorParameters.pattern=pattern;
		this.setFibs(width, pattern);
		if(this.currentLineSelectedClass) $(this.params.lineSelection).removeClass(this.currentLineSelectedClass);
		this.currentLineSelectedClass="ciq-"+pattern+"-"+parseInt(width,10);
		if(pattern=="none"){
			this.currentLineSelectedClass=null;
		}else{
			$(this.params.lineSelection).addClass(this.currentLineSelectedClass);
		}
		this.emit();
	};

	DrawingToolbar.prototype.setFibs=function(width, pattern){
		var fib=this.context.stx.currentVectorParameters.fibonacci;
		if(fib){
			for(var i=0;i<fib.fibs.length;i++){
				fib.fibs[i].parameters.lineWidth=width;
				fib.fibs[i].parameters.pattern=pattern;
			}
			fib.timezone.parameters.lineWidth=width;
			fib.timezone.parameters.pattern=pattern;
		}
	};

	DrawingToolbar.prototype.setFontSize=function(activator, fontSize){
		var stx=this.context.stx;

		stx.currentVectorParameters.annotation.font.size=fontSize;
		$(this.params.fontSizeSelection).text(fontSize);
		this.emit();
	};

	DrawingToolbar.prototype.setFontFamily=function(activator, fontFamily){
		var stx=this.context.stx;

		if(fontFamily=="Default"){
			stx.currentVectorParameters.annotation.font.family=null;
		}else{
			stx.currentVectorParameters.annotation.font.family=fontFamily;
		}
		$(this.params.fontFamilySelection).text(fontFamily);
		this.emit();
	};

	DrawingToolbar.prototype.toggleFontStyle=function(activator, fontStyle){
		var stx=this.context.stx;

		if(fontStyle=="italic"){
			if(stx.currentVectorParameters.annotation.font.style=="italic"){
				stx.currentVectorParameters.annotation.font.style=null;
				$(activator.node).removeClass("ciq-active");
			}else{
				stx.currentVectorParameters.annotation.font.style="italic";
				$(activator.node).addClass("ciq-active");
			}
		}else if(fontStyle=="bold"){
			if(stx.currentVectorParameters.annotation.font.weight=="bold"){
				stx.currentVectorParameters.annotation.font.weight=null;
				$(activator.node).removeClass("ciq-active");
			}else{
				stx.currentVectorParameters.annotation.font.weight="bold";
				$(activator.node).addClass("ciq-active");
			}
		}
		this.emit();
	};

	DrawingToolbar.prototype.toggleAxisLabel=function(activator){
		var stx=this.context.stx;

		if(stx.currentVectorParameters.axisLabel===true){
			stx.currentVectorParameters.axisLabel=false;
			$(activator.node).removeClass("ciq-active");
		}else{
			stx.currentVectorParameters.axisLabel=true;
			$(activator.node).addClass("ciq-active");
		}
		this.emit();
	};

	DrawingToolbar.prototype.getFillColor=function(activator){
		var node=activator.node;
		var color=this.context.stx.currentVectorParameters.fillColor;
		if(color=="transparent" || color=="auto") color="";
		$(node).css({"background-color": color});
	};

	DrawingToolbar.prototype.pickFillColor=function(activator){
		var node=activator.node;
		var colorPickers=$("cq-color-picker");
		if(!colorPickers.length){
			console.log("DrawingToolbar.prototype.pickFillColor: no ColorPicker available");
			return;
		}
		var colorPicker=colorPickers[0];
		var self=this;
		colorPicker.callback=function(color){
			self.context.stx.currentVectorParameters.fillColor=color;
			self.getFillColor({node:node});
			self.emit();
		};
		colorPicker.display({node:node});
	};

	DrawingToolbar.prototype.getLineColor=function(activator){
		var node=activator.node;
		var color=this.context.stx.currentVectorParameters.currentColor;
		if(color=="transparent" || color=="auto") color="";
		$(node).css({"background-color": color});
	};

	DrawingToolbar.prototype.pickLineColor=function(activator){
		var node=activator.node;
		var colorPickers=$("cq-color-picker");
		if(!colorPickers.length){
			console.log("DrawingToolbar.prototype.pickLineColor: no ColorPicker available");
			return;
		}
		var colorPicker=colorPickers[0];
		var self=this;
		colorPicker.callback=function(color){
			self.context.stx.currentVectorParameters.currentColor=color;
			self.getLineColor({node:node});
			self.emit();
		};
		var overrides=$(node).attr("cq-overrides");
		if(overrides) overrides=overrides.split(",");
		colorPicker.display({node:node, overrides:overrides});
	};

	DrawingToolbar.prototype.getControllerSettings=function(controls){
		var cvp=this.context.stx.currentVectorParameters;
		for(var i=0; i<controls.length; i++){
			var node=$(controls[i]), header=node.attr("cq-cvp-header");
			if(cvp["active"+header]){
				node.find(".ciq-checkbox").addClass("ciq-active");
			}else{
				node.find(".ciq-checkbox").removeClass("ciq-active");
			}
			var color=cvp["color"+header];
			if(!color || color=="transparent" || color=="auto") color="";
			node.find("cq-line-color").css({"background-color": color});

			if(cvp["lineWidth"+header] && cvp["pattern"+header]){
				var newClassName="ciq-"+cvp["pattern"+header]+"-"+cvp["lineWidth"+header];
				node.find("[cq-cvp-line-style]").attr("class","ciq-line ciq-selected "+newClassName);
			}else{
				node[0].setContext();
			}
		}
	};


	CIQ.UI.DrawingToolbar=document.registerElement("cq-toolbar", DrawingToolbar);

	/* removeIf(umd) */
	return _exports;
});
/* endRemoveIf(umd) */
