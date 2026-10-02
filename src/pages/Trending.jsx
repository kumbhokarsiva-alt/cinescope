import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Trending() {
  const navigate = useNavigate();

  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadTrendingMovies() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          "https://cinescope-fk07.onrender.com/api/movies/trending"
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              data.status_message ||
              "Failed to fetch trending movies"
          );
        }

        setMovies(
          (data.results || []).filter(
            (movie) => movie.poster_path
          )
        );
      } catch (error) {
        console.error(
          "Trending Movies Error:",
          error
        );

        setError(
          error.message ||
            "Failed to load trending movies."
        );

        setMovies([]);
      } finally {
        setLoading(false);
      }
    }

    loadTrendingMovies();
  }, []);

  return (
    <main className="page-container movies-page">
      <section className="page-header">
        <h1>🔥 Trending Movies</h1>

        <p>
          Movies that are trending this week.
        </p>
      </section>

      {loading && (
        <div className="page-status">
          Loading trending movies...
        </div>
      )}

      {!loading && error && (
        <div className="page-error">
          <h3>Unable to load trending movies</h3>

          <p>{error}</p>

          <button
            onClick={() =>
              window.location.reload()
            }
          >
            Try Again
          </button>
        </div>
      )}

      {!loading &&
        !error &&
        movies.length === 0 && (
          <div className="page-status">
            No trending movies found.
          </div>
        )}

      {!loading &&
        !error &&
        movies.length > 0 && (
          <div className="movie-grid">
            {movies.map((movie) => (
              <article
                className="movie-card"
                key={movie.id}
                onClick={() =>
                  navigate(`/movie/${movie.id}`)
                }
              >
                <div className="poster-wrapper">
                  <img
                    src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                    alt={movie.title}
                    loading="lazy"
                  />

                  <span className="movie-rating">
                    ⭐{" "}
                    {movie.vote_average
                      ? movie.vote_average.toFixed(
                          1
                        )
                      : "N/A"}
                  </span>
                </div>

                <div className="movie-info">
                  <h3>{movie.title}</h3>

                  <p>
                    {movie.release_date ||
                      "Release date unknown"}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
    </main>
  );
}

export default Trending;