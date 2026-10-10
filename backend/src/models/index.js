const connectDB = require('../config/db');
const User = require('./User');
const Store = require('./Store');
const Rating = require('./Rating');

module.exports = {
  connectDB,
  User,
  Store,
  Rating,
};
