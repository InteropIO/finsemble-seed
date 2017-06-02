# Add Your Web Component To Finsemble
* Create a folder under `src/components` and copy your component to this folder. `src/components/{YourFolderName}`


```
 "{YourComponentName}": {
        "window": {
            "url": "/components/{YourFolderName}/{YourHTMLFile},
            "frame": false,
            "resizable": true,
            "autoShow": true,
            "defaultTop": "center",
            "defaultLeft": "center",
            "defaultWidth": 800,
            "defaultHeight": 600
        },
        "component": {
            "type": "{YourComponentName}"
        },
        "foreign": {
            "services": {
                "workspaceService": {
                    "isArrangable": true
                }
            },
            "components": {
                "App Launcher": {
                    "launchableByUser": true //This puts the component in the toolbar menu
                },
                "Window Manager": {
                    "FSBLHeader": true,
                    "persistWindowState": true //Tells the window to save it's state
                },
               
            }
        }
    }
```

### If you have a component that needs to be built.

* Add 
    ```
        "components/{YourFolderName}/{TheJavascriptFileName}": "./src/components/{YourFolderName}/{your js/jsx file}"
    ```
    to `configs/componentsToBuild.json`
    
        `TheJavascriptFileName` should just be the name without extensions. This is the file that you'll reference inside of your html file.
    
    
* Run `npm run dev`

* Your component should now be under the toolbar menu.
