//
// This file contains functions which create a sample implementation of video markers by extending MarkersSample.
// This file depends on the markersSample.js file. There is a stylesheet which goes along with it as well.
//
import { CIQ, markers } from "../../js/standard.js";
import marker from "../../examples/markers/markersSample.js";
var _css;
if (
	typeof define === "undefined" &&
	typeof module === "object" &&
	typeof require === "function"
)
	_css = require("../../examples/markers/videoSample.css");
else if (typeof define === "function" && define.amd)
	define(["../../examples/markers/videoSample.css"], function (m) {
		_css = m;
	});
else if (typeof window !== "undefined")
	CIQ.loadStylesheet("examples/markers/videoSample.css");
CIQ.activateImports(markers); // so we can inherit from nodeCreator
if (_css) CIQ.addInternalStylesheet(_css, "videoSample.css");
const MarkersSample = marker.MarkersSample;
/**
 * Retrieves data for video events
 * This is placeholder implementation with static data, actual data should be retrieved from network
 */
function getData() {
	const defaultVideo =
		"https://embed-ssl.wistia.com/deliveries/d1aa8163948cdcc3d01a0ccda618e4a91dbff03c.bin";
	const data = [
		["video", "Interview", defaultVideo],
		[
			"video",
			"Utilizing Studies",
			"https://embed-ssl.wistia.com/deliveries/3bebd8d93f5d1cd878e63037fc1294d7116d93e4.bin"
		],
		[
			"video",
			"Smart Zoom",
			"https://embed-ssl.wistia.com/deliveries/68f205d2284792be162071c853c4af0a.bin"
		],
		[
			"video",
			"Drawing Tools",
			"https://embed-ssl.wistia.com/deliveries/4048329c0ded7972445032db0372e0bdb268c78d.bin"
		],
		[
			"video",
			"Utilizing Studies",
			"https://embed-ssl.wistia.com/deliveries/3bebd8d93f5d1cd878e63037fc1294d7116d93e4.bin"
		],
		[
			"video",
			"Time Span Events",
			"https://embed-ssl.wistia.com/deliveries/46685ec00a9d3ab4bdcadd1391cf1f91.bin"
		],
		["video", "Interview", defaultVideo]
	];
	return new Promise((resolve, reject) => {
		const mapData = ([category, headline, videoUrl]) => ({
			category,
			headline,
			videoUrl
		});
		resolve(data.map(mapData));
	});
}
document.addEventListener("play", onlyOneVideoPlaying, { capture: true });
MarkersSample.registerType("video", "showVideoMarkers");
MarkersSample.prototype.showVideoMarkers = function (label) {
	const { stx } = this;
	const { chart } = stx;
	const { dataSet, endPoints } = chart;
	if (!dataSet.length) return;
	const tick = stx.tickFromDate(endPoints.end);
	const getItemAt = function (index) {
		if (dataSet[tick - index * 10 - 5])
			return dataSet[tick - index * 10 - 5].DT;
	};
	getData().then((data) => {
		data.forEach(({ category, headline, videoUrl }, index) => {
			const x = getItemAt(index);
			if (x === undefined) return;
			const datum = {
				x,
				label,
				category,
				headline,
				videoUrl,
				videoWidth: 340
			};
			const params = {
				label,
				x,
				stx,
				xPositioner: "date",
				node: new VideoMarkerNode(datum)
			};
			new CIQ.Marker(params);
		});
		this.stx.draw();
	});
	return "video";
};
function VideoMarkerNode({ label, category, videoUrl }) {
	const node = (this.node = document.createElement("div"));
	node.className = "stx-marker square";
	if (category) node.classList.add(category);
	const visual = CIQ.newChild(node, "div", "stx-visual");
	CIQ.newChild(node, "div", "stx-stem");
	const expand = createVideoExpandNode(videoUrl);
	node.append(expand);
	// node.addEventListener('click', nodeClicked);
	CIQ.safeClickTouch(node, nodeClicked);
	function nodeClicked({ target: el }) {
		const isVisual = el === visual;
		const isClose = el.classList.contains("ciq-close");
		let isVisible = node.classList.contains("highlight");
		const video = node.querySelector("video");
		if (isVisual || isClose) {
			node.classList.toggle("highlight");
			if (isVisible) {
				setTimeout(cb, 10);
				video.pause();
				return;
			}
			isVisible = !isVisible;
		}
		// autoplay video
		if (!video.firstClick) {
			setTimeout(() => {
				if (!video.firstClick) {
					video.firstClick = true;
					video.play();
				}
			}, 100); // estimating time of 100 ms to be able to start video
		}
	}
	function cb() {
		CIQ.Marker.positionContentVerticalAndHorizontal(node);
	}
}
CIQ.inheritsFrom(VideoMarkerNode, CIQ.Marker.NodeCreator, false);
// creates node for marker content
function createVideoExpandNode(videoUrl) {
	const expand = document.createElement("div");
	expand.className = "stx-marker-video stx-marker-expand";
	const closeButton = document.createElement("div");
	closeButton.className = "ciq-icon ciq-close";
	expand.appendChild(closeButton);
	var video = document.createElement("video");
	if (video.canPlayType("video/mp4")) {
		video.setAttribute("src", videoUrl);
	}
	// Edge does not appear to respond to controls
	if (!/Edge/.test(navigator.userAgent)) {
		video.setAttribute("controls", "controls");
	}
	expand.appendChild(video);
	return expand;
}
let zIndex = 400;
function onlyOneVideoPlaying(e) {
	const video = e.target;
	video.parentElement.style.zIndex = zIndex++;
	Array.from(document.querySelectorAll("video"))
		.filter((v) => v !== video)
		.forEach((v) => v.pause());
}
export default marker;
