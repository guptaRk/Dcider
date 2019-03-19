import mongoose from 'mongoose';
import validateEmail, {
  name as validateName,
  userid as validateUId,
  keyValue as validateKeyValue
} from '../validation/index';

const roomSchema = new mongoose.Schema({
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

  description: {
    type: String,
    maxlength: 5000
  },

  owner: {
    type: String,
    required: true,
    validate: {
      validator: validateUId,
      message: 'User-id is not valid'
    }
  },

  pollItem: {
    type: {
      keys: {
        type: [
          {
            type: String,
            required: true,
            maxlength: 250,
            trim: true,
            validate: {
              validator: validateKeyValue,
              message:
                "key must be alpha numeric(may contains whitespaces or '_' in between) and must start with an alphabet"
            }
          }
        ]
      },

      values: {
        type: [
          {
            type: String,
            required: true,
            maxlength: 250,
            validate: {
              validator: validateKeyValue,
              message:
                "value must be alpha numeric(may contains whitespaces or '_' in between) and must start with an alphabet"
            },

            trim: true
          }
        ]
      }
    },

    validate: {
      validator: x => {
        return x.keys.length === x.values.length;
      },
      message: 'Number of keys and values must be equal'
    }
  },

  status: {
    type: String,
    required: true,
    enum: ['active', 'closed']
  },

  xlist: {
    type: [
      {
        type: String,
        required: true,
        validate: {
          validator: validateEmail,
          message: 'Email is not valid'
        }
      }
    ]
  },

  polls: {
    type: [
      {
        givenBy: {
          type: String,
          required: true,
          validate: {
            validator: validateUId,
            message: 'user-id is not valid'
          }
        },

        lastUpdated: {
          type: Date,
          required: true
          // default: Date.now()
        },

        ordering: {
          type: [Number],
          required: true,
          validate: {
            validator: arr => {
              return arr.length === this.pollItemCount;
            },
            message: 'Not a valid ordering of pollItems'
          }
        }
      }
    ]
  },

  // for the Gale Shapley algorithm
  cntKeys: {
    type: mongoose.Schema.Types.Mixed,
    validate: {
      validator: function (x) {
        if (!Array.isArray(x)) return false;

        const n = this.pollItem.keys.length;
        if (x.length !== n) return false;

        for (let i = 0; i < n; i += 1)
          if (!Array.isArray(x[i]) || x[i].length !== n) return false;
        return true;
      },
      message: 'not a valid 2D array'
    }
  },
  cntValues: {
    type: mongoose.Schema.Types.Mixed,
    validate: {
      validator: function (x) {
        if (!Array.isArray(x)) return false;

        const n = this.pollItem.keys.length;
        if (x.length !== n) return false;

        for (let i = 0; i < n; i += 1)
          if (!Array.isArray(x[i]) || x[i].length !== n) return false;
        return true;
      },
      message: 'not a valid 2D array'
    }
  },

  result: {
    type: [Number]
  }
});

export default mongoose.model('room', roomSchema);
