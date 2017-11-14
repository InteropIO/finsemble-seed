#  Finsemble Samples

This folder contains a set of templates to help you get started using Finsemble. 

Finsemble is a set of tools that lets you build multi-window desktop applications that focus on coordination and collaboration. We've packaged the seed project with template components to demonstrate the sort of desktop experience that you can deliver to your users. You can use these samples wholesale or use them as building blocks. 

These samples were built using React UI Controls. The primary use for the controls is for developers to assemble and customize the UI experience for their users. Using the controls, a developer can make anything&mdash;quickly. The controls are available in a separate public repo: https://github.com/ChartIQ/finsemble-react-controls. 

Note that you can easily modify the look and feel of your sample components. In **Version >= 1.4**, simply edit the files inside of *src/assets/sass/*. These files contain all of the styling for the sample components. In some cases, the individual components have specific styling, and those files are found inside each component's folder.

For **Version < 1.4&**, go to *configs/openfin/manifest-local* and add the following line inside the `finsemble` property: "cssOverridePath":"$applicationRoot/components/assets/css/finsemble-overrides.css",

This tells the application to retrieve the *finsemble-overrides* file  that you will modify. In older versions of the seed project, this file sits inside of *src/assets/css/finsemble-overrides.scss*. 

Although the sample templates and the controls are production quality, we keep them outside the core because most customers will customize the UI for their own needs. Read through the documentation to get a better idea how the sample templates are built. Browse each template for its relevant documentation. 
