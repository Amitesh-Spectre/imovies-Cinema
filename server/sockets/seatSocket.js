const Show = require('../models/Show');
const mockStore = require('../utils/mockStore');

const configureSeatSockets = (io) => {
  io.on('connection', (socket) => {
    // User joins a specific show room
    socket.on('join_show_room', async ({ showId, userId }) => {
      const room = `show_${showId}`;
      socket.join(room);
      socket.data = { showId, userId };

      try {
        let show;
        if (global.USE_IN_MEMORY_FALLBACK) {
          show = mockStore.shows.find((s) => s._id.toString() === showId.toString());
        } else {
          show = await Show.findById(showId);
        }

        if (show) {
          const lockedSeats = show.seats
            .filter((s) => s.status === 'locked')
            .map((s) => ({
              seatNumber: s.seatNumber,
              lockedBy: s.lockedBy,
              isMe: userId && s.lockedBy && s.lockedBy.toString() === userId.toString(),
            }));

          const bookedSeats = show.seats
            .filter((s) => s.status === 'booked')
            .map((s) => s.seatNumber);

          socket.emit('initial_seat_state', {
            showId,
            lockedSeats,
            bookedSeats,
          });
        }
      } catch (err) {
        console.error('[Socket] Error on join_show_room:', err.message);
      }
    });

    // Request to hold/lock a seat
    socket.on('seat_lock_request', async ({ showId, seatNumber, userId }) => {
      const room = `show_${showId}`;
      try {
        let show;
        if (global.USE_IN_MEMORY_FALLBACK) {
          show = mockStore.shows.find((s) => s._id.toString() === showId.toString());
        } else {
          show = await Show.findById(showId);
        }

        if (!show) {
          return socket.emit('seat_lock_failed', { seatNumber, message: 'Show not found' });
        }

        const seat = show.seats.find((s) => s.seatNumber === seatNumber);
        if (!seat) {
          return socket.emit('seat_lock_failed', { seatNumber, message: 'Invalid seat' });
        }

        if (seat.status === 'booked') {
          return socket.emit('seat_lock_failed', { seatNumber, message: 'Seat is already booked' });
        }

        const lockAgeMs = seat.lockedAt ? Date.now() - new Date(seat.lockedAt).getTime() : 0;
        const isLockExpired = lockAgeMs > 8 * 60 * 1000;

        if (
          seat.status === 'locked' &&
          !isLockExpired &&
          seat.lockedBy &&
          seat.lockedBy.toString() !== (userId || '').toString() &&
          seat.lockedSocketId !== socket.id
        ) {
          return socket.emit('seat_lock_failed', {
            seatNumber,
            message: 'Seat is temporarily held by another user',
          });
        }

        // Lock the seat
        seat.status = 'locked';
        seat.lockedBy = userId || null;
        seat.lockedSocketId = socket.id;
        seat.lockedAt = new Date();

        if (!global.USE_IN_MEMORY_FALLBACK) {
          await show.save();
        }

        // Broadcast to everyone in room
        io.to(room).emit('seat_locked', {
          seatNumber,
          lockedBy: userId,
          socketId: socket.id,
        });

        socket.emit('seat_lock_success', { seatNumber, tier: seat.tier, price: seat.price });
      } catch (err) {
        console.error('[Socket] Error in seat_lock_request:', err.message);
        socket.emit('seat_lock_failed', { seatNumber, message: err.message });
      }
    });

    // Request to unlock/unselect a seat
    socket.on('seat_unlock_request', async ({ showId, seatNumber, userId }) => {
      const room = `show_${showId}`;
      try {
        let show;
        if (global.USE_IN_MEMORY_FALLBACK) {
          show = mockStore.shows.find((s) => s._id.toString() === showId.toString());
        } else {
          show = await Show.findById(showId);
        }

        if (!show) return;

        const seat = show.seats.find((s) => s.seatNumber === seatNumber);
        if (!seat) return;

        if (
          seat.status === 'locked' &&
          (seat.lockedSocketId === socket.id ||
            (userId && seat.lockedBy && seat.lockedBy.toString() === userId.toString()))
        ) {
          seat.status = 'available';
          seat.lockedBy = null;
          seat.lockedSocketId = null;
          seat.lockedAt = null;

          if (!global.USE_IN_MEMORY_FALLBACK) {
            await show.save();
          }

          io.to(room).emit('seat_unlocked', { seatNumber });
        }
      } catch (err) {
        console.error('[Socket] Error in seat_unlock_request:', err.message);
      }
    });

    // Handle user disconnect - free any seats locked by this socket
    socket.on('disconnect', async () => {
      const { showId } = socket.data || {};
      if (!showId) return;

      try {
        let show;
        if (global.USE_IN_MEMORY_FALLBACK) {
          show = mockStore.shows.find((s) => s._id.toString() === showId.toString());
        } else {
          show = await Show.findById(showId);
        }

        if (!show) return;

        const unlockedSeats = [];
        show.seats.forEach((seat) => {
          if (seat.status === 'locked' && seat.lockedSocketId === socket.id) {
            seat.status = 'available';
            seat.lockedBy = null;
            seat.lockedSocketId = null;
            seat.lockedAt = null;
            unlockedSeats.push(seat.seatNumber);
          }
        });

        if (unlockedSeats.length > 0) {
          if (!global.USE_IN_MEMORY_FALLBACK) {
            await show.save();
          }
          io.to(`show_${showId}`).emit('seats_batch_unlocked', {
            seatNumbers: unlockedSeats,
          });
        }
      } catch (err) {
        console.error('[Socket] Error on disconnect cleanup:', err.message);
      }
    });
  });
};

module.exports = configureSeatSockets;
