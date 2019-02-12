const Joi = require('joi');
const formatError = require('../common/ErrorFormat');

module.exports = function (data) {
  const schema = {
    "name": Joi.string().required().max(250)
      .regex(/^([a-zA-Z])([a-zA-Z_0-9]){2,249}$/),

    "description": Joi.string().max(5000),
    "pollItem": Joi.string().required().max(250),
    "xlist": Joi.string().required().max(250)
  };

  const result = Joi.validate(data, schema);
  return { ...result, error: formatError(result.error) };
}