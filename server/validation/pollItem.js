const Joi = require('joi');
const FormattedError = require('../common/ErrorFormat');

module.exports = function validatePollItemData(data) {
  const schema = {
    "name": Joi.string().required().max(250)
      .regex(/^([a-zA-Z])([a-zA-Z_0-9]){2,249}$/),
    "items": Joi.array().required().items(Joi.object({
      "key": Joi.string().required().regex(/^([a-zA-Z]([a-zA-Z_0-9 ]){0,249})$/),
      "value": Joi.string().required().regex(/^([a-zA-Z]([a-zA-Z_0-9 ]){0,249})$/)
    }))
  };

  const result = Joi.validate(data, schema);
  let error = FormattedError(result.error);

  return { ...result, error };
}