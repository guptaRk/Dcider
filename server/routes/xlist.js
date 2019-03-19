import express from 'express';
import auth from '../middlewares/auth';
import validateEmail, {
  name as validateName,
  userid as validateUId
} from '../validation/index';
import XList from '../models/XList';
import User from '../models/User';
import Room from '../models/Room';

const router = express.Router();

/*
  @route    POST api/xlist/create
  @descrp   create a XList 
  @access   protected
  @bodyparm   members(Array of email-id), name(name of the xlist)
*/
const createXlistCallback = (req, res) => {
  // validate the request body parameters
  if (!req.body.name || !validateName(req.body.name))
    return res.status(400).json({
      name:
        "name is required and must starts with a letter and can contains only alphanumeric characters or an underscore '_'"
    });

  let validMemberList = true;

  if (req.body.members) {
    if (!(req.body.members instanceof Array)) validMemberList = false;
    else {
      for (let i = 0; i < req.body.members.length; i += 1)
        if (!validateEmail(req.body.members[i])) validMemberList = false;
    }
  } else validMemberList = false;

  if (!validMemberList)
    return res.status(400).json({ error: 'email-list of members is required' });

  const xlistPromise = XList.find({
    owner: req.user.uid,
    name: req.body.name
  });
  const membersPromise = User.find({ email: { $in: req.body.members } });

  Promise.all([xlistPromise, membersPromise])
    .then(([xlist, members]) => {
      // if there is already an xlist with same name
      if (xlist.length) {
        res.status(400).json({ name: 'XList of same name already exists' });
        /*
         * To avoid promise nesting at the end
         * we are returning a promise at the end.
         * so, to *differentiate we return null here
         */
        return null;
      }

      // if there is an invalid member in the member list
      // TODO: add an option to filter the member list
      // and send the request via email to join
      if (members.length !== req.body.members.length) {
        res
          .status(400)
          .json({ members: 'All the members are not registered users' });
        return null;
      }

      // if owner is not present in the list then add him
      if (!req.body.members.includes(req.user.email))
        req.body.members.push(req.user.email);

      const newXlist = new XList({
        name: req.body.name,
        owner: req.user.uid,
        lastUpdated: Date.now(),
        members: req.body.members
      });
      return newXlist.save();
    })
    .then(result => {
      // If the resonse is already sent to the client
      if (!result) return 0;
      return res.send(result);
    })
    .catch(err => res.status(500).send(err));
  return 0;
};

router.post('/create', auth, createXlistCallback);

/*
  @route      POST /api/xlist/others/clone/:name
  @descrp     clone the specified Xlist into user's own Xlist
  @access     protected
  @bodyparm   name of the Xlist(name), owner's uid(owner)
*/
router.post('/others/clone/:room', auth, (req, res) => {
  // check whether a correct name is provided in the request body or not
  if (!req.body.name || !validateName(req.body.name))
    return res.status(400).json({ name: 'Provide a proper name to the Xlist' });

  // check whether a valid user_id is sent in the request body
  if (!req.body.owner || !validateUId(req.body.owner))
    return res.status(400).json({ owner: 'Invalid user' });

  // check whether format of the room provided in the params is correct or not
  if (!validateName(req.params.room))
    return res.status(400).json({ room: 'Invalid room name' });

  const xlistPromise = XList.find({
    owner: req.user.uid,
    name: req.params.name
  });
  const validMemberOfTheRoomPromise = Room.find({
    uid: req.body.owner,
    name: req.params.room,
    xlist: req.user.uid
  });

  Promise.all([validMemberOfTheRoomPromise, xlistPromise])
    .then(([room, xlist]) => {
      // check for collision with the alredy present lists
      if (xlist.length)
        return res
          .status(400)
          .json({ name: 'xlist with same name already exist' });

      // check whether the room is valid or not OR
      // the user is a memeber of that room or not
      if (!room.length)
        return res
          .status(400)
          .json({ room: `not a valid room under user '${req.body.owner}'` });

      // build the request body to make it suitable
      // to forward the request to '/create'
      req.body = {
        name: req.body.name,
        members: room[0].xlist
      };
      return createXlistCallback(req, res);
    })
    .catch(err => {
      return res.status(500).send(err);
    });
  return 0;
});

/*
  @route    GET /api/xlist/me
  @descrp   get all the Xlist created by me
  @access   protected
*/
router.get('/me', auth, (req, res) => {
  XList.find({ owner: req.user.uid }, { _id: 0, owner: 0 })
    .then(xlists => {
      const lightWeightXlists = [];

      for (let i = 0; i < xlists.length; i += 1) {
        const xlist = xlists[i];
        const cur = {
          lastUpdated: xlist.lastUpdated,
          name: xlist.name,
          members: []
        };
        for (let j = 0; j < Math.min(3, xlist.members.length); j += 1)
          cur.members.push(xlist.members[j]);
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
      owner: { $ne: req.user.uid }
    },
    { _id: 0 }
  )
    .then(rooms => {
      const returnedXlist = [];

      for (let j = 0; j < rooms.length; j += 1) {
        const room = rooms[j];
        const cur = {
          lastUpdated: room.lastUpdated,
          name: room.name,
          owner: room.owner,
          members: []
        };
        for (let i = 0; i < Math.min(3, room.xlist.length); i += 1)
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
  XList.find(
    { name: req.params.name, owner: req.user.uid },
    { _id: 0, owner: 0 }
  )
    .then(xlist => {
      if (xlist.length === 0)
        return res
          .status(400)
          .json({ name: `XList: "${req.params.name}" doesn't exists` });

      return res.send(xlist[0]);
    })
    .catch(err => {
      res.status(500).send(err);
    });
});

/*
  @route    GET /api/xlist/others/:owner/:room
  @descrp   get the Xlist specified XList
  @access   protected
*/
router.get('/others/:owner/:room', auth, (req, res) => {
  // check whether the pattern of the name is correct or not (avoid querying db)
  if (!validateName(req.params.room))
    return res.status(400).json({ name: 'Invalid room name' });

  // check the owner's email address format befor db query
  if (!req.params.owner || !validateUId(req.params.owner))
    return res.status(400).json({ owner: 'Invalid email' });

  Room.find(
    {
      name: req.params.room,
      xlist: req.user.email,
      owner: req.params.owner
    },
    { _id: 0, xlist: 1, lastUpdated: 1, name: 1, owner: 1 }
  )
    .then(rooms => {
      if (rooms.length === 0)
        return res
          .status(400)
          .json({ name: `Room: "${req.params.room}" doesn't exists` });

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
    });
  return 0;
});

/*
  @route    POST /api/xlist/me/:name/edit-name/:newName
  @descrp   rename the xlist
  @access   protected
*/
router.post('/me/:name/edit-name/:newName', auth, (req, res) => {
  // validate the newName and name format before db query
  if (!validateName(req.params.name))
    return res.status(400).json({ name: 'Invalid xlist name' });

  if (!validateName(req.params.newName))
    return res.status(400).json({ name: 'Invalid xlist name' });

  XList.find({
    owner: req.user.uid,
    name: { $in: [req.params.name, req.params.newName] }
  })
    .then(xlists => {
      if (!xlists.length) {
        res.status(400).json({ name: 'No such Xlist exists' });
        return null;
      }

      for (let i = 0; i < xlists.length; i += 1) {
        const xlist = xlists[i];
        if (xlist.name === req.params.newName) {
          res
            .status(400)
            .json({ name: 'Xlist with same name already exists!' });
          return null;
        }
      }

      return XList.findByIdAndUpdate(xlists[0]._id, {
        $set: { name: req.params.newName }
      });
    })
    .then(result => {
      // check if the request is already handled
      if (!result) return 0;
      return res.json(result);
    })
    .catch(err => {
      return res.status(500).send(err);
    });
  return 0;
});

/*
  @route      POST /api/xlist/me/:name
  @descrp     add the given member to Xlist
  @access     protected
  @bodyparm   requested user's email(email)
*/
router.post('/me/:name', auth, (req, res) => {
  // validate the requested email to add
  if (!validateEmail(req.body.email))
    return res.status(400).json({ email: 'given email is not valid' });

  // check whether the pattern of the name is correct or not (avoid querying db)
  if (!validateName(req.params.name))
    return res.status(400).json({ name: 'Invalid xlist name' });

  // find the XList with given name
  const xlistPromise = XList.find({
    owner: req.user.uid,
    name: req.params.name
  });
  const validUserPromise = User.find({ email: req.body.email });

  Promise.all([validUserPromise, xlistPromise])
    .then(([user, result]) => {
      // check whether the given use is registered or not
      if (!user.length)
        return res.status(400).json({ email: 'user not registered' });

      if (result.length === 0) {
        // XList with given name doesn't exist
        res.status(400).json({ name: "XList doesn't exists" });
        return null;
      }
      // XLst with given name exist
      const xlist = result[0];
      // check if the member is already added in this list
      if (xlist.members.includes(req.body.email)) {
        res.status(400).json({ email: 'user already a member in this list' });
        return null;
      }

      xlist.members.push(req.body.email);
      xlist.lastUpdated = Date.now();

      return XList.findOneAndUpdate(
        {
          owner: req.user.uid,
          name: req.params.name
        },
        {
          $set: { lastUpdated: Date.now() },
          $push: { members: req.body.email }
        },
        { new: true }
      );
    })
    .then(result => {
      // If the response is already sent to the client
      if (!result) return 0;
      return res.send(result);
    })
    .catch(err => {
      res.status(500).send(err);
    });
  return 0;
});

/*
  @route      POST /api/xlist/me/remove/:name/
  @descrp     delete the given email from the current XList
  @access     protected
  @bodyparm   requested user's email(email)
*/
router.post('/me/remove/:name', auth, (req, res) => {
  // validate the params and body parameters values
  if (!validateEmail(req.body.email))
    return res.status(400).json({ email: 'given email is not valid' });

  if (!validateName(req.params.name))
    return res.status(400).json({ name: 'given name is not valid' });

  // check whether it's an attempt to delete the owner itself
  if (req.body.email === req.user.email)
    return res.status(400).json({ email: "The owner can't be deleted" });

  // find the current XList
  XList.find({
    owner: req.user.uid,
    name: req.params.name
  })
    .then(result => {
      if (result.length === 0) {
        res.status(400).json({ name: "XList doesn't exist" });
        return null;
      }

      const xlist = result[0];
      // check whether the specified email is in member list or not
      if (!xlist.members.includes(req.body.email)) {
        res.status(400).json({ email: 'user is not a memeber of this Xlist' });
        return null;
      }

      // filter out the requested member
      xlist.members = xlist.members.filter(email => email !== req.body.email);

      return XList.findOneAndUpdate(
        {
          owner: req.user.uid,
          name: req.params.name
        },
        {
          $set: { members: xlist.members, lastUpdated: Date.now() }
        },
        { new: true }
      );
    })
    .then(result => {
      if (!result) return;
      res.send(result);
    })
    .catch(err => {
      res.status(500).send(err);
    });
  return 0;
});

/*
  @route    DELETE /api/xlist/me/:name
  @descrp   delete the given named Xlist (if created by user)
  @access   protected
*/
router.delete('/me/:name', auth, (req, res) => {
  // check whether the pattern of the name is correct or not (avoid querying db)
  if (!validateName(req.params.name))
    return res.status(400).json({ name: 'Invalid xlist name' });

  XList.findOneAndRemove({ name: req.params.name, owner: req.user.uid })
    .then(xlist => {
      if (!xlist)
        return res
          .status(400)
          .json({ name: `XList: "${req.params.name}" doesn't exist` });

      return res.json({ result: 'successfully deleted!' });
    })
    .catch(err => {
      res.status(500).send(err);
    });
  return 0;
});

module.exports = router;
