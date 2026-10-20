const Booking = require('../models/Booking');
const Show = require('../models/Show');
const Payment = require('../models/Payment');
const Notification = require('../models/Notification');
const mockStore = require('../utils/mockStore');

const generateBookingId = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'IMV-';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

exports.createBooking = async (req, res, next) => {
  try {
    const { showId, seatNumbers, paymentMethod = 'Credit Card' } = req.body;

    if (!showId || !seatNumbers || !seatNumbers.length) {
      return res.status(400).json({
        success: false,
        message: 'Please provide show ID and select at least one seat',
      });
    }

    if (global.USE_IN_MEMORY_FALLBACK) {
      const show = mockStore.shows.find((s) => s._id.toString() === showId.toString());
      if (!show) return res.status(404).json({ success: false, message: 'Show not found' });

      const movie = mockStore.movies.find((m) => m._id.toString() === show.movie.toString());
      const theatre = mockStore.theatres.find((t) => t._id.toString() === show.theatre.toString());

      const bookedSeatsData = [];
      let subtotal = 0;

      for (const seatNum of seatNumbers) {
        const seat = show.seats.find((s) => s.seatNumber === seatNum);
        if (!seat) {
          return res.status(400).json({ success: false, message: `Seat ${seatNum} does not exist` });
        }
        if (seat.status === 'booked') {
          return res.status(400).json({ success: false, message: `Seat ${seatNum} is already booked` });
        }

        bookedSeatsData.push({
          seatNumber: seat.seatNumber,
          tier: seat.tier,
          price: seat.price,
        });
        subtotal += seat.price;
      }

      const convenienceFee = 30;
      const tax = Math.round(subtotal * 0.05);
      const totalAmount = subtotal + convenienceFee + tax;
      const bookingId = generateBookingId();
      const transactionId = 'TXN-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 6).toUpperCase();

      // Mark seats booked
      show.seats.forEach((seat) => {
        if (seatNumbers.includes(seat.seatNumber)) {
          seat.status = 'booked';
          seat.bookedBy = req.user._id;
          seat.lockedBy = null;
          seat.lockedSocketId = null;
          seat.lockedAt = null;
        }
      });
      show.availableSeatsCount = show.seats.filter((s) => s.status === 'available').length;

      const newBooking = {
        _id: '66e' + Math.random().toString(16).substring(2, 23),
        bookingId,
        user: req.user._id,
        show: show._id,
        movie: movie._id,
        theatre: theatre._id,
        seats: bookedSeatsData,
        subtotal,
        convenienceFee,
        tax,
        totalAmount,
        bookingStatus: 'confirmed',
        paymentStatus: 'paid',
        paymentMethod,
        transactionId,
        qrCode: `IMOVIES-VERIFY-${bookingId}-${req.user._id}`,
        createdAt: new Date(),
      };
      mockStore.bookings.unshift(newBooking);

      mockStore.payments.unshift({
        _id: '66f' + Math.random().toString(16).substring(2, 23),
        transactionId,
        booking: newBooking._id,
        user: req.user._id,
        amount: totalAmount,
        currency: 'USD',
        paymentMethod,
        status: 'success',
        createdAt: new Date(),
      });

      mockStore.notifications.unshift({
        _id: '660' + Math.random().toString(16).substring(2, 23),
        user: req.user._id,
        title: 'Ticket Booking Confirmed! 🍿',
        message: `Your booking ${bookingId} for ${movie.title} at ${theatre.name} (${show.showTime}) is confirmed.`,
        type: 'booking',
        bookingId,
        read: false,
        createdAt: new Date(),
      });

      const io = req.app.get('io');
      if (io) {
        io.to(`show_${show._id}`).emit('seats_booked', {
          showId: show._id,
          seatNumbers,
          availableSeatsCount: show.availableSeatsCount,
        });
      }

      return res.status(201).json({
        success: true,
        booking: {
          ...newBooking,
          movie,
          theatre,
          show: {
            showDate: show.showDate,
            showTime: show.showTime,
            screenNumber: show.screenNumber,
            screenName: show.screenName,
            format: show.format,
          },
        },
        message: 'Tickets booked successfully!',
      });
    }

    const show = await Show.findById(showId).populate('movie theatre');
    if (!show) return res.status(404).json({ success: false, message: 'Show not found' });

    const bookedSeatsData = [];
    let subtotal = 0;

    for (const seatNum of seatNumbers) {
      const seat = show.seats.find((s) => s.seatNumber === seatNum);
      if (!seat) {
        return res.status(400).json({ success: false, message: `Seat ${seatNum} does not exist` });
      }
      if (seat.status === 'booked') {
        return res.status(400).json({ success: false, message: `Seat ${seatNum} is already booked` });
      }
      bookedSeatsData.push({
        seatNumber: seat.seatNumber,
        tier: seat.tier,
        price: seat.price,
      });
      subtotal += seat.price;
    }

    const convenienceFee = 30;
    const tax = Math.round(subtotal * 0.05);
    const totalAmount = subtotal + convenienceFee + tax;
    const bookingId = generateBookingId();
    const transactionId = 'TXN-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 6).toUpperCase();

    show.seats.forEach((seat) => {
      if (seatNumbers.includes(seat.seatNumber)) {
        seat.status = 'booked';
        seat.bookedBy = req.user._id;
        seat.lockedBy = null;
        seat.lockedSocketId = null;
        seat.lockedAt = null;
      }
    });
    show.availableSeatsCount = show.seats.filter((s) => s.status === 'available').length;
    await show.save();

    const booking = await Booking.create({
      bookingId,
      user: req.user._id,
      show: show._id,
      movie: show.movie._id,
      theatre: show.theatre._id,
      seats: bookedSeatsData,
      subtotal,
      convenienceFee,
      tax,
      totalAmount,
      bookingStatus: 'confirmed',
      paymentStatus: 'paid',
      paymentMethod,
      transactionId,
      qrCode: `IMOVIES-VERIFY-${bookingId}-${req.user._id}`,
    });

    await Payment.create({
      transactionId,
      booking: booking._id,
      user: req.user._id,
      amount: totalAmount,
      currency: 'USD',
      paymentMethod,
      status: 'success',
    });

    await Notification.create({
      user: req.user._id,
      title: 'Ticket Booking Confirmed! 🍿',
      message: `Your booking ${bookingId} for ${show.movie.title} at ${show.theatre.name} (${show.showTime}) is confirmed.`,
      type: 'booking',
      bookingId,
    });

    const io = req.app.get('io');
    if (io) {
      io.to(`show_${show._id}`).emit('seats_booked', {
        showId: show._id,
        seatNumbers,
        availableSeatsCount: show.availableSeatsCount,
      });
    }

    const populatedBooking = await Booking.findById(booking._id)
      .populate('movie', 'title poster duration rating certification language')
      .populate('theatre', 'name city address amenities')
      .populate('show', 'showDate showTime screenNumber screenName format');

    res.status(201).json({
      success: true,
      booking: populatedBooking,
      message: 'Tickets booked successfully!',
    });
  } catch (error) {
    next(error);
  }
};

exports.getMyBookings = async (req, res, next) => {
  try {
    if (global.USE_IN_MEMORY_FALLBACK) {
      const userBookings = mockStore.bookings
        .filter((b) => b.user.toString() === req.user._id.toString())
        .map((b) => ({
          ...b,
          movie: mockStore.movies.find((m) => m._id.toString() === b.movie.toString()),
          theatre: mockStore.theatres.find((t) => t._id.toString() === b.theatre.toString()),
          show: mockStore.shows.find((s) => s._id.toString() === b.show.toString()),
        }));

      const todayStr = new Date().toISOString().split('T')[0];
      const upcoming = [];
      const past = [];

      userBookings.forEach((b) => {
        const showDate = b.show?.showDate || '';
        if (b.bookingStatus === 'cancelled' || showDate < todayStr) {
          past.push(b);
        } else {
          upcoming.push(b);
        }
      });

      return res.status(200).json({
        success: true,
        count: userBookings.length,
        upcoming,
        past,
        all: userBookings,
      });
    }

    const bookings = await Booking.find({ user: req.user._id })
      .populate('movie', 'title poster duration rating certification')
      .populate('theatre', 'name city address')
      .populate('show', 'showDate showTime screenNumber screenName format')
      .sort({ createdAt: -1 });

    const todayStr = new Date().toISOString().split('T')[0];
    const upcoming = [];
    const past = [];

    bookings.forEach((b) => {
      const showDate = b.show?.showDate || '';
      if (b.bookingStatus === 'cancelled' || showDate < todayStr) {
        past.push(b);
      } else {
        upcoming.push(b);
      }
    });

    res.status(200).json({
      success: true,
      count: bookings.length,
      upcoming,
      past,
      all: bookings,
    });
  } catch (error) {
    next(error);
  }
};

exports.getBookingById = async (req, res, next) => {
  try {
    if (global.USE_IN_MEMORY_FALLBACK) {
      const booking = mockStore.bookings.find((b) => b._id.toString() === req.params.id);
      if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

      const populated = {
        ...booking,
        movie: mockStore.movies.find((m) => m._id.toString() === booking.movie.toString()),
        theatre: mockStore.theatres.find((t) => t._id.toString() === booking.theatre.toString()),
        show: mockStore.shows.find((s) => s._id.toString() === booking.show.toString()),
        user: mockStore.users.find((u) => u._id.toString() === booking.user.toString()),
      };

      return res.status(200).json({ success: true, booking: populated });
    }

    const booking = await Booking.findById(req.params.id)
      .populate('movie')
      .populate('theatre')
      .populate('show')
      .populate('user', 'name email phone');

    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    res.status(200).json({ success: true, booking });
  } catch (error) {
    next(error);
  }
};

exports.cancelBooking = async (req, res, next) => {
  try {
    if (global.USE_IN_MEMORY_FALLBACK) {
      const booking = mockStore.bookings.find((b) => b._id.toString() === req.params.id);
      if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
      if (booking.bookingStatus === 'cancelled') {
        return res.status(400).json({ success: false, message: 'Booking is already cancelled' });
      }

      booking.bookingStatus = 'cancelled';
      booking.paymentStatus = 'refunded';
      booking.cancelledAt = new Date();
      booking.cancellationReason = req.body.reason || 'User requested cancellation';

      // Release seats
      const show = mockStore.shows.find((s) => s._id.toString() === booking.show.toString());
      if (show) {
        const seatNumbersToRelease = booking.seats.map((s) => s.seatNumber);
        show.seats.forEach((seat) => {
          if (seatNumbersToRelease.includes(seat.seatNumber)) {
            seat.status = 'available';
            seat.bookedBy = null;
            seat.lockedBy = null;
            seat.lockedSocketId = null;
            seat.lockedAt = null;
          }
        });
        show.availableSeatsCount = show.seats.filter((s) => s.status === 'available').length;

        const io = req.app.get('io');
        if (io) {
          io.to(`show_${show._id}`).emit('seats_released', {
            showId: show._id,
            seatNumbers: seatNumbersToRelease,
            availableSeatsCount: show.availableSeatsCount,
          });
        }
      }

      mockStore.notifications.unshift({
        _id: '660' + Math.random().toString(16).substring(2, 23),
        user: booking.user,
        title: 'Booking Cancelled & Refund Initiated',
        message: `Your booking ${booking.bookingId} has been cancelled. Refund of $${booking.totalAmount} has been processed.`,
        type: 'cancellation',
        bookingId: booking.bookingId,
        read: false,
        createdAt: new Date(),
      });

      return res.status(200).json({ success: true, booking, message: 'Booking cancelled successfully. Refund initiated.' });
    }

    const booking = await Booking.findById(req.params.id).populate('show movie theatre');
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (booking.bookingStatus === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Booking is already cancelled' });
    }

    booking.bookingStatus = 'cancelled';
    booking.paymentStatus = 'refunded';
    booking.cancelledAt = new Date();
    booking.cancellationReason = req.body.reason || 'User requested cancellation';
    await booking.save();

    const seatNumbersToRelease = booking.seats.map((s) => s.seatNumber);
    const show = await Show.findById(booking.show._id);
    if (show) {
      show.seats.forEach((seat) => {
        if (seatNumbersToRelease.includes(seat.seatNumber)) {
          seat.status = 'available';
          seat.bookedBy = null;
          seat.lockedBy = null;
          seat.lockedSocketId = null;
          seat.lockedAt = null;
        }
      });
      show.availableSeatsCount = show.seats.filter((s) => s.status === 'available').length;
      await show.save();

      const io = req.app.get('io');
      if (io) {
        io.to(`show_${show._id}`).emit('seats_released', {
          showId: show._id,
          seatNumbers: seatNumbersToRelease,
          availableSeatsCount: show.availableSeatsCount,
        });
      }
    }

    await Payment.findOneAndUpdate({ booking: booking._id }, { status: 'refunded' });

    await Notification.create({
      user: booking.user,
      title: 'Booking Cancelled & Refund Initiated',
      message: `Your booking ${booking.bookingId} for ${booking.movie.title} has been cancelled. Refund of $${booking.totalAmount} has been processed.`,
      type: 'cancellation',
      bookingId: booking.bookingId,
    });

    res.status(200).json({
      success: true,
      booking,
      message: 'Booking cancelled successfully. Refund initiated.',
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllBookingsAdmin = async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;

    if (global.USE_IN_MEMORY_FALLBACK) {
      let result = mockStore.bookings.map((b) => ({
        ...b,
        user: mockStore.users.find((u) => u._id.toString() === b.user.toString()),
        movie: mockStore.movies.find((m) => m._id.toString() === b.movie.toString()),
        theatre: mockStore.theatres.find((t) => t._id.toString() === b.theatre.toString()),
        show: mockStore.shows.find((s) => s._id.toString() === b.show.toString()),
      }));

      if (status && status !== 'all') {
        result = result.filter((b) => b.bookingStatus === status);
      }
      if (search && search.trim() !== '') {
        result = result.filter((b) => b.bookingId.toLowerCase().includes(search.trim().toLowerCase()));
      }

      const pageNum = parseInt(page, 10) || 1;
      const limitNum = parseInt(limit, 10) || 20;
      const total = result.length;
      const paginated = result.slice((pageNum - 1) * limitNum, pageNum * limitNum);

      return res.status(200).json({
        success: true,
        count: paginated.length,
        total,
        totalPages: Math.ceil(total / limitNum) || 1,
        currentPage: pageNum,
        bookings: paginated,
      });
    }

    const query = {};
    if (status && status !== 'all') query.bookingStatus = status;
    if (search && search.trim() !== '') query.bookingId = { $regex: search.trim(), $options: 'i' };

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const total = await Booking.countDocuments(query);
    const bookings = await Booking.find(query)
      .populate('user', 'name email phone')
      .populate('movie', 'title poster')
      .populate('theatre', 'name city')
      .populate('show', 'showDate showTime screenNumber')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: bookings.length,
      total,
      totalPages: Math.ceil(total / limitNum) || 1,
      currentPage: pageNum,
      bookings,
    });
  } catch (error) {
    next(error);
  }
};
