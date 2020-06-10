import { IRouterClient } from "../../types/FSBL-definitions/clients/IRouterClient";
import { ILogger } from "../../types/FSBL-definitions/clients/ILogger";
import { StandardCallback } from "../../types/FSBL-definitions/globals";

const { RouterClient, Logger } = require("@chartiq/finsemble").Clients;
const FSBL = window.FSBL;

/**
 * Internal (private) router channels, should not need to be referenced by outside of the Client src
 */
export const ROUTER_ENDPOINTS = {
	NOTIFY: "notify",
	SUBSCRIBE: "subscribe",
	UNSUBSCRIBE: "unsubscribe",
	PERFORM_ACTION: "perform_action",
	LAST_ISSUED: "last_issued",
	FETCH_HISTORY: "fetch_history",
	CHANNEL_PREFIX: "notification.",
	ACTION_PREFIX: "action."
};

/**
 * User for creating custom actions
 */
export const ROUTER_NAMESPACE = {
	ACTION_PREFIX: ROUTER_ENDPOINTS.CHANNEL_PREFIX + ROUTER_ENDPOINTS.ACTION_PREFIX
};

/**
 * Router wrapper created specifically for notifications to keep the clients and services DRY.
 * Also allows for using the NotificationClient in either a service (Finsemble.Clients.RouterClient) or
 * a component (FSBL.Clients.RouterClient). Also allows for dependency injection to remove Router calls from
 * testing.
 */
export default class RouterWrapper {
	routerClient: IRouterClient;
	loggerClient: ILogger;

	/**
	 * Constructor
	 *
	 * @param router Needs to be set if using in a service. Defaults to FSBL.Client.RouterClient if none is provided
	 * @param logger Needs to be set if using in a service. Defaults to FSBL.Client.Logger if none is provided
	 */
	constructor(router?: IRouterClient, logger?: ILogger) {
		if (!router) {
			router = typeof FSBL !== "undefined" ? FSBL.Clients.RouterClient : RouterClient;
		}

		if (!logger) {
			logger = typeof FSBL !== "undefined" ? FSBL.Clients.Logger : Logger;
		}

		this.routerClient = router;
		this.loggerClient = logger;

		this.query = this.query.bind(this);
		this.addResponder = this.addResponder.bind(this);
	}

	/**
	 * @param {string} channel
	 * @param {string} channelPrefix Will use the default prefix if null is passed
	 * @param {any} data
	 * @param {Function} callback
	 */
	public query(channel: string, data: {}, channelPrefix?: string, callback?: StandardCallback): Promise<any> {
		return new Promise<{}>(async (resolve, reject) => {
			try {
				if (channelPrefix == null) {
					channelPrefix = ROUTER_ENDPOINTS.CHANNEL_PREFIX;
				}
				this.loggerClient &&
					this.loggerClient.info(`Wrapper: sending message on ${channelPrefix + channel} channel`, data);

				const response = await this.routerClient.query(
					channelPrefix + channel,
					data,
					// eslint-disable-next-line @typescript-eslint/no-empty-function
					() => {} // Ignoring callback. Use the promise to get the result
				);

				if (response.err) {
					this.loggerClient && this.loggerClient.error(`Error: `, response.err);
					reject(response.err);
				} else {
					this.loggerClient && this.loggerClient && this.loggerClient.log(`${channel} raw response: `, response);
					if (callback) {
						callback(null, response.response.data.data);
					}
					resolve(response.response.data.data);
				}
			} catch (e) {
				this.loggerClient && this.loggerClient.error(`Error: `, e);
				if (callback) {
					callback(e);
				}
				reject(e);
			}
		});
	}

	/**
	 *
	 * @param {string} channel
	 * @param {Function} dataProcessor
	 * @param {string|null} channelPrefix
	 */
	public addResponder(channel: string, dataProcessor: (notification: any) => any, channelPrefix?: string) {
		if (channelPrefix == null) {
			channelPrefix = ROUTER_ENDPOINTS.CHANNEL_PREFIX;
		}
		this.loggerClient && this.loggerClient.info(`Wrapper: Adding responder for endpoint: ${channelPrefix + channel}`);

		this.routerClient.addResponder(channelPrefix + channel, (err, message) => {
			this.loggerClient && this.loggerClient.info(`Message received on ${channel}: `, message);
			if (err) {
				this.loggerClient && this.loggerClient.error(`Failed to setup ${channel} responder`, err);
				return;
			}

			try {
				this.loggerClient && this.loggerClient.info(`Processing message on channel ${channel}: `, message);
				const returnVal = dataProcessor(message.data);
				this.loggerClient && this.loggerClient.info(`Message response on ${channel}: `, returnVal);
				message.sendQueryResponse(null, {
					status: "success",
					data: returnVal
				});
			} catch (err) {
				this.loggerClient && this.loggerClient.error(`Failed to process query`, err);
				message.sendQueryResponse(err);
			}
		});
	}

	public removeResponder(channel: string, channelPrefix?: string) {
		if (channelPrefix == null) {
			channelPrefix = ROUTER_ENDPOINTS.CHANNEL_PREFIX;
		}

		this.routerClient.removeResponder(channelPrefix + channel);
	}

	/**
	 *
	 * @param channel
	 * @param channelPrefix
	 * @param payload
	 */
	public transmit(channel: string, payload: any, channelPrefix?: string) {
		if (channelPrefix == null) {
			channelPrefix = ROUTER_ENDPOINTS.CHANNEL_PREFIX;
		}
		this.loggerClient && this.loggerClient.info(`Transmitting on channel: ${channelPrefix + channel}`);
		this.routerClient.transmit(channelPrefix + channel, payload);
	}

	/**
	 *
	 * @param channel
	 * @param channelPrefix
	 * @param payload
	 */
	public publish(channel: string, payload: any, channelPrefix?: string) {
		if (channelPrefix == null) {
			channelPrefix = ROUTER_ENDPOINTS.CHANNEL_PREFIX;
		}

		this.loggerClient && this.loggerClient.info(channelPrefix);
		this.loggerClient && this.loggerClient.info(`Publishing on channel: ${channelPrefix + channel}`);
		this.routerClient.publish(channelPrefix + channel, payload);
	}
}
