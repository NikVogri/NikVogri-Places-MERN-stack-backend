const HttpError = require("../models/http-error");
const { v4: uuidv4 } = require("uuid");
const { validationResult } = require("express-validator");
const getCoordsForAddress = require("../util/location");

let DUMMY_PLACES = [
  {
    id: "p1",
    title: "Empire state building",
    description: "One of the most famous skyscrapes in the world",
    location: {
      lat: 40.7484474,
      lng: -73.9871516
    },
    address: "20 W 34th St, New York, NY 10001",
    creator: "u2"
  }
];

exports.getPlaceById = (req, res, next) => {
  const placeId = req.params.pid;
  const place = DUMMY_PLACES.find(p => {
    return placeId === p.id;
  });

  // in case server cant find place throw an error which middleware will pickup and send to user
  if (!place) {
    throw new HttpError("Could not find place for the provided id", 404);
  }

  res.status(200).json({
    success: true,
    msg: "Successful request",
    data: place
  });
};

exports.getPlacesByUserId = (req, res, next) => {
  const { uid: userId } = req.params;

  const places = DUMMY_PLACES.filter(p => {
    return userId === p.creator;
  });

  // in case server cant find place throw an error which middleware will pickup and send to user
  // use next() in async or always.
  if (!places || places.length === 0) {
    return next(
      new HttpError("Could not find places for the provided user", 404)
    );
  }

  res.status(200).json({
    success: true,
    msg: "Found user",
    data: places
  });
};

exports.createPlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(HttpError("Invalid inputs, please check your data", 422));
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

  const createdPlace = {
    id: uuidv4(),
    title,
    description,
    location: coordinates,
    address,
    creator
  };

  DUMMY_PLACES.push(createdPlace);

  res.status(201).json({
    success: true,
    msg: "Place successfully created",
    data: createdPlace
  });
};

exports.updatePlace = (req, res, next) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    throw new HttpError("Title and description can not be empy", 400);
  }

  const { pid: placeId } = req.params;
  const { title, description } = req.body;

  const updatePlace = { ...DUMMY_PLACES.find(p => p.id === placeId) };
  const placeIndex = DUMMY_PLACES.find(p => p.id === placeId);
  updatePlace.title = title;
  updatePlace.description = description;

  DUMMY_PLACES[placeIndex] = updatePlace;

  res.status(200).json({
    success: true,
    msg: "successfully updated place",
    data: updatePlace
  });
};

exports.deletePlace = (req, res, next) => {
  const placeId = req.params.pid;
  if (!DUMMY_PLACES.find(p => placeId === p.id)) {
    throw new HttpError("Could not find a place for that id", 404);
  }

  DUMMY_PLACES = DUMMY_PLACES.filter(p => placeId !== p.id);

  res.status(200).json({
    success: true,
    msg: "Place successfully deleted",
    data: DUMMY_PLACES
  });
};
