const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const othersXlistSchema = new mongoose.Schema({
  owner: {
    type: String,
    validate: {
      validator: function (email) {
        const regex = /^([a-zA-Z_0-9]){1,150}@([a-z]){1,50}\.[a-z]{2,10}$/;
        return regex.test(email);
      },
      message: "Email is not valid"
    },
    required: true
  },
  lastUpdated: {
    type: Date,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  xlist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'xlist'
  }
});

const myXlistSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  xlist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'xlist'
  }
})

const userSchema = new mongoose.Schema({
  email: {
    type: String,

    /* Note that we could have used normal 'match' but then we have
     no control on the error message to be displayed on failure 

     Don't ignore '^' and '$' in the regex otherwise it will jsut text for substring*/
    validate: {
      validator: function (email) {
        const regex = /^([a-zA-Z_0-9]){1,150}@([a-z]){1,50}\.[a-z]{2,10}$/;
        return regex.test(email);
      },
      message: "Email is not valid"
    },
    required: true
  },

  password: {
    type: String,
    minlength: 5,
    maxlength: 235,
    required: true
  },

  name: {
    type: String,
    minlength: 3,
    maxlength: 250,
    validate: {
      validator: function (name) {
        const regex = /^([a-zA-Z])([a-zA-Z ]){2,249}$/;
        return regex.test(name);
      },
      message: "Enter a valid name"
    },
    required: true
  },

  othersXlist: {
    type: [othersXlistSchema]
  },
  myXlist: {
    type: [myXlistSchema]
  }

  /*
  poll: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Poll',
    creator: {
      type: String,
      required: true,
      enum: ['me', 'others']
    }
  }]*/

});

userSchema.methods.getToken = function () {
  const payload = {
    name: this.name,
    email: this.email,
    _id: this._id
  };
  const token = jwt.sign({
    data: payload,
    exp: Math.floor(Date.now() / 1000) + (60 * 60)    // 1hr of expiry
  }, 'jwtPrivateKey');

  return token;
}

const User = mongoose.model('user', userSchema);

module.exports.User = User;