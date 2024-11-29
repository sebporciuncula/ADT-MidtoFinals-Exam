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
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showMovieSelector, setShowMovieSelector] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);

  const accessToken = localStorage.getItem("accessToken");

  // Fetch Saved Movies
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

  // Fetch Trending Movies from localStorage on page load
  useEffect(() => {
    const savedTrendingMovies = localStorage.getItem("trendingMovies");
    if (savedTrendingMovies) {
      setTrendingMovies(JSON.parse(savedTrendingMovies));
    }
  }, []);

  // Save Trending Movies to localStorage whenever it changes
  useEffect(() => {
    if (trendingMovies.today.length || trendingMovies.week.length || trendingMovies.month.length) {
      localStorage.setItem("trendingMovies", JSON.stringify(trendingMovies));
    }
  }, [trendingMovies]);

  // Handle Category Click for Trending (Today, Week, Month)
  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    setShowMovieSelector(true);
  };

  // Handle Movie Selection
  const handleMovieSelect = (movie) => {
    setSelectedMovie((prevMovie) =>
      prevMovie && prevMovie.tmdbId === movie.tmdbId ? null : movie
    );
  };

  // Add Movie to Selected Trending Category
  const handleAddMovieToTrending = () => {
    if (selectedMovie && selectedCategory) {
      setTrendingMovies((prevState) => {
        const updatedState = { ...prevState };
        if (!updatedState[selectedCategory].some((m) => m.tmdbId === selectedMovie.tmdbId)) {
          updatedState[selectedCategory].push(selectedMovie);
        }
        return updatedState;
      });
      // Do not hide the movie selector
      // setShowMovieSelector(false);  <-- We removed this line
      setSelectedMovie(null); // Reset selected movie after adding
    }
  };

  // Close Expanded View
  const closeExpandedView = () => {
    setSelectedMovie(null);
  };

  return (
    <div className="dashboard">
      <h1 className="dashboard-title">Dashboard</h1>

      {/* Trending Movies Section */}
      <section className="movies-section">
        <div className="trending-header">
          <h2>Trending</h2>
          <div className="trending-buttons">
            <button onClick={() => handleCategoryClick("today")}>Today</button>
            <button onClick={() => handleCategoryClick("week")}>This Week</button>
            <button onClick={() => handleCategoryClick("month")}>This Month</button>
          </div>
        </div>

        {/* Show Selected Category and Add Movie */}
        {selectedCategory && (
          <div className="view-trending-section">
            <h3>{`Trending ${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}`}</h3>
            <div className="movie-cards">
              {trendingMovies[selectedCategory].length > 0 ? (
                trendingMovies[selectedCategory].map((movie) => (
                  <div className="movie-card trending" key={movie.tmdbId}>
                    <img src={movie.posterPath} alt={movie.title} />
                    <h3>{movie.title}</h3>
                  </div>
                ))
              ) : (
                <p>No movies selected for trending.</p>
              )}
            </div>

            {/* Movie Selector */}
            {showMovieSelector && (
              <div className="movie-selector-dialog">
                <h3>Select a Movie</h3>
                <div className="movie-grid-scrollable">
                  <div className="movie-grid">
                    {savedMovies.length > 0 ? (
                      savedMovies.map((movie) => (
                        <div
                          key={movie.tmdbId}
                          className={`movie-card ${selectedMovie?.tmdbId === movie.tmdbId ? "expanded" : ""}`}
                          onClick={() => handleMovieSelect(movie)}
                        >
                          {/* If this movie is selected, expand it */}
                          <div className={`movie-poster ${selectedMovie?.tmdbId === movie.tmdbId ? "expanded-poster" : ""}`}>
                            <img src={movie.posterPath} alt={movie.title} />
                          </div>
                          <h3>{movie.title}</h3>

                          {/* Expanded movie details */}
                          {selectedMovie?.tmdbId === movie.tmdbId && (
                            <div className="movie-details">
                              <p><strong>Overview:</strong> {movie.overview}</p>
                              <p><strong>Popularity:</strong> {movie.popularity}</p>
                              <p><strong>Release Date:</strong> {movie.releaseDate}</p>
                              {/* Add other details you want to show */}
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <p>No movies found in your list.</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Expanded Movie View - Fullscreen modal */}
      {selectedMovie && (
        <div className="expanded-movie-view">
          <div className="expanded-poster">
            <img src={selectedMovie.posterPath} alt={selectedMovie.title} />
          </div>
          <div className="movie-details">
            <h3>{selectedMovie.title}</h3>
            <p><strong>Overview:</strong> {selectedMovie.overview}</p>
            <p><strong>Popularity:</strong> {selectedMovie.popularity}</p>
            <p><strong>Release Date:</strong> {selectedMovie.releaseDate}</p>
            {/* Add other details you want to show */}
            <div className="expanded-actions">
              <button
                className="add-to-trending"
                onClick={handleAddMovieToTrending}
              >
                Add to Trending
              </button>
              <button className="close-expanded-view" onClick={closeExpandedView}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
