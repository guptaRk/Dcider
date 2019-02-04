const Joi = require('joi');

module.exports = function (user) {
  const schema = {
    email: Joi.string().min(5).max(200).email().required(),
    password: Joi.string().min(5).max(35).required(),
    name: Joi.string().min(3).max(250).regex(/([a-zA-Z])([a-zA-Z ]){2,249}/).required()
  };
  const result = Joi.validate(user, schema);

  let error = {};
  if (result.error) {
    //console.log(result.error);
    for (let i of result.error.details) {
      error[i.path[0]] = i.message;
    }
  } else error = null;
  return { ...result, error };
}