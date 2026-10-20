const Movie = require('../models/Movie');
const Show = require('../models/Show');
const Theatre = require('../models/Theatre');
const mockStore = require('../utils/mockStore');

exports.getMovies = async (req, res, next) => {
  try {
    const {
      search,
      genre,
      language,
      status,
      city,
      theatreId,
      date,
      sort,
      page = 1,
      limit = 12,
    } = req.query;

    if (global.USE_IN_MEMORY_FALLBACK) {
      let result = [...mockStore.movies];

      if (status) {
        result = result.filter((m) => m.status === status);
      }

      if (search && search.trim() !== '') {
        const s = search.trim().toLowerCase();
        result = result.filter(
          (m) =>
            m.title.toLowerCase().includes(s) ||
            m.description.toLowerCase().includes(s) ||
            m.director.toLowerCase().includes(s) ||
            m.cast.some((c) => c.toLowerCase().includes(s))
        );
      }

      if (genre && genre !== 'All') {
        result = result.filter((m) => m.genre.some((g) => g.toLowerCase() === genre.toLowerCase()));
      }

      if (language && language !== 'All') {
        result = result.filter((m) => m.language.some((l) => l.toLowerCase() === language.toLowerCase()));
      }

      // Filter by city, theatre, or date via shows
      if (theatreId || city || date) {
        let matchingShows = [...mockStore.shows];
        if (theatreId) matchingShows = matchingShows.filter((s) => s.theatre.toString() === theatreId);
        if (date) matchingShows = matchingShows.filter((s) => s.showDate === date);
        if (city) {
          const theatresInCity = mockStore.theatres
            .filter((t) => t.city.toLowerCase() === city.toLowerCase())
            .map((t) => t._id.toString());
          matchingShows = matchingShows.filter((s) => theatresInCity.includes(s.theatre.toString()));
        }
        const activeMovieIds = matchingShows.map((s) => s.movie.toString());
        result = result.filter((m) => activeMovieIds.includes(m._id.toString()));
      }

      if (sort === 'rating_desc') result.sort((a, b) => b.rating - a.rating);
      else if (sort === 'rating_asc') result.sort((a, b) => a.rating - b.rating);
      else if (sort === 'title_asc') result.sort((a, b) => a.title.localeCompare(b.title));
      else if (sort === 'title_desc') result.sort((a, b) => b.title.localeCompare(a.title));
      else result.sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate));

      const pageNum = parseInt(page, 10) || 1;
      const limitNum = parseInt(limit, 10) || 12;
      const total = result.length;
      const paginated = result.slice((pageNum - 1) * limitNum, pageNum * limitNum);

      return res.status(200).json({
        success: true,
        count: paginated.length,
        total,
        totalPages: Math.ceil(total / limitNum) || 1,
        currentPage: pageNum,
        movies: paginated,
      });
    }

    const query = {};
    if (status) query.status = status;
    if (search && search.trim() !== '') {
      query.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
        { director: { $regex: search.trim(), $options: 'i' } },
        { cast: { $elemMatch: { $regex: search.trim(), $options: 'i' } } },
      ];
    }
    if (genre && genre !== 'All') query.genre = { $in: [new RegExp(genre, 'i')] };
    if (language && language !== 'All') query.language = { $in: [new RegExp(language, 'i')] };

    if (theatreId || city || date) {
      const showQuery = { status: 'active' };
      if (theatreId) showQuery.theatre = theatreId;
      if (date) showQuery.showDate = date;
      if (city) {
        const theatresInCity = await Theatre.find({
          city: { $regex: new RegExp(`^${city}$`, 'i') },
        }).select('_id');
        showQuery.theatre = { $in: theatresInCity.map((t) => t._id) };
      }
      const activeShows = await Show.find(showQuery).distinct('movie');
      query._id = { $in: activeShows };
    }

    let sortOption = { releaseDate: -1 };
    if (sort === 'rating_desc') sortOption = { rating: -1 };
    if (sort === 'rating_asc') sortOption = { rating: 1 };
    if (sort === 'title_asc') sortOption = { title: 1 };
    if (sort === 'title_desc') sortOption = { title: -1 };

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 12;
    const skip = (pageNum - 1) * limitNum;

    const total = await Movie.countDocuments(query);
    const movies = await Movie.find(query).sort(sortOption).skip(skip).limit(limitNum);

    res.status(200).json({
      success: true,
      count: movies.length,
      total,
      totalPages: Math.ceil(total / limitNum) || 1,
      currentPage: pageNum,
      movies,
    });
  } catch (error) {
    next(error);
  }
};

exports.getMovieById = async (req, res, next) => {
  try {
    const { date, city } = req.query;
    const today = new Date().toISOString().split('T')[0];
    const targetDate = date || today;

    if (global.USE_IN_MEMORY_FALLBACK) {
      const movie = mockStore.movies.find((m) => m._id.toString() === req.params.id);
      if (!movie) {
        return res.status(404).json({ success: false, message: 'Movie not found' });
      }

      let matchingShows = mockStore.shows.filter(
        (s) => s.movie.toString() === movie._id.toString() && s.showDate === targetDate && s.status === 'active'
      );

      if (city) {
        const theatresInCity = mockStore.theatres
          .filter((t) => t.city.toLowerCase() === city.toLowerCase())
          .map((t) => t._id.toString());
        matchingShows = matchingShows.filter((s) => theatresInCity.includes(s.theatre.toString()));
      }

      const theatreMap = {};
      matchingShows.forEach((s) => {
        const tId = s.theatre.toString();
        const theatre = mockStore.theatres.find((t) => t._id.toString() === tId);
        if (!theatre) return;
        if (!theatreMap[tId]) {
          theatreMap[tId] = {
            theatre,
            shows: [],
          };
        }
        theatreMap[tId].shows.push({
          _id: s._id,
          screenNumber: s.screenNumber,
          screenName: s.screenName,
          showDate: s.showDate,
          showTime: s.showTime,
          format: s.format,
          language: s.language,
          pricing: s.pricing,
          availableSeatsCount: s.availableSeatsCount,
          totalSeats: s.totalSeats,
        });
      });

      return res.status(200).json({
        success: true,
        movie,
        theatreShows: Object.values(theatreMap),
      });
    }

    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({ success: false, message: 'Movie not found' });
    }

    const showFilter = {
      movie: movie._id,
      showDate: targetDate,
      status: 'active',
    };

    if (city) {
      const theatres = await Theatre.find({
        city: { $regex: new RegExp(`^${city}$`, 'i') },
      }).select('_id');
      showFilter.theatre = { $in: theatres.map((t) => t._id) };
    }

    const shows = await Show.find(showFilter)
      .populate('theatre', 'name city address amenities contactPhone')
      .sort({ showTime: 1 });

    const theatreMap = {};
    shows.forEach((show) => {
      if (!show.theatre) return;
      const tId = show.theatre._id.toString();
      if (!theatreMap[tId]) {
        theatreMap[tId] = {
          theatre: show.theatre,
          shows: [],
        };
      }
      theatreMap[tId].shows.push({
        _id: show._id,
        screenNumber: show.screenNumber,
        screenName: show.screenName,
        showDate: show.showDate,
        showTime: show.showTime,
        format: show.format,
        language: show.language,
        pricing: show.pricing,
        availableSeatsCount: show.availableSeatsCount,
        totalSeats: show.totalSeats,
      });
    });

    res.status(200).json({
      success: true,
      movie,
      theatreShows: Object.values(theatreMap),
    });
  } catch (error) {
    next(error);
  }
};

exports.createMovie = async (req, res, next) => {
  try {
    if (global.USE_IN_MEMORY_FALLBACK) {
      const newMovie = {
        _id: '66c' + Math.random().toString(16).substring(2, 23),
        ...req.body,
        createdAt: new Date(),
      };
      mockStore.movies.unshift(newMovie);
      return res.status(201).json({ success: true, movie: newMovie, message: 'Movie added successfully' });
    }

    const movie = await Movie.create(req.body);
    res.status(201).json({ success: true, movie, message: 'Movie added successfully' });
  } catch (error) {
    next(error);
  }
};

exports.updateMovie = async (req, res, next) => {
  try {
    if (global.USE_IN_MEMORY_FALLBACK) {
      const idx = mockStore.movies.findIndex((m) => m._id.toString() === req.params.id);
      if (idx === -1) return res.status(404).json({ success: false, message: 'Movie not found' });
      mockStore.movies[idx] = { ...mockStore.movies[idx], ...req.body };
      return res.status(200).json({ success: true, movie: mockStore.movies[idx], message: 'Movie updated successfully' });
    }

    const movie = await Movie.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!movie) return res.status(404).json({ success: false, message: 'Movie not found' });
    res.status(200).json({ success: true, movie, message: 'Movie updated successfully' });
  } catch (error) {
    next(error);
  }
};

exports.deleteMovie = async (req, res, next) => {
  try {
    if (global.USE_IN_MEMORY_FALLBACK) {
      mockStore.movies = mockStore.movies.filter((m) => m._id.toString() !== req.params.id);
      mockStore.shows = mockStore.shows.filter((s) => s.movie.toString() !== req.params.id);
      return res.status(200).json({ success: true, message: 'Movie and associated shows removed successfully' });
    }

    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.status(404).json({ success: false, message: 'Movie not found' });
    await Show.deleteMany({ movie: movie._id });
    await movie.deleteOne();
    res.status(200).json({ success: true, message: 'Movie and associated shows removed successfully' });
  } catch (error) {
    next(error);
  }
};

exports.getMovieFiltersMeta = async (req, res, next) => {
  try {
    if (global.USE_IN_MEMORY_FALLBACK) {
      const genres = [...new Set(mockStore.movies.flatMap((m) => m.genre))];
      const languages = [...new Set(mockStore.movies.flatMap((m) => m.language))];
      const cities = [...new Set(mockStore.theatres.map((t) => t.city))];
      return res.status(200).json({ success: true, genres, languages, cities });
    }

    const genres = await Movie.distinct('genre');
    const languages = await Movie.distinct('language');
    const cities = await Theatre.distinct('city');
    res.status(200).json({ success: true, genres, languages, cities });
  } catch (error) {
    next(error);
  }
};
