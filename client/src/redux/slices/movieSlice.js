import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axiosConfig';

export const fetchMovies = createAsyncThunk(
  'movies/fetchMovies',
  async (params = {}, { rejectWithValue }) => {
    try {
      const res = await api.get('/movies', { params });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch movies');
    }
  }
);

export const fetchMovieById = createAsyncThunk(
  'movies/fetchMovieById',
  async ({ id, date, city }, { rejectWithValue }) => {
    try {
      const res = await api.get(`/movies/${id}`, { params: { date, city } });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch movie details');
    }
  }
);

export const fetchFilterMeta = createAsyncThunk(
  'movies/fetchFilterMeta',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/movies/meta/filters');
      return res.data;
    } catch (err) {
      return rejectWithValue('Failed to fetch filter metadata');
    }
  }
);

const movieSlice = createSlice({
  name: 'movies',
  initialState: {
    movies: [],
    nowShowing: [],
    comingSoon: [],
    selectedMovie: null,
    theatreShows: [],
    filters: {
      search: '',
      genre: 'All',
      language: 'All',
      city: '',
      date: new Date().toISOString().split('T')[0],
      sort: 'newest',
    },
    meta: {
      genres: [],
      languages: [],
      cities: [],
    },
    total: 0,
    loading: false,
    error: null,
  },
  reducers: {
    setFilter: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = {
        search: '',
        genre: 'All',
        language: 'All',
        city: '',
        date: new Date().toISOString().split('T')[0],
        sort: 'newest',
      };
    },
    clearSelectedMovie: (state) => {
      state.selectedMovie = null;
      state.theatreShows = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Movies
      .addCase(fetchMovies.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMovies.fulfilled, (state, action) => {
        state.loading = false;
        state.movies = action.payload.movies || [];
        state.total = action.payload.total || 0;
        state.nowShowing = state.movies.filter((m) => m.status === 'now_showing');
        state.comingSoon = state.movies.filter((m) => m.status === 'coming_soon');
      })
      .addCase(fetchMovies.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Movie By Id
      .addCase(fetchMovieById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMovieById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedMovie = action.payload.movie;
        state.theatreShows = action.payload.theatreShows || [];
      })
      .addCase(fetchMovieById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Filter Meta
      .addCase(fetchFilterMeta.fulfilled, (state, action) => {
        state.meta = {
          genres: action.payload.genres || [],
          languages: action.payload.languages || [],
          cities: action.payload.cities || [],
        };
      });
  },
});

export const { setFilter, resetFilters, clearSelectedMovie } = movieSlice.actions;
export default movieSlice.reducer;
