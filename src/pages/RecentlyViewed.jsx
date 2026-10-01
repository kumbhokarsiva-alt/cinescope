import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function RecentlyViewed() {
  const navigate = useNavigate();

  const [movies, setMovies] = useState([]);

  useEffect(() => {
    const savedMovies =
      JSON.parse(
        localStorage.getItem("recentlyViewed")
      ) || [];

    setMovies(savedMovies);
  }, []);

  function removeMovie(movieId) {
    const updatedMovies = movies.filter(
      (movie) => movie.id !== movieId
    );

    setMovies(updatedMovies);

    localStorage.setItem(
      "recentlyViewed",
      JSON.stringify(updatedMovies)
    );
  }

  function clearAll() {
    setMovies([]);

    localStorage.removeItem(
      "recentlyViewed"
    );
  }

  return (
    <div className="app">

      <nav className="navbar">

        <h1
          onClick={() => navigate("/")}
        >
          CineScope
        </h1>

        <div className="nav-links">

          <span
            onClick={() => navigate("/")}
          >
            Home
          </span>

          <span
            onClick={() =>
              navigate("/trending")
            }
          >
            🔥 Trending
          </span>

          <span
            onClick={() =>
              navigate("/top-rated")
            }
          >
            ⭐ Top Rated
          </span>

          <span
            onClick={() =>
              navigate("/upcoming")
            }
          >
            📅 Upcoming
          </span>

          <span
            onClick={() =>
              navigate("/favorites")
            }
          >
            Favorites ❤️
          </span>

          <span
            onClick={() =>
              navigate("/watchlist")
            }
          >
            Watchlist 📺
          </span>

          <span className="active-link">
            Recently Viewed 🕐
          </span>

        </div>

      </nav>

      <main>

        <div className="section-header">

          <h2>
            Recently Viewed 🕐
          </h2>

          {movies.length > 0 && (
            <button
              className="clear-history-button"
              onClick={clearAll}
            >
              Clear All
            </button>
          )}

        </div>

        {movies.length === 0 ? (

          <div className="empty-favorites">

            <h3>
              No recently viewed movies.
            </h3>

            <p>
              Movies you open will appear here.
            </p>

            <button
              className="load-more"
              onClick={() =>
                navigate("/")
              }
            >
              Browse Movies
            </button>

          </div>

        ) : (

          <div className="movie-grid">

            {movies.map((movie) => (

              <div
                className="movie-card"
                key={movie.id}
                onClick={() =>
                  navigate(
                    `/movie/${movie.id}`
                  )
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

                  <button
                    className="favorite-button"
                    onClick={(e) => {

                      e.stopPropagation();

                      removeMovie(
                        movie.id
                      );

                    }}
                    title="Remove from history"
                  >
                    ❌
                  </button>

                </div>

                <div className="movie-info">

                  <h3>
                    {movie.title}
                  </h3>

                  <p>
                    ⭐{" "}
                    {movie.vote_average
                      ? movie.vote_average.toFixed(
                          1
                        )
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

        )}

      </main>

    </div>
  );
}

export default RecentlyViewed;