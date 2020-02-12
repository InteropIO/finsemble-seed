const componentSchema = require('./componentSchema.json');
const windowIdentifierSchema = require('./windowIdentifierSchema.json');
const windowOptionsSchema = require('./windowOptionsSchema.json');
const componentManifestComponentProp = require('./componentManifestComponentPropSchema.json');
const componentManifestWindowServiceConfigSchema = require('./windowServiceConfigSchema.json');
const foreignPropSchema = require('./componentManifestForeignPropSchema.json');

const Validator = require('jsonschema').Validator;
const validator = new Validator();

validator.addSchema(windowIdentifierSchema, '/WindowIdentifier');
validator.addSchema(windowOptionsSchema, '/WindowOptions');
validator.addSchema(componentManifestWindowServiceConfigSchema, '/WindowServiceConfig');
validator.addSchema(foreignPropSchema, '/ComponentManifestForeignProp');
validator.addSchema(componentManifestComponentProp, '/ComponentManifestComponentProp');

export default validator;
export { componentSchema };