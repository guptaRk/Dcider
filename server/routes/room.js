const express = require('express');
const router = express.Router();
const { Room } = require('../models/Room');
const { XList } = require('../models/XList');
const { PollItem } = require('../models/PollItem');
const { User } = require('../models/User');
const validateCreateData = require('../validation/room');
const auth = require('../middlewares/auth');

function getEmpty2DArray(rows, cols) {
  let arr = new Array(rows);
  for (let i = 0; i < rows; i++) {
    arr[i] = new Array(cols);
    for (let j = 0; j < cols; j++)
      arr[i][j] = 0;
  }
  return arr;
}

function get1DArray(n) {
  let arr = new Array(n);
  for (let i = 0; i < n; i++)
    arr[i] = i;
  return arr;
}

/*
  @route    POST api/room/create
  @descrp   create a room
  @access   private
*/
router.post('/create', auth, (req, res) => {
  let { error } = validateCreateData(req.body);
  if (error) return res.status(400).json(error);

  const xlistPromise = XList.find({ owner: req.user.email, name: req.body.xlist });
  const pollItemPromise = PollItem.find({ owner: req.user.email, name: req.body.pollItem });
  const roomNamePromise = Room.find({ owner: req.user.name, name: req.body.name });

  Promise.all([
    xlistPromise,
    pollItemPromise,
    roomNamePromise
  ])
    .then(([xlist, pollItem, roomName]) => {
      if (!xlist.length) {
        res.status(400).json({ "xlist": "mentioned xlist doesn't exist" });
        return null;
      }

      if (!pollItem.length) {
        res.status(400).json({ "pollItem": "mentioned poll-item is invalid" });
        return null;
      }

      if (roomName.length) {
        res.status(400).json({ "name": "a room with same name already exists" });
        return null;
      }

      const len = pollItem[0].keys.length;
      const room = new Room({
        name: req.body.name,
        description: req.body.description,
        owner: req.user.email,
        pollItem: {
          keys: pollItem[0].keys,
          values: pollItem[0].values
        },
        status: "active",
        xlist: xlist[0].members,
        cntKeys: getEmpty2DArray(len, len),
        cntValues: getEmpty2DArray(len, len),
        result: get1DArray(len)
      });

      return Room.findByIdAndUpdate(room[0]._id, { $set: room[0] }, { new: true });
    })
    .then(result => {
      // whether response is already sent to the client or not
      if (!result) return;
      return res.send(result);
    })
    .catch(err => {
      return res.status(500).send(err);
    });
});

/*
  @route    GET api/room/my/:status
  @descrp   get all the rooms created by me with specified status
  @access   private
*/
router.get('/my/:status', auth, (req, res) => {
  if (req.params.status !== 'active' && req.params.status !== 'closed')
    return res.status(400).json({ "status": "Invalid status" });

  Room.find({ owner: req.user.email, status: req.params.status })
    .then(rooms => {
      const filteredData = rooms.filter(x => {
        return {
          name: x.name,
          description: x.description,
          usersPolled: x.polls.length,
          membersCount: x.xlist.length
        }
      });
      return res.json(filteredData);
    })
    .catch(err => {
      return res.status(500).send(err);
    })
});

/*
  @route    GET api/room/others/:status
  @descrp   get all the rooms created by others with specified status
  @access   private
*/
router.get('/others/:status', auth, (req, res) => {
  if (req.params.status !== 'active' && req.params.status !== 'closed')
    return res.status(400).json({ "status": "Invalid status" });

  Room.find({
    xlist: req.user.email,
    status: req.params.status
  })
    .then(rooms => {
      const filteredData = rooms.filter(x => {
        return {
          owner: x.owner,
          name: x.name,
          description: x.description,
          usersPolled: x.polls.length,
          membersCount: x.xlist.length
        }
      });
      return res.json(filteredData);
    })
    .catch(err => {
      return res.status(500).send(err);
    });
});

/*
  @route    DELETE api/room/remove/:name
  @descrp   delete the specified room
  @access   private
*/
router.delete('/remove/:name', auth, (req, res) => {
  // check for the valid name
  const nameRegex = /^([a-zA-Z])([a-zA-Z_0-9]){2,249}$/;
  if (!nameRegex.test(req.params.name))
    return res.status(400).json({ "name": "invalid room name" });

  Room.findOneAndRemove({ owner: req.user.email, name: req.params.name })
    .then(room => {
      //check whether the given name is a valid room name created by the user earlier
      if (!room.length) {
        res.status(400).send({ "name": "Invalid room" });
        return null;
      }

      res.send(room);
      return null;
    })
    .catch(err => {
      return res.status(500).send(err);
    })
});

/*
  @route    POST api/room/:action/member/:room
  @descrp   add(or remove) the specified email to this access list in the room mentioned
  @access   private
*/
router.post('/:action/member/:room', auth, (req, res) => {
  if (req.params.action !== 'add' && req.params.action !== 'remove')
    return res.status(404).json({ "url": "Invalid URL" });

  const emailRegex = /^([a-zA-Z_0-9]){1,150}@([a-z]){1,50}\.[a-z]{2,10}$/;
  if (!emailRegex.test(req.body.email))
    return res.status(400).json({ "email": "not a valid email" });

  const userPromise = User.find({ email: req.body.email });
  const roomPromise = Room.find({ owner: req.user.email, name: req.params.room });

  Promise.all([
    roomPromise,
    userPromise
  ])
    .then(([room, user]) => {
      if (!room.length) {
        res.status(400).json({ "name": "room name is invalid" });
        return null;
      }

      // TODO: invite them with email
      if (!user.length) {
        res.status(400).json({ "user": "given user is not registered" });
        return null;
      }

      if (req.params.action === 'add') {
        if (room[0].xlist.includes(req.body.email)) {
          res.status(400).json({ "email": "user already exist" });
          return null;
        }
        room[0].xlist.push(req.body.email);
      }
      else {
        // If there exist a user to remove or not
        if (!room[0].xlist.includes(req.body.email)) {
          res.status(400).json({ "email": "no user to delete" });
          return null;
        }

        room[0].xlist = room[0].xlist.filter(x => x !== req.body.email);
      }
      return Room.findByIdAndUpdate(room[0]._id, { $set: room[0] }, { new: true });
    })
    .then(result => {
      // whether the response is already sent above or not
      if (!result) return;
      return res.send(result);
    })
    .catch(err => {
      return res.status(500).send(err);
    });
});

/*
  @route    POST api/room/:action/pollitem/:room
  @descrp   add(or remove) the specified pollitem in the room mentioned
  @access   private
*/
router.post('/:action/pollitem/:room', auth, (req, res) => {
  if (req.params.action !== 'add' && req.params.action !== 'remove')
    return res.status(400).json({ "action": "Invalid action" });

  const keyValueRegex = /^([a-zA-Z]([a-zA-Z_0-9 ]){0,249})$/;
  if (!req.body.key || !keyValueRegex.test(req.body.key)
    || !req.body.value || !keyValueRegex.test(req.body.value))
    return res.status(400).json({ "pollitem": "Invalid key-value pair" });

  Room.find({ owner: req.user.email, name: req.params.room })
    .then(room => {
      if (!room.length) {
        res.status(400).json({ "room": "Invalid room" });
        return null;
      }

      let pollItems = room[0].pollItem;
      if (req.params.action === 'add') {
        // check whether it is already present in the list or not
        const keyMatch = pollItems.keys.filter(x => x === req.body.key);
        const valueMatch = pollItems.values.filter(x => x === req.body.value);

        if (keyMatch.length || valueMatch.length) {
          res.status(400).json({ "pollitem": "Invalid key-value pair" });
          return null;
        }

        room[0].pollItem.keys.push(req.body.key);
        room[0].pollItem.values.push(req.body.value);
      }
      else {
        //check whether the specified key-value pair exists or not
        const keyIndex = pollItems.keys.findIndex(x => x === req.body.key);
        const valueIndex = pollItems.values.findIndex(x => x === req.body.value);
        if (keyIndex === -1 || valueIndex === -1) {
          res.status(400).json({ "pollitem": "Invalid key or value" });
          return null;
        }

        // remove the matched key-value pair
        room[0].pollItem.keys.splice(keyIndex, 1);
        room[0].pollItem.values.splice(valueIndex, 1);
      }

      // reset all the polls
      //TODO : push this info to the user notification inbox
      room[0].polls = [];

      // initialize an empty 2D array of (n*n) with 0
      const n = room[0].pollItem.keys.length;
      room[0].cntKeys = getEmpty2DArray(n, n);
      room[0].cntValues = getEmpty2DArray(n, n);
      room[0].result = get1DArray(n);

      //save the updated room
      return Room.findByIdAndUpdate(room[0]._id, { $set: room[0] }, { new: true });
    })
    .then(result => {
      // response is already sent to client?
      if (!result) return;
      // TO AVOID PROMISE NESTING we have returned a promise from above and are using here
      return res.send(result);
    })
    .catch(err => {
      return res.status(500).send(err);
    })
});

/*
  @route    POST api/room/:room/poll
  @descrp   add (or edit) a poll in the room mentioned
  @access   private
*/
router.post('/:room/poll', auth, (req, res) => {
  if (!req.body.order)
    return res.status(400).json({ "order": "ordering is mandatory" });

  const emailRegex = /^([a-zA-Z_0-9]){1,150}@([a-z]){1,50}\.[a-z]{2,10}$/;
  if (!emailRegex.test(req.body.owner))
    return res.status(400).json({ "owner": "not a valid email" });

  Room.find({ owner: req.body.owner, name: req.params.room })
    .then(room => {
      if (!room.length) {
        res.status(400).json({ "room": "requested room doesn't exists" });
        return null;
      }

      // if the room is not active then permission denied
      if (room[0].status !== 'active') {
        res.status(400).json({ "room": "The requested room is not active now. Contact the owner" });
        return null;
      }
      // check whether the sent sequence is a permutation of [1, room.pollitem.length]
      let seq = req.body.order.slice();
      const n = room[0].pollItem.keys.length;
      seq.sort();
      for (let i = 0; i < n; i++)
        if (seq.length !== n || i !== seq[i]) {
          res.status(400).json({ "order": "invalid ordering of pollItems" });
          return null;
        }

      // check whether the curent user is a member of the poll or not
      if (!room[0].xlist.includes(req.user.email)) {
        res.status(400).json({ "user": "You are not a member of this room" });
        return null;
      }

      const poll = {
        givenBy: req.user.email,
        lastUpdated: Date.now(),
        ordering: req.body.order
      };

      //check if the user have already polled and is updating the response
      const pollIndex = room[0].polls.findIndex(x => x.givenBy === req.user.email);
      if (pollIndex !== -1) {
        // neutralize the effect
        seq = room[0].polls[pollIndex].ordering;
        for (let i = 0; i < seq.length; i++) {
          room[0].cntKeys[i][seq[i]]--;
          room[0].cntValues[seq[i]][i]--;
        }

        // remove this poll
        room[0].polls.splice(pollIndex, 1);
      }

      seq = req.body.order;
      // part of GALE-SHAPLEY ALGORITHM
      for (let i = 0; i < seq.length; i++) {
        room[0].cntKeys[i][seq[i]]++;
        room[0].cntValues[seq[i]][i]++;
      }

      // Insert the current poll
      room[0].polls.push(poll);
      return Room.findByIdAndUpdate(room[0]._id, { $set: room[0] }, { new: true });
    })
    .then(result => {
      // whether the response is already sent?
      if (!result) return;
      return res.send(result);
    })
    .catch(err => {
      return res.status(500).send(err);
    })
});

/*
  @route    GET api/room/:room/result
  @descrp   compute and get the poll result
  @access   private
*/
router.get('/:room/result', auth, (req, res) => {

});

module.exports = router;