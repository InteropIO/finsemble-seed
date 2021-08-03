# Window Behavior Requirements

## Always On Top

A window can be always on top of other windows by setting the alwaysOnTop option in the componentConfig for the window.
The user can be given the ability to toggle the always on top state by enabling finsemble.WindowManager.alwaysOnTopIcon
globally or on a per component basis using component.foreign.components.WindowManager.alwaysOnTopIcon in the component
config.

[Group Always On Top](Docking/GroupRequirements.md)

[Stack Always On Top](StackedWindowManager/StackRequirements.md)

## Auto arrange

Windows can be auto arranged in grids. All windows, regardless of type, should be auto arranged alongside all other
windows. This includes Native, WPF (native), and HTML5 windows. Auto arrange status should be preserved across multiple
monitors (until Finsemble shuts down or restarts). This includes the ability to move any UI components that trigger auto
arrange across monitors and get feedback on that monitors auto arranged status. Any kind of window interaction on an
auto arranged monitor will cancel the auto arrange status and remove any chance of 'restoring' to a previous state.
Exceptions to this are below.

[Group Auto Arrange](Docking/GroupRequirements.md)

[StackedWindow Auto Arrange](StackedWindowManager/StackRequirements.md)
