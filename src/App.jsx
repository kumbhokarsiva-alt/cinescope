import { useEffect, useMemo, useState } from "react";
import { Link, Route, Routes, useLocation } from "react-router-dom";
import "./App.css";

import MovieDetails from "./pages/MovieDetails";
import ActorDetails from "./pages/ActorDetails";
import Trending from "./pages/Trending";
import TopRated from "./pages/TopRated";
import Upcoming from "./pages/Upcoming";
import Favorites from "./pages/Favorites";
import Watchlist from "./pages/Watchlist";
import RecentlyViewed from "./pages/RecentlyViewed";
import NotFound from "./pages/NotFound";

import ThemeToggle from "./ThemeToggle";
import FeaturedMovie from "./components/FeaturedMovie";

const API_BASE_URL = "https://cinescope-fk07.onrender.com/api";

function Home() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState("all");
  const [year, setYear] = useState("all");
  const [language, setLanguage] = useState("all");
  const [sortBy, setSortBy] = useState("popularity");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [favorites, setFavorites] = useState([]);
  const [watchlist, setWatchlist] = useState([]);

  const genres = [
    { id: "all", name: "All Genres" },
    { id: "28", name: "Action" },
    { id: "12", name: "Adventure" },
    { id: "16", name: "Animation" },
    { id: "35", name: "Comedy" },
    { id: "80", name: "Crime" },
    { id: "18", name: "Drama" },
    { id: "27", name: "Horror" },
    { id: "878", name: "Science Fiction" },
    { id: "53", name: "Thriller" },
    { id: "10749", name: "Romance" },
    { id: "14", name: "Fantasy" },
    { id: "9648", name: "Mystery" }
  ];

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const result = ["all"];

    for (let i = currentYear; i >= 1990; i--) {
      result.push(String(i));
    }

    return result;
  }, []);

  const languages = [
    { id: "all", name: "All Languages" },
    { id: "en", name: "English" },
    { id: "hi", name: "Hindi" },
    { id: "bn", name: "Bengali" },
    { id: "ko", name: "Korean" },
    { id: "ja", name: "Japanese" },
    { id: "es", name: "Spanish" },
    { id: "fr", name: "French" },
    { id: "de", name: "German" },
    { id: "zh", name: "Chinese" },
    { id: "ta", name: "Tamil" },
    { id: "te", name: "Telugu" },
    { id: "ml", name: "Malayalam" },
    { id: "mr", name: "Marathi" },
    { id: "pa", name: "Punjabi" }
  ];

  useEffect(() => {
    const savedFavorites = JSON.parse(
      localStorage.getItem("favorites") || "[]"
    );

    const savedWatchlist = JSON.parse(
      localStorage.getItem("watchlist") || "[]"
    );

    setFavorites(savedFavorites);
    setWatchlist(savedWatchlist);
  }, []);

  useEffect(() => {
    loadMovies(1, false);
  }, [genre, year, language]);

  async function loadMovies(targetPage = 1, append = false) {
    try {
      setLoading(true);

      let url = "";

      if (search.trim() !== "") {
        const params = new URLSearchParams();

        params.set("query", search.trim());
        params.set("page", String(targetPage));

        url =
          API_BASE_URL +
          "/movies/search?" +
          params.toString();
      } else {
        const params = new URLSearchParams();

        params.set("genre", genre);
        params.set("year", year);
        params.set("original_language", language);
        params.set("page", String(targetPage));

        url =
          API_BASE_URL +
          "/movies/discover?" +
          params.toString();
      }

      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.status_message ||
            "Failed to fetch movies"
        );
      }

      let resultMovies = Array.isArray(data.results)
        ? data.results.filter(
            (movie) => movie.poster_path
          )
        : [];

      if (sortBy === "rating") {
        resultMovies.sort(
          (a, b) =>
            (b.vote_average || 0) -
            (a.vote_average || 0)
        );
      }

      if (sortBy === "newest") {
        resultMovies.sort((a, b) =>
          (b.release_date || "").localeCompare(
            a.release_date || ""
          )
        );
      }

      if (sortBy === "oldest") {
        resultMovies.sort((a, b) =>
          (a.release_date || "").localeCompare(
            b.release_date || ""
          )
        );
      }

      if (append) {
        setMovies((previous) => [
          ...previous,
          ...resultMovies
        ]);
      } else {
        setMovies(resultMovies);
      }

      setPage(targetPage);
      setTotalPages(data.total_pages || 1);
    } catch (error) {
      console.error("Movie Fetch Error:", error);

      if (!append) {
        setMovies([]);
      }
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(event) {
    event.preventDefault();
    loadMovies(1, false);
  }

  function clearFilters() {
    setSearch("");
    setGenre("all");
    setYear("all");
    setLanguage("all");
    setSortBy("popularity");
  }

  function toggleFavorite(movie) {
    const exists = favorites.some(
      (item) => item.id === movie.id
    );

    const updatedFavorites = exists
      ? favorites.filter(
          (item) => item.id !== movie.id
        )
      : [...favorites, movie];

    setFavorites(updatedFavorites);

    localStorage.setItem(
      "favorites",
      JSON.stringify(updatedFavorites)
    );
  }

  function toggleWatchlist(movie) {
    const exists = watchlist.some(
      (item) => item.id === movie.id
    );

    const updatedWatchlist = exists
      ? watchlist.filter(
          (item) => item.id !== movie.id
        )
      : [...watchlist, movie];

    setWatchlist(updatedWatchlist);

    localStorage.setItem(
      "watchlist",
      JSON.stringify(updatedWatchlist)
    );
  }

  function isFavorite(id) {
    return favorites.some(
      (movie) => movie.id === id
    );
  }

  function isWatchlisted(id) {
    return watchlist.some(
      (movie) => movie.id === id
    );
  }

  return (
    <main>
      <FeaturedMovie />

      <div className="home-container">
        <section className="home-header">
          <h1>🎬 Discover Movies</h1>

          <p>
            Search, explore and save your favourite movies.
          </p>
        </section>

        <form
          className="filter-panel"
          onSubmit={handleSearch}
        >
          <div className="search-box">
            <input
              type="text"
              placeholder="Search movies..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
            />

            <button type="submit">
              🔍 Search
            </button>
          </div>

          <div className="filters-row">
            <select
              value={genre}
              onChange={(event) =>
                setGenre(event.target.value)
              }
            >
              {genres.map((item) => (
                <option
                  key={item.id}
                  value={item.id}
                >
                  {item.name}
                </option>
              ))}
            </select>

            <select
              value={year}
              onChange={(event) =>
                setYear(event.target.value)
              }
            >
              {years.map((item) => (
                <option
                  key={item}
                  value={item}
                >
                  {item === "all"
                    ? "All Years"
                    : item}
                </option>
              ))}
            </select>

            <select
              value={language}
              onChange={(event) =>
                setLanguage(event.target.value)
              }
            >
              {languages.map((item) => (
                <option
                  key={item.id}
                  value={item.id}
                >
                  {item.name}
                </option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(event) =>
                setSortBy(event.target.value)
              }
            >
              <option value="popularity">
                Popularity
              </option>

              <option value="rating">
                Rating
              </option>

              <option value="newest">
                Newest
              </option>

              <option value="oldest">
                Oldest
              </option>
            </select>

            <button
              type="button"
              className="clear-filter-btn"
              onClick={clearFilters}
            >
              Clear
            </button>
          </div>
        </form>

        <section className="movie-section">
          <div className="section-heading">
            <h2>
              {search.trim()
                ? "Search Results"
                : "Discover Movies"}
            </h2>

            <p>
              {movies.length} movie
              {movies.length !== 1
                ? "s"
                : ""}{" "}
              found
            </p>
          </div>

          {loading && movies.length === 0 ? (
            <div className="loading-grid">
              {Array.from({ length: 12 }).map(
                (_, index) => (
                  <div
                    className="skeleton-card"
                    key={index}
                  >
                    <div className="skeleton-poster"></div>

                    <div className="skeleton-line"></div>

                    <div className="skeleton-line small"></div>
                  </div>
                )
              )}
            </div>
          ) : movies.length === 0 ? (
            <div className="no-results">
              <div className="no-results-icon">
                😔
              </div>

              <h3>
                No movies found
              </h3>

              <p>
                Try another search or filter.
              </p>

              <button
                type="button"
                onClick={clearFilters}
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <>
              <div className="movie-grid">
                {movies.map((movie) => (
                  <article
                    className="movie-card"
                    key={movie.id}
                  >
                    <Link
                      to={
                        "/movie/" +
                        movie.id
                      }
                    >
                      <div className="movie-poster-wrapper">
                        <img
                          src={
                            "https://image.tmdb.org/t/p/w500" +
                            movie.poster_path
                          }
                          alt={movie.title}
                        />

                        <span className="movie-rating">
                          ⭐{" "}
                          {movie.vote_average
                            ? movie.vote_average.toFixed(
                                1
                              )
                            : "N/A"}
                        </span>
                      </div>

                      <div className="movie-card-content">
                        <h3>
                          {movie.title}
                        </h3>

                        <p>
                          {movie.release_date ||
                            "Unknown"}
                        </p>
                      </div>
                    </Link>

                    <div className="movie-card-actions">
                      <button
                        type="button"
                        onClick={() =>
                          toggleFavorite(movie)
                        }
                        title="Favorite"
                      >
                        {isFavorite(movie.id)
                          ? "❤️"
                          : "🤍"}
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          toggleWatchlist(movie)
                        }
                        title="Watchlist"
                      >
                        {isWatchlisted(movie.id)
                          ? "✅"
                          : "➕"}
                      </button>
                    </div>
                  </article>
                ))}
              </div>

              {page < totalPages && (
                <div className="load-more-wrapper">
                  <button
                    type="button"
                    className="load-more-btn"
                    disabled={loading}
                    onClick={() =>
                      loadMovies(
                        page + 1,
                        true
                      )
                    }
                  >
                    {loading
                      ? "Loading..."
                      : "Load More"}
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </main>
  );
}

function Navbar() {
  const location = useLocation();

  const links = [
    {
      path: "/",
      label: "Home"
    },
    {
      path: "/trending",
      label: "Trending"
    },
    {
      path: "/top-rated",
      label: "Top Rated"
    },
    {
      path: "/upcoming",
      label: "Upcoming"
    },
    {
      path: "/favorites",
      label: "Favorites"
    },
    {
      path: "/watchlist",
      label: "Watchlist"
    },
    {
      path: "/recently-viewed",
      label: "Recently Viewed"
    }
  ];

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link
          to="/"
          className="brand"
        >
          CineScope
        </Link>

        <div className="nav-links">
          {links.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={
                location.pathname ===
                link.path
                  ? "nav-link active"
                  : "nav-link"
              }
            >
              {link.label}
            </Link>
          ))}
        </div>

        <ThemeToggle />
      </div>
    </nav>
  );
}

function App() {
  return (
    <div className="app">
      <Navbar />

      <Routes>
        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/trending"
          element={<Trending />}
        />

        <Route
          path="/top-rated"
          element={<TopRated />}
        />

        <Route
          path="/upcoming"
          element={<Upcoming />}
        />

        <Route
          path="/favorites"
          element={<Favorites />}
        />

        <Route
          path="/watchlist"
          element={<Watchlist />}
        />

        <Route
          path="/recently-viewed"
          element={<RecentlyViewed />}
        />

        <Route
          path="/movie/:id"
          element={<MovieDetails />}
        />

        <Route
          path="/actor/:id"
          element={<ActorDetails />}
        />

        <Route
          path="*"
          element={<NotFound />}
        />
      </Routes>

      <footer className="footer">
        © 2026 CineScope · Movie discovery website
      </footer>
    </div>
  );
}

export default App;