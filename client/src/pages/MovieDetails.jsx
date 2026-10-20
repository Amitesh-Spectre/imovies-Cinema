import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMovieById } from '../redux/slices/movieSlice';
import {
  Star,
  Clock,
  Calendar,
  MapPin,
  Play,
  Volume2,
  Tv,
  Users,
  Film,
  Sparkles,
} from 'lucide-react';

const MovieDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { selectedMovie: movie, theatreShows = [], loading } = useSelector(
    (state) => state.movies
  );

  // Generate 4 consecutive dates for the date picker
  const generateDates = () => {
    const dates = [];
    for (let i = 0; i < 4; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const isoStr = d.toISOString().split('T')[0];
      const dayName = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short' });
      const formatted = d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
      dates.push({ iso: isoStr, label: dayName, subLabel: formatted });
    }
    return dates;
  };

  const datesList = generateDates();
  const [selectedDate, setSelectedDate] = useState(datesList[0].iso);
  const city = localStorage.getItem('imovies_city') || 'Mumbai';

  useEffect(() => {
    if (id) {
      dispatch(fetchMovieById({ id, date: selectedDate, city }));
    }
  }, [id, selectedDate, city, dispatch]);

  const handleShowClick = (showId) => {
    navigate(`/shows/${showId}/book`);
  };

  if (loading && !movie) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 text-danger">
        <div className="spinner-border" role="status"></div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="container py-5 text-center text-white">
        <h3>Movie not found</h3>
      </div>
    );
  }

  return (
    <div className="pb-5">
      {/* Hero Backdrop Header */}
      <div
        className="position-relative py-5"
        style={{
          background: `linear-gradient(to bottom, rgba(11, 15, 25, 0.8) 0%, rgba(11, 15, 25, 0.98) 100%), url(${movie.banner || movie.poster}) center/cover no-repeat`,
          minHeight: '420px',
        }}
      >
        <div className="container">
          <div className="row g-4 align-items-center">
            {/* Poster Column */}
            <div className="col-lg-3 col-md-4 text-center text-md-start">
              <div
                className="movie-poster-box shadow-lg"
                style={{ maxWidth: '280px', margin: '0 auto', border: '1px solid rgba(255, 255, 255, 0.15)' }}
              >
                <img src={movie.poster} alt={movie.title} />
              </div>
            </div>

            {/* Movie Info Column */}
            <div className="col-lg-9 col-md-8">
              <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
                <span className="badge bg-danger px-2 py-1">{movie.certification || 'UA'}</span>
                <span className="badge bg-dark border border-secondary px-2 py-1">
                  {movie.language?.join(', ')}
                </span>
                <span className="badge bg-secondary bg-opacity-25 text-light px-2 py-1">
                  {movie.status === 'now_showing' ? 'NOW SHOWING' : 'COMING SOING'}
                </span>
              </div>

              <h1 className="text-white fw-bold display-5 mb-2">{movie.title}</h1>

              {/* Rating & Runtime */}
              <div className="d-flex flex-wrap align-items-center gap-4 text-white-50 mb-3 small">
                <div className="d-flex align-items-center gap-1 text-warning fw-bold fs-6">
                  <Star size={18} fill="#ffd700" color="#ffd700" />
                  <span>{movie.rating ? movie.rating.toFixed(1) : '8.5'}/10</span>
                  <span className="text-muted fw-normal" style={{ fontSize: '0.8rem' }}>
                    ({movie.votes || 1200} votes)
                  </span>
                </div>
                <div className="d-flex align-items-center gap-1">
                  <Clock size={16} />
                  <span>{movie.duration} minutes</span>
                </div>
                <div className="d-flex align-items-center gap-1">
                  <Calendar size={16} />
                  <span>{new Date(movie.releaseDate).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Genres */}
              <div className="d-flex flex-wrap gap-2 mb-3">
                {movie.genre?.map((g) => (
                  <span key={g} className="badge bg-dark border border-secondary text-light px-3 py-1">
                    {g}
                  </span>
                ))}
              </div>

              {/* Synopsis */}
              <p className="text-white-50 mb-4" style={{ maxWidth: '750px', lineHeight: '1.6' }}>
                {movie.description}
              </p>

              {/* Director & Cast */}
              <div className="d-flex flex-column gap-1 small text-muted mb-4">
                <div>
                  <strong className="text-white">Director: </strong> {movie.director}
                </div>
                {movie.cast?.length > 0 && (
                  <div>
                    <strong className="text-white">Cast: </strong> {movie.cast.join(', ')}
                  </div>
                )}
              </div>

              {movie.trailerUrl && (
                <a
                  href={movie.trailerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-cinema-outline"
                >
                  <Play size={16} /> Watch Trailer
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Showtimes & Theatre Selection Section */}
      <div className="container mt-4">
        {/* Date Selector Tabs */}
        <div className="glass-panel p-2 mb-4 d-inline-flex flex-wrap gap-2">
          {datesList.map((d) => (
            <button
              key={d.iso}
              type="button"
              onClick={() => setSelectedDate(d.iso)}
              className={`btn px-3 py-2 text-center rounded-3 transition-all ${
                selectedDate === d.iso
                  ? 'btn-danger shadow'
                  : 'btn-dark text-white-50 border-0 bg-transparent'
              }`}
            >
              <div className="fw-bold small">{d.label}</div>
              <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>{d.subLabel}</div>
            </button>
          ))}
        </div>

        {/* Theatres & Shows */}
        <h4 className="text-white fw-bold mb-3 d-flex align-items-center gap-2">
          <Film size={20} className="text-danger" />
          Theatres in {city}
        </h4>

        {theatreShows.length === 0 ? (
          <div className="glass-panel p-5 text-center my-3">
            <h5 className="text-white mb-2">No shows scheduled for {selectedDate}</h5>
            <p className="text-muted small mb-0">
              Please choose another date or check other nearby cities from the navigation bar.
            </p>
          </div>
        ) : (
          <div className="d-flex flex-column gap-3">
            {theatreShows.map(({ theatre, shows }) => (
              <div key={theatre._id} className="glass-panel p-4">
                <div className="row g-3 align-items-center">
                  {/* Theatre Details */}
                  <div className="col-lg-4 col-md-5">
                    <h5 className="text-white fw-bold mb-1">{theatre.name}</h5>
                    <p className="text-muted small mb-2 d-flex align-items-center gap-1">
                      <MapPin size={14} className="text-danger flex-shrink-0" />
                      {theatre.address}
                    </p>
                    {/* Amenities */}
                    <div className="d-flex flex-wrap gap-1">
                      {theatre.amenities?.slice(0, 3).map((a) => (
                        <span
                          key={a}
                          className="badge bg-secondary bg-opacity-20 text-light border border-secondary border-opacity-25"
                          style={{ fontSize: '0.68rem' }}
                        >
                          {a}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Showtimes Buttons */}
                  <div className="col-lg-8 col-md-7">
                    <div className="d-flex flex-wrap gap-3">
                      {shows.map((show) => (
                        <button
                          key={show._id}
                          type="button"
                          onClick={() => handleShowClick(show._id)}
                          className="glass-panel p-2 px-3 text-start border-secondary border-opacity-50 hover-border-danger transition-all"
                          style={{
                            minWidth: '150px',
                            background: 'rgba(255, 255, 255, 0.04)',
                            cursor: 'pointer',
                          }}
                        >
                          <div className="d-flex align-items-center justify-content-between mb-1">
                            <span className="text-white fw-bold fs-6">{show.showTime}</span>
                            <span className="badge bg-danger bg-opacity-25 text-danger border border-danger border-opacity-50" style={{ fontSize: '0.65rem' }}>
                              {show.format}
                            </span>
                          </div>
                          <div className="d-flex align-items-center justify-content-between text-muted" style={{ fontSize: '0.72rem' }}>
                            <span>{show.screenName}</span>
                            <span className="text-success fw-semibold">
                              {show.availableSeatsCount} left
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MovieDetails;
