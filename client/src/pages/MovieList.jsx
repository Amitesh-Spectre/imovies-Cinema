import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { fetchMovies, fetchFilterMeta } from '../redux/slices/movieSlice';
import MovieCard from '../components/MovieCard';
import { Search, Filter, SlidersHorizontal, RotateCcw } from 'lucide-react';

const MovieList = () => {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();

  const { movies = [], total = 0, loading, meta } = useSelector((state) => state.movies);

  // Local filter states initialized from URL params if present
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [status, setStatus] = useState(searchParams.get('status') || '');
  const [genre, setGenre] = useState(searchParams.get('genre') || 'All');
  const [language, setLanguage] = useState(searchParams.get('language') || 'All');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');

  useEffect(() => {
    dispatch(fetchFilterMeta());
  }, [dispatch]);

  const loadFilteredMovies = () => {
    const params = {};
    if (search.trim()) params.search = search.trim();
    if (status) params.status = status;
    if (genre && genre !== 'All') params.genre = genre;
    if (language && language !== 'All') params.language = language;
    if (sort) params.sort = sort;

    dispatch(fetchMovies(params));
  };

  useEffect(() => {
    loadFilteredMovies();
  }, [status, genre, language, sort]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadFilteredMovies();
  };

  const handleResetFilters = () => {
    setSearch('');
    setStatus('');
    setGenre('All');
    setLanguage('All');
    setSort('newest');
    dispatch(fetchMovies({}));
  };

  return (
    <div className="container py-5">
      {/* Page Title & Status Tabs */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="text-white fw-bold mb-1">Movie Catalog</h2>
          <p className="text-muted small mb-0">
            Showing {movies.length} of {total} movies in theatres
          </p>
        </div>

        {/* Status Pills */}
        <div className="btn-group p-1 rounded-pill" style={{ background: 'rgba(255, 255, 255, 0.06)' }}>
          <button
            type="button"
            className={`btn btn-sm rounded-pill px-3 py-1 ${status === '' ? 'btn-danger' : 'text-white-50 border-0'}`}
            onClick={() => setStatus('')}
          >
            All Movies
          </button>
          <button
            type="button"
            className={`btn btn-sm rounded-pill px-3 py-1 ${status === 'now_showing' ? 'btn-danger' : 'text-white-50 border-0'}`}
            onClick={() => setStatus('now_showing')}
          >
            Now Showing
          </button>
          <button
            type="button"
            className={`btn btn-sm rounded-pill px-3 py-1 ${status === 'coming_soon' ? 'btn-danger' : 'text-white-50 border-0'}`}
            onClick={() => setStatus('coming_soon')}
          >
            Coming Soon
          </button>
        </div>
      </div>

      {/* Filter Control Bar */}
      <div className="glass-panel p-3 mb-4">
        <form onSubmit={handleSearchSubmit} className="row g-2 align-items-center">
          {/* Keyword Search */}
          <div className="col-lg-4 col-md-12">
            <div className="position-relative">
              <Search size={16} className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
              <input
                type="text"
                className="form-control form-control-sm bg-dark border-secondary text-white ps-5 py-2 shadow-none"
                placeholder="Search by title, actor, director..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Genre */}
          <div className="col-lg-2 col-md-3 col-6">
            <select
              className="form-select form-select-sm bg-dark border-secondary text-white py-2 shadow-none"
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
            >
              <option value="All">All Genres</option>
              {meta.genres?.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          {/* Language */}
          <div className="col-lg-2 col-md-3 col-6">
            <select
              className="form-select form-select-sm bg-dark border-secondary text-white py-2 shadow-none"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option value="All">All Languages</option>
              {meta.languages?.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>

          {/* Sort Order */}
          <div className="col-lg-2 col-md-3 col-6">
            <select
              className="form-select form-select-sm bg-dark border-secondary text-white py-2 shadow-none"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="newest">Newest Releases</option>
              <option value="rating_desc">Highest Rated</option>
              <option value="title_asc">Title (A - Z)</option>
              <option value="title_desc">Title (Z - A)</option>
            </select>
          </div>

          {/* Action buttons */}
          <div className="col-lg-2 col-md-3 col-6 d-flex gap-2">
            <button type="submit" className="btn btn-sm btn-cinema w-100 py-2">
              Apply
            </button>
            <button
              type="button"
              onClick={handleResetFilters}
              title="Reset Filters"
              className="btn btn-sm btn-cinema-outline py-2 px-3"
            >
              <RotateCcw size={15} />
            </button>
          </div>
        </form>
      </div>

      {/* Movies Grid */}
      {loading ? (
        <div className="text-center py-5 text-danger">
          <div className="spinner-border" role="status"></div>
        </div>
      ) : movies.length === 0 ? (
        <div className="glass-panel text-center py-5 my-4">
          <h4 className="text-white mb-2">No Movies Found</h4>
          <p className="text-muted small mb-4">
            No films currently match your active search or filter selection.
          </p>
          <button onClick={handleResetFilters} className="btn btn-sm btn-cinema">
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="row g-4">
          {movies.map((movie) => (
            <div key={movie._id} className="col-xl-3 col-lg-4 col-md-6 col-sm-6">
              <MovieCard movie={movie} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MovieList;
