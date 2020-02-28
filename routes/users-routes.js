const express = require("express");
const router = express.Router();
const usersController = require("../controller/users-controller");
const { check } = require("express-validator");

////////////
// type: GET
// desc: get all users
router.get("/", usersController.getAllUsers);

////////////
// type: POST
// desc: sign up user
router.post(
  "/signup",
  [
    check("name").notEmpty(),
    check("email")
      .normalizeEmail()
      .isEmail(),
    check("password").isLength({ min: 6 })
  ],
  usersController.createNewUser
);

////////////
// type: POST
// desc: log in user
router.post("/login", usersController.loginUser);

module.exports = router;
