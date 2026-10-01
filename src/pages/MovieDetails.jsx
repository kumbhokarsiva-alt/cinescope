import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const BACKEND_URL = "https://cinescope-fk07.onrender.com";
const IMAGE_URL = "https://image.tmdb.org/t/p/w500";

function MovieDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [movie, setMovie] = useState(null);
  const [cast, setCast] = useState([]);
  const [similar, setSimilar] = useState([]);
  const [trailer, setTrailer] = useState(null);

  const [providers, setProviders] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState("IN");

  const [loading, setLoading] = useState(true);
  const [providerLoading, setProviderLoading] = useState(true);
  const [error, setError] = useState("");

  const countries = [
    { code: "IN", name: "🇮🇳 India" },
    { code: "US", name: "🇺🇸 United States" },
    { code: "GB", name: "🇬🇧 United Kingdom" },
    { code: "CA", name: "🇨🇦 Canada" },
    { code: "AU", name: "🇦🇺 Australia" },
  ];

  useEffect(() => {
    async function loadMovie() {
      try {
        setLoading(true);
        setError("");

        const [movieRes, castRes, similarRes, videoRes] =
          await Promise.all([
            fetch(`${BACKEND_URL}/api/movies/${id}`),
            fetch(`${BACKEND_URL}/api/cast/${id}`),
            fetch(`${BACKEND_URL}/api/similar/${id}`),
            fetch(`${BACKEND_URL}/api/movies/${id}/videos`),
          ]);

        const movieData = await movieRes.json();
        const castData = await castRes.json();
        const similarData = await similarRes.json();
        const videoData = await videoRes.json();

        if (!movieRes.ok) {
          throw new Error(
            movieData.message || "Failed to load movie"
          );
        }

        setMovie(movieData);

        setCast(
          (castData.cast || [])
            .filter((actor) => actor.profile_path)
            .slice(0, 12)
        );

        setSimilar(
          (similarData.results || [])
            .filter((item) => item.poster_path)
            .slice(0, 8)
        );

        const videos = videoData.results || [];

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
            (video) => video.site === "YouTube"
          );

        setTrailer(selectedTrailer || null);

        try {
          const recent =
            JSON.parse(
              localStorage.getItem("recentlyViewed")
            ) || [];

          const filtered = recent.filter(
            (item) => item.id !== movieData.id
          );

          localStorage.setItem(
            "recentlyViewed",
            JSON.stringify(
              [movieData, ...filtered].slice(0, 12)
            )
          );
        } catch (storageError) {
          console.error(
            "Recently viewed error:",
            storageError
          );
        }
      } catch (err) {
        console.error("Movie Details Error:", err);
        setError(
          err.message || "Something went wrong"
        );
      } finally {
        setLoading(false);
      }
    }

    loadMovie();
  }, [id]);

  useEffect(() => {
    async function loadProviders() {
      try {
        setProviderLoading(true);

        const response = await fetch(
          `${BACKEND_URL}/api/movies/${id}/providers`
        );

        const data = await response.json();

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

  function handleShare() {
    const shareData = {
      title: movie?.title || "CineScope",
      text: `Check out ${movie?.title} on CineScope!`,
      url: window.location.href,
    };

    if (navigator.share) {
      navigator.share(shareData).catch(() => {});
      return;
    }

    if (navigator.clipboard) {
      navigator.clipboard
        .writeText(window.location.href)
        .then(() => alert("Movie link copied!"))
        .catch(() => alert("Could not copy link."));
    }
  }

  function formatMoney(amount) {
    if (!amount || amount <= 0) {
      return "N/A";
    }

    if (amount >= 1000000000) {
      return `$${(amount / 1000000000).toFixed(2)}B`;
    }

    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(2)}M`;
    }

    if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}K`;
    }

    return `$${amount}`;
  }

  function formatNumber(number) {
    if (number === null || number === undefined) {
      return "N/A";
    }

    return new Intl.NumberFormat("en-US").format(number);
  }

  function ProviderGroup({ title, providersList }) {
    if (!providersList || providersList.length === 0) {
      return null;
    }

    return (
      <div className="provider-group">
        <h3>{title}</h3>

        <div className="provider-list">
          {providersList.map((provider) => (
            <div
              className="provider-card"
              key={provider.provider_id}
            >
              {provider.logo_path ? (
                <img
                  src={`https://image.tmdb.org/t/p/w92${provider.logo_path}`}
                  alt={provider.provider_name}
                />
              ) : (
                <div className="provider-no-image">
                  TV
                </div>
              )}

              <p>{provider.provider_name}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="page-container">
        <h2>Loading movie...</h2>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="page-container">
        <button
          className="back-button"
          onClick={() => navigate(-1)}
        >
          ← Go Back
        </button>

        <h2>
          {error || "Movie not found"}
        </h2>
      </div>
    );
  }

  const currentProviders =
    providers?.results?.[selectedCountry];

  return (
    <div className="page-container movie-details-page">

      {/* BACK */}
      <button
        className="back-button"
        onClick={() => navigate(-1)}
      >
        ← Go Back
      </button>

      {/* MOVIE DETAILS */}
      <section className="movie-details-content">
        <div className="movie-details-poster">
          {movie.poster_path ? (
            <img
              src={`${IMAGE_URL}${movie.poster_path}`}
              alt={movie.title}
            />
          ) : (
            <div className="movie-no-image">
              No Image
            </div>
          )}
        </div>

        <div className="movie-details-info">
          <h1>{movie.title}</h1>

          {movie.tagline && (
            <p className="movie-tagline">
              "{movie.tagline}"
            </p>
          )}

          <div className="movie-details-meta">
            <span>
              ⭐{" "}
              {movie.vote_average
                ? movie.vote_average.toFixed(1)
                : "N/A"}
            </span>

            <span>
              📅{" "}
              {movie.release_date || "Unknown"}
            </span>

            {movie.runtime > 0 && (
              <span>
                ⏱️ {movie.runtime} min
              </span>
            )}
          </div>

          {movie.genres?.length > 0 && (
            <div className="movie-genres">
              {movie.genres.map((genre) => (
                <span key={genre.id}>
                  {genre.name}
                </span>
              ))}
            </div>
          )}

          <p className="movie-details-overview">
            {movie.overview ||
              "No overview available."}
          </p>

          <div className="movie-details-actions">
            <button onClick={handleShare}>
              🔗 Share Movie
            </button>
          </div>
        </div>
      </section>

      {/* STATISTICS */}
      <section className="details-section">
        <h2>📊 Movie Statistics</h2>

        <div className="statistics-grid">
          <div className="stat-card">
            <p>TMDB Rating</p>
            <h3>
              ⭐{" "}
              {movie.vote_average
                ? movie.vote_average.toFixed(1)
                : "N/A"}
              <span>/10</span>
            </h3>
          </div>

          <div className="stat-card">
            <p>Vote Count</p>
            <h3>
              {formatNumber(movie.vote_count)}
            </h3>
          </div>

          <div className="stat-card">
            <p>Popularity</p>
            <h3>
              {movie.popularity
                ? Number(
                    movie.popularity
                  ).toFixed(1)
                : "N/A"}
            </h3>
          </div>

          <div className="stat-card">
            <p>Budget</p>
            <h3>
              {formatMoney(movie.budget)}
            </h3>
          </div>

          <div className="stat-card">
            <p>Revenue</p>
            <h3>
              {formatMoney(movie.revenue)}
            </h3>
          </div>

          <div className="stat-card">
            <p>Runtime</p>
            <h3>
              {movie.runtime
                ? `${movie.runtime} min`
                : "N/A"}
            </h3>
          </div>
        </div>
      </section>

      {/* WHERE TO WATCH */}
      <section className="details-section where-to-watch">
        <div className="watch-header">
          <div>
            <h2>📺 Where to Watch</h2>
            <p>
              Find where this movie is available.
            </p>
          </div>

          <select
            value={selectedCountry}
            onChange={(e) =>
              setSelectedCountry(e.target.value)
            }
          >
            {countries.map((country) => (
              <option
                key={country.code}
                value={country.code}
              >
                {country.name}
              </option>
            ))}
          </select>
        </div>

        {providerLoading ? (
          <p className="provider-message">
            Loading watch options...
          </p>
        ) : !providers ? (
          <div className="provider-empty">
            <h3>
              Unable to load watch options
            </h3>
            <p>
              Please try refreshing the page.
            </p>
          </div>
        ) : !currentProviders ? (
          <div className="provider-empty">
            <h3>
              No watch options found
            </h3>
            <p>
              This movie currently has no available
              providers for {selectedCountry}.
            </p>
          </div>
        ) : (
          <>
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
                href={currentProviders.link}
                target="_blank"
                rel="noreferrer"
              >
                🔎 View All Watch Options
              </a>
            )}
          </>
        )}

        <p className="provider-attribution">
          Availability data powered by JustWatch.
        </p>
      </section>

      {/* TRAILER */}
      {trailer?.key && (
        <section className="details-section trailer-section">
          <h2>🎬 Trailer</h2>

          <div className="trailer-container">
            <iframe
              src={`https://www.youtube.com/embed/${trailer.key}`}
              title={`${movie.title} Trailer`}
              allowFullScreen
            />
          </div>
        </section>
      )}

      {/* CAST */}
      <section className="details-section cast-section">
        <h2>🎭 Cast & Crew</h2>

        {cast.length === 0 ? (
          <p>No cast information available.</p>
        ) : (
          <div className="cast-grid">
            {cast.map((actor) => (
              <div
                className="cast-card"
                key={actor.id}
                onClick={() =>
                  navigate(`/actor/${actor.id}`)
                }
              >
                <img
                  src={`${IMAGE_URL}${actor.profile_path}`}
                  alt={actor.name}
                  loading="lazy"
                />

                <div className="cast-info">
                  <h3>{actor.name}</h3>
                  <p>
                    {actor.character ||
                      "Unknown role"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* SIMILAR MOVIES */}
      <section className="details-section similar-section">
        <h2>🎥 Similar Movies</h2>

        {similar.length === 0 ? (
          <p>
            No similar movies found.
          </p>
        ) : (
          <div className="similar-grid">
            {similar.map((item) => (
              <div
                className="similar-card"
                key={item.id}
                onClick={() =>
                  navigate(`/movie/${item.id}`)
                }
              >
                <img
                  src={`${IMAGE_URL}${item.poster_path}`}
                  alt={item.title}
                  loading="lazy"
                />

                <div className="similar-info">
                  <h3>{item.title}</h3>

                  <p>
                    ⭐{" "}
                    {item.vote_average
                      ? item.vote_average.toFixed(1)
                      : "N/A"}
                  </p>

                  {item.release_date && (
                    <p>
                      📅 {item.release_date}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default MovieDetails;