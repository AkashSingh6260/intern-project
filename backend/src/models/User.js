const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      minlength: [20, 'Name must be at least 20 characters'],
      maxlength: [60, 'Name cannot exceed 60 characters'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      maxlength: [400, 'Address cannot exceed 400 characters'],
      trim: true,
    },
    role: {
      type: String,
      enum: ['admin', 'normal_user', 'store_owner'],
      default: 'normal_user',
    },
  },
  {
    timestamps: true,
  }
);

userSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('User', userSchema);
