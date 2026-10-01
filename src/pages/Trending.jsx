import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Trending() {
  const navigate = useNavigate();

  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  useEffect(() => {
    async function loadTrendingMovies() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(
          "https://cinescope-fk07.onrender.com/api/movies/trending"
        );

        const data = await response.json();

        console.log(
          "Trending response:",
          data
        );

        if (!response.ok) {
          throw new Error(
            data.message ||
              data.status_message ||
              "Failed to fetch trending movies"
          );
        }

        if (
          !data.results ||
          !Array.isArray(data.results)
        ) {
          throw new Error(
            "Trending movies data was not received correctly."
          );
        }

        setMovies(data.results);

      } catch (error) {
        console.error(
          "Trending Movies Error:",
          error
        );

        setError(error.message);

        setMovies([]);

      } finally {
        setLoading(false);
      }
    }

    loadTrendingMovies();
  }, []);


  return (
    <div className="app">

      {/* =========================
          NAVBAR
      ========================= */}

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


          <span className="active-link">
            🔥 Trending
          </span>


          <span
            onClick={() =>
              navigate("/favorites")
            }
          >
            Favorites ❤️
          </span>

        </div>

      </nav>


      {/* =========================
          MAIN
      ========================= */}

      <main>

        <section className="trending-heading">

          <h2>
            🔥 Trending Movies
          </h2>


          <p>
            Movies that are trending this week.
          </p>

        </section>


        {/* LOADING */}

        {loading && (
          <div className="trending-status">
            <p className="loading">
              Loading trending movies...
            </p>
          </div>
        )}


        {/* ERROR */}

        {!loading && error && (
          <div className="trending-error">

            <h3>
              Unable to load trending movies
            </h3>

            <p>
              {error}
            </p>

            <button
              onClick={() =>
                window.location.reload()
              }
            >
              Try Again
            </button>

          </div>
        )}


        {/* NO MOVIES */}

        {!loading &&
          !error &&
          movies.length === 0 && (
            <div className="trending-status">

              <p className="loading">
                No trending movies found.
              </p>

            </div>
          )}


        {/* MOVIES */}

        {!loading &&
          !error &&
          movies.length > 0 && (

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
                        alt={
                          movie.title
                        }
                      />

                    ) : (

                      <div className="no-poster">
                        No Poster
                      </div>

                    )}

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

export default Trending;