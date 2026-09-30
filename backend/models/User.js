const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Please provide your full name'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email'],
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 6,
    select: false,
  },
  userId: {
    type: String,
    unique: true,
    sparse: true,
  },
  profilePicture: {
    type: String,
    default: null,
  },
  balance: {
    type: Number,
    default: 0,
  },
  investedAmount: {
    type: Number,
    default: 0,
  },
  profit: {
    type: Number,
    default: 0,
  },
  currentPlan: {
    type: String,
    default: 'None',
  },
  bankDetails: {
    accountName: String,
    accountNumber: String,
    bankName: String,
  },
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  emailVerificationToken: String,
  emailVerificationExpire: Date,
  passwordResetToken: String,
  passwordResetExpire: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastLogin: Date,
});

// Generate unique user ID
userSchema.pre('save', async function (next) {
  if (!this.userId) {
    this.userId = `GYP-${Math.floor(10000 + Math.random() * 90000)}`;
  }
  next();
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Method to get public profile
userSchema.methods.getPublicProfile = function () {
  return {
    userId: this.userId,
    fullName: this.fullName,
    email: this.email,
    balance: this.balance,
    investedAmount: this.investedAmount,
    profit: this.profit,
    currentPlan: this.currentPlan,
    profilePicture: this.profilePicture,
    createdAt: this.createdAt,
  };
};

module.exports = mongoose.model('User', userSchema);
