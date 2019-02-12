const mongoose = require('mongoose');

function validateObject(mssg, regex) {
  return {
    validator: function (name) {
      const reg = new RegExp(regex);
      return reg.test(name);
    },
    message: mssg
  };
}

const pollSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  },
  userName: {
    type: String,
    trim: true,
    required: true,
    validate: validateObject(
      "Must be a valid email", "^([a-zA-Z_0-9]){1,150}@([a-z]){1,50}\.[a-z]{2,10}$"
    )
  },
  lastUpdated: {
    type: Date,
    required: true,
    default: Date.now()
  },
  /*
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'room'
  },
  */
  //No need of other room details as we can query this with user Schema and get 
  //all neccessary details about room from there
  pollItemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'pollitem'
  },
  ordering: {
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
  }
});

module.exports.Poll = mongoose.model('poll', pollSchema);