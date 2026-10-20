const Theatre = require('../models/Theatre');
const Show = require('../models/Show');
const mockStore = require('../utils/mockStore');

exports.getTheatres = async (req, res, next) => {
  try {
    const { city } = req.query;

    if (global.USE_IN_MEMORY_FALLBACK) {
      let result = [...mockStore.theatres];
      if (city) {
        result = result.filter((t) => t.city.toLowerCase() === city.toLowerCase());
      }
      return res.status(200).json({
        success: true,
        count: result.length,
        theatres: result,
      });
    }

    const query = {};
    if (city) {
      query.city = { $regex: new RegExp(`^${city}$`, 'i') };
    }

    const theatres = await Theatre.find(query).sort({ name: 1 });
    res.status(200).json({ success: true, count: theatres.length, theatres });
  } catch (error) {
    next(error);
  }
};

exports.getTheatreById = async (req, res, next) => {
  try {
    if (global.USE_IN_MEMORY_FALLBACK) {
      const theatre = mockStore.theatres.find((t) => t._id.toString() === req.params.id);
      if (!theatre) return res.status(404).json({ success: false, message: 'Theatre not found' });
      const shows = mockStore.shows
        .filter((s) => s.theatre.toString() === theatre._id.toString() && s.status === 'active')
        .map((s) => ({
          ...s,
          movie: mockStore.movies.find((m) => m._id.toString() === s.movie.toString()),
        }));
      return res.status(200).json({ success: true, theatre, shows });
    }

    const theatre = await Theatre.findById(req.params.id);
    if (!theatre) return res.status(404).json({ success: false, message: 'Theatre not found' });
    const shows = await Show.find({ theatre: theatre._id, status: 'active' })
      .populate('movie', 'title poster duration rating certification')
      .sort({ showDate: 1, showTime: 1 });

    res.status(200).json({ success: true, theatre, shows });
  } catch (error) {
    next(error);
  }
};

exports.createTheatre = async (req, res, next) => {
  try {
    if (global.USE_IN_MEMORY_FALLBACK) {
      const newTheatre = {
        _id: '66b' + Math.random().toString(16).substring(2, 23),
        ...req.body,
        createdAt: new Date(),
      };
      mockStore.theatres.push(newTheatre);
      return res.status(201).json({ success: true, theatre: newTheatre, message: 'Theatre created successfully' });
    }

    const theatre = await Theatre.create(req.body);
    res.status(201).json({ success: true, theatre, message: 'Theatre created successfully' });
  } catch (error) {
    next(error);
  }
};

exports.updateTheatre = async (req, res, next) => {
  try {
    if (global.USE_IN_MEMORY_FALLBACK) {
      const idx = mockStore.theatres.findIndex((t) => t._id.toString() === req.params.id);
      if (idx === -1) return res.status(404).json({ success: false, message: 'Theatre not found' });
      mockStore.theatres[idx] = { ...mockStore.theatres[idx], ...req.body };
      return res.status(200).json({ success: true, theatre: mockStore.theatres[idx], message: 'Theatre updated successfully' });
    }

    const theatre = await Theatre.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!theatre) return res.status(404).json({ success: false, message: 'Theatre not found' });
    res.status(200).json({ success: true, theatre, message: 'Theatre updated successfully' });
  } catch (error) {
    next(error);
  }
};

exports.deleteTheatre = async (req, res, next) => {
  try {
    if (global.USE_IN_MEMORY_FALLBACK) {
      mockStore.theatres = mockStore.theatres.filter((t) => t._id.toString() !== req.params.id);
      mockStore.shows = mockStore.shows.filter((s) => s.theatre.toString() !== req.params.id);
      return res.status(200).json({ success: true, message: 'Theatre and associated shows removed successfully' });
    }

    const theatre = await Theatre.findById(req.params.id);
    if (!theatre) return res.status(404).json({ success: false, message: 'Theatre not found' });
    await Show.deleteMany({ theatre: theatre._id });
    await theatre.deleteOne();
    res.status(200).json({ success: true, message: 'Theatre and associated shows removed successfully' });
  } catch (error) {
    next(error);
  }
};
