const express = require('express');
const router = express();
const auth = require('../middlewares/auth');
const validateCreateListData = require('../validation/createList');
const { XList } = require('../models/XList');
const { User } = require('../models/User');

const Fawn = require('fawn');
/*
  @route    POST api/xlist/create
  @descrp   create a XList 
  @access   protected
*/
router.post('/create', auth, (req, res) => {
  let { error } = validateCreateListData(req.body);
  if (error) return res.status(400).json(error);

  error = {};
  XList.find({
    name: req.body.name,
    owner: req.user.email
  })
    .then(result => {
      if (result.length !== 0)
        return res.status(400)
          .json({ "name": "XList of same name already exists" });

      const xlist = new XList({
        members: req.body.members,
        name: req.body.name,
        owner: req.user.email,
        ownerId: req.user._id
      });

      // get the reference to user through user-id
      User.findById(req.user._id)
        .then(user => {
          // create a new transaction as in both places i.e.
          // in user db and Xlist db, created Xlist must be stored
          const task = Fawn.Task();
          task
            .update('users', { email: req.user.email }, {
              $push: {
                myXlist: { name: xlist.name, xlist: xlist._id }
              }
            })
            .save('xlists', xlist)

            .run()
            .then(result => {
              return res.send(result);
            })
            .catch(err => {
              return res.status(500).send(err);
            });
        })
        .catch(err => {
          return res.status(500).send(err);
        });
    })
    .catch(err => {
      return res.status(500).send(err);
    })
});

/*
  @route    GET /api/xlist/me
  @descrp   get all the Xlist created by me
  @access   protected
*/
router.get('/me', auth, (req, res) => {
  XList
    .find({ owner: req.user.email })
    .select(['name', 'members'])

    .then(xlists => {
      let data = [];
      for (let i of xlists) {
        // build the current XList to contains
        // only the first few members and it's name
        let cur = {
          name: i.name,
          members: [],
          lastUpdated: i.lastUpdated
        };

        for (let j = 0; j < 3 && j < i.members.length; j++)
          cur.members.push(i.members[j]);

        data.push(cur);
      }

      return res.json(data);
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
  User.find({ email: req.user.email }, { othersXlist: 1 })

    .then(result => {
      const xlists = result[0].othersXlist;
      let data = [];
      for (let i of xlists) {
        // build the current XList to contains
        // only the first few members and it's name
        let cur = {
          name: i.name,
          owner: i.owner,
          lastUpdated: i.lastUpdated
        };
        data.push(cur);
      }

      return res.json(data);
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
  XList.find({ name: req.params.name, owner: req.user.email })
    .then(xlist => {
      if (xlist.length === 0)
        return res.status(400)
          .json({ "name": `XList: "${req.params.name}" doesn't exists` });

      return res.json({
        members: xlist[0].members,
        name: xlist[0].name,
        lastUpdated: xlist[0].lastUpdated
      });
    })
    .catch(err => {
      res.status(500).send(err);
    })
});

/*
  @route    GET /api/xlist/others/:name
  @descrp   get the Xlist specified XList
  @access   protected
*/
router.get('/others/:name', auth, (req, res) => {
  if (!req.params.name)
    return res.status(400).json({ "name": "XList name is required" });

  User.find({
    email: req.user.email,
    "othersXlist.name": req.params.name
  })
    .populate("othersXlist.xlist")
    .then(result => {
      if (result.length === 0)
        return res.status(400)
          .json({ "name": `XList: "${req.params.name}" doesn't exists` });

      const xlist = result[0].xlists.xlist;
      return res.json({
        members: xlist.members,
        name: xlist.name,
        owner: xlist.owner,
        lastUpdated: xlist.lastUpdated
      });
    })
    .catch(err => {
      res.status(500).send(err);
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

  // find the XList with given name
  console.log(req.user.email);
  XList.find({
    owner: req.user.email,
    name: req.params.name
  }).then(result => {
    console.log(result);
    if (result.length === 0) {
      // XList with given name doesn't exist
      return res.status(400).json({ "name": "XList with given name doesn't exists" });
    }
    // XLst with given name exist
    const xlist = result[0];
    //check if the member is already added in this list
    if (xlist.members.includes(req.body.email))
      return res.status(400).json({ "email": "user already added in this list" });

    xlist.members.push(req.body.email);
    xlist.lastUpdated = Date.now();

    XList.findOneAndUpdate({
      owner: req.user.email,
      name: req.params.name
    }, { $set: xlist }, { new: true })
      .then(result => {
        return res.send(result);
      })
      .catch(err => {
        return res.status(500).send(err);
      })
  })
    .catch(err => {
      res.status(500).send(err);
    });
});

/*
  @route    DELETE /api/xlist/me/:name/:email
  @descrp   delete the given email from the current XList
  @access   protected
*/
router.delete('/me/:name/:email', auth, (req, res) => {
  // validate the parameters
  const regex_email = /^([a-zA-Z_0-9]){1,150}@([a-z]){1,50}\.[a-z]{2,10}$/;
  if (!regex_email.test(req.params.email))
    return res.status(400).json({ "email": "given email is not valid" });

  const regex_name = /^([a-zA-Z])([a-zA-Z_0-9]){0,255}$/;
  if (!regex_name.test(req.params.name))
    return res.status(400).json({ "name": "given name is not valid" });

  // check whether it's an attempt to delete the owner itself
  if (req.params.email === req.user.email)
    return res.status(400).json({ "email": "The owner can't be deleted" });

  //find the current XList
  XList.find({
    owner: req.user.email,
    name: req.params.name
  })
    .then(result => {
      if (result.length === 0)
        return res.status(400).json({ "name": "specified XList doesn't exist" });

      const xlist = result[0];
      //check whether the specified email is in member list or not
      if (!xlist.members.includes(req.params.email))
        return res.status(400).json({ "email": "specified user is not a memeber of this Xlist" });

      xlist.members = xlist.members.filter(email => email !== req.params.email);
      xlist.lastUpdated = Date.now();

      XList.findOneAndUpdate({
        owner: req.user.email,
        name: req.params.name
      }, { $set: xlist }, { new: true })
        .then(result => {
          return res.send(result);
        })
        .catch(err => {
          return res.status(500).send(err);
        })
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
  XList.find({ name: req.params.name, owner: req.user.email })
    .then(xlist => {
      if (xlist.length === 0)
        return res.status(400)
          .json({ "name": `XList: "${req.params.name}" doesn't exist` });

      //find the corresponding user and then update the info in it's list also
      User.find({ email: req.user.email }, { myXlist: 1 })
        .then(result => {
          console.log(result);
          //update the user's xlist array
          const updatedXlist = result[0].myXlist.filter(val => {
            // notice that toString() here is neccessary as the LHS and RHS
            // are JavaScript objects and objects are compared with references
            return val.xlist.toString() !== xlist[0]._id.toString();
          });
          console.log(updatedXlist);

          const task = Fawn.Task();
          task
            .remove('xlists', { _id: xlist[0]._id })
            .update('users', { email: req.user.email }, { $set: { myXlist: updatedXlist } })
            .run()
            .then(result => {
              return res.send(result);
            })
            .catch(err => {
              return res.status(500).send(err);
            })
        })
        .catch(err => {
          return res.status(500).send(err);
        });
    })
    .catch(err => {
      res.status(500).send(err);
    });
});

module.exports = router;