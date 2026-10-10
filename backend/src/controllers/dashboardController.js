const { User, Store, Rating } = require('../models');

// 1. Admin Dashboard Stats
const getAdminStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalStores = await Store.countDocuments();
    const totalRatings = await Rating.countDocuments();

    const normalUsersCount = await User.countDocuments({ role: 'normal_user' });
    const adminUsersCount = await User.countDocuments({ role: 'admin' });
    const storeOwnersCount = await User.countDocuments({ role: 'store_owner' });

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalStores,
        totalRatings,
        roleBreakdown: {
          normalUsers: normalUsersCount,
          admins: adminUsersCount,
          storeOwners: storeOwnersCount,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

// 2. Store Owner Dashboard
const getStoreOwnerDashboard = async (req, res, next) => {
  try {
    const ownerId = req.user._id || req.user.id;

    const store = await Store.findOne({ owner: ownerId });

    if (!store) {
      return res.status(200).json({
        success: true,
        hasStore: false,
        message: 'No store is currently associated with this store owner account.',
        store: null,
      });
    }

    const ratings = await Rating.find({ store: store._id }).populate('user', 'name email address');
    const totalRatings = ratings.length;
    const ratingSum = ratings.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = totalRatings > 0 ? parseFloat((ratingSum / totalRatings).toFixed(1)) : 0;

    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    ratings.forEach((r) => {
      if (distribution[r.rating] !== undefined) {
        distribution[r.rating]++;
      }
    });

    const reviewersList = ratings.map((r) => ({
      id: r._id,
      ratingId: r._id,
      rating: r.rating,
      createdAt: r.createdAt,
      userName: r.user ? r.user.name : 'Unknown User',
      user: {
        id: r.user ? r.user._id : null,
        name: r.user ? r.user.name : 'Unknown User',
        email: r.user ? r.user.email : 'N/A',
        address: r.user ? r.user.address : 'N/A',
      },
    }));

    reviewersList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.status(200).json({
      success: true,
      hasStore: true,
      store: {
        id: store._id,
        name: store.name,
        email: store.email,
        address: store.address,
        averageRating,
        totalRatings,
        distribution,
        ratingDistribution: distribution,
        reviewers: reviewersList,
        ratings: reviewersList,
      },
      ratings: reviewersList,
      ratingDistribution: distribution,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAdminStats,
  getStoreOwnerDashboard,
};
