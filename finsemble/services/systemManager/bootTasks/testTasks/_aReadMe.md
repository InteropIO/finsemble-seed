# Sample Config Code for Testing

```javascript
// to enable a set of BootEngine tests, copy this testTask config into the real boot-task config in config/core/config.json
// to enable an individual test, change autoStart to true.
{
	"bootTasks": {
		"forceErrorTestTask": {
			"***** To enable test, set autoStart to true": "",
			"bootParams": {
				"stage": "microkernel",
				"dependencies": [ "initializeRouterTask" ],
				"stopOnFailure": false,
				"autoStart": false
			}
		},
		"checkpointErrorTestTask": {
			"***** To enable test, set autoStart to true": "",
			"bootParams": {
				"stage": "preuser",
				"autoStart": false,
				"checkpoints" : {
					"checkpoint1" : {
					},
					"checkpoint2" : {
						"dependencies": ["checkpoint1"]
					},
					"checkpoint3" : {
						"dependencies": [ "checkpoint2" ]
					},
					"checkpoint4" : {
						"dependencies": [ "checkpoint3" ]
					},
					"checkpoint5" : {
						"dependencies": [ "checkpoint4" ]
					},
					"checkpoint6" : {
						"dependencies": [ "checkpoint4" ]
					},
					"checkpoint7" : {
						"dependencies": [ "checkpoint4" ]
					},
					"checkpoint8" : {
						"dependencies": [ "checkpoint4" ],
						"postStartupCompletion": true
					}
				}

			}
		},
		"checkpointCircularDependencyTestTask": {
			"***** To enable test, set autoStart to true": "",
			"bootParams": {
				"stage": "preuser",
				"autoStart": false,
				"checkpoints" : {
					"checkpoint1" : {
					},
					"checkpoint2" : {
						"dependencies": ["checkpoint1"]
					},
					"checkpoint3" : {
						"dependencies": [ "checkpoint8" ]
					},
					"checkpoint4" : {
						"dependencies": [ "checkpoint3" ]
					},
					"checkpoint5" : {
						"dependencies": [ "checkpoint4" ]
					},
					"checkpoint6" : {
						"dependencies": [ "checkpoint4" ]
					},
					"checkpoint7" : {
						"dependencies": [ "checkpoint4" ]
					},
					"checkpoint8" : {
						"dependencies": [ "checkpoint4" ]
					}
				}

			}
		},
		"checkpointBadDependencyTestTask": {
			"***** To enable test, set autoStart to true": "",
			"bootParams": {
				"stage": "preuser",
				"autoStart": false,
				"checkpoints" : {
					"checkpoint1" : {
					},
					"checkpoint2" : {
						"dependencies": ["checkpoint1"]
					},
					"checkpoint3" : {
						"dependencies": [ "checkpointABC", "checkpoint2" ]
					},
					"checkpoint4" : {
						"dependencies": [ "checkpoint3" ]
					},
					"checkpoint5" : {
						"dependencies": [ "checkpoint4" ]
					},
					"checkpoint6" : {
						"dependencies": [ "checkpoint4" ]
					},
					"checkpoint7" : {
						"dependencies": [ "checkpoint4" ]
					},
					"checkpoint8" : {
						"dependencies": [ "checkpoint4", "checkpoint4", "checkpointEFG" ]
					}
				}

			}
		}
	}
}
```
