import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function FeaturedMovie() {
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFeaturedMovie() {
      try {
        const response = await fetch(
          "http://localhost:5000/api/movies/popular?page=1"
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              data.status_message ||
              "Failed to load featured movie"
          );
        }

        const movies = (data.results || []).filter(
          (item) => item.backdrop_path || item.poster_path
        );

        if (movies.length > 0) {
          const randomIndex = Math.floor(Math.random() * movies.length);
          setMovie(movies[randomIndex]);
        } else {
          setMovie(null);
        }
      } catch (error) {
        console.error("Featured Movie Error:", error);
        setMovie(null);
      } finally {
        setLoading(false);
      }
    }

    loadFeaturedMovie();
  }, []);

  if (loading || !movie) {
    return null;
  }

  return (
    <section className="featured-movie">
      <div className="featured-backdrop">
        {movie.backdrop_path ? (
          <img
            src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`}
            alt=""
          />
        ) : (
          <img
            src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
            alt=""
          />
        )}
      </div>

      <div className="featured-overlay"></div>

      <div className="featured-content">
        <p className="featured-label">⭐ FEATURED MOVIE</p>

        <h2>{movie.title}</h2>

        <div className="featured-meta">
          <span>
            ⭐{" "}
            {movie.vote_average
              ? movie.vote_average.toFixed(1)
              : "N/A"}
          </span>

          <span>
            📅 {movie.release_date || "Release date unknown"}
          </span>
        </div>

        <p className="featured-overview">
          {movie.overview || "No overview available."}
        </p>

        <button
          className="featured-button"
          onClick={() => navigate(`/movie/${movie.id}`)}
        >
          🎬 View Details
        </button>
      </div>
    </section>
  );
}

export default FeaturedMovie;