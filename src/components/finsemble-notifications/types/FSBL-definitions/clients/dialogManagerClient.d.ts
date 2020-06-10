import { _BaseClient } from "./baseClient";
import { SpawnParams } from "../services/window/Launcher/launcher";
import { StandardCallback } from "../globals";
/**
 *
 * @introduction
 * <h2>Dialog Manager Client</h2>
 *
 * The Dialog Manager Client simplifies interacting with dialog windows by spawning them and getting data back from them.
 * In this context, a dialog window is simply a child window spawned to interact with the user, such as a confirmation dialog.
 * Functions are provided here for both the parent-window side and the dialog/child-window side.
 *
 *`FSBL.Clients.DialogManager` is always pre-initialized with one instance of the Dialog Manager in the Finsemble Library (making it essentially, a singleton when referenced in the same window). This means when developing Finsemble components, you directly access the Dialog Manager without using the constructor (e.g., `FSBL.Clients.DialogManager.spawnDialog(...);`). **The constructor is not exposed to components.**
 *
 *
 * @param {object=} params optional parameters
 * @param {function=} params.onReady callback function indicating when client is ready
 * @param {string=} params.name client name for diagnostics/logging
 * @constructor
 * @hideconstructor
 */
export declare class DialogManagerClient extends _BaseClient {
    /** Deprecated var.
     * @TODO - Remove this.
     */
    userInputTimeout: any;
    constructor(params: any);
    /**
     * Spawns a dialog window.
     *
     * parameters passed here in <code>>params.inputParams</code> can be retrieved in the dialog window by calling <code>getParametersFromInDialog</code>.
     *
     * @param {object} params Parameters. Same as {@link LauncherClient#spawn} with the following exceptions.
     * @param {string} params.url URL of dialog to launch
     * @param {string} [params.name] - The name of the dialog
     * @param {number|string} params.x - Same as {@link LauncherClient#spawn} except defaults to "center".
     * @param {number | string} [params.y="center"] - Same as {@link LauncherClient#spawn} except defaults to "center".
     * @param {object} inputParams Object or any data type needed by your dialog.
     * @param {function} dialogResponseCallback called when response received back from dialog window (typically on dialog completion). `responseParameters` is defined by the dialog.
     * @param {function} cb Returns response from {@link LauncherClient#spawn}
     *
     * @example
     * FSBL.Clients.DialogManager.spawnDialog(
     * {
     * 	name: "dialogTemplate",
     * 	height:300,
     * 	width:400,
     * 	url:"http://localhost/components/system/dialogs/dialog1.html"
     * },
     * {
     * 	someData: 12345
     * },
     * (error, responseParameters) => {
     *	if (!error) {
     * 		console.log(">>>> spawnDialog response: " + JSON.stringify(responseParameters));
     *	}
     * });
     * @todo allow dialogs to be permanent components instead of ad-hoc.
     * @todo support paramter to make the dialog modal
     */
    spawnDialog(params: SpawnParams, inputParams: any, dialogResponseCallback: any, cb?: StandardCallback): void;
    /**
     * Called from within dialog window to get the parameters passed in <code>spawnDialog</code> as <code>"inputParams"</code>. For example, if your dialog has a configurable title, you would pass it in to <code>spawnDialog</code>, and retrieve the value using <code>getParametersFromInDialog</code>.
     * @todo this auto-bind syntax prevents examples from rendering in documentation.
     * @example
     * var dialogData = FSBL.Clients.DialogManager.getParametersFromInDialog();
     */
    getParametersFromInDialog: () => any;
    /**
     * Called within the dialog window to pass back a dialog response. This results in the <code>spawnDialog</code> callback function (i.e., <code>dialogResponseCallback</code>) being invoked with <code>responseParameters</code> passed in.
     *
     * @param {object} responseParameters The parameters returned to parent (i.e., window that spawned the dialog).
     *
     * @example
     * FSBL.Clients.DialogManager.respondAndExitFromInDialog({ choice: response });
     */
    respondAndExitFromInDialog: (responseParameters: any) => void;
    /**
     * @private
     * @param {string} type
     * @param {function} cb
     */
    getAvailableDialog: (type: any, cb: any) => void;
    /**
     * Generates a string for the "onReady" for a given channel.
     * @private
     * @param {object} identifier
     */
    generateDialogReadyChannel: (identifier: any) => string;
    /**
     * Broadcasts a message to the window that opened the dialog saying "I'm ready, please show me."
     */
    showDialog: () => void;
    /**
     * Function to initialize and open a dialog.
     * @param {object} identifier The window identifier of the dialog.
     * @param {object} options Any data to send to the dialog for its initialization.
     * @param {function} onUserInput Callback to be invoked after the user interacts with the dialog.
     */
    sendQueryToDialog: (identifier: any, options: any, onUserInput: any) => void;
    /**
     * State management - just moves an opened dialog back to the "available" pool.
     * @private
     * @param {object} identifier window identifier of the dialog.
     */
    moveDialogFromOpenedToAvailable: (identifier: any) => void;
    /**
     * State management - just moves an available dialog out of the "available" pool.
     * @private
     * @param {object} identifier window identifier of the dialog.
     */
    moveDialogFromAvailableToOpened: (identifier: any) => void;
    /**
     * Registers a window as a modal with the global dialog management store.
     */
    registerModal: () => void;
    /**
     * Shows a semi-transparent black modal behind the dialog.
     * @param {function} cb The callback to be invoked after the method completes successfully.
     */
    showModal: (cb?: Function) => void;
    /**
     * Retrieves an available dialog. If none are found, one will be created with the options passed.
     * @param {string} type Component type to open. The <code>type</code> must be a key in the finsemble.components configuration object.
     * @param {object} options Options to pass into the opened window.
     * @param {function} onUserInput Callback to be invoked when the user interacts with the dialog.
     */
    open: (type: string, options: any, onUserInput: Function) => void;
    DialogStore: any;
    isDialog: boolean;
    isModal: boolean;
    RESPONDER_CHANNEL: any;
    openerMessage: any;
    /**
     * Used by the window that is opening a dialog. This method sets up a query/responder that the opened dialog will invoke when the user has interacted with the dialog.
     * @param {function} callback Callback to be invoked after the user interacts with the dialog. Any data sent back from the dialog will be passed in as the 2nd parameter to this callback.
     */
    registerDialogCallback: (callback: any) => void;
    /**
     * Hides the dialog's modal.
     */
    hideModal: () => void;
    /**
     * Sends data back to the window that opened the dialog. Will hide the modal unless <code>{ hideModalOnClose: false }</code> is passed in as the first argument.
     * @param {any} data
     */
    respondToOpener: (data: any) => void;
    /**
     * Registers the window as a dialog with the global store. If the component is incapable of being used as a dialog (this is set in the component's config), the callback is immediately invoked.
     *
     * <b>Note:</b> This method will check to see whether the calling window is a dialog.
     * @param {function} callback The callback to be invoked after the method completes successfully.
     */
    registerWithStore: (callback: Function) => void;
    /**
     * Checks to see whether the window is a dialog.
     * @param {cb} cb The callback to be invoked after the method completes successfully.
     */
    checkIfWindowIsDialog: (cb?: Function) => void;
    /**
     * Creates the global store if it doesn't exist.
     * @private
     * @param {function} callback
     */
    createStore: (callback: Function) => void;
    /**
     * @private
     * @memberof DialogManagerClient
     */
    getFinsembleWindow: (cb: Function) => void;
}
declare var dialogManagerClient: DialogManagerClient;
export default dialogManagerClient;
