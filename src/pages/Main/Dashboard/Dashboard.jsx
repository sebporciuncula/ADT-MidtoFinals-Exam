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
    setSelectedMovie(movie);
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
      setShowMovieSelector(false);
      setSelectedMovie(null);
    }
  };

  // Chunk saved movies into groups of 5
  const chunkMovies = (movies, size) => {
    const result = [];
    for (let i = 0; i < movies.length; i += size) {
      result.push(movies.slice(i, i + size));
    }
    return result;
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

        {/* Show Selected Category and "Add Movie to Trending" Button */}
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

            {/* Add Movie Button for Selected Category */}
            {showMovieSelector && (
              <div className="movie-selector-dialog">
                <h3>Select a Movie</h3>
                <div className="movie-selector-list">
                  {savedMovies.length > 0 ? (
                    <div className="horizontal-scroll">
                      {chunkMovies(savedMovies, 5).map((movieRow, rowIndex) => (
                        <div key={rowIndex} className="movie-row">
                          {movieRow.map((movie) => (
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
                      ))}
                    </div>
                  ) : (
                    <p>No movies found in your list.</p>
                  )}
                </div>
                {selectedMovie && (
                  <div className="movie-selection-actions">
                    <p>Selected: {selectedMovie.title}</p>
                    <button onClick={handleAddMovieToTrending}>
                      Add to Trending {selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}
                    </button>
                    <button onClick={() => setShowMovieSelector(false)}>Cancel</button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Expanded Movie Poster View */}
        {selectedMovie && (
          <div className="expanded-movie-view">
            <div className="expanded-poster">
              <img
                src={selectedMovie.posterPath}
                alt={selectedMovie.title}
                className="expanded-img"
              />
            </div>
            <div className="movie-details">
              <h2>{selectedMovie.title}</h2>
              <p><strong>Description: </strong>{selectedMovie.overview}</p>
              <p><strong>Release Date: </strong>{selectedMovie.releaseDate}</p>
              <p><strong>Popularity: </strong>{selectedMovie.popularity}</p>
              <p><strong>Vote Average: </strong>{selectedMovie.voteAverage}</p>
              <div className="expanded-actions">
                <button onClick={handleAddMovieToTrending}>Add to Trending</button>
                <button onClick={() => setSelectedMovie(null)} className="close-expanded-view">Cancel</button>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

export default Dashboard;
