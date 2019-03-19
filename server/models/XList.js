import mongoose from 'mongoose';
import validateEmail, {
  name as validateName,
  userid as validateUId
} from '../validation/index';

const xlistSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    validate: {
      validator: validateName,
      message:
        'Xlist name must start with alphabet and contain only alpha-numeric characters and underscore(_)'
    }
  },
  // array of emails (emails of may contains unregistered users)
  // This scenario is handled at the run time i.e. at the
  // creation of a room using this XList
  members: {
    type: [
      {
        type: String,
        validate: {
          validator: validateEmail,
          message: 'Not a valid email'
        }
      }
    ],

    validate: {
      validator: members => {
        return members && members.length > 0;
      },
      message: 'Empty XList cannot be created'
    },
    required: true
  },

  // To map the list to a specific user
  owner: {
    type: String,
    required: true,
    validate: {
      validator: validateUId,
      message: 'User-id is not valid'
    }
  },

  lastUpdated: {
    type: Date,
    required: true,
    default: Date.now()
  }
});

export default mongoose.model('xlist', xlistSchema); 
