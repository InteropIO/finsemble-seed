# webpack-glob-entries
A small function which allows you to pass glob to generate entries hash object

## Instalation

```
npm install --save-dev webpack-glob-entries
```

## Usage
```
var glob_entries = require('webpack-glob-entries')

module.exports = {
    entry: glob_entries('src/entries/**/*.js'),
    output: {
        filename: '[name].js'
    }
};
```

## Tests

  npm test

## Contributing

In lieu of a formal styleguide, take care to maintain the existing coding style.
Add unit tests for any new or changed functionality. Lint and test your code.

## Release History

* 1.0.0 Initial release