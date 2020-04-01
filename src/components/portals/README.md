### Portals and Finsemble

Portals in finsemble work just like they do in the browser. `window.open`, and voila. There are a couple of things that we can do in finsemble that are slightly different from how things work in a browser.

### Definitions
Child Window - The object returned by `window.open`.

FinsembleWindow - A low level API to the physical window that your finsemble component lives inside of. This API is currently private, but we're exposing it in this POC and may expose it properly in a future release.

### Operating on child windows
Child windows are is comparatively limited to the `finsembleWindow`. Consider the following code:

```javascript
const cw = window.open('about:blank');
cw.focus();
```

This does nothing. The focus method doesn't work in the browser. To get around this limitation, you will need to work with the `finsembleWindow`. How do you get the finsembleWindow?


```javascript
const childWindow = window.open(undefined, undefined, `width=${width},height=${height},top=${top},left=${left}`);

/**
 * finsembleWindow doesn't exist until FSBL is online. If the hide/show button
 * was clicked before that happened (small chance, but possible), these functions
 * would fail. We don't want that.
 *
 * Here, we return the finsembleWindow if it exists; otherwise, we wait.
 */
const getFinsembleWindowFromChild = () => {
  if (childWindow.finsembleWindow) return Promise.resolve(childWindow.finsembleWindow);
  return new Promise((resolve) => {
      childWindow.addEventListener("FSBLReady", () => {
          // because this code is gated behind the FSBLReady listener,
          // it won't run when your app is running in a browser without
          // finsemble.
          resolve(childWindow.finsembleWindow);
      });
  })
}

const childFinsembleWindow = await getFinsembleWindowFromChild();

```

### Focusing a child window

Focusing a child window is simple, provided you've followed the steps above.

```javascript
childFinsembleWindow.focus();
```

### Retrieving the bounds of a child window

Retrieving the bounds of a child window can be done in a couple of ways.

In the browser, you can access `childWindow.screenX` and `childWindow.screenY` (NOTE: These are childWindows, not childFinsembleWindows).

Because of a bug in Electron, these values are off due to scaling issues. Instead, you should use the `finsembleWindow`.

```javascript
  const { data: bounds } = await childFinsembleWindow.getBounds();
```

You may want this information to be updated whenever the window moves. In that case, you can do the following:

```javascript
  childFinsembleWindow.addEventListener("bounds-change-end", (evt) => {
    const { top, left, width, height }  = evt.data;
    // do something with bounds.
  });
```

### Persisting the position of your child windows
Our example uses [FSBL.Clients.WindowClient.setComponentState](https://documentation.chartiq.com/finsemble/WindowClient.html#setComponentState) and [FSBL.Clients.WindowClient.getComponentState](https://documentation.chartiq.com/finsemble/WindowClient.html#getComponentState).

When a childWindow moves, we call `setComponentState`; this makes it so that the position will be available to `getComponentState` when the window or workspace reloads. The way that we did this was by creating a `persistState` reducer. After the window moves, after a window is popped out, we persist the state. When the component loads, it retrieves that state. The code for that is below.

```javascript
 case 'persistState':
  nextState = Object.assign({}, state);
  const childWindows = nextState.childWindows;
  // can't persist childWindow; it's a reference to the object returned by window.open
  const safeState = Object.assign({}, nextState);
  delete safeState.childWindows;
  typeof FSBL !== "undefined" && FSBL.Clients.WindowClient.setComponentState({ field: 'store', value: safeState });
  nextState.childWindows = childWindows;
  return nextState;
```

### Detecting when a childWindow closes
This works just like it does in a browser.

```javascript
childWindow.addEventListener("beforeunload", () => {
  //do something
});
```