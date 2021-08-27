/**
 *	8.3.99
 *	Generation date: 2021-05-21T20:54:02.745Z
 *	Client name: finsemble
 *	Package Type: Technical Analysis
 *	License type: annual
 *	Expiration date: "2022/07/20"
 *	Domain lock: ["127.0.0.1","localhost","chartiq.com","finsemble.com"]
 *	iFrame lock: true
 */

/***********************************************************
 * Copyright by ChartIQ, Inc.
 * Licensed under the ChartIQ, Inc. Developer License Agreement https://www.chartiq.com/developer-license-agreement
*************************************************************/
/*************************************** DO NOT MAKE CHANGES TO THIS LIBRARY FILE!! **************************************/
/* If you wish to overwrite default functionality, create a separate file with a copy of the methods you are overwriting */
/* and load that file right after the library has been loaded, but before the chart engine is instantiated.              */
/* Directly modifying library files will prevent upgrades and the ability for ChartIQ to support your solution.          */
/*************************************************************************************************************************/
/* eslint-disable no-extra-parens */


/*
	Option Sentiment by Strike
	==========================
	Requires a quotefeed which creates an optionChain object in the masterData.  See examples/feeds/optionChainSimulator.js
*/
import { CIQ } from "../../js/chartiq.js";
if (!CIQ.Studies) {
	console.error(
		"optionSentimentByStrike feature requires first activating studies feature."
	);
} else {
	/**
	 * Creates a profile of option contract volume at strike prices for a security's most current
	 * data point. The study is displayed as a chart underlay that is always 25% of the chart's
	 * width.
	 *
	 * **Note:** This study is displayed on the chart panel, sharing the y-axis with the chart.
	 *
	 * @param {CIQ.ChartEngine} stx A reference to the chart object.
	 * @param {CIQ.Studies.StudyDescriptor} sd Provides information that characterizes the study.
	 * @param {array} quotes An array of quotes from which the study is constructed.
	 *
	 * @memberof CIQ.Studies
	 * @since 8.1.0
	 */
	CIQ.Studies.displayOptionSentimentByStrike = function (stx, sd, quotes) {
		if (!stx || !stx.chart.dataSet) return;
		const { chart, layout } = stx;
		if (
			layout.periodicity > 1 ||
			(!stx.dontRoll &&
				(layout.interval === "week" || layout.interval === "month"))
		) {
			stx.displayErrorAsWatermark(
				"chart",
				stx.translateIf(
					"Sentiment By Strike not available on consolidated data"
				)
			);
			return;
		}
		const field = sd.inputs.Field || "volume";
		const contractType = sd.inputs["Contract Type"] || "both";
		//set defaults
		let displayQuantity = sd.inputs["Display Quantity"] !== false;
		let widthPercentage = sd.parameters.widthPercentage;
		if (!widthPercentage || widthPercentage < 0) widthPercentage = 0.25;
		let optionChain, displayDate;
		for (let dsIndex = quotes.length - 1; dsIndex >= 0; dsIndex--) {
			const segmentRecord = quotes[dsIndex];
			if (!segmentRecord) continue;
			const record = stx.chart.dataSet[segmentRecord.tick];
			if (!record) continue;
			optionChain = record.optionChain;
			displayDate = record.displayDate || record.DT;
			if (optionChain) break;
		}
		if (!optionChain) {
			stx.displayErrorAsWatermark(
				"chart",
				stx.translateIf("No option data found")
			);
			return;
		}
		let volumeMax = 0; // this is the maximum volume after we group them by the bars we will draw
		const volByStrike = {};
		for (let opt in optionChain) {
			const option = optionChain[opt];
			const strike = option.strike.value,
				volume = option[field].value,
				callorput = option.callorput.value;
			if (!volByStrike[strike]) volByStrike[strike] = { call: 0, put: 0 };
			let vbs = volByStrike[strike];
			if (callorput == "C") vbs.call += volume;
			else if (callorput == "P") vbs.put += volume;
			volumeMax = Math.max(
				volumeMax,
				vbs.call,
				vbs.put,
				contractType == "combined" ? vbs.call + vbs.put : 0
			);
		}
		if (volumeMax === 0) {
			stx.displayErrorAsWatermark(
				"chart",
				stx.translateIf("No sentiment data to render")
			);
			return;
		}
		const context = sd.getContext(stx);
		const fontstyle = "stx-float-date";
		stx.canvasFont(fontstyle, context);
		const txtHeight = stx.getCanvasFontSize(fontstyle);
		const panel = chart.panel;
		const { top: chartTop, bottom: chartBottom } = panel.yAxis;
		let { high: priceHigh, low: priceLow } = panel.yAxis;
		const chartRight = chart.right;
		const barMaxHeight = chart.width * widthPercentage; // pixels for highest bar
		const self = stx;
		if (chart.untransformFunc) {
			priceHigh = chart.untransformFunc(stx, chart, priceHigh);
			priceLow = chart.untransformFunc(stx, chart, priceLow);
		}
		stx.startClip(panel.name);
		context.globalAlpha = 0.5;
		context.fillStyle = self.defaultColor;
		context.lineWidth = 10;
		context.textBaseline = "middle";
		const types = ["put", "call"];
		if (contractType === "call") types.shift();
		else if (contractType === "put") types.pop();
		const message =
			field == "volume"
				? "Option volume data for"
				: "Option open interest data as of";
		const pricePixels = {};
		const volByStrikeKeys = Object.keys(volByStrike);
		let prevPixel;
		let smallestGap;
		for (let i = 0; i < volByStrikeKeys.length; i++) {
			let price = volByStrikeKeys[i];
			if (price > priceHigh || price < priceLow) continue;
			let pixel = self.pixelFromPrice(parseFloat(price), panel);
			pricePixels[price] = pixel;
			if (prevPixel) {
				let gap = Math.abs(prevPixel - pixel);
				if (smallestGap === undefined || gap < smallestGap) smallestGap = gap;
			}
			prevPixel = pixel;
		}
		const linesPerVolume = contractType === "both" ? 2 : 1.05; // leave tiny gap for stacking same-color bars
		if (smallestGap < context.lineWidth * linesPerVolume) {
			context.lineWidth = smallestGap / linesPerVolume;
			displayQuantity = false;
		}
		types.forEach((j) => {
			context.strokeStyle = CIQ.Studies.determineColor(
				sd.outputs[j === "call" ? "Calls" : "Puts"]
			);
			context.beginPath();
			for (let i in volByStrike) {
				let volume = volByStrike[i][j];
				let pixel = pricePixels[i];
				if (volume && pixel) {
					let barBottom = Math.round(chartRight) - 0.5; //bottom x coordinate for the bar  -- remember bars are sideways so the bottom is on the x axis
					if (contractType == "both") {
						let pixelShift = context.lineWidth / 2;
						if (j === "call") pixelShift *= -1;
						if (panel.yAxis.flipped) pixelShift *= -1;
						pixel += pixelShift;
					} else if (contractType == "combined") {
						if (j === "call")
							barBottom -= (volByStrike[i].put * barMaxHeight) / volumeMax;
					}
					if (
						pixel - context.lineWidth > chartBottom ||
						pixel + context.lineWidth < chartTop
					)
						continue;
					const barTop = barBottom - (volume * barMaxHeight) / volumeMax;
					context.moveTo(barTop, pixel);
					context.lineTo(barBottom, pixel);
					if (contractType == "combined") {
						if (j === "put") continue;
						volume += volByStrike[i].put;
					}
					if (displayQuantity) {
						//write the volume on the bar **/
						const txt = volume; //CIQ.condenseInt(volume);
						let width;
						try {
							width = context.measureText(txt).width;
						} catch (e) {
							width = 0;
						}
						context.fillText(txt, barTop - width - 3, pixel + 1);
					}
				}
			}
			if (!sd.highlight && stx.highlightedDraggable) context.globalAlpha *= 0.3;
			context.stroke();
			context.closePath();
		});
		context.textAlign = "right";
		context.fillText(
			stx.translateIf(message) +
				" " +
				CIQ.displayableDate(stx, chart, displayDate),
			chartRight - 10,
			chartTop + 10
		);
		context.fillText(
			stx.translateIf("(Adjust y-axis if necessary)"),
			chartRight - 10,
			chartTop + 10 + txtHeight
		);
		stx.endClip();
		context.globalAlpha = 1;
	};
	CIQ.Studies.studyLibrary = CIQ.extend(CIQ.Studies.studyLibrary, {
		"Sentiment By Strike": {
			name: "Option Sentiment By Strike",
			underlay: true,
			seriesFN: CIQ.Studies.displayOptionSentimentByStrike,
			calculateFN: null,
			inputs: {
				Field: ["volume", "openinterest"],
				"Contract Type": ["both", "call", "put", "combined"],
				"Display Quantity": true
			},
			outputs: { Calls: "#f8ae63", Puts: "#b64a96" },
			parameters: {
				init: {
					widthPercentage: 0.25
				}
			},
			customRemoval: true,
			attributes: {
				yaxisDisplayValue: { hidden: true },
				panelName: { hidden: true },
				flippedEnabled: { hidden: true }
			}
		}
	});
}
