const db = require('../models');
const User = db.user;

const jwt = require('jsonwebtoken');

require('dotenv').config();
const { JWT_SECRET } = process.env;

exports.userRegister = async (phoneNumber) => {
  const user = await User.findOne({ phoneNumber });

  if (!user) {
    const newUser = new User({ phoneNumber });
    await newUser.save();
  }

  if (user.banned) {
    throw new Error('Banned user');
  }
  const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: 86400 });
  const authority = user.role.toUpperCase();

  return {
    message: 'Logged in successfully',
    userId: user._id,
    token,
    authority,
  };
};
