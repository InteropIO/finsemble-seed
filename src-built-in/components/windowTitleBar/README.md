## WindowTitleBar

### Overview

The windowTitleBar is a component that's injected into every component. It provides quite a bit of functionality out of the box, and is easy to extend. Without any modifications, this title bar allows the user to move, close, minimize, and maximize the window. If the component that the titleBar is inside of can link to other components, we provide a button to launch the linker window. If the component can share data using our `DragAndDropClient`, we provide a button that, when dragged from window to window, sends data as well. It is a very speciailized component, and doesn't use any of our standard react-controls.

### What it looks like

![](./screenshot.png)
