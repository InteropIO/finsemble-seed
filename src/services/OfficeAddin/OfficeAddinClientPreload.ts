import OfficeAddinClient from "./OfficeAddinClient";

const setupOfficeAdddinClient = () => {
    console.log("Setting up OfficeAddinClient");
	FSBL.Clients.OfficeAddinClient = new OfficeAddinClient(FSBL);
};


if (window.FSBL && FSBL.addEventListener) {
    FSBL.addEventListener("onReady", setupOfficeAdddinClient);
} else {
    window.addEventListener("FSBLReady", setupOfficeAdddinClient);
}