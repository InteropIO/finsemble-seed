## Exporting and Importing

### Data Format

The format for an exported workspace looks like this:

```javascript
{
	"name": "Workspace1",
	"windows": ["window1", "window2"],
	"groups": {},
	"workspaceDefinitionFlag": true,
	"windowData": [
		{
			... descriptor for window 1 ...
		},
		{
			... descriptor for window 2 ...
		}
	]
}
```

The `workspaceDefinitionFlag` tells the Workspace Service that this is a workspace. Alternately, setting
`templateDefinitionFlag` to `true` would tell Finsemble that this is a workspace template. Templates are currently not
supported.

### File Format

When workspaces are exported to a JSON file, the file is formatted in this manner:

```javascript
{
	"workspaceTemplates": {
		"Workspace1": {
			"name": "Workspace1",
			"windows": [],
			"groups": {},
			"workspaceDefinitionFlag": true,
			"windowData": []
		},
		"Workspace2": {
			"name": "Workspace2",
			"windows": [],
			"groups": {},
			"workspaceDefinitionFlag": true,
			"windowData": []
		}
	}
}
```
