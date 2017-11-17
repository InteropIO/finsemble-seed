#  Finsemble Samples

Finsemble is a set of tools that lets you build multi-window desktop applications that focus on coordination and collaboration. Components are the building blocks of a Finsemble application. A distinction can be made between presentation components, which are components created to provide common UI functionality (like dialogs and toolbars), and business components, which are components that manage real-life business objects (like chat and charts). This folder contains a set of **sample presentation components** to help you get started using Finsemble. You can use these samples wholesale or use them as templates for your own components. 

These sample performance components were built using React UI controls. Each control is a small element that you would see on the screen, such as a menu or a button. The primary use for the controls is for developers to assemble and customize the UI experience for their users. Using the controls, a developer can make their own components&mdash;quickly. The controls are available in a separate public repo: https://github.com/ChartIQ/finsemble-react-controls. 

Note that you can easily modify the look and feel of your sample components. In **Version >= 1.4**, simply edit the files inside of *src/assets/sass/*. These files contain all of the styling for these system components. In some cases, the individual components have specific styling, and those files are found inside each component's folder.

For **Version < 1.4&**, go to *configs/openfin/manifest-local* and add the following line inside the `finsemble` property:
"cssOverridePath":"$applicationRoot/components/assets/css/finsemble-overrides.css",

This tells the application to retrieve the *finsemble-overrides* file that you will modify. In older versions of the seed project, this file sits inside of *src/assets/css/finsemble-overrides.scss*. 

Although the sample performance components and the controls are production quality, we keep them outside the core because most customers will customize the UI for their own needs. Read through the documentation to get a better idea how these components are built. Browse each sample for its relevant documentation. 
