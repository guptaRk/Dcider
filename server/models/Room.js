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
    type: string,
    required: true,
    trim: true,
    validate: validateObject(
      "name field is alphanumeric(may contains underscore'_') and must starts with an alphabet",
      "^([a-zA-Z])([a-zA-Z_0-9]){2,249}$"
    )
  },
  itemCount: {
    type: Number,
    required: true,
    get: x => Math.round(x),
    set: x => Math.round(x)
  },
  pollItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'pollitem'
  }
});

const roomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    validate: validateObject(
      "name field is alphanumeric(may contains underscore'_') and must starts with an alphabet",
      "^([a-zA-Z])([a-zA-Z_0-9]){2,249}$"
    )
  },

  description: {
    type: String,
    maxlength: 5000
  },

  owner: {
    type: String,
    required: true,
    validate: validateObject(
      "Email is not valid",
      "^([a-zA-Z_0-9]){1,150}@([a-z]){1,50}\.[a-z]{2,10}$"
    )
  },

  pollItem: {
    type: pollItemSchema
  },

  status: {
    type: String,
    required: true,
    enum: ['active', 'closed']
  },

  xlist: {
    type: {
      name: {
        type: string,
        required: true,
        trim: true,
        validate: validateObject(
          "name field is alphanumeric(may contains underscore'_') and must starts with an alphabet",
          "^([a-zA-Z])([a-zA-Z_0-9]){2,249}$"
        )
      },

      xlist: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'xlist'
      }
    }
  },

  polls: {
    type: [{

      email: {
        type: String,
        required: true,
        validate: validateObject(
          "Email is not valid",
          "^([a-zA-Z_0-9]){1,150}@([a-z]){1,50}\.[a-z]{2,10}$"
        )
      },

      ordering: {
        type: [Number],
        required: true,
        validate: {
          validator: function (arr) {
            return (arr.length === this.pollItemCount);
          },
          message: "Not a valid ordering of pollItems"
        }
      }

    }]
  }
});

module.exports.Room = mongoose.model('room', roomSchema);