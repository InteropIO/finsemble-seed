



import * as React from 'react'

export default function Tester() {
  const FDC3: DesktopAgent = new FSBL.Clients.FDC3Client.getOrCreateDesktopAgent('global')

  FDC3.addIntentListener()
  return (
    <div>

    </div>
  )
}
