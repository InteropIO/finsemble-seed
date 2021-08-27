This folder contains sample pages which demonstrate the use of the charting library.

=======================================================================================================
Please note that depending on your package, not all these sample templates will be fully functional for you. 
If you require the additional components necessary for one of these templates, please contact your account manager.
=======================================================================================================

The following ready-to-use files are provided:

- **sample-template-basic.html**:
   A basic implementation with a chart and some UI controls

- **sample-template-advanced.html**:
   A rich implementation with most of the advanced features enabled

- **sample-template-instant-chart.html**:
   An implementation showcasing how to load an entire advanced chart in a single web component.
 
- **sample-template-multi-charts.html**:
   An implementation of multiple charts each one having its own UI controls.

- **sample-template-chart-grid.html**:
   An implementation of multiple charts using a single set of UI controls (located in the **chart-grid** directory)

To use one of the above, copy it into the root directory of the library package.

There are also two additional folders in here:

- **partials**: 
   Contains 	
      _sample-template-advanced-context.html_, the HTML portion of the _sample-template-advanced.html_ file. 
      _sample-template-term-structure-context.html_, the HTML portion of the _sample-template-term-structure.html_ file.
      
   These files are useful for constructing your own application page using a bundling tool such as Webpack (see the Webpack example provided in this package).  
   You won't need them if you are creating your page from the sample pages included in the templates folder. 
		
- **chart-grid**: 
   Contains sample template Chart Grid which demonstrates the use of multiple synchronized charts in the same page.