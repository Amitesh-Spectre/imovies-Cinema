import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Clock, Ticket } from 'lucide-react';

const MovieCard = ({ movie }) => {
  const formatDuration = (mins) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h ${m}m`;
  };

  return (
    <div className="glass-panel glass-card-hover h-100 d-flex flex-column p-2 movie-card-hover">
      {/* Poster with overlays */}
      <div className="movie-poster-box position-relative">
        <img
          src={movie.poster}
          alt={movie.title}
          loading="lazy"
        />
        {/* Rating Badge */}
        <div
          className="position-absolute top-2 start-2 d-flex align-items-center gap-1 px-2 py-1 rounded-pill"
          style={{ background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255, 215, 0, 0.4)' }}
        >
          <Star size={13} fill="#ffd700" color="#ffd700" />
          <span className="small fw-bold text-white" style={{ fontSize: '0.8rem' }}>
            {movie.rating ? movie.rating.toFixed(1) : '8.0'}
          </span>
        </div>

        {/* Certification badge */}
        <div
          className="position-absolute top-2 end-2 px-2 py-0.5 rounded text-white fw-bold"
          style={{ background: 'rgba(229, 9, 20, 0.85)', fontSize: '0.7rem' }}
        >
          {movie.certification || 'UA'}
        </div>
      </div>

      {/* Info details */}
      <div className="p-3 d-flex flex-column flex-grow-1">
        <h5 className="text-white fw-bold mb-1 text-truncate" title={movie.title}>
          {movie.title}
        </h5>

        <div className="d-flex align-items-center gap-3 text-muted small mb-2">
          <span className="d-flex align-items-center gap-1">
            <Clock size={13} />
            {formatDuration(movie.duration)}
          </span>
          <span>•</span>
          <span>{movie.language?.slice(0, 2).join(', ')}</span>
        </div>

        {/* Genre pills */}
        <div className="d-flex flex-wrap gap-1 mb-3">
          {movie.genre?.slice(0, 3).map((g) => (
            <span
              key={g}
              className="badge bg-secondary bg-opacity-25 text-light fw-normal py-1 px-2"
              style={{ fontSize: '0.7rem' }}
            >
              {g}
            </span>
          ))}
        </div>

        {/* Action button */}
        <div className="mt-auto">
          {movie.status === 'now_showing' ? (
            <Link
              to={`/movies/${movie._id}`}
              className="btn btn-cinema w-100 py-2 small"
            >
              <Ticket size={16} />
              Book Tickets
            </Link>
          ) : (
            <Link
              to={`/movies/${movie._id}`}
              className="btn btn-cinema-outline w-100 py-2 small text-warning border-warning"
            >
              Coming Soon
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default MovieCard;
