const jwt = require('jsonwebtoken');

export default (req, res, next) => {
  const authToken = req.get('x-auth-token');
  if (!authToken)
    return res.status(400).json({ "token": "Token not found" });

  const jwtPrivateKey = process.env.JWT_PRIVATE_KEY;
  jwt.verify(authToken, jwtPrivateKey, function (err, payload) {
    if (err) return res.status(400).json({ "token": "Invalid token" });

    // decode the token and add the data to the req
    // so that other functions can access them safely
    req.user = payload.data;

    //pass the control to the next middleware
    next();
  });
}