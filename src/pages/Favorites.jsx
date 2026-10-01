import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function Favorites() {
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    const savedFavorites =
      JSON.parse(localStorage.getItem("favorites")) || [];

    setFavorites(savedFavorites);
  }, []);

  function removeFavorite(id) {
    const updatedFavorites = favorites.filter(
      (movie) => movie.id !== id
    );

    setFavorites(updatedFavorites);

    localStorage.setItem(
      "favorites",
      JSON.stringify(updatedFavorites)
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>❤️ Favorite Movies</h1>
        <p>Your saved favorite movies</p>
      </div>

      {favorites.length === 0 ? (
        <div className="empty-state">
          <h2>No Favorite Movies</h2>
          <p>
            Go to Home and click the ❤️ button
            to add movies here.
          </p>

          <Link to="/" className="back-button">
            🎬 Browse Movies
          </Link>
        </div>
      ) : (
        <div className="movie-grid">
          {favorites.map((movie) => (
            <div
              className="movie-card"
              key={movie.id}
            >
              <Link to={`/movie/${movie.id}`}>
                {movie.poster_path ? (
                  <img
                    src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                    alt={movie.title}
                  />
                ) : (
                  <div className="movie-no-image">
                    No Image
                  </div>
                )}
              </Link>

              <div className="movie-card-content">
                <h3>{movie.title}</h3>

                <p>
                  ⭐{" "}
                  {movie.vote_average
                    ? movie.vote_average.toFixed(1)
                    : "N/A"}
                </p>

                <p>
                  📅{" "}
                  {movie.release_date ||
                    "Unknown"}
                </p>

                <button
                  className="remove-favorite-button"
                  onClick={() =>
                    removeFavorite(movie.id)
                  }
                >
                  🗑️ Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Favorites;