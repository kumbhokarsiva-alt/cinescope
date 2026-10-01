import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = "http://localhost:5000/api";

const genreRules = [
  {
    id: "28",
    name: "Action",
    words: ["action", "fighting", "fight", "war"]
  },
  {
    id: "12",
    name: "Adventure",
    words: ["adventure", "adventurous"]
  },
  {
    id: "16",
    name: "Animation",
    words: ["animation", "animated", "cartoon"]
  },
  {
    id: "35",
    name: "Comedy",
    words: ["comedy", "funny", "fun", "hilarious"]
  },
  {
    id: "80",
    name: "Crime",
    words: ["crime", "criminal", "gangster", "mafia"]
  },
  {
    id: "18",
    name: "Drama",
    words: ["drama", "emotional", "sad", "serious"]
  },
  {
    id: "27",
    name: "Horror",
    words: ["horror", "scary", "ghost", "haunted", "scared"]
  },
  {
    id: "878",
    name: "Science Fiction",
    words: [
      "sci-fi",
      "sci fi",
      "science fiction",
      "space",
      "future",
      "robot"
    ]
  },
  {
    id: "53",
    name: "Thriller",
    words: [
      "thriller",
      "suspense",
      "suspenseful"
    ]
  },
  {
    id: "10749",
    name: "Romance",
    words: [
      "romance",
      "romantic",
      "love",
      "lovestory",
      "love story"
    ]
  },
  {
    id: "14",
    name: "Fantasy",
    words: ["fantasy", "magic", "magical"]
  },
  {
    id: "9648",
    name: "Mystery",
    words: ["mystery", "mysterious", "detective"]
  },
  {
    id: "10751",
    name: "Family",
    words: ["family", "kids", "children"]
  }
];

const languageRules = [
  {
    id: "hi",
    name: "Hindi",
    words: ["hindi", "bollywood"]
  },
  {
    id: "bn",
    name: "Bengali",
    words: ["bengali", "bangla"]
  },
  {
    id: "ta",
    name: "Tamil",
    words: ["tamil"]
  },
  {
    id: "te",
    name: "Telugu",
    words: ["telugu"]
  },
  {
    id: "ml",
    name: "Malayalam",
    words: ["malayalam"]
  },
  {
    id: "mr",
    name: "Marathi",
    words: ["marathi"]
  },
  {
    id: "pa",
    name: "Punjabi",
    words: ["punjabi"]
  },
  {
    id: "ko",
    name: "Korean",
    words: ["korean"]
  },
  {
    id: "ja",
    name: "Japanese",
    words: ["japanese", "japan"]
  },
  {
    id: "es",
    name: "Spanish",
    words: ["spanish"]
  },
  {
    id: "fr",
    name: "French",
    words: ["french"]
  },
  {
    id: "en",
    name: "English",
    words: ["english", "hollywood"]
  }
];

function hasWord(text, words) {
  return words.some((word) => text.includes(word));
}

function analyzeQuery(query) {
  const text = query.toLowerCase().trim();

  let genre = null;
  let language = null;

  for (const item of genreRules) {
    if (hasWord(text, item.words)) {
      genre = item;
      break;
    }
  }

  for (const item of languageRules) {
    if (hasWord(text, item.words)) {
      language = item;
      break;
    }
  }

  const similarRequest =
    text.includes("like ") ||
    text.includes("similar") ||
    text.includes("same as") ||
    text.includes("something like");

  return {
    genre,
    language,
    similarRequest
  };
}

function SmartRecommendations({ query, movies = [] }) {
  const navigate = useNavigate();

  const [recommendations, setRecommendations] =
    useState([]);

  const [loading, setLoading] = useState(false);

  const [reason, setReason] = useState("");

  useEffect(() => {
    let active = true;

    async function loadRecommendations() {
      const text = query.trim();

      if (!text) {
        setRecommendations([]);
        setReason("");
        return;
      }

      const intent = analyzeQuery(text);

      setLoading(true);

      try {
        let resultMovies = [];

        const sourceMovie =
          movies.length > 0 ? movies[0] : null;

        /*
          CASE 1:
          User asks "movies like KGF"
        */

        if (
          sourceMovie &&
          intent.similarRequest
        ) {
          try {
            const response = await fetch(
              API_BASE_URL +
                "/similar/" +
                sourceMovie.id
            );

            if (response.ok) {
              const data = await response.json();

              if (Array.isArray(data.results)) {
                resultMovies =
                  data.results.filter(
                    (movie) =>
                      movie.poster_path &&
                      movie.id !== sourceMovie.id
                  );
              }
            }
          } catch (error) {
            console.error(
              "Similar Recommendation Error:",
              error
            );
          }
        }

        /*
          CASE 2:
          User writes genre/language
          Example:
          "funny Hindi movies"
        */

        if (
          resultMovies.length < 6 &&
          (intent.genre || intent.language)
        ) {
          try {
            const params = new URLSearchParams();

            params.set(
              "genre",
              intent.genre
                ? intent.genre.id
                : "all"
            );

            params.set(
              "year",
              "all"
            );

            params.set(
              "original_language",
              intent.language
                ? intent.language.id
                : "all"
            );

            params.set("page", "1");

            const response = await fetch(
              API_BASE_URL +
                "/movies/discover?" +
                params.toString()
            );

            if (response.ok) {
              const data = await response.json();

              if (Array.isArray(data.results)) {
                resultMovies = [
                  ...resultMovies,
                  ...data.results
                ];
              }
            }
          } catch (error) {
            console.error(
              "Smart Discover Error:",
              error
            );
          }
        }

        /*
          CASE 3:
          User only searches a movie title
          Example:
          "kgf"
        */

        if (
          resultMovies.length === 0 &&
          sourceMovie
        ) {
          try {
            const response = await fetch(
              API_BASE_URL +
                "/similar/" +
                sourceMovie.id
            );

            if (response.ok) {
              const data = await response.json();

              if (Array.isArray(data.results)) {
                resultMovies =
                  data.results.filter(
                    (movie) =>
                      movie.poster_path &&
                      movie.id !== sourceMovie.id
                  );
              }
            }
          } catch (error) {
            console.error(
              "Fallback Recommendation Error:",
              error
            );
          }
        }

        /*
          Remove duplicates
        */

        const seen = new Set();

        const uniqueMovies = resultMovies.filter(
          (movie) => {
            if (seen.has(movie.id)) {
              return false;
            }

            seen.add(movie.id);

            return true;
          }
        );

        const finalMovies =
          uniqueMovies.slice(0, 6);

        if (!active) {
          return;
        }

        setRecommendations(finalMovies);

        /*
          Recommendation explanation
        */

        const reasonParts = [];

        if (intent.genre) {
          reasonParts.push(
            intent.genre.name
          );
        }

        if (intent.language) {
          reasonParts.push(
            intent.language.name
          );
        }

        if (intent.similarRequest) {
          reasonParts.push(
            "similar movies"
          );
        }

        if (reasonParts.length > 0) {
          setReason(
            "Based on your search: " +
              reasonParts.join(" + ")
          );
        } else {
          setReason(
            "Movies you may enjoy based on your search"
          );
        }
      } catch (error) {
        console.error(
          "Smart Recommendation Error:",
          error
        );

        if (active) {
          setRecommendations([]);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadRecommendations();

    return () => {
      active = false;
    };
  }, [query, movies]);

  if (!query.trim()) {
    return null;
  }

  if (
    !loading &&
    recommendations.length === 0
  ) {
    return null;
  }

  return (
    <section className="recommendation-section">
      <div className="recommendation-header">
        <div>
          <h2>
            ✨ Recommended for You
          </h2>

          <p>{reason}</p>
        </div>
      </div>

      {loading ? (
        <div className="recommendation-grid">
          {Array.from({ length: 6 }).map(
            (_, index) => (
              <div
                className="recommendation-skeleton"
                key={index}
              />
            )
          )}
        </div>
      ) : (
        <div className="recommendation-grid">
          {recommendations.map(
            (movie) => (
              <button
                type="button"
                className="recommendation-card"
                key={movie.id}
                onClick={() =>
                  navigate(
                    "/movie/" + movie.id
                  )
                }
              >
                <div className="recommendation-poster">
                  <img
                    src={
                      "https://image.tmdb.org/t/p/w500" +
                      movie.poster_path
                    }
                    alt={movie.title}
                  />

                  <span>
                    ⭐{" "}
                    {movie.vote_average
                      ? movie.vote_average.toFixed(
                          1
                        )
                      : "N/A"}
                  </span>
                </div>

                <div className="recommendation-info">
                  <h3>{movie.title}</h3>

                  <p>
                    {movie.release_date ||
                      "Unknown"}
                  </p>
                </div>
              </button>
            )
          )}
        </div>
      )}
    </section>
  );
}

export default SmartRecommendations;