/**
 * @property {string} id - UUID
 * @property {string} buttonText - Text to display on the button UI.
 * @property {string} type - Type of action.
 * @property {number} milliseconds - Milliseconds to snooze for.
 * @property {string} component - Component to spawn.
 * @property {Object} spawnParams - params passed to the spawn function.
 * @property {string} channel - channel to transmit payload on.
 * @property payload {any} - payload transmitted along channel.
 *
 * TODO: Ensure this interface (or implemented type) is publicly accessible
 */
export default interface IAction {
	id: string;
	buttonText: string;
	type: string;
	milliseconds?: number;
	component?: string;
	spawnParams?: any;
	channel?: string;
	payload?: any;
}
