const Show = require('../models/Show');
const Movie = require('../models/Movie');
const Theatre = require('../models/Theatre');
const mockStore = require('../utils/mockStore');

const generateSeatsLayout = (pricing) => {
  const rows = [
    { row: 'A', tier: 'Silver', price: pricing.silver || 150 },
    { row: 'B', tier: 'Silver', price: pricing.silver || 150 },
    { row: 'C', tier: 'Gold', price: pricing.gold || 220 },
    { row: 'D', tier: 'Gold', price: pricing.gold || 220 },
    { row: 'E', tier: 'Gold', price: pricing.gold || 220 },
    { row: 'F', tier: 'Platinum', price: pricing.platinum || 320 },
    { row: 'G', tier: 'Platinum', price: pricing.platinum || 320 },
    { row: 'H', tier: 'VIP', price: pricing.vip || 450 },
  ];

  const cols = 10;
  const seats = [];

  rows.forEach((r) => {
    for (let c = 1; c <= cols; c++) {
      seats.push({
        seatNumber: `${r.row}${c}`,
        row: r.row,
        col: c,
        tier: r.tier,
        price: r.price,
        status: 'available',
        lockedBy: null,
        lockedSocketId: null,
        lockedAt: null,
        bookedBy: null,
      });
    }
  });

  return seats;
};

exports.getShows = async (req, res, next) => {
  try {
    const { movieId, theatreId, date } = req.query;

    if (global.USE_IN_MEMORY_FALLBACK) {
      let result = mockStore.shows.filter((s) => s.status === 'active');
      if (movieId) result = result.filter((s) => s.movie.toString() === movieId);
      if (theatreId) result = result.filter((s) => s.theatre.toString() === theatreId);
      if (date) result = result.filter((s) => s.showDate === date);

      const populated = result.map((s) => ({
        ...s,
        movie: mockStore.movies.find((m) => m._id.toString() === s.movie.toString()),
        theatre: mockStore.theatres.find((t) => t._id.toString() === s.theatre.toString()),
      }));

      return res.status(200).json({ success: true, count: populated.length, shows: populated });
    }

    const query = { status: 'active' };
    if (movieId) query.movie = movieId;
    if (theatreId) query.theatre = theatreId;
    if (date) query.showDate = date;

    const shows = await Show.find(query)
      .populate('movie', 'title poster duration rating certification language')
      .populate('theatre', 'name city address')
      .sort({ showDate: 1, showTime: 1 });

    res.status(200).json({ success: true, count: shows.length, shows });
  } catch (error) {
    next(error);
  }
};

exports.getShowById = async (req, res, next) => {
  try {
    if (global.USE_IN_MEMORY_FALLBACK) {
      const show = mockStore.shows.find((s) => s._id.toString() === req.params.id);
      if (!show) return res.status(404).json({ success: false, message: 'Show not found' });

      // Clean expired locks
      const eightMinutesAgo = new Date(Date.now() - 8 * 60 * 1000);
      show.seats.forEach((seat) => {
        if (seat.status === 'locked' && seat.lockedAt && new Date(seat.lockedAt) < eightMinutesAgo) {
          seat.status = 'available';
          seat.lockedBy = null;
          seat.lockedSocketId = null;
          seat.lockedAt = null;
        }
      });
      show.availableSeatsCount = show.seats.filter((s) => s.status === 'available').length;

      const populated = {
        ...show,
        movie: mockStore.movies.find((m) => m._id.toString() === show.movie.toString()),
        theatre: mockStore.theatres.find((t) => t._id.toString() === show.theatre.toString()),
      };

      return res.status(200).json({ success: true, show: populated });
    }

    const show = await Show.findById(req.params.id).populate('movie').populate('theatre');
    if (!show) return res.status(404).json({ success: false, message: 'Show not found' });

    const eightMinutesAgo = new Date(Date.now() - 8 * 60 * 1000);
    let expiredCount = 0;

    show.seats.forEach((seat) => {
      if (seat.status === 'locked' && seat.lockedAt && seat.lockedAt < eightMinutesAgo) {
        seat.status = 'available';
        seat.lockedBy = null;
        seat.lockedSocketId = null;
        seat.lockedAt = null;
        expiredCount++;
      }
    });

    if (expiredCount > 0) {
      show.availableSeatsCount = show.seats.filter((s) => s.status === 'available').length;
      await show.save();
    }

    res.status(200).json({ success: true, show });
  } catch (error) {
    next(error);
  }
};

exports.createShow = async (req, res, next) => {
  try {
    const {
      movie,
      theatre,
      screenNumber,
      screenName,
      showDate,
      showTime,
      format,
      language,
      pricing = { silver: 150, gold: 220, platinum: 320, vip: 450 },
    } = req.body;

    const seats = generateSeatsLayout(pricing);

    if (global.USE_IN_MEMORY_FALLBACK) {
      const newShow = {
        _id: '66d' + Math.random().toString(16).substring(2, 23),
        movie,
        theatre,
        screenNumber: screenNumber || 1,
        screenName: screenName || 'Screen 1',
        showDate,
        showTime,
        format: format || '2D',
        language: language || 'English',
        pricing,
        seats,
        totalSeats: seats.length,
        availableSeatsCount: seats.length,
        status: 'active',
        createdAt: new Date(),
      };
      mockStore.shows.unshift(newShow);
      return res.status(201).json({ success: true, show: newShow, message: 'Show scheduled successfully' });
    }

    const show = await Show.create({
      movie,
      theatre,
      screenNumber: screenNumber || 1,
      screenName: screenName || 'Screen 1',
      showDate,
      showTime,
      format: format || '2D',
      language: language || 'English',
      pricing,
      seats,
      totalSeats: seats.length,
      availableSeatsCount: seats.length,
      status: 'active',
    });

    res.status(201).json({ success: true, show, message: 'Show scheduled successfully' });
  } catch (error) {
    next(error);
  }
};

exports.updateShow = async (req, res, next) => {
  try {
    if (global.USE_IN_MEMORY_FALLBACK) {
      const idx = mockStore.shows.findIndex((s) => s._id.toString() === req.params.id);
      if (idx === -1) return res.status(404).json({ success: false, message: 'Show not found' });
      mockStore.shows[idx] = { ...mockStore.shows[idx], ...req.body };
      return res.status(200).json({ success: true, show: mockStore.shows[idx], message: 'Show updated successfully' });
    }

    const show = await Show.findById(req.params.id);
    if (!show) return res.status(404).json({ success: false, message: 'Show not found' });
    Object.assign(show, req.body);
    await show.save();
    res.status(200).json({ success: true, show, message: 'Show updated successfully' });
  } catch (error) {
    next(error);
  }
};

exports.deleteShow = async (req, res, next) => {
  try {
    if (global.USE_IN_MEMORY_FALLBACK) {
      mockStore.shows = mockStore.shows.filter((s) => s._id.toString() !== req.params.id);
      return res.status(200).json({ success: true, message: 'Show removed successfully' });
    }

    const show = await Show.findById(req.params.id);
    if (!show) return res.status(404).json({ success: false, message: 'Show not found' });
    await show.deleteOne();
    res.status(200).json({ success: true, message: 'Show removed successfully' });
  } catch (error) {
    next(error);
  }
};
