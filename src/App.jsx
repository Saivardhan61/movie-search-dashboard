import { useEffect, useState } from "react";
import "./App.css";

const API_KEY = "a31d30d4"; 

function App() {
  const [searchTerm, setSearchTerm] = useState("");
  const [movies, setMovies] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("movie-favorites");
    if (stored) {
      setFavorites(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("movie-favorites", JSON.stringify(favorites));
  }, [favorites]);

  const isFavorite = (imdbID) =>
    favorites.some((movie) => movie.imdbID === imdbID);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setLoading(true);
    setError("");
    setSelectedMovie(null);

    try {
      const res = await fetch(
        `https://www.omdbapi.com/?apikey=${API_KEY}&s=${encodeURIComponent(
          searchTerm
        )}&type=movie`
      );
      const data = await res.json();

      if (data.Response === "False") {
        setMovies([]);
        setError(data.Error || "No movies found.");
      } else {
        setMovies(data.Search || []);
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchMovieDetails = async (imdbID) => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(
        `https://www.omdbapi.com/?apikey=${API_KEY}&i=${imdbID}&plot=full`
      );
      const data = await res.json();

      if (data.Response === "False") {
        setError(data.Error || "Failed to load movie details.");
      } else {
        setSelectedMovie(data);
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = (movie) => {
    if (isFavorite(movie.imdbID)) {
      setFavorites((prev) =>
        prev.filter((fav) => fav.imdbID !== movie.imdbID)
      );
    } else {
      setFavorites((prev) => [...prev, movie]);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>🎬 Movie Explorer</h1>
        <p>Search, discover, and save your favourite movies.</p>
      </header>

      <main className="layout">
        {/* Left: Search + Results */}
        <section className="left-panel">
          <form className="search-bar" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Search for a movie (e.g. Inception)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button type="submit">Search</button>
          </form>

          {loading && <div className="info-text">Loading...</div>}
          {error && <div className="error-text">{error}</div>}

          <div className="movies-grid">
            {movies.map((movie) => (
              <div className="movie-card" key={movie.imdbID}>
                <div className="poster-wrapper">
                  {movie.Poster && movie.Poster !== "N/A" ? (
                    <img src={movie.Poster} alt={movie.Title} />
                  ) : (
                    <div className="poster-placeholder">No Image</div>
                  )}
                </div>
                <div className="movie-info">
                  <h3>{movie.Title}</h3>
                  <p>{movie.Year}</p>
                  <p className="movie-type">{movie.Type}</p>
                </div>
                <div className="movie-actions">
                  <button onClick={() => fetchMovieDetails(movie.imdbID)}>
                    Details
                  </button>
                  <button
                    className={isFavorite(movie.imdbID) ? "fav active" : "fav"}
                    onClick={() => toggleFavorite(movie)}
                  >
                    {isFavorite(movie.imdbID) ? "★ Favorited" : "☆ Favorite"}
                  </button>
                </div>
              </div>
            ))}

            {!loading && !error && movies.length === 0 && (
              <p className="info-text">
                Start by searching for a movie above 👆
              </p>
            )}
          </div>
        </section>

        {/* Right: Details + Favorites */}
        <section className="right-panel">
          <div className="details-card">
            <h2>Movie Details</h2>
            {!selectedMovie && (
              <p className="info-text">
                Click on "Details" on any movie to see more info.
              </p>
            )}

            {selectedMovie && (
              <div className="details-content">
                <div className="details-header">
                  {selectedMovie.Poster &&
                  selectedMovie.Poster !== "N/A" ? (
                    <img
                      src={selectedMovie.Poster}
                      alt={selectedMovie.Title}
                    />
                  ) : (
                    <div className="poster-placeholder small">No Image</div>
                  )}
                  <div>
                    <h3>{selectedMovie.Title}</h3>
                    <p>
                      {selectedMovie.Year} • {selectedMovie.Runtime} •{" "}
                      {selectedMovie.Rated}
                    </p>
                    <p>{selectedMovie.Genre}</p>
                    <p>⭐ {selectedMovie.imdbRating} / 10 (IMDB)</p>
                  </div>
                </div>
                <p className="plot">{selectedMovie.Plot}</p>
                <p>
                  <strong>Director:</strong> {selectedMovie.Director}
                </p>
                <p>
                  <strong>Actors:</strong> {selectedMovie.Actors}
                </p>
                <p>
                  <strong>Language:</strong> {selectedMovie.Language}
                </p>
              </div>
            )}
          </div>

          <div className="favorites-card">
            <h2>Favorites ⭐</h2>
            {favorites.length === 0 && (
              <p className="info-text">
                You don&apos;t have any favorites yet. Add some!
              </p>
            )}
            <ul className="favorites-list">
              {favorites.map((movie) => (
                <li key={movie.imdbID}>
                  <button
                    className="fav-title"
                    onClick={() => fetchMovieDetails(movie.imdbID)}
                  >
                    {movie.Title} ({movie.Year})
                  </button>
                  <button
                    className="remove-btn"
                    onClick={() => toggleFavorite(movie)}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
