## WindowTitleBar

### Overview
The window title bar is a component that's injected into every window. It provides quite a bit of functionality out of the box, and is easy to extend. Without any modifications, this title bar allows the user to move, close, minimize, and maximize the window. If the component that the window title bar is inside of can link to other components, we provide a button to launch the linker window. If the component can share data using our `DataTransferClient`, we provide a button that, when dragged from window to window, sends data as well. It is a very specialized component, and doesn't use any of our standard React controls.

### What it looks like
![](./screenshot.png)
