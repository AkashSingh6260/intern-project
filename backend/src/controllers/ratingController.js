const { Rating, Store } = require('../models');
const { validateRating } = require('../utils/validators');

const getValidatedRating = (req, res) => {
  const { storeId, rating } = req.body;

  if (!storeId) {
    res.status(400).json({
      success: false,
      message: 'Store ID is required.',
    });
    return null;
  }

  const error = validateRating(rating);
  if (error) {
    res.status(400).json({
      success: false,
      message: error,
    });
    return null;
  }

  return { storeId, rating: parseInt(rating, 10) };
};

// 1. Submit Rating (Normal User)
const submitRating = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const validated = getValidatedRating(req, res);
    if (!validated) return;
    const { storeId, rating } = validated;

    const store = await Store.findById(storeId);
    if (!store) {
      return res.status(404).json({
        success: false,
        message: 'Store not found.',
      });
    }

    const existingRating = await Rating.findOne({
      user: userId,
      store: storeId,
    });

    if (existingRating) {
      return res.status(409).json({
        success: false,
        message: 'You have already submitted a rating for this store. Please use the modify rating option instead.',
        existingRating: {
          id: existingRating._id,
          rating: existingRating.rating,
        },
      });
    }

    const newRating = await Rating.create({
      user: userId,
      store: storeId,
      rating: parseInt(rating, 10),
    });

    res.status(201).json({
      success: true,
      message: 'Rating submitted successfully!',
      rating: {
        id: newRating._id,
        userId: newRating.user,
        storeId: newRating.store,
        rating: newRating.rating,
      },
    });
  } catch (err) {
    next(err);
  }
};

// 2. Modify Rating (Normal User)
const modifyRating = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const validated = getValidatedRating(req, res);
    if (!validated) return;
    const { storeId, rating } = validated;

    const existingRating = await Rating.findOne({
      user: userId,
      store: storeId,
    });

    if (!existingRating) {
      return res.status(404).json({
        success: false,
        message: 'No previous rating found for this store. Please submit a new rating first.',
      });
    }

    existingRating.rating = parseInt(rating, 10);
    await existingRating.save();

    res.status(200).json({
      success: true,
      message: 'Your rating has been updated successfully!',
      rating: {
        id: existingRating._id,
        userId: existingRating.user,
        storeId: existingRating.store,
        rating: existingRating.rating,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  submitRating,
  modifyRating,
};
