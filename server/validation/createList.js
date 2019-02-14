const Joi = require('joi');
const FormattedError = require('../common/ErrorFormat');

module.exports = function (xlist) {
  const schema = {
    members: Joi.array().required().items(Joi.string().required().email()),
    name: Joi.string().required().regex(/^([a-zA-Z])([a-zA-Z_0-9]){0,255}$/)
  };

  const result = Joi.validate(xlist, schema);
  let error = FormattedError(result.error);

  return { ...result, error };
}