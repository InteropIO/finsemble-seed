//
// Sample market symbology file
// Customize this file if you need symbology definitions different from these default settings
//
import { CIQ } from "../../js/chartiq.js";
CIQ.Market = CIQ.Market || function () {};
CIQ.Market.Symbology = CIQ.Market.Symbology || function () {};
/**
 * Returns true if the instrument is foreign.
 * By default, if the instrument contains a period (.) it will be considered foreign (non US). (e.g. VOD.L)
 *
 * @param  {string}  symbol The symbol
 * @return {boolean}        True if it's a foreign symbol
 */
CIQ.Market.Symbology.isForeignSymbol = function (symbol) {
	if (!symbol) return false;
	return symbol.indexOf(".") != -1;
};
/**
 * Returns true if the instrument is a future.
 * By default, if the symbol begins with `/` it will be considered a future. (e.g. /C)
 *
 * @param  {string}  symbol The symbol
 * @return {boolean}        True if it's a futures symbol
 */
CIQ.Market.Symbology.isFuturesSymbol = function (symbol) {
	if (!symbol) return false;
	return symbol.length > 1 && symbol[0] == "/";
};
/**
 * Returns true if the instrument is a rate.
 * By default, if the symbol begins with `%` it will be considered a rate. (e.g. %Treasury)
 *
 * @param  {string}  symbol The symbol
 * @return {boolean}        True if it's a rate symbol
 */
CIQ.Market.Symbology.isRateSymbol = function (symbol) {
	if (!symbol) return false;
	return symbol.length > 1 && symbol[0] == "%";
};
/**
 * Returns true if the instrument is a forex symbol.
 * By default, if the symbol begins with `^` and is followed by 6 alpha characters, or just 6 alpha characters long without a '^', it will be considered forex.(e.g. ^EURUSD)
 *
 * @param  {string}  symbol The symbol
 * @return {boolean}        True if it's a forex symbol
 */
CIQ.Market.Symbology.isForexSymbol = function (symbol) {
	if (!symbol) return false;
	if (CIQ.Market.Symbology.isForeignSymbol(symbol)) return false;
	if (CIQ.Market.Symbology.isFuturesSymbol(symbol)) return false;
	if (symbol.length < 6 || symbol.length > 7) return false;
	if (symbol.length == 6 && symbol[5] == "X") return false; // This is a fund of some sort
	if (/\^?[A-Za-z]{6}/.test(symbol)) return true;
	return false;
};
/**
 * Returns true if the symbol is a metal/currency or currency/metal pair
 * By default, it must be a forex for a precious metal. (e.g. ^XAUUSD - looks for XAU,XPD,XPT,XAG only)
 *
 * @param  {string}   symbol The symbol
 * @param  {boolean}  inverse Set to true to test specifically for a currency/metal pair (e.g. EURXAU, but not XAUEUR).
 * @return {boolean}  True if it's a metal symbol
 */
CIQ.Market.Symbology.isForexMetal = function (symbol, inverse) {
	var metalsSupported = {
		XAU: true,
		XAG: true,
		XPT: true,
		XPD: true
	};
	if (!symbol) return false;
	if (!CIQ.Market.Symbology.isForexSymbol(symbol)) return false;
	if (symbol.charAt(0) != "^") symbol = "^" + symbol;
	if (
		!metalsSupported[symbol.substring(1, 4)] &&
		metalsSupported[symbol.substring(4, 7)]
	)
		return true;
	else if (
		!inverse &&
		metalsSupported[symbol.substring(1, 4)] &&
		!metalsSupported[symbol.substring(4, 7)]
	)
		return true;
	return false;
};
/**
 * Returns the market definition of a symbolObject.
 *
 * @param  {object} symbolObject Symbol object of form accepted by {@link CIQ.ChartEngine#loadChart}
 * @return {object} A market definition. See {@link CIQ.Market} for instructions.
 */
CIQ.Market.Symbology.factory = function (symbolObject) {
	var symbol = symbolObject.symbol;
	if (CIQ.Market.Symbology.isForeignSymbol(symbol)) return null; // 24 hour market definition
	if (CIQ.Market.Symbology.isFuturesSymbol(symbol)) return CIQ.Market.GLOBEX;
	if (CIQ.Market.Symbology.isForexMetal(symbol)) return CIQ.Market.METALS;
	if (CIQ.Market.Symbology.isForexSymbol(symbol)) return CIQ.Market.FOREX;
	return CIQ.Market.NYSE;
};
/**
 * Encodes the string identifier for an instrument in a term structure chart.
 *
 * @param  {string} entity The symbol/entity for the curve; for example, "US-T BENCHMARK".
 * @param  {string} instrument An individual instrument; for example, "20 YR".
 * @return {string} The symbol for the individual instrument; for example, "US-T BENCHMARK 20 YR".
 * @memberOf CIQ.Market.Symbology
 */
CIQ.Market.Symbology.encodeTermStructureInstrumentSymbol = function (
	entity,
	instrument
) {
	if (entity[0] === "%") entity = entity.slice(1);
	return entity + " " + instrument;
};
export { CIQ };
