import * as React from 'react'
// import { FinsembleDialog } from "@chartiq/finsemble-react-controls";
import "../intentResolverModal.css";
const { useState, useEffect } = React

export default function App() {

  const windowSpawnData = FSBL.Clients.WindowClient.getSpawnData()
  const { intents, context, appIntent, source }: { intents: string, context: Context, appIntent: AppIntent, source: any } = windowSpawnData
  const { apps, intent } = appIntent

  console.log(windowSpawnData)


  return (
    <div className="resolver__container">
      <img className="resolver__header" src="./fdc3-intent-header.svg" />
      <h2 className="resolver__action"><span className="resolver__action-source">{source}</span> would like to start a <span className="resolver__action-intent">{intent.displayName.toLowerCase()}</span>, open with...</h2>
      <div className="resolver__apps">

        {
          apps.map(app => (
            <button key={app.name} onClick={() => FSBL.Clients.LauncherClient.spawn(app.name, { data: { context } })}>
              <img src={`${app.icons[0] || "./src/launch.svg"}`} />
              <p>{app.name}</p>
            </button>))
        }
      </div>
    </div >
  )
}


