const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Store name is required'],
      minlength: [20, 'Store name must be at least 20 characters'],
      maxlength: [60, 'Store name cannot exceed 60 characters'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Store email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    address: {
      type: String,
      required: [true, 'Store address is required'],
      maxlength: [400, 'Store address cannot exceed 400 characters'],
      trim: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

storeSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('Store', storeSchema);
