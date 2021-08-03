# Group Requirements

## Always On Top

When a window joins a group (or creates a new group with another window), if any of the windows in the group are
alwaysOnTop, then all of the windows become alwaysOnTop.

When a window leaves a group, it should return its state prior to joining the group.

When the alwaysOnTop state of any window in a group is toggled, every other window in the group is also toggled.

## Auto Arrange

When a group is auto arranged, regardless of its shape, should be auto arranged in its current layout. This should
preserve any odd holes that exist in the docked group. The group should essentially act as a single window.

Like any other window in an auto arranged layout, if any movement takes place on the group (including minimization and
maximization) the auto arrange status of that monitor is nullified.
