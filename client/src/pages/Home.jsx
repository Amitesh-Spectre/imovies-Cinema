import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { fetchMovies, fetchFilterMeta } from '../redux/slices/movieSlice';
import MovieCard from '../components/MovieCard';
import { Search, Flame, Sparkles, Film, Calendar, Clapperboard, Award, Play } from 'lucide-react';

const Home = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { movies = [], nowShowing = [], comingSoon = [], loading, meta } = useSelector(
    (state) => state.movies
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [selectedLang, setSelectedLang] = useState('All');

  useEffect(() => {
    dispatch(fetchMovies());
    dispatch(fetchFilterMeta());
  }, [dispatch]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    navigate(`/movies?search=${encodeURIComponent(searchQuery)}&genre=${selectedGenre}&language=${selectedLang}`);
  };

  // Hero featured movie (Dune: Part Two or first)
  const heroMovie = movies.find((m) => m.title.includes('Dune')) || movies[0];

  return (
    <div className="pb-5">
      {/* Hero Showcase Banner */}
      {heroMovie && (
        <section
          className="position-relative d-flex align-items-center"
          style={{
            minHeight: '620px',
            background: `linear-gradient(to right, rgba(11, 15, 25, 0.96) 20%, rgba(11, 15, 25, 0.7) 60%, rgba(11, 15, 25, 0.3) 100%), url(${heroMovie.banner || heroMovie.poster}) center/cover no-repeat`,
          }}
        >
          <div className="container py-5">
            <div className="row align-items-center">
              <div className="col-lg-7">
                <div className="d-flex align-items-center gap-2 mb-3">
                  <span className="badge bg-danger px-3 py-1 text-uppercase fw-bold" style={{ letterSpacing: '1px' }}>
                    FEATURED BLOCKBUSTER
                  </span>
                  <span className="badge bg-dark border border-secondary px-3 py-1 text-light">
                    IMAX 3D & 4DX
                  </span>
                </div>

                <h1 className="display-4 fw-black text-white mb-3" style={{ fontWeight: 800 }}>
                  {heroMovie.title}
                </h1>

                <p className="lead text-white-50 mb-4" style={{ maxWidth: '600px', fontSize: '1.05rem', lineHeight: '1.6' }}>
                  {heroMovie.description}
                </p>

                <div className="d-flex flex-wrap align-items-center gap-3 mb-4">
                  <span className="text-warning fw-bold d-flex align-items-center gap-1">
                    ★ {heroMovie.rating?.toFixed(1) || '8.6'} Rating
                  </span>
                  <span className="text-white-50">•</span>
                  <span className="text-white">{heroMovie.duration} Mins</span>
                  <span className="text-white-50">•</span>
                  <span className="text-white">{heroMovie.genre?.join(', ')}</span>
                </div>

                <div className="d-flex flex-wrap gap-3">
                  <Link to={`/movies/${heroMovie._id}`} className="btn btn-cinema px-4 py-3 fs-6">
                    <Clapperboard size={18} />
                    Book Tickets Now
                  </Link>
                  {heroMovie.trailerUrl && (
                    <a
                      href={heroMovie.trailerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-cinema-outline px-4 py-3 fs-6"
                    >
                      <Play size={18} />
                      Watch Trailer
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Quick Search & Filter Bar */}
      <div className="container" style={{ marginTop: '-40px', position: 'relative', zIndex: 10 }}>
        <div className="glass-panel p-4 shadow-lg">
          <form onSubmit={handleSearchSubmit} className="row g-3 align-items-center">
            {/* Search Input */}
            <div className="col-lg-5 col-md-12">
              <div className="position-relative">
                <Search size={18} className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
                <input
                  type="text"
                  className="form-control bg-dark border-secondary text-white ps-5 py-2 shadow-none"
                  placeholder="Search movies by title, director, or cast..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Genre Filter */}
            <div className="col-lg-3 col-md-4">
              <select
                className="form-select bg-dark border-secondary text-white py-2 shadow-none"
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
              >
                <option value="All">All Genres</option>
                {meta.genres?.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            {/* Language Filter */}
            <div className="col-lg-2 col-md-4">
              <select
                className="form-select bg-dark border-secondary text-white py-2 shadow-none"
                value={selectedLang}
                onChange={(e) => setSelectedLang(e.target.value)}
              >
                <option value="All">All Languages</option>
                {meta.languages?.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>

            {/* Submit */}
            <div className="col-lg-2 col-md-4">
              <button type="submit" className="btn btn-cinema w-100 py-2">
                Explore Shows
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Now Showing Section */}
      <section className="container mt-5 pt-4">
        <div className="d-flex justify-content-between align-items-end mb-4">
          <div>
            <div className="d-flex align-items-center gap-2 text-danger fw-bold small text-uppercase mb-1">
              <Flame size={16} />
              Trending in Theatres
            </div>
            <h2 className="text-white fw-bold mb-0">Now Showing</h2>
          </div>
          <Link to="/movies" className="text-danger fw-semibold small text-decoration-none hover-white">
            View All Movies &rarr;
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-5 text-danger">
            <div className="spinner-border" role="status"></div>
          </div>
        ) : (
          <div className="row g-4">
            {nowShowing.slice(0, 4).map((movie) => (
              <div key={movie._id} className="col-xl-3 col-lg-4 col-md-6 col-sm-6">
                <MovieCard movie={movie} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Coming Soon Section */}
      <section className="container mt-5 pt-4">
        <div className="d-flex justify-content-between align-items-end mb-4">
          <div>
            <div className="d-flex align-items-center gap-2 text-warning fw-bold small text-uppercase mb-1">
              <Sparkles size={16} />
              Anticipated Releases
            </div>
            <h2 className="text-white fw-bold mb-0">Coming Soon</h2>
          </div>
          <Link to="/movies?status=coming_soon" className="text-warning fw-semibold small text-decoration-none hover-white">
            Explore Upcoming &rarr;
          </Link>
        </div>

        <div className="row g-4">
          {comingSoon.slice(0, 4).map((movie) => (
            <div key={movie._id} className="col-xl-3 col-lg-4 col-md-6 col-sm-6">
              <MovieCard movie={movie} />
            </div>
          ))}
        </div>
      </section>

      {/* Why Choose IMovies Perks */}
      <section className="container mt-5 pt-5">
        <div className="glass-panel p-5">
          <div className="text-center max-w-xl mx-auto mb-5">
            <h3 className="text-white fw-bold">The Ultimate Cinema Booking Experience</h3>
            <p className="text-muted small">
              Engineered with advanced MERN architecture for fast booking, zero double-bookings, and premier cinema luxury.
            </p>
          </div>

          <div className="row g-4 text-center">
            <div className="col-md-4">
              <div className="p-3">
                <div className="d-inline-flex align-items-center justify-content-center p-3 rounded-circle bg-danger bg-opacity-20 text-danger mb-3">
                  <Film size={28} />
                </div>
                <h5 className="text-white fw-semibold mb-2">Live Seat Locking</h5>
                <p className="text-muted small mb-0">
                  Real-time Socket.io seat hold system prevents collisions. Your seat is held exclusively for you while you check out.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="p-3">
                <div className="d-inline-flex align-items-center justify-content-center p-3 rounded-circle bg-warning bg-opacity-20 text-warning mb-3">
                  <Award size={28} />
                </div>
                <h5 className="text-white fw-semibold mb-2">Tiered Luxury Auditoriums</h5>
                <p className="text-muted small mb-0">
                  Choose from Silver, Gold, Platinum, and VIP Electric Recliner tiers with IMAX 3D laser projection and Dolby Atmos.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="p-3">
                <div className="d-inline-flex align-items-center justify-content-center p-3 rounded-circle bg-info bg-opacity-20 text-info mb-3">
                  <Sparkles size={28} />
                </div>
                <h5 className="text-white fw-semibold mb-2">Instant Digital Passes</h5>
                <p className="text-muted small mb-0">
                  Instant verifiable e-tickets with QR code verification, fast gate entry, and flexible refund cancellation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
