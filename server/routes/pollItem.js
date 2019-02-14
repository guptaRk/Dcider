const express = require('express');
const router = express.Router();
const validatePollItemData = require('../validation/pollItem');
const { PollItem } = require('../models/PollItem');

const auth = require('../middlewares/auth');
const FormatValidationError = require('../common/ValidationErrorFormat');

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
      if (result.length !== 0) {
        res.status(400).json({ "name": "pollItem with same name already exists" });
        return null;
      }

      const pollItem = new PollItem({
        owner: req.user.email,
        name: req.body.name,
        //name: "0abcd",
        keys: req.body.keys,
        values: req.body.values,
        lastUpdated: Date.now()
      });

      /*
        CAUTION: the name of the collection 'pollitems' must be the same as when
        we use "pollItem.save()". So, we can't use 'pollItem' as collection name

        Another Caution: Validation of schema takes place only at time of saving
        i.e. if we use 'pollItem.save()' then only the PollItemSchema is going to 
        run otherwise not!!

      pollItem.validate(err => {
        if (err) return res.status(400).json(FormatValidationError(err));
      });
      */

      return pollItem.save();
    })
    .then(result => {
      // check if the response is already sent to the client
      if (!result) return;

      // result of the saved instance of the new pollItem
      return res.send(result);
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
  PollItem.find({ owner: req.user.email }, { _id: 0 })
    .then(pollItems => {
      return res.send(pollItems);
    })
    .catch(err => {
      return res.status(500).send(err);
    });
});

/*
  @route    GET api/pollItem/get/:name
  @descrp   return the pollItem specified
  @access   protected
*/
router.get('/get/:name', auth, (req, res) => {
  PollItem.find({ owner: req.user.email, name: req.params.name }, { _id: 0 })
    .then(result => {
      // If there is no pollItem with that name
      if (result.length === 0)
        return res.status(400).json({ "name": `poll-item '${req.params.name}' doesn't exist` });

      return res.send(result[0]);
    })
    .catch(err => {
      return res.status(500).send(err);
    });
});

/*
  @route    DELETE api/pollItem/remove/:name
  @descrp   delete the pollItem specified
  @access   protected
*/
router.delete('/remove/:name', auth, (req, res) => {
  PollItem.findOneAndDelete({ owner: req.user.email, name: req.params.name })
    .then(result => {
      if (!result)
        return res.status(400).json({ "name": "Room doesn't exist" });

      return res.json({ "result": "successfully deleted!" });
    })
    .catch(err => {
      return res.status(500).send(err);
    })
});

/*
  @route    POST api/pollItem/:name/add
  @descrp   add a key-value pair to a particular pollItem
  @access   protected
*/
router.post('/:name/:task', auth, (req, res) => {
  // task can be either add or remove
  if (req.params.task !== 'add' && req.params.task !== 'remove')
    return res.status(400).json({ "request": "invalid url" });

  // check if the key-value pair is specified in the body part
  if (!req.body.key || !req.body.value)
    return res.status(400).json({ "key-value": "key or value not found" });

  const keyValueRegex = /^([a-zA-Z]([a-zA-Z_0-9 ]){0,249})$/;
  if (!keyValueRegex.test(req.body.key) || !keyValueRegex.test(req.body.value))
    return res.status(400).json({ "key-value": "key or value is in invalid format" });

  PollItem.find({ owner: req.user.email, name: req.params.name })
    .then(result => {
      // whether there is any pollItem with the given name created by this user
      if (!result.length) {
        res.status(400).json({ "name": "poll-item not found" });
        return null;
      }

      const keyIndex = result[0].keys.findIndex(x => x === req.body.key);
      const valueIndex = result[0].values.findIndex(x => x === req.body.value);

      if (req.params.task === 'add') {
        //check whether the current key or value matches with any previous key or value
        if (keyIndex !== -1 || valueIndex !== -1) {
          res.status(400).json({ "key-value": "key and value must be unique" });
          return null;
        }

        // returning a promise to avoid promise nesting
        return PollItem.findByIdAndUpdate(result[0]._id, {
          $push: {
            keys: req.body.key,
            values: req.body.value
          },
          $set: { lastUpdated: Date.now() }
        }, { new: true });
      }
      else {
        if (keyIndex === -1 || valueIndex === -1) {
          // there is no key or value as specified in body
          res.status(400).json({ "key-value": "key or value doesn't exist in list" });
          return null;
        }

        result[0].keys.splice(keyIndex, 1);
        result[0].values.splice(valueIndex, 1);
        return PollItem.findByIdAndUpdate(result[0]._id, {
          $set: {
            keys: result[0].keys,
            values: result[0].values,
            lastUpdated: Date.now()
          }
        }, { new: true });
      }
    })
    .then(result => {
      // check if the response is already sent to the client
      if (!result) return;
      return res.send(result);
    })
    .catch(err => {
      return res.status(500).send(err);
    });
});

module.exports = router;