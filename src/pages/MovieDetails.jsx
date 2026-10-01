import { useEffect, useState } from "react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";

function MovieDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [movie, setMovie] = useState(null);
  const [cast, setCast] = useState([]);
  const [similar, setSimilar] = useState([]);
  const [trailer, setTrailer] = useState(null);

  const [providers, setProviders] = useState(null);
  const [selectedCountry, setSelectedCountry] =
    useState("IN");

  const [loading, setLoading] = useState(true);
  const [providerLoading, setProviderLoading] =
    useState(true);

  const [error, setError] = useState("");

  const countries = [
    {
      code: "IN",
      name: "🇮🇳 India",
    },
    {
      code: "US",
      name: "🇺🇸 United States",
    },
    {
      code: "GB",
      name: "🇬🇧 United Kingdom",
    },
    {
      code: "CA",
      name: "🇨🇦 Canada",
    },
    {
      code: "AU",
      name: "🇦🇺 Australia",
    },
  ];

  /* =========================
     LOAD MOVIE DATA
  ========================= */

  useEffect(() => {
    async function loadMovie() {
      try {
        setLoading(true);
        setError("");

        const movieResponse = await fetch(
          `https://cinescope-fk07.onrender.com/api/movies/${id}`
        );

        const castResponse = await fetch(
          `https://cinescope-fk07.onrender.com/api/cast/${id}`
        );

        const similarResponse = await fetch(
          `https://cinescope-fk07.onrender.com/api/similar/${id}`
        );

        const videoResponse = await fetch(
          `https://cinescope-fk07.onrender.com/api/movies/${id}/videos`
        );

        const movieData =
          await movieResponse.json();

        const castData =
          await castResponse.json();

        const similarData =
          await similarResponse.json();

        const videoData =
          await videoResponse.json();

        if (!movieResponse.ok) {
          throw new Error(
            movieData.message ||
              "Failed to load movie"
          );
        }

        setMovie(movieData);

        setCast(
          (castData.cast || []).slice(0, 12)
        );

        setSimilar(
          (similarData.results || []).slice(0, 8)
        );

        const videos =
          videoData.results || [];

        const selectedTrailer =
          videos.find(
            (video) =>
              video.site === "YouTube" &&
              video.type === "Trailer" &&
              video.official === true
          ) ||
          videos.find(
            (video) =>
              video.site === "YouTube" &&
              video.type === "Trailer"
          ) ||
          videos.find(
            (video) =>
              video.site === "YouTube"
          );

        setTrailer(
          selectedTrailer || null
        );

        /* Recently Viewed */

        const oldMovies =
          JSON.parse(
            localStorage.getItem(
              "recentlyViewed"
            )
          ) || [];

        const filteredMovies =
          oldMovies.filter(
            (item) =>
              item.id !== movieData.id
          );

        const updatedMovies = [
          movieData,
          ...filteredMovies,
        ].slice(0, 12);

        localStorage.setItem(
          "recentlyViewed",
          JSON.stringify(
            updatedMovies
          )
        );
      } catch (err) {
        console.error(
          "Movie Details Error:",
          err
        );

        setError(
          err.message ||
            "Something went wrong"
        );
      } finally {
        setLoading(false);
      }
    }

    loadMovie();
  }, [id]);

  /* =========================
     LOAD WATCH PROVIDERS
  ========================= */

  useEffect(() => {
    async function loadProviders() {
      try {
        setProviderLoading(true);

        const response = await fetch(
          `https://cinescope-fk07.onrender.com/api/movies/${id}/providers`
        );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Failed to load watch providers"
          );
        }

        setProviders(data);
      } catch (err) {
        console.error(
          "Watch Provider Error:",
          err
        );

        setProviders(null);
      } finally {
        setProviderLoading(false);
      }
    }

    loadProviders();
  }, [id]);

  /* =========================
     SHARE
  ========================= */

  function handleShare() {
    const shareData = {
      title:
        movie?.title || "CineScope",
      text: `Check out ${movie?.title} on CineScope!`,
      url: window.location.href,
    };

    if (navigator.share) {
      navigator
        .share(shareData)
        .catch(() => {});
    } else if (navigator.clipboard) {
      navigator.clipboard
        .writeText(
          window.location.href
        )
        .then(() => {
          alert(
            "Movie link copied!"
          );
        })
        .catch(() => {
          alert(
            "Could not copy link."
          );
        });
    }
  }

  /* =========================
     FORMAT MONEY
  ========================= */

  function formatMoney(amount) {
    if (!amount || amount <= 0) {
      return "N/A";
    }

    if (amount >= 1000000000) {
      return `$${(
        amount / 1000000000
      ).toFixed(2)}B`;
    }

    if (amount >= 1000000) {
      return `$${(
        amount / 1000000
      ).toFixed(2)}M`;
    }

    if (amount >= 1000) {
      return `$${(
        amount / 1000
      ).toFixed(0)}K`;
    }

    return `$${amount}`;
  }

  /* =========================
     FORMAT NUMBER
  ========================= */

  function formatNumber(number) {
    if (
      number === null ||
      number === undefined
    ) {
      return "N/A";
    }

    return new Intl.NumberFormat(
      "en-US"
    ).format(number);
  }

  /* =========================
     PROVIDER GROUP
  ========================= */

  function ProviderGroup({
    title,
    providersList,
  }) {
    if (
      !providersList ||
      providersList.length === 0
    ) {
      return null;
    }

    return (
      <div className="provider-group">
        <h3>{title}</h3>

        <div className="provider-list">
          {providersList.map(
            (provider) => (
              <div
                className="provider-card"
                key={
                  provider.provider_id
                }
              >
                {provider.logo_path ? (
                  <img
                    src={`https://image.tmdb.org/t/p/w92${provider.logo_path}`}
                    alt={
                      provider.provider_name
                    }
                  />
                ) : (
                  <div className="provider-no-image">
                    TV
                  </div>
                )}

                <p>
                  {
                    provider.provider_name
                  }
                </p>
              </div>
            )
          )}
        </div>
      </div>
    );
  }

  /* =========================
     LOADING
  ========================= */

  if (loading) {
    return (
      <div className="page-container">
        <h2>
          Loading movie...
        </h2>
      </div>
    );
  }

  /* =========================
     ERROR
  ========================= */

  if (error || !movie) {
    return (
      <div className="page-container">
        <button
          className="back-button"
          onClick={() =>
            navigate(-1)
          }
        >
          ← Go Back
        </button>

        <h2>
          {error ||
            "Movie not found"}
        </h2>
      </div>
    );
  }

  const currentProviders =
    providers?.results?.[
      selectedCountry
    ];

  return (
    <div className="page-container movie-details-page">

      {/* BACK BUTTON */}

      <button
        className="back-button"
        onClick={() =>
          navigate(-1)
        }
      >
        ← Go Back
      </button>

      {/* =========================
          MOVIE DETAILS
      ========================= */}

      <section className="movie-details">

        <div className="movie-details-poster">
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
        </div>

        <div className="movie-details-info">

          <h1>
            {movie.title}
          </h1>

          {movie.tagline && (
            <p className="movie-tagline">
              "{movie.tagline}"
            </p>
          )}

          <div className="details-meta">

            <span>
              ⭐{" "}
              {movie.vote_average
                ? movie.vote_average.toFixed(
                    1
                  )
                : "N/A"}
            </span>

            <span>
              📅{" "}
              {movie.release_date ||
                "Unknown"}
            </span>

            {movie.runtime > 0 && (
              <span>
                ⏱️{" "}
                {movie.runtime} min
              </span>
            )}

          </div>

          {movie.genres?.length > 0 && (
            <div className="genre-list">

              {movie.genres.map(
                (genre) => (
                  <span
                    key={genre.id}
                  >
                    {genre.name}
                  </span>
                )
              )}

            </div>
          )}

          <h2>
            Overview
          </h2>

          <p className="movie-overview">
            {movie.overview ||
              "No overview available."}
          </p>

          <button
            className="share-button"
            onClick={
              handleShare
            }
          >
            🔗 Share Movie
          </button>

        </div>
      </section>

      {/* =========================
          MOVIE STATISTICS
      ========================= */}

      <section className="movie-statistics">

        <div className="stats-heading">
          <h2>
            📊 Movie Statistics
          </h2>

          <p>
            Detailed information
            about this movie.
          </p>
        </div>

        <div className="stats-grid">

          <div className="stat-card">
            <div className="stat-icon">
              ⭐
            </div>

            <div>
              <p className="stat-label">
                TMDB Rating
              </p>

              <h3>
                {movie.vote_average
                  ? movie.vote_average.toFixed(
                      1
                    )
                  : "N/A"}
                <span>
                  / 10
                </span>
              </h3>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              👥
            </div>

            <div>
              <p className="stat-label">
                Vote Count
              </p>

              <h3>
                {formatNumber(
                  movie.vote_count
                )}
              </h3>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              🔥
            </div>

            <div>
              <p className="stat-label">
                Popularity
              </p>

              <h3>
                {movie.popularity
                  ? Number(
                      movie.popularity
                    ).toFixed(1)
                  : "N/A"}
              </h3>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              💵
            </div>

            <div>
              <p className="stat-label">
                Budget
              </p>

              <h3>
                {formatMoney(
                  movie.budget
                )}
              </h3>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              💰
            </div>

            <div>
              <p className="stat-label">
                Revenue
              </p>

              <h3>
                {formatMoney(
                  movie.revenue
                )}
              </h3>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              ⏱️
            </div>

            <div>
              <p className="stat-label">
                Runtime
              </p>

              <h3>
                {movie.runtime
                  ? `${movie.runtime} min`
                  : "N/A"}
              </h3>
            </div>
          </div>

        </div>
      </section>

      {/* =========================
          WHERE TO WATCH
      ========================= */}

      <section className="where-to-watch">

        <div className="watch-header">

          <div>
            <h2>
              📺 Where to Watch
            </h2>

            <p>
              Find where this movie
              is available.
            </p>
          </div>

          <select
            value={selectedCountry}
            onChange={(e) =>
              setSelectedCountry(
                e.target.value
              )
            }
          >
            {countries.map(
              (country) => (
                <option
                  key={
                    country.code
                  }
                  value={
                    country.code
                  }
                >
                  {country.name}
                </option>
              )
            )}
          </select>

        </div>

        {providerLoading ? (
          <p className="provider-message">
            Loading watch options...
          </p>
        ) : !providers ? (
          <div className="provider-empty">
            <h3>
              Unable to load watch
              options
            </h3>

            <p>
              Please try refreshing
              the page.
            </p>
          </div>
        ) : !currentProviders ? (
          <div className="provider-empty">
            <h3>
              No watch options
              found
            </h3>

            <p>
              This movie currently
              has no available
              providers for{" "}
              {selectedCountry}.
            </p>
          </div>
        ) : (
          <div>

            <ProviderGroup
              title="▶ Stream"
              providersList={
                currentProviders.flatrate
              }
            />

            <ProviderGroup
              title="🆓 Free / Ads"
              providersList={
                currentProviders.free
              }
            />

            <ProviderGroup
              title="💰 Rent"
              providersList={
                currentProviders.rent
              }
            />

            <ProviderGroup
              title="🛒 Buy"
              providersList={
                currentProviders.buy
              }
            />

            {currentProviders.link && (
              <a
                className="provider-link"
                href={
                  currentProviders.link
                }
                target="_blank"
                rel="noreferrer"
              >
                🔎 View All Watch Options
              </a>
            )}

          </div>
        )}

        <p className="provider-attribution">
          Availability data powered
          by JustWatch.
        </p>

      </section>

      {/* =========================
          TRAILER
      ========================= */}

      {trailer &&
        trailer.key && (
          <section className="trailer-section">

            <h2>
              🎬 Trailer
            </h2>

            <div className="trailer-container">

              <iframe
                src={`https://www.youtube.com/embed/${trailer.key}`}
                title={`${movie.title} Trailer`}
                allowFullScreen
              ></iframe>

            </div>

          </section>
        )}

      {/* =========================
          CAST
      ========================= */}

      <section className="cast-section">

        <h2>
          🎭 Cast & Crew
        </h2>

        {cast.length === 0 ? (
          <p>
            No cast information
            available.
          </p>
        ) : (
          <div className="cast-grid">

            {cast.map(
              (actor) => (
                <div
                  className="cast-card"
                  key={actor.id}
                  onClick={() =>
                    navigate(
                      `/actor/${actor.id}`
                    )
                  }
                >

                  {actor.profile_path ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w500${actor.profile_path}`}
                      alt={
                        actor.name
                      }
                    />
                  ) : (
                    <div className="cast-no-image">
                      No Image
                    </div>
                  )}

                  <h3>
                    {actor.name}
                  </h3>

                  <p>
                    {actor.character ||
                      "Unknown role"}
                  </p>

                </div>
              )
            )}

          </div>
        )}

      </section>

      {/* =========================
          SIMILAR MOVIES
      ========================= */}

      <section className="similar-section">

        <h2>
          🎥 Similar Movies
        </h2>

        {similar.length === 0 ? (
          <p>
            No similar movies
            found.
          </p>
        ) : (
          <div className="movie-grid">

            {similar.map(
              (item) => (
                <div
                  className="movie-card"
                  key={item.id}
                >

                  <div
                    onClick={() =>
                      navigate(
                        `/movie/${item.id}`
                      )
                    }
                  >
                    {item.poster_path ? (
                      <img
                        src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                        alt={
                          item.title
                        }
                      />
                    ) : (
                      <div className="movie-no-image">
                        No Image
                      </div>
                    )}
                  </div>

                  <div className="movie-card-content">

                    <h3>
                      {item.title}
                    </h3>

                    <p>
                      ⭐{" "}
                      {item.vote_average
                        ? item.vote_average.toFixed(
                            1
                          )
                        : "N/A"}
                    </p>

                    <p>
                      📅{" "}
                      {item.release_date ||
                        "Unknown"}
                    </p>

                  </div>

                </div>
              )
            )}

          </div>
        )}

      </section>

    </div>
  );
}

export default MovieDetails;