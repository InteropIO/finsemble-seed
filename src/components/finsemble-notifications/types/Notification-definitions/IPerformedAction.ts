/**
 * @property {string} id - UUID.
 * @property {string} datePerformed - An ISO8601 formatted string. When the action was performed.
 */
export default interface IPerformedAction {
	id: string;
	type: string;
	datePerformed: string;
}
