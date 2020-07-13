[![Finsemble Logo](https://documentation.chartiq.com/finsemble/styles/img/Finsemble_Logo_Dark.svg)](https://documentation.chartiq.com/finsemble/)

# Submitting POST data with a component
Some existing urser interface implementations require tht POST data is submitted to a URL in order to load specific UI components. This is not currently possible with pure configuration, however its easy to create an example that uses preload to read data from Finsemble's spawn data, create a hidden form with the data and then submit it.

This example loads a temporary page with a hidden form that is used to submit the post data [here](https://github.com/ChartIQ/finsemble-seed/blob/ca5ebd6cd0d8b43e150eeae26eb6b8e0fc749379/src/components/postExample/postExample.html#L11-L13)

The POST data and target URL can be set in the component config's spawn data, e.g. [here](https://github.com/ChartIQ/finsemble-seed/blob/ca5ebd6cd0d8b43e150eeae26eb6b8e0fc749379/src/components/postExample/config.json#L19-L23)

The spawn data is automatically read, added to the form and then the form submitted and the target URL loaded into the component [here](https://github.com/ChartIQ/finsemble-seed/blob/ca5ebd6cd0d8b43e150eeae26eb6b8e0fc749379/src/components/postExample/postExample.js#L27-L49)

Note that you can add multiple component configurations to the config file that use the same HTML and preload to create different components. For example, we've added an extra one that displays the form (as it has no spawnData) for manual testing.