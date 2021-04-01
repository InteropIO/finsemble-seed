import * as React from "react";
import "../intentResolver.css";
import CloseIcon from "./CloseIcon";
import AddBoxIcon from "./AddBoxIcon";
import OpenIcon from "./OpenIcon";
import AppCountIcon from "./AppCountIcon";
import { AppIntent, AppMetadata, IntentMetadata, Context } from "typedefs/FDC3/index";
import "@finsemble/finsemble-ui/react/assets/css/finsemble.css";
const { useState, useEffect } = React;

const { DialogManager, LauncherClient, Logger, RouterClient } = FSBL.Clients;

/**
 * Steps:
 *
 *
 *
 */
/*
 const exampleIntent: AppIntent = {
	intent: {
		name: "ViewChart",
		displayName: "View Chart",
	},
	apps: [
		{
			name: "Welcome Component",
			title: "Welcome Component",
			tooltip: "Welcome Component",
			icons: ["http://localhost:3375/assets/img/Finsemble_Taskbar_Icon.png"],
		},
	],
};
*/
type FinsembleComponent = { [key: string]: any };

interface FinsembleIntentApp extends AppMetadata {
	type: string;
}

/**
   * Groups the elements of an array based on the given function.

  Use Array.prototype.map() to map the values of an array to a function or property name. Use Array.prototype.reduce() to create an object, where the keys are produced from the mapped results.
   */
const groupBy = (arr: any[], fn: string | number) =>
	arr.map(typeof fn === "function" ? fn : (val) => val[fn]).reduce((acc, val, i) => {
		acc[val] = (acc[val] || []).concat(arr[i]);
		return acc;
	}, {});

export default function App() {
	const [intent, setIntent] = useState<IntentMetadata | null>(null);
	const [apps, setApps] = useState<Array<AppMetadata>>([]);
	const [context, setContext] = useState<Context>();
	const [source, setSource] = useState<string | null>(null);
	const [target, setTarget] = useState<string>();
	const [openApps, setOpenApps] = useState<{ [key: string]: FinsembleIntentApp[] }>();
	const [selectedOpenApps, setSelectedOpenApps] = useState<Array<FinsembleIntentApp>>([]);
	const selectedOpenApp = selectedOpenApps[0];
	let selectedOpenAppIcon: string | undefined;
	if (selectedOpenApp) {
		selectedOpenAppIcon = selectedOpenApp.icons?.[0] ? selectedOpenApp.icons[0] : selectedOpenApp.icons?.[1];
	}

	useEffect(() => {
		DialogManager.registerDialogCallback((err: any, res: any) => {
			if (err) throw Error(err);

			//TODO: Fix: dialog was not displaying so using show
			finsembleWindow.show({});

			Logger.log("_____INTENT:", res);
			console.log("_____INTENT:", res);

			const {
				appIntent,
				context,
				source,
				target,
			}: { appIntent: AppIntent; context: Context; source: string; target: string } = res.data;
			const { apps, intent } = appIntent;

			const removeDuplicateApps = (arr: any[]) =>
				arr.reduce((acc: any[], current: { name: any }) => {
					const x = acc.find((item: { name: any }) => item.name === current.name);
					if (!x) {
						return acc.concat([current]);
					} else {
						return acc;
					}
				}, []);

			setIntent(intent);
			setContext(context);
			setApps(removeDuplicateApps(apps));
			setSource(source);
			setTarget(target);

			getOpenApps(apps)
				.then(
					// group the list of apps by the component type ie. WelcomeComponents:[]
					(apps): { [key: string]: FinsembleIntentApp[] } => groupBy(apps, "type")
				)
				.then((res) => setOpenApps(res));
		});
	}, []);

	// Grab all Finsemble's open components and match them to the list of apps.
	// The list is of intentApps are Finsemble component types.
	const getOpenApps = async (apps: Array<AppMetadata>): Promise<FinsembleIntentApp[]> => {
		try {
			const { err, data }: any = await LauncherClient.getActiveDescriptors();

			if (err) throw Error(err);

			const components: FinsembleComponent[] = Object.values(data);
			// Get all the open components that match the apps list
			const openApps: Array<FinsembleIntentApp> = components
				.filter((component: FinsembleComponent) =>
					// if the component matches with an app of the same name return it
					apps.some((app: AppMetadata): boolean => app.name === component?.customData?.component?.type)
				)
				.map(
					(component: FinsembleComponent): FinsembleIntentApp => {
						const { name, componentType, icon } = component;
						const iconURL = component.customData?.foreign?.components?.Toolbar?.iconURL;
						return { name, type: componentType, icons: [icon, iconURL] };
					}
				);

			return openApps;
		} catch (err) {
			Logger.error(err);
			return err;
		}
	};

	/**
	 * show an open app and send the context via the router
	 * */
	const openAppWithIntent = (
		action: "show" | "spawn",
		data: { componentType: string; intent?: IntentMetadata; context: Context; name?: string }
	) => {
		const { intent, name, context, componentType } = data;

		if (action === "spawn") {
			//note use of intentContext to differentiate from data.fdc3.context variable used when passing context on open
			LauncherClient.spawn(
				componentType,
				{ data: { fdc3: { intent, intentContext: context } } },
				(err: any, data: any) => {
					const success = err ? false : true;

					DialogManager.respondToOpener({ success, intent, context, source, target });
				}
			);
		}

		if (action === "show") {
			FSBL.FinsembleWindow.getInstance({ name }, (err: any, wrap: any) => {
				const success = err ? false : true;
				if (!err) {
					wrap.bringToFront();
					RouterClient.transmit(`FDC3.intent.${intent?.name}.${name}`, context);

					DialogManager.respondToOpener({ success, intent, context, source, target });
				}
			});
		}
	};

	const clickedAnOpenApp = (name: string, type: string) => {
		return () => {
			if (context && intent) {
				openAppWithIntent("show", { name, componentType: type, context, intent });
				setSelectedOpenApps([]); // reset to hide the panel
			}
		};
	};

	const clickNewApp = () => {
		return () => {
			if (context && intent) {
				openAppWithIntent("spawn", { componentType: selectedOpenApps[0].type, intent, context });
				setSelectedOpenApps([]); // reset to hide the panel
			}
		};
	};

	const clickedAResolverApp = (app: AppMetadata) => {
		return () => {
			if (context && intent) {
				openApps?.[app.name]
					? setSelectedOpenApps(openApps[app.name])
					: openAppWithIntent("spawn", { componentType: app.name, intent, context });
			}
		};
	};

	const OpenAppsList = () => (
		<div className="app__list">
			<CloseIcon className="app__list--close-button" onClick={() => setSelectedOpenApps([])} />
			<h2>Open Apps</h2>
			<h3>
				{selectedOpenAppIcon && <img className="app__icon--apps-list" src={selectedOpenAppIcon} />}
				{selectedOpenApp?.type}
			</h3>
			<ul>
				{selectedOpenApps.map(({ name, type }) => (
					<li key={name}>
						<button onClick={clickedAnOpenApp(name, type)}>
							<OpenIcon />
							<span>{name}</span>
						</button>
					</li>
				))}
			</ul>
			<button className="app__new" onClick={clickNewApp()}>
				<AddBoxIcon /> <span>new</span>{" "}
			</button>
		</div>
	);

	return (
		<div className="resolver__container">
			<img className="resolver__header" src="./src/fdc3-intent-header.svg" />
			<CloseIcon className="resolver__close" onClick={() => DialogManager.respondToOpener({ error: true })} />
			<h2 className="resolver__action">
				<span className="resolver__action-source">{source}</span> would like to action the intent:{" "}
				<span className="resolver__action-intent">{intent?.displayName}</span>, open with...
			</h2>
			<div className="resolver__app-area">
				<div className="resolver__apps">
					{apps &&
						apps.map((app: AppMetadata) => (
							// if there are more than one then create a stack? Or an icon showing more

							<div className="app" key={app.name} onClick={clickedAResolverApp(app)}>
								{/* {openApps && openApps[app.name] && <BadgeIcon openAppCount={openApps[app.name].length} />} */}
								{openApps && openApps[app.name] && <AppCountIcon openAppCount={openApps[app.name].length} />}
								<div className="app__header">
									<img className="app__icon" src={`${app.icons?.[0] || app.icons?.[1] || "./src/launch.svg"}`} />
									<h3 className="app__type">{app.name}</h3>
								</div>
							</div>
						))}
				</div>
			</div>
			{!!selectedOpenApps.length && <OpenAppsList />}
		</div>
	);
}
