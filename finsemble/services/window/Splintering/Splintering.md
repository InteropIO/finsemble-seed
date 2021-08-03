# Splintering

There are three ways to handle resource management with Openfin.

1. You can group everything into one "Application" with N child-windows. This was the approach we took initially.
   - Pros of this approach:
     - You don't have to worry about the startup penalty involved with starting up a new openfin application. On good
       machines, it's a negligible cost. On bad machines, it's noticeable.
   - Cons of this approach:
     - Everything is inside of one render process. This means that every time a window fires off a JS function, it goes
       on to the same event loop. If you have a badly behaving component, it can lock up your entire application. If you
       have a resource-intensive component or service, it can also slow down performance.
     - It makes debugging difficult. Using the profiler is a useless exercise, as all of the javascript for every window
       is included in the same profile.
2. Every component/service can be in its own openfin application.
   - Pros of this approach:
     - Badly behaving/non-performant components don't ruin your application's experience.
     - Debugging is easier because everything is in its own render process.
   - Cons of this approach:
     - Can be resource-intensive on bad machines.
3. A hybrid approach. Intelligent grouping of components/services into separate openfin processes.
   - Pros of this approach:
     - Windows load quicker (with caveats). Subjective performance is improved.
     - Gives you the ability to isolate known hogs - or sensitive, mission-critical components (e.g., the toolbar,
       menus).
     - Uses fewer resources than #2 due to grouping.
   - Cons of this approach:
     - If grouping is done wrong, you can end up with a badly behaving component locking up sensitive components.

We've decided to advocate and optimize for option 3 - that's what the rest of this document will be about. See footnotes
1 and 2 if you prefer one of the other approaches.

In order to splinter off processes, you first need to create separate Openfin Applications. These applications need to
communicate back to the `LauncherService`, and they need to be quick enough to handle a large number of requests in a
short amount of time (e.g., workspace load).

Our approach involves 3 parts: the `SplinterAgentPool`, the `SplinterAgent`, and the `SplinterAgentSlave`.

The `SplinterAgentPool` receives all calls to `LauncherService.spawn` and routes them to the appropriate
`SplinterAgent`.

If no `SplinterAgent` is available that can spawn the requested component/service, the `SplinterAgentPool` creates a new
`SplinterAgent`. At the same time, it spawns off a new Openfin Application. The `SplinterAgent` manages this application
as its slave (the `SplinterAgentSlave`). Once the application is ready, the `SplinterAgent` registers with the
`SplinterAgentPool`, and can then begin accepting spawn requests. When the agent receives a request, it simply passes
the `windowDescriptor` to its slave.

The default behavior for a `SplinterAgent` is to have an unlimited capacity. If the dev-user specifies a
`maxWindowsPerAgent` in their config, the behavior changes slightly.

After each spawn, the `SplinterAgent` will check to see if it has reached its capacity. If so, it notifies the
`SplinterAgentPool` via an event that it cannot receive any more requests. Then, the `SplinterAgentPool` will pre-spawn
another `SplinterAgent` capable of handling the same requests<sup>3</sup>.

When a `SplinterAgent`'s last window is closed, it will send an event to the `SplinterAgentPool` notifying it that it is
empty. If it is the only Agent of its kind, it will stay available to the system. If there are others available, it will
close.

### Footnotes

1. Config for a single-process:

```
"finsemble":{
    "splinteringConfig":{
        "enabled": false
    }
}
```

2. Config for a 1-1 mapping of windows to applications.

```
"splinteringConfig": {
		"enabled": true,
		"splinterAgents": [
			{
				"agentLabel": "Toolbar",
				"components": [
					"Toolbar",
					"App Launcher",
					"Workspace Overflow Menu",
					"Workspace Management Menu",
					"Finsemble Linker Window",
					"Authentication",
					"dialogSignOn",
					"dialogTemplate",
					"dialogTest",
					"File Menu",
					"QuickComponentForm",
					"Process Monitor"
				],
                "maxWindowsPerAgent": 1
			},
			{
				"agentLabel": "advancedCharts",
				"components": [
					"Advanced Chart"
				],
				"maxWindowsPerAgent": 1
			},
			{
				"agentLabel": "Services",
				"services": [
					"windowService",
					"workspaceService"
				],
                "maxWindowsPerAgent": 1
			}
		]
	}
```

3. When an agent is spawned, it sets a timeout (default is 2 minutes). After that period if time, the Agent checks to
   see if it is being used. This is to prevent zombie Agents from clogging up a user's machine. It's easy to imagine
   this scenario: User spawns 3 advanced charts. 2nd Agent is spawned. User spawns no new charts, Agent still exists. In
   this case, we have an Agent who can _only_ spawn Advanced Charts just doing nothing. So we close it down. If the
   Agent has windows after 2 minutes, it stays up.
