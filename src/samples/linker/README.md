# Linker Window

## Overview
The Linker Window is our sample UI component that interfaces with the Linker Service. It is used to add or remove a Component from a group. The Linker is launched from the [Window Title Bar](../windowTitleBar/).

## How It Works
- The Window Title Bar calls LinkerClient.openLinkerWindow(), which sends a router query on the "Finsemble.LinkerWindow.Show" channel with the window's groups, windowIdentifier and windowBounds.
- The Linker Window then updates its display using that information and opens up at the proper position:
	```javascript
	finWindow.showAt(data.windowBounds.left, data.windowBounds.top + 20, function() {});
	```
- When the user clicks on the group color to update the window's groups, the Linker Window uses the LinkerClient API to update the groups and hides itself.

## What it looks like
![](./screenshot.png)


