/**
 * @property {string} source - UUID
 * @property {string} issuedAt - An ISO8601 formatted string. The last issued date.
 */
import ILastIssued from "./ILastIssued";

export default class LastIssued implements ILastIssued {
	source: string;
	issuedAt: string;

	constructor(source: string, issuedAt: string) {
		this.source = source;
		this.issuedAt = issuedAt;
	}
}
