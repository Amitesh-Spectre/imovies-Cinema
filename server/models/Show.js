const mongoose = require('mongoose');

const seatSchema = new mongoose.Schema({
  seatNumber: {
    type: String,
    required: true,
  },
  row: {
    type: String,
    required: true,
  },
  col: {
    type: Number,
    required: true,
  },
  tier: {
    type: String,
    enum: ['Silver', 'Gold', 'Platinum', 'VIP'],
    default: 'Gold',
  },
  price: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['available', 'locked', 'booked'],
    default: 'available',
  },
  lockedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  lockedSocketId: {
    type: String,
    default: null,
  },
  lockedAt: {
    type: Date,
    default: null,
  },
  bookedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
});

const showSchema = new mongoose.Schema(
  {
    movie: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Movie',
      required: [true, 'Movie reference is required'],
      index: true,
    },
    theatre: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Theatre',
      required: [true, 'Theatre reference is required'],
      index: true,
    },
    screenNumber: {
      type: Number,
      required: true,
      default: 1,
    },
    screenName: {
      type: String,
      default: 'Audi 1',
    },
    showDate: {
      type: String, // Format: YYYY-MM-DD for fast date filtering
      required: [true, 'Show date (YYYY-MM-DD) is required'],
      index: true,
    },
    showTime: {
      type: String, // e.g. "10:30 AM", "02:15 PM", "06:45 PM", "09:30 PM"
      required: [true, 'Show time is required'],
    },
    format: {
      type: String,
      enum: ['2D', '3D', 'IMAX 3D', '4DX'],
      default: '2D',
    },
    language: {
      type: String,
      default: 'English',
    },
    pricing: {
      silver: { type: Number, default: 150 },
      gold: { type: Number, default: 220 },
      platinum: { type: Number, default: 320 },
      vip: { type: Number, default: 450 },
    },
    seats: [seatSchema],
    totalSeats: {
      type: Number,
      default: 80,
    },
    availableSeatsCount: {
      type: Number,
      default: 80,
    },
    status: {
      type: String,
      enum: ['active', 'cancelled', 'completed'],
      default: 'active',
    },
  },
  { timestamps: true }
);

showSchema.index({ movie: 1, showDate: 1, theatre: 1 });

module.exports = mongoose.model('Show', showSchema);
