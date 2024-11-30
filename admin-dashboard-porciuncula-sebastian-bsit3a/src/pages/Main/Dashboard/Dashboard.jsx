import { useState, useEffect } from "react";
import axios from "axios";
import "./Dashboard.css";

function Dashboard() {
  const [trendingMovies, setTrendingMovies] = useState({
    today: [],
    week: [],
    month: [],
  });
  const [savedMovies, setSavedMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("today");
  const [showMovieSelector, setShowMovieSelector] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [trailerUrl, setTrailerUrl] = useState("");
  const [expandedTrendingMovie, setExpandedTrendingMovie] = useState(null);

  const accessToken = localStorage.getItem("accessToken");

  useEffect(() => {
    const fetchSavedMovies = async () => {
      try {
        const response = await axios.get("/movies", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        setSavedMovies(response.data);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching saved movies", error);
      }
    };
    fetchSavedMovies();
  }, [accessToken]);

  useEffect(() => {
    const savedTrendingMovies = localStorage.getItem("trendingMovies");
    if (savedTrendingMovies) {
      setTrendingMovies(JSON.parse(savedTrendingMovies));
    }
  }, []);

  useEffect(() => {
    if (
      trendingMovies.today.length ||
      trendingMovies.week.length ||
      trendingMovies.month.length
    ) {
      localStorage.setItem("trendingMovies", JSON.stringify(trendingMovies));
    }
  }, [trendingMovies]);

  const fetchTrailer = async (movieId) => {
    try {
      const response = await axios.get(
        `https://api.themoviedb.org/3/movie/${movieId}/videos?api_key=YOUR_API_KEY`
      );
      const trailers = response.data.results.filter(
        (video) => video.type === "Trailer" && video.site === "YouTube"
      );
      if (trailers.length > 0) {
        setTrailerUrl(`https://www.youtube.com/watch?v=${trailers[0].key}`);
      } else {
        setTrailerUrl("");
      }
    } catch (error) {
      console.error("Error fetching trailer", error);
    }
  };

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    setShowMovieSelector(false);
  };

  const handleMovieSelect = (movie) => {
    setSelectedMovie(movie);
    fetchTrailer(movie.tmdbId);
  };

  const handleAddMovieToTrending = () => {
    if (selectedMovie && selectedCategory) {
      setTrendingMovies((prevState) => {
        const updatedState = { ...prevState };
        if (
          !updatedState[selectedCategory].some(
            (m) => m.tmdbId === selectedMovie.tmdbId
          )
        ) {
          updatedState[selectedCategory].push(selectedMovie);
        }
        return updatedState;
      });
      setSelectedMovie(null);
      setShowMovieSelector(false);
    }
  };

  const handleRemoveMovieFromTrending = (movie, category) => {
    setTrendingMovies((prevState) => {
      const updatedState = { ...prevState };
      updatedState[category] = updatedState[category].filter(
        (m) => m.tmdbId !== movie.tmdbId
      );
      return { ...updatedState };
    });
  };

  const handleTrendingMovieExpand = (movie) => {
    setExpandedTrendingMovie(movie);
    fetchTrailer(movie.tmdbId);
  };

  const closeExpandedView = () => {
    setSelectedMovie(null);
    setExpandedTrendingMovie(null);
    setTrailerUrl("");
  };

  const closeSelectedMovie = () => {
    setSelectedMovie(null);
  };

  return (
    <div className="dashboard">
      <h1 className="dashboard-title">Dashboard</h1>

      <section className="movies-section">
        <div className="trending-header">
          <h2>TRENDING</h2>
          <div className="trending-buttons">
            <button
              onClick={() => handleCategoryClick("today")}
              className={selectedCategory === "today" ? "active" : ""}
            >
              Today
            </button>
            <button
              onClick={() => handleCategoryClick("week")}
              className={selectedCategory === "week" ? "active" : ""}
            >
              This Week
            </button>
            <button
              onClick={() => handleCategoryClick("month")}
              className={selectedCategory === "month" ? "active" : ""}
            >
              This Month
            </button>
          </div>
        </div>

        {selectedCategory && (
          <div className="view-trending-section">
            <h3>{`Trending For ${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}`}</h3>
            <div className="movie-cards">
              {trendingMovies[selectedCategory].length > 0 ? (
                trendingMovies[selectedCategory].map((movie) => (
                  <div
                    className="movie-card trending"
                    key={movie.tmdbId}
                    onClick={() => handleTrendingMovieExpand(movie)}
                  >
                    <img src={movie.posterPath} alt={movie.title} />
                    <h3>{movie.title}</h3>
                    <button
                      className="remove-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveMovieFromTrending(movie, selectedCategory);
                      }}
                    >
                      Remove
                    </button>
                  </div>
                ))
              ) : (
                <p>No movies selected for trending.</p>
              )}
            </div>

            <div className="add-movie-btn-container">
              <button
                className="add-movie-btn"
                onClick={() => setShowMovieSelector((prev) => !prev)}
              >
                Select a Movie to Add
              </button>
            </div>
          </div>
        )}

        {expandedTrendingMovie && (
          <div className="expanded-movie-view">
            <div className="expanded-poster">
              <img src={expandedTrendingMovie.posterPath} alt="Movie Poster" />
            </div>
            <div className="movie-details">
              <h3>{expandedTrendingMovie.title}</h3>
              <p>
                <strong>Overview:</strong> {expandedTrendingMovie.overview}
              </p>
              <p>
                <strong>Popularity:</strong>{" "}
                <span>{Math.round(expandedTrendingMovie.popularity)}</span>
              </p>
              <div className="expanded-actions">
                {trailerUrl && (
                  <button onClick={() => window.open(trailerUrl, "_blank")}>
                    Watch Trailer
                  </button>
                )}
                <button className="close-expanded-view" onClick={closeExpandedView}>
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {showMovieSelector && (
          <div className="movie-selector-dialog">
            <h3>Select a Movie to Add</h3>
            <div className="movie-grid-scrollable">
              <div className="movie-grid">
                {savedMovies.map((movie) => (
                  <div
                    key={movie.tmdbId}
                    className="movie-card"
                    onClick={() => handleMovieSelect(movie)}
                  >
                    <img src={movie.posterPath} alt={movie.title} />
                    <h3>{movie.title}</h3>
                  </div>
                ))}
              </div>
            </div>
            {selectedMovie && (
              <div className="expanded-movie-view">
                <div className="expanded-poster">
                  <img src={selectedMovie.posterPath} alt="Movie Poster" />
                </div>
                <div className="movie-details">
                  <h3>{selectedMovie.title}</h3>
                  <p>
                    <strong>Overview:</strong> {selectedMovie.overview}
                  </p>
                  <p>
                    <strong>Popularity:</strong> {selectedMovie.popularity}
                  </p>
                  <p>
                    <strong>Release Date:</strong> {selectedMovie.releaseDate}
                  </p>
                  <p>
                    <strong>Vote Average:</strong> {selectedMovie.voteAverage}
                  </p>
                  <div className="movie-selection-actions">
                    <button onClick={handleAddMovieToTrending}>
                      Add to Trending{` for ${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}`}
                    </button>
                    <button onClick={closeSelectedMovie}>Cancel</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}

export default Dashboard;
