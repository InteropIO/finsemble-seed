# Styling component scrollbars

In order to style the scrollbars displayed on a component, who's content overflows, styles must be applied to the `<HTML>` and/or `<BODY>` tags on the page.
This recipe allows you to do so via:

- preload
- CSS

## Preload

Under the `src\` you'll find a `ScrollbarStylerPreload` folder which contains a preload that styles your scrollbars. This is enabled by default in the component appd entry under `configs\application\appd.json`.

## CSS

If you simply want to use CSS you can remove the `preload` property under the component's appd entry.
Uncomment the commented lines in the index.html file.

```html
<!-- 

<link rel="stylesheet" type="text/css" href="../finsemble/assets/css/defaultTheme.css" />
<link rel="stylesheet" type="text/css" href="scrollbarStyling.css" />

-->
```
