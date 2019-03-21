import express from 'express';
import Room from '../models/Room';
import XList from '../models/XList';
import PollItem from '../models/PollItem';
import User from '../models/User';
import auth from '../middlewares/auth';

import validateEmail, {
  keyValue as validateKeyValue,
  userid as validateUId,
  name as validateName,
  description as validateDescription
} from '../validation/index';

const router = express.Router();

function getEmpty2DArray(rows, cols) {
  const arr = new Array(rows);
  for (let i = 0; i < rows; i += 1) {
    arr[i] = new Array(cols);
    for (let j = 0; j < cols; j += 1) arr[i][j] = 0;
  }
  return arr;
}

function get1DArray(n) {
  const arr = new Array(n);
  for (let i = 0; i < n; i += 1) arr[i] = i;
  return arr;
}

/*
  @route      POST api/room/create
  @descrp     create a room
  @access     private
  @bodyparm   room's name(name), a short description(description),
              pollItem's name(pollItem), xlist' name(xlist)
*/
router.post('/create', auth, (req, res) => {
  // verify the body parameters
  if (!req.body.name || !validateName(req.body.name))
    return res.status(400).json({
      name:
        "Room name must be alphanumeric and may contains underscore '_' also"
    });

  if (!req.body.description || !validateDescription(req.body.description))
    return res
      .status(400)
      .json({ description: 'description must be within 500 characters only' });

  if (!req.body.xlist || !validateName(req.body.xlist))
    return res
      .status(400)
      .json({ xlist: 'X-List is required and must need to be exist' });

  if (!req.body.pollItem || !validateName(req.body.pollItem))
    return res
      .status(400)
      .json({ pollItem: 'poll-items are required and must need to be exists' });

  // --------body parameter checks completed -------------

  const xlistPromise = XList.findOne({
    owner: req.user.uid,
    name: req.body.xlist
  });
  const pollItemPromise = PollItem.findOne({
    owner: req.user.uid,
    name: req.body.pollItem
  });
  const roomNamePromise = Room.findOne({
    owner: req.user.uid,
    name: req.body.name
  });

  Promise.all([xlistPromise, pollItemPromise, roomNamePromise])
    .then(([xlist, pollItem, roomName]) => {
      if (!xlist) {
        res.status(400).json({ xlist: "mentioned xlist doesn't exist" });
        return null;
      }

      if (!pollItem) {
        res.status(400).json({ pollItem: 'mentioned poll-item is invalid' });
        return null;
      }

      if (roomName) {
        res.status(400).json({ name: 'a room with same name already exists' });
        return null;
      }

      const len = pollItem.keys.length;
      const room = new Room({
        name: req.body.name,
        description: req.body.description,
        owner: req.user.uid,
        pollItem: {
          keys: pollItem.keys.slice(),
          values: pollItem.values.slice()
        },
        status: 'active',
        xlist: xlist.members,
        cntKeys: getEmpty2DArray(len, len),
        cntValues: getEmpty2DArray(len, len),
        result: get1DArray(len),
        lastUpdated: Date.now()
      });

      return room.save();
    })
    .then(result => {
      // whether response is already sent to the client or not
      if (!result) return;
      res.send(result);
    })
    .catch(err => {
      return res.status(500).send(err);
    });
  return 0;
});

/*
  @route    GET api/room/my/all/:status
  @descrp   get all the rooms created by me with specified status
  @access   private
*/
router.get('/my/all/:status', auth, (req, res) => {
  if (req.params.status !== 'active' && req.params.status !== 'closed')
    return res.status(400).json({ status: 'Invalid status' });

  Room.find({ owner: req.user.uid, status: req.params.status })
    .then(rooms => {
      const filteredData = rooms.map(x => {
        return {
          name: x.name,
          description: x.description,
          usersPolled: x.polls.length,
          pollItemCount: x.pollItem.keys.length,
          membersCount: x.xlist.length,
          lastUpdated: x.lastUpdated
        };
      });
      return res.json(filteredData);
    })
    .catch(err => {
      return res.status(500).send(err);
    });
});

/*
  @route    GET api/room/others/all/:status
  @descrp   get all the rooms created by others with specified status
  @access   private
*/
router.get('/others/all/:status', auth, (req, res) => {
  if (req.params.status !== 'active' && req.params.status !== 'closed')
    return res.status(400).json({ status: 'Invalid status' });

  Room.find({
    xlist: req.user.email,
    status: req.params.status
  })
    .then(rooms => {
      const filteredData = rooms.filter(x => x.owner !== req.user.uid).map(x => {
        return {
          owner: x.owner,
          name: x.name,
          description: x.description,
          usersPolled: x.polls.length,
          pollItemCount: x.pollItem.keys.length,
          membersCount: x.xlist.length,
          lastUpdated: x.lastUpdated
        };
      });
      return res.json(filteredData);
    })
    .catch(err => {
      return res.status(500).send(err);
    });
});

/*
  @route    DELETE api/room/:name
  @descrp   delete the specified room
  @access   private
*/
router.delete('/:name', auth, (req, res) => {
  // check for the valid name
  if (!validateName(req.params.name))
    return res.status(400).json({ name: 'invalid room name' });

  Room.findOneAndRemove({ owner: req.user.uid, name: req.params.name })
    .then(room => {
      // check whether the given name is a valid
      // room name created by the user earlier
      if (!room) {
        res.status(400).send({ name: 'Invalid room' });
        return null;
      }

      res.send("deleted successfully!");
      return null;
    })
    .catch(err => {
      return res.status(500).send(err);
    });
});

/*
  @route    GET api/room/:type/:name
            type == 'my' if the room is my else user-id(uid)
  @descrp   get a mentioned room
  @access   private

*/
router.get('/:type/:name/', auth, (req, res) => {
  // check the emaroomil in the request body
  if (!validateUId(req.params.uid))
    return res.status(400).json({ uid: 'not a valid user-id' });

  const roomPromise =
    req.params.type === 'my'
      ? Room.find({ owner: req.user.uid, name: req.params.name })
      : Room.find({
        owner: req.params.type,
        xlist: req.user.email,
        name: req.params.name
      });

  roomPromise
    .then(room => {
      if (!room.length)
        return res.status(400).json({ room: "Room doesn't exists!" });

      const filteredPolls = room[0].polls.map(x => {
        return {
          givenBy: x.givenBy,
          lastUpdated: x.lastUpdated
        };
      });

      return res.json({
        owner: room[0].owner,
        members: room[0].xlist,
        name: room[0].name,
        description: room[0].description,
        pollItems: room[0].pollItem,
        status: room[0].status,
        usersPolled: filteredPolls,
        result: room[0].result,
        lastUpdated: room[0].lastUpdated
      });
    })
    .catch(err => {
      res.status(500).send(err);
    });
});

/*
  @route    POST api/room/my/:name/toggle
  @descrp   toggle the status of the specified room
  @access   private
*/
router.post('/my/:name/toggle', auth, (req, res) => {
  Room.findOne({ owner: req.user.uid, name: req.params.name })
    .then(room => {
      if (!room) {
        res.status(400).json({ room: "Room doesn't exists!" });
        return null;
      }

      const changedStatus = room.status === 'active' ? 'closed' : 'active';
      return Room.findByIdAndUpdate(room._id, {
        $set: { status: changedStatus, lastUpdated: Date.now() }
      });
    })
    .then(result => {
      // check if the result is already sent or not
      if (!result) return;
      res.json({ status: 'successfully updated' });
    })
    .catch(err => {
      res.status(500).send(err);
    });
});

/*
  @route      POST api/room/:action/member/:room
  @descrp     add(or remove) the specified email to this 
              access list in the room mentioned
  @access     private
  @bodyparm   email address of the new user(email)
*/
router.post('/:action/member/:room', auth, (req, res) => {
  if (req.params.action !== 'add' && req.params.action !== 'remove')
    return res.status(404).json({ url: 'Invalid URL' });

  if (!validateEmail(req.body.email))
    return res.status(400).json({ user: 'not a valid email' });

  // attempt to delete the owner itself
  if (req.body.email === req.user.email && req.params.action === 'remove') {
    return res.status(400).json({ user: "Couldn't delete the owner!" });
  }

  const userPromise = User.find({ email: req.body.email });
  const roomPromise = Room.find({
    owner: req.user.uid,
    name: req.params.room
  });

  Promise.all([roomPromise, userPromise])
    .then(([room, user]) => {
      if (!room.length) {
        res.status(400).json({ name: 'room name is invalid' });
        return null;
      }

      // TODO: invite them with email
      if (!user.length) {
        res.status(400).json({ user: 'given user is not registered' });
        return null;
      }

      if (req.params.action === 'add') {
        if (room[0].xlist.includes(req.body.email)) {
          res.status(400).json({ user: 'user already exist' });
          return null;
        }
        room[0].xlist.push(req.body.email);
      } else {
        // If there exist a user to remove or not
        if (!room[0].xlist.includes(req.body.email)) {
          res.status(400).json({ user: 'no user to delete' });
          return null;
        }

        room[0].xlist = room[0].xlist.filter(x => x !== req.body.email);
      }

      room[0].lastUpdated = Date.now();
      return Room.findByIdAndUpdate(
        room[0]._id,
        { $set: room[0] },
        { new: true }
      );
    })
    .then(result => {
      // whether the response is already sent above or not
      if (!result) return;
      res.send(result);
    })
    .catch(err => {
      return res.status(500).send(err);
    });
});

/*
  @route      POST api/room/:action/pollitem/:room
  @descrp     add(or remove) the specified pollitem in the room mentioned
  @access     private
  @bodyparm   key's name(key), value's name(value)
*/
router.post('/:action/pollitem/:room', auth, (req, res) => {
  if (req.params.action !== 'add' && req.params.action !== 'remove')
    return res.status(400).json({ action: 'Invalid action' });

  if (
    !req.body.key ||
    !validateKeyValue(req.body.key) ||
    !req.body.value ||
    !validateKeyValue(req.body.value)
  )
    return res.status(400).json({ pollitem: 'Invalid key-value pair' });

  Room.find({ owner: req.user.uid, name: req.params.room })
    .then(room => {
      if (!room.length) {
        res.status(400).json({ room: 'Invalid room' });
        return null;
      }

      const pollItems = room[0].pollItem;
      if (req.params.action === 'add') {
        // check whether it is already present in the list or not
        const keyMatch = pollItems.keys.filter(x => x === req.body.key);
        const valueMatch = pollItems.values.filter(x => x === req.body.value);

        if (keyMatch.length || valueMatch.length) {
          res.status(400).json({ pollitem: 'Invalid key-value pair' });
          return null;
        }

        room[0].pollItem.keys.push(req.body.key);
        room[0].pollItem.values.push(req.body.value);
      } else {
        // checks whether the specified key-value pair exists or not
        const keyIndex = pollItems.keys.findIndex(x => x === req.body.key);
        const valueIndex = pollItems.values.findIndex(
          x => x === req.body.value
        );
        if (keyIndex === -1 || valueIndex === -1) {
          res.status(400).json({ pollitem: 'Invalid key or value' });
          return null;
        }

        // remove the matched key-value pair
        room[0].pollItem.keys.splice(keyIndex, 1);
        room[0].pollItem.values.splice(valueIndex, 1);
      }

      // reset all the polls
      // TODO : push this info to the user notification inbox
      room[0].polls = [];

      // initialize an empty 2D array of (n*n) with 0
      const n = room[0].pollItem.keys.length;
      room[0].cntKeys = getEmpty2DArray(n, n);
      room[0].cntValues = getEmpty2DArray(n, n);
      room[0].result = get1DArray(n);

      room[0].lastUpdated = Date.now();
      // save the updated room
      return Room.findByIdAndUpdate(
        room[0]._id,
        { $set: room[0] },
        { new: true }
      );
    })
    .then(result => {
      // response is already sent to client?
      if (!result) return;
      // TO AVOID PROMISE NESTING we have returned a promise
      // from above and are using here
      res.send(result);
    })
    .catch(err => {
      return res.status(500).send(err);
    });
});

/*
  @route    POST api/room/:room/poll
  @descrp   add (or edit) a poll in the room mentioned
  @access   private
*/
// TODO: test this route
router.post('/:room/poll', auth, (req, res) => {
  if (!req.body.order)
    return res.status(400).json({ order: 'ordering is mandatory' });

  if (!validateUId(req.body.owner))
    return res.status(400).json({ owner: 'not a valid user-id' });

  Room.find({ owner: req.body.owner, name: req.params.room })
    .then(room => {
      if (!room.length) {
        res.status(400).json({ room: "requested room doesn't exists" });
        return null;
      }

      // if the room is not active then permission denied
      if (room[0].status !== 'active') {
        res.status(400).json({
          room: 'The requested room is not active now. Contact the owner'
        });
        return null;
      }
      // check whether the sent sequence is a
      // permutation of[0, room.pollitem.length)
      let seq = req.body.order.slice();
      const n = room[0].pollItem.keys.length;
      seq.sort();
      for (let i = 0; i < n; i += 1)
        if (seq.length !== n || i !== seq[i]) {
          res.status(400).json({ order: 'invalid ordering of pollItems' });
          return null;
        }

      // check whether the curent user is a member of the poll or not
      if (!room[0].xlist.includes(req.user.uid)) {
        res.status(400).json({ user: 'You are not a member of this room' });
        return null;
      }

      const poll = {
        givenBy: req.user.uid,
        lastUpdated: Date.now(),
        ordering: req.body.order
      };

      // check if the user have already polled and is updating the response
      const pollIndex = room[0].polls.findIndex(
        x => x.givenBy === req.user.uid
      );
      if (pollIndex !== -1) {
        // neutralize the effect
        seq = room[0].polls[pollIndex].ordering;
        for (let i = 0; i < seq.length; i += 1) {
          room[0].cntKeys[i][seq[i]] -= 1;
          room[0].cntValues[seq[i]][i] -= 1;
        }

        // remove this poll
        room[0].polls.splice(pollIndex, 1);
      }

      seq = req.body.order;
      // part of GALE-SHAPLEY ALGORITHM
      for (let i = 0; i < seq.length; i += 1) {
        room[0].cntKeys[i][seq[i]] += 1;
        room[0].cntValues[seq[i]][i] += 1;
      }

      room[0].lastUpdated = Date.now();
      // Insert the current poll
      room[0].polls.push(poll);
      return Room.findByIdAndUpdate(
        room[0]._id,
        { $set: room[0] },
        { new: true }
      );
    })
    .then(result => {
      // whether the response is already sent?
      if (!result) return;
      res.send(result);
    })
    .catch(err => {
      return res.status(500).send(err);
    });
});

/*
  @route    GET api/room/:room/result
  @descrp   compute and get the poll result
  @access   private
*/
router.get('/:room/result', auth, (req, res) => { });

export default router;
