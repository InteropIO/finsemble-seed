import React, { useMemo, useState } from "react";
import { DesktopProjectClient } from "../desktopProjectClient";

// From https://stackoverflow.com/a/62755574
const FONT_LIST = [
	// Windows 10
	"Arial",
	"Arial Black",
	"Bahnschrift",
	"Calibri",
	"Cambria",
	"Cambria Math",
	"Candara",
	"Comic Sans MS",
	"Consolas",
	"Constantia",
	"Corbel",
	"Courier New",
	"Ebrima",
	"Franklin Gothic Medium",
	"Gabriola",
	"Gadugi",
	"Georgia",
	"HoloLens MDL2 Assets",
	"Impact",
	"Ink Free",
	"Javanese Text",
	"Leelawadee UI",
	"Lucida Console",
	"Lucida Sans Unicode",
	"Malgun Gothic",
	"Marlett",
	"Microsoft Himalaya",
	"Microsoft JhengHei",
	"Microsoft New Tai Lue",
	"Microsoft PhagsPa",
	"Microsoft Sans Serif",
	"Microsoft Tai Le",
	"Microsoft YaHei",
	"Microsoft Yi Baiti",
	"MingLiU-ExtB",
	"Mongolian Baiti",
	"MS Gothic",
	"MV Boli",
	"Myanmar Text",
	"Nirmala UI",
	"OpenSans",
	"Palatino Linotype",
	"Segoe MDL2 Assets",
	"Segoe Print",
	"Segoe Script",
	"Segoe UI",
	"Segoe UI Historic",
	"Segoe UI Emoji",
	"Segoe UI Symbol",
	"SimSun",
	"Sitka",
	"Sylfaen",
	"Symbol",
	"Tahoma",
	"Times New Roman",
	"Trebuchet MS",
	"Verdana",
	"Webdings",
	"Wingdings",
	"Yu Gothic",
	// macOS
	"American Typewriter",
	"Andale Mono",
	"Arial",
	"Arial Black",
	"Arial Narrow",
	"Arial Rounded MT Bold",
	"Arial Unicode MS",
	"Avenir",
	"Avenir Next",
	"Avenir Next Condensed",
	"Baskerville",
	"Big Caslon",
	"Bodoni 72",
	"Bodoni 72 Oldstyle",
	"Bodoni 72 Smallcaps",
	"Bradley Hand",
	"Brush Script MT",
	"Chalkboard",
	"Chalkboard SE",
	"Chalkduster",
	"Charter",
	"Cochin",
	"Comic Sans MS",
	"Copperplate",
	"Courier",
	"Courier New",
	"Didot",
	"DIN Alternate",
	"DIN Condensed",
	"Futura",
	"Geneva",
	"Georgia",
	"Gill Sans",
	"Helvetica",
	"Helvetica Neue",
	"Herculanum",
	"Hoefler Text",
	"Impact",
	"Lucida Grande",
	"Luminari",
	"Marker Felt",
	"Menlo",
	"Microsoft Sans Serif",
	"Monaco",
	"Noteworthy",
	"Optima",
	"Palatino",
	"Papyrus",
	"Phosphate",
	"Rockwell",
	"Savoye LET",
	"SignPainter",
	"Skia",
	"Snell Roundhand",
	"Tahoma",
	"Times",
	"Times New Roman",
	"Trattatello",
	"Trebuchet MS",
	"Verdana",
	"Zapfino",
];

const FONT_WEIGHT_LIST = [
	"normal",
	"bold",
	"lighter",
	"bolder",
	"100",
	"200",
	"300",
	"400",
	"500",
	"600",
	"700",
	"800",
	"900",
	"inherit",
	"initial",
	"unset",
];

const FONT_SIZE_LIST = [
	"xx-small",
	"x-small",
	"small",
	"medium",
	"large",
	"x-large",
	"xx-large",
	"xxx-large",
	"smaller",
	"larger",
	"8px",
	"10px",
	"12px",
	"14px",
	"16px",
	"8pt",
	"10pt",
	"12pt",
	"14pt",
	"0.6em",
	"0.8em",
	"1.2em",
	"1.4em",
	"60%",
	"80%",
	"120%",
	"140%",
	"inherit",
	"initial",
	"unset",
];

const RE_HEX_COLOR = /^#[0-9a-f]{6}$/i;

// From https://stackoverflow.com/a/24390910
function colorToRGBA(color: string) {
	// Returns the color as an array of [r, g, b, a] -- all range from 0 - 255
	// color must be a valid canvas fillStyle. This will cover most anything
	// you'd want to use.
	// Examples:
	// colorToRGBA('red')  # [255, 0, 0, 255]
	// colorToRGBA('#f00') # [255, 0, 0, 255]
	const cvs = document.createElement("canvas");
	cvs.height = 1;
	cvs.width = 1;

	const ctx = cvs.getContext("2d")!;
	ctx.fillStyle = color;
	ctx.fillRect(0, 0, 1, 1);
	return ctx.getImageData(0, 0, 1, 1).data;
}

function byteToHex(num: number) {
	// Turns a number (0-255) into a 2-character hex number (00-ff)
	return `0${num.toString(16)}`.slice(-2);
}

function colorToHex(color: string) {
	// Convert any CSS color to a hex representation
	// Examples:
	// colorToHex('red')            # '#ff0000'
	// colorToHex('rgb(255, 0, 0)') # '#ff0000'
	// colorToHex('#ff0000') # '#ff0000'
	if (color.match(RE_HEX_COLOR) !== null) {
		return color;
	}
	const rgba = colorToRGBA(color);
	const hex = [0, 1, 2].map((idx) => byteToHex(rgba[idx])).join("");
	return `#${hex}`;
}

/**
 * ColorPicker component to update theme variables.  Displays a browser color input alongside a text version for hex color values.
 *
 * @param {{ id: any; theme: any }} { id, theme }
 */
export const ColorPicker = ({ id, theme }: { id: any; theme: any }) => {
	const [themeInput, setThemeInput] = useState(colorToHex(theme?.[`--${id}`]));

	const isValid = themeInput.match(RE_HEX_COLOR) === null;

	const onTextColorChanged = ({ target }: { target: HTMLInputElement }) => {
		setThemeInput(target.value);
		if (target.value.match(RE_HEX_COLOR) !== null) {
			DesktopProjectClient.updateThemeVariable(target.dataset.themevariableid!, target.value);
		}
	};

	const onColorChanged = ({ target }: { target: HTMLInputElement }) => {
		setThemeInput(target.value);
		DesktopProjectClient.updateThemeVariable(target.dataset.themevariableid!, target.value);
	};

	return (
		<>
			<input
				id={id}
				className="theme-color-picker"
				type="color"
				data-themevariableid={`--${id}`}
				value={colorToHex(theme?.[`--${id}`])}
				onChange={onColorChanged}
			></input>
			<input
				className="theme-color-picker-text"
				type="text"
				style={isValid ? { color: "red" } : {}}
				data-themevariableid={`--${id}`}
				value={themeInput}
				onChange={onTextColorChanged}
			></input>
		</>
	);
};

/**
 * Handles Font Size theme variable updates.  Validates using FontFaceSet.check()
 *
 * @param {{ target: HTMLInputElement }} { target }
 */
const onFontSizeChanged = ({ target }: { target: HTMLSelectElement }) => {
	DesktopProjectClient.updateThemeVariable(target.dataset.themevariableid!, target.value);
};

/**
 * FontSize component to update theme variables.  Text input that validates against browser.
 *
 * @param {{ id: any; theme: any }} { id, theme }
 */
export const FontSize = ({ id, theme }: { id: any; theme: any }) => (
	<div className="font-size-picker">
		<select id={id} data-themevariableid={`--${id}`} value={theme?.[`--${id}`]} onChange={onFontSizeChanged}>
			{FONT_SIZE_LIST.map((font_size) => (
				<option key={font_size}>{font_size}</option>
			))}
		</select>
	</div>
);
