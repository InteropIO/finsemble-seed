import desktopAgentUtilities from "./desktopAgentUtilities";
import { Launcher } from "../../../finsemble/types/services/window/Launcher/launcher";

export default class D implements DesktopAgent {
    fdc3Configuration: any;
    FSBL: any;

    constructor(params: any) {
        this.fdc3Configuration = params.fdc3Configuration;
        this.FSBL = params.FSBL;
    }

    addContextListener(contextType: string, handler: ContextHandler): Listener {
        throw new Error("Method not implemented.");
    }

    addIntentListener(intent: string, handler: ContextHandler): Listener {
        throw new Error("Method not implemented.");
    }
    
    async open(name: string, context?: object) {
		console.log("FDC3.desktopAgent triggered LauncherClient.spawn");
		await FSBL.Clients.LauncherClient.spawn(name, { data: { context } });			
	}

	async findIntent(intent: string, context?: Context): Promise<AppIntent> {
		var appIntentMatches = desktopAgentUtilities.findAllIntentMatchesandFormatResponse(this.fdc3Configuration, intent, context);
		console.log("All Formatted Matches: ", appIntentMatches);

		if (Array.isArray(appIntentMatches)) {
			return appIntentMatches[0];
		} else {
			return appIntentMatches;
		}
	}

	findIntentsByContext(context: Context): Promise<Array<AppIntent>> {
		var appIntentMatches = desktopAgentUtilities.findAllContextMatchesandFormatResponse(this.fdc3Configuration, context);
		console.log("All Formatted Matches: ", appIntentMatches);
		return appIntentMatches;
	}

	broadcast(context: any): void {
		FSBL.Clients.RouterClient.transmit("broadcast", context);
	}

	async raiseIntent(intent: string, context: Context, target?: string): Promise<IntentResolution> {
		let resolvedIntent;
		const { data: componentList }: any = await FSBL.Clients.LauncherClient.getActiveDescriptors();
		console.log("componentList", componentList);
		const intentComponentList = desktopAgentUtilities.findAllIntentMatchesandFormatResponse(this.fdc3Configuration, intent, context);
		console.log("intents:", intentComponentList)
		desktopAgentUtilities.resolveIntent(intent, intentComponentList, componentList, context);
		console.log("return value", resolvedIntent);
		const dataType = target + intent;
		return null; //new { source: "source", data: context, resolution: "resolved" };
	}

	getSystemChannels(): Promise<Array<Channel>> { return null;};

	joinChannel(channelId: string): Promise<void> { return null; };

	getOrCreateChannel(channelId: string): Promise<Channel> {
		return null;
	};

}