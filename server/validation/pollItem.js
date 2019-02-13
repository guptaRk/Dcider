const Joi = require('joi');
const FormattedError = require('../common/ErrorFormat');

module.exports = function validatePollItemData(data) {
  const schema = {
    "name": Joi.string().required().max(250)
      .regex(/^([a-zA-Z])([a-zA-Z_0-9]){2,249}$/),
    "keys": Joi.array().required().unique()
      .items(Joi.string().required().regex(/^([a-zA-Z]([a-zA-Z_0-9 ]){0,249})$/)),
    "values": Joi.array().required().unique()
      .items(Joi.string().required().regex(/^([a-zA-Z]([a-zA-Z_0-9 ]){0,249})$/)),
  };

  const result = Joi.validate(data, schema);
  let error = FormattedError(result.error);
  if (!error && data.keys.length !== data.values.length)
    error = { "key-value-pair": "must have same number of keys and values" };

  return { ...result, error };
}