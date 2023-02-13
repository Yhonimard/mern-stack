const axios = require('axios');
const httpError = require('../models/http-error');
const API_KEY = 'AIzaSyDgLmMpKCzveJf1_yuA0fUzzhy0WRChvZA';

const getCoordinates = async (address) => {
  //   return {
  //     lat: 123112,
  //     lng: 1123,
  //   };
  const res = await axios.get(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      address
    )}&key=${API_KEY}`
  );
  const data = res.data;

  if (!data || data.status === 'ZERO_RESULTS') {
    const error = new httpError('could not find location', 422);
    throw error;
  }

  const coordinates = data.results[0].geometry.location;

  return coordinates;
};

module.exports = getCoordinates;
