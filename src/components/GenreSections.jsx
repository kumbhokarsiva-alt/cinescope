import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const genreList = [
  {
    id: 28,
    name: "Action Movies",
  },
  {
    id: 35,
    name: "Comedy Movies",
  },
  {
    id: 27,
    name: "Horror Movies",
  },
  {
    id: 16,
    name: "Animation Movies",
  },
];

function GenreSections() {
  const navigate = useNavigate();

  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function fetchGenreMovies() {
      try {
        setLoading(true);

        const allSections = [];

        for (const genre of genreList) {
          try {
            const response = await fetch(
              "http://localhost:5000/api/movies/discover" +
                "?genre=" +
                genre.id +
                "&year=all" +
                "&original_language=all" +
                "&page=1"
            );

            if (!response.ok) {
              console.error(
                "Genre API Error:",
                genre.name,
                response.status
              );
              continue;
            }

            const data = await response.json();

            const movies = Array.isArray(data.results)
              ? data.results.slice(0, 8)
              : [];

            if (movies.length > 0) {
              allSections.push({
                id: genre.id,
                name: genre.name,
                movies: movies,
              });
            }
          } catch (error) {
            console.error(
              "Genre Fetch Error:",
              genre.name,
              error
            );
          }
        }

        if (isMounted) {
          setSections(allSections);
        }
      } catch (error) {
        console.error(
          "Genre Sections Error:",
          error
        );

        if (isMounted) {
          setSections([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchGenreMovies();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <section className="genre-sections">
        <div className="genre-section-heading">
          <h2>🎬 Explore by Genre</h2>
          <p>
            Loading movies by genre...
          </p>
        </div>
      </section>
    );
  }

  if (sections.length === 0) {
    return null;
  }

  return (
    <section className="genre-sections">
      <div className="genre-section-heading">
        <h2>🎬 Explore by Genre</h2>

        <p>
          Discover movies from different genres.
        </p>
      </div>

      {sections.map((section) => (
        <div
          className="genre-row-section"
          key={section.id}
        >
          <div className="genre-row-title">
            <h3>{section.name}</h3>

            <button
              type="button"
              onClick={() => {
                navigate(
                  "/?genre=" + section.id
                );
              }}
            >
              View More →
            </button>
          </div>

          <div className="genre-movie-row">
            {section.movies.map((movie) => (
              <div
                className="genre-movie-card"
                key={movie.id}
                onClick={() => {
                  navigate(
                    "/movie/" + movie.id
                  );
                }}
              >
                {movie.poster_path ? (
                  <img
                    src={
                      "https://image.tmdb.org/t/p/w500" +
                      movie.poster_path
                    }
                    alt={movie.title}
                  />
                ) : (
                  <div className="genre-no-image">
                    No Image
                  </div>
                )}

                <div className="genre-movie-info">
                  <h4>{movie.title}</h4>

                  <p>
                    ⭐{" "}
                    {movie.vote_average
                      ? movie.vote_average.toFixed(
                          1
                        )
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
        </div>
      ))}
    </section>
  );
}

export default GenreSections;