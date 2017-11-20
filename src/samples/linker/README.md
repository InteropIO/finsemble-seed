# Linker Window

## Overview
The linker window is our sample system component that interfaces with the Linker Service. It is used to add or remove a Finsemble component from a group. Check out [Linking Components](http://documentation.chartiq.com/finsemble/tutorial-linkingComponents.html) for more information. The linker window is launched from the [Window Title Bar](https://github.com/ChartIQ/finsemble-seed/tree/master/src/components/windowTitleBar). 

## How It Works
- The window title bar calls `LinkerClient.openLinkerWindow()` which sends a router query on the `Finsemble.LinkerWindow.Show` channel with the window's groups, windowIdentifier and windowBounds.
- The linker window then updates its display using that information and opens up at the proper position:
	```javascript
	finWindow.showAt(data.windowBounds.left, data.windowBounds.top + 20, function() {});
	```
- When the user clicks on the group color to update the window's groups, the linker window uses the LinkerClient API to update the groups and hides itself.

## What it looks like
![](./screenshot.png)


