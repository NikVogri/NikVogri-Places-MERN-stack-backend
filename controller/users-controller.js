const HttpError = require("../models/http-error");
const { v4: uuidv4 } = require("uuid");
const { validationResult } = require("express-validator");

const DUMMY_USERS = [
  {
    id: "u1",
    name: "Nick",
    email: "test@test.com",
    password: "123"
  }
];

exports.getAllUsers = (req, res, next) => {
  const users = DUMMY_USERS;

  res.status(200).json({
    success: true,
    msg: "Successful request",
    data: users
  });
};

exports.createNewUser = (req, res, next) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    throw new HttpError("Please enter all inputs", 400);
  }
  const { name, email, password } = req.body;

  const newUser = {
    id: uuidv4(),
    name,
    email,
    password
  };

  DUMMY_USERS.push(newUser);

  res.status(201).json({
    success: true,
    msg: "Sucessfully created new user",
    data: newUser
  });
};

exports.loginUser = (req, res, next) => {
  const { email, password } = req.body;
  const identifiedUser = DUMMY_USERS.find(user => user.email === email);

  if (!identifiedUser || identifiedUser.password !== password) {
    return next(new HttpError("Invalid credentials", 401));
  }

  res.status(200).json({
    success: true,
    msg: "User logged in"
  });
};
