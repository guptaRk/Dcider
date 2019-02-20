const mongoose = require('mongoose');
const Joi = require('joi');

function validateObject(mssg, regex) {
  return {
    validator: (name) => {
      const reg = new RegExp(regex);
      return reg.test(name);
    },
    message: mssg
  };
}

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
    type: {
      keys: {
        type: [{
          type: String,
          required: true,
          maxlength: 250,
          trim: true,
          validate: validateObject(
            "key must be alpha numeric(may contains whitespaces or '_' in between) and must start with an alphabet",
            /^([a-zA-Z]([a-zA-Z_0-9 ]){0,249})$/
          )
        }]
      },

      values: {
        type: [{
          type: String,
          required: true,
          maxlength: 250,
          validate: validateObject(
            "value must be alpha numeric(may contains whitespaces or '_' in between) and must start with an alphabet",
            /^([a-zA-Z]([a-zA-Z_0-9 ]){0,249})$/
          ),
          trim: true
        }],
      }
    },

    validate: {
      validator: function (x) {
        return (x.keys.length === x.values.length);
      },
      message: "Number of keys and values must be equal"
    }
  },

  status: {
    type: String,
    required: true,
    enum: ['active', 'closed']
  },

  xlist: {
    type: [{
      type: String,
      required: true,
      validate: validateObject(
        "Email is not valid",
        "^([a-zA-Z_0-9]){1,150}@([a-z]){1,50}\.[a-z]{2,10}$"
      )
    }]
  },

  polls: {
    type: [{

      givenBy: {
        type: String,
        required: true,
        validate: validateObject(
          "Email is not valid",
          "^([a-zA-Z_0-9]){1,150}@([a-z]){1,50}\.[a-z]{2,10}$"
        )
      },

      lastUpdated: {
        type: Date,
        required: true,
        //default: Date.now()
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
  },

  // for the Gale Shapley algorithm
  cntKeys: {
    type: mongoose.Schema.Types.Mixed,
    validate: {
      validator: function (x) {
        if (!Array.isArray(x)) return false;

        const n = this.pollItem.keys.length;
        if (x.length !== n) return false;

        for (let i = 0; i < n; i++)
          if (!Array.isArray(x[i]) || x[i].length !== n) return false;
        return true;
      },
      message: "not a valid 2D array"
    }
  },
  cntValues: {
    type: mongoose.Schema.Types.Mixed,
    validate: {
      validator: function (x) {
        if (!Array.isArray(x)) return false;

        const n = this.pollItem.keys.length;
        if (x.length !== n) return false;

        for (let i = 0; i < n; i++)
          if (!Array.isArray(x[i]) || x[i].length !== n) return false;
        return true;
      },
      message: "not a valid 2D array"
    }
  },

  result: {
    type: [Number]
  }
});

module.exports.Room = mongoose.model('room', roomSchema);