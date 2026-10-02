import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Watchlist() {
  const navigate = useNavigate();

  const [watchlist, setWatchlist] =
    useState([]);

  useEffect(() => {
    const savedWatchlist =
      JSON.parse(
        localStorage.getItem(
          "watchlist"
        )
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
    <main className="page-container movies-page">
      <section className="page-header">
        <h1>📺 My Watchlist</h1>

        <p>
          Movies you saved to watch later.
        </p>
      </section>

      {watchlist.length === 0 ? (
        <div className="empty-state">
          <h2>Your watchlist is empty.</h2>

          <p>
            Add movies you want to watch later.
          </p>

          <button
            className="load-more"
            onClick={() =>
              navigate("/")
            }
          >
            🎬 Browse Movies
          </button>
        </div>
      ) : (
        <div className="movie-grid">
          {watchlist.map((movie) => (
            <article
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
                    src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                    alt={movie.title}
                    loading="lazy"
                  />
                ) : (
                  <div className="no-poster">
                    No Poster
                  </div>
                )}

                <button
                  className="favorite-button"
                  onClick={(event) => {
                    event.stopPropagation();

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
                <h3>{movie.title}</h3>

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
            </article>
          ))}
        </div>
      )}
    </main>
  );
}

export default Watchlist;