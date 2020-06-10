/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/
import { _BaseClient } from "./baseClient";
import { StandardCallback } from "../globals";
/**
 *
 * @introduction
 * <h2>Search Client</h2>
 *
 * The Search Client allows for any window launched by Finsemble to act as a search provider or query against the registered providers.
 *
 *
 * See the <a href=tutorial-Search.html>Search tutorial</a> for an overview of using the Search Client.
 * @hideConstructor
 * @constructor
 */
export declare class SearchClient extends _BaseClient {
    searchId: any;
    resultsCallback: any;
    providers: {};
    resultProviders: {};
    searchResultsList: any[];
    isSearching: boolean;
    /**
     * Register a provider with the search service.
     * @param {Object} params - Params object
     * @param {String} params.name - The name of the provider.
     * @param {Function} params.searchCallback - A function called when a search is initialized.
     * @param {Function} params.itemActionCallback - A function that is called when an item action is fired.
     * @param {Function} params.providerActionCallback - A function that is called when a provider action is fired.
     * @param {string} params.providerActionTitle - The title of the provider action.
     * @param {Function} cb - Callback to be invoked when the provider is registered.
     * @example
     * FSBL.Clients.SearchClient.register({
     *		name: "MyProvider",
     *		searchCallback: searchApplications,
     *		itemActionCallback: itemActionCallback,
     *		providerActionTitle: providerActionTitle,
     *		providerActionCallback:providerActionCallback
     *	},
     *	(err, response) => {
     * 		//provider has been registered
     * 	});
     */
    register(params: {
        name: string;
        searchCallback: Function;
        itemActionCallback?: Function;
        providerActionCallback?: Function;
        providerActionTitle?: string;
    }, cb?: Function): any;
    /**
     * Remove a provider. This can only be done from the window that create the provider.
     * @param {Object} params
     * @param {string} params.name - The name of the provider to be removed.
     * @param {function} cb The callback to be invoked after the method completes successfully.
     * @example
     * FSBL.Clients.SearchClient.unregister({ name: "MyProvider" }, function(){ });
     */
    unregister(params: {
        name: string;
    }, cb?: Function): any;
    /**
     * Deprecated. Provided for backwards compatibility.
     * @see SearchClient.unregister
     */
    unRegister: (params: {
        name: string;
    }, cb?: Function) => any;
    /**
     * This initiates a search.
     * @param {Object} params - Params object
     * @param {String} params.text - The name of the provider.
     * @param {String} params.windowName Optional. Will be set to the window which is invoking the API method.
     * @param {function} cb - Callback to be called as search results for each provider are returned. Results are combined as they come in.
     * So, every response will have the complete list of results that have been returned. Example: You have two providers; provider one returns results first: you'll have an array with just provider one's data. Once provider
     * two returns, you'll have results for provider one and provider two.
     * @example
     * FSBL.Clients.SearchClient.search({
     *		text: "Chart",
     *	(err, response) => {
     * 		//Search results will be returned here
     * });
     */
    search(params: {
        text: string;
        windowName?: string;
    }, cb: Function): void;
    /**
     * Call this when you want to trigger an action associated to a returned item. There can be multiple actions associated with a result item and only one should be fired at a time.
     * @param {SearchResultItem} item - This is the search result item.
     * @param {Action} action - This is the action that you would like to fire.
     * @example
     * FSBL.Clients.SearchClient.invokeItemAction(resultItem,action);
     */
    invokeItemAction(item: any, action: Function): void;
    /**
     * Call this when you want to trigger an action associated to a provider. This may not exist on the provider.
     * @param {Provider} provider - This is the search result item.
     * @example
     * FSBL.Clients.SearchClient.invokeProviderAction(provider);
     */
    invokeProviderAction(provider: {
        channel: string;
    }): void;
    /**
     * This handles our results when we get them back from a provider
     * @private
     */
    handleResults: StandardCallback;
}
declare var searchClient: SearchClient;
export default searchClient;
