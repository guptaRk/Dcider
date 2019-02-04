const Joi = require('joi');

module.exports = function (user) {
  const schema = {
    email: Joi.string().min(5).max(200).email().required(),
    password: Joi.string().min(5).max(35).required()
  };
  const result = Joi.validate(user, schema);

  let error = {};
  if (result.error) {
    for (let i of result.error.details) {
      //console.log(i);
      error[i.path[0]] = i.message;
    }
  }
  else error = null;
  return { ...result, error };
}