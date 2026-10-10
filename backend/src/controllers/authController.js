const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const {
  validateName,
  validateEmail,
  validateAddress,
  validatePassword,
} = require('../utils/validators');

const generateToken = (user) => {
  const secret = process.env.JWT_SECRET || 'super_secure_jwt_secret_store_rating_platform_2026_key!';
  const expiresIn = process.env.JWT_EXPIRES_IN || '24h';
  return jwt.sign(
    {
      id: user._id || user.id,
      email: user.email,
      role: user.role,
    },
    secret,
    { expiresIn }
  );
};

// 1. Normal User Signup
const register = async (req, res, next) => {
  try {
    const { name, email, address, password } = req.body;

    const nameErr = validateName(name, 'Name');
    if (nameErr) return res.status(400).json({ success: false, message: nameErr });

    const emailErr = validateEmail(email);
    if (emailErr) return res.status(400).json({ success: false, message: emailErr });

    const addressErr = validateAddress(address, 'Address');
    if (addressErr) return res.status(400).json({ success: false, message: addressErr });

    const passwordErr = validatePassword(password, 'Password');
    if (passwordErr) return res.status(400).json({ success: false, message: passwordErr });

    const existingUser = await User.findOne({ email: email.trim().toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      address: address.trim(),
      password: hashedPassword,
      role: 'normal_user',
    });

    const token = generateToken(newUser);

    res.status(201).json({
      success: true,
      message: 'Registration successful! Welcome to the Store Rating Platform.',
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        address: newUser.address,
        role: newUser.role,
      },
    });
  } catch (err) {
    next(err);
  }
};

// 2. Single Login System for All Roles
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.',
      });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const token = generateToken(user);

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        address: user.address,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
};

// 3. Get Current User profile
const getMe = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        address: req.user.address,
        role: req.user.role,
      },
    });
  } catch (err) {
    next(err);
  }
};

// 4. Change Password
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password is required.',
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User account not found.',
      });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect.',
      });
    }

    const passwordErr = validatePassword(newPassword, 'New Password');
    if (passwordErr) {
      return res.status(400).json({
        success: false,
        message: passwordErr,
      });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({
        success: false,
        message: 'New password cannot be identical to your current password.',
      });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully! Please use your new password next time you log in.',
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  register,
  login,
  getMe,
  changePassword,
};
