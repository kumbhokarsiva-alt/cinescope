import { useEffect, useState } from "react";

function ThemeToggle() {
  const [lightMode, setLightMode] = useState(() => {
    return localStorage.getItem("cinescope-theme") === "light";
  });

  useEffect(() => {
    if (lightMode) {
      document.body.classList.add("cinescope-light");
      localStorage.setItem("cinescope-theme", "light");
    } else {
      document.body.classList.remove("cinescope-light");
      localStorage.setItem("cinescope-theme", "dark");
    }
  }, [lightMode]);

  return (
    <>
      <style>
        {`
          body.cinescope-light {
            background: #f5f5f5 !important;
            color: #222 !important;
          }

          body.cinescope-light .app {
            background: #f5f5f5 !important;
            color: #222 !important;
          }

          body.cinescope-light .navbar {
            background: #ffffff !important;
            color: #222 !important;
            border-bottom: 1px solid #dddddd !important;
          }

          body.cinescope-light .navbar h1 {
            color: #222 !important;
          }

          body.cinescope-light .nav-links span {
            color: #555 !important;
          }

          body.cinescope-light .nav-links .active-link {
            color: #111 !important;
          }

          body.cinescope-light .hero h2,
          body.cinescope-light .section-header h2,
          body.cinescope-light .trending-heading h2,
          body.cinescope-light .details-info h1,
          body.cinescope-light .details-info h3,
          body.cinescope-light .cast-section h2,
          body.cinescope-light .similar-section h2,
          body.cinescope-light .trailer-section h2 {
            color: #222 !important;
          }

          body.cinescope-light .hero p,
          body.cinescope-light .trending-heading p,
          body.cinescope-light .movie-info p,
          body.cinescope-light .details-info p,
          body.cinescope-light .cast-info p,
          body.cinescope-light .trailer-message {
            color: #555 !important;
          }

          body.cinescope-light .search-box input,
          body.cinescope-light .filters select {
            background: #ffffff !important;
            color: #222 !important;
            border: 1px solid #cccccc !important;
          }

          body.cinescope-light .movie-card,
          body.cinescope-light .cast-card {
            background: #ffffff !important;
            border: 1px solid #dddddd !important;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08) !important;
          }

          body.cinescope-light .movie-info h3,
          body.cinescope-light .cast-info h3 {
            color: #222 !important;
          }

          body.cinescope-light .back-button,
          body.cinescope-light .load-more {
            background: #222 !important;
            color: #ffffff !important;
          }

          body.cinescope-light .empty-favorites {
            color: #222 !important;
          }

          body.cinescope-light .movie-details {
            background: #f5f5f5 !important;
            color: #222 !important;
          }

          body.cinescope-light .tagline {
            color: #666 !important;
          }

          .theme-toggle-button {
            position: fixed;
            right: 20px;
            bottom: 20px;
            z-index: 9999;
            border: none;
            border-radius: 50px;
            padding: 12px 18px;
            font-size: 15px;
            font-weight: 600;
            cursor: pointer;
            background: #222;
            color: #fff;
            box-shadow: 0 5px 20px rgba(0, 0, 0, 0.25);
          }

          .theme-toggle-button:hover {
            transform: translateY(-2px);
          }
        `}
      </style>

      <button
        className="theme-toggle-button"
        onClick={() => setLightMode(!lightMode)}
      >
        {lightMode ? "🌙 Dark Mode" : "☀️ Light Mode"}
      </button>
    </>
  );
}

export default ThemeToggle;