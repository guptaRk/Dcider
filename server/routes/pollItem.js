import express from 'express';
import {
  name as validateName,
  keyValue as validateKeyValue,
  checkIfArrayIsUnique
} from '../validation/index';

import PollItem from '../models/PollItem';
import auth from '../middlewares/auth';

const router = express.Router();

/*
  @route      POST api/pollItem/create
  @descrp     create a pollItem
  @access     protected 
  @bodyparm   poll-item's name(name),array of keys(keys),array of values(values)
*/
router.post('/create', auth, (req, res) => {
  // verify the request body parameters
  if (!req.body.name || !validateName(req.body.name))
    return res.status(400).json({
      name: "name must be alphanumeric and may contains underscore'_'"
    });

  if (
    !req.body.keys ||
    !(req.body.keys instanceof Array) ||
    !checkIfArrayIsUnique(req.body.keys)
  )
    return res.status(400).json({ keys: 'Keys are mandatory and must be unique' });

  let check = true;
  for (let j = 0; j < req.body.keys.length; j += 1)
    if (!validateKeyValue(req.body.keys[j])) check = false;
  if (!check)
    return res.status(400).json({
      keys:
        "keys must be alphanumeric and may contains only underscore '_' as special character"
    });

  if (
    !req.body.values ||
    !(req.body.values instanceof Array) ||
    !checkIfArrayIsUnique(req.body.values)
  )
    return res.status(400).json({ values: 'values are mandatory and must be unique' });

  check = true;
  for (let j = 0; j < req.body.values.length; j += 1)
    if (!validateKeyValue(req.body.values[j])) check = false;
  if (!check)
    return res.status(400).json({
      values:
        "values must be alphanumeric and may contains only underscore '_' as special character"
    });

  if (req.body.keys.length !== req.body.values.length)
    return res.status(400).json({
      key_value: "There must be equal number of keys and values"
    });
  // -------verify body parameters complete ------

  // check whether the user have a pollItem with same name
  PollItem.find({ owner: req.user.uid, name: req.body.name })
    .then(result => {
      if (result.length !== 0) {
        res
          .status(400)
          .json({ name: 'pollItem with same name already exists' });
        return null;
      }

      const pollItem = new PollItem({
        owner: req.user.uid,
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
        i.e. if we use 'pollItem.save()' then only the 
        PollItemSchema is going to run otherwise not!!
  
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
      res.send(result);
    })
    .catch(err => {
      return res.status(500).send(err);
    });
  return 0;
});

/*
  @route    GET api/pollItem/all
  @descrp   returns a list of all the pollItem
  @access   protected
*/
router.get('/all', auth, (req, res) => {
  PollItem.find({ owner: req.user.uid }, { _id: 0 })
    .then(pollItems => {
      return res.send(pollItems);
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
  PollItem.find({ owner: req.user.uid, name: req.params.name }, { _id: 0 })
    .then(result => {
      // If there is no pollItem with that name
      if (result.length === 0)
        return res
          .status(400)
          .json({ name: `poll-item '${req.params.name}' doesn't exist` });

      return res.send(result[0]);
    })
    .catch(err => {
      return res.status(500).send(err);
    });
});

/*
  @route    DELETE api/pollItem/:name
  @descrp   delete the pollItem specified
  @access   protected
*/
router.delete('/:name', auth, (req, res) => {
  PollItem.findOneAndDelete({ owner: req.user.uid, name: req.params.name })
    .then(result => {
      if (!result) return res.status(400).json({ name: "Poll-Item doesn't exist" });

      return res.json({ result: 'successfully deleted!' });
    })
    .catch(err => {
      return res.status(500).send(err);
    });
});

/*
  @route      POST api/pollItem/:name/:task
  @descrp     add or remove a key-value pair to a particular pollItem
  @access     protected
  @bodyparm   key name(key), value name(value)
*/
router.post('/:name/:task', auth, (req, res) => {
  // task can be either add or remove
  if (req.params.task !== 'Add' && req.params.task !== 'Remove')
    return res.status(400).json({ request: 'invalid url' });

  // check if the key-value pair is specified in the body part
  if (!req.body.key || !req.body.value)
    return res.status(400).json({ 'key_value': 'key or value not found' });

  if (!validateKeyValue(req.body.key) || !validateKeyValue(req.body.value))
    return res
      .status(400)
      .json({ 'key_value': 'key or value is in invalid format' });

  PollItem.find({ owner: req.user.uid, name: req.params.name })
    .then(result => {
      // whether there is any pollItem with the given name created by this user
      if (!result.length) {
        res.status(400).json({ name: 'poll-item not found' });
        return null;
      }

      const keyIndex = result[0].keys.findIndex(x => x === req.body.key);
      const valueIndex = result[0].values.findIndex(x => x === req.body.value);

      if (req.params.task === 'Add') {
        // check whether the current key or value matches
        // with any previous key or value
        if (keyIndex !== -1 || valueIndex !== -1) {
          res.status(400).json({ 'key_value': 'key and value must be unique' });
          return null;
        }

        // returning a promise to avoid promise nesting
        return PollItem.findByIdAndUpdate(
          result[0]._id,
          {
            $push: {
              keys: req.body.key,
              values: req.body.value
            },
            $set: { lastUpdated: Date.now() }
          },
          { new: true }
        );
      } else {
        if (keyIndex === -1 || valueIndex === -1) {
          // there is no key or value as specified in body
          res
            .status(400)
            .json({ 'key_value': "key or value doesn't exist in list" });
          return null;
        }

        result[0].keys.splice(keyIndex, 1);
        result[0].values.splice(valueIndex, 1);
        return PollItem.findByIdAndUpdate(
          result[0]._id,
          {
            $set: {
              keys: result[0].keys,
              values: result[0].values,
              lastUpdated: Date.now()
            }
          },
          { new: true }
        );
      }
    })
    .then(result => {
      // check if the response is already sent to the client
      if (!result) return;
      res.send(result);
    })
    .catch(err => {
      return res.status(500).send(err);
    });
  return 0;
});

export default router;
