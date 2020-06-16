var chai = require("chai");
var { assert } = chai;
var { should } = chai;
var { expect } = chai;
var { RouterClient } = FSBL.Clients;
var { LauncherClient } = FSBL.Clients;

function createWorkspace(data) {
	return new Promise((resolve, reject) => {
		let button = document.getElementById("NewWorkspace");
		button.click();
		setTimeout(resolve, 2000);
	});
}

function getWorkspaceList() {
	return Array.from(document.querySelectorAll(".menu-primary > .menu-item"));
}
function lookForWorkspace(data) {
	return new Promise((resolve, reject) => {
		let { name } = data;
		let workspaces = getWorkspaceList();
		let workspace = workspaces.filter((el) => {
			let label = el.querySelectorAll(".menu-item-label")[0].textContent;
			return label === name;
		})[0];
		resolve(workspace);
	});
}
function toggleWorkspacePin(el) {
	return new Promise((resolve, reject) => {
		let button = el.querySelector(".ff-pin").parentNode;
		try {
			button.click();
			setTimeout(resolve, 1000);
		} catch (e) {
			reject(e);
		}
	});
}
function deleteWorkspace(data) {
	return new Promise((resolve, reject) => {
		let { name } = data;
		let workspaces = getWorkspaceList();
		for (let i = 0; i < workspaces.length; i++) {
			let workspaceEl = workspaces[i];
			let label = workspaceEl.querySelectorAll(".menu-item-label")[0]
				.textContent;
			if (label === name) {
				let button = workspaceEl.querySelectorAll(".remove-workspace")[0];
				button.click();
				setTimeout(resolve, 2000);
				break;
			}
		}
	});
}

function saveWorkspace() {
	return new Promise((resolve, reject) => {
		let button = document.getElementById("SaveWorkspace");
		button.click();
		setTimeout(resolve, 2000);
		resolve();
	});
}
function saveWorkspaceAs() {
	return new Promise((resolve, reject) => {
		let button = document.getElementById("SaveWorkspaceAs");
		button.click();
		setTimeout(resolve, 2000);
		resolve();
	});
}
function switchWorkspace(data) {
	return new Promise((resolve, reject) => {
		let workspaces = getWorkspaceList();
		let workspace;
		if (data.name) {
			let workspaceName = data.name;
			workspace = workspaces.filter((el, i) => {
				let label = el.querySelector(".menu-item-label").textContent;
				return label === workspaceName;
			})[0];
		} else if (typeof data.position !== "undefined") {
			workspace = workspaces[data.position];
		}
		if (workspace) {
			let label = workspace.querySelector(".menu-item-label");
			label.click();
			setTimeout(resolve, 1000);
		} else {
			reject(new Error("Workspace not found."));
		}
	});
}
/**
 * Test handler. Routes requests to the appropriate test methods.
 */
RouterClient.addResponder(
	"TestRunner.WorkspaceManagementMenu",
	(err, message) => {
		function sendSuccess(data) {
			message.sendQueryResponse(null, data || "Success");
		}
		function sendError(error) {
			message.sendQueryResponse(error, null);
		}
		let { data } = message;
		switch (data.test) {
			case "createWorkspace":
				createWorkspace()
					.then(sendSuccess)
					.catch(sendError);
				break;
			case "deleteWorkspace":
				deleteWorkspace(data)
					.then(sendSuccess)
					.catch(sendError);
				break;
			case "saveWorkspace":
				saveWorkspace()
					.then(sendSuccess)
					.catch(sendError);
				break;
			case "saveWorkspaceAs":
				saveWorkspaceAs()
					.then(sendSuccess)
					.catch(sendError);
				break;
			case "switchWorkspace":
				switchWorkspace(data)
					.then(sendSuccess)
					.catch(sendError);
				break;
			case "getWorkspaceList":
				let workspaceList = getWorkspaceList().map(
					(el, i) => el.querySelectorAll(".menu-item-label")[0].textContent
				);
				sendSuccess({
					workspaces: workspaceList,
				});
				break;
			case "toggleWorkspacePin":
				lookForWorkspace(data)
					.then(toggleWorkspacePin)
					.then(sendSuccess)
					.catch(sendError);
				break;
		}
	}
);
