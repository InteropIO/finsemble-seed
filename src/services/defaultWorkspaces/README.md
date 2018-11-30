# Using the Default Workspace Example

## Files to update or add
- *configs/application/services.json*
- *src/services/defaultWorkspaces/defaultWorkspaces.html*
- *src/services/defaultWorkspaces/defaultWorkspacesService.js*
- *configs/application/workspaceTemplates.json* (optional see [Adding Workspace Templates](#adding-workspace-templates))

## Installing default workspace service

Copy the *​defaultWorkspaces.html* and ​*defaultWorkspaceService.js* into *src/services/defaultWorkspaces*.
  
Then insert the following definition into ​*configs/application/services.json*:
​
``` JSON
{
    "services": {
        "defaultWorkspacesService": {
            "useWindow": true,
            "active": true,
            "name": "defaultWorkspacesService",
            "visible": false,
            "html": "$applicationRoot/services/defaultWorkspaces/defaultWorkspaces.html"
        }
    }
}
```
**NOTE:** You will also need to ensure that *defaultWorkspaceService.js* is added to your build. Our default build system in the seed project ensures that service files are built automatically (without need a specific entry point to be identified). See *build/webpack/webpack.services.js* for details. 
 
## Adding workspace templates
Workspace templates can be added two ways:
1. Statically by adding them to *configs/application/workspaceTemplates.json*
2. Dynamically by specifying `finsemble.workspaceTemplates` using [`processAndSet`](https://documentation.chartiq.com/finsemble/ConfigClient.html#processAndSet) at authentication

Examples workspace templates have been included in *src/services/workspaceTemplates.testing.json*, and they can be copied to *config/application/workspaceTemplates.json* (statically included) for testing.
 
**NOTE:** Workspaces can be created by exporting from Finsemble. Exporting will result in a file that contains: 

``` json
    "workspaceTemplates": { 
        "workspaceName": ​{ 
            .... 
        }
    } 
```
**NOTE:** Workspace templates.json can insert multiple workspaces using the following format: 
 
``` json
    "workspaceTemplates": { 
        "workspaceName1": ​{
            ....
        },
        "workspaceName2": ​{
            ....
        }
    }
```