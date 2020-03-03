const HttpError = require("../models/http-error");
const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  // using headers in requests
  // Authorization: 'Bearer TOKEN' <- split it

  // check if request method is OPTIONS instead of GET, DELETE, PATCH...
  // OPTIONS is a default behaviour that the browser sends before the  GET, DELETE, PATCH...
  // thats why we need to let OPTIONS slide by calling next(), and the verb is sent right after OPTIONS.
  try {
    if (req.method === "OPTIONS") {
      return next();
    }
    // get token
    const token = req.headers.authorization.split(" ")[1];
    // if there is not token then throw error
    if (!token) {
      throw new Error("Authentication failed!");
    }
    // verify token validity
    const decodedToken = jwt.verify(
      token,
      "noneiseverygoing_tofindthisS_IA_DjiSecret"
    );
    // save user id from token
    req.userData = {
      userId: decodedToken.id
    };
    // go to next middleware
    next();
  } catch (err) {
    next(new HttpError("Authentication failed", 401));
  }
};
