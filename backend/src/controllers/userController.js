const bcrypt = require('bcryptjs');
const { User, Store, Rating } = require('../models');
const {
  validateName,
  validateEmail,
  validateAddress,
  validatePassword,
} = require('../utils/validators');

// 1. Get All Users (System Administrator)
const getAllUsers = async (req, res, next) => {
  try {
    const { search, role } = req.query;

    let query = {};
    if (role && role !== 'all') {
      query.role = role;
    }

    if (search && search.trim() !== '') {
      const q = search.trim();
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
        { address: { $regex: q, $options: 'i' } },
      ];
    }

    const users = await User.find(query).select('-password');

    const formattedUsers = await Promise.all(
      users.map(async (u) => {
        let storeInfo = null;
        if (u.role === 'store_owner') {
          const store = await Store.findOne({ owner: u._id });
          if (store) {
            const ratings = await Rating.find({ store: store._id });
            const total = ratings.length;
            const avg = total > 0 ? parseFloat((ratings.reduce((s, r) => s + r.rating, 0) / total).toFixed(1)) : 0;
            storeInfo = {
              storeId: store._id,
              storeName: store.name,
              storeEmail: store.email,
              storeAddress: store.address,
              totalRatings: total,
              averageRating: avg,
            };
          }
        }

        return {
          id: u._id,
          name: u.name,
          email: u.email,
          address: u.address,
          role: u.role,
          storeInfo,
          createdAt: u.createdAt,
          updatedAt: u.updatedAt,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: formattedUsers.length,
      users: formattedUsers,
    });
  } catch (err) {
    next(err);
  }
};

// 2. Add User (System Administrator)
const createUser = async (req, res, next) => {
  try {
    const { name, email, password, address, role = 'normal_user' } = req.body;

    const nameErr = validateName(name, 'Name');
    if (nameErr) return res.status(400).json({ success: false, message: nameErr });

    const emailErr = validateEmail(email);
    if (emailErr) return res.status(400).json({ success: false, message: emailErr });

    const addressErr = validateAddress(address, 'Address');
    if (addressErr) return res.status(400).json({ success: false, message: addressErr });

    const passwordErr = validatePassword(password, 'Password');
    if (passwordErr) return res.status(400).json({ success: false, message: passwordErr });

    const allowedRoles = ['admin', 'normal_user', 'store_owner'];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: `Role must be one of: ${allowedRoles.join(', ')}.`,
      });
    }

    const existingUser = await User.findOne({ email: email.trim().toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'A user with this email address already exists.',
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      address: address.trim(),
      password: hashedPassword,
      role,
    });

    res.status(201).json({
      success: true,
      message: `User created successfully with role '${role}'!`,
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

// 3. View Complete User Details (System Administrator)
const getUserDetails = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    let storeOwnerRatingInfo = null;
    if (user.role === 'store_owner') {
      const store = await Store.findOne({ owner: user._id });
      if (store) {
        const ratings = await Rating.find({ store: store._id }).populate('user', 'name email');
        const totalRatings = ratings.length;
        const ratingSum = ratings.reduce((sum, r) => sum + r.rating, 0);
        const averageRating = totalRatings > 0 ? parseFloat((ratingSum / totalRatings).toFixed(1)) : 0;

        storeOwnerRatingInfo = {
          storeId: store._id,
          storeName: store.name,
          storeEmail: store.email,
          storeAddress: store.address,
          averageRating,
          totalRatings,
          ratingsReceived: ratings.map((r) => ({
            ratingId: r._id,
            rating: r.rating,
            userName: r.user ? r.user.name : 'Unknown User',
            userEmail: r.user ? r.user.email : '',
            createdAt: r.createdAt,
          })),
        };
      }
    }

    const userRatingsGiven = await Rating.find({ user: user._id }).populate('store', 'name address');

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        address: user.address,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        storeOwnerRating: storeOwnerRatingInfo,
        ratingsGiven: userRatingsGiven.map((r) => ({
          ratingId: r._id,
          storeId: r.store ? r.store._id : null,
          storeName: r.store ? r.store.name : 'Unknown Store',
          rating: r.rating,
          createdAt: r.createdAt,
        })),
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllUsers,
  createUser,
  getUserDetails,
};
