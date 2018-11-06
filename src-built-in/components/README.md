#  Sample Presentation Components

Components are the basic building blocks of the Finsemble application. A component is a piece of HTML5/JavaScript that provides some functionality. Each instance of a component is housed within a Finsemble window, which is a container sitting on top of OpenFin's secure operating layer.

In software development, design principles separate the business logic (the structural element) and the presentation logic (the visual element) of content. This principle can be used to think about Finsemble components as well. Components that deal with raw data and real-world business rules can be called business components. Components that provide chat functionality or deal with charting libraries are examples of business components. By the same token, presentation components are built to provide common UI functionality to end users. A drop-down menu or dialog box would be considered a presentation component. However, all components have the same basic definition and are built using the Finsemble Library's client APIs. It's worth remembering that features like the toolbar or dropdown menus are just HTML5 windows operating with desktop application-like functionality.

* Note that you can easily modify the look and feel of your sample components. In **Version >= 1.4**, simply edit the files inside of *src/assets/sass/*. These files contain all of the styling for these system components. In some cases, the individual components have specific styling, and those files are found inside each component's folder.

* For **Version < 1.4&**, go to *configs/openfin/manifest-local* and add the following line inside the `finsemble` property:
`"cssOverridePath":"$applicationRoot/assets/css/finsemble-overrides.css",`. This tells the application to retrieve the *finsemble-overrides* file that you will modify. In older versions of the seed project, this file sits inside of *src/assets/css/finsemble-overrides.scss*. 

Information about the presentation components can be found in our [documentation](https://documentation.chartiq.com/finsemble/tutorial-understandingUIComponents.html). 
