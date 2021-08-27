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
 *
 * Visual Earnings (Estimize) package.
 *
 */

import { CIQ } from "../../js/componentUI.js";
import config from "./config.js";

var _css;

if (
	typeof define === "undefined" &&
	typeof module === "object" &&
	typeof require === "function"
) {
	_css = require("./visualearnings.css");
} else if (typeof define === "function" && define.amd) {
	define(["./visualearnings.css"], function (m1) {
		_css = m1;
	});
}

function Estimize() {
	this.display = true;
	this.data = null;
	this.forwardConsensus = [];
	this.estimates = [];
	this.url = "https://services.chartiq.com/visualearnings";
	this.currentWatermark = {};
}

Estimize.prototype.enabled = false;

Estimize.EPS = 0;
Estimize.REVENUE = 1;
Estimize.QONQ = 2;
Estimize.DATA = 3;

// Consolidates simply by taking latest data
Estimize.prototype.consolidate = function (quotes, start, end, quote) {
	for (var i = start; i <= end; i++) {
		var q = quotes[i];
		if (!q) return;
		if (q["estimize:eps"]) {
			for (var j in q) {
				if (j.indexOf("estimize:") != -1) {
					quote[j] = q[j];
				}
			}
		}
	}
};

// Estimizes older data doesn't have exact release dates
Estimize.prototype.isExactQuarter = function (dt) {
	if (dt.getFullYear() >= 2012) return false;
	var m = dt.getMonth();
	var d = dt.getDate();
	if (m == 2 && d == 1) return true;
	if (m == 5 && d == 1) return true;
	if (m == 8 && d == 1) return true;
	if (m == 11 && d == 1) return true;
	return false;
};

Estimize.prototype.appendMasterData = function (stx, appendQuotes, chart) {
	if (!this.enabled) return;
	if (this.data) this.processMasterData(this.data, chart);
};

Estimize.prototype.calculateEPSPercent = function (current, prior) {
	if (current > 0 && prior > 0) return (current - prior) / prior;
	if (current < 0 && prior < 0)
		return (Math.abs(prior) - Math.abs(current)) / Math.abs(prior);
	return null;
};

Estimize.prototype.processMasterData = function (data, chart) {
	if (!CIQ.ChartEngine.isDailyInterval(this.ciq.layout.interval)) return; // Don't process estimize on intraday charts
	function sortme(l, r) {
		if (l.release_date < r.release_date) return -1;
		if (l.release_date > r.release_date) return 1;
		return 0;
	}
	data.releases.sort(sortme);
	this.forwardConsensus = [];
	var trailingEvents = [];
	this.releasePriceEarnings = null; // This will be set with the PE at the time of the last release (not the PE as of today)
	this.releasePriceSales = null; // This will be set with the PS at the time of the last release

	var fiscalMap = {};
	var i,
		j = 0,
		name;
	var lastKnownGoodDate = null;
	var lastGoodEPS = 0;
	var lastGoodRev = 0;
	var thisAfternoon = false;
	for (i in data.releases) {
		var release = data.releases[i];
		release.DT = CIQ.strToDate(
			CIQ.yyyymmddhhmm(new Date(release.release_date))
		);
		release.isEvening = release.release_date.substr(11, 2) > 12;
		if (this.isExactQuarter(release.DT)) {
			release.noReleaseDate = true;
		}
		if (
			release.noReleaseDate &&
			lastKnownGoodDate &&
			release.DT.getDate() == 1
		) {
			lastKnownGoodDate.setMonth(lastKnownGoodDate.getMonth() + 3);
			release.DT = new Date(lastKnownGoodDate.getTime());
		}
		name = release.fiscal_year + ":" + release.fiscal_quarter;
		fiscalMap[name] = release.DT;
		while (chart.masterData) {
			var ohlc, jj;
			if (j == chart.masterData.length - 1) {
				// Check boundary case for when release is today but earnings not yet announced
				if (!release.eps && !release.revenue) {
					thisAfternoon = true;
				}
			}
			if (j >= chart.masterData.length || thisAfternoon === true) {
				var fwObj = {
					DT: release.DT,
					Date: release.release_date,
					"estimize:is_evening_release": release.isEvening,
					"estimize:eps": release.eps,
					"estimize:revenue": release.revenue,
					"estimize:consensus_revenue_estimate":
						release.consensus_revenue_estimate,
					"estimize:consensus_eps_estimate": release.consensus_eps_estimate,
					"estimize:wallstreet_revenue_estimate":
						release.wallstreet_revenue_estimate,
					"estimize:wallstreet_eps_estimate": release.wallstreet_eps_estimate,
					"estimize:actual_annualized_eps": 0,
					"estimize:actual_annualized_revenue": 0,
					"estimize:annualized_consensus_revenue_estimate": 0,
					"estimize:annualized_consensus_eps_estimate": 0,
					"estimize:annualized_wallstreet_revenue_estimate": 0,
					"estimize:annualized_wallstreet_eps_estimate": 0,
					"estimize:prior_price_earnings": this.releasePriceEarnings,
					"estimize:prior_price_sales": this.releasePriceSales
				};
				trailingEvents.push(fwObj);
				if (trailingEvents.length == 5) trailingEvents.splice(0, 1);
				// We'll only have to deal with actual_annualized_eps if the company has announced earnings
				// before we get today's quote. This could happen in the morning, or in the brief period
				// before we actually get today's intraday quote
				if (release.eps) {
					ohlc["estimize:actual_annualized_eps"] = 0;
					ohlc["estimize:actual_annualized_revenue"] = 0;
					for (jj = 0; jj < 4; jj++) {
						if (trailingEvents[jj]["estimize:eps"]) {
							ohlc["estimize:actual_annualized_eps"] +=
								trailingEvents[jj]["estimize:eps"];
						}
						if (trailingEvents[jj]["estimize:revenue"]) {
							ohlc["estimize:actual_annualized_revenue"] +=
								trailingEvents[jj]["estimize:revenue"];
						}
					}
				}

				// Add up 4 quarters to come up with annualized eps & revenue. First start with any actuals and then add in estimates.
				// Next quarter will consist of 3 actuals and 1 estimate. Following quarter consists of 2 actuals and 1 estimate. etc
				// The computed annualized EPS will be used to plot out the horizon
				var hasConsensusRevenue = false;
				var hasConsensusEPS = false;
				for (jj = 0; jj < 4; jj++) {
					var teObj = trailingEvents[jj];
					if (!teObj) continue;
					if (teObj["estimize:eps"]) {
						fwObj["estimize:annualized_consensus_revenue_estimate"] +=
							teObj["estimize:revenue"];
						fwObj["estimize:annualized_consensus_eps_estimate"] +=
							teObj["estimize:eps"];
						fwObj["estimize:annualized_wallstreet_revenue_estimate"] +=
							teObj["estimize:revenue"];
						fwObj["estimize:annualized_wallstreet_eps_estimate"] +=
							teObj["estimize:eps"];
					} else {
						if (teObj["estimize:consensus_revenue_estimate"]) {
							hasConsensusRevenue = true;
							fwObj["estimize:annualized_consensus_revenue_estimate"] +=
								teObj["estimize:consensus_revenue_estimate"];
						} else {
							fwObj["estimize:annualized_consensus_revenue_estimate"] +=
								teObj["estimize:wallstreet_revenue_estimate"];
						}
						if (teObj["estimize:consensus_eps_estimate"]) {
							hasConsensusEPS = true;
							fwObj["estimize:annualized_consensus_eps_estimate"] +=
								teObj["estimize:consensus_eps_estimate"];
						} else {
							fwObj["estimize:annualized_consensus_eps_estimate"] +=
								teObj["estimize:wallstreet_eps_estimate"];
						}
						fwObj["estimize:annualized_wallstreet_revenue_estimate"] +=
							teObj["estimize:wallstreet_revenue_estimate"];
						fwObj["estimize:annualized_wallstreet_eps_estimate"] +=
							teObj["estimize:wallstreet_eps_estimate"];
					}
					// If any of the estimates are missing then nullify that annualized portion
					if (!teObj["estimize:wallstreet_revenue_estimate"])
						fwObj["estimize:annualized_wallstreet_revenue_estimate"] = null;
					if (!teObj["estimize:wallstreet_eps_estimate"])
						fwObj["estimize:annualized_wallstreet_eps_estimate"] = null;
				}
				if (!hasConsensusRevenue)
					fwObj["estimize:annualized_consensus_revenue_estimate"] = null;
				if (!hasConsensusEPS)
					fwObj["estimize:annualized_consensus_eps_estimate"] = null;
				this.forwardConsensus.push(fwObj);
				lastKnownGoodDate = new Date(release.DT);
				break;
			}
			ohlc = chart.masterData[j];
			if (release.DT < ohlc.DT && j === 0) break;
			if (release.DT.getTime() <= ohlc.DT.getTime() && !thisAfternoon) {
				ohlc["estimize:is_evening_release"] = release.isEvening;
				ohlc["estimize:eps"] = release.eps;
				ohlc["estimize:revenue"] = release.revenue;
				ohlc["estimize:consensus_revenue_estimate"] =
					release.consensus_revenue_estimate;
				ohlc["estimize:consensus_eps_estimate"] =
					release.consensus_eps_estimate;
				ohlc["estimize:wallstreet_revenue_estimate"] =
					release.wallstreet_revenue_estimate;
				ohlc["estimize:wallstreet_eps_estimate"] =
					release.wallstreet_eps_estimate;
				ohlc["estimize:actual_annualized_eps"] = 0;
				ohlc["estimize:actual_annualized_revenue"] = 0;
				ohlc["estimize:annualized_consensus_revenue_estimate"] = 0;
				ohlc["estimize:annualized_consensus_eps_estimate"] = 0;
				ohlc["estimize:annualized_wallstreet_revenue_estimate"] = 0;
				ohlc["estimize:annualized_wallstreet_eps_estimate"] = 0;
				if (release.noReleaseDate) {
					ohlc["estimize:no_release_date"] = true;
				}
				if (release.eps) {
					lastGoodEPS = release.eps;
				} else {
					ohlc["estimize:eps"] = lastGoodEPS;
					ohlc["estimize:missingEPS"] = true;
				}
				if (release.revenue) {
					lastGoodRev = release.revenue;
				} else {
					ohlc["estimize:revenue"] = lastGoodRev;
					ohlc["estimize:missingRevenue"] = true;
				}

				if (this.releasePriceEarnings) {
					ohlc["estimize:prior_price_earnings"] = this.releasePriceEarnings;
				}
				if (release.DT.getDate() != 1) {
					lastKnownGoodDate = new Date(release.DT);
				}
				trailingEvents.push(ohlc);
				while (trailingEvents.length < 4) {
					// Ensure we always have 4 quarters of estimates
					trailingEvents.push(ohlc);
				}
				if (trailingEvents.length == 5) trailingEvents.splice(0, 1);
				for (jj = 0; jj < 4; jj++) {
					ohlc["estimize:actual_annualized_eps"] +=
						trailingEvents[jj]["estimize:eps"];
					ohlc["estimize:actual_annualized_revenue"] +=
						trailingEvents[jj]["estimize:revenue"];
				}
				if (ohlc["estimize:consensus_revenue_estimate"])
					ohlc["estimize:annualized_consensus_revenue_estimate"] =
						ohlc["estimize:actual_annualized_revenue"] -
						trailingEvents[3]["estimize:revenue"] +
						ohlc["estimize:consensus_revenue_estimate"];
				if (ohlc["estimize:consensus_eps_estimate"])
					ohlc["estimize:annualized_consensus_eps_estimate"] =
						ohlc["estimize:actual_annualized_eps"] -
						trailingEvents[3]["estimize:eps"] +
						ohlc["estimize:consensus_eps_estimate"];
				if (ohlc["estimize:wallstreet_revenue_estimate"])
					ohlc["estimize:annualized_wallstreet_revenue_estimate"] =
						ohlc["estimize:actual_annualized_revenue"] -
						trailingEvents[3]["estimize:revenue"] +
						ohlc["estimize:wallstreet_revenue_estimate"];
				if (ohlc["estimize:wallstreet_eps_estimate"])
					ohlc["estimize:annualized_wallstreet_eps_estimate"] =
						ohlc["estimize:actual_annualized_eps"] -
						trailingEvents[3]["estimize:eps"] +
						ohlc["estimize:wallstreet_eps_estimate"];
				if (i > 3) {
					var fourQuartersAgo = data.releases[i - 4];
					if (fourQuartersAgo.eps) {
						ohlc["estimize:actual_qonq_eps"] = this.calculateEPSPercent(
							ohlc["estimize:eps"],
							fourQuartersAgo.eps
						);
					} else {
						ohlc["estimize:actual_qonq_eps"] = null;
					}
					if (fourQuartersAgo.revenue) {
						ohlc["estimize:actual_qonq_revenue"] =
							(ohlc["estimize:revenue"] - fourQuartersAgo.revenue) /
							fourQuartersAgo.revenue;
					} else {
						ohlc["estimize:actual_qonq_revenue"] = 0;
					}
				}
				// Use the opening price the day after a release. Unless we don't have an opening price (the release was yesterday)
				// in which case fall back to the close of the day of the release
				if (this.releasePriceSales)
					ohlc["estimize:prior_price_sales"] = this.releasePriceSales;
				if (j + 1 < chart.masterData.length) {
					var oohlc = chart.masterData[j + 1];
					var ratio = 1;
					if (oohlc.Split_Close) ratio = oohlc.Split_Close / oohlc.Close; // Historical earnings from estimize are split pro-rated
					this.releasePriceEarnings =
						(oohlc.Open * ratio) / ohlc["estimize:actual_annualized_eps"];
					this.releasePriceSales =
						(ohlc["estimize:actual_annualized_revenue"] / oohlc.Open) * ratio;
				} else {
					this.releasePriceEarnings =
						chart.masterData[j].Close / ohlc["estimize:actual_annualized_eps"];
					this.releasePriceSales =
						ohlc["estimize:actual_annualized_revenue"] /
						chart.masterData[j].Close;
				}
				ohlc["estimize:price_earnings"] = this.releasePriceEarnings;
				ohlc["estimize:price_sales"] = this.releasePriceSales;
				j++;
				break;
			}
			j++;
		}
	}

	this.data = data;
	this.estimates = [];
	var now = new Date();

	var firstForward = this.forwardConsensus[0];
	for (i in data.estimates) {
		var estimate = data.estimates[i];
		name = estimate.fiscal_year + ":" + estimate.fiscal_quarter;
		var massagedEstimate = {};
		massagedEstimate.eventDT = fiscalMap[name];
		massagedEstimate.DT = CIQ.strToDate(
			CIQ.yyyymmdd(new Date(estimate.created_at))
		);
		massagedEstimate.eps = estimate.eps;
		massagedEstimate.revenue = estimate.revenue;
		if (
			!firstForward ||
			massagedEstimate.eventDT.getTime() != firstForward.DT.getTime()
		) {
			// If the first forward concensus is today then allow those releases through
			if (massagedEstimate.eventDT.getTime() < now.getTime()) continue; // Filter out estimates for prior quarters
		}
		for (j in this.forwardConsensus) {
			var fwcObj = this.forwardConsensus[j];
			if (massagedEstimate.eventDT.getTime() == fwcObj.DT.getTime()) {
				massagedEstimate.annualized_eps =
					fwcObj["estimize:annualized_consensus_eps_estimate"] -
					fwcObj["estimize:consensus_eps_estimate"] +
					massagedEstimate.eps;
				massagedEstimate["estimize:prior_price_earnings"] =
					fwcObj["estimize:prior_price_earnings"];
				massagedEstimate.annualized_revenue =
					fwcObj["estimize:annualized_consensus_revenue_estimate"] -
					fwcObj["estimize:consensus_revenue_estimate"] +
					massagedEstimate.revenue;
				massagedEstimate["estimize:prior_price_sales"] =
					fwcObj["estimize:prior_price_sales"];
				break;
			}
		}
		this.estimates.push(massagedEstimate);
	}
};

Estimize.prototype.drawPriceHorizon = function (stx, quote, x, configuration) {
	if (!CIQ.ChartEngine.isDailyInterval(stx.layout.interval)) return; // Don't process estimize on intraday charts
	if (quote[configuration.missing]) return;
	var context = stx.chart.context;
	context.save();
	var panel = stx.chart.panel;
	var height = panel.bottom - panel.top;
	context.rect(stx.chart.left, panel.top, stx.chart.width, height);
	context.clip();
	stx.plotLine({
		x0: x,
		x1: x,
		y0: panel.top,
		y1: panel.bottom,
		color: stx.defaultColor,
		context: context,
		lineWidth: 2,
		opacity: 1,
		pattern: [1, 1]
	});
	var ys = [];
	var y,
		j = 0;
	var style = "estimize_label";
	/*if(configuration.configuration==Estimize.EPS){
			if(this[configuration.releaseActual]<0){
				CIQ.textLabel(x, panel.top+height/2, "Not available with\nnegative earnings.\nUse revenue horizon.", stx, style);
				context.restore();
				return;
			}
		}*/
	for (var i = 0; i < this.estimates.length; i++) {
		var estimate = this.estimates[i];
		if (estimate.eventDT != quote.DT) continue;
		if (!estimate[configuration.estimateAnnualized]) continue;
		if (!estimate[configuration.releaseActual]) continue;
		var impliedPrice =
			quote[configuration.releaseActual] *
			estimate[configuration.estimateAnnualized];
		if (configuration.configuration == Estimize.REVENUE) {
			impliedPrice =
				estimate[configuration.estimateAnnualized] /
				quote[configuration.releaseActual];
		}
		y = stx.pixelFromPrice(impliedPrice, stx.chart.panel);
		if (ys[y]) ys[y]++;
		else ys[y] = 1;
		j++;
	}
	context.globalAlpha = 0.3;
	context.fillStyle = stx.defaultColor;
	context.strokeStyle = stx.defaultColor;
	var minY = panel.top;
	var maxY = panel.bottom;
	var maxRadius = 10;
	var m, n, width;
	for (y in ys) {
		var radius = 8 * Math.log(Math.max(ys[y], 1.5));
		if (y - radius < minY || y + radius > maxY) continue;
		if (radius > maxRadius) radius = maxRadius;
		context.beginPath();
		context.arc(x, y, radius, 0, (Math.PI / 180) * 360, false);
		context.stroke();
		context.fill();
		context.closePath();
	}
	context.globalAlpha = 1;
	var fontHeight = stx.getCanvasFontSize(style);
	var wsY = 0;
	var eY = 0;
	var maxWidth = 0;
	var textE = "",
		textW = "";
	var estimizeLineColor = stx.getCanvasColor("estimize_estimize");
	var wallStreetLineColor = stx.getCanvasColor("estimize_wallstreet");
	if (
		quote[configuration.annualizedWallSt] &&
		quote[configuration.releaseActual]
	) {
		var impliedPriceW =
			quote[configuration.releaseActual] *
			quote[configuration.annualizedWallSt];
		if (configuration.configuration == Estimize.REVENUE) {
			impliedPriceW =
				quote[configuration.annualizedWallSt] /
				quote[configuration.releaseActual];
		}
		if (impliedPriceW) {
			y = stx.pixelFromPrice(impliedPriceW, stx.chart.panel);
			stx.plotLine({
				x0: x,
				x1: x + maxRadius,
				y0: y,
				y1: y,
				color: wallStreetLineColor,
				context: context,
				lineWidth: 3,
				opacity: 1
			});
			textW = (Math.round(impliedPriceW * 100) / 100).toFixed(2);
			wsY = y;
			context.font = "12px Arial, Helvetica, sans-serif";
			m = context.measureText("$" + textW);
			context.font = "10px Arial, Helvetica, sans-serif";
			n = context.measureText("W");
			width = m.width + n.width;
			if (width > maxWidth) maxWidth = width;
		}
	}
	if (
		quote[configuration.annualizedConsensus] &&
		quote[configuration.releaseActual]
	) {
		var impliedPriceE =
			quote[configuration.releaseActual] *
			quote[configuration.annualizedConsensus];
		if (configuration.configuration == Estimize.REVENUE) {
			impliedPriceE =
				quote[configuration.annualizedConsensus] /
				quote[configuration.releaseActual];
		}
		if (impliedPriceE) {
			y = stx.pixelFromPrice(impliedPriceE, stx.chart.panel);
			stx.plotLine({
				x0: x,
				x1: x + maxRadius,
				y0: y,
				y1: y,
				color: estimizeLineColor,
				context: context,
				lineWidth: 3,
				opacity: 1
			});
			var diff = Math.abs(y - wsY);
			if (diff < fontHeight * 1.2) {
				if (y < wsY) y -= fontHeight * 1.2 - diff;
				else y += fontHeight * 1.2 + diff;
			}
			textE = (Math.round(impliedPriceE * 100) / 100).toFixed(2);
			eY = y;
			context.font = "12px Arial, Helvetica, sans-serif";
			m = context.measureText("$" + textE);
			context.font = "10px Arial, Helvetica, sans-serif";
			n = context.measureText("E");
			width = m.width + n.width;
			if (width > maxWidth) maxWidth = width;
		}
	}
	if (quote[configuration.annualizedWallSt] && textW) {
		this.horizonLabel(
			x + maxRadius + 5,
			wsY - fontHeight / 2,
			maxWidth,
			"$" + textW,
			"W",
			stx
		);
		if (
			configuration.configuration == Estimize.REVENUE &&
			this.ciq.layout.ph_eps
		) {
			context.fillText(
				"rev",
				x + maxRadius + maxWidth + 20,
				wsY - fontHeight / 2 + 3 + fontHeight
			);
		}
	}
	if (quote[configuration.annualizedConsensus] && textE) {
		this.horizonLabel(
			x + maxRadius + 5,
			eY - fontHeight / 2,
			maxWidth,
			"$" + textE,
			"E",
			stx
		);
		if (
			configuration.configuration == Estimize.REVENUE &&
			this.ciq.layout.ph_eps
		) {
			context.fillText(
				"rev",
				x + maxRadius + maxWidth + 20,
				eY - fontHeight / 2 + 3 + fontHeight
			);
		}
	}
	context.restore();
};

Estimize.prototype.horizonLabel = function (x, y, width, txt, label, stx) {
	var context = stx.chart.context;
	context.textBaseline = "bottom";
	var style = "estimize_label";
	var fontHeight = stx.getCanvasFontSize(style);
	context.font = "12px Arial, Helvetica, sans-serif";
	var m = context.measureText(txt);

	context.globalAlpha = 1;
	context.fillStyle = "#E0E5E6";
	context.strokeStyle = "#A3AEB2";
	context.lineWidth = 1;

	context.beginPath(); //draw rectangle
	context.moveTo(x, y);
	context.lineTo(x + 12 + width, y);
	context.lineTo(x + 12 + width, y + 6 + fontHeight);
	context.lineTo(x, y + 6 + fontHeight);
	context.closePath();
	context.fill();
	context.stroke();

	context.font = "12px Arial, Helvetica, sans-serif"; //price
	context.fillStyle = "#000000";
	context.fillText(txt, x + 4, y + 3 + fontHeight);

	context.font = "10px Arial, Helvetica, sans-serif"; //label
	context.fillStyle = "#A1A7AA";
	context.fillText(label, x + 8 + m.width, y + 2 + fontHeight);
};

Estimize.prototype.getDataSet = function (stx, chart) {
	if (!this.enabled) return;
	var symbol = chart.symbol;
	this.currentWatermark = {};
	if (this.data && (!this.symbol || this.symbol == symbol)) {
		this.processMasterData(this.data, chart);
		return;
	}
	this.data = null;
	this.symbol = symbol;
	this.dataSetLength = stx.masterData ? stx.masterData.length : 0;
	function closure(data, fc) {
		return function (status, response) {
			fc(response, status, data);
		};
	}

	function processReleases(response, status, data) {
		if (status != 200) {
			if (status != 404) {
				data.that.watermark(
					data.stx,
					"Error fetching Estimize releases " + status
				);
				if (data.stx.chart.canvas) data.stx.draw();
				data.stx.completeAsyncAction();
				return;
			}
			data.that.watermark(data.stx, "No estimates found for " + data.symbol);
			if (data.stx.chart.canvas) data.stx.draw();
			data.stx.completeAsyncAction();
			return;
		}
		function processEstimates(response, status, data) {
			try {
				data.estimates = JSON.parse(response);
			} catch (e) {
				data.that.watermark(data.stx, "Error fetching estimates");
				data.stx.completeAsyncAction();
				return;
			}
			var that = data.that;
			if (data.symbol != data.stx.chart.symbol) {
				data.stx.completeAsyncAction();
				return; // Stale network request, user has since changed symbols
			}
			data.that.currentWatermark = {};
			that.processMasterData(data, chart);
			data.stx.createDataSet(null, chart);
			if (data.stx.chart.canvas) data.stx.draw();
			delete data.that;
			data.stx.completeAsyncAction();
		}
		try {
			data.releases = JSON.parse(response);
		} catch (e) {
			data.that.watermark(data.stx, "Error fetching estimates");
			data.stx.completeAsyncAction();
			return;
		}
		var now = new Date();
		var past = new Date(now.getTime() - 1000 * 60 * 60 * 24 * 90);
		var startDate = CIQ.yyyymmdd(past);
		var endDate = CIQ.yyyymmdd(now);
		CIQ.postAjax(
			data.that.url +
				"/companies/" +
				symbol +
				"/estimates.json?start_date=" +
				startDate +
				"&end_date=" +
				endDate,
			null,
			closure(data, processEstimates)
		);
	}
	stx.startAsyncAction();
	this.watermark(stx, "Loading Estimates...");
	CIQ.postAjax(
		this.url + "/companies/" + symbol + "/releases.json",
		null,
		closure({ symbol: symbol, that: this, stx: stx }, processReleases)
	);
};

Estimize.prototype.watermark = function (stx, txt, panel) {
	if (!this.currentWatermark) this.currentWatermark = {};
	if (!panel) panel = stx.chart.panel.name;
	this.currentWatermark[panel] = txt;
};

Estimize.prototype.setMasterData = function (stx, chart) {
	if (!this.enabled) return;
	if (!this.isActivated()) return;
	this.forwardConsensus = [];
	this.getDataSet(stx, chart);
};

Estimize.prototype.drawOver = function (stx, chart) {
	for (var w in this.currentWatermark) {
		stx.displayErrorAsWatermark(w, this.currentWatermark[w]);
	}
	this.currentWatermark = {};
};

// Split into earnings, revenue and check for existing panel
Estimize.prototype.drawUnder = function (stx, chart) {
	if (!this.enabled) return;
	if (!chart.dataSegment.length) return;
	var isDaily = CIQ.ChartEngine.isDailyInterval(stx.layout.interval);
	function watermark(me) {
		me.watermark(stx, "Visual Earnings not available on intraday charts");
	}

	var configurator = [
		{
			configuration: Estimize.EPS,
			panel: "estimize_eps",
			dataPoint: "estimize:eps",
			consensus: "estimize:consensus_eps_estimate",
			wallst: "estimize:wallstreet_eps_estimate",
			annualizedConsensus: "estimize:annualized_consensus_eps_estimate",
			annualizedWallSt: "estimize:annualized_wallstreet_eps_estimate",
			estimateAnnualized: "annualized_eps",
			releaseActual: "estimize:prior_price_earnings",
			missing: "estimize:missingEPS"
		},
		{
			configuration: Estimize.REVENUE,
			panel: "estimize_rev",
			dataPoint: "estimize:revenue",
			consensus: "estimize:consensus_revenue_estimate",
			wallst: "estimize:wallstreet_revenue_estimate",
			annualizedConsensus: "estimize:annualized_consensus_revenue_estimate",
			annualizedWallSt: "estimize:annualized_wallstreet_revenue_estimate",
			estimateAnnualized: "annualized_revenue",
			releaseActual: "estimize:prior_price_sales",
			missing: "estimize:missingRevenue"
		}
	];
	if (stx !== this.ciq) return;

	if (this.ciq.panelExists("estimize_eps")) {
		if (!isDaily) watermark(this);
		else this.drawUnderDoIt(stx, configurator[Estimize.EPS], chart);
	}
	if (this.ciq.panelExists("estimize_rev")) {
		if (!isDaily) watermark(this);
		else this.drawUnderDoIt(stx, configurator[Estimize.REVENUE], chart);
	}
	if (this.ciq.panelExists("estimize_data")) {
		if (!isDaily) watermark(this);
		else this.drawDataPanel(stx, chart);
	}
	if (this.ciq.layout.ph_eps) {
		if (!isDaily) watermark(this);
		else this.priceHorizons(stx, configurator[Estimize.EPS], chart);
	}
	if (this.ciq.layout.ph_rev) {
		if (!isDaily) watermark(this);
		else this.priceHorizons(stx, configurator[Estimize.REVENUE], chart);
	}
	if (this.ciq.layout.ph_historical) {
		if (!isDaily) watermark(this);
		// no other function call needed here
	}
};

Estimize.prototype.drawDataPanel = function (stx, chart) {
	var panel = stx.panels.estimize_data;
	if (!panel || panel.hidden === true) return;
	if (this.currentWatermark[panel.name]) {
		return;
	}
	var ourWidth = stx.pixelFromBar(60) - stx.pixelFromBar(0);
	if (ourWidth < 40) {
		this.watermark(stx, "Zoom in to see data", "estimize_data");
		return;
	}
	var points = [];
	var j = 0;
	var i, quote;
	for (i = 0; i < chart.dataSegment.length; i++) {
		quote = chart.dataSegment[i];
		if (!quote) continue;
		if (!quote.DT) continue;
		if (!quote["estimize:eps"]) continue;
		points[j] = {
			tick: i,
			quote: quote
		};
		j++;
	}
	if (stx.chart.dataSegment[stx.chart.dataSegment.length - 1] === null) return;
	var DT = chart.dataSegment[chart.dataSegment.length - 1].DT;
	j = 0;
	if (i > 0) i = i - 1; // possibility of afternoon release

	var iterator = stx.standardMarketIterator(DT, chart.market.martet_tz);

	for (i; i < chart.maxTicks; i++) {
		// Future consensus
		if (j >= this.forwardConsensus.length) break;
		var futureRelease = this.forwardConsensus[j];
		if (DT < futureRelease.DT) {
			DT = iterator.next(1);
			continue;
		}
		points.push({
			tick: i,
			quote: futureRelease
		});
		j++;
		DT = iterator.next(1);
	}
	var font = "estimize_data_font";
	if (ourWidth < 150) font = "estimize_small_font";
	var fontHeight = stx.getCanvasFontSize(font);
	stx.canvasFont(font);
	stx.canvasColor(font);
	panel.height = panel.bottom - panel.top;
	panel.verticalTicks = Math.round(panel.height / (fontHeight * 2));
	panel.spacing = panel.height / panel.verticalTicks;

	var bottom = panel.bottom;
	var reversed = false;
	if (panel.top < chart.panel.top) {
		bottom = panel.top;
		reversed = true;
	}
	var offset = stx.layout.candleWidth / 2;
	var context = stx.chart.context;
	var b;
	context.save();
	context.rect(
		0,
		panel.yAxis.top,
		stx.chart.width,
		panel.yAxis.bottom - panel.yAxis.top
	);
	context.clip();

	var tick, x, ws, estmz, left;
	var margin = 5;
	var top = panel.top + 30;
	var squareSize = 10;
	var epsY = top + margin;
	var revY = top + margin + (fontHeight * 3 + 4) + margin * 2;
	var estimizeLineColor = stx.getCanvasColor("estimize_estimize");
	var wallStreetLineColor = stx.getCanvasColor("estimize_wallstreet");
	context.textBaseline = "top";
	for (i = 0; i < points.length; i++) {
		quote = points[i].quote;
		tick = points[i].tick;
		x = Math.round(stx.pixelFromBar(tick)) - 0.5;
		if (quote["estimize:is_evening_release"]) x += offset;
		else x -= offset;
		if (x > stx.chart.canvasWidth || x < 0) continue;
		var x2;
		if (i < points.length - 1) {
			x2 = Math.round(stx.pixelFromBar(points[i + 1].tick)) - 0.5;
			if (points[i + 1].quote["estimize:is_evening_release"]) x2 += offset;
			else x2 -= offset;
		} else {
			x2 = Math.round(stx.pixelFromBar(points[i].tick + 60)) - 0.5;
		}
		var center = x + (x2 - x) / 2;
		left = x + margin;
		var right = x2 - margin;
		ws = quote["estimize:wallstreet_eps_estimate"];
		estmz = quote["estimize:consensus_eps_estimate"];
		var isRelease = !!quote["estimize:eps"];

		if (isRelease) {
			// release date

			context.textAlign = "left";
			if (quote["estimize:consensus_eps_estimate"]) {
				context.fillText(
					quote["estimize:consensus_eps_estimate"].toFixed(2),
					left,
					epsY + fontHeight + 2
				);
			}

			if (quote["estimize:wallstreet_eps_estimate"]) {
				context.fillText(
					quote["estimize:wallstreet_eps_estimate"].toFixed(2),
					left,
					epsY + fontHeight * 2 + 4
				);
			}

			var txt;
			if (!quote["estimize:missingEPS"]) {
				context.fillText(quote["estimize:eps"].toFixed(2), left, epsY);
				if (ourWidth > 100) {
					context.textAlign = "center";
					if (quote["estimize:actual_qonq_eps"]) {
						txt = quote["estimize:actual_qonq_eps"] > 0 ? "+" : "";
						txt += (quote["estimize:actual_qonq_eps"] * 100).toFixed(0) + "%";
						context.fillText(txt, center, epsY);
					} else {
						context.fillText("N/A", center, epsY);
					}

					context.textAlign = "right";
					context.fillText(
						quote["estimize:actual_annualized_eps"].toFixed(2),
						right,
						epsY
					);

					if (quote["estimize:price_earnings"]) {
						txt = "PE: " + quote["estimize:price_earnings"].toFixed(1);
						context.fillText(txt, right, epsY + fontHeight * 2 + 4);
					}
				}
			}

			context.textAlign = "left";
			if (quote["estimize:consensus_revenue_estimate"]) {
				context.fillText(
					quote["estimize:consensus_revenue_estimate"].toFixed(1),
					left,
					revY + fontHeight + 2
				);
			}

			if (quote["estimize:wallstreet_revenue_estimate"]) {
				context.fillText(
					quote["estimize:wallstreet_revenue_estimate"].toFixed(1),
					left,
					revY + fontHeight * 2 + 4
				);
			}

			if (!quote["estimize:missingRevenue"]) {
				context.fillText(quote["estimize:revenue"], left, revY);
				if (ourWidth > 100) {
					context.textAlign = "center";
					if (quote["estimize:actual_qonq_revenue"]) {
						txt = quote["estimize:actual_qonq_revenue"] > 0 ? "+" : "";
						txt +=
							(quote["estimize:actual_qonq_revenue"] * 100).toFixed(0) + "%";
						context.fillText(txt, center, revY);
					}

					context.textAlign = "right";
					context.fillText(
						quote["estimize:actual_annualized_revenue"].toFixed(1),
						right,
						revY
					);
				}
			}
		} else if (estmz || ws) {
			context.fillStyle = stx.defaultColor;

			if (quote["estimize:consensus_eps_estimate"]) {
				context.textAlign = "left";
				context.fillText(
					quote["estimize:consensus_eps_estimate"].toFixed(2),
					left,
					epsY + fontHeight + 2
				);
			}
			if (quote["estimize:annualized_consensus_eps_estimate"]) {
				context.textAlign = "right";
				if (ourWidth > 100)
					context.fillText(
						quote["estimize:annualized_consensus_eps_estimate"].toFixed(2),
						right,
						epsY + fontHeight + 2
					);
			}
			if (quote["estimize:wallstreet_eps_estimate"]) {
				context.textAlign = "left";
				context.fillText(
					quote["estimize:wallstreet_eps_estimate"].toFixed(2),
					left,
					epsY + fontHeight * 2 + 4
				);
			}
			if (quote["estimize:annualized_wallstreet_eps_estimate"]) {
				context.textAlign = "right";
				if (ourWidth > 100)
					context.fillText(
						quote["estimize:annualized_wallstreet_eps_estimate"].toFixed(2),
						right,
						epsY + fontHeight * 2 + 4
					);
			}
			if (quote["estimize:consensus_revenue_estimate"]) {
				context.textAlign = "left";
				context.fillText(
					quote["estimize:consensus_revenue_estimate"].toFixed(1),
					left,
					revY + fontHeight + 2
				);
			}
			if (quote["estimize:annualized_consensus_revenue_estimate"]) {
				context.textAlign = "right";
				if (ourWidth > 100)
					context.fillText(
						quote["estimize:annualized_consensus_revenue_estimate"].toFixed(1),
						right,
						revY + fontHeight + 2
					);
			}
			if (quote["estimize:wallstreet_revenue_estimate"]) {
				context.textAlign = "left";
				context.fillText(
					quote["estimize:wallstreet_revenue_estimate"].toFixed(1),
					left,
					revY + fontHeight * 2 + 4
				);
			}
			if (quote["estimize:annualized_wallstreet_revenue_estimate"]) {
				context.textAlign = "right";
				if (ourWidth > 100)
					context.fillText(
						quote["estimize:annualized_wallstreet_revenue_estimate"].toFixed(1),
						right,
						revY + fontHeight * 2 + 4
					);
			}
		}
	}
	context.textAlign = "start";

	// Draw legend
	var measure = context.measureText("Wall Street Estimate").width;
	var width = measure * 1.5;
	left = stx.chart.left + margin;
	var textLeft = left + squareSize + margin;
	context.clearRect(
		0,
		panel.yAxis.top + 1,
		width,
		panel.yAxis.bottom - panel.yAxis.top - 1
	);

	context.fillStyle = stx.defaultColor;
	context.fillRect(left, epsY, squareSize, squareSize);
	context.fillRect(left, revY, squareSize, squareSize);

	context.fillStyle = estimizeLineColor;
	context.fillRect(left, epsY + fontHeight + 2, squareSize, squareSize);
	context.fillRect(left, revY + fontHeight + 2, squareSize, squareSize);

	context.fillStyle = wallStreetLineColor;
	context.fillRect(left, epsY + fontHeight * 2 + 4, squareSize, squareSize);
	context.fillRect(left, revY + fontHeight * 2 + 4, squareSize, squareSize);

	font = "estimize_legend";
	if (ourWidth < 150) font = "estimize_small_legend";
	fontHeight = stx.getCanvasFontSize(font);
	stx.canvasFont(font);
	stx.canvasColor(font);
	if (CIQ.isTransparent(context.fillStyle))
		context.fillStyle = stx.defaultColor;

	context.textBaseline = "top";
	context.fillText("Actual Earnings", textLeft, epsY);
	context.fillText("Estimize Consensus", textLeft, epsY + fontHeight + 2);
	context.fillText("Wall Street Estimate", textLeft, epsY + fontHeight * 2 + 4);

	context.fillText("Actual Revenue", textLeft, revY);
	context.fillText("Estimize Consensus", textLeft, revY + fontHeight + 2);
	context.fillText("Wall Street Estimate", textLeft, revY + fontHeight * 2 + 4);

	context.fillStyle = stx.defaultColor;

	var centerY =
		epsY + fontHeight * 3 + (revY - (epsY + fontHeight * 3)) / 2 + 0.5;
	stx.plotLine({
		x0: stx.chart.left,
		x1: stx.chart.width,
		y0: centerY,
		y1: centerY,
		color: "#666666",
		context: context,
		lineWidth: 1,
		opacity: 0.5
	});

	// Draw gray bars
	context.globalCompositeOperation = "destination-over";
	stx.canvasColor("estimize_shading");
	if (CIQ.isTransparent(context.fillStyle))
		context.fillStyle = stx.defaultColor;
	context.fillRect(
		stx.chart.left,
		epsY + fontHeight,
		stx.chart.width,
		fontHeight + 2
	);
	context.fillRect(
		stx.chart.left,
		revY + fontHeight,
		stx.chart.width,
		fontHeight + 2
	);
	context.fill();
	context.globalCompositeOperation = "source-over";

	context.restore();
	// Draw vertical dashed lines
	for (i = 0; i < points.length; i++) {
		quote = points[i].quote;
		tick = points[i].tick;
		x = Math.round(stx.pixelFromBar(tick)) - 0.5;
		if (quote["estimize:is_evening_release"]) x += offset;
		else x -= offset;
		if (x > stx.chart.canvasWidth || x < 0) continue;
		ws = quote["estimize:wallstreet_eps_estimate"];
		estmz = quote["estimize:consensus_eps_estimate"];
		if (quote["estimize:eps"]) {
			// release date
			if (quote.High && !quote["estimize:no_release_date"]) {
				if (reversed) b = stx.pixelFromPrice(quote.High, chart.panel);
				else b = stx.pixelFromPrice(quote.Low, chart.panel);
			} else {
				b = top;
			}
			stx.plotLine({
				x0: x,
				x1: x,
				y0: bottom,
				y1: b,
				color: stx.defaultColor,
				context: context,
				lineWidth: 2,
				opacity: 0.3,
				pattern: [5, 5]
			});
		} else if (estmz || ws) {
			if (this.ciq.layout.ph_rev || this.ciq.layout.ph_eps) {
				// don't overlap the dotted line that the horizons will draw
				if (reversed)
					stx.plotLine({
						x0: x,
						x1: x,
						y0: panel.top,
						y1: chart.panel.top,
						color: stx.defaultColor,
						context: context,
						lineWidth: 2,
						opacity: 1,
						pattern: [1, 1]
					});
				else
					stx.plotLine({
						x0: x,
						x1: x,
						y0: panel.bottom,
						y1: chart.panel.bottom,
						color: stx.defaultColor,
						context: context,
						lineWidth: 2,
						opacity: 1,
						pattern: [1, 1]
					});
			} else {
				// no horizons so draw to the edge of the chart
				if (reversed)
					stx.plotLine({
						x0: x,
						x1: x,
						y0: panel.top,
						y1: chart.panel.bottom,
						color: stx.defaultColor,
						context: context,
						lineWidth: 2,
						opacity: 1,
						pattern: [1, 1]
					});
				else
					stx.plotLine({
						x0: x,
						x1: x,
						y0: panel.bottom,
						y1: chart.panel.top,
						color: stx.defaultColor,
						context: context,
						lineWidth: 2,
						opacity: 1,
						pattern: [1, 1]
					});
			}
		}
	}
};

Estimize.prototype.drawUnderDoIt = function (stx, configuration, chart) {
	var panel = stx.panels[configuration.panel];
	if (!panel || panel.hidden === true) return;
	if (this.currentWatermark[panel.name]) {
		return;
	}
	var yAxis = panel.yAxis;
	var points = [];
	var max = -1000000;
	var min = 1000000;
	var j = 0;
	var quote, tick;
	for (var i = 0; i < stx.chart.dataSegment.length; i++) {
		quote = stx.chart.dataSegment[i];
		if (!quote) continue;
		if (!quote.DT) continue;
		if (!quote[configuration.dataPoint]) continue;
		points[j] = {
			tick: i,
			quote: quote
		};
		min = Math.min(min, quote[configuration.dataPoint]);
		max = Math.max(max, quote[configuration.dataPoint]);
		if (quote[configuration.consensus]) {
			min = Math.min(min, quote[configuration.consensus]);
			max = Math.max(max, quote[configuration.consensus]);
		}
		if (quote[configuration.wallst]) {
			min = Math.min(min, quote[configuration.wallst]);
			max = Math.max(max, quote[configuration.wallst]);
		}
		j++;
	}
	if (stx.chart.dataSegment[stx.chart.dataSegment.length - 1] === null) return;
	var DT = stx.chart.dataSegment[stx.chart.dataSegment.length - 1].DT;
	j = 0;
	if (i > 0) i = i - 1; // possible afternoon release

	var iterator = stx.standardMarketIterator(DT, chart.market.martet_tz);

	for (i; i < stx.chart.maxTicks; i++) {
		// Future consensus
		if (j >= this.forwardConsensus.length) break;
		var futureRelease = this.forwardConsensus[j];
		if (DT < futureRelease.DT) {
			DT = iterator.next(1);
			continue;
		}
		points.push({
			tick: i,
			quote: futureRelease
		});
		if (futureRelease[configuration.consensus]) {
			min = Math.min(min, futureRelease[configuration.consensus]);
			max = Math.max(max, futureRelease[configuration.consensus]);
		}
		if (futureRelease[configuration.wallst]) {
			min = Math.min(min, futureRelease[configuration.wallst]);
			max = Math.max(max, futureRelease[configuration.wallst]);
		}
		j++;
		DT = iterator.next(1);
	}
	var fontHeight = stx.getCanvasFontSize("stx_yaxis");
	yAxis.low = min;
	yAxis.high = max;
	yAxis.shadow = max - min;
	yAxis.displayGridLines = false;
	yAxis.idealTickSizePixels = fontHeight * 2; // override the default to make it more sparse
	//panel.chart.decimalPlaces=8;
	panel.chart.roundit = Math.pow(10, panel.chart.decimalPlaces);
	var parameters = {};
	stx.createYAxis(panel, parameters);
	stx.drawYAxis(panel, parameters);

	var top = panel.top;
	var bottom = panel.bottom;
	var reversed = false;
	if (panel.top < stx.chart.panel.top) {
		top = panel.bottom;
		bottom = panel.top;
		reversed = true;
	}
	var offset = stx.layout.candleWidth / 2;
	var context = stx.chart.context;
	var b;
	context.save();
	context.rect(0, 0, stx.chart.width, stx.chart.canvasHeight);
	context.clip();

	var estimizeLineColor = stx.getCanvasColor("estimize_estimize");
	var wallStreetLineColor = stx.getCanvasColor("estimize_wallstreet");
	for (i = 0; i < points.length; i++) {
		quote = points[i].quote;
		tick = points[i].tick;
		var future = tick + 60;
		var futureX = Math.round(stx.pixelFromBar(future)) - 0.5;
		if (i < points.length - 1) {
			future = points[i + 1].tick;
			if (points[i + 1].quote["estimize:is_evening_release"]) futureX += offset;
			else futureX -= offset;
		}
		var x = Math.round(stx.pixelFromBar(tick)) - 0.5;
		if (quote["estimize:is_evening_release"]) x += offset;
		else x -= offset;
		if (x > stx.chart.canvasWidth || x < 0) continue;
		var actual = quote[configuration.dataPoint];
		var ws = quote[configuration.wallst];
		var estmz = quote[configuration.consensus];
		var ay = stx.pixelFromPrice(actual, panel);
		var ey = stx.pixelFromPrice(estmz, panel);
		var wy = stx.pixelFromPrice(ws, panel);
		var isRelease = !!quote[configuration.dataPoint];

		if (isRelease) {
			// release date
			if (quote.High && !quote["estimize:no_release_date"]) {
				if (reversed) b = stx.pixelFromPrice(quote.High, chart.panel);
				else b = stx.pixelFromPrice(quote.Low, chart.panel);
			} else {
				b = top;
			}
			stx.plotLine({
				x0: x,
				x1: x,
				y0: bottom,
				y1: b,
				color: stx.defaultColor,
				context: context,
				lineWidth: 2,
				opacity: 0.3,
				pattern: [5, 5]
			});
			var aColor = stx.defaultColor;
			var wColor = stx.getCanvasColor("estimize_miss");
			var eColor = stx.getCanvasColor("estimize_miss");
			if (ws < actual) wColor = stx.getCanvasColor("estimize_beat");
			if (estmz < actual) eColor = stx.getCanvasColor("estimize_beat");

			stx.plotLine({
				x0: x,
				x1: x + 0.8 * (futureX - x),
				y0: ay,
				y1: ay,
				color: aColor,
				context: context,
				lineWidth: 2,
				opacity: 1
			});

			if (estmz) {
				stx.plotLine({
					x0: x,
					x1: x + 0.75 * (futureX - x),
					y0: ey,
					y1: ey,
					color: stx.defaultColor,
					context: context,
					lineWidth: 1,
					opacity: 1
				});
				context.globalAlpha = 0.3;
				context.fillStyle = eColor;
				context.fillRect(x, ey, 0.75 * (futureX - x), ay - ey);
				context.globalAlpha = 1;
			}

			if (ws) {
				stx.plotLine({
					x0: x,
					x1: x + 0.75 * (futureX - x),
					y0: wy,
					y1: wy,
					color: stx.defaultColor,
					context: context,
					lineWidth: 1,
					opacity: 1
				});
				context.globalAlpha = 0.3;
				context.fillStyle = wColor;
				context.fillRect(x, wy, 0.75 * (futureX - x), ay - wy);
				context.globalAlpha = 1;
			}
			//quote.ohlc=stx.chart.dataSegment[tick];
		} else if (estmz || ws) {
			stx.plotLine({
				x0: x,
				x1: x,
				y0: panel.bottom,
				y1: panel.top,
				color: stx.defaultColor,
				context: context,
				lineWidth: 2,
				opacity: 1,
				pattern: [1, 1]
			});
			if (estmz) {
				stx.plotLine({
					x0: x,
					x1: futureX,
					y0: ey,
					y1: ey,
					color: estimizeLineColor,
					context: context,
					lineWidth: 1,
					opacity: 1
				});
			}
			if (ws) {
				stx.plotLine({
					x0: x,
					x1: futureX,
					y0: wy,
					y1: wy,
					color: wallStreetLineColor,
					context: context,
					lineWidth: 1,
					opacity: 1
				});
			}
		}
	}
	context.globalAlpha = 1;

	context.restore();
};

Estimize.prototype.priceHorizons = function (stx, configuration, chart) {
	var panel = stx.panels[configuration.panel];
	if (!panel || panel.hidden === true) return;
	if (this.currentWatermark[chart.panel.name]) {
		return;
	}
	var points = [];
	var j = 0,
		quote;
	for (var i = 0; i < chart.dataSegment.length; i++) {
		quote = chart.dataSegment[i];
		if (!quote) continue;
		if (!quote.DT) continue;
		if (!quote[configuration.dataPoint]) continue;
		points[j] = {
			tick: i,
			quote: quote
		};
		j++;
	}
	if (stx.chart.dataSegment[stx.chart.dataSegment.length - 1] === null) return;
	var DT = chart.dataSegment[chart.dataSegment.length - 1].DT;
	j = 0;
	if (i > 0) i = i - 1; // Future release might be on the last day of the chart, if an afternoon release

	var iterator = stx.standardMarketIterator(DT, chart.market.martet_tz);

	for (i; i < chart.maxTicks; i++) {
		// Future consensus
		if (j >= this.forwardConsensus.length) break;
		var futureRelease = this.forwardConsensus[j];
		if (DT < futureRelease.DT) {
			DT = iterator.next(1);
			continue;
		}
		points.push({
			tick: i,
			quote: futureRelease
		});
		j++;
		DT = iterator.next(1);
	}

	var offset = stx.layout.candleWidth / 2;
	var context = stx.chart.context;

	for (i = 0; i < points.length; i++) {
		quote = points[i].quote;
		var tick = points[i].tick;
		var x = Math.round(stx.pixelFromBar(tick)) - 0.5;
		if (quote["estimize:is_evening_release"]) x += offset;
		else x -= offset;
		if (x > stx.chart.canvasWidth || x < 0) continue;
		var ws = quote[configuration.wallst];
		var estmz = quote[configuration.consensus];
		if (quote[configuration.dataPoint]) {
			// release date
			// Historical
			if (this.ciq.layout.ph_historical && !quote["estimize:no_release_date"])
				this.drawPriceHorizon(stx, quote, x, configuration);
		} else if (estmz || ws) {
			this.drawPriceHorizon(stx, quote, x, configuration);
		}
	}
	context.globalAlpha = 1;
};

Estimize.prototype.disable = function () {
	this.enabled = false;
};

Estimize.prototype.enable = function () {
	var doGo = !this.enabled;
	this.enabled = true;
	if (doGo) this.go();
};

Estimize.prototype.main = function (ciq) {
	this.ciq = ciq;
	this.ciq.plugins.estimize = this;
};

Estimize.prototype.go = function (action) {
	var ciq = this.ciq,
		newPanel;
	if (action == "earnings") {
		if (!ciq.panelExists("estimize_eps")) {
			newPanel = ciq.createPanel("Miss/Beat EPS", "estimize_eps", 100);
			newPanel.noDrag = true;
		}
		ciq.changeOccurred("layout");
		ciq.draw();
	} else if (action == "revenue") {
		if (!ciq.panelExists("estimize_rev")) {
			newPanel = ciq.createPanel("Miss/Beat REV", "estimize_rev", 100);
			newPanel.noDrag = true;
		}
		ciq.changeOccurred("layout");
		ciq.draw();
	} else if (action == "data") {
		if (!ciq.panelExists("estimize_data")) {
			newPanel = ciq.createPanel("EPS Data", "estimize_data", 156);
			newPanel.noDrag = true;
			newPanel.yAxis.min = newPanel.yAxis.max = 0;
			newPanel.yAxis.position = "none";
		}
		ciq.changeOccurred("layout");
		ciq.draw();
	} else if (action == "ph_eps") {
		if (!ciq.layout.ph_eps) {
			ciq.layout.ph_eps = true;
		} else {
			ciq.layout.ph_eps = false;
		}
		ciq.changeOccurred("layout");
		ciq.draw();
	} else if (action == "ph_rev") {
		if (!ciq.layout.ph_rev) {
			ciq.layout.ph_rev = true;
		} else {
			ciq.layout.ph_rev = false;
		}
		ciq.changeOccurred("layout");
		ciq.draw();
	} else if (action == "ph_historical") {
		if (!ciq.layout.ph_historical) {
			ciq.layout.ph_historical = true;
		} else {
			ciq.layout.ph_historical = false;
		}
		ciq.changeOccurred("layout");
		ciq.draw();
	} else {
		ciq.draw();
	}

	function load(inst) {
		if (!inst.ciq.masterData) {
			setTimeout(function () {
				load(inst);
			}, 1000);
			return;
		}
		if (
			inst.symbol != inst.ciq.chart.symbol ||
			inst.dataSetLength != inst.ciq.masterData.length
		) {
			inst.setMasterData(inst.ciq, inst.ciq.chart);
		}
		inst.showPanelTitles();
	}
	load(this);
};

Estimize.prototype.isActivated = function () {
	var ciq = this.ciq;
	var hasPanels =
		(ciq.panelExists("estimize_eps") ||
			ciq.panelExists("estimize_rev") ||
			ciq.panelExists("estimize_data") ||
			ciq.layout.ph_eps ||
			ciq.layout.ph_rev ||
			ciq.layout.ph_historical) &&
		CIQ.ChartEngine.isDailyInterval(ciq.layout.interval);
	return hasPanels;
};

Estimize.prototype.showPanelTitles = function () {
	var ciq = this.ciq;
	["estimize_eps", "estimize_rev", "estimize_data"].forEach(function (i) {
		var panel = ciq.panels[i];
		if (panel && !panel.title.style.display)
			panel.title.style.display = "inline-block";
	});
};

var estimize = new Estimize();

/**
 * Adds an instance of the Visual Earnings plug-in to the chart and creates the Visual
 * Earnings drop-down menu.
 *
 * @param {object} params Parameters for setting up the Visual Earnings plug-in.
 * @param {CIQ.ChartEngine} params.stx A reference to the chart to which the plug-in is
 * 		added.
 * @param {CIQ.UI.Context} params.context A reference to the user interface context.
 * @param {HTMLElement} params.menuContainer The DOM element to which the Visual Earnings
 * 		drop-down menu is attached.
 * @param {string} params.markup A custom markup string to use instead of the default markup
 * 		specified by the `markup` property in the *plugins/visualearnings/config.js* file.
 * @param {object[]} params.menu A custom menu item array to use instead of the default array
 * 		specified by the `menu` property in the *plugins/visualearnings/config.js* file.
 *
 * @constructor
 * @name CIQ.VisualEarnings
 * @since 8.1.0 Added `params.markup` and `params.menu`.
 */
CIQ.VisualEarnings = function (params) {
	estimize.main(params.stx);
	if (typeof params.menuContainer === "string") {
		params.menuContainer = params.context.topNode.querySelector(
			params.menuContainer
		);
	}
	new CIQ.UI.VisualEarnings(params.context);
	var basePath = CIQ.ChartEngine.pluginBasePath + "visualearnings/";
	var cb = function () {
		estimize.enable();
	};
	if (_css) {
		CIQ.addInternalStylesheet(_css, "visualearnings.css");
	} else {
		CIQ.loadStylesheet(basePath + "visualearnings.css", function () {
			params.stx.clearStyles();
		});
	}

	if (params.menuContainer) {
		var div = document.createElement("div");
		CIQ.innerHTML(div, params.markup || config.markup);
		params.context.config[
			div.querySelector("cq-menu-container").getAttribute("cq-name")
		] = params.menu || config.menu;
		for (var j = 0; j < div.children.length; j++) {
			var ch = div.children[j].cloneNode(true);
			params.menuContainer.appendChild(ch);
		}
		cb();
	}
};

/**
 * UI helper for managing the Visual Earnings plug-in. The helper is attached to the UI
 * context, so that this helper can subsequently be found.
 *
 * @param {CIQ.UI.Context} context The user interface context.
 *
 * @constructor
 * @name CIQ.UI.VisualEarnings
 */
CIQ.UI.VisualEarnings = function (context) {
	this.context = context;
	context.advertiseAs(this, "VisualEarnings");
};

CIQ.UI.VisualEarnings.prototype.toggle = function (node, type) {
	estimize.go(type);
};

// earnings, revenue, data, ph_eps, ph_rev, ph_historical
CIQ.UI.Layout.prototype.getVisualEarningsFlag = function (node, type) {
	var stx = this.context.stx,
		className = this.params.activeClassName;
	var listener = function (obj) {
		if (obj.value) node.classList.add(className);
		else node.classList.remove(className);
	};
	CIQ.UI.observeProperty(type, stx.layout, listener);
};

CIQ.UI.Layout.prototype.setVisualEarningsFlag = function (node, type) {
	estimize.go(type);
	this.context.stx.changeOccurred("layout");
};
