const { Store, Rating, User } = require('../models');
const {
  validateName,
  validateEmail,
  validateAddress,
} = require('../utils/validators');

// 1. Get All Stores (for Normal Users and Admins)
const getAllStores = async (req, res, next) => {
  try {
    const { search, searchType = 'all' } = req.query;
    const currentUserId = req.user ? req.user._id || req.user.id : null;

    let query = {};
    if (search && search.trim() !== '') {
      const q = search.trim();
      if (searchType === 'name') {
        query.name = { $regex: q, $options: 'i' };
      } else if (searchType === 'address') {
        query.address = { $regex: q, $options: 'i' };
      } else {
        query.$or = [
          { name: { $regex: q, $options: 'i' } },
          { address: { $regex: q, $options: 'i' } },
          { email: { $regex: q, $options: 'i' } },
        ];
      }
    }

    const stores = await Store.find(query).populate('owner', 'name email');

    const formattedStores = await Promise.all(
      stores.map(async (store) => {
        const ratings = await Rating.find({ store: store._id });
        const totalRatings = ratings.length;
        const ratingSum = ratings.reduce((sum, r) => sum + r.rating, 0);
        const averageRating = totalRatings > 0 ? parseFloat((ratingSum / totalRatings).toFixed(1)) : 0;

        let userRating = 0;
        let userRatingId = null;
        if (currentUserId) {
          const found = ratings.find((r) => r.user.toString() === currentUserId.toString());
          if (found) {
            userRating = found.rating;
            userRatingId = found._id;
          }
        }

        return {
          id: store._id,
          name: store.name,
          email: store.email,
          address: store.address,
          ownerId: store.owner ? store.owner._id : null,
          ownerName: store.owner ? store.owner.name : null,
          averageRating,
          overallRating: averageRating,
          totalRatings,
          userRating,
          userSubmittedRating: userRating,
          userRatingId,
          createdAt: store.createdAt,
          updatedAt: store.updatedAt,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: formattedStores.length,
      stores: formattedStores,
    });
  } catch (err) {
    next(err);
  }
};

// 2. Add New Store (System Administrator)
const createStore = async (req, res, next) => {
  try {
    const { name, email, address, ownerId } = req.body;

    const nameErr = validateName(name, 'Store Name');
    if (nameErr) return res.status(400).json({ success: false, message: nameErr });

    const emailErr = validateEmail(email);
    if (emailErr) return res.status(400).json({ success: false, message: emailErr });

    const addressErr = validateAddress(address, 'Store Address');
    if (addressErr) return res.status(400).json({ success: false, message: addressErr });

    const existing = await Store.findOne({ email: email.trim().toLowerCase() });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'A store with this email address already exists.',
      });
    }

    let validOwnerId = null;
    if (ownerId) {
      const owner = await User.findById(ownerId);
      if (!owner) {
        return res.status(400).json({
          success: false,
          message: 'Specified store owner user was not found.',
        });
      }
      validOwnerId = owner._id;
    }

    const newStore = await Store.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      address: address.trim(),
      owner: validOwnerId,
    });

    res.status(201).json({
      success: true,
      message: 'Store created successfully!',
      store: {
        id: newStore._id,
        name: newStore.name,
        email: newStore.email,
        address: newStore.address,
        ownerId: newStore.owner,
        averageRating: 0,
        totalRatings: 0,
        userRating: 0,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllStores,
  createStore,
};
