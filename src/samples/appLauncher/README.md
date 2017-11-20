## AppLauncher

### Overview
This is a menu that will launch components. The app launcher is a single window that is spawned by the toolbar in the background. By default, it is hidden. When the "Premium" button is clicked, the menu shows itself on the appropriate monitor; it will hide itself when the window loses focus.

The list of launchable apps is are pulled from *configs/componentList.json*. If `components['foreign']['App Launcher'].launchableByUser` is `true`, it will be included in the app launcher.



### What it looks like
![](./screenshot.png)

### Controls used
The controls used in this component are documented over in our Finsemble React Controls repo: 
* [FinsembleMenu](https://github.com/ChartIQ/finsemble-react-controls/tree/master/FinsembleMenu)
* [FinsembleMenuSection](https://github.com/ChartIQ/finsemble-react-controls/tree/master/FinsembleMenuSection)
* [FinsembleMenuSectionLabel](https://github.com/ChartIQ/finsemble-react-controls/tree/master/FinsembleMenuSectionLabel)
* [FinsembleMenuItem](https://github.com/ChartIQ/finsemble-react-controls/tree/master/FinsembleMenuItem)
* [FinsembleMenuItemLabel](https://github.com/ChartIQ/finsemble-react-controls/tree/master/FinsembleMenuItemLabel)
* [FinsembleMenuItemActions](https://github.com/ChartIQ/finsemble-react-controls/tree/master/FinsembleMenuItemActions)
* [FinsembleMenuItemAction](https://github.com/ChartIQ/finsemble-react-controls/tree/master/FinsembleMenuItemAction)

