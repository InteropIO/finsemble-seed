# Stack Requirements

## Always On Top

When a window joins a stack (or creates a new stack with another window), if any of the windows in the stack are
alwaysOnTop, then all of the windows become alwaysOnTop.

When a window leaves a stack, it should return its state prior to joining the stack.

When the alwaysOnTop state of any window in a stack is toggled, every other window in the stack is also toggled.

## Auto Arrange

When auto arrange is called, the "grid" of windows is compiled using the StackedWindow. The process loops through the
windows on a workspace and filters out any children (as they should not be added to the grid because their StackedWindow
will be auto arranged instead).

This means that if a stack is created _after_ auto arrange takes place on a monitor. The DockingCalculator's
representation of cached locations needs to be updated. The child is removed from the cache, and the stacked window is
put in its place. If a stack is destroyed while auto arrange status is true, the same takes place in reverse. The
StackedWindow in the cache is replaced with the remaining window of the stack.

Tabbing/Untabbing windows is the only stack action that does not destroy auto arrange status.
