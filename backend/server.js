const express = require("express");
const cors = require("cors");
const axios = require("axios");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

const TMDB_TOKEN = (process.env.TMDB_TOKEN || "")
  .trim()
  .replace(/^["']|["']$/g, "");

app.use(cors());
app.use(express.json());

function tmdbConfig(params = {}) {
  return {
    headers: {
      Authorization: `Bearer ${TMDB_TOKEN}`,
      Accept: "application/json"
    },
    params,
    timeout: 20000
  };
}

/* =========================
   BASIC
========================= */

app.get("/", (req, res) => {
  res.json({
    message: "CineScope Backend is running!",
    tmdbTokenLoaded: Boolean(TMDB_TOKEN)
  });
});

app.get("/api/test", (req, res) => {
  res.json({
    message: "Backend is connected!",
    tmdbTokenLoaded: Boolean(TMDB_TOKEN)
  });
});

/* =========================
   POPULAR
========================= */

app.get("/api/movies/popular", async (req, res) => {
  try {
    if (!TMDB_TOKEN) {
      return res.status(500).json({
        message: "TMDB_TOKEN is missing in .env"
      });
    }

    const page = Number(req.query.page) || 1;

    const response = await axios.get(
      `${TMDB_BASE_URL}/movie/popular`,
      tmdbConfig({
        language: "en-US",
        page
      })
    );

    res.json(response.data);
  } catch (error) {
    console.error("POPULAR ERROR");
    console.error("STATUS:", error.response?.status);
    console.error("DATA:", error.response?.data);
    console.error("MESSAGE:", error.message);

    res.status(error.response?.status || 500).json({
      message: "Failed to fetch popular movies",
      tmdbError: error.response?.data || null,
      error: error.message
    });
  }
});

/* =========================
   TOP RATED
========================= */

app.get("/api/top-rated", async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;

    const response = await axios.get(
      `${TMDB_BASE_URL}/movie/top_rated`,
      tmdbConfig({
        language: "en-US",
        page
      })
    );

    res.json(response.data);
  } catch (error) {
    console.error("TOP RATED ERROR");
    console.error("STATUS:", error.response?.status);
    console.error("DATA:", error.response?.data);
    console.error("MESSAGE:", error.message);

    res.status(error.response?.status || 500).json({
      message: "Failed to fetch top rated movies",
      tmdbError: error.response?.data || null,
      error: error.message
    });
  }
});

/* =========================
   UPCOMING
========================= */

app.get("/api/upcoming", async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;

    const response = await axios.get(
      `${TMDB_BASE_URL}/movie/upcoming`,
      tmdbConfig({
        language: "en-US",
        page
      })
    );

    res.json(response.data);
  } catch (error) {
    console.error("UPCOMING ERROR");
    console.error("STATUS:", error.response?.status);
    console.error("DATA:", error.response?.data);
    console.error("MESSAGE:", error.message);

    res.status(error.response?.status || 500).json({
      message: "Failed to fetch upcoming movies",
      tmdbError: error.response?.data || null,
      error: error.message
    });
  }
});

/* =========================
   SEARCH
========================= */

app.get("/api/movies/search", async (req, res) => {
  try {
    const query = String(
      req.query.query || ""
    ).trim();

    const page = Number(req.query.page) || 1;

    if (!query) {
      return res.status(400).json({
        message: "Search query is required"
      });
    }

    const response = await axios.get(
      `${TMDB_BASE_URL}/search/movie`,
      tmdbConfig({
        query,
        page,
        language: "en-US",
        include_adult: false
      })
    );

    res.json(response.data);
  } catch (error) {
    console.error("SEARCH ERROR");
    console.error("STATUS:", error.response?.status);
    console.error("DATA:", error.response?.data);
    console.error("MESSAGE:", error.message);

    res.status(error.response?.status || 500).json({
      message: "Failed to search movies",
      tmdbError: error.response?.data || null,
      error: error.message
    });
  }
});

/* =========================
   DISCOVER
========================= */

app.get("/api/movies/discover", async (req, res) => {
  try {
    const genre = req.query.genre || "all";
    const year = req.query.year || "all";
    const language =
      req.query.original_language || "all";

    const page = Number(req.query.page) || 1;

    const params = {
      language: "en-US",
      page,
      sort_by: "popularity.desc",
      include_adult: false
    };

    if (genre !== "all") {
      params.with_genres = genre;
    }

    if (year !== "all") {
      params.primary_release_year = year;
    }

    if (language !== "all") {
      params.with_original_language = language;
    }

    const response = await axios.get(
      `${TMDB_BASE_URL}/discover/movie`,
      tmdbConfig(params)
    );

    let results = response.data.results || [];

    if (language !== "all") {
      results = results.filter(
        (movie) =>
          movie.original_language === language
      );
    }

    res.json({
      ...response.data,
      results
    });
  } catch (error) {
    console.error("DISCOVER ERROR");
    console.error("STATUS:", error.response?.status);
    console.error("DATA:", error.response?.data);
    console.error("MESSAGE:", error.message);

    res.status(error.response?.status || 500).json({
      message: "Failed to discover movies",
      tmdbError: error.response?.data || null,
      error: error.message
    });
  }
});

/* =========================
   TRENDING
========================= */

app.get("/api/movies/trending", async (req, res) => {
  try {
    const response = await axios.get(
      `${TMDB_BASE_URL}/trending/movie/week`,
      tmdbConfig({
        language: "en-US"
      })
    );

    res.json(response.data);
  } catch (error) {
    console.error("TRENDING ERROR");
    console.error("STATUS:", error.response?.status);
    console.error("DATA:", error.response?.data);
    console.error("MESSAGE:", error.message);

    res.status(error.response?.status || 500).json({
      message: "Failed to fetch trending movies",
      tmdbError: error.response?.data || null,
      error: error.message
    });
  }
});

/* =========================
   MOVIE DETAILS
========================= */

app.get("/api/movies/:id", async (req, res) => {
  try {
    const response = await axios.get(
      `${TMDB_BASE_URL}/movie/${req.params.id}`,
      tmdbConfig({
        language: "en-US"
      })
    );

    res.json(response.data);
  } catch (error) {
    console.error("MOVIE DETAILS ERROR");
    console.error("STATUS:", error.response?.status);
    console.error("DATA:", error.response?.data);
    console.error("MESSAGE:", error.message);

    res.status(error.response?.status || 500).json({
      message: "Failed to fetch movie details",
      tmdbError: error.response?.data || null,
      error: error.message
    });
  }
});

/* =========================
   VIDEOS
========================= */

app.get(
  "/api/movies/:id/videos",
  async (req, res) => {
    try {
      const response = await axios.get(
        `${TMDB_BASE_URL}/movie/${req.params.id}/videos`,
        tmdbConfig({
          language: "en-US"
        })
      );

      res.json(response.data);
    } catch (error) {
      console.error("VIDEOS ERROR");
      console.error("STATUS:", error.response?.status);
      console.error("DATA:", error.response?.data);
      console.error("MESSAGE:", error.message);

      res.status(error.response?.status || 500).json({
        message: "Failed to fetch movie videos",
        tmdbError: error.response?.data || null,
        error: error.message
      });
    }
  }
);

/* =========================
   CAST
========================= */

app.get("/api/cast/:id", async (req, res) => {
  try {
    const response = await axios.get(
      `${TMDB_BASE_URL}/movie/${req.params.id}/credits`,
      tmdbConfig({
        language: "en-US"
      })
    );

    res.json(response.data);
  } catch (error) {
    console.error("CAST ERROR");
    console.error("STATUS:", error.response?.status);
    console.error("DATA:", error.response?.data);
    console.error("MESSAGE:", error.message);

    res.status(error.response?.status || 500).json({
      message: "Failed to fetch cast",
      tmdbError: error.response?.data || null,
      error: error.message
    });
  }
});

/* =========================
   SIMILAR
========================= */

app.get("/api/similar/:id", async (req, res) => {
  try {
    const response = await axios.get(
      `${TMDB_BASE_URL}/movie/${req.params.id}/similar`,
      tmdbConfig({
        language: "en-US",
        page: 1
      })
    );

    res.json(response.data);
  } catch (error) {
    console.error("SIMILAR ERROR");
    console.error("STATUS:", error.response?.status);
    console.error("DATA:", error.response?.data);
    console.error("MESSAGE:", error.message);

    res.status(error.response?.status || 500).json({
      message: "Failed to fetch similar movies",
      tmdbError: error.response?.data || null,
      error: error.message
    });
  }
});

/* =========================
   ACTOR
========================= */

app.get("/api/person/:id", async (req, res) => {
  try {
    const response = await axios.get(
      `${TMDB_BASE_URL}/person/${req.params.id}`,
      tmdbConfig({
        language: "en-US",
        append_to_response: "combined_credits"
      })
    );

    res.json(response.data);
  } catch (error) {
    console.error("ACTOR ERROR");
    console.error("STATUS:", error.response?.status);
    console.error("DATA:", error.response?.data);
    console.error("MESSAGE:", error.message);

    res.status(error.response?.status || 500).json({
      message: "Failed to fetch actor details",
      tmdbError: error.response?.data || null,
      error: error.message
    });
  }
});

/* =========================
   WATCH PROVIDERS
========================= */

app.get(
  "/api/movies/:id/providers",
  async (req, res) => {
    try {
      const response = await axios.get(
        `${TMDB_BASE_URL}/movie/${req.params.id}/watch/providers`,
        tmdbConfig()
      );

      res.json(response.data);
    } catch (error) {
      console.error("PROVIDER ERROR");
      console.error("STATUS:", error.response?.status);
      console.error("DATA:", error.response?.data);
      console.error("MESSAGE:", error.message);

      res.status(error.response?.status || 500).json({
        message: "Failed to fetch watch providers",
        tmdbError: error.response?.data || null,
        error: error.message
      });
    }
  }
);

/* =========================
   START SERVER
========================= */

app.listen(PORT, () => {
  console.log("----------------------------------");
  console.log(
    "CineScope Backend: http://localhost:" + PORT
  );
  console.log(
    "TMDB Token Loaded:",
    Boolean(TMDB_TOKEN)
  );
  console.log("----------------------------------");
});