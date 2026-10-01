import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Watchlist() {
  const navigate = useNavigate();

  const [watchlist, setWatchlist] = useState([]);

  useEffect(() => {
    const savedWatchlist =
      JSON.parse(
        localStorage.getItem("watchlist")
      ) || [];

    setWatchlist(savedWatchlist);
  }, []);

  function removeFromWatchlist(movieId) {
    const updatedWatchlist =
      watchlist.filter(
        (movie) => movie.id !== movieId
      );

    setWatchlist(updatedWatchlist);

    localStorage.setItem(
      "watchlist",
      JSON.stringify(updatedWatchlist)
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

          <span className="active-link">
            Watchlist 📺
          </span>

        </div>

      </nav>

      <main>

        <section className="section-header">

          <h2>
            My Watchlist 📺
          </h2>

        </section>

        {watchlist.length === 0 ? (

          <div className="empty-favorites">

            <h3>
              Your watchlist is empty.
            </h3>

            <p>
              Add movies you want to watch
              later.
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

            {watchlist.map((movie) => (

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

                      removeFromWatchlist(
                        movie.id
                      );

                    }}
                    title="Remove from watchlist"
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

export default Watchlist;