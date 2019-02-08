const express = require('express');
const router = express.Router();
const validatePollItemData = require('../validation/pollItem');
const { PollItem } = require('../models/PollItem');
const { User, pollItemSchemaForUser } = require('../models/User');

const auth = require('../middlewares/auth');
const Fawn = require('fawn');

/*
  @route    POST api/pollItem/create
  @descrp   create a pollItem
  @access   protected
*/
router.post('/create', auth, (req, res) => {
  let { error } = validatePollItemData(req.body);
  if (error) return res.status(400).json(error);

  //check whether the user have a pollItem with same name
  PollItem.find({ owner: req.user.email, name: req.body.name })
    .then(result => {
      if (result.length !== 0)
        return res.status(400).json({ "name": "pollItem with same name already exists" });

      const pollItem = new PollItem({
        owner: req.user.email,
        userId: req.user._id,
        name: req.body.name,
        items: req.body.items
      });
      const pollItemForUser = new pollItemSchemaForUser({
        name: req.body.name,
        itemCount: req.body.items.length,
        pollItem: pollItem._id
      });

      const task = Fawn.Task();
      task
        .save('pollItems', pollItem)
        .update('users', { email: req.user.email }, {
          $push: { "pollItems": pollItemForUser }
        })
        .run()
        .then(result => {
          return res.send(result);
        })
        .catch(err => {
          return res.status(500).json(err);
        })
    })
    .catch(err => {
      return res.status(500).send(err);
    });
});

/*
  @route    GET api/pollItem/all
  @descrp   returns a list of all the pollItem
  @access   protected
*/
router.get('/all', auth, (req, res) => {
  User.find({ email: req.user.email }, { pollItem: 1 })
    .then(result => {
      if (result.length === 0)
        return res.status(400).json({ "user": "user doesn't exists" });

      const pollItems = result[0].pollItems;
      return res.json(pollItems);
    })
    .catch(err => {
      return res.status(500).send(err);
    });
});

/*
  @route    GET api/pollItem/:name
  @descrp   return the pollItem specified
  @access   protected
*/
router.get('/:name', auth, (req, res) => {
  PollItem.find({ owner: req.user.email, name: req.params.name })
    .then(result => {
      // If there is no pollItem with that name
      if (result.length === 0)
        return res.status(400).json({ "name": `pollItem ${req.params.name} doesn't exists` });

      return res.json({
        name: result[0].name,
        items: result[0].items
      });
    })
    .catch(err => {
      return res.status(500).send(err);
    })
});

module.exports = router;