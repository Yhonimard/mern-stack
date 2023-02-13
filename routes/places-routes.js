const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const jwt = require('jsonwebtoken');

const placesControllers = require('../controllers/places-controller');
const fileUpload = require('../middleware/file-upload');
const httpError = require('../models/http-error');
const checkAuth = require('../middleware/check-auth');

router.get('/:pid', placesControllers.getPlacesById);
router.get('/user/:uid', placesControllers.getPlacesByUserId);

router.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    return next();
  }

  try {
    const token = req.headers.authorization.split(' ')[1];
    if (!token) {
      throw new Error('auth failed');
    }
    const decodedToken = jwt.verify(token, process.env.JWT_KEY);
    req.userData = {
      userId: decodedToken.id,
    };
    next();
  } catch (err) {
    const error = new httpError('Authentication failed', 401);
    return next(error);
  }
});

router.post(
  '/',
  fileUpload.single('image'),
  [
    check('title').not().isEmpty(),
    check('description').isLength({ min: 5 }),
    check('address').not().isEmpty(),
  ],
  placesControllers.createPlace
);

router.patch(
  '/:pid',
  [check('title').not().isEmpty(), check('description').isLength({ min: 5 })],
  placesControllers.updatePlaceById
);

router.delete('/:pid', placesControllers.deletePlaceById);

module.exports = router;
