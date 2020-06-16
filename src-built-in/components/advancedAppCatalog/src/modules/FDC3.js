/**
 * Copyright 2017 - 2020 by ChartIQ, Inc.
 * All rights reserved.
 *
 * FDC3 App directory client, I will be using fetch()
 * to make calls to the appd web service, even though I'm
 * not sure where did fetch() come from, will investigate later
 */
export default class FDC3 {
	constructor(config = {}, creds = {}) {
		if (!config.url) {
			throw new Error("Please specify the url of the app directory.");
		}
		this.creds = creds;
		this.config = {
			url: config.url.replace(/\/+$/, ""),
		};
	}

	/**
	 * Http get wrapper
	 * @param {string} path The restful method path
	 * @param {function} done The callback function
	 */
	_get(path, done) {
		fetch(this.config.url + path, {
			method: "GET",
		})
			.then((response) => {
				response.json().then((data) => {
					// We are expecting 200 here for data
					if (response.status !== 200) {
						// We have a problem, data as error message
						done(data);
					} else {
						// All good, no problem
						done(null, data);
					}
				});
			})
			.catch((error) => {
				done({
					message: `Request failed ${error.message}`,
				});
			});
	}

	/**
	 *
	 * @param {string} path The restful method path
	 * @param {object} params The post data
	 * @param {function} done The callback function
	 */
	_post(path, params, done) {
		fetch(this.config.url + path, {
			method: "POST",
			body: JSON.stringify(params),
			headers: {
				"Content-Type": "application/json",
			},
		})
			.then((response) => {
				response.json().then((data) => {
					// We are expecting 200 here for data
					if (response.status !== 200) {
						// We have a problem, data as error message
						done(data);
					} else {
						// All good, no problem
						done(null, data);
					}
				});
			})
			.catch((error) => {
				done({
					message: `Request failed ${error.message}`,
				});
			});
	}

	/**
	 * Returns all applications
	 * @param {function} callback The optional callback function
	 */
	getAll(callback) {
		return new Promise((resolve, reject) => {
			this._get("/apps/", (error, data) => {
				if (error) {
					reject(error);
				} else {
					resolve(data.applications);
				}
				if (callback) {
					callback(error, !error && data.applications);
				}
			});
		});
	}

	/**
	 * Returns a single application in results
	 * @param {string} appId The app id
	 */
	get(appId, callback) {
		return new Promise((resolve, reject) => {
			this._get(`/apps/${appId}`, (error, data) => {
				if (error) {
					reject(error);
				} else {
					resolve(data.applications[0]);
				}
				if (callback) {
					callback(error, !error && data.applications[0]);
				}
			});
		});
	}

	/**
	 * Returns unique tags
	 * @param {function} callback The optional callback function
	 */
	getTags(callback) {
		return new Promise((resolve, reject) => {
			this._get("/tags/", (error, data) => {
				if (error) {
					reject(error);
				} else {
					resolve(data.tags);
				}
				if (callback) {
					callback(error, !error && data.tags);
				}
			});
		});
	}

	/**
	 * Returns a list of applications based on text and filter
	 * @param {object} params The search criteria
	 * @param {function} callback The callback function
	 * @example search({text: 'blah', filter: {tag: 'newrelease'}})
	 */
	search(params, callback) {
		return new Promise((resolve, reject) => {
			this._post("/apps/search", params, (error, data) => {
				if (error) {
					reject(error);
				} else {
					resolve(data.applications);
				}
				if (callback) {
					callback(error, !error && data.applications);
				}
			});
		});
	}
}
