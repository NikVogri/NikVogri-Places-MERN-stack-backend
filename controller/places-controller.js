const HttpError = require("../models/http-error");
const { validationResult } = require("express-validator");
const getCoordsForAddress = require("../util/location");
const mongoose = require("mongoose");

const Place = require("../models/place");
const User = require("../models/user");

exports.createPlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError("Invalid inputs, please check your data", 422));
  }

  const { title, description, address, creator } = req.body;
  // check if data is there
  // save to database
  // send info back to user
  let coordinates;
  try {
    coordinates = await getCoordsForAddress(address);
  } catch (err) {
    return next(err);
  }

  const createdPlace = new Place({
    title,
    description,
    address,
    location: coordinates,
    creator,
    image:
      "https://images.pexels.com/photos/3375997/pexels-photo-3375997.jpeg?auto=compress&cs=tinysrgb&h=750&w=1260"
  });

  let user;
  try {
    user = await User.findById(creator);
  } catch (err) {
    return next(new HttpError("Could not fetch user", 500));
  }

  if (!user) {
    return next(new HttpError("Could not find user for provided id", 404));
  }

  try {
    // this tries all actions, if they dont fail then save to db else return an error.
    // creating session
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdPlace.save({ session: sess });
    // add place to user, this .push method is not the same as vanilla JS .push.
    user.places.push(createdPlace);
    // save to users
    await user.save({ session: sess });
    // end session
    await sess.commitTransaction();
  } catch (err) {
    return next(new HttpError("Could not create place", 500));
  }

  res.status(201).json({
    success: true,
    msg: "Place successfully created",
    data: createdPlace
  });
};

exports.updatePlace = async (req, res, next) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return next(new HttpError("Title and description can not be empy", 400));
  }

  const { pid: placeId } = req.params;
  const { title, description } = req.body;

  let updatedPlace;
  try {
    updatedPlace = await Place.findById(placeId);
    updatedPlace.title = title;
    updatedPlace.description = description;
  } catch (err) {
    return next(new HttpError("Something went wrong while fetching", 500));
  }

  // save to db
  try {
    await updatedPlace.save();
  } catch (err) {
    return next(new HttpError("Something went wrong, could not update ", 500));
  }

  res.status(200).json({
    success: true,
    msg: "successfully updated place",
    data: updatedPlace.toObject({ getters: true })
  });
};

exports.deletePlace = async (req, res, next) => {
  const placeId = req.params.pid;
  let place;

  try {
    // populate gives us full creator object.
    place = await Place.findById(placeId).populate("creator");
  } catch (err) {
    return next(new HttpError("Could not delete place", 500));
  }

  if (!place) {
    return next(new HttpError("Could not find a place for this id", 404));
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await place.remove({ session: sess });
    // remove place from array
    place.creator.places.pull(place);
    // save new array
    await place.creator.save({ session: sess });
    sess.commitTransaction();
  } catch (err) {
    return next(new HttpError("Could not remove place", 500));
  }

  res.status(200).json({
    success: true,
    msg: "Place successfully deleted"
  });
};

exports.getPlaceById = async (req, res, next) => {
  const placeId = req.params.pid;
  let place;
  try {
    place = await Place.findById(placeId);
  } catch (err) {
    return next(
      new HttpError("Something went wrong, could not find a place", 404)
    );
  }

  // in case server cant find place throw an error which middleware will pickup and send to user
  if (!place) {
    return next(new HttpError("Could not find place for the provided id", 404));
  }

  res.status(200).json({
    success: true,
    msg: "Successful request",
    data: place.toObject({ getters: true }) // converts json to object, getters turns _id to id.
  });
};

exports.getPlacesByUserId = async (req, res, next) => {
  const { uid: userId } = req.params;
  let places;
  try {
    places = await Place.find({ creator: userId });
  } catch (err) {
    return next(new HttpError("Could not find place with that user id", 500));
  }

  // in case server cant find place throw an error which middleware will pickup and send to user
  // use next() in async or always.
  if (!places || places.length === 0) {
    return next(
      new HttpError("Could not find places for the provided user", 404)
    );
  }

  res.status(200).json({
    success: true,
    msg: "Found user places",
    data: places.map(place => place.toObject({ getters: true }))
  });
};
