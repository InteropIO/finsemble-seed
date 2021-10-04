import FpeRouter from '@chartiq/fpe-router';
import {appId} from '../config/symphony-config'
// Initiate fpe-router
const finsembleRouter = FpeRouter.router;
const LauncherClient = FpeRouter.LauncherClient;
const launcherClient = new LauncherClient(finsembleRouter);
console.log("Finsemble Router Ready:", finsembleRouter);

var appViewName = appId+':view'
var appControllerName = appId+':controller'

// Initialise connection for Extension API services
SYMPHONY.remote.hello()
  .then((data) => {
    let themeColor = data.themeV2.name
    let themeSize = data.themeV2.size
    document.body.className = 'symphony-external-app ' + themeColor + ' ' + themeSize
    document.getElementById('transmitBtn').onclick = transmit
    document.getElementById('publishBtn').onclick = publish
    document.getElementById('queryBtn').onclick = query
    document.getElementById('spawnBtn').onclick = spawn
    document.getElementById('protocolBtn').onclick = protocol

    SYMPHONY.application
      .connect(appId, [appControllerName, 'dialogs'], [appViewName])
      .then((response) => {
        let finsembleAppId = SYMPHONY.services.subscribe(appControllerName)
        let dialogService = SYMPHONY.services.subscribe('dialogs')
        finsembleAppId.invoke('action').then((action) => {
          console.log("Finsemble Action Completed");
        })
      })
  })

const transmit = () => {
  let testData = document.getElementById('testData').value
  if (testData != '') {
    finsembleRouter.transmit("symphonyTransmit", testData, {});
  }
}

const publish = () => {
  let testData = document.getElementById('testData').value
  if (testData != '') {
    finsembleRouter.publish("symphonyPublish", testData);
  }
}

const query = () => {
  let testData = document.getElementById('testData').value
  if (testData != '') {
    finsembleRouter.query("symphonyQuery", testData, (error, queryResponseMessage) => {
      if (error) {
        console.log('query failed: ' + JSON.stringify(error));
      } else {
        // process income query response message
        console.log('query response: ', queryResponseMessage);
      }
    });
  }
}

const spawn = () => {
  let testData = document.getElementById('testData').value
  if (testData != '') {
    launcherClient.Spawn("SymphonyTester", {
      addToWorkspace: true,
      data: {
        testData: testData
      }
    }, () => {})
  }
}

const protocol = () => {
  let testData = document.getElementById('testData').value
  if (testData != '') {
    window.open('fsbl://custom/SymphonyExtension/rfq?target=SymphonyTester&testData=' + testData)
  }
}