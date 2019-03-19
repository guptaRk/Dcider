import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

import validateEmail, {
  name as validateName,
  userid as validateUId,
  userName as validateUserName
} from '../validation/index';

const othersXlistSchema = new mongoose.Schema({
  owner: {
    type: String,
    validate: {
      validator: validateEmail,
      message: 'Email is not valid'
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
});

const pollItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  itemCount: {
    type: Number,
    required: true,
    get: v => Math.round(v),
    set: v => Math.round(v)
  },
  pollItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'pollItem'
  }
});

const ownRoomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    validate: {
      validator: validateName,
      message:
        "name field is alphanumeric(may contains underscore'_') and must starts with an alphabet"
    }
  },
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'room'
  }
});

const otherRoomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    validate: {
      validator: validateName,
      message: "name field is alphanumeric(may contains underscore'_')"
    }
  },
  owner: {
    type: String,
    required: true,
    validate: {
      validator: validateEmail,
      message: 'Email is invalid'
    }
  },
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'room'
  }
});

const userSchema = new mongoose.Schema({
  email: {
    type: String,

    /*
     * Note that we could have used normal 'match' but then we have
     * no control on the error message to be displayed on failure
     *
     * Don't ignore '^' and '$' in the regex
     * otherwise it will jsut text for substring
     */
    validate: {
      validator: validateEmail,
      message: 'Email is not valid'
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
      validator: validateUserName,
      message: "name field is alphanumeric(may contains underscore'_')"
    },
    required: true
  },

  // TODO: need to use this everywhere
  uid: {
    type: String,
    required: true,
    validate: {
      validator: validateUId,
      message: "uid must be alphanumeric and can also contains underscore'_'"
    }
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
  }]
  */
});

userSchema.methods.getToken = function () {
  const payload = {
    name: this.name,
    email: this.email,
    uid: this.uid,
    _id: this._id
  };
  const token = jwt.sign(
    {
      data: payload,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 // 1hr of expiry
    },
    'jwtPrivateKey'
  );

  return token;
};

const User = mongoose.model('user', userSchema);

export default User;
export const pollItemSchemaForUser = pollItemSchema;
