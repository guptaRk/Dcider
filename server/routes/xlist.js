const express = require('express');
const router = express();
const auth = require('../middlewares/auth');
const validateCreateListData = require('../validation/createList');
const { XList } = require('../models/XList');

/*
  @route    POST api/xlist/create
  @descrp   login a user and send the jwt
  @access   protected
*/
router.post('/create', auth, (req, res) => {
  let { error } = validateCreateListData(req.body);
  if (error) return res.status(400).json(error);

  error = {};
  XList.find({ name: req.body.name, creator: req.body.creator })
    .then(result => {
      if (result.length !== 0)
        return res.status(400)
          .json({ "name": "XList of same name already exists" });

      const xlist = new XList({
        members: req.body.members,
        creator: req.body.creator,
        name: req.body.name,
        email: req.user.email
      });

      xlist.save()
        .then(result => {
          return res.send(result);
        })
        .catch(err => {
          res.status(500).send(err);
        });
    })
    .catch(err => {
      res.status(500).send(err);
    })
});

/*
  @route    GET /api/xlist/me
  @descrp   get all the Xlist created by me
  @access   protected
*/
router.get('/me', auth, (req, res) => {
  XList
    .find({ creator: 'me' })
    .select(['name', 'members'])

    .then(xlists => {
      let data = [];
      for (let i of xlists) {
        // build the current XList to contains
        // only the first few members and it's name
        let cur = {
          name: i.name,
          members: []
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
  XList
    .find({ creator: 'room' })
    .select(['name', 'members'])

    .then(xlists => {
      let data = [];
      for (let i of xlists) {
        // build the current XList to contains
        // only the first few members and it's name
        let cur = {
          name: i.name,
          members: []
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
  @route    GET /api/xlist/me/:name
  @descrp   get the Xlist specified XList
  @access   protected
*/
router.get('/me/:name', auth, (req, res) => {
  XList.find({ name: req.params.name, creator: "me" })
    .then(xlist => {
      if (xlist.length === 0)
        return res.status(400)
          .json({ "name": `XList: "${req.params.name}" doesn't exists` });

      return res.json({
        members: xlist[0].members,
        name: xlist[0].name
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
  XList.find({ name: req.params.name, creator: "room" })
    .then(xlist => {
      if (xlist.length === 0)
        return res.status(400)
          .json({ "name": `XList: "${req.params.name}" doesn't exists` });

      return res.json({
        members: xlist[0].members,
        name: xlist[0].name
      });
    })
    .catch(err => {
      res.status(500).send(err);
    })
});

/*
  @route    DELETE /api/xlist/me/:name
  @descrp   delete the given named Xlist (if created by user)
  @access   protected
*/
router.delete('/me/:name', auth, (req, res) => {
  XList.find({ name: req.params.name, creator: "me" })
    .then(xlist => {
      if (xlist.length === 0)
        return res.status(400)
          .json({ "name": `XList: "${req.params.name}" doesn't exist` });

      XList.findOneAndDelete({ name: req.params.name })
        .then(result => {
          res.json({ "result": "successfully deleted" });
        })
        .catch(err => {
          res.status(500).send(err);
        });
    })
    .catch(err => {
      res.status(500).send(err);
    });
});

module.exports = router;