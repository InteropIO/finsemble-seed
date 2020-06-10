import IFilter from "./IFilter";


export default class Filter implements IFilter {
	/**
	 * An array of objects. If more than one object is used it will use an OR match.
	 *
	 * @name IFilter#include
	 * @type Object[]
	 */
	include: { [key: string]: string|Object }[] = [];

	/**
	 * An array of objects on which to exclude a notification.
	 * If more than one object is used it will use an OR match. Exclude takes precedence over Include
	 *
	 * @name IFilter#exclude
	 * @type Object[]
	 */
	exclude: { [key: string]: string|Object }[] = [];
}
