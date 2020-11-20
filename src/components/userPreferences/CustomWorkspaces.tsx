import React, { ReactElement, useEffect, useState } from 'react'

interface Workspace {

  version: string,
  name: string,
  type: string,
  groups: any,
  windows: string[],
  guid: string

}

interface AuthenticatedUser {
  credentials: { username: string; };
  user: string;
}

// Main export
export default function CustomWorkspaces() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])

  useEffect(() => {

    FSBL.Clients.WorkspaceClient.getWorkspaces((err: any, response: Workspace[]) => {
      if (err) {
        console.error(err);
      } else {
        setWorkspaces(response)
      }

    })
  }, [])



  return (
    <div>
      <ImportFile />
      <ul>
        {workspaces.map(workspace => <li>
          {workspace.name}

          <ExportFileLink workspaceName={workspace.name} />
          <ShareWorkspace workspaceName={workspace.name} />
        </li>
        )}
      </ul>

    </div >
  )


}

// Import file section
const ImportFile = () => {
  const upload = (e: any, action: (workspaceJSONDefinition: any) => void) => {
    const file = e.target.files[0]

    let reader = new FileReader();
    reader.onload = function (evt) {
      action(evt.target.result);
    };
    reader.readAsText(file);
  }

  const finsembleImportWorkspace = (workspace: any) => {
    FSBL.Clients.WorkspaceClient.import({ force: true, workspaceJSONDefinition: JSON.parse(workspace) }, (err: any, response: any) => {
      // TODO: swap the console messages with end user UI
      if (err) {
        console.error(err)
      } else {
        console.log(response);
      }
    })
  }
  return <input type="file" id="fileElem" multiple accept=".json" className="" onChange={(event) => upload(event, finsembleImportWorkspace)} />
}

// Export File Section
const ExportFileLink = ({ workspaceName }: { workspaceName: string }): ReactElement => {
  const [downloadLink, setDownloadLink] = useState("")

  // change this to use URL encoding
  const blob: boolean = false;

  useEffect(() => {
    const generateDownload = async () => {
      try {
        const workspaceData = await FSBL.Clients.WorkspaceClient.export({ workspaceName }, console.log);

        const jsonString = JSON.stringify(workspaceData, null, 2)

        let downloadURL

        if (blob) {
          const newBlob = new Blob([jsonString], { type: 'application/json' });
          downloadURL = URL.createObjectURL(newBlob);
        } else {
          downloadURL = encodeURIComponent(jsonString)
        }

        setDownloadLink(downloadURL)
      } catch (error) {
        console.error(error);
        return <span>{error}</span>
      }
    }
    generateDownload()
  }, [workspaceName])

  return (
    <>{
      blob ? <a href={downloadLink} download={`${workspaceName}.json`} > <DownloadIcon /></a > : <a href={`data:text/json;charset=utf-8,${downloadLink}`
      } download={`${workspaceName}.json`
      } > <DownloadIcon /></a >
    }</>
  )
}

// Share workspaces section
const ShareWorkspace = ({ workspaceName }: { workspaceName: string }) => {
  // copy the code example to clipboard
  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content)
    // TODO: add a user feedback UI message
  }

  const generateShareLink = async () => {
    try {
      const workspaceData = await FSBL.Clients.WorkspaceClient.export({ workspaceName }, console.log);

      const workspace = JSON.stringify(workspaceData, null, 2)

      // generate string here or push to a REST API

      // use the storage client details in the protocol handler
      const protocolLink = storageClientDataAsLink(workspaceName)

      copyToClipboard(protocolLink)
    } catch (error) {
      console.error(error);
      return <span>{error}</span>
    }
  }

  return (
    <div>
      <ShareIcon onClick={generateShareLink} style={{ cursor: "pointer" }} />
      <div>
        {/*
        email
        mailto:example@gmail.com?subject=Important!&body=Hi.
         */}
        {/* link */}
      </div>
    </div>
  )
}

const getWorkspaceUUID = (workspace) => {
  function uploadWorkspace() {
    // upload your workspace to your server / datastore here
  }
  return
}

// Generate a URL to be processed by the Protocol Handler
const storageClientDataAsLink = (workspaceName: string) => {

  // 1) get the workspace name
  // 2) get the userName of the authenticated user
  // 3) generate a link to be used by the protocol handler i.e. fsbl://custom/shareworkspace/_USERNAME_/_WORKSPACE_

  // This is the workspace from indexedDB "Finsemble:Chris:finsemble.workspace:test"


  // get the user credentials to reference in the storage client
  let userName
  FSBL.Clients.AuthenticationClient.getCurrentCredentials((err, authenticatedUser: AuthenticatedUser) => userName = authenticatedUser.user)

  const protocolLink = `fsbl://custom/sharedworkspace/?username=${userName}&workspace=${workspaceName}`

  return protocolLink
}

/*
==== SVG Icons ====
 */

function DownloadIcon(props: JSX.IntrinsicAttributes & React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="#fff" width={18} height={18} {...props}>
      <path d="M0 0h24v24H0z" fill="none" />
      <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
    </svg>
  );
}



function ShareIcon(props: JSX.IntrinsicAttributes & React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="#fff" width={18} height={18} {...props}>
      <path d="M0 0h24v24H0z" fill="none" />
      <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z" />
    </svg>
  );
}


