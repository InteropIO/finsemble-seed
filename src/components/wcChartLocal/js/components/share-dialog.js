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
	 * Share Dialog web component `<cq-share-dialog>`.
	 *
	 * @namespace WebComponents.cq-share-dialog
	 * @example
	 <cq-dialog>
	 	<cq-share-dialog>
	 		<div>
	 			<h4 class="title">Share Your Chart</h4>
	 			<cq-separator></cq-separator>
	 			<p>Press this button to generate a shareable image:</p>
	 				<div class="ciq-btn" stxtap="share()">
	 						Create Image
	 				</div>

	 			<div class="share-link-div"></div>

	 			<cq-separator></cq-separator>
	 			<div class="ciq-dialog-cntrls">
	 				<div stxtap="close()" class="ciq-btn">Done</div>
	 			</div>

	 		</div>
	 	</cq-share-dialog>
	 </cq-dialog>
	 */
	var ShareDialog = {
		prototype: Object.create(CIQ.UI.DialogContentTag)
	};

	ShareDialog.prototype.setState=function(state){
		this.node.find("cq-share-create").css({"display":"none"});
		this.node.find("cq-share-generating").css({"display":"none"});
		this.node.find("cq-share-uploading").css({"display":"none"});
		this.node.find("cq-share-" + state).css({"display":"inline-block"});
	};

	ShareDialog.prototype.close=function(){
		// Clear out the link and then close
		$("cq-share-dialog .share-link-div").html("");
		CIQ.UI.DialogContentTag.close.apply(this);
	};

	/**
	 * Shares a chart with default parameters
	 * @alias share
	 * @memberof WebComponents.cq-share-dialog
	 */
	ShareDialog.prototype.share=function(){
		var stx=this.context.stx;
		var self=this;
		this.setState("generating");
		$("cq-share-dialog .share-link-div").html("");
		// "hide" is a selector list, of DOM elements to be hidden while an image of the chart is created.  "cq-comparison-add-label" and ".chartSize" are hidden by default.
		CIQ.UI.bypassBindings=true;
		CIQ.Share.createImage(stx, {hide:[".stx_chart_controls", ".stx-btn-panel", ".stx_jump_today", ".stx-baseline-handle"]}, function(data){
			CIQ.UI.bypassBindings=false;
			var id=CIQ.uniqueID();
			var host="https://share.chartiq.com";
			var startOffset=stx.getStartDateOffset();
			var metaData={
				"layout":stx.exportLayout(),
				"drawings":stx.exportDrawings(),
				"xOffset":startOffset,
				"startDate":stx.chart.dataSegment[startOffset].Date,
				"endDate":stx.chart.dataSegment[stx.chart.dataSegment.length-1].Date,
				"id":id,
				"symbol":stx.chart.symbol
			};
			var url= host + "/upload/" + id;
			var payload={"id":id,"image":data,"config":metaData};

			self.setState("uploading");
			CIQ.Share.uploadImage(data, url, payload, function(err, response){
				self.setState("create");
				if(err!==null){
					CIQ.alert("error: "+err);
				}
				else {
					$("cq-share-dialog .share-link-div").html(host+response);
				}
			});
		});
	};

	CIQ.UI.ShareDialog=document.registerElement("cq-share-dialog", ShareDialog);

  /* removeIf(umd) */
	return _exports;
});
/* endRemoveIf(umd) */
