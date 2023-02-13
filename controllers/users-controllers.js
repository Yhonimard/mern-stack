const httpError = require('../models/http-error');
const User = require('../models/users');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { validationResult } = require('express-validator');

const getUsers = async (req, res, next) => {
  let users;
  try {
    users = await User.find({}, '-password');
  } catch (err) {
    const error = new httpError('fetching user failed, try again later', 500);
    return next(error);
  }
  res.json({ users: users.map((user) => user.toObject({ getters: true })) });
};

const signup = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return next(new httpError('please validate ur input', 422));
  }

  const { name, email, password } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new httpError('signup failed, pls try again later', 500);
    return next(error);
  }

  if (existingUser) {
    const error = new httpError('users exists already, pls login instead', 422);
    return next(error);
  }

  let hashPassword;

  try {
    hashPassword = await bcrypt.hash(password, 12);
  } catch (err) {
    const error = new httpError('could not create user pls try again', 500);
    return next(error);
  }

  const createdUsers = new User({
    name,
    email,
    image: req.file.path,
    password: hashPassword,
    places: [],
  });

  try {
    await createdUsers.save();
  } catch (err) {
    const error = new httpError('signup failed, please try again', 500);
    return next(error);
  }

  let token;
  try {
    token = jwt.sign(
      {
        userId: createdUsers.id,
        email: createdUsers.email,
      },
      process.env.JWT_KEY,
      { expiresIn: '2h' }
    );
  } catch (err) {
    const error = new httpError('sign up failed pls try again', 500);
    return next(error);
  }

  res
    .status(201)
    .json({ userId: createdUsers.id, email: createdUsers.email, token: token });
};

const login = async (req, res, next) => {
  const { email, password } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new httpError('loggin in failed, pls try again later', 500);
    return next(error);
  }

  if (!existingUser) {
    const error = new httpError('invalid credentials , could not login ', 403);
    return next(error);
  }

  let isValidPassword = false;

  try {
    isValidPassword = await bcrypt.compare(password, existingUser.password);
  } catch (err) {
    const error = new httpError(
      'could not login please check ur credentials and try again',
      500
    );
    return next(error);
  }

  if (!isValidPassword) {
    const error = new httpError('invalid credentials , could not login', 404);
    return next(error);
  }

  let token;
  try {
    token = jwt.sign(
      { email: existingUser.email, id: existingUser.id },
      process.env.JWT_KEY,
      {
        expiresIn: '2h',
      }
    );
  } catch (error) {}

  res.json({
    userId: existingUser.id,
    email: existingUser.email,
    token: token,
  });
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
