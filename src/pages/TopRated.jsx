import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function TopRated() {
  const navigate = useNavigate();

  const [movies, setMovies] = useState([]);
  const [currentPage, setCurrentPage] =
    useState(1);
  const [totalPages, setTotalPages] =
    useState(1);

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] =
    useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadMovies() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          "https://cinescope-fk07.onrender.com/api/top-rated?page=1"
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.status_message ||
              data.message ||
              "Failed to load top rated movies"
          );
        }

        setMovies(
          (data.results || []).filter(
            (movie) => movie.poster_path
          )
        );

        setCurrentPage(1);
        setTotalPages(
          data.total_pages || 1
        );
      } catch (error) {
        console.error(
          "TOP RATED ERROR:",
          error
        );

        setError(
          error.message ||
            "Failed to load top rated movies."
        );
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
        `https://cinescope-fk07.onrender.com/api/top-rated?page=${nextPage}`
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
          oldMovies.map(
            (movie) => movie.id
          )
        );

        const newMovies = (
          data.results || []
        ).filter(
          (movie) =>
            movie.poster_path &&
            !oldIds.has(movie.id)
        );

        return [
          ...oldMovies,
          ...newMovies
        ];
      });

      setCurrentPage(nextPage);

      setTotalPages(
        data.total_pages || totalPages
      );
    } catch (error) {
      console.error(
        "LOAD MORE ERROR:",
        error
      );

      setError(
        error.message ||
          "Failed to load more movies."
      );
    } finally {
      setLoadingMore(false);
    }
  }

  return (
    <main className="page-container movies-page">
      <section className="page-header">
        <h1>⭐ Top Rated Movies</h1>

        <p>
          Movies with the highest ratings on TMDB.
        </p>
      </section>

      {loading && (
        <div className="page-status">
          Loading top rated movies...
        </div>
      )}

      {!loading && error && (
        <div className="page-error">
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
        movies.length === 0 && (
          <div className="page-status">
            No top rated movies found.
          </div>
        )}

      {!loading &&
        !error &&
        movies.length > 0 && (
          <>
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
    </main>
  );
}

export default TopRated;