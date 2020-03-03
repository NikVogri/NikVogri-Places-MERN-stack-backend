const HttpError = require("../models/http-error");
const { validationResult } = require("express-validator");

const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

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
      return next(new HttpError("Email already in use", 400));
    }
    let hashedPassword;
    try {
      hashedPassword = await bcrypt.hash(password, 12);
    } catch (err) {
      next(new HttpError("Could not create user, try again"), 500);
    }

    newUser = new User({
      name,
      email,
      password: hashedPassword,
      image: req.file.path,
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

  let token;
  try {
    token = jwt.sign(
      {
        userId: newUser.id,
        email: newUser.email
      },
      "noneiseverygoing_tofindthisS_IA_DjiSecret",
      { expiresIn: "1h" }
    );
  } catch (err) {
    return next(new HttpError("Could not save user", 500));
  }

  res.status(201).json({
    success: true,
    msg: "Sucessfully created new user",
    data: {
      userId: newUser.id,
      email: newUser.email,
      token
    }
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
  if (!identifiedUser) {
    return next(new HttpError("Invalid credentials", 403));
  }
  try {
    isValidPassword = await bcrypt.compare(password, identifiedUser.password);
    if (!isValidPassword) {
      throw new Error("Authentication failed!");
    }
  } catch (err) {
    return next(new HttpError("Could not validate credentials", 500));
  }

  let token;
  try {
    token = jwt.sign(
      {
        id: identifiedUser.id,
        email: identifiedUser.email
      },
      "noneiseverygoing_tofindthisS_IA_DjiSecret",
      { expiresIn: "1h" }
    );
  } catch (err) {
    next(new HttpError("Could not login", 500));
  }

  res.status(200).json({
    success: true,
    msg: "User logged in",
    user: {
      token,
      email: identifiedUser.email,
      userId: identifiedUser.id
    }
  });
};
