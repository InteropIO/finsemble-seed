import * as React from 'react'
// import { FinsembleDialog } from "@chartiq/finsemble-react-controls";
import "../intentResolver.css";
import CloseIcon from './CloseIcon';
const { useState, useEffect } = React


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


/**
   * Groups the elements of an array based on the given function.

  Use Array.prototype.map() to map the values of an array to a function or property name. Use Array.prototype.reduce() to create an object, where the keys are produced from the mapped results.
   */
const groupBy = (arr: Array<any>, fn: Function | any): any =>
  arr
    .map(typeof fn === 'function' ? fn : val => val[fn])
    .reduce((acc: any, val: any, i: number): any => {
      acc[val] = (acc[val] || []).concat(arr[i]);
      return acc;
    }, {});

type AppComponent = [string, string, string[]]

type FinsembleComponent = { [key: string]: any }

export default async function App() {
  const [intent, setIntent] = useState<IntentMetadata>(null)
  const [apps, setApps] = useState<Array<AppMetadata>>([])
  const [context, setContext] = useState<Context>()
  const [source, setSource] = useState<string>(null)
  const [target, setTarget] = useState<string>()

  const { DialogManager, LauncherClient, Logger } = FSBL.Clients


  useEffect(() => {
    // TODO: loop through the apps and get active descriptors if they include the type of component as the app name

    DialogManager.registerDialogCallback((err: any, res: any) => {
      if (err) throw Error(err)

      //TODO: Fix: dialog was not displaying so using show
      finsembleWindow.show({})

      console.log(res)

      const { appIntent, context, source, target }: { appIntent: AppIntent, context: Context, source: string, target: string } = res.data
      const { apps, intent } = appIntent
      setIntent(intent)
      setContext(context)
      setApps(apps)
      setSource(source)
      setTarget(target)

    });

  }, [])


  // Grab all Finsemble's open components and match them to the list of apps.
  // The list is of intentApps are Finsemble component types.
  const getOpenApps = async (apps: Array<AppMetadata>): Promise<AppComponent[]> => {
    try {
      const { err, data } = await LauncherClient.getActiveDescriptors()

      if (err) throw Error(err)

      const components = Object.values(data)
      // Get all the open components that match the apps list
      const openApps: Array<AppComponent> = components.filter(
        (component: FinsembleComponent) =>
          // if the component matches with an app of the same name return it
          apps.some(
            (app: AppMetadata): boolean => app.name === component.customData.component.type
          )
      ).map(
        (component: FinsembleComponent): AppComponent => [component.name, component.componentType, [component.url, component.customData?.foreign?.components?.Toolbar?.iconURL]]
      )

      return openApps

    } catch (err) {
      Logger.error(err)
      return err
    }
  }


  //
  getOpenApps(apps)
    .then((apps): { [key: string]: any[] } =>
      groupBy(apps, ([name, type]: [string, string]) => type)
    )


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
      <h2 className="resolver__action"><span className="resolver__action-source">{source}</span> would like to start a <span className="resolver__action-intent">{intent.displayName}</span>, open with...</h2>
      <div className="resolver__apps">

        {
          (await getOpenApps(apps)).map(
            ([name, type, icons]: AppComponent) => (
              <button key={name} onClick={() => fdc3.open(type, context)}>
                <img src={`${icons[0] || "./src/launch.svg"}`} />
                <p>{name}</p>
              </button>
            )
          )
        }

      </div>
    </div >
  )
}


