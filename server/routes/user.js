const express = require('express');
const router = express.Router();
const { User } = require('../models/User');
const validateLogin = require('../validation/login');
const validateRegister = require('../validation/register');

const auth = require('../middlewares/auth');

const bcrypt = require('bcrypt');
const saltRounds = 10;

/*
  @route    POST api/users/login
  @descrp   register a user and send the jwt
  @access   public
*/
router.post('/register', async (req, res) => {
  let { error } = validateRegister(req.body);
  if (error) return res.status(400).json(error);

  //Initialize error object
  error = {};

  try {
    const result = await User.findOne({ email: req.body.email });
    if (result && result.length !== 0) {
      error["email"] = "Email already registered";
      return res.status(400).json(error);
    }

    const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);

    const user = new User({
      name: req.body.name,
      password: hashedPassword,
      email: req.body.email
    });

    user.save()
      .then(result => {
        console.log(result);
        res.setHeader("x-auth-token", user.getToken());
        res.send(result);
      })
      .catch(err => {
        res.status(500).send("save : " + err);
      });

  } catch (err) {
    // Internal server error
    res.status(500).send(err);
  }
})

/*
  @route    POST api/users/login
  @descrp   login a user and send the jwt
  @access   public
*/
router.post('/login', async (req, res) => {
  let { error } = validateLogin(req.body);
  if (error) return res.status(400).send(error);

  error = {};
  try {
    const user = await User.find({ email: req.body.email });
    if (user.length === 0) {
      error['email'] = 'Email not registered!';
      return res.status(400).json(error);
    }

    bcrypt.compare(req.body.password, user[0].password)
      .then((result) => {
        if (result === false) {
          error['password'] = 'Incorrect password';
          return res.status(400).json(error);
        }

        res.setHeader('x-auth-token', user[0].getToken());
        res.json({
          name: user[0].name,
          email: user[0].email
        });
      });
  }
  catch (err) {
    // Internal server error
    res.status(500).send(err);
  }

});

module.exports = router;