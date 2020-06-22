import * as React from 'react'
// import { FinsembleDialog } from "@chartiq/finsemble-react-controls";
import "../intentResolver.css";
import CloseIcon from './CloseIcon';
import AddBoxIcon from './AddBoxIcon';
import BadgeIcon from './BadgeIcon';
const { useState, useEffect } = React

const { DialogManager, LauncherClient, Logger, RouterClient } = FSBL.Clients

/**
 * Steps:
 *
 *
 *
 */
const exampleIntent: AppIntent = {
  "intent": {
    "name": "ViewChart",
    "displayName": "View Chart"
  },
  "apps": [
    {
      "name": "Welcome Component",
      "title": "Welcome Component",
      "tooltip": "Welcome Component",
      "icons": [
        "http://localhost:3375/assets/img/Finsemble_Taskbar_Icon.png"
      ]
    }
  ]
}
type FinsembleComponent = { [key: string]: any }

interface FinsembleIntentApp extends AppMetadata {
  type: string
}




/**
   * Groups the elements of an array based on the given function.

  Use Array.prototype.map() to map the values of an array to a function or property name. Use Array.prototype.reduce() to create an object, where the keys are produced from the mapped results.
   */
const groupBy = (arr: any[], fn: string | number) =>
  arr.map(typeof fn === 'function' ? fn : val => val[fn]).reduce((acc, val, i) => {
    acc[val] = (acc[val] || []).concat(arr[i]);
    return acc;
  }, {});


export default function App() {
  const [intent, setIntent] = useState<IntentMetadata>(null)
  const [apps, setApps] = useState<Array<AppMetadata>>([])
  const [context, setContext] = useState<Context>()
  const [source, setSource] = useState<string>(null)
  const [target, setTarget] = useState<string>()
  const [openApps, setOpenApps] = useState<{ [key: string]: FinsembleIntentApp[] }>()
  const [selectedOpenApps, setSelectedOpenApps] = useState<Array<FinsembleIntentApp>>([])

  useEffect(() => {


    DialogManager.registerDialogCallback((err: any, res: any) => {
      if (err) throw Error(err)

      //TODO: Fix: dialog was not displaying so using show
      finsembleWindow.show({})

      Logger.log("_____INTENT:", res)
      console.log("_____INTENT:", res)

      const { appIntent, context, source, target }: { appIntent: AppIntent, context: Context, source: string, target: string } = res.data
      const { apps, intent } = appIntent
      setIntent(intent)
      setContext(context)
      setApps(apps)
      setSource(source)
      setTarget(target)

      getOpenApps(apps)
        .then(
          // group the list of apps by the component type ie. WelcomeComponents:[]
          (apps): { [key: string]: FinsembleIntentApp[] } => groupBy(apps, 'type'))
        .then((res) => setOpenApps(res))

    });

  }, [])


  // Grab all Finsemble's open components and match them to the list of apps.
  // The list is of intentApps are Finsemble component types.
  const getOpenApps = async (apps: Array<AppMetadata>): Promise<FinsembleIntentApp[]> => {
    try {
      const { err, data }: any = await LauncherClient.getActiveDescriptors()

      if (err) throw Error(err)

      const components = Object.values(data)
      // Get all the open components that match the apps list
      const openApps: Array<FinsembleIntentApp> = components.filter(
        (component: FinsembleComponent) =>
          // if the component matches with an app of the same name return it
          apps.some(
            (app: AppMetadata): boolean => app.name === component.customData.component.type
          )
      ).map(
        (component: FinsembleComponent): FinsembleIntentApp => {
          const {
            name, componentType, icon } = component
          const iconURL = component.customData?.foreign?.components?.Toolbar?.iconURL
          return { name, type: componentType, icons: [icon, iconURL] }
        }
      )

      return openApps

    } catch (err) {
      Logger.error(err)
      return err
    }
  }

  /**
   * show an open app and send the context via the router
   * */
  const openAppWithIntent = (action: "show" | "spawn", data: { componentType: string; intent?: IntentMetadata; context: Context; name?: string; }) => {
    const { intent, name, context, componentType } = data

    if (action === "spawn") {
      LauncherClient.spawn(componentType, { data: { fdc3: { intent, context } } }, (err: any, data: any) => {
        const success = err ? false : true

        DialogManager.respondToOpener({ success, intent, context, source, target })
      }
      )
    }

    if (action === "show") {
      FSBL.FinsembleWindow.getInstance({name}, (err: any, wrap: any) => {
        const success = err ? false : true
          if (!err) {
            wrap.bringToFront();
            RouterClient.transmit(`FDC3.intent.${intent.name}`, context);

            DialogManager.respondToOpener({ success, intent, context, source, target });
          }
      })
    }
  }


  const OpenAppsList = () => (
    <div className="app__list">
      {/* <img className="app__icon" src={`${selectedOpenApps[0].icons[0]}`} /> */}
      <h2>{selectedOpenApps[0].type} - Open Apps:</h2>
      <hr></hr>
      <ul>
        {selectedOpenApps.map(({ name, type }) => (
          <li>
            <button key={name} onClick={() => {
              openAppWithIntent("show", { name, componentType: type, context, intent })
              setSelectedOpenApps([]) // reset to hide the panel
            }
            }>
              <img style={{ fill: 'white' }} src="./src/launch.svg"></img>{name}
            </button>
          </li>
        ))
        }
      </ul>
      <button className="app__new" onClick={() => {
        openAppWithIntent("spawn", { componentType: selectedOpenApps[0].type, intent, context })
        setSelectedOpenApps([]) // reset to hide the panel
      }
      } ><span><AddBoxIcon /></span> <span>new</span>  </button>
    </div>
  )


  return (
    <div className="resolver__container">
      <img className="resolver__header" src="./src/fdc3-intent-header.svg" />
      <CloseIcon className="resolver__close" onClick={() =>
        DialogManager.respondToOpener({ error: true })} />
      <h2 className="resolver__action"><span className="resolver__action-source">{source}</span> would like to action the intent: <span className="resolver__action-intent">{intent?.displayName}</span>, open with...</h2>
      <div className="resolver__apps">

        {
          apps &&
          apps
            .map((app: AppMetadata) => (
              // if there are more than one then create a stack? Or an icon showing more

              <div className="app" key={app.name} onClick={() => {
                openApps[app.name] ? setSelectedOpenApps(openApps[app.name]) :
                  openAppWithIntent("spawn", { componentType: app.name, intent, context })
              }}>
                {openApps && openApps[app.name] && <BadgeIcon openAppCount={openApps[app.name].length} />}
                <div className="app__header">
                  <img className="app__icon" src={`${app.icons[0] || app.icons[1] || "./src/launch.svg"}`} />
                  <h3 className="app__type">{app.name}</h3>

                </div>

              </div>
            )
            )
        }
        {
          !!selectedOpenApps.length && <OpenAppsList />
        }

      </div>
    </div >
  )
}


