const HttpError = require("../models/http-error");
const { validationResult } = require("express-validator");
const User = require("../models/user");

exports.getAllUsers = async (req, res, next) => {
  let users;
  try {
    users = await User.find({}, "-password");
  } catch (err) {
    return next(new HttpError("Could not fetch users", 500));
  }

  res.status(200).json({
    success: true,
    msg: "Successful request",
    data: users.map(user => user.toObject())
  });
};

exports.createNewUser = async (req, res, next) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return next(new HttpError("Please enter all inputs", 400));
  }

  const { name, email, password } = req.body;
  let newUser;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new HttpError("Email already in use", 401));
    }
    newUser = new User({
      name,
      email,
      password,
      image:
        "https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
      places: []
    });
  } catch (err) {
    return next(new HttpError("Could not create user", 500));
  }

  try {
    newUser.save();
  } catch (err) {
    return next(new HttpError("Could not save user", 500));
  }
  res.status(201).json({
    success: true,
    msg: "Sucessfully created new user",
    data: newUser.toObject({ getters: true })
  });
};

exports.loginUser = async (req, res, next) => {
  const { email, password } = req.body;
  let identifiedUser;
  try {
    identifiedUser = await User.findOne({ email });
  } catch (err) {
    return next(new HttpError("Could not verify user", 500));
  }

  if (!identifiedUser || identifiedUser.password !== password) {
    return next(new HttpError("Invalid credentials", 401));
  }

  res.status(200).json({
    success: true,
    msg: "User logged in"
  });
};
