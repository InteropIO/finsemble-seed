/*!
 * Copyright 2017 by ChartIQ, Inc.
 * All rights reserved.
 */
import { FEAGlobals, ShowWindowParams, StoreModel, System } from "@finsemble/finsemble-core";
import React, { useRef, useEffect } from "react";
import { STATE_DISTRIBUTED_STORE_ACTIVEWINDOWNAME_FIELD, STATE_DISTRIBUTED_STORE_NAME } from "../customFDC3/constants";
import { LinkerGroups } from "./CustomLinkerGroups";
import { debug, errorLog } from "../customFDC3/utils";

interface LinkerButtonProps {
	enableKeyboardShortcut?: boolean;
}



const LinkerButtonIcon = () => (
	<svg
		width="15px"
		height="15px"
		viewBox="2 1 13 13"
		xmlns="http://www.w3.org/2000/svg"
		xmlnsXlink="http://www.w3.org/1999/xlink"
	>
		<title>Linker</title>
		<defs>
			<path
				id="prefix__b"
				d="M17.925 15.425h-1v-2.5a2.5 2.5 0 0 0-5 0v2.5h-1v-2.5a3.5 3.5 0 1 1 7 0v2.5zm0 2v2.5a3.5 3.5 0 1 1-7 0v-2.5h1v2.5a2.5 2.5 0 0 0 5 0v-2.5h1zm-3.5-4a.5.5 0 0 1 .5.5v5a.5.5 0 0 1-1 0v-5a.5.5 0 0 1 .5-.5z"
			/>
			<filter id="prefix__a" x="-28.6%" y="-7.1%" width="157.1%" height="128.6%">
				<feOffset dy="1" in="SourceAlpha" result="shadowOffsetOuter1" />
				<feGaussianBlur in="shadowOffsetOuter1" result="shadowBlurOuter1" stdDeviation=".5" />
				<feColorMatrix in="shadowBlurOuter1" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.5 0" />
			</filter>
		</defs>
		<g transform="rotate(45 22.289 4.682)" fillRule="nonzero" fill="red">  {/*minor customisation to differentiate from standard button during testing */}
			<use filter="url(#prefix__a)" xlinkHref="#prefix__b" />
			<use xlinkHref="#prefix__b" />
		</g>
	</svg>
);


const CustomLinkerBtn: React.FunctionComponent<LinkerButtonProps> = ({
	enableKeyboardShortcut = true,
}: LinkerButtonProps) => {

	const myWindowName = System.Window.getCurrent().name;
	const buttonRef = useRef(null);
	let distribStoreObj: StoreModel | null = null;

	/** Retrieve the distributed store used for state communication. */
	const getDistributedStore = async () => {
		const setHandlers = (storeObj: StoreModel) => {
			distribStoreObj = storeObj;
			//if any listeners are needed, set them here
			//distribStoreObj.addListener([STATE_DISTRIBUTED_STORE_STATE_FIELD, myWindowName],channelStateHandler);
			debug(`DistributedStore ${STATE_DISTRIBUTED_STORE_NAME} connected`);
		};
		FEAGlobals.FSBL.Clients.DistributedStoreClient.getStore({
			store: STATE_DISTRIBUTED_STORE_NAME,
			global: true
		},
		(err, storeObject) => {
			if (err || !storeObject) {
				errorLog(`DistributedStore ${STATE_DISTRIBUTED_STORE_NAME} could not be retrieved`, err);
			} else {
				setHandlers(storeObject);
			}
		});
	};

	const unsubscribeDistributedStore = () => {
		//remove any listeners here
		//distribStoreObj?.removeListener([STATE_DISTRIBUTED_STORE_STATE_FIELD, myWindowName], channelStateHandler);
	};

	useEffect(() => {
		getDistributedStore();
		return () => {
			unsubscribeDistributedStore();
		};
	}, []);


	const showLinkerWindow = async () => {
		if (!distribStoreObj){
			errorLog(`Unable to aopen custom Linker window due to no connection to DistributedStore ${STATE_DISTRIBUTED_STORE_NAME}`);
		} else {
			//set active window so menu updates itself
			await distribStoreObj.set([STATE_DISTRIBUTED_STORE_ACTIVEWINDOWNAME_FIELD], myWindowName);
			
			//then show it
			const linkerButton = buttonRef.current;
			if (linkerButton) {
				const linkerButtonDiv = linkerButton as HTMLElement;
				const linkerParent = (linkerButtonDiv.offsetParent ?? linkerButtonDiv.parentElement) as HTMLElement;

				const params: ShowWindowParams = {
					position: "relative",
					left: linkerParent?.offsetLeft ?? 0,
					top: linkerParent?.offsetHeight ?? 0,
					forceOntoMonitor: true,
					spawnIfNotFound: false,
				};
				const wi = {
					componentType: "CustomFDC3Linker",
				};
				FEAGlobals.FSBL.Clients.LauncherClient.toggleWindowOnClick(linkerButtonDiv, wi, params);
			}
		}
	};

	useEffect(() => {
		enableKeyboardShortcut &&
			window.addEventListener("keydown", (e) => {
				if (e.key === "l" && (e.ctrlKey || e.metaKey)) {
					showLinkerWindow();
				}
			});
	}, []);

	return (
		<>
			<div ref={buttonRef} title="Link Data" className="linkerSection">
				<div className="fsbl-icon fsbl-linker" onClick={showLinkerWindow} style={{backgroundColor: "red"}}>
					<LinkerButtonIcon />
				</div>
				<LinkerGroups />
			</div>
		</>
	);
};

export const CustomLinkerButton: React.FunctionComponent<LinkerButtonProps> = ({
	enableKeyboardShortcut = true,
}: LinkerButtonProps) => <CustomLinkerBtn enableKeyboardShortcut={enableKeyboardShortcut} />;
