import * as React from 'react'
// import { FinsembleDialog } from "@chartiq/finsemble-react-controls";
import "../intentResolverModal.css";
import CloseIcon from './CloseIcon';
const { useState, useEffect } = React

interface IntentData {
  intents: string,
  context: Context,
  appIntent: AppIntent,
  source: any
}

export default function App() {

  const [intentData, setIntentData]: [IntentData, React.Dispatch<IntentData>] = useState(null)
  const [sendQueryResponse, setSendQueryResponse] = useState(null)



  useEffect(() => {

    FSBL.Clients.DialogManager.registerDialogCallback((err: any, res: any) => {
      console.log(res)
      const { data, sendQueryResponse, header } = res
      setIntentData(data)
      setSendQueryResponse(sendQueryResponse)
    });

  }, [])


  const actionIntent = (app: AppMetadata) => {
    FSBL.Clients.LauncherClient.spawn(app.name, { data: { context: intentData.context } },
      () => {
        console.log(sendQueryResponse)
        sendQueryResponse(null, {
          "IntentResolved": true
        })
      })

  }

  return (

    <div className="resolver__container">
      <img className="resolver__header" src="./src/fdc3-intent-header.svg" />
      <CloseIcon className="resolver__close" onClick={() => FSBL.Clients.WindowClient.close({ closeWindow: true, removeFromWorkspace: false })} />
      {intentData && (
        <>
          <h2 className="resolver__action"><span className="resolver__action-source">{intentData.source}</span> would like to start a <span className="resolver__action-intent">{intentData.appIntent.intent.displayName.toLowerCase()}</span>, open with...</h2>
          <div className="resolver__apps">

            {
              intentData.appIntent.apps.map((app: AppMetadata) => (
                <button key={app.name} onClick={() => actionIntent(app)}>
                  <img src={`${app.icons[0] || "./src/launch.svg"}`} />
                  <p>{app.name}</p>
                </button>))
            }
          </div>
        </>
      )}
    </div >
  )

}


