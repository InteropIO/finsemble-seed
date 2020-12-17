// type imports for typescript
import { ResponderMessage } from "clients/IRouterClient";
import { FigiRequest, Finsemble } from "./OpenFIGITypes";

const Finsemble: Finsemble = require("@finsemble/finsemble-core");

Finsemble.Clients.Logger.start();
Finsemble.Clients.Logger.log("OpenFIGI Service starting up");


/*
OpenFIGIService:
	This service allows a Finsemble component to send a request to get a FIGI from the OpenFIGI api https://api.openfigi.com/api

  How it works:
  - Service sets up a query responder for "OpenFIGI"
	- This responder will pass data to the getOpenFigi method on OpenFIGIService. This method will make a fetch request to the openFIGI api and return the correct FIGI code(s)

  Example call to the service from a component:
  ```
  FSBL.Clients.RouterClient.query(
		"OpenFIGI",
		{"idType":"TICKER", "idValue":"IBM"},
		(err,response)=>console.log(response)
		)

  ```
 */
class OpenFIGIService extends Finsemble.baseService {

	constructor() {
		super({
			startupDependencies: {
				clients: [],
			},
		});

		this.readyHandler = this.readyHandler.bind(this);

		this.onBaseServiceReady(this.readyHandler);
	}

	/**
	 * Fired when the service is ready for initialization
	 * @param {function} callback
	 */
	readyHandler(callback: any) {
		this.createRouterEndpoints();
		Finsemble.Clients.Logger.log("OpenFIGI Service ready");
		callback();
	}

	// Implement service functionality
	async getOpenFigi(data: FigiRequest) {
		// OpenFIGI does not allow CORS so we use the cors-anywhere proxy
		const proxy = (URL: string) => `https://cors-anywhere.herokuapp.com/${URL}`;
		const API_URL = "https://api.openfigi.com/v2/mapping";
		const url = proxy(API_URL);

		// TODO: Add your API key here, OpenFIGI will rate limit api calls without one but it will still work. If you don't have one sign up here: https://www.openfigi.com/api
		const API_KEY = ""

		try {
			// make the API request to openFIGI
			const response = await fetch(url, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"X-OPENFIGI-APIKEY": API_KEY,
				},
				body: JSON.stringify([data]),
			});

			const result = response.json();
			Finsemble.Clients.Logger.log("___OPENFIGI - response: ", result);

			return result;
		} catch (error) {
			Finsemble.Clients.Logger.error(error);
			return error;
		}
	}

	/**
	 * Creates a router endpoint for you service.
	 * Add query responders, listeners or pub/sub topic as appropriate.
	 */
	createRouterEndpoints() {
		// Add responder (query / response mechanism) for openFigi
		Finsemble.Clients.RouterClient.addResponder(
			"OpenFIGI",
			(err, message: ResponderMessage<FigiRequest> | undefined) => {
				if (err) {
					return Finsemble.Clients.Logger.error(
						"Failed to setup OpenFIGI responder",
						err
					);
				}

				Finsemble.Clients.Logger.log(`OpenFIGI Query: ${JSON.stringify(message)}`);

				if (!message?.sendQueryResponse) {
					const customError = new Error(" sendQueryResponse is missing - something went wrong with the query response")
					Finsemble.Clients.Logger.error(customError)
					return customError
				}

				const { data, sendQueryResponse } = message

				if (data) {
					this.getOpenFigi(data)
						.then((openFigiData) => sendQueryResponse(null, openFigiData))
						.catch((err) => {
							Finsemble.Clients.Logger.error(err);
							// Send query response to the function call, with optional data, back to the caller.
							sendQueryResponse(err);
						});
				} else {
					const emptyDataError = new Error("OpenFIGI Service did not receive any data. Please send an object {idType:'string',idValue:'string'} or find out more here: https://www.openfigi.com/api#post-v2-mapping")

					Finsemble.Clients.Logger.error(emptyDataError)
					sendQueryResponse(emptyDataError)
				}
			}
		);
	}
}

const serviceInstance = new OpenFIGIService();

serviceInstance.start();
