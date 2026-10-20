const mongoose = require('mongoose');

const screenSchema = new mongoose.Schema({
  screenNumber: {
    type: Number,
    required: true,
  },
  name: {
    type: String,
    default: 'Screen 1',
  },
  capacity: {
    type: Number,
    default: 80,
  },
  screenType: {
    type: String,
    enum: ['Standard 2D', 'RealD 3D', 'IMAX 3D', '4DX', 'Dolby Cinema'],
    default: 'Standard 2D',
  },
  soundSystem: {
    type: String,
    default: 'Dolby Atmos 7.1',
  },
});

const theatreSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Theatre name is required'],
      trim: true,
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
      index: true,
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
    },
    state: {
      type: String,
      default: '',
    },
    postalCode: {
      type: String,
      default: '',
    },
    screens: [screenSchema],
    amenities: {
      type: [String],
      default: ['Dolby Atmos', 'Recliner Seats', 'Snack Bar', 'Parking', 'Wheelchair Access'],
    },
    contactPhone: {
      type: String,
      default: '+1-800-IMOVIES',
    },
    image: {
      type: String,
      default: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=800&q=80',
    },
  },
  { timestamps: true }
);

theatreSchema.index({ name: 1, city: 1 });

module.exports = mongoose.model('Theatre', theatreSchema);
