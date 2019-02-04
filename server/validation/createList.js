const Joi = require('joi');

module.exports = function (xlist) {
  const schema = {
    members: Joi.array().items(Joi.string().required().email()),
    creator: Joi.string().valid(['me', 'room']).required(),
    name: Joi.string().required().regex(/^([a-zA-Z])([a-zA-Z_0-9]){0,255}$/)
  };

  const result = Joi.validate(xlist, schema);
  let error = {};

  if (result.error) {
    for (let i of result.error.details) {
      error[i.path[0]] = i.message;
    }
  }
  else error = null;

  return { ...result, error };
}