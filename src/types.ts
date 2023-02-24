export type Status = "not started" | "starting" | "started" | "error";

export type DependentsDependencyStatus = {
	dependents: string[]; // windowNames[]
	dependencyStatus: Status;
	windowName?: string;
};

export type DependencyStatus = Record<string, DependentsDependencyStatus>;

export type Dependency = {
	appId: string;
} & DependencyConfig;

export type DependencyConfig = {
	shutdownTimeout?: number; // timeout to invoke dependency shutdown
	waitForInitialization?: boolean; // whether the application should wait for the dependency to signal its readiness
	retries?: number; // the number of retries to try to start the dependency
	interval?: number; // the incremental interval between retries
	critical?: boolean; // whether this dependency is critical or not - failure will halt the component spawning
	initializationTimeout?: number; // the timeout to wait for a dependency to signal its readiness
};

export type WindowNameDependencies = Record<string, Dependency[]>;
