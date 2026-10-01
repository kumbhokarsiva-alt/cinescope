import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function ActorDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [actor, setActor] = useState(null);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchActor() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `https://cinescope-fk07.onrender.com/api/person/${id}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to load actor"
          );
        }

        setActor(data);

        const credits =
          data.combined_credits?.cast || [];

        const movieList = credits
          .filter(
            (item) =>
              item.media_type === "movie" &&
              item.id &&
              item.poster_path
          )
          .filter(
            (item, index, array) =>
              index ===
              array.findIndex(
                (movie) => movie.id === item.id
              )
          )
          .sort((a, b) => {
            const dateA =
              a.release_date || "0000-00-00";
            const dateB =
              b.release_date || "0000-00-00";

            return dateB.localeCompare(dateA);
          })
          .slice(0, 12);

        setMovies(movieList);
      } catch (err) {
        console.error("Actor Details Error:", err);

        setError(
          err.message || "Something went wrong"
        );
      } finally {
        setLoading(false);
      }
    }

    fetchActor();
  }, [id]);

  if (loading) {
    return (
      <div className="page-container">
        <h2>Loading actor...</h2>
      </div>
    );
  }

  if (error || !actor) {
    return (
      <div className="page-container">
        <button
          className="back-button"
          onClick={() => navigate(-1)}
        >
          ← Go Back
        </button>

        <h2>
          {error || "Actor not found"}
        </h2>
      </div>
    );
  }

  return (
    <div className="page-container actor-details-page">

      {/* BACK BUTTON */}
      <button
        className="back-button"
        onClick={() => navigate(-1)}
      >
        ← Go Back
      </button>

      {/* ACTOR PROFILE */}
      <section className="actor-header">

        <div className="actor-profile-image">
          {actor.profile_path ? (
            <img
              src={`https://image.tmdb.org/t/p/w500${actor.profile_path}`}
              alt={actor.name}
            />
          ) : (
            <div className="actor-no-image">
              No Image
            </div>
          )}
        </div>

        <div className="actor-info">

          <p className="actor-label">
            🎭 ACTOR / CAST
          </p>

          <h1>{actor.name}</h1>

          {actor.known_for_department && (
            <p>
              <strong>Known For:</strong>{" "}
              {actor.known_for_department}
            </p>
          )}

          {actor.birthday && (
            <p>
              <strong>Birthday:</strong>{" "}
              {actor.birthday}
            </p>
          )}

          {actor.place_of_birth && (
            <p>
              <strong>Birth Place:</strong>{" "}
              {actor.place_of_birth}
            </p>
          )}

          <h2>Biography</h2>

          <p className="actor-biography">
            {actor.biography ||
              "No biography available for this actor."}
          </p>

        </div>
      </section>

      {/* ACTOR MOVIES */}
      <section className="actor-movies">

        <h2>🎬 Movies</h2>

        {movies.length === 0 ? (
          <p>No movies found.</p>
        ) : (
          <div className="actor-movies-grid">

            {movies.map((movie) => (
              <div
                className="actor-movie-card"
                key={movie.id}
                onClick={() =>
                  navigate(`/movie/${movie.id}`)
                }
              >

                <img
                  src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                  alt={movie.title}
                  loading="lazy"
                />

                <div className="actor-movie-info">

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

                </div>

              </div>
            ))}

          </div>
        )}

      </section>
    </div>
  );
}

export default ActorDetails;