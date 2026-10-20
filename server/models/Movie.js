const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Movie title is required'],
      trim: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Movie description is required'],
    },
    genre: {
      type: [String],
      required: true,
      index: true,
    },
    language: {
      type: [String],
      required: true,
      index: true,
    },
    duration: {
      type: Number, // in minutes
      required: [true, 'Movie duration in minutes is required'],
    },
    releaseDate: {
      type: Date,
      required: true,
    },
    poster: {
      type: String,
      default: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80',
    },
    banner: {
      type: String,
      default: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=1200&q=80',
    },
    trailerUrl: {
      type: String,
      default: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    },
    rating: {
      type: Number,
      default: 8.0,
      min: 0,
      max: 10,
    },
    votes: {
      type: Number,
      default: 500,
    },
    director: {
      type: String,
      default: 'Unknown Director',
    },
    cast: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ['now_showing', 'coming_soon'],
      default: 'now_showing',
      index: true,
    },
    certification: {
      type: String,
      enum: ['U', 'UA', 'A', 'PG-13', 'R'],
      default: 'UA',
    },
  },
  { timestamps: true }
);

movieSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Movie', movieSchema);
