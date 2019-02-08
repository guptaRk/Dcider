const Joi = require('joi');

module.exports = function validatePollItemData(data) {
  const schema = {
    "name": Joi.string().required().max(250)
      .match(/^([a-zA-Z])([a-zA-Z_0-9]){2,249}$/),
    "items": Joi.array().required().items(Joi.object({
      "key": Joi.string().required().match(/^([a-zA-Z]([a-zA-Z_0-9 ]){0,249})$/),
      "value": Joi.string().required().match(/^([a-zA-Z]([a-zA-Z_0-9 ]){0,249})$/)
    }))
  };

  let error = {};
  const result = Joi.validate(data, schema);
  if (result.error)
    for (let i of result.error.details) {
      error[i.path[0]] = i.message;
    }
  else error = null;

  return { ...result, error };
}