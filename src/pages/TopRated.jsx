import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function TopRated() {
  const navigate = useNavigate();

  const [movies, setMovies] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadMovies() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          "http://localhost:5000/api/top-rated?page=1"
        );

        const data = await response.json();

        console.log("TOP RATED RESPONSE:", data);

        if (!response.ok) {
          throw new Error(
            data.status_message ||
              data.message ||
              "Failed to load top rated movies"
          );
        }

        setMovies(data.results || []);
        setCurrentPage(1);
        setTotalPages(data.total_pages || 1);
      } catch (error) {
        console.error("TOP RATED ERROR:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }

    loadMovies();
  }, []);

  async function loadMoreMovies() {
    if (
      loadingMore ||
      currentPage >= totalPages
    ) {
      return;
    }

    const nextPage = currentPage + 1;

    try {
      setLoadingMore(true);

      const response = await fetch(
        `http://localhost:5000/api/top-rated?page=${nextPage}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.status_message ||
            data.message ||
            "Failed to load more movies"
        );
      }

      setMovies((oldMovies) => {
        const oldIds = new Set(
          oldMovies.map((movie) => movie.id)
        );

        const newMovies = (data.results || []).filter(
          (movie) => !oldIds.has(movie.id)
        );

        return [...oldMovies, ...newMovies];
      });

      setCurrentPage(nextPage);
      setTotalPages(data.total_pages || totalPages);
    } catch (error) {
      console.error("LOAD MORE ERROR:", error);
      setError(error.message);
    } finally {
      setLoadingMore(false);
    }
  }

  return (
    <div className="app">
      <nav className="navbar">
        <h1 onClick={() => navigate("/")}>
          CineScope
        </h1>

        <div className="nav-links">
          <span onClick={() => navigate("/")}>
            Home
          </span>

          <span
            onClick={() => navigate("/trending")}
          >
            🔥 Trending
          </span>

          <span className="active-link">
            ⭐ Top Rated
          </span>

          <span
            onClick={() => navigate("/favorites")}
          >
            Favorites ❤️
          </span>
        </div>
      </nav>

      <main>
        <section className="trending-heading">
          <h2>⭐ Top Rated Movies</h2>

          <p>
            Movies with the highest ratings on TMDB.
          </p>
        </section>

        {loading && (
          <div className="trending-status">
            <p className="loading">
              Loading top rated movies...
            </p>
          </div>
        )}

        {!loading && error && (
          <div className="trending-error">
            <h3>
              Unable to load top rated movies
            </h3>

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
          movies.length > 0 && (
            <>
              <div className="movie-grid">
                {movies.map((movie) => (
                  <div
                    className="movie-card"
                    key={movie.id}
                    onClick={() =>
                      navigate(`/movie/${movie.id}`)
                    }
                  >
                    <div className="poster-wrapper">
                      {movie.poster_path ? (
                        <img
                          src={
                            "https://image.tmdb.org/t/p/w500" +
                            movie.poster_path
                          }
                          alt={movie.title}
                        />
                      ) : (
                        <div className="no-poster">
                          No Poster
                        </div>
                      )}
                    </div>

                    <div className="movie-info">
                      <h3>{movie.title}</h3>

                      <p>
                        ⭐{" "}
                        {movie.vote_average
                          ? movie.vote_average.toFixed(1)
                          : "N/A"}
                      </p>

                      <p>
                        {movie.release_date ||
                          "Release date unknown"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {currentPage < totalPages && (
                <div className="load-more-container">
                  <button
                    className="load-more"
                    onClick={loadMoreMovies}
                    disabled={loadingMore}
                  >
                    {loadingMore
                      ? "Loading..."
                      : "Load More"}
                  </button>
                </div>
              )}
            </>
          )}

        {!loading &&
          !error &&
          movies.length === 0 && (
            <div className="trending-status">
              <p className="loading">
                No top rated movies found.
              </p>
            </div>
          )}
      </main>
    </div>
  );
}

export default TopRated;