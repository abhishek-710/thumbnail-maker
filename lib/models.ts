import mongoose from 'mongoose'

// User Schema
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  passwordHash: {
    type: String,
    required: true,
  },
  credits: {
    type: Number,
    default: 50,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

// Generation Schema
const generationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  prompt: {
    type: String,
    required: true,
  },
  imageUrls: [
    {
      type: String,
      required: true,
    },
  ],
  options: {
    style: String,
    size: String,
    width: Number,
    height: Number,
    platform: String,
    colorScheme: String,
    textOverlay: String,
    variations: Number,
    model: String,
  },
  creditsCost: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['completed', 'failed'],
    default: 'completed',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

// Transaction Schema
const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  credits: {
    type: Number,
    required: true,
  },
  stripeSessionId: String,
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

export const User = mongoose.models.User || mongoose.model('User', userSchema)
export const Generation = mongoose.models.Generation || mongoose.model('Generation', generationSchema)
export const Transaction = mongoose.models.Transaction || mongoose.model('Transaction', transactionSchema)
