/**
 * Share chart modal dialog window component
 * @module components/Modals/ShareChartModal
 */

import React from 'react'

/**
 *  ShareStatus enumeration
 */
const ShareStatus = Object.freeze({
	HIDDEN: "HIDDEN",
	SHOW: "SHOW",
	GENERATING: "GENERATING",
	UPLOADING: "UPLOADING",
	COMPLETE: "COMPLETE",
	ERROR: "ERROR"
});

/**
 * Share chart modal dialog window componetnt
 *
 * @class ShareChartModal
 * @extends {React.Component}
 */
class ShareChartModal extends React.Component {
	constructor(props) {
		super(props);
		var self = this;
	}

	shareChart() {
		if (!this.props.ciq) return;

		var stx = this.props.ciq;
		var props = this.props;

		this.props.setShareStatus(ShareStatus.GENERATING);

		CIQ.Share.createImage(stx, {}, function (data) {

			var id = CIQ.uniqueID();
			var host = "https://share.chartiq.com";
			var startOffset = stx.getStartDateOffset();

			var metaData = {
				"layout": stx.exportLayout(),
				"drawings": stx.exportDrawings(),
				"xOffset": startOffset,
				"startDate": stx.chart.dataSegment[startOffset].Date,
				"endDate": stx.chart.dataSegment[stx.chart.dataSegment.length - 1].Date,
				"id": id,
				"symbol": stx.chart.symbol
			};

			var url = host + "/upload/" + id;
			var payload = { "id": id, "image": data, "config": metaData };

			props.setShareStatus(ShareStatus.UPLOADING);
			CIQ.Share.uploadImage(data, url, payload, function (err, response) {
				if (err !== null) {
					props.setShareStatus(ShareStatus.ERROR, err);
				}
				else {
					props.setShareStatus(ShareStatus.COMPLETE, host + response);
				}
			});
		});

	}

	getShareStatus() {
		switch (this.props.shareStatus) {
			case ShareStatus.GENERATING:
				return "Generating Image";
			case ShareStatus.UPLOADING:
				return "Uploading Image";
			case ShareStatus.COMPLETE:
				return "Image available below:";
			case ShareStatus.ERROR:
				return "Error occurred:";
			default:
				return null;
		}
	}

	render() {
		if (!this.props.shareStatus || this.props.shareStatus == ShareStatus.HIDDEN) return (<span></span>)
		return (
			<div className="ciq dialog-overlay">
				<div className="ciq dialog share">
					<div className="cq-close" onClick={() => { this.props.setShareStatus(ShareStatus.HIDDEN) }}></div>
					<div className="dialog-heading">
						Share Your Chart
					</div>
					<hr className="ciq-separator" />
					<div className="ciq-dialog-cntrls">
						<div className="ciq-btn" onClick={() => { this.shareChart() }}>Create Image</div>
					</div>
					<div className="ciq-dialog-cntrls">
						{this.getShareStatus()}
					</div>
					<div className="ciq-dialog-cntrls share-link-div">
						{([ShareStatus.COMPLETE, ShareStatus.ERROR].indexOf(this.props.shareStatus) >= 0) ? this.props.shareStatusMsg : null}
					</div>
					<hr className="ciq-separator" />
					<div className="ciq-dialog-cntrls">
						<div className="ciq-btn" onClick={() => { this.props.setShareStatus(ShareStatus.HIDDEN) }}>Done</div>
					</div>
					<div className="clearFloat"></div>
				</div>
			</div>
		)
	}
}

module.exports = ShareChartModal;
