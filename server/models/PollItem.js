const mongoose = require('mongoose');

function validateObject(mssg, regex) {
  return {
    validator: (name) => {
      const reg = new RegExp(regex);
      return reg.test(name);
    },
    message: mssg
  };
}

const pollItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    validate: validateObject(
      "name field is alphanumeric(may contains underscore'_') and must starts with an alphabet",
      "^([a-zA-Z])([a-zA-Z_0-9]){2,249}$"
    )
  },

  items: {
    type: [{
      key: {
        type: String,
        required: true,
        maxlength: 250,
        trim: true,
        validate: validateObject(
          "key must be alpha numeric(may contains whitespaces or '_' in between) and must start with an alphabet",
          /^([a-zA-Z]([a-zA-Z_0-9 ]){0,249})$/
        )
      },
      value: {
        type: String,
        required: true,
        maxlength: 250,
        validate: validateObject(
          "value must be alpha numeric(may contains whitespaces or '_' in between) and must start with an alphabet",
          /^([a-zA-Z]([a-zA-Z_0-9 ]){0,249})$/
        ),
        trim: true
      }
    }]
  },

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  },

  owner: {
    type: String,
    trim: true,
    required: true,
    validate: validateObject(
      "Email is not valid",
      /^([a-zA-Z_0-9]){1,150}@([a-z]){1,50}\.[a-z]{2,10}$/
    )
  }
});

module.exports.PollItem = mongoose.model('pollItem', pollItemSchema);