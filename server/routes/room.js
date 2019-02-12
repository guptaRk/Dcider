const express = require('express');
const router = express.Router();
const { Room } = require('../models/Room');
const { User } = require('../models/User');
const validateCreateData = require('../validation/room');
const formatValidationError = require('../common/ValidationErrorFormat');

const Fawn = require('fawn');

/*
  @route    POST api/room/create
  @descrp   create a room
  @access   public
*/
router.post('/create', auth, (req, res) => {
  let { error } = validateCreateData(req.body);
  if (error) return res.status(400).json(error);

  User.find({ email: req.user.email })
    .then(user => {
      // verify that whether user have created(or cloned) the mentioned Xlist
      const xlistVerify = user.myXlist.filter(x => {
        return (x.name === req.body.xlist);
      });
      if (!xlistVerify.length)
        return res.status(400).json({ "xlist": "mentioned xlist doesn't exist" });

      //verify pollItem
      const pollItemVerify = user.pollItems.filter(x => {
        return (x.name === req.body.pollItem);
      });
      if (!pollItemVerify.length)
        return res.status(400).json({ "pollItem": "mentioned poll-item is invalid" });

      // verify that a room with given name already exists or not
      const roomVerify = user.myRooms.filter(x => {
        return (x.name === req.body.name);
      });
      // TODO: add the logic that past room names doesn't conflict here!
      if (roomVerify.length)
        return res.status(400).json({ "name": "a room with same name already exists" });

      const room = new Room({
        name: req.body.name,
        description: req.body.description,
        owner: req.user.email,
        pollItem: {
          name: pollItemVerify[0].name,
          itemCount: pollItemVerify[0].itemCount,
          pollItem: pollItemVerify[0].pollItem
        },
        status: "active",
        xlist: {
          name: xlistVerify[0].name,
          xlist: xlistVerify[0].xlist
        }
      });

      room.validate(err => {
        if (err) return res.status(400).json(formatValidationError(err));

        const task = Fawn.Task();
        task.
          save('room', room),
          update('user', { email: req.user.email }, {
            $push: {
              myRooms: {
                name: req.body.name,
                room: room._id
              }
            }
          })

            .run()
            .then(result => {
              return res.send(result);
            })
            .catch(err => {
              return res.status(500).send(err);
            })
      })

    })
    .catch(err => {
      return res.status(500).send(err);
    })
});

module.exports = router;