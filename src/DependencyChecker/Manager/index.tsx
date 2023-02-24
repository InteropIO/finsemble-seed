import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { FinsembleProvider, FinsembleCSS } from "@finsemble/finsemble-core";
import "./styles.css";

const Dependency = (props) => {
	const { dependency, dependents, dependencyStatus, index, windowName } = props;

	let command;
	const doAction = async () => {
		switch (dependencyStatus) {
			case "started":
				command = "shutdown";
				break;

			case "not started":
			case "error":
				command = "start";
				break;

			default:
				break;
		}

		FSBL.Clients.RouterClient.transmit("DependencyChecker.dependencyManagerCommands", {
			command,
			windowName,
			dependency,
		});
	};

	const actionButtons = () => {
		if (dependencyStatus === "starting") {
			return "No actions available";
		} else {
			return <button onClick={doAction}>{dependencyStatus === "started" ? "Shutdown" : "Start"}</button>;
		}
	};

	return (
		<div className="child-wrapper" key={`${dependency}_${index}`}>
			<div className="child">{dependency}</div>
			<div className="child">{dependents.length === 0 ? "No active dependents" : dependents}</div>
			<div className="child">{dependencyStatus}</div>
			<div className="child">{actionButtons()}</div>
		</div>
	);
};

const DependencyManager = () => {
	const [dependencies, setDependencies] = useState({});

	useEffect(() => {
		const subscriptionId = FSBL.Clients.RouterClient.subscribe(
			"DependencyCheckerService.dependenciesStatuses",
			(err, response) => {
				if (err) {
					FSBL.Clients.Logger.error("DependencyManager - Error getting dependencies statuses", err);
				} else {
					setDependencies(response.data);
				}
			}
		);

		return () => {
			FSBL.Clients.RouterClient.unsubscribe(subscriptionId);
		};
	}, []);

	const hasDependencies = Object.keys(dependencies).length > 0;

	const deps =
		Object.keys(dependencies).map((dependency, index) => {
			const { dependents, dependencyStatus, windowName } = dependencies[dependency];
			return (
				<Dependency
					windowName={windowName}
					dependency={dependency}
					dependents={dependents}
					dependencyStatus={dependencyStatus}
					index={index}
				/>
			);
		}) ?? null;
	return (
		<div id="container">
			<div id="content">
				<div className="parent">
					<div className="child-wrapper">
						<div className="child center">Dependency</div>
						<div className="child center">Dependents</div>
						<div className="child center">Status</div>
						<div className="child center">Actions</div>
					</div>
					{hasDependencies ? deps : "No dependencies running"}
				</div>
			</div>
		</div>
	);
};

ReactDOM.render(
	<FinsembleProvider>
		<FinsembleCSS />
		<DependencyManager />
	</FinsembleProvider>,
	document.getElementsByTagName("div")[0]
);
