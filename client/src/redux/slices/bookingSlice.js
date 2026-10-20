import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axiosConfig';

export const fetchShowDetails = createAsyncThunk(
  'booking/fetchShowDetails',
  async (showId, { rejectWithValue }) => {
    try {
      const res = await api.get(`/shows/${showId}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch show details');
    }
  }
);

export const confirmBooking = createAsyncThunk(
  'booking/confirmBooking',
  async ({ showId, seatNumbers, paymentMethod }, { rejectWithValue }) => {
    try {
      const res = await api.post('/bookings', { showId, seatNumbers, paymentMethod });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Booking confirmation failed');
    }
  }
);

const calculatePricing = (seats) => {
  const subtotal = seats.reduce((sum, s) => sum + (s.price || 0), 0);
  const convenienceFee = seats.length > 0 ? 30 : 0;
  const tax = Math.round(subtotal * 0.05);
  const totalAmount = subtotal + convenienceFee + tax;
  return { subtotal, convenienceFee, tax, totalAmount };
};

const bookingSlice = createSlice({
  name: 'booking',
  initialState: {
    currentShow: null,
    seatsGrid: [],
    selectedSeats: [], // [{ seatNumber, tier, price }]
    lockedSeatsByOthers: [], // ['A1', 'B2']
    bookedSeats: [],
    pricing: {
      subtotal: 0,
      convenienceFee: 0,
      tax: 0,
      totalAmount: 0,
    },
    latestBooking: null,
    loading: false,
    error: null,
  },
  reducers: {
    toggleSelectSeat: (state, action) => {
      const { seatNumber, tier, price } = action.payload;
      const index = state.selectedSeats.findIndex((s) => s.seatNumber === seatNumber);

      if (index >= 0) {
        state.selectedSeats.splice(index, 1);
      } else {
        // Max 8 tickets per transaction
        if (state.selectedSeats.length >= 8) return;
        state.selectedSeats.push({ seatNumber, tier, price });
      }

      state.pricing = calculatePricing(state.selectedSeats);
    },
    clearSelectedSeats: (state) => {
      state.selectedSeats = [];
      state.pricing = calculatePricing([]);
    },
    setInitialSeatState: (state, action) => {
      const { lockedSeats = [], bookedSeats = [] } = action.payload;
      state.lockedSeatsByOthers = lockedSeats.filter((s) => !s.isMe).map((s) => s.seatNumber);
      state.bookedSeats = bookedSeats;
    },
    socketSeatLocked: (state, action) => {
      const { seatNumber, lockedBy, currentUserId } = action.payload;
      if (lockedBy && lockedBy.toString() !== (currentUserId || '').toString()) {
        if (!state.lockedSeatsByOthers.includes(seatNumber)) {
          state.lockedSeatsByOthers.push(seatNumber);
        }
      }
    },
    socketSeatUnlocked: (state, action) => {
      const { seatNumber } = action.payload;
      state.lockedSeatsByOthers = state.lockedSeatsByOthers.filter((s) => s !== seatNumber);
    },
    socketSeatsBatchUnlocked: (state, action) => {
      const { seatNumbers = [] } = action.payload;
      state.lockedSeatsByOthers = state.lockedSeatsByOthers.filter((s) => !seatNumbers.includes(s));
    },
    socketSeatsBooked: (state, action) => {
      const { seatNumbers = [] } = action.payload;
      seatNumbers.forEach((s) => {
        if (!state.bookedSeats.includes(s)) {
          state.bookedSeats.push(s);
        }
      });
      // Remove from selected or locked
      state.selectedSeats = state.selectedSeats.filter((s) => !seatNumbers.includes(s.seatNumber));
      state.lockedSeatsByOthers = state.lockedSeatsByOthers.filter((s) => !seatNumbers.includes(s));
      state.pricing = calculatePricing(state.selectedSeats);
    },
    socketSeatsReleased: (state, action) => {
      const { seatNumbers = [] } = action.payload;
      state.bookedSeats = state.bookedSeats.filter((s) => !seatNumbers.includes(s));
    },
    resetBookingState: (state) => {
      state.currentShow = null;
      state.seatsGrid = [];
      state.selectedSeats = [];
      state.lockedSeatsByOthers = [];
      state.bookedSeats = [];
      state.pricing = calculatePricing([]);
      state.latestBooking = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Show Details
      .addCase(fetchShowDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchShowDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.currentShow = action.payload.show;
        state.seatsGrid = action.payload.show.seats || [];
        state.bookedSeats = state.seatsGrid
          .filter((s) => s.status === 'booked')
          .map((s) => s.seatNumber);
        state.lockedSeatsByOthers = state.seatsGrid
          .filter((s) => s.status === 'locked')
          .map((s) => s.seatNumber);
      })
      .addCase(fetchShowDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Confirm Booking
      .addCase(confirmBooking.pending, (state) => {
        state.loading = true;
      })
      .addCase(confirmBooking.fulfilled, (state, action) => {
        state.loading = false;
        state.latestBooking = action.payload.booking;
        state.selectedSeats = [];
        state.pricing = calculatePricing([]);
      })
      .addCase(confirmBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  toggleSelectSeat,
  clearSelectedSeats,
  setInitialSeatState,
  socketSeatLocked,
  socketSeatUnlocked,
  socketSeatsBatchUnlocked,
  socketSeatsBooked,
  socketSeatsReleased,
  resetBookingState,
} = bookingSlice.actions;

export default bookingSlice.reducer;
