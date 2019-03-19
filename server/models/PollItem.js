import mongoose from 'mongoose';
import {
  name as validateName,
  keyValue as validateKeyValue,
  userid as validateUId
} from '../validation/index';

const pollItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    validate: {
      validator: validateName,
      message:
        "name field is alphanumeric(may contains underscore'_') and must starts with an alphabet"
    }
  },

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
  },

  owner: {
    type: String,
    trim: true,
    required: true,
    validate: {
      validator: validateUId,
      message: 'User-id is not valid'
    }
  },

  lastUpdated: {
    type: Date,
    required: true
  }
});

export default mongoose.model('pollItem', pollItemSchema);
