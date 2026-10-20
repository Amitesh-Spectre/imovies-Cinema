const Movie = require('../models/Movie');
const Theatre = require('../models/Theatre');
const Show = require('../models/Show');
const Booking = require('../models/Booking');
const User = require('../models/User');
const mockStore = require('../utils/mockStore');

exports.getDashboardStats = async (req, res, next) => {
  try {
    if (global.USE_IN_MEMORY_FALLBACK) {
      const totalUsers = mockStore.users.filter((u) => u.role === 'user').length;
      const totalMovies = mockStore.movies.length;
      const totalTheatres = mockStore.theatres.length;
      const totalShows = mockStore.shows.filter((s) => s.status === 'active').length;
      const totalBookings = mockStore.bookings.length;

      const confirmedBookings = mockStore.bookings.filter((b) => b.bookingStatus === 'confirmed');
      const totalRevenue = confirmedBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
      const totalTicketsSold = confirmedBookings.reduce((sum, b) => sum + (b.seats ? b.seats.length : 0), 0);

      const recentBookings = mockStore.bookings.slice(0, 8).map((b) => ({
        ...b,
        user: mockStore.users.find((u) => u._id.toString() === b.user.toString()),
        movie: mockStore.movies.find((m) => m._id.toString() === b.movie.toString()),
        theatre: mockStore.theatres.find((t) => t._id.toString() === b.theatre.toString()),
      }));

      return res.status(200).json({
        success: true,
        stats: {
          totalUsers,
          totalMovies,
          totalTheatres,
          totalShows,
          totalBookings,
          totalRevenue,
          totalTicketsSold,
        },
        recentBookings,
      });
    }

    const [
      totalUsers,
      totalMovies,
      totalTheatres,
      totalShows,
      totalBookings,
      confirmedBookings,
      recentBookings,
    ] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Movie.countDocuments(),
      Theatre.countDocuments(),
      Show.countDocuments({ status: 'active' }),
      Booking.countDocuments(),
      Booking.find({ bookingStatus: 'confirmed' }),
      Booking.find()
        .populate('user', 'name email')
        .populate('movie', 'title poster')
        .populate('theatre', 'name city')
        .sort({ createdAt: -1 })
        .limit(8),
    ]);

    const totalRevenue = confirmedBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
    const totalTicketsSold = confirmedBookings.reduce((sum, b) => sum + (b.seats ? b.seats.length : 0), 0);

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalMovies,
        totalTheatres,
        totalShows,
        totalBookings,
        totalRevenue,
        totalTicketsSold,
      },
      recentBookings,
    });
  } catch (error) {
    next(error);
  }
};
