import OfficeAddinClient from "./OfficeAddinClient";

const setupOfficeAdddinClient = () => {
    console.log("Setting up OfficeAddinClient");
    (FSBL as any).Clients.OfficeAddinClient = new OfficeAddinClient(FSBL.Clients.RouterClient, FSBL.Clients.Logger, FSBL.Clients.DistributedStoreClient);
};


if (window.FSBL && FSBL.addEventListener) {
    FSBL.addEventListener("onReady", setupOfficeAdddinClient);
} else {
    window.addEventListener("FSBLReady", setupOfficeAdddinClient);
}