const mongoose = require('mongoose');

const xlistSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    validate: {
      validator: function (name) {
        const regex = /^([a-zA-Z])([a-zA-Z_0-9]){0,255}$/;
        return regex.test(name);
      },
      message:
        "Xlist name must start with alphabet and contain only alpha-numeric characters and underscore(_)"
    }
  },
  // array of emails (emails of may contains unregistered users)
  // This scenario is handled at the run time i.e. at the
  // creation of a room using this XList
  members: {
    type: [{
      type: String,
      validate: {
        validator: function (email) {
          const regex = /^([a-zA-Z_0-9]){1,150}@([a-z]){1,50}\.[a-z]{2,10}$/;
          return regex.test(email);
        },
        message: "Not a valid email"
      }
    }],

    validate: {
      validator: function (members) {
        return (members && members.length > 0);
      },
      message: "Empty XList cannot be created"
    },
    required: true
  },

  // To map the list to a specific user
  owner: {
    type: String,
    required: true,
    validate: {
      validator: function (email) {
        const regex = /^([a-zA-Z_0-9]){1,150}@([a-z]){1,50}\.[a-z]{2,10}$/;
        return regex.test(email);
      },
      message: "Email is not valid"
    }
  },

  lastUpdated: {
    type: Date,
    required: true,
    default: Date.now()
  },

  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  }
});

const XList = mongoose.model('xlist', xlistSchema);

module.exports.XList = XList;