import FpeRouter from '@chartiq/fpe-router';

// Initiate fpe-router
const finsembleRouter = FpeRouter.router;
const LauncherClient = FpeRouter.LauncherClient;
const launcherClient = new LauncherClient(finsembleRouter);
console.log("Finsemble Router Ready:", finsembleRouter);

const routerTest = () => {
    finsembleRouter.transmit("testChannel", "testData", {});
}

const launcherTest = () => {
    launcherClient.Spawn("Welcome Component", {}, () => {})
}


document.getElementById('routerBtn').onclick = routerTest
document.getElementById('launcherBtn').onclick = launcherTest