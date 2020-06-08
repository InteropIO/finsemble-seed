import * as React from 'react'
// import { FinsembleDialog } from "@chartiq/finsemble-react-controls";
import "../intentResolver.css";
import CloseIcon from './CloseIcon';
const { useState, useEffect } = React

const { DialogManager, LauncherClient, Logger } = FSBL.Clients

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


  const o = (windowName: string, context: Context) => {
    const windowIdentifier: WindowIdentifier = {
      windowName
    }
    // LauncherClient.showWindow(windowIdentifier, { data: context }, cb)
  }

  return (
    <div className="resolver__container">
      <img className="resolver__header" src="./src/fdc3-intent-header.svg" />
      <CloseIcon className="resolver__close" onClick={() => {
        DialogManager.respondToOpener({ action: 'close' })
      }} />
      <h2 className="resolver__action"><span className="resolver__action-source">{source}</span> would like to start a <span className="resolver__action-intent">{intent?.displayName}</span>, open with...</h2>
      <div className="resolver__apps">

        {
          openApps &&
          Object.entries(openApps)
            .map(([componentType, appList]: [string, FinsembleIntentApp[]]) => (
              <div key={componentType} >
                <h2>{componentType}</h2>
                <ul>
                  {appList.map(({ name, type, icons }) => (
                    <button key={name} onClick={() => fdc3.open(name, context)}>
                      <img src={`${icons[0] || "./src/launch.svg"}`} />
                      <p>{name}</p>
                    </button>
                  ))
                  }
                  <button onClick={() => fdc3.open(componentType, context)}>
                    {/* <img src={`${icons[0] || "./src/launch.svg"}`} /> */}
                    <p>Open a new {componentType}</p>
                  </button>
                </ul>
              </div>
            )
            )

        }

      </div>
    </div >
  )
}


