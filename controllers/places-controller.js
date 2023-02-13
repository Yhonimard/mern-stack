const { validationResult } = require('express-validator');
const fs = require('fs');

const mongoose = require('mongoose');

const HttpError = require('../models/http-error');
const Place = require('../models/place');
const User = require('../models/users');

//! get place by id
const getPlacesById = async (req, res, next) => {
  const placeId = req.params.pid; // { pid: 'p1' }

  let place;
  try {
    place = await Place.findById(placeId);
  } catch (err) {
    const error = new HttpError(
      'something went wrong, could not find a place',
      500
    );
    return next(error);
  }

  if (!place) {
    const error = new HttpError('could not find places by its id', 404);

    return next(error);
  }

  res.json({ place: place.toObject({ getters: true }) });
};

//! get place by user id
const getPlacesByUserId = async (req, res, next) => {
  const userUid = req.params.uid;

  // let places
  let userWithPlaces;
  try {
    userWithPlaces = await User.findById(userUid).populate('places');
  } catch (err) {
    const error = new HttpError(
      'fethcing places failed , pls try again later  ',
      500
    );
    return next(error);
  }

  // if(!places  || places.length === 0){}

  if (!userWithPlaces || userWithPlaces.places.length === 0) {
    return next(new HttpError('could find place for this users', 404));
  }

  res.json({
    places: userWithPlaces.places.map((p) => p.toObject({ getters: true })),
  });
};

//! create new data for place
const createPlace = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.status(422);
    next(new HttpError('please invalid your data', 422));
  }

  const { title, description, address } = req.body;
  const coordinate = {
    lat: Math.random(),
    lng: Math.random(),
  };

  const createdPlace = new Place({
    title,
    description,
    address,
    location: coordinate,
    image: req.file.path,
    creator: req.userData.userId,
  });

  let user;
  try {
    user = await User.findById(req.userData.userId);
  } catch (err) {
    const error = new HttpError('creating place failed pls try again', 500);
    return next(error);
  }

  if (!user) {
    const error = new HttpError('could not find user for provided id ', 404);
    return next(error);
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();

    await createdPlace.save({ session: sess });

    user.places.push(createdPlace);

    await user.save({ session: sess });

    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError('creating place failed pls try again', 500);
    return next(error);
  }

  res.status(201).json({ place: createdPlace });
};

//!update place
const updatePlaceById = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return new HttpError('please validate your input', 422);
  }
  const { title, description } = req.body;
  const placeId = req.params.pid;

  let place;
  try {
    place = await Place.findById(placeId);
  } catch (err) {
    const error = new HttpError(
      'something went wrong could not update place',
      500
    );
    return next(error);
  }

  if (place.creator.toString() !== req.userData.userId) {
    const error = new HttpError('youre not allowed to update this place', 403);
    return next(error);
  }

  place.title = title;
  place.description = description;

  try {
    await place.save();
  } catch (err) {
    const error = new HttpError('something wen wrong, could nt place', 500);

    return next(error);
  }

  res.status(200).json({ place: place.toObject({ getters: true }) });
};

//!delete place
const deletePlaceById = async (req, res, next) => {
  const placeId = req.params.pid;

  let place;
  try {
    place = await Place.findById(placeId).populate('creator');
  } catch (err) {
    const error = HttpError('could not delete place', 500);
    return next(error);
  }

  if (!place) {
    const error = new HttpError('could not findd place for this id', 404);
    return next(error);
  }

  if (place.creator.id !== req.userData.userId) {
    const error = new HttpError('youre not allowed to delete this place', 403);
    return next(error);
  }

  const imagePath = place.image;

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    place.creator.places.pull(place);

    await place.remove({ session: sess });

    await place.creator.save({ session: sess });

    await sess.commitTransaction();
  } catch (err) {
    const error = HttpError(
      ' something went wrong , could not delete place',
      500
    );
    return next(error);
  }

  fs.unlink(imagePath, (error) => {
    console.log(error);
    res.status(200).json({ message: 'deleted place is berhasil' });
  });
};

exports.getPlacesById = getPlacesById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlaceById = updatePlaceById;
exports.deletePlaceById = deletePlaceById;
