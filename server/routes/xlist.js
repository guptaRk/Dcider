const express = require('express');
const router = express();
const auth = require('../middlewares/auth');
const validateCreateListData = require('../validation/createList');
const { XList } = require('../models/XList');
const { User } = require('../models/User');
const { Room } = require('../models/Room');

/*
  @route    POST api/xlist/create
  @descrp   create a XList 
  @access   protected
*/
const createXlistCallback = (req, res) => {
  let { error } = validateCreateListData(req.body);
  if (error) return res.status(400).json(error);

  const xlistPromise = XList.find({ owner: req.user.email, name: req.body.name });
  const membersPromise = User.find({ email: { $in: req.body.members } });

  Promise.all([
    xlistPromise,
    membersPromise
  ])
    .then(([xlist, members]) => {
      // if there is already an xlist with same name
      if (xlist.length) {
        res.status(400).json({ "name": "XList of same name already exists" });
        // To avoid promise nesting at the end we are returning a promise at the end. so, to differentiate we return null here
        return null;
      }

      // if there is an invalid member in the member list
      // TODO: add an option to filter the member list and send the request via email to join
      if (members.length !== req.body.members.length) {
        res.status(400).json({ "members": "All the members are not registered users" });
        return null;
      }

      // if owner is not present in the list then add him
      if (!req.body.members.includes(req.user.email))
        req.body.members.push(req.user.email);

      const newXlist = new XList({
        name: req.body.name,
        owner: req.user.email,
        lastUpdated: Date.now(),
        members: req.body.members
      });
      return newXlist.save();
    })
    .then(result => {
      // If the resonse is already sent to the client
      if (!result) return;
      return res.send(result);
    })
    .catch(err => res.status(500).send(err));
};

router.post('/create', auth, createXlistCallback);

/*
  @route    POST /api/xlist/others/clone/:name
  @descrp   clone the specified Xlist into user's own Xlist
  @access   protected
*/
router.post('/others/clone/:room', auth, (req, res) => {
  //check whether a correct name is provided in the request body or not
  const nameRegex = /^([a-zA-Z])([a-zA-Z_0-9]){0,255}$/;
  if (!req.body.name || !nameRegex.test(req.body.name))
    return res.status(400).json({ "name": "Provide a proper name to the Xlist" });

  // check whether a valid email is sent in the request body
  const emailRegex = /^([a-zA-Z_0-9]){1,150}@([a-z]){1,50}\.[a-z]{2,10}$/;
  if (!req.body.owner || !emailRegex.test(req.body.owner))
    return res.status(400).json({ "owner": "Invalid email" });

  //check whether format of the room provided in the params is correct or not
  if (!nameRegex.test(req.params.room))
    return res.status(400).json({ "room": "Invalid room name" });

  const xlistPromise = XList.find({ owner: req.user.email, name: req.params.name });
  const validMemberOfTheRoomPromise = Room.find({
    owner: req.body.owner,
    name: req.params.room,
    xlist: req.user.email
  });

  Promise.all([
    validMemberOfTheRoomPromise,
    xlistPromise
  ])
    .then(([room, xlist]) => {
      // check for collision with the alredy present lists
      if (xlist.length)
        return res.status(400).json({ "name": "xlist with same name already exist" });

      // check whether the room is valid or not OR the user is a memeber of that room or not
      if (!room.length)
        return res.status(400).json({ "room": `not a valid room under user '${req.body.owner}'` });

      // build the request body to make it suitable to forward the request to '/create'
      req.body = {
        name: req.body.name,
        members: room[0].xlist
      };
      return createXlistCallback(req, res);
    })
    .catch(err => {
      return res.status(500).send(err);
    });
});

/*
  @route    GET /api/xlist/me
  @descrp   get all the Xlist created by me
  @access   protected
*/
router.get('/me', auth, (req, res) => {
  XList.find({ owner: req.user.email }, { _id: 0, owner: 0 })
    .then(xlists => {
      const lightWeightXlists = [];

      for (let xlist of xlists) {
        let cur = {
          lastUpdated: xlist.lastUpdated,
          name: xlist.name,
          members: []
        };
        for (let i = 0; i < Math.min(3, xlist.members.length); i++)
          cur.members.push(xlist.members[i]);
        lightWeightXlists.push(cur);
      }

      return res.json(lightWeightXlists);
    })
    .catch(err => {
      res.status(500).send(err);
    });
});

/*
  @route    GET /api/xlist/others
  @descrp   get all the Xlist created due to rooms
  @access   protected
*/
router.get('/others', auth, (req, res) => {
  Room.find(
    {
      xlist: req.user.email,
      owner: { $ne: req.user.email }
    }, { _id: 0 })
    .then(rooms => {
      console.log(rooms);
      const returnedXlist = [];

      for (let room of rooms) {
        let cur = {
          lastUpdated: room.lastUpdated,
          name: room.name,
          owner: room.owner,
          members: []
        };
        for (let i = 0; i < Math.min(3, room.xlist.length); i++)
          cur.members.push(room.xlist[i]);
        returnedXlist.push(cur);
      }

      return res.json(returnedXlist);
    })
    .catch(err => {
      res.status(500).send(err);
    });
});

/*
  @route    GET /api/xlist/me/:name
  @descrp   get the Xlist specified XList
  @access   protected
*/
router.get('/me/:name', auth, (req, res) => {
  XList.find({ name: req.params.name, owner: req.user.email }, { _id: 0, owner: 0 })
    .then(xlist => {
      if (xlist.length === 0)
        return res.status(400).json({ "name": `XList: "${req.params.name}" doesn't exists` });

      return res.send(xlist[0]);
    })
    .catch(err => {
      res.status(500).send(err);
    })
});

/*
  @route    GET /api/xlist/others/:name/:owner
  @descrp   get the Xlist specified XList
  @access   protected
*/
router.get('/others/:room/:owner', auth, (req, res) => {
  // check whether the pattern of the name is correct or not (avoid querying db)
  const nameRegex = /^([a-zA-Z])([a-zA-Z_0-9]){0,255}$/;
  if (!nameRegex.test(req.params.room))
    return res.status(400).json({ "name": "Invalid room name" });

  // check the owner's email address format befor db query
  const emailRegex = /^([a-zA-Z_0-9]){1,150}@([a-z]){1,50}\.[a-z]{2,10}$/;
  if (!req.params.owner || !emailRegex.test(req.params.owner))
    return res.status(400).json({ "owner": "Invalid email" });

  Room.find(
    {
      name: req.params.room,
      xlist: req.user.email,
      owner: req.params.owner
    }, { _id: 0, xlist: 1, lastUpdated: 1, name: 1, owner: 1 })
    .then(rooms => {
      if (rooms.length === 0)
        return res.status(400).json({ "name": `Room: "${req.params.room}" doesn't exists` });

      // As there are multiple xlist with same name (as owners are different)
      return res.json({
        name: rooms[0].name,
        members: rooms[0].xlist,
        lastUpdated: rooms[0].lastUpdated,
        owner: rooms[0].owner
      });
    })
    .catch(err => {
      res.status(500).send(err);
    })
});

/*
  @route    POST /api/xlist/me/:name/edit-name/:newName
  @descrp   rename the xlist
  @access   protected
*/
router.post('/me/:name/edit-name/:newName', auth, (req, res) => {
  // validate the newName and name format before db query
  const nameRegex = /^([a-zA-Z])([a-zA-Z_0-9]){0,255}$/;
  if (!nameRegex.test(req.params.name))
    return res.status(400).json({ "name": "Invalid xlist name" });

  if (!nameRegex.test(req.params.newName))
    return res.status(400).json({ "name": "Invalid xlist name" });

  console.log(req.params.name);
  XList.find({
    owner: req.user.email,
    name: { $in: [req.params.name, req.params.newName] }
  })
    .then(xlists => {
      console.log(xlists);
      if (!xlists.length) {
        res.status(400).json({ "name": "No such Xlist exists" });
        return null;
      }

      for (let xlist of xlists)
        if (xlist.name === req.params.newName) {
          res.status(400).json({ "name": "Xlist with same name already exists!" });
          return null;
        }

      return XList.findByIdAndUpdate(xlists[0]._id, { $set: { name: req.params.newName } });
    })
    .then(result => {
      // check if the request is already handled
      if (!result) return;
      return res.json(result);
    })
    .catch(err => {
      return res.status(500).send(err);
    })
});

/*
  @route    POST /api/xlist/me/:name
  @descrp   add the given member to Xlist
  @access   protected
*/
router.post('/me/:name', auth, (req, res) => {
  // validate the requested email to add
  const regex = /^([a-zA-Z_0-9]){1,150}@([a-z]){1,50}\.[a-z]{2,10}$/;
  if (!regex.test(req.body.email))
    return res.status(400).json({ "email": "given email is not valid" });

  // check whether the pattern of the name is correct or not (avoid querying db)
  const nameRegex = /^([a-zA-Z])([a-zA-Z_0-9]){0,255}$/;
  if (!nameRegex.test(req.params.name))
    return res.status(400).json({ "name": "Invalid xlist name" });

  // find the XList with given name
  const xlistPromise = XList.find({ owner: req.user.email, name: req.params.name });
  const validUserPromise = User.find({ email: req.body.email });

  Promise.all([
    validUserPromise,
    xlistPromise
  ])
    .then(([user, result]) => {
      // check whether the given use is registered or not
      if (!user.length)
        return res.status(400).json({ "email": "user not registered" });

      if (result.length === 0) {
        // XList with given name doesn't exist
        res.status(400).json({ "name": "XList doesn't exists" });
        return null;
      }
      // XLst with given name exist
      const xlist = result[0];
      //check if the member is already added in this list
      if (xlist.members.includes(req.body.email)) {
        res.status(400).json({ "email": "user already a member in this list" });
        return null;
      }

      xlist.members.push(req.body.email);
      xlist.lastUpdated = Date.now();

      return XList.findOneAndUpdate(
        {
          owner: req.user.email,
          name: req.params.name
        }, {
          $set: { lastUpdated: Date.now() },
          $push: { members: req.body.email }
        }, { new: true });
    })
    .then(result => {
      // If the response is already sent to the client
      if (!result) return;
      return res.send(result);
    })
    .catch(err => {
      res.status(500).send(err);
    });
});

/*
  @route    POST /api/xlist/me/remove/:name/
  @descrp   delete the given email from the current XList
  @access   protected
*/
router.post('/me/remove/:name', auth, (req, res) => {
  // validate the params and body parameters values
  const regex_email = /^([a-zA-Z_0-9]){1,150}@([a-z]){1,50}\.[a-z]{2,10}$/;
  if (!regex_email.test(req.body.email))
    return res.status(400).json({ "email": "given email is not valid" });

  const regex_name = /^([a-zA-Z])([a-zA-Z_0-9]){0,255}$/;
  if (!regex_name.test(req.params.name))
    return res.status(400).json({ "name": "given name is not valid" });

  // check whether it's an attempt to delete the owner itself
  if (req.body.email === req.user.email)
    return res.status(400).json({ "email": "The owner can't be deleted" });

  //find the current XList
  XList.find({
    owner: req.user.email,
    name: req.params.name
  })
    .then(result => {
      if (result.length === 0) {
        res.status(400).json({ "name": "XList doesn't exist" });
        return null;
      }

      const xlist = result[0];
      //check whether the specified email is in member list or not
      if (!xlist.members.includes(req.body.email)) {
        res.status(400).json({ "email": "user is not a memeber of this Xlist" });
        return null;
      }

      // filter out the requested member
      xlist.members = xlist.members.filter(email => email !== req.body.email);

      return XList.findOneAndUpdate(
        {
          owner: req.user.email,
          name: req.params.name
        }, {
          $set: { members: xlist.members, lastUpdated: Date.now() }
        }, { new: true });
    })
    .then(result => {
      if (!result) return;
      res.send(result);
    })
    .catch(err => {
      res.status(500).send(err);
    })
})

/*
  @route    DELETE /api/xlist/me/:name
  @descrp   delete the given named Xlist (if created by user)
  @access   protected
*/
router.delete('/me/:name', auth, (req, res) => {
  // check whether the pattern of the name is correct or not (avoid querying db)
  const nameRegex = /^([a-zA-Z])([a-zA-Z_0-9]){0,255}$/;
  if (!nameRegex.test(req.params.name))
    return res.status(400).json({ "name": "Invalid xlist name" });

  XList.findOneAndRemove({ name: req.params.name, owner: req.user.email })
    .then(xlist => {
      if (!xlist)
        return res.status(400).json({ "name": `XList: "${req.params.name}" doesn't exist` });

      return res.json({ "result": "successfully deleted!" });
    })
    .catch(err => {
      res.status(500).send(err);
    });
});

module.exports = router;