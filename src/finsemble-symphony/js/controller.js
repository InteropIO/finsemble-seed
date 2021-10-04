import FpeRouter from '@chartiq/fpe-router';
import {
  appId,
  appPath,
  appName
} from '../config/symphony-config'

const axios = require('axios').default;

var appControllerName = appId + ':controller'
var appService = SYMPHONY.services.register(appControllerName);

// Initiate fpe-router
const finsembleRouter = FpeRouter.router;
const LauncherClient = FpeRouter.LauncherClient;
const launcherClient = new LauncherClient(finsembleRouter);
console.log("Finsemble Router Ready:", finsembleRouter);

let connectedToBBG = false;
finsembleRouter.addPubSubResponder("SymphonyServiceConnectedToBloomberg", { "connected": false }, null, (err,response) => {
  if (err) {
    console.error("Error when creating the Bloomberg connection state PubSub, it may already exist", err);
  } else {
    console.log("Created Bloomberg connection state PubSub");
  }
  
  finsembleRouter.subscribe("SymphonyServiceConnectedToBloomberg", function(err, notify) {
    if (!err) {
      connectedToBBG = notify.data.connected;
      console.log("Updated Bloomberg connection state: " + connectedToBBG);
    }
  });
});


// Initialize connection for Extension API services
// Register the App for remote Extension API services (id, services, localService)
const xmlize = (html) => {
  return new XMLSerializer().serializeToString($('<span>').html(html)[0])
}

SYMPHONY.remote.hello().then((data) => {
  axios.post('/symphonyIntegration/extensionAuth', {
      pod: data.pod
    })
    .then((response) => {
      let appId = response.data.appId
      let appToken = response.data.appToken
      let symphonyToken = response.data.symphonyToken
      SYMPHONY.application
        .register({
          appId: appId,
          tokenA: appToken,
        }, ['entity', 'modules', 'applications-nav', 'ui', 'dialogs', 'extended-user-info'], [appControllerName])
        .then((response) => {
          userId = response.userReferenceId

          const modulesService = SYMPHONY.services.subscribe('modules')
          const navService = SYMPHONY.services.subscribe('applications-nav')
          const entityService = SYMPHONY.services.subscribe('entity')
          const uiService = SYMPHONY.services.subscribe('ui');
          const dialogsService = SYMPHONY.services.subscribe('dialogs');
          const userInfoService = SYMPHONY.services.subscribe('extended-user-info');

          var userId = '';
          userInfoService.getJwt().then(response => {
            var jwt = JSON.parse(window.atob(response.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
            userId = jwt.user.id;
          });

          const rfqParseButton = {
            label: 'Parse RFQ',
            data: {}
          };


          // Add our App to the left Nav
          navService.add('finsemble-nav', appName, appControllerName)
          // Register our renderer to display structured objects
          entityService.registerRenderer('com.symphony.finsemble.rfq', {}, appControllerName)
          entityService.registerRenderer('com.symphony.finsemble.test', {}, appControllerName)

          // Implement our local Finsemble service
          appService.implement({
            // Main Renderer
            render: (type, entityData) => {
              entityData.instanceId = entityData.quoteId ? entityData.quoteId : entityData.testId;
              entityData.renderTime = new Date();

              switch (type) {
                case 'com.symphony.finsemble.rfq':
                  return getRFQTemplate(entityData)
                case 'com.symphony.finsemble.test':
                  return getTestTemplate(entityData)
                default:
                  return {
                    data: {}, template: `<entity>Invalid element type ${entityData.type}</entity>`
                  }
              }

            },

            // Button
            getFinsembleButton: () => {
              console.log("Finsemble Button Function Called");
            },

            // Action - After button is clicked
            action: (data) => {
              console.log("Finsemble Action:", data, data.entityData);
              if (data.cmd === 'finsembleRouterAction') {
                switch (data.entityData.type) {
                  case 'com.symphony.finsemble.rfq':
                    switch (data.choice) {
                      case "News":
                        return rfq_news(data.entityData);
                      case "Chart":
                        return rfq_chart(data.entityData);
                      case "Order":
                        return rfq_order(data.entityData);
                      case "DES":
                        return rfq_DES(data.entityData);
                      case "Launchpad":
                        return rfq_Launchpad(data.entityData);
                      default:
                        console.warn("The default action ran");
                        return {};
                    }
                    case 'com.symphony.finsemble.test':
                      switch (data.choice) {
                        case "Transmit":
                          return test_transmit(data.entityData);
                        case "Publish":
                          return test_publish(data.entityData);
                        case "Query":
                          return test_query(data.entityData);
                        case "Spawn":
                          return test_spawn(data.entityData);
                        case "Protocol":
                          return test_protocol(data.entityData);
                        default:
                          console.warn("The default action ran");
                          return {};
                      }
                      default:
                        return;
                }
              }
            },

            executeComms: () => {
              console.log("Finsemble Execute Comms Function Called");
            },
            select: (id) => {
              console.log("Finsemble Select Function Called");
              if (id === 'finsemble-nav') {
                modulesService.show(
                  'finsembleLocalApp', {
                    title: 'Finsemble Application'
                  },
                  appControllerName,
                  appPath, {
                    'canFloat': true
                  }
                )
              }
            }

          })
        }).fail(err => {
          console.log('Failed to register service', err)
        })
    })
    .catch((error) => {
      console.log(error);
    });
})

// List button options for each menu item
const getRFQTemplate = (entityData) => {
  let options = ['News', 'Chart', 'Order'];
  if (connectedToBBG) {
    options = ['News', 'Chart', 'Order', 'DES', 'Launchpad'];
  }
  
  let dataOptions = options
    .map(option => `<action class="button" id="${option}"/>`)
    .join('');
  let data = {
    accent: 'tempo-bg-color--blue'
  };
  options.forEach(option => {
    const thisId = option.replace(/[^\w]/g, '')
    data[thisId] = {
      label: option,
      service: appControllerName,
      data: {
        cmd: 'finsembleRouterAction',
        choice: option,
        entity: options,
        entityData: entityData
      }
    }
  });
  let template =
    `<entity id="button-template" class="template">
      <card id="card">
        <h2 style="padding-left: 10px;">Request for Quote</h2>
        <div>
        <table>
          <tr>
            <td style="padding-left: 10px;"><b>Request Party:</b></td>
            <td> ${entityData.rfq.user.displayName}</td>
          </tr>
          <tr>
            <td style="padding-left: 10px;"><b>Product Name:</b></td>
            <td> ${entityData.rfq.symbol}</td>
          </tr>
          <tr>
            <td style="padding-left: 10px;"><b>Exchange:</b></td>
            <td> ${entityData.rfq.exchange}</td>
          </tr>
          <tr>
            <td style="padding-left: 10px;"><b>Quantity:</b></td>
            <td> ${entityData.rfq.side}  ${entityData.rfq.quantity}</td>
          </tr>
          <tr>
            <td style="padding-left: 10px;"><b>Expiration Date:</b></td>
            <td> ${entityData.rfq.expiration}</td>
          </tr>
          <tr>
            <td style="padding-left: 10px;"><b>Rendered at:</b></td>
            <td> ${entityData.renderTime}</td>
          </tr>
        </table>
        </div>
        <p style="padding-left: 10px;">${dataOptions}</p>
        
      </card>
    </entity>`;
  return {
    template: template,
    data: data,
    entityInstanceId: entityData.instanceId
  }
}

const rfq_news = (data) => {
  let params = {
    target: 'News',
    action: 'spawn',
    data: {
      symbol: data.rfq.symbol
    }
  }
  finsembleRouter.transmit("SymphonyRfqTransmit", params, {});
}

const rfq_chart = (data) => {
  let params = {
    target: 'Advanced Chart',
    action: 'spawn',
    data: {
      symbol: data.rfq.symbol
    }
  }
  finsembleRouter.transmit("SymphonyRfqTransmit", params, {});
}

const rfq_order = (data) => {
  let params = {
    target: 'Order Management',
    action: 'createOrder',
    data: data.rfq
  }
  finsembleRouter.transmit("SymphonyRfqTransmit", params, {});
}

const rfq_DES = (data) => {
  let params = {
    target: 'Bloomberg',
    action: 'DES',
    data: data.rfq
  }
  finsembleRouter.transmit("SymphonyRfqTransmit", params, {});
}

const rfq_Launchpad = (data) => {
  let params = {
    target: 'Bloomberg',
    action: 'Launchpad',
    data: data.rfq
  }
  finsembleRouter.transmit("SymphonyRfqTransmit", params, {});
}


const getTestTemplate = (entityData) => {
  const options = ['Transmit', 'Publish', 'Query', 'Spawn', 'Protocol'];
  const dataOptions = options
    .map(option => `<action class="button" id="${option}"/>`)
    .join('');
  const data = {
    accent: 'tempo-bg-color--blue'
  };
  options.forEach(option => {
    const thisId = option.replace(/[^\w]/g, '')
    data[thisId] = {
      label: option,
      service: appControllerName,
      data: {
        cmd: 'finsembleRouterAction',
        choice: option,
        entity: options,
        entityData: entityData
      }
    }
  });
  const template =
    `<entity id="button-template" class="template">
      <card id="card">
        <h2>Test Information</h2>
        <div>
        <table>
          <tr>
            <td><b>Sent By:</b></td>
            <td> ${entityData.test.user.displayName}</td>
          </tr>
          <tr>
            <td><b>Test Field 1:</b></td>
            <td> ${entityData.test.test_field_1}</td>
          </tr>
          <tr>
            <td><b>Test Field 2:</b></td>
            <td> ${entityData.test.test_field_2}</td>
          </tr>
        </table>
        </div>
        <p>${dataOptions}</p>
      </card>
    </entity>`;
  return {
    template: template,
    data: data,
    entityInstanceId: entityData.instanceId
  }
}

const test_transmit = (data) => {
  finsembleRouter.transmit("symphonyTransmit", data, {});
}

const test_spawn = (data) => {
  launcherClient.spawn("SymphonyTester", {
    addToWorkspace: true,
    data: {
      testData: data
    }
  }, (err,response) => { 
    if (err) {
      console.error("error when spawning SymphonyTester", err);
    } else { 
      console.log("spawned SymphonyTester");
    }
  });
}

const test_publish = (data) => {
  finsembleRouter.publish("symphonyPublish", data);
}

const test_query = (data) => {
  finsembleRouter.query("symphonyQuery", data, (error, queryResponseMessage) => {
    if (error) {
      console.log('query failed: ' + JSON.stringify(error));
    } else {
      // process income query response message
      console.log('query response: ', queryResponseMessage);
    }
  });
}
const test_protocol = (data) => {
  window.open('fsbl://custom/SymphonyExtension/rfq?target=SymphonyTester&testData=' + JSON.stringify(data.test))
}